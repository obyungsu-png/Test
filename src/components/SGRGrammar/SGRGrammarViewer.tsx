import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Notebook,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Moon,
  Sun,
  PenTool,
  Highlighter,
} from "lucide-react";
import {
  loadUnits,
  SGR_GRAMMAR_EVENT,
  type GrammarUnit,
  type GrammarKind,
  type GrammarWritingContent,
} from "./types";
import { GrammarWritingRenderer } from "./GrammarWritingRenderer";
import { WordPopup } from "../SGRClass/WordPopup";
import { AiActionPopup } from "../SGRClass/AiActionPopup";
import { ReadingReviewPassage } from "../SGRClass/ReadingReviewPassage";
import { DrawingCanvas } from "../SGRClass/DrawingCanvas";
import { ReadingReviewActions } from "../SGRClass/ReadingReviewToolbar";

// ─── inline formatter: **bold**, __underline__ ─────
export function fmt(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|__[^_]+__)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(<span key={key++}>{text.slice(last, m.index)}</span>);
    const raw = m[0];
    if (raw.startsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-bold">
          {raw.slice(2, -2)}
        </strong>
      );
    } else {
      nodes.push(
        <span key={key++} className="underline decoration-2 underline-offset-2">
          {raw.slice(2, -2)}
        </span>
      );
    }
    last = m.index + raw.length;
  }
  if (last < text.length) nodes.push(<span key={key++}>{text.slice(last)}</span>);
  return nodes;
}

