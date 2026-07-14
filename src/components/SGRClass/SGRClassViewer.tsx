import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Download, Moon, Sun,
  BookOpen, ImageIcon, Eye, EyeOff, Sparkles, CheckCircle2,
  FileText, HelpCircle, Layers, RotateCcw, Play,
  Highlighter, Underline, BookMarked, Eraser, Volume2,
  Zap, MousePointer, X
} from "lucide-react";
import type { SGRLesson, Question, OutlineQuestion, GrammarPoint, DirectReadingItem } from "./types";
import { loadLessons, SGR_EVENT } from "./types";
import { downloadSGRPdf } from "./pdfUtils";
import { ToeflAiWidget } from "../ToeflAiWidget";

// ─── inline formatter: **bold**, __underline__, ___blank___ ──
function formatInline(text: string, showAnswer: boolean, answer?: string) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const patterns: Array<{
    regex: RegExp;
    render: (m: string) => React.ReactNode;
  }> = [
    {
      regex: /\*\*(.+?)\*\*/,
      render: (m) => <strong className="text-cyan-700 dark:text-cyan-300 font-bold">{m}</strong>,
    },
    {
      regex: /__(.+?)__/,
      render: (m) => <u className="decoration-2">{m}</u>,
    },
    {
      regex: /___+/,
      render: () =>
        showAnswer && answer ? (
          <span className="inline-block px-2 border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-300 font-bold">
            {answer}
          </span>
        ) : (
          <span className="inline-block min-w-[80px] border-b-2 border-gray-400 dark:border-gray-500" />
        ),
    },
  ];

  while (remaining.length > 0) {
    let earliest = -1;
    let matchIdx = -1;
    let matched: RegExpMatchArray | null = null;

    for (let i = 0; i < patterns.length; i++) {
      const m = remaining.match(patterns[i].regex);
      if (m && m.index !== undefined) {
        if (earliest === -1 || m.index < earliest) {
          earliest = m.index;
          matched = m;
          matchIdx = i;
        }
      }
    }
    if (!matched || earliest === -1) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
    if (earliest > 0) parts.push(<span key={key++}>{remaining.slice(0, earliest)}</span>);
    parts.push(
      <span key={key++}>{patterns[matchIdx].render(matched[1] || "")}</span>
    );
    remaining = remaining.slice(earliest + matched[0].length);
  }
  return <>{parts}</>;
}

