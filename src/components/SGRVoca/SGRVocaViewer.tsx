import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Download, Moon, Sun,
  BookOpen, Eye, EyeOff, Layers, PenLine,
  Highlighter, Check, Volume2, ImageIcon, ListChecks, FileText
} from "lucide-react";
import type { SGRVocaLesson, VocaMcq, VocaPassageQuestion } from "./types";
import { loadVocaLessons, SGR_VOCA_EVENT } from "./types";
import { downloadSGRVocaPdf } from "./pdfUtils";
import { ToeflAiWidget } from "../ToeflAiWidget";
import { WordPopup } from "../SGRClass/WordPopup";
import { AiActionPopup } from "../SGRClass/AiActionPopup";
import { ReadingReviewPassage } from "../SGRClass/ReadingReviewPassage";
import { ReadingReviewActions } from "../SGRClass/ReadingReviewToolbar";

type PageKey = "wordlist" | "exerciseAB" | "exerciseC" | "reading";

const PAGES: Array<{ key: PageKey; label: string; icon: any }> = [
  { key: "wordlist", label: "Word List", icon: BookOpen },
  { key: "exerciseAB", label: "Exercise A·B", icon: ListChecks },
  { key: "exerciseC", label: "Exercise C", icon: PenLine },
  { key: "reading", label: "Reading", icon: FileText },
];

// ─── inline formatter: **bold**, __underline__ ──
function formatInline(text: string) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  const patterns: Array<{ regex: RegExp; render: (m: string) => React.ReactNode }> = [
    {
      regex: /\*\*(.+?)\*\*/,
      render: (m) => <strong className="text-rose-600 dark:text-rose-400 font-bold">{m}</strong>,
    },
    {
      regex: /__(.+?)__/,
      render: (m) => <u className="decoration-2 underline-offset-2">{m}</u>,
    },
  ];
  while (remaining.length > 0) {
    let earliest = -1, matchIdx = -1;
    let matched: RegExpMatchArray | null = null;
    for (let i = 0; i < patterns.length; i++) {
      const m = remaining.match(patterns[i].regex);
      if (m && m.index !== undefined && (earliest === -1 || m.index < earliest)) {
        earliest = m.index; matched = m; matchIdx = i;
      }
    }
    if (!matched || earliest === -1) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
    if (earliest > 0) parts.push(<span key={key++}>{remaining.slice(0, earliest)}</span>);
    parts.push(<span key={key++}>{patterns[matchIdx].render(matched[1] || "")}</span>);
    remaining = remaining.slice(earliest + matched[0].length);
  }
  return <>{parts}</>;
}

function speak(text: string) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }
}

