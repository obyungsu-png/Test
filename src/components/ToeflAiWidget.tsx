import { useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeft, Sparkles, Send, Bot, User, Pin, PinOff, Move, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

// ───────────────────────────────────────────────────────────────────────────
//  API 설정 — GLM + Claude 듀얼 모델 지원
//  - GLM: 클라이언트에서 직접 호출 (CORS 허용, 스트리밍)
//  - Claude: 서버 프록시(Supabase Edge Function)를 경유하여 apiclaude.cc 호출
//           (키 노출 방지 / 트래픽 제어 / CORS 우회)
// ───────────────────────────────────────────────────────────────────────────
import { CLAUDE_PROXY_URL, getServerHeaders } from '../utils/apiConfig';

const GLM_API_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const GLM_API_KEY = 'dc2213720f4b4a88ae06ddbd434ab1dd.qDGcLtBM9gGqp6ff';
const GLM_MODEL = 'glm-4-flash';

// Claude는 더 이상 클라이언트에 키/엔드포인트를 두지 않음 (서버 프록시 사용)
const CLAUDE_MODEL = 'claude-sonnet-5';

type AiModel = 'glm' | 'claude';

const MODEL_OPTIONS: { key: AiModel; label: string; modelId: string }[] = [
  { key: 'glm', label: 'GLM Flash (빠름)', modelId: GLM_MODEL },
  { key: 'claude', label: 'Claude Sonnet 5', modelId: CLAUDE_MODEL },
];

const BASE_SYSTEM_PROMPT =
  '영어 학습 튜터 AI. 한국어로 간결·실용적으로 답변. 영어 예문+한글 설명. 독해, 어휘, 문법, 문제 분석, 오답 해설 전문.';

const OUTPUT_FORMAT_INSTRUCTION =
  '[형식] 마크다운(#,**,*,`) 금지. <b>강조</b>, <u>항목명</u> 사용. 목록은 새 줄만. 줄바꿈으로 구조화.';

// ───────────────────────────────────────────────────────────────────────────
//  문제 데이터 → 컨텍스트 문자열 변환
// ───────────────────────────────────────────────────────────────────────────
function buildQuestionContext(questionData: any, contextLabel?: string): string {
  if (!questionData || typeof questionData !== 'object') return '';
  const q: any = { ...questionData };
  const noisyKeys = [
    'imageUrl', 'introImageUrl', 'audioUrl', 'avatar1ImageUrl', 'avatar2ImageUrl',
    'voiceAvatar', 'materialImage', 'id', 'image', 'audio', 'materialAudioDuration',
    'modelAudioDuration', 'userAudioDuration', 'currentVoice', 'modelLabel',
    'showTextDefault', 'slotCount', 'sentenceEnding', 'words',
  ];
  noisyKeys.forEach((k) => { try { delete q[k]; } catch { /* noop */ } });

  const parts: string[] = [];
  const push = (label: string, val: any) => {
    if (val === undefined || val === null || val === '') return;
    if (Array.isArray(val)) {
      if (val.length === 0) return;
      const arr = val.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v)));
      parts.push(`${label}: ${arr.join(' | ')}`);
    } else if (typeof val === 'object') {
      const entries = Object.entries(val)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : String(v)}`);
      if (entries.length) parts.push(`${label}: ${entries.join(', ')}`);
    } else {
      parts.push(`${label}: ${String(val)}`);
    }
  };

  push('영역', contextLabel);
  push('문제 번호', q.questionNumber ?? q.number);
  push('문제 유형', q.questionType);
  push('난이도', q.difficulty);
  push('문제/질문', q.text || q.questionText || q.prompt || q.question || q.stem);
  push('지문', q.passageText || q.passage || q.readingPassage || q.passage_text);
  push('선택지', q.options || q.choices || q.answers || q.answerOptions);
  push('정답', q.correctAnswer || q.answer || q.correctAnswers || q.correct_answer);
  push('빈칸 정답', q.blanks);
  push('해설', q.explanation || q.analysisNote);
  push('번역 노트', q.translationNote);
  push('어휘 노트', q.vocabularyNote);
  push('오디오 스크립트', q.audioText || q.transcript || q.scriptText || q.audio_text);
  push('지문 제목', q.passageTitle || q.interstitialTitle);

  return parts.join('\n');
}

// ───────────────────────────────────────────────────────────────────────────
//  리치 텍스트 렌더링 — <b>, <u> 태그 + 잔류 마크다운을 색상/굵기/밑줄로 변환
// ───────────────────────────────────────────────────────────────────────────
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  const regex = /(<b>[\s\S]*?<\/b>)|(<u>[\s\S]*?<\/u>)|(\*\*[^*]+\*\*)|(\*[^*\n]+\*)|(`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    const m = match[0];
    if (m.startsWith('<b>')) {
      tokens.push(
        <strong key={`${keyPrefix}-b-${i}`} style={{ color: '#0d9488', fontWeight: 700 }}>
          {m.slice(3, -4)}
        </strong>
      );
    } else if (m.startsWith('<u>')) {
      tokens.push(
        <span key={`${keyPrefix}-u-${i}`} style={{ textDecoration: 'underline', textDecorationColor: '#2563eb', color: '#1d4ed8', fontWeight: 600 }}>
          {m.slice(3, -4)}
        </span>
      );
    } else if (m.startsWith('**')) {
      tokens.push(
        <strong key={`${keyPrefix}-s-${i}`} style={{ color: '#0d9488', fontWeight: 700 }}>
          {m.slice(2, -2)}
        </strong>
      );
    } else if (m.startsWith('*')) {
      tokens.push(
        <em key={`${keyPrefix}-i-${i}`} style={{ fontStyle: 'italic', color: '#475569', fontWeight: 500 }}>
          {m.slice(1, -1)}
        </em>
      );
    } else if (m.startsWith('`')) {
      tokens.push(
        <code key={`${keyPrefix}-c-${i}`} style={{ background: '#e5e7eb', padding: '1px 5px', borderRadius: 4, fontSize: '13px', color: '#be185d' }}>
          {m.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
    i++;
  }
  if (lastIndex < text.length) tokens.push(text.slice(lastIndex));
  return tokens;
}

function renderRichContent(content: string): ReactNode {
  const lines = content.split('\n');
  const blocks: ReactNode[] = [];
  let listBuffer: ReactNode[] = [];
  let listType: 'ol' | null = null;

  const flushList = (key: string) => {
    if (listBuffer.length > 0) {
      blocks.push(
        <ol key={key} style={{ margin: '4px 0', paddingLeft: '20px' }}>
          {listBuffer.map((li, i) => (
            <li key={i} style={{ marginBottom: 2 }}>{li}</li>
          ))}
        </ol>
      );
      listBuffer = [];
      listType = null;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    const hMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);

    if (hMatch) {
      flushList(`l-${idx}`);
      const level = hMatch[1].length;
      const size = level <= 1 ? 17 : level === 2 ? 16 : 15;
      blocks.push(
        <div key={`h-${idx}`} style={{ fontWeight: 700, fontSize: size, color: '#0f766e', margin: '8px 0 4px' }}>
          {renderInline(hMatch[2], `h-${idx}`)}
        </div>
      );
    } else if (numMatch) {
      listType = 'ol';
      listBuffer.push(renderInline(numMatch[2], `n-${idx}`));
    } else if (trimmed === '') {
      flushList(`l-${idx}`);
      blocks.push(<div key={`sp-${idx}`} style={{ height: 6 }} />);
    } else {
      flushList(`l-${idx}`);
      blocks.push(
        <div key={`p-${idx}`} style={{ margin: '2px 0' }}>
          {renderInline(line, `p-${idx}`)}
        </div>
      );
    }
  });
  flushList('l-final');
  return <>{blocks}</>;
}