// ─── Sub-page components ───────────────────────────
function PagePreview({ lesson, showAnswer, dark }: { lesson: SGRLesson; showAnswer: boolean; dark: boolean }) {
  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      {/* Unit hero */}
      <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-800 to-gray-700 dark:from-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><path d=%22M0 60 Q 25 20 50 60 T 100 60 L 100 100 L 0 100 Z%22 fill=%22white%22/></svg>')] bg-repeat-x bg-bottom" />
        <div className="relative flex items-center gap-6 p-8 lg:p-12">
          <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center shadow-xl border-4 border-cyan-400">
            <div className="text-center text-white">
              <div className="text-[10px] font-bold tracking-widest">Unit</div>
              <div className="text-2xl font-black leading-none">{lesson.unitNumber}</div>
            </div>
          </div>
          <h1 className="text-3xl lg:text-5xl font-black text-white drop-shadow-lg">
            {lesson.title}
          </h1>
        </div>
      </div>

      {/* Visual Preview */}
      {lesson.previewQuestion && (
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-5">
            <div className="shrink-0 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-lg font-bold text-sm shadow-sm">
              Visual<br />Preview
            </div>
            <p className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-gray-100 pt-1">
              {lesson.previewQuestion}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lesson.previewCards.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {c.image ? (
                    <img src={c.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-200 text-center italic leading-snug">
                  {c.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vocabulary Preview */}
      {lesson.vocabularyPreview.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-3 h-3 rounded-full bg-cyan-500" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Vocabulary Preview</h2>
            <span className="text-gray-500 dark:text-gray-400">|</span>
            <span className="text-gray-600 dark:text-gray-300 text-sm">
              {lesson.vocabPreviewInstruction}
            </span>
          </div>
          {/* Word bank pill */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full px-6 py-3 mb-5 shadow-inner">
            <div className="flex flex-wrap justify-center gap-6">
              {lesson.vocabularyPreview.map((v) => (
                <span key={v.id} className="italic text-gray-700 dark:text-gray-200 font-medium">
                  {v.word}
                </span>
              ))}
            </div>
          </div>
          {/* Fill blanks */}
          <div className="space-y-3">
            {lesson.vocabularyPreview.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 text-lg">
                <span className="w-7 shrink-0 font-bold text-cyan-600 dark:text-cyan-400">{i + 1}</span>
                {showAnswer ? (
                  <span className="inline-block px-3 py-1 border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-300 font-bold">
                    {v.word}
                  </span>
                ) : (
                  <span className="inline-block min-w-[140px] border-b-2 border-gray-400 dark:border-gray-500 h-7" />
                )}
                <span className="text-gray-700 dark:text-gray-200">: {v.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PagePassage({ lesson, dark }: { lesson: SGRLesson; dark: boolean }) {
  // split paragraphs into two "book pages" for visual balance
  const half = Math.ceil(lesson.passageParagraphs.length / 2);
  const left = lesson.passageParagraphs.slice(0, half);
  const right = lesson.passageParagraphs.slice(half);

  return (
    <div className="max-w-[1100px] mx-auto p-6 lg:p-10">
      {/* Title hero */}
      <div className="relative mb-8">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800 dark:from-gray-900 dark:to-black shadow-lg h-40 flex items-end">
          <div className="px-8 py-4">
            <h1 className="text-3xl lg:text-4xl font-black text-white drop-shadow-lg leading-tight">
              {lesson.passageTitle}
            </h1>
          </div>
        </div>
      </div>

      {/* Two-column passage layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4 text-gray-800 dark:text-gray-100">
          {left.map((p, i) => (
            <div key={p.id} className="relative">
              <p className="text-[16px] lg:text-[17px] leading-relaxed text-justify">
                {i === 0 ? (
                  <>
                    <span className="float-left mr-2 text-5xl font-black text-cyan-700 dark:text-cyan-400 leading-none">
                      {p.content.trim().charAt(0)}
                    </span>
                    {formatInline(p.content.trim().slice(1), false)}
                  </>
                ) : (
                  formatInline(p.content, false)
                )}
              </p>
              {p.imageCaption && (
                <div className="mt-3 rounded-lg bg-gray-100 dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mb-2">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 text-center">▲ {p.imageCaption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-4 text-gray-800 dark:text-gray-100">
          {right.map((p) => (
            <div key={p.id} className="relative">
              <p className="text-[16px] lg:text-[17px] leading-relaxed text-justify">
                {formatInline(p.content, false)}
              </p>
              {p.imageCaption && (
                <div className="mt-3 rounded-lg bg-gray-100 dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mb-2">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 text-center">▲ {p.imageCaption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuestionRenderer({
  q, index, showAnswer,
}: {
  q: Question; index: number; showAnswer: boolean;
}) {
  const numBadge = (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-sm shrink-0">
      {index + 1}
    </span>
  );

  if (q.type === "main_idea" || q.type === "multiple_choice" || q.type === "vocabulary") {
    return (
      <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex gap-3 mb-3">
          {numBadge}
          <p className="text-base lg:text-lg font-semibold text-gray-800 dark:text-gray-100">
            {q.question}
          </p>
        </div>
        <div className="ml-11 space-y-2">
          {q.options.map((o, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border-2 transition-colors ${
                showAnswer && i === q.answer
                  ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-200 font-bold"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200"
              }`}
            >
              <span className="font-bold mr-2">{String.fromCharCode(97 + i)}.</span>
              {o}
              {showAnswer && i === q.answer && <span className="ml-2">✓</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (q.type === "fill_blank") {
    return (
      <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex gap-3">
          {numBadge}
          <p className="text-base lg:text-lg text-gray-800 dark:text-gray-100">
            {formatInline(q.question, showAnswer, q.answer)}
          </p>
        </div>
      </div>
    );
  }

  if (q.type === "complete_sentence") {
    return (
      <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex gap-3 mb-3">
          {numBadge}
          <p className="text-base lg:text-lg font-semibold text-gray-800 dark:text-gray-100">
            Complete the sentences.
          </p>
        </div>
        {q.wordBank && q.wordBank.length > 0 && (
          <div className="ml-11 mb-3 bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2 flex flex-wrap justify-center gap-4 text-sm">
            {q.wordBank.map((w, i) => (
              <span key={i} className="italic text-gray-700 dark:text-gray-200">{w}</span>
            ))}
          </div>
        )}
        <div className="ml-11 space-y-3">
          {q.sentences.map((s, i) => (
            <div key={s.id} className="flex gap-2 text-base text-gray-800 dark:text-gray-100">
              <span className="font-bold text-cyan-600 dark:text-cyan-400">{String.fromCharCode(97 + i)}.</span>
              <span>{formatInline(s.text, showAnswer, s.answer)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (q.type === "outline") {
    const col = (title: string, items: OutlineQuestion["leftItems"]) => (
      <div className="rounded-xl border-2 border-cyan-200 dark:border-cyan-800 bg-white dark:bg-gray-800 p-4">
        <div className="pb-2 mb-3 border-b border-cyan-200 dark:border-cyan-800 text-center">
          <span className="inline-block px-4 py-1 bg-black text-white rounded-full text-sm font-bold">
            {title}
          </span>
        </div>
        <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-100">
          {items.map((it) => (
            <li key={it.id} className="flex gap-2">
              <span className="text-cyan-600 dark:text-cyan-400">•</span>
              <span>{formatInline(it.text, showAnswer, it.answer)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
    return (
      <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex gap-3 mb-3">
          {numBadge}
          <p className="text-base lg:text-lg font-semibold text-gray-800 dark:text-gray-100">
            Complete the outline.
          </p>
        </div>
        <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-4">
          {col(q.leftTitle, q.leftItems)}
          {col(q.rightTitle, q.rightItems)}
        </div>
      </div>
    );
  }

  if (q.type === "true_false") {
    return (
      <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex gap-3 mb-3">
          {numBadge}
          <div>
            <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold rounded">
              Quick Check
            </span>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Check T (True) or F (False).</span>
          </div>
        </div>
        <div className="ml-11 space-y-2">
          {q.statements.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 text-base text-gray-800 dark:text-gray-100">
              <span className="font-bold text-cyan-600 dark:text-cyan-400">{i + 1}</span>
              <span className="flex-1">{s.text}</span>
              <span className={`px-3 py-1 rounded border-2 font-bold text-sm ${
                showAnswer && s.answer
                  ? "border-cyan-500 bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300"
                  : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
              }`}>T {showAnswer && s.answer && "✓"}</span>
              <span className={`px-3 py-1 rounded border-2 font-bold text-sm ${
                showAnswer && !s.answer
                  ? "border-cyan-500 bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300"
                  : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
              }`}>F {showAnswer && !s.answer && "✓"}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function PageQuestions({ lesson, showAnswer }: { lesson: SGRLesson; showAnswer: boolean }) {
  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-bold">
          Main Idea and Details
        </span>
      </div>
      <div className="space-y-4">
        {lesson.questions.map((q, i) => (
          <QuestionRenderer key={q.id} q={q} index={i} showAnswer={showAnswer} />
        ))}
      </div>
    </div>
  );
}

function PageVocabReview({ lesson, showAnswer }: { lesson: SGRLesson; showAnswer: boolean }) {
  const { wordBank, items } = lesson.vocabReview;
  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-3 h-3 rounded-full bg-cyan-500" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Vocabulary Review</h2>
        <span className="text-gray-500 dark:text-gray-400">|</span>
        <span className="text-gray-600 dark:text-gray-300 text-sm">
          Complete each sentence. Change the form if necessary.
        </span>
      </div>
      {wordBank.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full px-6 py-3 mb-6 shadow-inner">
          <div className="flex flex-wrap justify-center gap-6">
            {wordBank.map((w, i) => (
              <span key={i} className="italic text-gray-700 dark:text-gray-200 font-medium">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={it.id} className="flex items-center gap-3 text-lg">
            <span className="w-7 shrink-0 font-bold text-cyan-600 dark:text-cyan-400">{i + 1}</span>
            <span className="text-gray-700 dark:text-gray-200 flex-1">
              {formatInline(it.sentence, showAnswer, it.answer)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 자동 직독직해 유틸리티 ──────────────────────────
function splitSentences(text: string): string[] {
  return text.replace(/\n/g, " ").match(/[^.!?]+[.!?]+/g) || [text];
}

// 쉼표/접속사/관계대명사 기준 청크 분할
function autoChunk(text: string): string[] {
  const parts = text.split(/(,\s+|\s+which\s+|\s+who\s+|\s+that\s+|\s+where\s+|\s+when\s+|\s+because\s+|\s+so\s+|\s+but\s+|\s+and\s+|\s+or\s+)/i);
  const chunks: string[] = [];
  let current = "";
  for (let i = 0; i < parts.length; i++) {
    current += parts[i];
    if (parts[i].match(/,\s+|\s+(which|who|that|where|when|because|so|but|and|or)\s+/i)) {
      if (current.trim()) chunks.push(current.trim());
      current = "";
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

const SKIP_WORDS = new Set([
  "the", "this", "that", "these", "those", "with", "from", "into", "have",
  "been", "were", "they", "their", "there", "which", "would", "could",
  "should", "such", "also", "than", "when", "where", "while", "about",
]);

function isBlankCandidate(word: string): boolean {
  const w = word.toLowerCase().replace(/[^a-z']/g, "");
  return w.length >= 4 && !SKIP_WORDS.has(w);
}

function firstLetterBlank(word: string): string {
  const clean = word.replace(/[^a-zA-Z']/g, "");
  if (clean.length < 2) return word;
  return clean[0] + "_".repeat(clean.length - 1);
}

// ─── 직독직해 페이지 (passage 전체 자동 직독직해 + 서브탭) ──
type DirectReadingSubTab = "direct" | "organization" | "phrases" | "fillblank";

function PageDirectReading({ lesson, showAnswer }: { lesson: SGRLesson; showAnswer: boolean }) {
  const [subTab, setSubTab] = useState<DirectReadingSubTab>("direct");
  const [showChunking, setShowChunking] = useState(true);
  const [revealedSentences, setRevealedSentences] = useState<Set<string>>(new Set());
  const [expandedGrammar, setExpandedGrammar] = useState<string | null>(null);
  const [viewedSentences, setViewedSentences] = useState<Set<string>>(new Set());

  // passage에서 자동 directReading 생성 (CMS 데이터 없을 때)
  const autoDirectReading = useMemo<DirectReadingItem[]>(() => {
    if (lesson.directReading.length > 0) return lesson.directReading;
    const items: DirectReadingItem[] = [];
    lesson.passageParagraphs.forEach((para, pi) => {
      const sentences = splitSentences(para.content);
      sentences.forEach((sent) => {
        items.push({
          id: `auto-${pi}-${items.length}`,
          english: sent,
          korean: "",
          chunks: autoChunk(sent),
          paragraphId: pi + 1,
          paragraphTitle: `단락 ${pi + 1}`,
          importance: "mid",
          difficulty: "medium",
          grammarPoints: [],
        });
      });
    });
    return items;
  }, [lesson.directReading, lesson.passageParagraphs]);

  const toggleReveal = (id: string) => {
    setRevealedSentences(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setViewedSentences(prev => new Set(prev).add(id));
  };

  const revealAll = () => {
    const allIds = new Set(autoDirectReading.map(s => s.id));
    setRevealedSentences(allIds);
    setViewedSentences(allIds);
  };
  const hideAll = () => setRevealedSentences(new Set());

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  // Group by paragraphId
  const paragraphs = useMemo(() => {
    const groups: { paragraph: number; title: string; sentences: DirectReadingItem[] }[] = [];
    autoDirectReading.forEach(s => {
      const pid = s.paragraphId || 1;
      const existing = groups.find(g => g.paragraph === pid);
      if (existing) {
        existing.sentences.push(s);
      } else {
        groups.push({ paragraph: pid, title: s.paragraphTitle || `단락 ${pid}`, sentences: [s] });
      }
    });
    return groups;
  }, [autoDirectReading]);

  const progressPercent = Math.round((viewedSentences.size / Math.max(1, autoDirectReading.length)) * 100);

  // 주요 구문 목록
  const allGrammarPoints = useMemo(() => {
    const all: Array<{ gp: GrammarPoint; eng: string }> = [];
    autoDirectReading.forEach(d => {
      (d.grammarPoints || []).forEach(gp => {
        all.push({ gp, eng: d.english });
      });
    });
    return all;
  }, [autoDirectReading]);

  const SUB_TABS: Array<{ id: DirectReadingSubTab; label: string }> = [
    { id: "direct", label: "직독직해" },
    { id: "organization", label: "글의 흐름" },
    { id: "phrases", label: "주요 구문" },
    { id: "fillblank", label: "빈칸넣기" },
  ];

  return (
    <div className="max-w-[1100px] mx-auto p-4 lg:p-8">
      {/* Sub tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`shrink-0 px-4 py-2 text-sm font-bold transition-colors border-b-2 -mb-px ${
              subTab === t.id
                ? "border-cyan-600 text-cyan-600 dark:text-cyan-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── 직독직해 탭 ─── */}
      {subTab === "direct" && (
        <>
          {/* Progress Bar */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">본문 분석 진행률</span>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{viewedSentences.size}/{autoDirectReading.length} 문장</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <button
              onClick={() => setShowChunking(!showChunking)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${showChunking ? 'bg-cyan-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
            >
              끊어읽기 {showChunking ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={revealedSentences.size === autoDirectReading.length ? hideAll : revealAll}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                revealedSentences.size === autoDirectReading.length
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {revealedSentences.size === autoDirectReading.length ? '전체 숨기기' : '전체 해석 보기'}
            </button>
            <span className="ml-auto text-xs text-gray-400 hidden sm:flex items-center gap-1">
              <MousePointer className="w-3 h-3" /> 문장을 클릭하여 해석 확인
            </span>
          </div>

          {/* Paragraph Groups */}
          {paragraphs.map((para) => (
            <div key={para.paragraph} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
              {/* Paragraph Header */}
              <div className="flex items-start gap-3 px-5 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <span className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                  {para.paragraph}
                </span>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-800 dark:text-gray-100">{para.title}</h3>
                </div>
              </div>

              {/* Sentences */}
              <div className="p-3 space-y-2">
                {para.sentences.map((s) => (
                  <motion.div
                    key={s.id}
                    className={`relative rounded-xl border transition-all overflow-hidden cursor-pointer ${
                      s.isKeyExam ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } ${revealedSentences.has(s.id) ? 'ring-2 ring-cyan-200 dark:ring-cyan-800' : 'hover:border-cyan-300 dark:hover:border-cyan-700'}`}
                    onClick={() => toggleReveal(s.id)}
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        {/* Difficulty badge */}
                        <span className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          s.difficulty === 'hard' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' :
                          s.difficulty === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' :
                          'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                        }`}>
                          {autoDirectReading.indexOf(s) + 1}
                        </span>
                        {s.isKeyExam && (
                          <span className="inline-block text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 rounded font-bold mt-1 shrink-0">
                            시험빈출
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          {/* English with chunks */}
                          <div className="flex items-start gap-2">
                            <p className="text-[15px] lg:text-[16px] leading-relaxed text-gray-800 dark:text-gray-100 font-medium flex-1">
                              {showChunking
                                ? s.chunks.map((chunk, i) => (
                                    <span key={i}>
                                      {i > 0 && <span className="text-cyan-400 dark:text-cyan-600 mx-0.5 font-bold">/</span>}
                                      <span className="hover:bg-cyan-50 dark:hover:bg-cyan-950/30 rounded px-0.5 transition-colors">{chunk}</span>
                                    </span>
                                  ))
                                : s.english
                              }
                            </p>
                            <button
                              onClick={(e) => { e.stopPropagation(); speak(s.english); }}
                              className="shrink-0 p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 rounded-lg transition-colors"
                              title="음성 듣기"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Korean translation (revealed on click) */}
                          <AnimatePresence>
                            {revealedSentences.has(s.id) && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-sm mt-2 text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/30 px-3 py-2 rounded-lg border border-cyan-100 dark:border-cyan-900"
                              >
                                {s.korean || (
                                  <span className="text-gray-400 italic">
                                    해석이 없습니다. AI 튜터에게 해석을 요청해보세요.
                                  </span>
                                )}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          {/* Grammar points */}
                          {s.grammarPoints && s.grammarPoints.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {s.grammarPoints.map((gp, gi) => (
                                <button
                                  key={gi}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedGrammar(expandedGrammar === `${s.id}-${gi}` ? null : `${s.id}-${gi}`);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                >
                                  <Zap className="w-3 h-3" />
                                  {gp.label}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Grammar detail expansion */}
                          <AnimatePresence>
                            {s.grammarPoints && s.grammarPoints.map((gp, gi) => (
                              expandedGrammar === `${s.id}-${gi}` && (
                                <motion.div
                                  key={gi}
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">{gp.type}</span>
                                    </div>
                                    <p className="text-sm text-indigo-600 dark:text-indigo-300 mb-1">
                                      <span className="font-medium bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded">"{gp.highlight}"</span>
                                    </p>
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400">{gp.description}</p>
                                  </div>
                                </motion.div>
                              )
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ─── 글의 흐름 (organization) 탭 ─── */}
      {subTab === "organization" && (
        <div className="space-y-3">
          <div className="p-4 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800">
            <h3 className="text-base font-bold text-cyan-700 dark:text-cyan-300 mb-1">글의 흐름 (Organization)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">각 단락의 주제 문장에서 빈칸을 채우세요.</p>
          </div>
          {lesson.passageParagraphs.map((para, pi) => {
            const sentences = splitSentences(para.content);
            const topicSent = sentences[0] || para.content;
            const words = topicSent.split(/\s+/);
            const candidates: number[] = [];
            words.forEach((w, j) => { if (isBlankCandidate(w)) candidates.push(j); });
            const blankIdx = candidates[0] !== undefined ? candidates[0] : -1;
            return (
              <div key={para.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 px-3 py-1 bg-cyan-600 text-white rounded-full text-sm font-bold">
                    단락 {pi + 1}
                  </span>
                  <p className="text-gray-800 dark:text-gray-100 leading-relaxed flex-1">
                    {words.map((w, j) => (
                      <span key={j}>
                        {j === blankIdx ? (
                          showAnswer ? (
                            <span className="inline-block px-2 border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-300 font-bold">
                              {w.replace(/[^a-zA-Z']/g, "")}
                            </span>
                          ) : (
                            <span className="inline-block px-2 border-b-2 border-gray-400 dark:border-gray-500 font-mono font-bold text-gray-500">
                              {firstLetterBlank(w)}
                            </span>
                          )
                        ) : (
                          <span>{w}</span>
                        )}
                        {j < words.length - 1 ? " " : ""}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── 주요 구문 탭 ─── */}
      {subTab === "phrases" && (
        <div className="space-y-3">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <h3 className="text-base font-bold text-indigo-700 dark:text-indigo-300 mb-1">주요 구문 (Key Phrases)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">문장의 핵심 문법 포인트와 구문을 확인하세요.</p>
          </div>
          {allGrammarPoints.length > 0 ? (
            allGrammarPoints.map((item, i) => (
              <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-1">"{item.eng}"</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block text-xs font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded">
                        {item.gp.type}
                      </span>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{item.gp.label}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                      <span className="font-medium bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">"{item.gp.highlight}"</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.gp.description}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500">
              <Zap className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">주요 구문 데이터가 없습니다.</p>
              <p className="text-xs mt-1">CMS 직독직해 탭에서 문법 포인트를 추가하거나, AI 튜터에게 문장 분석을 요청해보세요.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── 빈칸넣기 탭 ─── */}
      {subTab === "fillblank" && (
        <div className="space-y-3">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
            <h3 className="text-base font-bold text-amber-700 dark:text-amber-300 mb-1">Passage 빈칸넣기</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">빈칸에 알맞은 단어를 쓰세요. (첫 글자가 주어집니다.)</p>
          </div>
          {lesson.passageParagraphs.map((para, pi) => {
            const sentences = splitSentences(para.content);
            return sentences.map((sent, si) => {
              const words = sent.split(/\s+/);
              const candidates: number[] = [];
              words.forEach((w, i) => { if (isBlankCandidate(w)) candidates.push(i); });
              const blankCount = Math.min(candidates.length, sent.length > 80 ? 2 : 1);
              const blankIndices = candidates.slice(0, blankCount);
              return (
                <div key={`${pi}-${si}`} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                      ({pi + 1}-{si + 1})
                    </span>
                    <p className="text-gray-800 dark:text-gray-100 leading-relaxed flex-1">
                      {words.map((w, i) => (
                        <span key={i}>
                          {blankIndices.includes(i) ? (
                            showAnswer ? (
                              <span className="inline-block px-2 mx-0.5 border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-300 font-bold">
                                {w.replace(/[^a-zA-Z']/g, "")}
                              </span>
                            ) : (
                              <span className="inline-block px-2 mx-0.5 border-b-2 border-gray-400 dark:border-gray-500 font-mono font-bold text-gray-500">
                                {firstLetterBlank(w)}
                              </span>
                            )
                          ) : (
                            <span>{w}</span>
                          )}
                          {i < words.length - 1 ? " " : ""}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              );
            });
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Viewer ───────────────────────────────────
type PageKey = "preview" | "passage" | "questions" | "vocabReview" | "directReading";

const PAGES: Array<{ key: PageKey; label: string; icon: any }> = [
  { key: "preview", label: "Preview", icon: Sparkles },
  { key: "passage", label: "Passage", icon: BookOpen },
  { key: "questions", label: "Questions", icon: HelpCircle },
  { key: "vocabReview", label: "Vocab Review", icon: Layers },
  { key: "directReading", label: "직독직해", icon: FileText },
];

export default function SGRClassViewer() {
  const [lessons, setLessons] = useState<SGRLesson[]>(loadLessons);
  const [selectedId, setSelectedId] = useState<string>(lessons[0]?.id || "");
  const [pageKey, setPageKey] = useState<PageKey>("preview");
  const [showAnswer, setShowAnswer] = useState(false);
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sgrClass_dark") === "1";
  });

  // ─── 도구 (하이라이트/밑줄/사전) ───
  type ToolMode = "none" | "highlight-yellow" | "highlight-pink" | "highlight-blue" | "underline" | "dictionary";
  const [toolMode, setToolMode] = useState<ToolMode>("none");
  const [showTools, setShowTools] = useState(false);
  const [dictResult, setDictResult] = useState<{ word: string; data: any } | null>(null);
  const [dictLoading, setDictLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const applyHighlight = useCallback(() => {
    if (toolMode === "none" || toolMode === "dictionary") return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!contentRef.current?.contains(range.commonAncestorContainer)) return;

    if (toolMode.startsWith("highlight")) {
      const color = toolMode === "highlight-yellow" ? "#fef08a" : toolMode === "highlight-pink" ? "#fbcfe8" : "#bfdbfe";
      const span = document.createElement("span");
      span.style.backgroundColor = color;
      span.style.borderRadius = "2px";
      span.style.padding = "0 1px";
      try {
        range.surroundContents(span);
      } catch {
        // 부분 선택 시 extractContents 로 폴백
        const frag = range.extractContents();
        span.appendChild(frag);
        range.insertNode(span);
      }
    } else if (toolMode === "underline") {
      const span = document.createElement("span");
      span.style.textDecoration = "underline";
      span.style.textDecorationColor = "#2563eb";
      span.style.textDecorationThickness = "2px";
      try {
        range.surroundContents(span);
      } catch {
        const frag = range.extractContents();
        span.appendChild(frag);
        range.insertNode(span);
      }
    }
    sel.removeAllRanges();
  }, [toolMode]);

  // 사전: 단어 클릭 시 조회
  const lookupWord = useCallback(async (word: string) => {
    const clean = word.replace(/[^a-zA-Z-']/g, "").trim().toLowerCase();
    if (!clean) return;
    setDictLoading(true);
    setDictResult({ word: clean, data: null });
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${clean}`);
      if (res.ok) {
        const data = await res.json();
        setDictResult({ word: clean, data });
      } else {
        setDictResult({ word: clean, data: null });
      }
    } catch {
      setDictResult({ word: clean, data: null });
    } finally {
      setDictLoading(false);
    }
  }, []);

  // 컨텐츠 영역 클릭/선택 핸들러
  const handleContentMouseUp = useCallback(() => {
    if (toolMode === "none") return;
    if (toolMode === "dictionary") return; // 사전 모드는 클릭에서 처리
    applyHighlight();
  }, [toolMode, applyHighlight]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    if (toolMode !== "dictionary") return;
    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON" || target.closest("button")) return;
    // 클릭된 단어 추출
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim()) {
      lookupWord(sel.toString().trim());
      return;
    }
    // 단어 더블클릭이 아닌 단순 클릭 → 단어 추출 시도
    const word = target.textContent?.split(/\s+/).find(w => w.length > 1);
    if (word) lookupWord(word);
  }, [toolMode, lookupWord]);

  const clearAllMarks = useCallback(() => {
    if (!contentRef.current) return;
    contentRef.current.querySelectorAll('span[style*="background-color"], span[style*="underline"]').forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
        parent.normalize();
      }
    });
  }, []);

  const selected = useMemo(
    () => lessons.find(l => l.id === selectedId) || lessons[0],
    [lessons, selectedId]
  );

  // Sync from CMS
  useEffect(() => {
    const handler = () => {
      const next = loadLessons();
      setLessons(next);
      if (!next.find(l => l.id === selectedId)) {
        setSelectedId(next[0]?.id || "");
      }
    };
    window.addEventListener(SGR_EVENT, handler);
    return () => window.removeEventListener(SGR_EVENT, handler);
  }, [selectedId]);

  useEffect(() => {
    localStorage.setItem("sgrClass_dark", dark ? "1" : "0");
  }, [dark]);

  if (!selected) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        아직 등록된 SGR Class 자료가 없습니다. CMS에서 추가해주세요.
      </div>
    );
  }

  const currentIdx = PAGES.findIndex(p => p.key === pageKey);
  const goPrev = () => setPageKey(PAGES[Math.max(0, currentIdx - 1)].key);
  const goNext = () => setPageKey(PAGES[Math.min(PAGES.length - 1, currentIdx + 1)].key);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/40 dark:from-gray-950 dark:to-gray-900 transition-colors">
        {/* Toolbar */}
        <div className="sticky top-0 z-30 backdrop-blur bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3">
          <div className="max-w-[1400px] mx-auto flex flex-wrap items-center gap-3">
            {/* lesson picker */}
            {lessons.length > 1 && (
              <select
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setPageKey("preview"); }}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              >
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>
                    Unit {l.unitNumber} · {l.title}
                  </option>
                ))}
              </select>
            )}

            {/* Page tabs */}
            <div className="flex items-center gap-1 flex-1 overflow-x-auto">
              {PAGES.map(p => {
                const Icon = p.icon;
                const active = pageKey === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => setPageKey(p.key)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      active
                        ? "bg-cyan-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{p.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAnswer(v => !v)}
                title="정답 토글"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  showAnswer
                    ? "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                {showAnswer ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="hidden sm:inline">정답</span>
              </button>
              <button
                onClick={() => setDark(v => !v)}
                title="다크모드 토글"
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* 도구 드롭다운 */}
              <div className="relative">
                <button
                  onClick={() => setShowTools(v => !v)}
                  title="하이라이트 / 밑줄 / 사전"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    toolMode !== "none"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <Highlighter className="w-4 h-4" />
                  <span className="hidden sm:inline">도구</span>
                </button>
                <AnimatePresence>
                  {showTools && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowTools(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">하이라이트</span>
                        </div>
                        <div className="flex gap-1.5 px-3 py-2">
                          {[
                            { mode: "highlight-yellow" as ToolMode, color: "#fef08a", label: "노랑" },
                            { mode: "highlight-pink" as ToolMode, color: "#fbcfe8", label: "분홍" },
                            { mode: "highlight-blue" as ToolMode, color: "#bfdbfe", label: "파랑" },
                          ].map(h => (
                            <button
                              key={h.mode}
                              onClick={() => { setToolMode(toolMode === h.mode ? "none" : h.mode); setShowTools(false); }}
                              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border-2 transition-all ${
                                toolMode === h.mode ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                              }`}
                            >
                              <span className="w-6 h-6 rounded" style={{ backgroundColor: h.color }} />
                              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{h.label}</span>
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-700">
                          <button
                            onClick={() => { setToolMode(toolMode === "underline" ? "none" : "underline"); setShowTools(false); }}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                              toolMode === "underline" ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            <Underline className="w-4 h-4" />
                            밑줄
                          </button>
                          <button
                            onClick={() => { setToolMode(toolMode === "dictionary" ? "none" : "dictionary"); setShowTools(false); }}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                              toolMode === "dictionary" ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            <BookMarked className="w-4 h-4" />
                            사전 (영영)
                          </button>
                          <button
                            onClick={() => { setToolMode("none"); clearAllMarks(); setShowTools(false); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700"
                          >
                            <Eraser className="w-4 h-4" />
                            표시 지우기
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* 활성 도구 표시 배지 */}
              {toolMode !== "none" && (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold">
                  {toolMode === "dictionary" ? "📖 사전 모드: 단어를 클릭하세요" : "✏️ 텍스트를 드래그하세요"}
                  <button onClick={() => setToolMode("none")} className="ml-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-900/40 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-cyan-600 hover:bg-cyan-700 text-white">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-40">
                  <button
                    onClick={() => downloadSGRPdf(selected, "question")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-cyan-50 dark:hover:bg-cyan-950/30 text-gray-800 dark:text-gray-200"
                  >
                    📄 문제편
                  </button>
                  <button
                    onClick={() => downloadSGRPdf(selected, "answer")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-cyan-50 dark:hover:bg-cyan-950/30 text-gray-800 dark:text-gray-200 border-t border-gray-100 dark:border-gray-700"
                  >
                    ✅ 문제 + 해답편
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div
          ref={contentRef}
          onMouseUp={handleContentMouseUp}
          onClick={handleContentClick}
          className={toolMode !== "none" && toolMode !== "dictionary" ? "select-text" : ""}
          style={{ cursor: toolMode === "dictionary" ? "text" : toolMode !== "none" ? "text" : "default" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pageKey + selected.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {pageKey === "preview" && <PagePreview lesson={selected} showAnswer={showAnswer} dark={dark} />}
              {pageKey === "passage" && <PagePassage lesson={selected} dark={dark} />}
              {pageKey === "questions" && <PageQuestions lesson={selected} showAnswer={showAnswer} />}
              {pageKey === "vocabReview" && <PageVocabReview lesson={selected} showAnswer={showAnswer} />}
              {pageKey === "directReading" && <PageDirectReading lesson={selected} showAnswer={showAnswer} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 사전 팝업 */}
        <AnimatePresence>
          {dictResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 right-6 w-80 max-h-[60vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[90]"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-cyan-50 dark:bg-cyan-950/30">
                <div className="flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-cyan-600" />
                  <span className="font-bold text-gray-800 dark:text-gray-100">사전</span>
                </div>
                <button onClick={() => setDictResult(null)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-cyan-700 dark:text-cyan-400 mb-2">{dictResult.word}</h3>
                {dictLoading ? (
                  <p className="text-sm text-gray-400">검색 중...</p>
                ) : dictResult.data && Array.isArray(dictResult.data) && dictResult.data.length > 0 ? (
                  <div className="space-y-3">
                    {dictResult.data[0].phonetic && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">{dictResult.data[0].phonetic}</p>
                    )}
                    {dictResult.data[0].meanings?.slice(0, 4).map((m: any, i: number) => (
                      <div key={i}>
                        <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded mr-1.5">
                          {m.partOfSpeech}
                        </span>
                        <ol className="mt-1 space-y-0.5">
                          {m.definitions?.slice(0, 2).map((d: any, j: number) => (
                            <li key={j} className="text-sm text-gray-700 dark:text-gray-200">
                              {d.definition}
                              {d.example && <p className="text-xs text-gray-400 italic mt-0.5">ex) "{d.example}"</p>}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                    {dictResult.data[0].sourceUrls && (
                      <p className="text-[10px] text-gray-400 mt-2">출처: {dictResult.data[0].sourceUrls[0]}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500">검색 결과가 없습니다. AI 튜터에게 물어보세요.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom nav */}
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-6 border-t border-gray-200 dark:border-gray-700 mt-8">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold ${
              currentIdx === 0
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> 이전
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {currentIdx + 1} / {PAGES.length} · {PAGES[currentIdx].label}
          </span>
          <button
            onClick={goNext}
            disabled={currentIdx === PAGES.length - 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold ${
              currentIdx === PAGES.length - 1
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-700 text-white shadow-md"
            }`}
          >
            다음 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI 튜터 FAB */}
      <ToeflAiWidget
        position="right"
        zIndex={80}
        contextLabel={`SGR Class · Unit ${selected?.unitNumber || ""} ${selected?.title || ""}`}
        questionData={selected}
        suggestedQuestions={[
          '이 레슨의 핵심 어휘를 설명해줘',
          '지문의 주제와 요약을 알려줘',
          '문법 포인트를 분석해줘',
          '문제 정답과 해설을 알려줘',
        ]}
      />
    </div>
  );
}
