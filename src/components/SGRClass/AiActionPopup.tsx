import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Bot, Loader2, Sparkles } from "lucide-react";

type AiAction = "explain" | "translate" | "analyze" | "rewrite";

interface AiActionPopupProps {
  action: AiAction;
  selectedText: string;
  x: number;
  y: number;
  onClose: () => void;
}

const ACTION_LABELS: Record<AiAction, string> = {
  explain: "설명",
  translate: "번역",
  analyze: "분석",
  rewrite: "다시 쓰기",
};

const ACTION_PROMPTS: Record<AiAction, string> = {
  explain: `다음 영어 텍스트를 한국어로 간결하게 설명해줘. 단어 뜻, 문법, 맥락을 포함해서:\n\n`,
  translate: `다음 영어 텍스트를 자연스러운 한국어로 번역해줘:\n\n`,
  analyze: `다음 영어 텍스트를 문법적으로 분석해줘. 주어, 동사, 목적어 구조와 주요 문법 포인트를 설명해줘:\n\n`,
  rewrite: `다음 영어 텍스트를 더 자연스럽고 다양한 표현으로 3가지 버전으로 다시 써줘:\n\n`,
};

const GLM_API_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const GLM_API_KEY = "dc2213720f4b4a88ae06ddbd434ab1dd.qDGcLtBM9gGqp6ff";
const GLM_MODEL = "glm-4-flash";

/**
 * AI 액션 결과를 사전 말풍선처럼 보여주는 팝업
 * explain, translate, analyze, rewrite 버튼 클릭 시 나타남
 * API 호출은 유저가 [요청] 버튼을 누를 때만 수행 (자동 호출 X)
 */
export function AiActionPopup({ action, selectedText, x, y, onClose }: AiActionPopupProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState({ x, y });

  // API 호출 — 유저가 [요청] 버튼 클릭 시에만 실행
  const fetchAiResult = useCallback(async () => {
    if (loading || hasFetched) return;
    setLoading(true);
    setError(false);
    setResult("");

    try {
      const prompt = ACTION_PROMPTS[action] + `"${selectedText}"`;
      const systemPrompt =
        "영어 학습 튜터 AI. 한국어로 간결·실용적으로 답변. 마크다운 금지. <b>강조</b>, <u>항목명</u> 태그 사용 가능.";

      const response = await fetch(GLM_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: GLM_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          max_tokens: 800,
          temperature: 0.6,
          stream: false,
        }),
      });

      if (!response.ok) throw new Error(`API 오류 (${response.status})`);

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "응답을 받지 못했어요.";
      setResult(content);
      setHasFetched(true);
    } catch (err: any) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [action, selectedText, loading, hasFetched]);

  // 팝업 위치 조정
  useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      let newX = x;
      let newY = y;

      // 오른쪽 경계
      if (x + rect.width > window.innerWidth - 20) {
        newX = Math.max(20, window.innerWidth - rect.width - 20);
      }
      // 아래쪽 경계
      if (y + rect.height > window.innerHeight - 20) {
        newY = Math.max(20, y - rect.height - 40);
      }
      setAdjustedPos({ x: Math.max(20, newX), y: Math.max(20, newY) });
    }
  }, [x, y, loading]);

  // 바깥 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // 리치 텍스트 렌더링 (<b>, <u> 태그 처리)
  function renderContent(text: string) {
    const parts: React.ReactNode[] = [];
    const regex = /(<b>[\s\S]*?<\/b>)|(<u>[\s\S]*?<\/u>)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let i = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      const m = match[0];
      if (m.startsWith("<b>")) {
        parts.push(
          <strong key={`b-${i}`} style={{ color: "#7c3aed", fontWeight: 700 }}>
            {m.slice(3, -4)}
          </strong>
        );
      } else if (m.startsWith("<u>")) {
        parts.push(
          <span key={`u-${i}`} style={{ textDecoration: "underline", color: "#2563eb", fontWeight: 600 }}>
            {m.slice(3, -4)}
          </span>
        );
      }
      lastIndex = regex.lastIndex;
      i++;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return <>{parts}</>;
  }

  return createPortal(
    <div
      ref={popupRef}
      className="fixed z-[100] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-violet-200 dark:border-violet-700 p-4 max-w-md"
      style={{ left: adjustedPos.x, top: adjustedPos.y, minWidth: 320, maxWidth: 420 }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40">
            <Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-sm font-bold text-violet-700 dark:text-violet-300">
            AI {ACTION_LABELS[action]}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* 선택된 텍스트 */}
      <div className="mb-3 px-3 py-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-100 dark:border-violet-800">
        <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{selectedText}"</p>
      </div>

      {/* 결과 */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            AI가 {ACTION_LABELS[action]} 중...
          </span>
        </div>
      ) : error ? (
        <div className="py-2">
          <p className="text-sm text-red-500 dark:text-red-400 mb-3">
            응답을 가져오지 못했어요.
          </p>
          <button
            onClick={() => { setHasFetched(false); fetchAiResult(); }}
            className="w-full px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors"
          >
            다시 시도
          </button>
        </div>
      ) : hasFetched ? (
        <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed max-h-[300px] overflow-y-auto">
          {renderContent(result)}
        </div>
      ) : (
        <button
          onClick={fetchAiResult}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          AI {ACTION_LABELS[action]} 요청
        </button>
      )}
    </div>,
    document.body
  );
}