export default function SGRGrammarViewer() {
  const [units, setUnits] = useState<GrammarUnit[]>(loadUnits);
  const [selectedId, setSelectedId] = useState<string>(units[0]?.id || "");
  const [kind, setKind] = useState<GrammarKind | null>(null); // null → 선택 화면
  const [typeIdx, setTypeIdx] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sgrGrammar_dark") === "1";
  });

  // ─── Tools 통합: 드래그 사전 / 하이라이트 / 필기 ───
  const [toolsOpen, setToolsOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "ko" | "ch">("en");
  const [popupData, setPopupData] = useState<{ word: string; context: string; x: number; y: number } | null>(null);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [drawOpen, setDrawOpen] = useState(false);
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

  const handleDictionary = useCallback((data: { word: string; context: string; x: number; y: number }) => {
    setPopupData(data);
  }, []);

  const handleClearAll = useCallback(() => {
    setClearTrigger(c => c + 1);
  }, []);

  const handleDraw = useCallback(() => {
    setDrawOpen(true);
  }, []);

  useEffect(() => {
    const handler = () => {
      const next = loadUnits();
      setUnits(next);
      if (!next.find((u) => u.id === selectedId)) {
        setSelectedId(next[0]?.id || "");
      }
    };
    window.addEventListener(SGR_GRAMMAR_EVENT, handler);
    return () => window.removeEventListener(SGR_GRAMMAR_EVENT, handler);
  }, [selectedId]);

  useEffect(() => {
    localStorage.setItem("sgrGrammar_dark", dark ? "1" : "0");
  }, [dark]);

  const selected = useMemo(
    () => units.find((u) => u.id === selectedId) || units[0],
    [units, selectedId]
  );

  const types =
    kind === "textbook"
      ? selected?.textbook.types || []
      : kind === "workbook"
      ? selected?.workbook.types || []
      : [];
  const currentType = types[typeIdx];

  if (!selected) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        아직 등록된 SGR Grammar 자료가 없습니다. CMS에서 추가해주세요.
      </div>
    );
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-gray-950 dark:to-gray-900 transition-colors">
        {/* Toolbar */}
        <div className="sticky top-0 z-30 backdrop-blur bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3">
          <div className="max-w-[1600px] mx-auto flex flex-wrap items-center gap-3">
            {/* Unit picker */}
            {units.length > 1 && (
              <select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setKind(null);
                  setTypeIdx(0);
                }}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit {u.unitNumber} · {u.unitTitle}
                  </option>
                ))}
              </select>
            )}

            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-sm font-bold text-gray-600 dark:text-gray-300">
              <button
                onClick={() => {
                  setKind(null);
                  setTypeIdx(0);
                }}
                className="hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Unit {selected.unitNumber} · {selected.unitTitle}
              </button>
              {kind && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => setTypeIdx(0)}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    {kind === "textbook" ? "Textbook" : "Workbook"}
                  </button>
                </>
              )}
              {kind && currentType && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {currentType.label}
                  </span>
                </>
              )}
            </div>

            <div className="ml-auto flex items-center gap-2">
              {kind && (
                <>
                  <button
                    onClick={() => setToolsOpen(v => !v)}
                    title="Tools: drag to highlight/underline/dictionary"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      toolsOpen
                        ? "bg-emerald-600 text-white"
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
                      onDraw={handleDraw}
                    />
                  )}
                  <button
                    onClick={() => setShowAnswer((v) => !v)}
                    title="정답 토글"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      showAnswer
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {showAnswer ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="hidden sm:inline">정답</span>
                  </button>
                </>
              )}
              <button
                onClick={() => setDark((v) => !v)}
                title="다크모드 토글"
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <ReadingReviewPassage
          toolsOpen={toolsOpen}
          onDictionary={handleDictionary}
          onAiTutor={handleAiTutor}
          clearTrigger={clearTrigger}
        >
        <div className="max-w-[1600px] mx-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            {kind === null ? (
              <motion.div
                key="picker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                <KindPicker unit={selected} onPick={(k) => { setKind(k); setTypeIdx(0); }} />
              </motion.div>
            ) : (
              <motion.div
                key={`content-${kind}-${typeIdx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Type selector */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                  {types.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => setTypeIdx(i)}
                      className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        typeIdx === i
                          ? "bg-emerald-600 text-white shadow-md"
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-emerald-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Renderer */}
                {currentType && kind === "textbook" && currentType.content.typeId === "grammar_writing" && (
                  <GrammarWritingRenderer
                    unit={selected}
                    content={currentType.content as GrammarWritingContent}
                    showAnswer={showAnswer}
                  />
                )}
                {currentType && kind === "workbook" && (
                  <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <PenTool className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-1">
                      {currentType.label}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Workbook 형식은 추후 등록됩니다.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </ReadingReviewPassage>

        {/* Bottom nav (back to picker) */}
        {kind !== null && (
          <div className="max-w-[1600px] mx-auto px-6 py-6 border-t border-gray-200 dark:border-gray-700 mt-4">
            <button
              onClick={() => setKind(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
              Textbook / Workbook 선택으로
            </button>
          </div>
        )}

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
            availableLanguages={["en", "ko", "ch"]}
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
      </div>
    </div>
  );
}

// ─── Textbook / Workbook 첫 화면 ────────────────────
function KindPicker({
  unit,
  onPick,
}: {
  unit: GrammarUnit;
  onPick: (k: GrammarKind) => void;
}) {
  const cards: Array<{
    kind: GrammarKind;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    count: number;
    firstLabel?: string;
  }> = [
    {
      kind: "textbook",
      label: "Textbook",
      icon: BookOpen,
      color: "from-emerald-500 to-teal-600",
      count: unit.textbook.types.length,
      firstLabel: unit.textbook.types[0]?.label,
    },
    {
      kind: "workbook",
      label: "Workbook",
      icon: Notebook,
      color: "from-amber-500 to-orange-600",
      count: unit.workbook.types.length,
      firstLabel: unit.workbook.types[0]?.label,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            UNIT {unit.unitNumber}
          </span>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {unit.unitTitle}
          </h1>
        </div>
        {unit.subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{unit.subtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.kind}
              onClick={() => onPick(c.kind)}
              className="group text-left rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl transition-all"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-md mb-4`}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                {c.label}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {c.count}개 유형 준비됨
              </p>
              {c.firstLabel && (
                <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                  <span className="font-bold">첫 유형</span>
                  <span>·</span>
                  <span>{c.firstLabel}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
