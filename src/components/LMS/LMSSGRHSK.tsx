// LMS SGR HSK — 중국어(HSK) 레슨 관리 CMS
// SGR Class LMS 와 달리 마운트 시 syncFromServer() 를 호출해
// 서버 데이터로 로컬을 갱신 후 편집한다. 저장은 서버 API 가 upsert-by-id 이므로
// 다른 클라이언트의 레슨을 실수로 삭제하지 않는다.

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload, Trash2, Plus, Save, FileText } from "lucide-react";
import {
  loadLessons,
  saveLessons,
  syncFromServer,
  deleteLesson,
  emptyLesson,
  emptyVocab,
  emptyPassageParagraph,
  emptyDirectReading,
  emptyQuestion,
  HSK_LEVEL_META,
  normalizeHSKLevel,
  type HSKLesson,
  type HSKLevel,
  type HSKQuestionType,
} from "../SGRHSK/types";
import { parseBulkCsv, lessonsToCsv } from "../SGRHSK/csvUtils";
import "../../utils/sgrHskApi"; // 서버 연동 함수 등록

const LEVELS: HSKLevel[] = ["1", "2", "3", "4", "5", "6", "7-9"];

export default function LMSSGRHSK() {
  const [lessons, setLessons] = useState<HSKLesson[]>(loadLessons);
  const [selectedId, setSelectedId] = useState<string>(lessons[0]?.id || "");
  const [levelFilter, setLevelFilter] = useState<HSKLevel | "all">("all");
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const bulkCsvInputRef = useRef<HTMLInputElement>(null);

  // 마운트 시 서버 데이터로 로컬 병합 → 데이터 유실 방지
  useEffect(() => {
    syncFromServer().then(serverLessons => {
      setLessons(serverLessons);
      if (!serverLessons.find(l => l.id === selectedId)) {
        setSelectedId(serverLessons[0]?.id || "");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(() => lessons.find(l => l.id === selectedId) || null, [lessons, selectedId]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return lessons.filter(l => {
      if (levelFilter !== "all" && normalizeHSKLevel(l.hskLevel) !== levelFilter) return false;
      if (!s) return true;
      return (
        (l.title || "").toLowerCase().includes(s) ||
        (l.titleKorean || "").toLowerCase().includes(s) ||
        (l.titlePinyin || "").toLowerCase().includes(s) ||
        l.unitNumber.includes(s)
      );
    });
  }, [lessons, search, levelFilter]);

  const levelCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of lessons) {
      const lv = normalizeHSKLevel(l.hskLevel);
      map[lv] = (map[lv] || 0) + 1;
    }
    return map;
  }, [lessons]);

  const patch = (p: Partial<HSKLesson>) => {
    if (!selected) return;
    setLessons(prev => prev.map(l => (l.id === selected.id ? { ...l, ...p, updatedAt: Date.now() } : l)));
    setDirty(true);
  };

  const handleSave = () => {
    saveLessons(lessons);
    setDirty(false);
    toast.success("SGR HSK 자료가 저장되었습니다.");
  };

  const handleNew = () => {
    const nl = { ...emptyLesson(), hskLevel: (levelFilter !== "all" ? levelFilter : "3") as HSKLevel };
    setLessons(prev => [nl, ...prev]);
    setSelectedId(nl.id);
    setDirty(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 레슨을 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;
    setLessons(prev => prev.filter(l => l.id !== id));
    if (selectedId === id) setSelectedId("");
    try {
      await deleteLesson(id);
      toast.success("삭제되었습니다.");
    } catch (e) {
      toast.error("서버 삭제 실패 (로컬만 제거됨)");
    }
  };

  const handleBulkCsvUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    let added = 0;
    const acc: HSKLesson[] = [];
    for (const f of Array.from(files)) {
      const text = await f.text();
      const parsed = parseBulkCsv(text);
      // 파일에 hskLevel 지정이 없으면 현재 필터를 기본값으로 태깅
      const tagged = parsed.map(l => ({
        ...l,
        hskLevel: l.hskLevel || (levelFilter !== "all" ? (levelFilter as HSKLevel) : "3"),
      }));
      acc.push(...tagged);
      added += tagged.length;
    }
    if (acc.length === 0) {
      toast.error("파싱된 레슨이 없습니다. CSV 헤더를 확인하세요.");
      return;
    }
    // 기존과 id 겹치면 교체, 아니면 추가
    setLessons(prev => {
      const map = new Map(prev.map(l => [l.id, l]));
      for (const l of acc) map.set(l.id, l);
      return Array.from(map.values());
    });
    setDirty(true);
    toast.success(`CSV 로부터 ${added}개 레슨을 병합했습니다.`);
  };

  const handleDownloadCsv = () => {
    const csv = lessonsToCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sgr_hsk_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-2">
      {/* Header */}
      <div className="flex items-center flex-wrap gap-2 mb-4">
        <div className="text-2xl font-black text-gray-800">📚 SGR HSK 관리</div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">중국어 · HSK</span>
        <div className="ml-auto flex gap-2 flex-wrap">
          <button onClick={handleNew} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 flex items-center gap-1">
            <Plus className="w-4 h-4" />새 레슨
          </button>
          <button onClick={() => bulkCsvInputRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 flex items-center gap-1">
            <Upload className="w-4 h-4" />CSV 대량 업로드
          </button>
          <input ref={bulkCsvInputRef} type="file" accept=".csv" multiple hidden onChange={e => handleBulkCsvUpload(e.target.files)} />
          <button onClick={handleDownloadCsv} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 flex items-center gap-1">
            <Download className="w-4 h-4" />CSV 내보내기
          </button>
          <button onClick={() => setShowHelp(v => !v)} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 flex items-center gap-1">
            <FileText className="w-4 h-4" />{showHelp ? "도움말 숨김" : "CSV 도움말"}
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 ${dirty ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            <Save className="w-4 h-4" />저장{dirty ? " *" : ""}
          </button>
        </div>
      </div>

      {showHelp && <CsvHelp />}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <button
          onClick={() => setLevelFilter("all")}
          className={`px-3 py-1 rounded-full text-xs font-bold border ${levelFilter === "all" ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-700 border-gray-200 hover:border-red-300"}`}
        >전체 · {lessons.length}</button>
        {LEVELS.map(lv => (
          <button
            key={lv}
            onClick={() => setLevelFilter(lv)}
            className={`px-3 py-1 rounded-full text-xs font-bold border ${levelFilter === lv ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-700 border-gray-200 hover:border-red-300"}`}
          >{HSK_LEVEL_META[lv].label} · {levelCounts[lv] || 0}</button>
        ))}
        <input
          className="ml-auto border border-gray-200 rounded-md px-3 py-1 text-sm"
          placeholder="레슨 검색 (제목·한국어·병음·번호)"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Lesson list */}
        <aside className="col-span-4 lg:col-span-3 space-y-1 max-h-[70vh] overflow-y-auto">
          {filtered.length === 0 && <div className="text-xs text-gray-400 p-3">레슨이 없습니다.</div>}
          {filtered.map(l => {
            const meta = HSK_LEVEL_META[normalizeHSKLevel(l.hskLevel)];
            return (
              <button
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                className={`w-full text-left rounded-lg border p-2 ${selectedId === l.id ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300 bg-white"}`}
              >
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md text-white font-bold bg-gradient-to-r ${meta.color}`}>{meta.label}</span>
                  <span className="text-[10px] text-gray-500">Unit {l.unitNumber}</span>
                </div>
                <div className="mt-1 text-sm font-bold text-gray-800 truncate">{l.title || "(제목 없음)"}</div>
                {l.titleKorean && <div className="text-[11px] text-gray-500 truncate">{l.titleKorean}</div>}
              </button>
            );
          })}
        </aside>

        {/* Editor */}
        <section className="col-span-8 lg:col-span-9">
          {!selected ? (
            <div className="text-sm text-gray-500 p-10 text-center bg-gray-50 rounded-lg">왼쪽에서 레슨을 선택하거나 새로 만들어주세요.</div>
          ) : (
            <Editor lesson={selected} patch={patch} onDelete={() => handleDelete(selected.id)} />
          )}
        </section>
      </div>
    </div>
  );
}

function CsvHelp() {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-4 mb-4 text-xs text-gray-700 space-y-2">
      <div className="font-bold text-red-700 text-sm">CSV 대량 업로드 스키마</div>
      <div>컬럼: <code className="bg-white px-1 rounded">section, key, value1, value2, value3, value4</code></div>
      <div>여러 레슨은 <code className="bg-white px-1 rounded">LESSON_BREAK,,,,,</code> 로 구분.</div>
      <div className="mt-1">주요 섹션:</div>
      <ul className="list-disc pl-4 space-y-0.5">
        <li><b>META</b> — key: hskLevel(1~6, 7-9)·unitNumber·title·titlePinyin·titleKorean·category·previewQuestion·passageTitle·passageTitlePinyin·passageTitleKorean</li>
        <li><b>PREVIEW_CARD</b> — value1: caption</li>
        <li><b>VOCAB</b> — value1: 한자, value2: 병음, value3: 뜻(한국어), value4: 품사</li>
        <li><b>VOCAB_EXAMPLE</b> — key: 대상 한자 또는 index, value1: 예문 한자, value2: 병음, value3: 한국어</li>
        <li><b>PASSAGE</b> — value1: 한자 문단, value2: 병음, value3: 한국어</li>
        <li><b>QUESTION_MCQ</b>/<b>QUESTION_TONE</b> — key: 문제, value1~4: 보기 4개, 다음 행 <b>QUESTION_ANSWER</b> 에 정답 index(0..3)</li>
        <li><b>QUESTION_FILL</b>/<b>QUESTION_TRANSZK</b>/<b>QUESTION_TRANSKZ</b> — key: 문제, value1: 정답</li>
        <li><b>QUESTION_EXPLAIN</b> — key: 해설(한국어). 바로 앞 QUESTION 에 부착.</li>
        <li><b>DIRECT_READING</b> — value1: 한자(<code>/</code> 로 청크 구분), value2: 병음, value3: 한국어, value4: 문법포인트</li>
      </ul>
    </div>
  );
}

function Editor({ lesson, patch, onDelete }: { lesson: HSKLesson; patch: (p: Partial<HSKLesson>) => void; onDelete: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="text-lg font-bold text-gray-800">✏️ Lesson 편집</div>
        <button onClick={onDelete} className="ml-auto text-xs text-red-600 hover:bg-red-50 rounded px-2 py-1 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" />삭제</button>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Field label="HSK 급수">
          <select
            className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm"
            value={lesson.hskLevel}
            onChange={e => patch({ hskLevel: e.target.value as HSKLevel })}
          >
            {LEVELS.map(lv => <option key={lv} value={lv}>{HSK_LEVEL_META[lv].label}</option>)}
          </select>
        </Field>
        <Field label="단원 번호">
          <input className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm" value={lesson.unitNumber} onChange={e => patch({ unitNumber: e.target.value })} />
        </Field>
        <Field label="분류">
          <input className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm" value={lesson.category || ""} onChange={e => patch({ category: e.target.value })} placeholder="예: HSK 3급 · 실전 독해" />
        </Field>
        <Field label="한자 제목">
          <input className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm" value={lesson.title} onChange={e => patch({ title: e.target.value })} />
        </Field>
        <Field label="병음 제목">
          <input className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm" value={lesson.titlePinyin || ""} onChange={e => patch({ titlePinyin: e.target.value })} />
        </Field>
        <Field label="한국어 제목">
          <input className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm" value={lesson.titleKorean || ""} onChange={e => patch({ titleKorean: e.target.value })} />
        </Field>
      </div>

      <Field label="워밍업 질문 (한국어)">
        <textarea rows={2} className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm" value={lesson.previewQuestion} onChange={e => patch({ previewQuestion: e.target.value })} />
      </Field>

      {/* Preview cards */}
      <Section title="Preview Cards">
        {lesson.previewCards.map((c, i) => (
          <Row key={c.id} onDelete={() => patch({ previewCards: lesson.previewCards.filter(x => x.id !== c.id) })}>
            <input className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-sm" value={c.caption} onChange={e => patch({ previewCards: lesson.previewCards.map(x => x.id === c.id ? { ...x, caption: e.target.value } : x) })} />
          </Row>
        ))}
        <AddButton onClick={() => patch({ previewCards: [...lesson.previewCards, { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, caption: "" }] })} label="+ 카드 추가" />
      </Section>

      {/* Passage */}
      <Section title="Passage 문단">
        <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-500 font-bold px-1">
          <div>한자</div><div>병음</div><div>한국어</div>
        </div>
        {lesson.passageParagraphs.map(p => (
          <Row key={p.id} onDelete={() => patch({ passageParagraphs: lesson.passageParagraphs.filter(x => x.id !== p.id) })}>
            <textarea rows={2} className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-sm" value={p.hanzi} onChange={e => patch({ passageParagraphs: lesson.passageParagraphs.map(x => x.id === p.id ? { ...x, hanzi: e.target.value } : x) })} />
            <textarea rows={2} className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-sm" value={p.pinyin} onChange={e => patch({ passageParagraphs: lesson.passageParagraphs.map(x => x.id === p.id ? { ...x, pinyin: e.target.value } : x) })} />
            <textarea rows={2} className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-sm" value={p.korean} onChange={e => patch({ passageParagraphs: lesson.passageParagraphs.map(x => x.id === p.id ? { ...x, korean: e.target.value } : x) })} />
          </Row>
        ))}
        <AddButton onClick={() => patch({ passageParagraphs: [...lesson.passageParagraphs, emptyPassageParagraph()] })} label="+ 문단 추가" />
      </Section>

      {/* Vocab */}
      <Section title="Vocabulary">
        <div className="grid grid-cols-[80px_120px_1fr_80px_auto] gap-2 text-[11px] text-gray-500 font-bold px-1">
          <div>한자</div><div>병음</div><div>뜻</div><div>품사</div><div></div>
        </div>
        {lesson.vocab.map(v => (
          <Row key={v.id} onDelete={() => patch({ vocab: lesson.vocab.filter(x => x.id !== v.id) })}>
            <input style={{ width: 80 }} className="border border-gray-200 rounded-md px-2 py-1 text-sm" value={v.hanzi} onChange={e => patch({ vocab: lesson.vocab.map(x => x.id === v.id ? { ...x, hanzi: e.target.value } : x) })} />
            <input style={{ width: 120 }} className="border border-gray-200 rounded-md px-2 py-1 text-sm" value={v.pinyin} onChange={e => patch({ vocab: lesson.vocab.map(x => x.id === v.id ? { ...x, pinyin: e.target.value } : x) })} />
            <input className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-sm" value={v.meaning} onChange={e => patch({ vocab: lesson.vocab.map(x => x.id === v.id ? { ...x, meaning: e.target.value } : x) })} />
            <input style={{ width: 80 }} className="border border-gray-200 rounded-md px-2 py-1 text-sm" value={v.partOfSpeech || ""} onChange={e => patch({ vocab: lesson.vocab.map(x => x.id === v.id ? { ...x, partOfSpeech: e.target.value } : x) })} />
          </Row>
        ))}
        <AddButton onClick={() => patch({ vocab: [...lesson.vocab, emptyVocab()] })} label="+ 어휘 추가" />
      </Section>

      {/* Questions */}
      <Section title="Questions">
        {lesson.questions.map(q => (
          <div key={q.id} className="border border-gray-200 rounded-lg p-2 mb-2 bg-white">
            <div className="flex items-center gap-2 mb-1">
              <select
                className="text-xs border border-gray-200 rounded-md px-1 py-0.5"
                value={q.type}
                onChange={e => patch({ questions: lesson.questions.map(x => x.id === q.id ? { ...x, type: e.target.value as HSKQuestionType } : x) })}
              >
                <option value="multiple_choice">객관식</option>
                <option value="fill_blank">빈칸</option>
                <option value="translation_zh_ko">중→한</option>
                <option value="translation_ko_zh">한→중</option>
                <option value="tone_pick">성조</option>
              </select>
              <button onClick={() => patch({ questions: lesson.questions.filter(x => x.id !== q.id) })} className="ml-auto text-[11px] text-red-600 hover:bg-red-50 rounded px-2 py-0.5">삭제</button>
            </div>
            <textarea rows={2} className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm mb-1" placeholder="문제" value={q.question} onChange={e => patch({ questions: lesson.questions.map(x => x.id === q.id ? { ...x, question: e.target.value } : x) })} />
            {(q.type === "multiple_choice" || q.type === "tone_pick") && (
              <div className="grid gap-1 mb-1">
                {(q.options || ["", "", "", ""]).map((op, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500 w-4">{"ABCD"[oi] || oi + 1}</span>
                    <input className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-sm" value={op} onChange={e => {
                      const opts = [...(q.options || ["", "", "", ""])];
                      opts[oi] = e.target.value;
                      patch({ questions: lesson.questions.map(x => x.id === q.id ? { ...x, options: opts } : x) });
                    }} />
                    <label className="text-[11px] text-gray-500 flex items-center gap-1">
                      <input type="radio" checked={Number(q.answer) === oi} onChange={() => patch({ questions: lesson.questions.map(x => x.id === q.id ? { ...x, answer: oi } : x) })} />정답
                    </label>
                  </div>
                ))}
              </div>
            )}
            {(q.type === "fill_blank" || q.type === "translation_zh_ko" || q.type === "translation_ko_zh") && (
              <input className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm mb-1" placeholder="정답" value={String(q.answer || "")} onChange={e => patch({ questions: lesson.questions.map(x => x.id === q.id ? { ...x, answer: e.target.value } : x) })} />
            )}
            <textarea rows={1} className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-600" placeholder="해설 (선택)" value={q.explanation || ""} onChange={e => patch({ questions: lesson.questions.map(x => x.id === q.id ? { ...x, explanation: e.target.value } : x) })} />
          </div>
        ))}
        <AddButton onClick={() => patch({ questions: [...lesson.questions, emptyQuestion()] })} label="+ 문제 추가" />
      </Section>

      {/* Direct reading */}
      <Section title="직독직해">
        <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-500 font-bold px-1">
          <div>한자 (/ 로 청크 구분)</div><div>병음</div><div>한국어</div>
        </div>
        {lesson.directReading.map(d => (
          <Row key={d.id} onDelete={() => patch({ directReading: lesson.directReading.filter(x => x.id !== d.id) })}>
            <textarea rows={2} className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-sm" value={d.hanzi} onChange={e => patch({ directReading: lesson.directReading.map(x => x.id === d.id ? { ...x, hanzi: e.target.value } : x) })} />
            <textarea rows={2} className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-sm" value={d.pinyin} onChange={e => patch({ directReading: lesson.directReading.map(x => x.id === d.id ? { ...x, pinyin: e.target.value } : x) })} />
            <textarea rows={2} className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-sm" value={d.korean} onChange={e => patch({ directReading: lesson.directReading.map(x => x.id === d.id ? { ...x, korean: e.target.value } : x) })} />
          </Row>
        ))}
        <AddButton onClick={() => patch({ directReading: [...lesson.directReading, emptyDirectReading()] })} label="+ 문장 추가" />
      </Section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] text-gray-500 font-bold mb-1">{label}</div>
      {children}
    </label>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/40 p-3">
      <div className="text-sm font-bold text-gray-700 mb-2">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function Row({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <div className="flex items-start gap-2">
      {children}
      <button onClick={onDelete} className="text-red-500 hover:bg-red-50 rounded p-1"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}
function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return <button onClick={onClick} className="mt-1 text-xs text-red-600 font-bold hover:bg-red-50 rounded px-2 py-1">{label}</button>;
}
