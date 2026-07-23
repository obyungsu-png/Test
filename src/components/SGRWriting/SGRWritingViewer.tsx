import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Download, Moon, Sun,
  BookOpen, Eye, EyeOff, PenLine, Sparkles, Quote,
  Highlighter, Check
} from "lucide-react";
import type { SGRWritingLesson } from "./types";
import { loadWritingLessons, SGR_WRITING_EVENT } from "./types";
import { downloadSGRWritingPdf } from "./pdfUtils";
import { ToeflAiWidget } from "../ToeflAiWidget";
import { WordPopup } from "../SGRClass/WordPopup";
import { AiActionPopup } from "../SGRClass/AiActionPopup";
import { ReadingReviewPassage } from "../SGRClass/ReadingReviewPassage";
import { DrawingCanvas } from "../SGRClass/DrawingCanvas";
import { ReadingReviewActions } from "../SGRClass/ReadingReviewToolbar";

type PageKey = "words" | "expressions" | "review";

const PAGES: Array<{ key: PageKey; label: string; icon: any }> = [
  { key: "words", label: "핵심 단어", icon: Sparkles },
  { key: "expressions", label: "주요 표현 학습", icon: BookOpen },
  { key: "review", label: "복습 응용 영작", icon: PenLine },
];

// ─── Header block (공통) ─────────────────────────
function LessonHeader({ lesson }: { lesson: SGRWritingLesson }) {
  return (
    <>
      {/* Unit hero */}
      <div className="relative mb-6 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-indigo-800 to-indigo-600 dark:from-gray-950 dark:to-indigo-950">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><path d=%22M0 60 Q 25 20 50 60 T 100 60 L 100 100 L 0 100 Z%22 fill=%22white%22/></svg>')] bg-repeat-x bg-bottom" />
        <div className="relative flex items-center gap-5 p-6 lg:p-10">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-black flex items-center justify-center shadow-xl border-4 border-indigo-300 shrink-0">
            <div className="text-center text-white">
              <div className="text-[9px] font-bold tracking-widest">Unit</div>
              <div className="text-xl lg:text-2xl font-black leading-none">{lesson.unitNumber}</div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl lg:text-4xl font-black text-white drop-shadow-lg">
              {lesson.title}
            </h1>
            <p className="text-indigo-200 text-sm mt-1 font-medium">{lesson.bookTitle} · Easy Writing</p>
          </div>
        </div>
      </div>

      {/* Notice */}
      {lesson.notice && (
        <div className="mb-5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border-l-4 border-sky-500 px-5 py-3">
          <p className="font-bold text-sky-800 dark:text-sky-200">{lesson.notice}</p>
        </div>
      )}

      {/* Quote */}
      {(lesson.quoteEn || lesson.quoteKr) && (
        <div className="mb-8 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-5 py-4 flex gap-3">
          <Quote className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <p className="italic text-gray-800 dark:text-gray-100 font-serif">{lesson.quoteEn}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{lesson.quoteKr}</p>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Page 1: 핵심 단어 + 오늘의 핵심 표현 ──────────
function PageWords({
  lesson, showAnswer, inputs, onInput,
}: {
  lesson: SGRWritingLesson;
  showAnswer: boolean;
  inputs: Record<string, string>;
  onInput: (id: string, v: string) => void;
}) {
  return (
    <div className="max-w-[1200px] mx-auto p-6 lg:p-10">
      <LessonHeader lesson={lesson} />

      {/* 핵심 단어 살펴��기 */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-3 h-3 rounded-full bg-indigo-500" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">핵심 단어 살펴��기</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 ml-6">
          주어진 철자로 시작하는 알맞은 단어를 떠올려 보세요.
        </p>
        <div className="space-y-3">
          {lesson.words.map((w, i) => {
            const userVal = (inputs[w.id] || "").trim().toLowerCase();
            const correct = w.ans.trim().toLowerCase();
            const isRight = userVal.length > 0 && userVal === correct;
            const isWrong = userVal.length > 0 && userVal !== correct;
            return (
              <div
                key={w.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <span className="w-7 shrink-0 font-bold text-indigo-600 dark:text-indigo-400 text-lg">{i + 1}</span>
                <span className="w-10 h-10 shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xl font-black">
                  {w.hint}
                </span>
                {showAnswer ? (
                  <span className="w-52 shrink-0 px-3 py-2 border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold text-lg">
                    {w.ans}
                  </span>
                ) : (
                  <span className="w-52 shrink-0 relative">
                    <input
                      type="text"
                      value={inputs[w.id] || ""}
                      onChange={(e) => onInput(w.id, e.target.value)}
                      placeholder={`${w.hint}____`}
                      className={`w-full px-3 py-2 rounded-lg border-2 bg-transparent text-lg font-bold focus:outline-none transition-colors ${
                        isRight
                          ? "border-green-400 text-green-600 dark:text-green-400"
                          : isWrong
                          ? "border-red-300 text-gray-800 dark:text-gray-100"
                          : "border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 focus:border-indigo-400"
                      }`}
                    />
                    {isRight && <Check className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
                  </span>
                )}
                <span className="text-gray-600 dark:text-gray-300 text-base lg:text-lg">: {w.kr}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 오늘의 핵심 표현 */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-3 h-3 rounded-full bg-indigo-500" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">오늘의 핵심 표현</h2>
        </div>
        <div className="rounded-xl bg-indigo-600 dark:bg-indigo-900 px-6 py-4 mb-5 shadow-md">
          <p className="text-lg lg:text-xl font-bold text-white">{lesson.keyExpression}</p>
        </div>
        <div className="rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800 p-6">
          <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-bold mb-4">
            핵심 문장 미리 보기
          </span>
          <p className="text-lg text-gray-800 dark:text-gray-100 mb-2">{lesson.previewKr}</p>
          <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300 font-serif">
            → {lesson.previewEn}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Page 2: 주요 표현 학습 ─────────────────────
function PageExpressions({
  lesson, showAnswer, inputs, onInput,
}: {
  lesson: SGRWritingLesson;
  showAnswer: boolean;
  inputs: Record<string, string>;
  onInput: (id: string, v: string) => void;
}) {
  return (
    <div className="max-w-[1200px] mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-3 h-3 rounded-full bg-indigo-500" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">주요 표현 학습</h2>
        <span className="text-gray-400">|</span>
        <span className="text-gray-500 dark:text-gray-400">핵심 표현을 활용해 문장을 완성해 보세요.</span>
      </div>

      <div className="space-y-6">
        {lesson.expressions.map((e) => (
          <div
            key={e.id}
            className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
          >
            {/* Expression title */}
            <div className="px-6 py-4 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900">
              <p className="text-lg lg:text-xl font-bold text-indigo-800 dark:text-indigo-200">{e.title}</p>
            </div>
            <div className="p-6">
              {/* NOTE */}
              {e.note && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900/60 border-l-2 border-gray-300 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{e.note}</p>
                </div>
              )}
              {/* 연습 */}
              <div className="mb-4">
                <p className="text-base lg:text-lg text-gray-800 dark:text-gray-100 font-medium">{e.exampleKr}</p>
                <p className="text-base lg:text-lg text-indigo-600 dark:text-indigo-400 font-serif mt-1">{e.exampleEn}</p>
              </div>
              {/* 도전 */}
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4">
                <p className="text-base lg:text-lg text-gray-800 dark:text-gray-100 font-medium mb-2">{e.challengeKr}</p>
                {showAnswer ? (
                  <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300 font-serif border-b-2 border-indigo-400 inline-block">
                    {e.challengeEn}
                  </p>
                ) : (
                  <textarea
                    value={inputs[e.id] || ""}
                    onChange={(ev) => onInput(e.id, ev.target.value)}
                    placeholder="영어로 작성해 보세요..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border-2 border-amber-300 dark:border-amber-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-indigo-400 resize-none"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page 3: 복습 응용 영작 ─────────────────────
function PageReview({
  lesson, showAnswer, inputs, onInput,
}: {
  lesson: SGRWritingLesson;
  showAnswer: boolean;
  inputs: Record<string, string>;
  onInput: (id: string, v: string) => void;
}) {
  return (
    <div className="max-w-[1200px] mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-3 h-3 rounded-full bg-indigo-500" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">복습 응용 영작</h2>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 ml-6">
        배운 표현을 활용하여 다음 문장을 영어로 옮겨 보세요.
      </p>

      <div className="space-y-6">
        {lesson.reviews.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-6"
          >
            <p className="text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{r.kr}</p>
            {r.guide && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">{r.guide}</p>
            )}
            {showAnswer ? (
              <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300 font-serif border-b-2 border-indigo-400 inline-block">
                {r.ans}
              </p>
            ) : (
              <textarea
                value={inputs[r.id] || ""}
                onChange={(ev) => onInput(r.id, ev.target.value)}
                placeholder="영어로 작성해 보세요..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-indigo-400 resize-none"
              />
            )}
          </div>
        ))}
      </div>

      {/* 모범 답안 (answer 모드에서만) */}
      {showAnswer && (
        <div className="mt-8 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 p-6">
          <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200 mb-4">모범 답안</h3>
          <div className="space-y-2 text-gray-700 dark:text-gray-200">
            {lesson.reviews.map((r) => (
              <p key={r.id} className="font-serif">{r.ans}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Viewer ───────────────────────────────────
export default function SGRWritingViewer() {
  const [lessons, setLessons] = useState<SGRWritingLesson[]>(loadWritingLessons);
  const [selectedId, setSelectedId] = useState<string>(lessons[0]?.id || "");
  const [pageKey, setPageKey] = useState<PageKey>("words");
  const [showAnswer, setShowAnswer] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sgrWriting_dark") === "1";
  });

  // Tools (drag-popover based highlight/underline/dictionary)
  const [toolsOpen, setToolsOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "ko" | "ch">("en");
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
  const [drawOpen, setDrawOpen] = useState(false);

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

  const handleDraw = useCallback(() => {
    setDrawOpen(true);
  }, []);

  const handleInput = useCallback((id: string, v: string) => {
    setInputs(prev => ({ ...prev, [id]: v }));
  }, []);

  // Sync from CMS
  useEffect(() => {
    const handler = () => {
      const next = loadWritingLessons();
      setLessons(next);
      if (!next.find(l => l.id === selectedId)) {
        setSelectedId(next[0]?.id || "");
      }
    };
    window.addEventListener(SGR_WRITING_EVENT, handler);
    return () => window.removeEventListener(SGR_WRITING_EVENT, handler);
  }, [selectedId]);

  useEffect(() => {
    localStorage.setItem("sgrWriting_dark", dark ? "1" : "0");
  }, [dark]);

  if (!selected) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        아직 등록된 SGR Writing 자료가 없습니다. CMS에서 추가해주세요.
      </div>
    );
  }

  const currentIdx = PAGES.findIndex(p => p.key === pageKey);
  const goPrev = () => setPageKey(PAGES[Math.max(0, currentIdx - 1)].key);
  const goNext = () => setPageKey(PAGES[Math.min(PAGES.length - 1, currentIdx + 1)].key);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-gray-950 dark:to-gray-900 transition-colors">
        {/* Toolbar */}
        <div className="sticky top-0 z-30 backdrop-blur bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3">
          <div className="max-w-[1600px] mx-auto flex flex-wrap items-center gap-3">
            {/* lesson picker */}
            {lessons.length > 1 && (
              <select
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setPageKey("words"); setInputs({}); }}
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
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
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
                    ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
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

              {/* Tools button + actions */}
              <button
                onClick={() => setToolsOpen(v => !v)}
                title="Tools: drag to highlight/underline/dictionary"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  toolsOpen
                    ? "bg-indigo-600 text-white"
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
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-40">
                  <button
                    onClick={() => downloadSGRWritingPdf(selected, "question")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-gray-800 dark:text-gray-200"
                  >
                    📄 문제편
                  </button>
                  <button
                    onClick={() => downloadSGRWritingPdf(selected, "answer")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-gray-800 dark:text-gray-200 border-t border-gray-100 dark:border-gray-700"
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
          onDraw={handleDraw}
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
              {pageKey === "words" && <PageWords lesson={selected} showAnswer={showAnswer} inputs={inputs} onInput={handleInput} />}
              {pageKey === "expressions" && <PageExpressions lesson={selected} showAnswer={showAnswer} inputs={inputs} onInput={handleInput} />}
              {pageKey === "review" && <PageReview lesson={selected} showAnswer={showAnswer} inputs={inputs} onInput={handleInput} />}
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

        {/* 필기 캔버스 */}
        <DrawingCanvas active={drawOpen} onClose={() => setDrawOpen(false)} />

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
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
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
        contextLabel={`SGR Writing · Unit ${selected?.unitNumber || ""} ${selected?.title || ""}`}
        questionData={selected}
        suggestedQuestions={[
          '이 레슨의 핵심 표현을 설명해줘',
          '핵심 단어 예문을 만들어줘',
          '내 영작 문장을 첨삭해줘',
          '모범 답안을 분석해줘',
        ]}
      />
    </div>
  );
}
