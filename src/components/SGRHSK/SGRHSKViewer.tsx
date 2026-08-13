// SGR HSK Viewer — 학생용 열람 화면
// SGR Class 와 페이지 구조는 유사하되 한자·병음·성조 표기와 HSK 급수 필터를 지원한다.

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  loadLessons,
  syncFromServer,
  SGR_HSK_EVENT,
  HSK_LEVEL_META,
  normalizeHSKLevel,
  type HSKLesson,
  type HSKLevel,
} from "./types";
import "../../utils/sgrHskApi"; // 서버 연동 함수 등록

type PageKey = "preview" | "vocab" | "passage" | "questions" | "direct";

const PAGE_LABEL: Record<PageKey, string> = {
  preview: "Preview",
  vocab: "Vocabulary",
  passage: "Passage",
  questions: "Questions",
  direct: "직독직해",
};

export default function SGRHSKViewer() {
  const [lessons, setLessons] = useState<HSKLesson[]>(loadLessons);
  const [selectedLevel, setSelectedLevel] = useState<HSKLevel | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [page, setPage] = useState<PageKey>("preview");
  const [showPinyin, setShowPinyin] = useState(true);
  const [showKorean, setShowKorean] = useState(false);

  // 서버 동기화 (마운트 시)
  useEffect(() => {
    const handler = () => {
      const next = loadLessons();
      setLessons(next);
      if (!next.find(l => l.id === selectedId)) {
        setSelectedId(next[0]?.id || "");
      }
    };
    window.addEventListener(SGR_HSK_EVENT, handler);
    syncFromServer().then(next => {
      setLessons(next);
      if (!next.find(l => l.id === selectedId)) setSelectedId(next[0]?.id || "");
    });
    return () => window.removeEventListener(SGR_HSK_EVENT, handler);
  }, [selectedId]);

  const grouped = useMemo(() => {
    const m = new Map<HSKLevel, HSKLesson[]>();
    for (const l of lessons) {
      const lvl = normalizeHSKLevel(l.hskLevel);
      if (!m.has(lvl)) m.set(lvl, []);
      m.get(lvl)!.push(l);
    }
    // 각 레벨 안에서 unitNumber 오름차순
    m.forEach(arr => arr.sort((a, b) => a.unitNumber.localeCompare(b.unitNumber, "ko", { numeric: true })));
    return m;
  }, [lessons]);

  const currentList = selectedLevel ? grouped.get(selectedLevel) || [] : [];
  const selected = useMemo(
    () => currentList.find(l => l.id === selectedId) || null,
    [currentList, selectedId]
  );

  // 레벨 미선택 시 → 급수 픽커
  if (!selectedLevel) {
    return <LevelPicker grouped={grouped} onPick={(lv) => {
      setSelectedLevel(lv);
      const first = (grouped.get(lv) || [])[0];
      setSelectedId(first?.id || "");
      setPage("preview");
    }} />;
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Top bar: 급수 · 레슨 선택 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setSelectedLevel(null)}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700"
        >← 급수 선택</button>
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${HSK_LEVEL_META[selectedLevel].color}`}>
          📚 {HSK_LEVEL_META[selectedLevel].label}
        </span>
        <div className="flex flex-wrap gap-1">
          {currentList.map(l => (
            <button
              key={l.id}
              onClick={() => { setSelectedId(l.id); setPage("preview"); }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                selectedId === l.id ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-700 border-gray-200 hover:border-red-300"
              }`}
            >Unit {l.unitNumber} · {l.titleKorean || l.title}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ToggleChip on={showPinyin} onChange={setShowPinyin} label="병음" />
          <ToggleChip on={showKorean} onChange={setShowKorean} label="한국어" />
        </div>
      </div>

      {!selected ? (
        <EmptyLesson level={selectedLevel} />
      ) : (
        <>
          {/* Hero */}
          <div className="rounded-xl p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="px-2 py-1 rounded-md bg-red-500 text-white text-xs font-black">Unit {selected.unitNumber}</div>
              <div>
                <div className="text-2xl font-black text-gray-800 tracking-wide">{selected.title}</div>
                {selected.titlePinyin && <div className="text-xs text-gray-500 mt-0.5">{selected.titlePinyin}</div>}
                {selected.titleKorean && <div className="text-sm text-red-700 font-semibold">{selected.titleKorean}</div>}
              </div>
            </div>
            {selected.category && <div className="text-[11px] text-gray-500 mt-2">{selected.category}</div>}
          </div>

          {/* Page tabs */}
          <div className="flex flex-wrap border-b border-gray-200 mb-3 gap-1">
            {(Object.keys(PAGE_LABEL) as PageKey[]).map(k => (
              <button
                key={k}
                onClick={() => setPage(k)}
                className={`px-3 py-2 text-sm font-bold border-b-2 -mb-px transition-colors ${
                  page === k ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >{PAGE_LABEL[k]}</button>
            ))}
          </div>

          {/* Content */}
          {page === "preview" && <PreviewPage lesson={selected} />}
          {page === "vocab" && <VocabPage lesson={selected} showPinyin={showPinyin} showKorean={showKorean} />}
          {page === "passage" && <PassagePage lesson={selected} showPinyin={showPinyin} showKorean={showKorean} />}
          {page === "questions" && <QuestionsPage lesson={selected} />}
          {page === "direct" && <DirectReadingPage lesson={selected} showPinyin={showPinyin} showKorean={showKorean} />}
        </>
      )}
    </div>
  );
}

function ToggleChip({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
        on ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-500 border-gray-200 hover:border-red-300"
      }`}
    >{on ? "✓ " : ""}{label}</button>
  );
}

function LevelPicker({ grouped, onPick }: { grouped: Map<HSKLevel, HSKLesson[]>; onPick: (lv: HSKLevel) => void }) {
  const levels: HSKLevel[] = ["1", "2", "3", "4", "5", "6", "7-9"];
  return (
    <div className="p-6 sm:p-10">
      <div className="text-center mb-6">
        <div className="text-3xl font-black text-gray-800">SGR HSK</div>
        <div className="text-sm text-gray-500 mt-1">중국어 및 HSK 학습</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {levels.map(lv => {
          const meta = HSK_LEVEL_META[lv];
          const cnt = (grouped.get(lv) || []).length;
          return (
            <motion.button
              key={lv}
              onClick={() => onPick(lv)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`p-4 rounded-xl text-white text-left bg-gradient-to-br ${meta.color} shadow-md`}
            >
              <div className="text-xl font-black">{meta.label}</div>
              <div className="text-[11px] opacity-90 mt-1">{meta.description}</div>
              <div className="text-[10px] mt-2 opacity-80">{cnt} 개 레슨</div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyLesson({ level }: { level: HSKLevel }) {
  return (
    <div className="rounded-xl border border-dashed border-red-200 bg-red-50/60 p-10 text-center">
      <div className="text-4xl">📚</div>
      <div className="mt-2 font-bold text-red-700">{HSK_LEVEL_META[level].label} 에 등록된 레슨이 없습니다.</div>
      <div className="text-xs text-gray-500 mt-1">LMS → SGR HSK 에서 CSV 를 업로드하거나 새 레슨을 만들어보세요.</div>
    </div>
  );
}

function PreviewPage({ lesson }: { lesson: HSKLesson }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 bg-white border border-gray-200">
        <div className="text-xs font-bold text-red-600 mb-1">학습 목표</div>
        <div className="text-sm text-gray-800">{lesson.previewQuestion || "—"}</div>
      </div>
      {lesson.previewCards.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-3">
          {lesson.previewCards.map(c => (
            <div key={c.id} className="rounded-lg border border-red-100 bg-red-50/50 p-3 text-sm font-semibold text-gray-800">
              {c.caption}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VocabPage({ lesson, showPinyin, showKorean }: { lesson: HSKLesson; showPinyin: boolean; showKorean: boolean }) {
  if (lesson.vocab.length === 0) return <div className="text-sm text-gray-500">어휘가 없습니다.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600">
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">한자</th>
            {showPinyin && <th className="p-2 text-left">병음</th>}
            <th className="p-2 text-left">품사</th>
            {showKorean && <th className="p-2 text-left">뜻</th>}
            <th className="p-2 text-left">예문</th>
          </tr>
        </thead>
        <tbody>
          {lesson.vocab.map((v, i) => (
            <tr key={v.id} className="border-t border-gray-100 hover:bg-red-50/40">
              <td className="p-2 text-xs text-gray-400">{i + 1}</td>
              <td className="p-2 text-lg font-black text-red-700">{v.hanzi}</td>
              {showPinyin && <td className="p-2 text-xs text-gray-600">{v.pinyin}</td>}
              <td className="p-2 text-xs text-gray-500">{v.partOfSpeech || ""}</td>
              {showKorean && <td className="p-2 text-gray-800">{v.meaning}</td>}
              <td className="p-2 text-xs text-gray-600">
                {v.example ? (
                  <div className="space-y-0.5">
                    <div className="text-red-700">{v.example}</div>
                    {showPinyin && v.examplePinyin && <div className="text-gray-500">{v.examplePinyin}</div>}
                    {showKorean && v.exampleKorean && <div className="text-gray-700">{v.exampleKorean}</div>}
                  </div>
                ) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PassagePage({ lesson, showPinyin, showKorean }: { lesson: HSKLesson; showPinyin: boolean; showKorean: boolean }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-2xl font-black text-gray-800 tracking-wide">{lesson.passageTitle || lesson.title}</div>
        {showPinyin && lesson.passageTitlePinyin && <div className="text-xs text-gray-500">{lesson.passageTitlePinyin}</div>}
        {showKorean && lesson.passageTitleKorean && <div className="text-sm text-red-700 font-semibold">{lesson.passageTitleKorean}</div>}
      </div>
      {lesson.passageParagraphs.map((p, i) => (
        <div key={p.id} className="rounded-xl bg-white border border-gray-100 p-4">
          <div className="text-[11px] text-gray-400 mb-1">단락 {i + 1}</div>
          <div className="text-base text-gray-900 leading-relaxed">{p.hanzi}</div>
          {showPinyin && <div className="text-xs text-gray-500 mt-1 leading-relaxed">{p.pinyin}</div>}
          {showKorean && <div className="text-sm text-red-700 mt-2 leading-relaxed">{p.korean}</div>}
        </div>
      ))}
    </div>
  );
}

function QuestionsPage({ lesson }: { lesson: HSKLesson }) {
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const toggle = (id: string) => setReveal(r => ({ ...r, [id]: !r[id] }));

  if (lesson.questions.length === 0) return <div className="text-sm text-gray-500">문제가 없습니다.</div>;

  return (
    <div className="space-y-4">
      {lesson.questions.map((q, i) => {
        const show = !!reveal[q.id];
        return (
          <div key={q.id} className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] text-red-600 font-bold uppercase tracking-wide">
                  {qTypeLabel(q.type)} · Q{i + 1}
                </div>
                <div className="text-sm text-gray-800 mt-1 font-semibold">{q.question}</div>
                {q.questionPinyin && <div className="text-[11px] text-gray-500">{q.questionPinyin}</div>}
              </div>
              <button
                onClick={() => toggle(q.id)}
                className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 font-semibold"
              >{show ? "정답 숨김" : "정답 보기"}</button>
            </div>

            {(q.type === "multiple_choice" || q.type === "tone_pick") && q.options && (
              <div className="mt-2 grid gap-1">
                {q.options.map((op, oi) => (
                  <div
                    key={oi}
                    className={`text-sm px-3 py-2 rounded-md border ${
                      show && oi === Number(q.answer) ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold" : "bg-white border-gray-200 text-gray-700"
                    }`}
                  >
                    <span className="text-xs text-gray-400 mr-2">{"ABCD"[oi] || oi + 1}</span>{op}
                  </div>
                ))}
              </div>
            )}
            {(q.type === "fill_blank" || q.type === "translation_zh_ko" || q.type === "translation_ko_zh") && (
              <div className="mt-2 flex flex-col gap-2">
                <input
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                  placeholder="답 입력..."
                  value={inputs[q.id] || ""}
                  onChange={e => setInputs(x => ({ ...x, [q.id]: e.target.value }))}
                />
                {show && <div className="text-sm text-emerald-700 font-bold">정답: {String(q.answer)}</div>}
              </div>
            )}
            {show && q.explanation && (
              <div className="mt-2 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded p-2">{q.explanation}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function qTypeLabel(t: string): string {
  switch (t) {
    case "multiple_choice": return "객관식";
    case "fill_blank":      return "빈칸 채우기";
    case "translation_zh_ko": return "중→한 번역";
    case "translation_ko_zh": return "한→중 번역";
    case "pinyin_match":    return "병음 매칭";
    case "tone_pick":       return "성조 고르기";
    default: return t;
  }
}

function DirectReadingPage({ lesson, showPinyin, showKorean }: { lesson: HSKLesson; showPinyin: boolean; showKorean: boolean }) {
  if (lesson.directReading.length === 0) return <div className="text-sm text-gray-500">직독직해 항목이 없습니다.</div>;
  return (
    <div className="space-y-3">
      {lesson.directReading.map((d, i) => {
        const chunks = d.chunks && d.chunks.length > 0 ? d.chunks : d.hanzi.split("/").map(s => s.trim());
        return (
          <div key={d.id} className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="text-[11px] text-red-600 font-bold uppercase tracking-wide">문장 {i + 1}</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              {chunks.map((c, ci) => (
                <span key={ci} className="text-base text-gray-900 border-b-2 border-dashed border-red-200">{c}</span>
              ))}
            </div>
            {showPinyin && <div className="text-xs text-gray-500 mt-1">{d.pinyin}</div>}
            {showKorean && <div className="text-sm text-red-700 mt-2">{d.korean}</div>}
            {d.grammarPoint && <div className="text-[11px] text-gray-600 bg-yellow-50 border border-yellow-100 rounded p-2 mt-2">💡 {d.grammarPoint}</div>}
          </div>
        );
      })}
    </div>
  );
}