// ─── Page 1: WORD LIST ──────────────────────────
function PageWordList({ lesson }: { lesson: SGRVocaLesson }) {
  return (
    <div className="max-w-[1100px] mx-auto p-6 lg:p-10">
      {/* Unit hero */}
      <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-rose-700 to-rose-500 dark:from-gray-950 dark:to-rose-950">
        <div className="relative flex items-center gap-5 p-6 lg:p-10">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-black flex items-center justify-center shadow-xl border-4 border-rose-300 shrink-0">
            <div className="text-center text-white">
              <div className="text-[9px] font-bold tracking-widest">UNIT</div>
              <div className="text-xl lg:text-2xl font-black leading-none">{lesson.unitNumber}</div>
            </div>
          </div>
          <h1 className="text-3xl lg:text-5xl font-black text-white drop-shadow-lg tracking-tight">
            WORD LIST
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lesson.words.map((w) => (
          <div
            key={w.id}
            className="flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* image */}
            <div className="w-20 h-20 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
              {w.imageUrl ? (
                <img src={w.imageUrl} alt={w.word} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-7 h-7 text-gray-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-black text-rose-600 dark:text-rose-400">{w.word}</span>
                {w.pronunciation && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">[{w.pronunciation}]</span>
                )}
                <button
                  onClick={() => speak(w.word)}
                  className="p-1 text-gray-400 hover:text-rose-500 rounded transition-colors"
                  title="발음 듣기"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200 mt-1 leading-snug">
                {w.partOfSpeech && <span className="italic font-medium mr-1">{w.partOfSpeech}</span>}
                {w.definition}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic leading-snug">
                {w.example}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MCQ block (A/B 공용) ───────────────────────
function McqBlock({
  badge, instruction, questions, showAnswer, selections, onSelect, badgeColor,
}: {
  badge: string;
  instruction: string;
  questions: VocaMcq[];
  showAnswer: boolean;
  selections: Record<string, number>;
  onSelect: (id: string, idx: number) => void;
  badgeColor: string;
}) {
  if (questions.length === 0) return null;
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <span className={`w-10 h-10 rounded-lg ${badgeColor} text-white flex items-center justify-center text-xl font-black shadow-md`}>
          {badge}
        </span>
        <p className="text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-100">{instruction}</p>
      </div>
      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={q.id} className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex gap-3 mb-3">
              <span className="font-bold text-rose-600 dark:text-rose-400 text-lg shrink-0">{qi + 1}.</span>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-900 px-2 rounded inline-block">
                {q.prompt}
              </p>
            </div>
            <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, oi) => {
                const selected = selections[q.id] === oi;
                const isAnswer = oi === q.answer;
                const revealed = showAnswer || selected;
                return (
                  <button
                    key={oi}
                    onClick={() => onSelect(q.id, oi)}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                      revealed && isAnswer
                        ? "border-green-500 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-200 font-bold"
                        : revealed && selected && !isAnswer
                        ? "border-red-400 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300"
                        : selected
                        ? "border-rose-400 bg-rose-50 dark:bg-rose-950/30 text-gray-800 dark:text-gray-100"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:border-rose-300"
                    }`}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(97 + oi)}.</span>
                    {opt}
                    {revealed && isAnswer && <Check className="inline ml-2 w-4 h-4 text-green-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page 2: Exercise A + B ─────────────────────
function PageExerciseAB({
  lesson, showAnswer, selections, onSelect,
}: {
  lesson: SGRVocaLesson;
  showAnswer: boolean;
  selections: Record<string, number>;
  onSelect: (id: string, idx: number) => void;
}) {
  return (
    <div className="max-w-[1100px] mx-auto p-6 lg:p-10">
      <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-r from-rose-700 to-rose-500 dark:from-gray-950 dark:to-rose-950 px-8 py-6">
        <h1 className="text-3xl lg:text-4xl font-black text-white drop-shadow-lg tracking-tight">EXERCISES</h1>
      </div>
      <McqBlock
        badge="A"
        instruction="Circle the word that best fits the given definition."
        questions={lesson.definitionQuestions}
        showAnswer={showAnswer}
        selections={selections}
        onSelect={onSelect}
        badgeColor="bg-rose-600"
      />
      <McqBlock
        badge="B"
        instruction="Circle the word that is opposite in meaning to the given word."
        questions={lesson.antonymQuestions}
        showAnswer={showAnswer}
        selections={selections}
        onSelect={onSelect}
        badgeColor="bg-rose-600"
      />
    </div>
  );
}

// ─── Page 3: Exercise C ─────────────────────────
function PageExerciseC({
  lesson, showAnswer, inputs, onInput,
}: {
  lesson: SGRVocaLesson;
  showAnswer: boolean;
  inputs: Record<string, string>;
  onInput: (id: string, v: string) => void;
}) {
  return (
    <div className="max-w-[1100px] mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xl font-black shadow-md">C</span>
        <p className="text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-100">
          Write a word that is similar in meaning to the underlined word(s).
        </p>
      </div>
      <div className="space-y-5">
        {lesson.fillBlanks.map((fb, i) => {
          const userVal = (inputs[fb.id] || "").trim().toLowerCase();
          const correct = fb.answer.trim().toLowerCase();
          const isRight = userVal.length > 0 && userVal === correct;
          return (
            <div key={fb.id} className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex gap-3">
                <span className="font-bold text-rose-600 dark:text-rose-400 text-lg shrink-0">{i + 1}.</span>
                <p className="text-lg text-gray-800 dark:text-gray-100 leading-relaxed">
                  {formatInline(fb.sentence)}
                </p>
              </div>
              <div className="ml-8 mt-3 flex items-center gap-3 flex-wrap">
                {showAnswer ? (
                  <span className="px-3 py-1 border-b-2 border-rose-500 text-rose-600 dark:text-rose-300 font-bold text-xl tracking-wide">
                    {fb.answer}
                  </span>
                ) : (
                  <>
                    <span className="font-mono text-xl tracking-[0.3em] text-gray-400 dark:text-gray-500 select-none">
                      {fb.hint}
                    </span>
                    <input
                      type="text"
                      value={inputs[fb.id] || ""}
                      onChange={(e) => onInput(fb.id, e.target.value)}
                      placeholder="정답 입력"
                      className={`w-44 px-3 py-1.5 rounded-lg border-2 bg-transparent font-bold focus:outline-none transition-colors ${
                        isRight
                          ? "border-green-400 text-green-600 dark:text-green-400"
                          : "border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 focus:border-rose-400"
                      }`}
                    />
                    {isRight && <Check className="w-5 h-5 text-green-500" />}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page 4: Reading ────────────────────────────
function PageReading({
  lesson, showAnswer, selections, onSelect, inputs, onInput,
}: {
  lesson: SGRVocaLesson;
  showAnswer: boolean;
  selections: Record<string, number>;
  onSelect: (id: string, idx: number) => void;
  inputs: Record<string, string>;
  onInput: (id: string, v: string) => void;
}) {
  const paragraphs = useMemo(
    () => lesson.passage.content.split(/\n+/).filter(p => p.trim()),
    [lesson.passage.content]
  );

  const renderQuestion = (q: VocaPassageQuestion, qi: number) => {
    const isMcq = q.options.length > 0;
    return (
      <div key={q.id} className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex gap-3 mb-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 text-white font-bold text-sm shrink-0">
            {qi + 1}
          </span>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 pt-0.5">{q.question}</p>
        </div>
        {isMcq ? (
          <div className="ml-11 space-y-2">
            {q.options.map((opt, oi) => {
              const selected = selections[q.id] === oi;
              const isAnswer = oi === q.answer;
              const revealed = showAnswer || selected;
              return (
                <button
                  key={oi}
                  onClick={() => onSelect(q.id, oi)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    revealed && isAnswer
                      ? "border-green-500 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-200 font-bold"
                      : revealed && selected && !isAnswer
                      ? "border-red-400 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300"
                      : selected
                      ? "border-rose-400 bg-rose-50 dark:bg-rose-950/30 text-gray-800 dark:text-gray-100"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:border-rose-300"
                  }`}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(97 + oi)}.</span>
                  {opt}
                  {revealed && isAnswer && <Check className="inline ml-2 w-4 h-4 text-green-600" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="ml-11">
            {showAnswer ? (
              <p className="px-3 py-2 border-b-2 border-rose-500 text-rose-600 dark:text-rose-300 font-bold inline-block">
                {String(q.answer)}
              </p>
            ) : (
              <input
                type="text"
                value={inputs[q.id] || ""}
                onChange={(e) => onInput(q.id, e.target.value)}
                placeholder="답을 입력하세요"
                className="w-full max-w-md px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-none focus:border-rose-400"
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1100px] mx-auto p-6 lg:p-10">
      {/* Passage hero */}
      <div className="relative mb-6 rounded-2xl overflow-hidden bg-gradient-to-r from-rose-600 to-rose-500 dark:from-rose-950 dark:to-gray-900 shadow-lg">
        <div className="px-8 py-5">
          <h1 className="text-3xl lg:text-4xl font-black text-white drop-shadow-lg leading-tight">
            {lesson.passage.title || lesson.passageTitle}
          </h1>
        </div>
      </div>

      {/* Passage */}
      <div className="mb-10 p-6 lg:p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[17px] lg:text-[18px] leading-relaxed text-gray-800 dark:text-gray-100 text-justify">
              {formatInline(p)}
            </p>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="flex items-center gap-3 mb-5">
        <span className="inline-block px-4 py-1.5 bg-black dark:bg-gray-700 text-white rounded-full text-sm font-bold tracking-wide">
          READING COMPREHENSION
        </span>
        <span className="text-gray-500 dark:text-gray-400">Answer the questions.</span>
      </div>
      <div className="space-y-4">
        {lesson.passage.questions.map((q, qi) => renderQuestion(q, qi))}
      </div>
    </div>
  );
}

// ─── Main Viewer ───────────────────────────────────
export default function SGRVocaViewer() {
  const [lessons, setLessons] = useState<SGRVocaLesson[]>(loadVocaLessons);
  const [selectedId, setSelectedId] = useState<string>(lessons[0]?.id || "");
  const [pageKey, setPageKey] = useState<PageKey>("wordlist");
  const [showAnswer, setShowAnswer] = useState(false);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sgrVoca_dark") === "1";
  });

  // Tools
  const [toolsOpen, setToolsOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "ko">("en");
  const [popupData, setPopupData] = useState<{ word: string; context: string; x: number; y: number } | null>(null);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [aiTutorPrompt, setAiTutorPrompt] = useState<string | undefined>(undefined);
  const [aiActionPopup, setAiActionPopup] = useState<{
    action: "explain" | "translate" | "analyze" | "rewrite";
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const handleAiTutor = (action: "explain" | "translate" | "analyze" | "rewrite", text: string) => {
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const rect = range?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 - 160 : window.innerWidth / 2 - 160;
    const y = rect ? rect.bottom + 10 : window.innerHeight / 2;
    setAiActionPopup({ action, text, x, y });
  };

  const selected = useMemo(
    () => lessons.find(l => l.id === selectedId) || lessons[0],
    [lessons, selectedId]
  );

  const handleDictionary = useCallback((data: { word: string; context: string; x: number; y: number }) => {
    setPopupData(data);
  }, []);

  const handleClearAll = useCallback(() => {
    setClearTrigger(c => c + 1);
  }, []);

  const handleSelect = useCallback((id: string, idx: number) => {
    setSelections(prev => ({ ...prev, [id]: idx }));
  }, []);

  const handleInput = useCallback((id: string, v: string) => {
    setInputs(prev => ({ ...prev, [id]: v }));
  }, []);

  // Sync from CMS
  useEffect(() => {
    const handler = () => {
      const next = loadVocaLessons();
      setLessons(next);
      if (!next.find(l => l.id === selectedId)) {
        setSelectedId(next[0]?.id || "");
      }
    };
    window.addEventListener(SGR_VOCA_EVENT, handler);
    return () => window.removeEventListener(SGR_VOCA_EVENT, handler);
  }, [selectedId]);

  useEffect(() => {
    localStorage.setItem("sgrVoca_dark", dark ? "1" : "0");
  }, [dark]);

  if (!selected) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        아직 등록된 SGR Voca 자료가 없습니다. CMS에서 추가해주세요.
      </div>
    );
  }

  const currentIdx = PAGES.findIndex(p => p.key === pageKey);
  const goPrev = () => setPageKey(PAGES[Math.max(0, currentIdx - 1)].key);
  const goNext = () => setPageKey(PAGES[Math.min(PAGES.length - 1, currentIdx + 1)].key);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50/40 dark:from-gray-950 dark:to-gray-900 transition-colors">
        {/* Toolbar */}
        <div className="sticky top-0 z-30 backdrop-blur bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3">
          <div className="max-w-[1600px] mx-auto flex flex-wrap items-center gap-3">
            {lessons.length > 1 && (
              <select
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setPageKey("wordlist"); setSelections({}); setInputs({}); }}
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
                        ? "bg-rose-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
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
                    ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
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

              {/* Tools */}
              <button
                onClick={() => setToolsOpen(v => !v)}
                title="Tools: drag to highlight/underline/dictionary"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  toolsOpen
                    ? "bg-rose-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Highlighter className="w-4 h-4" />
                <span className="hidden sm:inline">Tools</span>
              </button>
              {toolsOpen && (
                <ReadingReviewActions
                  onClearAll={handleClearAll}
                  language={language}
                  onLanguageChange={setLanguage}
                />
              )}
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-40">
                  <button
                    onClick={() => downloadSGRVocaPdf(selected, "question")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-rose-50 dark:hover:bg-rose-950/30 text-gray-800 dark:text-gray-200"
                  >
                    📄 문제편
                  </button>
                  <button
                    onClick={() => downloadSGRVocaPdf(selected, "answer")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-rose-50 dark:hover:bg-rose-950/30 text-gray-800 dark:text-gray-200 border-t border-gray-100 dark:border-gray-700"
                  >
                    ✅ 문제 + 해답편
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <ReadingReviewPassage
          toolsOpen={toolsOpen}
          onDictionary={handleDictionary}
          onAiTutor={handleAiTutor}
          clearTrigger={clearTrigger}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pageKey + selected.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {pageKey === "wordlist" && <PageWordList lesson={selected} />}
              {pageKey === "exerciseAB" && <PageExerciseAB lesson={selected} showAnswer={showAnswer} selections={selections} onSelect={handleSelect} />}
              {pageKey === "exerciseC" && <PageExerciseC lesson={selected} showAnswer={showAnswer} inputs={inputs} onInput={handleInput} />}
              {pageKey === "reading" && <PageReading lesson={selected} showAnswer={showAnswer} selections={selections} onSelect={handleSelect} inputs={inputs} onInput={handleInput} />}
            </motion.div>
          </AnimatePresence>
        </ReadingReviewPassage>

        {/* 단어 뜻 팝업 */}
        {popupData && (
          <WordPopup
            word={popupData.word}
            context={popupData.context}
            language={language}
            x={popupData.x}
            y={popupData.y}
            onClose={() => setPopupData(null)}
            onLanguageChange={setLanguage}
          />
        )}

        {/* AI 액션 말풍선 */}
        {aiActionPopup && (
          <AiActionPopup
            action={aiActionPopup.action}
            selectedText={aiActionPopup.text}
            x={aiActionPopup.x}
            y={aiActionPopup.y}
            onClose={() => setAiActionPopup(null)}
          />
        )}

        {/* Bottom nav */}
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 py-6 border-t border-gray-200 dark:border-gray-700 mt-8">
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
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-md"
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
        open={aiTutorOpen}
        onOpenChange={setAiTutorOpen}
        initialPrompt={aiTutorPrompt}
        contextLabel={`SGR Voca · Unit ${selected?.unitNumber || ""} ${selected?.title || ""}`}
        questionData={selected}
        suggestedQuestions={[
          '이 유닛의 핵심 단어를 설명해줘',
          '단어 예문을 더 만들어줘',
          '동의어와 반의어를 정리해줘',
          '지문 내용을 요약해줘',
        ]}
      />
    </div>
  );
}
