import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Download, Moon, Sun,
  BookOpen, ImageIcon, Eye, EyeOff, Sparkles, CheckCircle2,
  FileText, HelpCircle, Layers, RotateCcw, Play
} from "lucide-react";
import type { SGRLesson, Question, OutlineQuestion } from "./types";
import { loadLessons, SGR_EVENT } from "./types";
import { downloadSGRPdf } from "./pdfUtils";

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
    <div className="max-w-4xl mx-auto p-6 lg:p-10">
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
    <div className="max-w-6xl mx-auto p-6 lg:p-10">
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
    <div className="max-w-4xl mx-auto p-6 lg:p-10">
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
    <div className="max-w-4xl mx-auto p-6 lg:p-10">
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

function PageDirectReading({ lesson, showAnswer }: { lesson: SGRLesson; showAnswer: boolean }) {
  if (lesson.directReading.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-10 text-center text-gray-500 dark:text-gray-400">
        직독직해 자료가 없습니다. CMS에서 추가해주세요.
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-bold">
          직독직해
        </span>
      </div>
      <div className="space-y-6">
        {lesson.directReading.map((d, i) => (
          <div key={d.id} className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">
                {i + 1}
              </span>
              {d.chunks.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {d.chunks.map((c, j) => (
                    <span key={j} className="px-2.5 py-1 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 rounded-md text-xs font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-base text-gray-800 dark:text-gray-100 leading-relaxed mb-2">
              {d.english}
            </p>
            {showAnswer && (
              <p className="text-base text-cyan-700 dark:text-cyan-300 leading-relaxed border-t border-cyan-100 dark:border-cyan-900 pt-2">
                {d.korean}
              </p>
            )}
          </div>
        ))}
      </div>
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
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
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

        {/* Bottom nav */}
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-6 border-t border-gray-200 dark:border-gray-700 mt-8">
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
    </div>
  );
}
