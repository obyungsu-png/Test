// SGR HSK Viewer — SGR Class 와 동일한 툴바·페이지 구조·다크모드·드로잉·사전 팝업·PDF 다운로드.
// 콘텐츠는 HSK 도메인(한자·병음·성조·급수)에 맞게 렌더한다.

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import {
  ChevronLeft, ChevronRight, Download, Moon, Sun,
  BookOpen, Eye, EyeOff, Sparkles, Pencil,
  FileText, HelpCircle, Layers, Languages,
} from "lucide-react";
import {
  loadLessons,
  syncFromServer,
  SGR_HSK_EVENT,
  HSK_LEVEL_META,
  normalizeHSKLevel,
  type HSKLesson,
  type HSKLevel,
  type HSKQuestion,
} from "./types";
import { downloadHSKPdf } from "./pdfUtils";
import { DrawingCanvas } from "../SGRClass/DrawingCanvas";
import { WordPopup } from "../SGRClass/WordPopup";
import { useAnswers, isTextCorrect } from "../SGRClass/answerState";
import "../../utils/sgrHskApi"; // 서버 연동 함수 등록

// ─── Page metadata ────────────────────────────────
type PageKey = "preview" | "passage" | "vocab" | "questions" | "direct";
const PAGES: Array<{ key: PageKey; label: string; icon: any }> = [
  { key: "preview",   label: "Preview",     icon: Layers },
  { key: "passage",   label: "Passage",     icon: BookOpen },
  { key: "vocab",     label: "Vocabulary",  icon: FileText },
  { key: "questions", label: "Questions",   icon: HelpCircle },
  { key: "direct",    label: "직독직해",     icon: Sparkles },
];