const defaultSuggestedQuestions = [
  '이 문제를 분석해줘',
  '틀린 이유와 다음에 주의할 점은?',
  '이 지문의 핵심 어휘를 알려줘',
  '문법을 설명해 줘',
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ToeflAiWidgetProps {
  position?: 'left' | 'right';
  contextLabel?: string;
  questionData?: any;
  zIndex?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showFab?: boolean;
  suggestedQuestions?: string[];
  initialPrompt?: string;
}

export function ToeflAiWidget({ position = 'right', contextLabel, questionData, zIndex = 90, open, onOpenChange, showFab = true, suggestedQuestions: propQuestions, initialPrompt }: ToeflAiWidgetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = (value: boolean) => {
    setInternalOpen(value);
    onOpenChange?.(value);
  };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [selectedModel, setSelectedModel] = useState<AiModel>('glm');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeQuestions = propQuestions ?? defaultSuggestedQuestions;

  // ─── 고정(undocked) 모드: 드래그 이동 + 크기 조절 ───
  const [pinned, setPinned] = useState(false);
  const [panelPos, setPanelPos] = useState({ x: 100, y: 100 });
  const [panelSize, setPanelSize] = useState({ w: 380, h: 520 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 드래그 시작
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!pinned) return;
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: panelPos.x,
      origY: panelPos.y,
    };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      const newX = Math.max(0, Math.min(window.innerWidth - panelSize.w, dragRef.current.origX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 60, dragRef.current.origY + dy));
      setPanelPos({ x: newX, y: newY });
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [pinned, panelPos, panelSize]);

  // 크기 조절 시작
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (!pinned) return;
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: panelSize.w,
      origH: panelSize.h,
    };
    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const dw = ev.clientX - resizeRef.current.startX;
      const dh = ev.clientY - resizeRef.current.startY;
      const newW = Math.max(300, Math.min(600, resizeRef.current.origW + dw));
      const newH = Math.max(350, Math.min(window.innerHeight - 40, resizeRef.current.origH + dh));
      setPanelSize({ w: newW, h: newH });
    };
    const onUp = () => {
      resizeRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [pinned, panelSize]);

  // 고정 모드 토글
  const togglePin = useCallback(() => {
    setPinned(prev => {
      if (!prev) {
        // 고정 시작 — 현재 위치를 패널 위치로 설정
        const rect = panelRef.current?.getBoundingClientRect();
        setPanelPos({ x: rect?.left ?? 100, y: rect?.top ?? 100 });
      }
      return !prev;
    });
  }, []);

  useEffect(() => {
    setChatMessages([]);
    setChatInput('');
  }, [contextLabel, questionData]);

  // initialPrompt가 있으면 입력창에 미리 채움 (자동 전송 X — 유저가 직접 [전송] 버튼 클릭)
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setChatInput(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: isAiLoading ? 'auto' : 'smooth' });
  }, [chatMessages, isAiLoading, streamingText]);

  const handleSuggestedQuestion = (q: string) => {
    setChatInput(q);
  };

  const handleSendMessage = async (overrideMessage?: string) => {
    const msg = overrideMessage ?? chatInput;
    if (!msg.trim() || isAiLoading) return;

    const userMessage = msg;
    setChatInput('');

    const newHistory: ChatMessage[] = [
      ...chatMessages,
      { role: 'user', content: userMessage, timestamp: Date.now() },
    ];
    setChatMessages(newHistory);
    setIsAiLoading(true);
    setStreamingText('');

    const questionContext = buildQuestionContext(questionData, contextLabel);

    const contextParts = [BASE_SYSTEM_PROMPT];
    if (questionContext) {
      contextParts.push(`[문제]\n${questionContext}\n반드시 위 문제 데이터 기반으로 답변. 정답 근거·해설·오답 분석 포함.`);
    } else if (contextLabel) {
      contextParts.push(`[컨텍스트] ${contextLabel}`);
    }
    contextParts.push(OUTPUT_FORMAT_INSTRUCTION);
    const systemPrompt = contextParts.join('\n');

    try {
      const isClaude = selectedModel === 'claude';
      const messages = [
        { role: 'system', content: systemPrompt },
        ...newHistory.slice(-2).map((msg) => ({ role: msg.role, content: msg.content })),
      ];

      let fullText = '';

      if (isClaude) {
        // Claude: 서버 프록시 호출 (스트리밍 미지원, 일반 JSON 응답)
        const response = await fetch(CLAUDE_PROXY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getServerHeaders(),
          },
          body: JSON.stringify({
            messages,
            max_tokens: 1200,
            temperature: 0.6,
            model: CLAUDE_MODEL,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) throw new Error('API 호출 횟수가 제한되었어요. 잠시 후 다시 시도해주세요.');
          if (response.status === 401 || response.status === 403) throw new Error('인증 오류가 발생했어요.');
          const errText = await response.text().catch(() => '');
          throw new Error(`서버 오류 (${response.status}): ${errText.slice(0, 100)}`);
        }

        const data = await response.json();
        fullText = data.content || 'AI 응답을 받지 못했어요. 다시 시도해주세요.';
        setStreamingText(fullText);
      } else {
        // GLM: 직접 호출 + 스트리밍
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        headers['Authorization'] = `Bearer ${GLM_API_KEY}`;

        const requestBody: Record<string, any> = {
          model: GLM_MODEL,
          messages,
          max_tokens: 1200,
          temperature: 0.6,
          stream: true,
        };

        const response = await fetch(GLM_API_ENDPOINT, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          if (response.status === 429) throw new Error('API 호출 횟수가 제한되었어요. 잠시 후 다시 시도해주세요.');
          if (response.status === 401 || response.status === 403) throw new Error('인증 오류가 발생했어요.');
          const errText = await response.text().catch(() => '');
          throw new Error(`서버 오류 (${response.status}): ${errText.slice(0, 100)}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('스트리밍 응답을 읽을 수 없어요.');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (!trimmed.startsWith('data: ')) continue;

            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                fullText += delta;
                setStreamingText(fullText);
              }
            } catch { /* 불완전 JSON — 다음 chunk에서 처리 */ }
          }
        }
      }

      const finalContent = fullText || 'AI 응답을 받지 못했어요. 다시 시도해주세요.';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: finalContent, timestamp: Date.now() }]);
      setStreamingText('');
    } catch (err: any) {
      console.error('AI Tutor error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.message.includes('429')
            ? '⏳ API 사용량이 잠시 제한되었어요. 1~2분 뒤에 다시 시도하거나, Claude 모델로 전환해보세요.'
            : err.message.includes('인증')
            ? '🔑 인증 오류가 발생했어요. 관리자에게 문의해 주세요.'
            : `죄송해요, 오류가 발생했어요: ${err.message}. 잠시 후 다시 시도해주세요.`,
          timestamp: Date.now(),
        },
      ]);
      setStreamingText('');
    } finally {
      setIsAiLoading(false);
    }
  };

  const fabSideClass = position === 'left' ? 'left-6' : 'right-6';

  return (
    <>
      <style>{`
        .toefl-ai-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .toefl-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          flex-shrink: 0;
        }
        .toefl-chat-bubble {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
          word-break: break-word;
        }
        .toefl-chat-bubble.user {
          background-color: #667eea;
          color: white;
          border-bottom-right-radius: 2px;
        }
        .toefl-chat-bubble.ai {
          background-color: #f3f4f6;
          color: #1f2937;
          border-bottom-left-radius: 2px;
        }
        .toefl-ai-fab {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #cfe0ff 0%, #a9c6ff 35%, #8fd6ee 70%, #bfe9ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(102, 126, 234, 0.35);
          border: none;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .toefl-ai-fab:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 10px 24px rgba(102, 126, 234, 0.45);
        }
        .toefl-ai-fab-eyes {
          display: flex;
          gap: 6px;
        }
        .toefl-ai-fab-eyes span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #2d2d3a;
          display: block;
        }
        .toefl-ai-panel-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.35);
          z-index: ${zIndex};
          animation: toeflAiFadeIn 0.2s ease;
        }
        .toefl-ai-panel {
          position: fixed;
          top: 0;
          ${position === 'left' ? 'left: 0;' : 'right: 0;'}
          height: 100%;
          width: 420px;
          max-width: 100vw;
          background: #fff;
          z-index: ${zIndex + 1};
          box-shadow: ${position === 'left' ? '8px 0 30px rgba(0,0,0,0.15)' : '-8px 0 30px rgba(0,0,0,0.15)'};
          display: flex;
          flex-direction: column;
          animation: ${position === 'left' ? 'toeflAiSlideInLeft' : 'toeflAiSlideInRight'} 0.25s ease;
        }
        @keyframes toeflAiSlideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes toeflAiSlideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes toeflAiFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .toefl-ai-panel-suggestion {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 4px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          font-size: 14px;
          color: #374151;
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          width: 100%;
          text-align: left;
          transition: color 0.15s ease;
        }
        .toefl-ai-panel-suggestion:hover {
          color: #667eea;
        }
        .toefl-ai-panel-suggestion:last-child {
          border-bottom: none;
        }
      `}</style>

      {showFab && (
        <button
          onClick={() => setIsOpen(true)}
          className={`toefl-ai-fab fixed bottom-16 md:bottom-6 ${fabSideClass}`}
          style={{ zIndex }}
          aria-label="AI 튜터에게 물어보세요"
          title="AI 튜터에게 물어보세요"
        >
          <span className="toefl-ai-fab-eyes">
            <span></span>
            <span></span>
          </span>
        </button>
      )}

      {isOpen && (
        <>
          {!pinned && <div className="toefl-ai-panel-overlay" onClick={() => setIsOpen(false)} />}
          <div
            ref={panelRef}
            className="toefl-ai-panel"
            style={pinned ? {
              top: panelPos.y,
              left: panelPos.x,
              right: 'auto',
              width: panelSize.w,
              height: panelSize.h,
              maxHeight: 'none',
              maxWidth: 'none',
              borderRadius: 12,
              cursor: 'default',
            } : undefined}
          >
            {/* 고정 모드: 드래그 핸들 + 리사이즈 핸들 */}
            {pinned && (
              <>
                <div
                  onMouseDown={handleDragStart}
                  className="absolute top-0 left-0 right-0 h-10 cursor-move flex items-center justify-center"
                  style={{ background: 'transparent' }}
                >
                  <Move className="w-3 h-3 text-gray-300" />
                </div>
                <div
                  onMouseDown={handleResizeStart}
                  className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize"
                  style={{
                    borderBottomRightRadius: 12,
                  }}
                >
                  <Maximize2 className="w-3 h-3 text-gray-300 absolute bottom-1 right-1" />
                </div>
              </>
            )}

            <div className="flex items-center justify-between px-5 py-4 border-b" style={pinned ? { paddingTop: 36 } : undefined}>
              <div className="flex items-center gap-2">
                <span className="toefl-ai-fab" style={{ width: 36, height: 36 }}>
                  <span className="toefl-ai-fab-eyes">
                    <span style={{ width: 3, height: 3 }}></span>
                    <span style={{ width: 3, height: 3 }}></span>
                  </span>
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800">AI 튜터</span>
                  {contextLabel && (
                    <span className="text-[11px] text-gray-400 leading-tight max-w-[260px] truncate">
                      {contextLabel}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* 고정 버튼 */}
                <button
                  onClick={togglePin}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors shadow-sm ${
                    pinned
                      ? 'border-violet-400 bg-violet-100 text-violet-700 hover:bg-violet-200'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title={pinned ? '고정 해제' : '패널 고정 (이동/크기조절)'}
                >
                  {pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                  {pinned ? '고정해제' : '고정'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  돌아가기
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-5 py-2 border-b bg-gray-50/80">
              {MODEL_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSelectedModel(opt.key)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150 ${
                    selectedModel === opt.key
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-teal-400 hover:text-teal-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {chatMessages.length === 0 ? (
              <div className="flex-1 overflow-y-auto px-5 py-6">
                <p className="text-2xl font-bold text-gray-800 mb-1">hi~</p>
                <p className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-1">
                  AI 학습 도우미예요 <Sparkles className="w-5 h-5 text-yellow-400" />
                </p>
                <p className="text-sm text-gray-500 mt-2 mb-6">
                  문제 풀이, 오답 분석, 어휘·문법, 답안 피드백까지 무엇이든 편하게 물어보세요
                </p>
                <div className="bg-gray-50 rounded-2xl px-4">
                  {activeQuestions.map((q, idx) => (
                    <button key={idx} className="toefl-ai-panel-suggestion" onClick={() => handleSuggestedQuestion(q)}>
                      <span>{q}</span>
                      <span className="text-gray-300">›</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50/50">
                <div className="flex flex-col space-y-4">
                  {chatMessages.map((msg, idx) => {
                    const cleanContent = msg.content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                    return (
                      <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={msg.role === 'user' ? 'toefl-user-avatar' : 'toefl-ai-avatar'}>
                          {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`toefl-chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                          {msg.role === 'assistant' ? renderRichContent(cleanContent) : cleanContent}
                        </div>
                      </div>
                    );
                  })}
                  {isAiLoading && streamingText && (
                    <div className="flex gap-2 flex-row">
                      <div className="toefl-ai-avatar">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="toefl-chat-bubble ai">
                        {renderRichContent(streamingText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim())}
                      </div>
                    </div>
                  )}
                  {isAiLoading && !streamingText && (
                    <div className="flex gap-2 flex-row">
                      <div className="toefl-ai-avatar animate-pulse">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="toefl-chat-bubble ai flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}

            <div className="p-3 border-t bg-white shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="말씀해 주세요..."
                  className="flex-1 text-sm bg-gray-50 focus:bg-white transition-colors"
                  disabled={isAiLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
                  disabled={!chatInput.trim() || isAiLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default ToeflAiWidget;