// ─── 급수 픽커 ─────────────────────────────────────
function LevelPicker({ groups, onPick }: { groups: Map<HSKLevel, HSKLesson[]>; onPick: (lv: HSKLevel) => void }) {
  const levels: HSKLevel[] = ["1", "2", "3", "4", "5", "6", "7-9"];
  return (
    <div className="min-h-[400px] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold">
            <Languages className="w-3.5 h-3.5" />중국어 · HSK 학습
          </div>
          <h1 className="mt-3 text-4xl font-black text-gray-800 dark:text-gray-100">SGR HSK</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">학습할 급수를 선택하세요.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {levels.map(lv => {
            const meta = HSK_LEVEL_META[lv];
            const cnt = (groups.get(lv) || []).length;
            return (
              <motion.button
                key={lv}
                onClick={() => onPick(lv)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`p-5 rounded-xl text-white text-left bg-gradient-to-br ${meta.color} shadow-lg`}
              >
                <div className="text-2xl font-black">{meta.label}</div>
                <div className="text-xs opacity-90 mt-1">{meta.description}</div>
                <div className="text-[11px] mt-3 opacity-80">{cnt} 개 레슨</div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── inline formatter: **bold**, __underline__ ──
function fmt(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text || "";
  let key = 0;
  while (remaining.length > 0) {
    const bold = remaining.match(/\*\*(.+?)\*\*/);
    const under = remaining.match(/__(.+?)__/);
    let idx = -1, kind: "b" | "u" | null = null, m: RegExpMatchArray | null = null;
    if (bold && bold.index !== undefined) { idx = bold.index; kind = "b"; m = bold; }
    if (under && under.index !== undefined && (idx < 0 || under.index < idx)) { idx = under.index; kind = "u"; m = under; }
    if (!m || idx < 0) { parts.push(<span key={key++}>{remaining}</span>); break; }
    if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
    if (kind === "b") parts.push(<strong key={key++} className="text-red-700 dark:text-red-300 font-bold">{m[1]}</strong>);
    if (kind === "u") parts.push(<u key={key++} className="decoration-2">{m[1]}</u>);
    remaining = remaining.slice(idx + m[0].length);
  }
  return <>{parts}</>;
}

// ─── Word pickable text (한자 문자 단위) ─────────────
function ClickableHanzi({ text, onDict }: { text: string; onDict: (w: string, ctx: string, x: number, y: number) => void }) {
  // 한자 하나하나 클릭 가능하게 렌더
  const tokens: Array<{ ch: string; hz: boolean }> = [];
  for (const ch of text) {
    const isHan = /[㐀-鿿豈-﫿]/.test(ch);
    tokens.push({ ch, hz: isHan });
  }
  return (
    <>
      {tokens.map((t, i) =>
        t.hz ? (
          <span
            key={i}
            className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 rounded px-0.5 transition-colors"
            onClick={(e) => onDict(t.ch, text, e.clientX, e.clientY)}
          >{t.ch}</span>
        ) : (
          <span key={i}>{t.ch}</span>
        )
      )}
    </>
  );
}

// ─── Page: Preview ────────────────────────────────
function PreviewPage({ lesson, dark }: { lesson: HSKLesson; dark: boolean }) {
  const meta = HSK_LEVEL_META[normalizeHSKLevel(lesson.hskLevel)];
  return (
    <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
      {/* Hero */}
      <div className={`relative mb-8 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br ${meta.color} dark:opacity-90`}>
        <div className="absolute inset-0 opacity-15 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><text x=%2210%22 y=%2280%22 font-size=%2280%22 fill=%22white%22>汉</text></svg>')] bg-repeat" />
        <div className="relative flex items-center gap-6 p-8 lg:p-12">
          <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center shadow-xl border-4 border-white/70">
            <div className="text-center text-white">
              <div className="text-[10px] font-bold tracking-widest">Unit</div>
              <div className="text-2xl font-black leading-none">{lesson.unitNumber}</div>
            </div>
          </div>
          <div className="text-white">
            <div className="text-xs font-bold opacity-90 tracking-widest">{meta.label}</div>
            <h1 className="text-3xl lg:text-5xl font-black drop-shadow-lg mt-1">{lesson.title}</h1>
            {lesson.titlePinyin && <div className="text-sm lg:text-base mt-1 opacity-90 italic">{lesson.titlePinyin}</div>}
            {lesson.titleKorean && <div className="text-lg lg:text-xl mt-1 font-semibold">{lesson.titleKorean}</div>}
          </div>
        </div>
      </div>

      {/* Visual Preview */}
      {lesson.previewQuestion && (
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-5">
            <div className="shrink-0 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-lg font-bold text-sm shadow-sm">
              Visual<br />Preview
            </div>
            <p className="text-xl lg:text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-1">
              {lesson.previewQuestion}
            </p>
          </div>
          {lesson.previewCards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lesson.previewCards.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-lg font-bold text-red-800 dark:text-red-200">{c.caption}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category */}
      {lesson.category && (
        <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-dashed border-gray-200 dark:border-gray-700 pt-3">
          분류: {lesson.category}
        </div>
      )}
    </div>
  );
}

// ─── Page: Passage ─────────────────────────────────
function PassagePage({ lesson, onDict, showPinyin, showKorean }: { lesson: HSKLesson; onDict: (w: string, c: string, x: number, y: number) => void; showPinyin: boolean; showKorean: boolean }) {
  return (
    <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-gray-800 dark:text-gray-100 tracking-wide">
          {lesson.passageTitle || lesson.title}
        </h2>
        {showPinyin && lesson.passageTitlePinyin && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">{lesson.passageTitlePinyin}</div>
        )}
        {showKorean && lesson.passageTitleKorean && (
          <div className="text-base text-red-700 dark:text-red-300 mt-1 font-semibold">{lesson.passageTitleKorean}</div>
        )}
      </div>
      <div className="space-y-5">
        {lesson.passageParagraphs.map((p, i) => (
          <div key={p.id} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">단락 {i + 1}</div>
            <div className="text-lg leading-loose text-gray-900 dark:text-gray-100">
              <ClickableHanzi text={p.hanzi} onDict={onDict} />
            </div>
            {showPinyin && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed italic">{p.pinyin}</div>
            )}
            {showKorean && (
              <div className="text-base text-red-700 dark:text-red-300 mt-3 leading-relaxed">{p.korean}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page: Vocabulary ─────────────────────────────
function VocabPage({ lesson, onDict, showPinyin, showKorean }: { lesson: HSKLesson; onDict: (w: string, c: string, x: number, y: number) => void; showPinyin: boolean; showKorean: boolean }) {
  if (lesson.vocab.length === 0) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">등록된 어휘가 없습니다.</div>;
  return (
    <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
      <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-4">Vocabulary Review</h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {lesson.vocab.map((v, i) => (
          <div key={v.id} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="text-3xl font-black text-red-700 dark:text-red-300 tracking-wide cursor-pointer"
                onClick={(e) => onDict(v.hanzi, v.hanzi, e.clientX, e.clientY)}>
                {v.hanzi}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500">#{i + 1}</div>
            </div>
            {showPinyin && v.pinyin && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{v.pinyin}</div>}
            {v.partOfSpeech && <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{v.partOfSpeech}</div>}
            {showKorean && <div className="text-sm text-gray-800 dark:text-gray-200 mt-2 font-semibold">{v.meaning}</div>}
            {v.example && (
              <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                <div className="text-sm text-red-700 dark:text-red-300">
                  <ClickableHanzi text={v.example} onDict={onDict} />
                </div>
                {showPinyin && v.examplePinyin && <div className="text-[11px] text-gray-500 dark:text-gray-400 italic">{v.examplePinyin}</div>}
                {showKorean && v.exampleKorean && <div className="text-[12px] text-gray-700 dark:text-gray-300 mt-0.5">{v.exampleKorean}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page: Questions ─────────────────────────────
function QuestionsPage({ lesson, showAnswer }: { lesson: HSKLesson; showAnswer: boolean }) {
  const { bucket, set } = useAnswers("sgrHSK_q", lesson.id);
  if (lesson.questions.length === 0) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">등록된 문제가 없습니다.</div>;
  return (
    <div className="max-w-[1000px] mx-auto p-6 lg:p-10 space-y-4">
      <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Questions</h2>
      {lesson.questions.map((q, i) => (
        <QuestionCard key={q.id} idx={i} q={q} showAnswer={showAnswer} value={bucket[q.id]} onChange={(v) => set(q.id, v)} />
      ))}
    </div>
  );
}

function QuestionCard({ q, idx, showAnswer, value, onChange }: {
  q: HSKQuestion;
  idx: number;
  showAnswer: boolean;
  value: any;
  onChange: (v: any) => void;
}) {
  const label =
    q.type === "multiple_choice" ? "객관식" :
    q.type === "fill_blank" ? "빈칸 채우기" :
    q.type === "translation_zh_ko" ? "중→한 번역" :
    q.type === "translation_ko_zh" ? "한→중 번역" :
    q.type === "tone_pick" ? "성조 고르기" :
    q.type;

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-14 text-right text-[11px] font-bold uppercase tracking-widest text-red-700 dark:text-red-300 pt-1">{label}</span>
        <div className="flex-1">
          <p className="text-[15px] font-semibold text-gray-800 dark:text-gray-100 mb-2">
            <span className="mr-2">Q{idx + 1}.</span>{fmt(q.question)}
          </p>
          {q.questionPinyin && <div className="text-xs text-gray-500 dark:text-gray-400 italic mb-2">{q.questionPinyin}</div>}
          {(q.type === "multiple_choice" || q.type === "tone_pick") && q.options && (
            <div className="space-y-1.5">
              {q.options.map((op, oi) => {
                const isCorrect = oi === Number(q.answer);
                const isPicked = typeof value === "number" && value === oi;
                let cls = "border-gray-200 dark:border-gray-700 hover:border-red-300 text-gray-800 dark:text-gray-100";
                if (showAnswer && isCorrect) cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-800 dark:text-emerald-200";
                else if (isPicked && showAnswer && !isCorrect) cls = "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300";
                else if (isPicked) cls = "border-red-400 bg-red-50/60 dark:bg-red-950/20 text-red-800 dark:text-red-200";
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => onChange(isPicked ? null : oi)}
                    className={`w-full text-left px-3 py-2 rounded border-2 text-[14px] transition-colors ${cls}`}
                  >
                    <span className="font-bold mr-2">{"ABCD"[oi] || oi + 1}.</span>
                    {op}
                    {showAnswer && isCorrect && <span className="ml-2 text-emerald-600 dark:text-emerald-300">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
          {(q.type === "fill_blank" || q.type === "translation_zh_ko" || q.type === "translation_ko_zh") && (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:border-red-400 outline-none"
                placeholder="답 입력..."
                value={typeof value === "string" ? value : ""}
                onChange={e => onChange(e.target.value)}
              />
              {showAnswer && (
                <div className={`text-sm font-bold ${isTextCorrect(typeof value === "string" ? value : "", String(q.answer)) ? "text-emerald-600 dark:text-emerald-300" : "text-gray-700 dark:text-gray-200"}`}>
                  정답: {String(q.answer)}
                </div>
              )}
            </div>
          )}
          {showAnswer && q.explanation && (
            <div className="mt-2 text-xs text-gray-700 dark:text-gray-200 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded p-2">
              💡 {q.explanation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page: Direct Reading ─────────────────────────
function DirectReadingPage({ lesson, showPinyin, showKorean }: { lesson: HSKLesson; showPinyin: boolean; showKorean: boolean }) {
  if (lesson.directReading.length === 0) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">등록된 직독직해 항목이 없습니다.</div>;
  return (
    <div className="max-w-[1200px] mx-auto p-6 lg:p-10 space-y-3">
      <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">직독직해</h2>
      {lesson.directReading.map((d, i) => {
        const chunks = d.chunks && d.chunks.length > 0 ? d.chunks : d.hanzi.split("/").map(s => s.trim());
        return (
          <div key={d.id} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="text-[11px] text-red-700 dark:text-red-300 font-bold uppercase tracking-wide">문장 {i + 1}</div>
            <div className="flex flex-wrap gap-x-3 gap-y-2 mt-2">
              {chunks.map((c, ci) => (
                <span key={ci} className="text-xl text-gray-900 dark:text-gray-100 border-b-2 border-dashed border-red-300 dark:border-red-500 pb-0.5">
                  {c}
                </span>
              ))}
            </div>
            {showPinyin && <div className="text-sm text-gray-500 dark:text-gray-400 mt-3 italic">{d.pinyin}</div>}
            {showKorean && <div className="text-base text-red-700 dark:text-red-300 mt-3">{d.korean}</div>}
            {d.grammarPoint && (
              <div className="mt-3 text-sm text-gray-700 dark:text-gray-200 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                💡 <b>문법 포인트:</b> {d.grammarPoint}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main viewer ──────────────────────────────────
export default function SGRHSKViewer() {
  const [lessons, setLessons] = useState<HSKLesson[]>(loadLessons);
  const [selectedLevel, setSelectedLevel] = useState<HSKLevel | null>(() => {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem("sgrHSK_level") as HSKLevel | null) || null;
  });
  const [selectedId, setSelectedId] = useState<string>("");
  const [pageKey, setPageKey] = useState<PageKey>("preview");
  const [showAnswer, setShowAnswer] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showKorean, setShowKorean] = useState(false);
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sgrHSK_dark") === "1";
  });
  const [drawOpen, setDrawOpen] = useState(false);
  const [popupLang, setPopupLang] = useState<"en" | "ko" | "ch">("ch");
  const [popupData, setPopupData] = useState<{ word: string; context: string; x: number; y: number } | null>(null);

  // 서버 sync + storage change
  useEffect(() => {
    const handler = () => {
      const next = loadLessons();
      setLessons(next);
      if (!next.find(l => l.id === selectedId)) setSelectedId(next[0]?.id || "");
    };
    window.addEventListener(SGR_HSK_EVENT, handler);
    syncFromServer().then(next => {
      setLessons(next);
      if (!next.find(l => l.id === selectedId)) setSelectedId(next[0]?.id || "");
    });
    return () => window.removeEventListener(SGR_HSK_EVENT, handler);
  }, [selectedId]);

  useEffect(() => {
    localStorage.setItem("sgrHSK_dark", dark ? "1" : "0");
  }, [dark]);

  const grouped = useMemo(() => {
    const m = new Map<HSKLevel, HSKLesson[]>();
    for (const l of lessons) {
      const lv = normalizeHSKLevel(l.hskLevel);
      if (!m.has(lv)) m.set(lv, []);
      m.get(lv)!.push(l);
    }
    m.forEach(arr => arr.sort((a, b) => a.unitNumber.localeCompare(b.unitNumber, "ko", { numeric: true })));
    return m;
  }, [lessons]);

  const filtered = selectedLevel ? grouped.get(selectedLevel) || [] : [];
  useEffect(() => {
    if (!selectedLevel) return;
    localStorage.setItem("sgrHSK_level", selectedLevel);
    if (!filtered.find(l => l.id === selectedId)) {
      setSelectedId(filtered[0]?.id || "");
      setPageKey("preview");
    }
  }, [selectedLevel, filtered, selectedId]);

  const selected = useMemo(() => filtered.find(l => l.id === selectedId) || filtered[0], [filtered, selectedId]);

  const handleDict = useCallback((word: string, context: string, x: number, y: number) => {
    setPopupData({ word, context, x, y });
  }, []);

  const handleDraw = useCallback(() => setDrawOpen(true), []);
  const handleDownload = useCallback(() => {
    if (!selected) return;
    downloadHSKPdf(selected, { showAnswer });
  }, [selected, showAnswer]);

  // Level picker
  if (!selectedLevel) {
    return <LevelPicker groups={grouped} onPick={(lv) => {
      setSelectedLevel(lv);
      const first = (grouped.get(lv) || [])[0];
      setSelectedId(first?.id || "");
      setPageKey("preview");
    }} />;
  }

  // No lesson
  if (!selected) {
    const meta = HSK_LEVEL_META[selectedLevel];
    return (
      <div className={dark ? "dark" : ""}>
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
          <div className="text-4xl">📚</div>
          <p>{meta.label} 에 아직 등록된 레슨이 없습니다.</p>
          <button onClick={() => setSelectedLevel(null)} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-200">
            급수 다시 선택
          </button>
        </div>
      </div>
    );
  }

  const currentIdx = PAGES.findIndex(p => p.key === pageKey);
  const goPrev = () => setPageKey(PAGES[Math.max(0, currentIdx - 1)].key);
  const goNext = () => setPageKey(PAGES[Math.min(PAGES.length - 1, currentIdx + 1)].key);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50/40 dark:from-gray-950 dark:to-gray-900 transition-colors">
        {/* Toolbar */}
        <div className="sticky top-0 z-30 backdrop-blur bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3">
          <div className="max-w-[1600px] mx-auto flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSelectedLevel(null)}
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40 text-red-800 dark:text-red-200 hover:from-red-200 hover:to-orange-200"
              title="다른 급수로 전환"
            >
              📚 {HSK_LEVEL_META[selectedLevel].label}
            </button>
            {filtered.length > 1 && (
              <select
                value={selectedId}
                onChange={e => { setSelectedId(e.target.value); setPageKey("preview"); }}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              >
                {filtered.map(l => (
                  <option key={l.id} value={l.id}>Unit {l.unitNumber} · {l.titleKorean || l.title}</option>
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
                        ? "bg-red-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-2">
              <ToggleChip on={showPinyin} onChange={setShowPinyin} label="병음" />
              <ToggleChip on={showKorean} onChange={setShowKorean} label="한국어" />
              <button
                onClick={() => setShowAnswer(v => !v)}
                title="정답 토글"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  showAnswer
                    ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                {showAnswer ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{showAnswer ? "정답" : "정답"}</span>
              </button>
              <button
                onClick={handleDraw}
                title="화면 위에 그리기"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                title="PDF 로 저장"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDark(v => !v)}
                title="다크모드 토글"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          {pageKey === "preview"   && <PreviewPage       lesson={selected} dark={dark} />}
          {pageKey === "passage"   && <PassagePage       lesson={selected} onDict={handleDict} showPinyin={showPinyin} showKorean={showKorean} />}
          {pageKey === "vocab"     && <VocabPage         lesson={selected} onDict={handleDict} showPinyin={showPinyin} showKorean={showKorean} />}
          {pageKey === "questions" && <QuestionsPage     lesson={selected} showAnswer={showAnswer} />}
          {pageKey === "direct"    && <DirectReadingPage lesson={selected} showPinyin={showPinyin} showKorean={showKorean} />}
        </div>

        {/* Prev / Next */}
        <div className="sticky bottom-0 z-20 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={currentIdx === 0}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold ${
                currentIdx === 0
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />이전
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold">
              {currentIdx + 1} / {PAGES.length} · {PAGES[currentIdx].label}
            </div>
            <button
              onClick={goNext}
              disabled={currentIdx === PAGES.length - 1}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold ${
                currentIdx === PAGES.length - 1
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              다음<ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Word popup (사전 팝업) */}
        {popupData && (
          <WordPopup
            word={popupData.word}
            context={popupData.context}
            x={popupData.x}
            y={popupData.y}
            language={popupLang}
            onLanguageChange={setPopupLang}
            availableLanguages={["ch", "ko", "en"]}
            onClose={() => setPopupData(null)}
          />
        )}

        {/* Drawing canvas */}
        <DrawingCanvas active={drawOpen} onClose={() => setDrawOpen(false)} />
      </div>
    </div>
  );
}

function ToggleChip({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
        on ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
      }`}
    >{label}</button>
  );
}
