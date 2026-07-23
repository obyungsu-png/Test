import { useState, useMemo, useRef } from "react";
import {
  BookOpen, Plus, Trash2, Save, Upload, Copy,
  FileText, Layers, AlertCircle, ListChecks, PenLine, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { SGRVocaLesson } from "../SGRVoca/types";
import {
  loadVocaLessons, saveVocaLessons, emptyVocaLesson,
  emptyVocaWord, emptyVocaMcq, emptyVocaFillBlank, emptyVocaPassageQuestion,
  uid, SAMPLE_VOCA_LESSON,
} from "../SGRVoca/types";
import {
  parseCsvToVocaLesson, parseCsvToVocaLessons,
  vocaLessonToCsv, getVocaCsvTemplate,
} from "../SGRVoca/csvUtils";
import { downloadSGRVocaPdf } from "../SGRVoca/pdfUtils";

type SubTab = "overview" | "wordlist" | "exerciseA" | "exerciseB" | "exerciseC" | "reading";

const SUB_TABS: Array<{ id: SubTab; label: string; icon: any }> = [
  { id: "overview", label: "개요", icon: BookOpen },
  { id: "wordlist", label: "1. Word List", icon: Sparkles },
  { id: "exerciseA", label: "2. Exercise A", icon: ListChecks },
  { id: "exerciseB", label: "3. Exercise B", icon: ListChecks },
  { id: "exerciseC", label: "4. Exercise C", icon: PenLine },
  { id: "reading", label: "5. Reading", icon: FileText },
];

function Field({
  label, value, onChange, placeholder, textarea, rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-bold text-gray-600 mb-1">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows || 3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      )}
    </label>
  );
}

function IconBtn({
  onClick, title, danger, children,
}: {
  onClick: () => void; title?: string; danger?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-500 hover:text-rose-600 hover:bg-rose-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function LMSSGRVoca() {
  const [lessons, setLessons] = useState<SGRVocaLesson[]>(loadVocaLessons);
  const [selectedId, setSelectedId] = useState<string>(lessons[0]?.id || "");
  const [subTab, setSubTab] = useState<SubTab>("overview");
  const [dirty, setDirty] = useState(false);
  const [search, setSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCsvHelp, setShowCsvHelp] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const bulkCsvInputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => lessons.find(l => l.id === selectedId) || null,
    [lessons, selectedId]
  );

  const filteredLessons = useMemo(() => {
    if (!search.trim()) return lessons;
    const s = search.toLowerCase();
    return lessons.filter(l =>
      l.title.toLowerCase().includes(s) ||
      l.unitNumber.includes(s) ||
      (l.category || "").toLowerCase().includes(s)
    );
  }, [lessons, search]);

  const patchSelected = (patch: Partial<SGRVocaLesson>) => {
    if (!selected) return;
    setLessons(prev => prev.map(l =>
      l.id === selected.id ? { ...l, ...patch, updatedAt: Date.now() } : l
    ));
    setDirty(true);
  };

  const handleSave = () => {
    saveVocaLessons(lessons);
    setDirty(false);
    toast.success("SGR Voca 자료가 저장되었습니다.");
  };

  const handleNew = () => {
    const nl = emptyVocaLesson();
    setLessons(prev => [nl, ...prev]);
    setSelectedId(nl.id);
    setSubTab("overview");
    setDirty(true);
  };

  const handleDuplicate = (id: string) => {
    const src = lessons.find(l => l.id === id);
    if (!src) return;
    const dup: SGRVocaLesson = {
      ...JSON.parse(JSON.stringify(src)),
      id: uid(),
      title: src.title + " (복사본)",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setLessons(prev => [dup, ...prev]);
    setSelectedId(dup.id);
    setDirty(true);
    toast.success("복제되었습니다.");
  };

  const handleDelete = (id: string) => {
    setLessons(prev => {
      const next = prev.filter(l => l.id !== id);
      if (id === selectedId) setSelectedId(next[0]?.id || "");
      return next;
    });
    setShowDeleteConfirm(null);
    setDirty(true);
  };

  const handleLoadSample = () => {
    const s: SGRVocaLesson = { ...JSON.parse(JSON.stringify(SAMPLE_VOCA_LESSON)), id: uid(), createdAt: Date.now(), updatedAt: Date.now() };
    setLessons(prev => [s, ...prev]);
    setSelectedId(s.id);
    setDirty(true);
    toast.success("샘플 레슨을 불러왔습니다.");
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lesson = parseCsvToVocaLesson(text);
      setLessons(prev => [lesson, ...prev]);
      setSelectedId(lesson.id);
      setSubTab("overview");
      setDirty(true);
      toast.success(`CSV 업로드 완료: ${lesson.title}`);
    } catch (err) {
      console.error(err);
      toast.error("CSV 파싱에 실패했습니다. 형식을 확인해주세요.");
    } finally {
      if (csvInputRef.current) csvInputRef.current.value = "";
    }
  };

  const handleBulkCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const newLessons = parseCsvToVocaLessons(text);
      if (newLessons.length === 0) {
        toast.error("파싱된 레슨이 없습니다. META,title 행을 확인하세요.");
        return;
      }
      setLessons(prev => [...newLessons, ...prev]);
      setSelectedId(newLessons[0].id);
      setSubTab("overview");
      setDirty(true);
      toast.success(`${newLessons.length}개 레슨 대량 업로드 완료`);
    } catch (err) {
      console.error(err);
      toast.error("대량 CSV 파싱에 실패했습니다. 형식을 확인해주세요.");
    } finally {
      if (bulkCsvInputRef.current) bulkCsvInputRef.current.value = "";
    }
  };

  const handleCsvExport = () => {
    if (!selected) return;
    const csv = vocaLessonToCsv(selected);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sgr-voca-${selected.unitNumber}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTemplateDownload = () => {
    const csv = getVocaCsvTemplate();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sgr-voca-template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV 템플릿을 다운로드했습니다.");
  };

  // MCQ 편집기 (A/B 공용)
  const renderMcqEditor = (
    list: SGRVocaLesson["definitionQuestions"],
    key: "definitionQuestions" | "antonymQuestions",
    promptLabel: string,
  ) => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-600">선택지는 보통 4개입니다. 정답 번호(0부터 시작)를 지정하세요.</p>
        <button
          onClick={() => patchSelected({ [key]: [...list, emptyVocaMcq()] } as any)}
          className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700"
        >
          <Plus className="w-4 h-4" /> 문제 추가
        </button>
      </div>
      <div className="space-y-4">
        {list.map((q, i) => (
          <div key={q.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-rose-600">문제 {i + 1}</span>
              <IconBtn onClick={() => patchSelected({ [key]: list.filter(x => x.id !== q.id) } as any)} danger title="삭제">
                <Trash2 className="w-4 h-4" />
              </IconBtn>
            </div>
            <Field
              label={promptLabel}
              value={q.prompt}
              onChange={v => patchSelected({ [key]: list.map(x => x.id === q.id ? { ...x, prompt: v } : x) } as any)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              {q.options.map((opt, oi) => (
                <Field
                  key={oi}
                  label={`선택지 ${String.fromCharCode(97 + oi)}${oi === q.answer ? " (정답)" : ""}`}
                  value={opt}
                  onChange={v => patchSelected({
                    [key]: list.map(x => x.id === q.id
                      ? { ...x, options: x.options.map((o, j) => j === oi ? v : o) }
                      : x),
                  } as any)}
                />
              ))}
            </div>
            <label className="block">
              <span className="block text-xs font-bold text-gray-600 mb-1">정답 번호 (0 = a, 1 = b, 2 = c, 3 = d)</span>
              <select
                value={q.answer}
                onChange={e => patchSelected({ [key]: list.map(x => x.id === q.id ? { ...x, answer: parseInt(e.target.value, 10) } : x) } as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {q.options.map((_, oi) => (
                  <option key={oi} value={oi}>{oi} ({String.fromCharCode(97 + oi)})</option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-rose-600" />
            SGR Voca 관리
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            영영 단어 학습지를 만들고 관리합니다. (CSV 대량 업로드 지원)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleTemplateDownload}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <FileText className="w-4 h-4" /> CSV 템플릿
          </button>
          <button
            onClick={() => csvInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50"
          >
            <Upload className="w-4 h-4" /> CSV 1개
          </button>
          <input ref={csvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvUpload} />
          <button
            onClick={() => bulkCsvInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-bold"
          >
            <Layers className="w-4 h-4" /> 대량 CSV
          </button>
          <input ref={bulkCsvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleBulkCsvUpload} />
          <button
            onClick={() => setShowCsvHelp(true)}
            className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
            title="업로드 형식 안내"
          >
            <AlertCircle className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg ${
              dirty
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Save className="w-4 h-4" /> {dirty ? "저장" : "저장됨"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Lesson list */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 h-fit sticky top-4">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handleNew}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700"
            >
              <Plus className="w-4 h-4" /> 새 레슨
            </button>
            <button
              onClick={handleLoadSample}
              className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
              title="샘플 불러오기"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색..."
            className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {filteredLessons.map(l => (
              <div
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                className={`p-2.5 rounded-lg cursor-pointer border transition-colors ${
                  l.id === selectedId
                    ? "bg-rose-50 border-rose-300"
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-800 truncate">
                      Unit {l.unitNumber} · {l.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      단어 {l.words.length}개 · 문제 {l.definitionQuestions.length + l.antonymQuestions.length + l.fillBlanks.length}개
                    </div>
                  </div>
                  <div className="flex items-center shrink-0">
                    <IconBtn onClick={() => handleDuplicate(l.id)} title="복제">
                      <Copy className="w-3.5 h-3.5" />
                    </IconBtn>
                    <IconBtn onClick={() => setShowDeleteConfirm(l.id)} title="삭제" danger>
                      <Trash2 className="w-3.5 h-3.5" />
                    </IconBtn>
                  </div>
                </div>
              </div>
            ))}
            {filteredLessons.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">레슨이 없습니다.</p>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {!selected ? (
            <div className="py-20 text-center text-gray-400">
              왼쪽에서 레슨을 선택하거나 새 레슨을 만드세요.
            </div>
          ) : (
            <>
              {/* Sub tabs */}
              <div className="flex items-center gap-1 mb-5 border-b border-gray-200 overflow-x-auto">
                {SUB_TABS.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSubTab(t.id)}
                      className={`shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition-colors border-b-2 -mb-px ${
                        subTab === t.id
                          ? "border-rose-600 text-rose-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  );
                })}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={handleCsvExport}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <Upload className="w-3.5 h-3.5 rotate-180" /> CSV 납���기
                  </button>
                  <button
                    onClick={() => downloadSGRVocaPdf(selected, "question")}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <FileText className="w-3.5 h-3.5" /> PDF 미리보기
                  </button>
                </div>
              </div>

              {/* 개요 */}
              {subTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <Field label="레슨 제목" value={selected.title} onChange={v => patchSelected({ title: v })} placeholder="Unit 18 Word List" />
                  <Field label="Unit 번호" value={selected.unitNumber} onChange={v => patchSelected({ unitNumber: v })} placeholder="18" />
                  <Field label="지문 제목" value={selected.passageTitle} onChange={v => patchSelected({ passageTitle: v })} placeholder="Eat Healthy!" />
                  <Field label="카테고리" value={selected.category || ""} onChange={v => patchSelected({ category: v })} />
                </div>
              )}

              {/* Word List */}
              {subTab === "wordlist" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-600">영영 풀이 단어 목록입니다. (단어 + 발음 + 품사 + 정의 + 예문)</p>
                    <button
                      onClick={() => patchSelected({ words: [...selected.words, emptyVocaWord()] })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700"
                    >
                      <Plus className="w-4 h-4" /> 단어 추가
                    </button>
                  </div>
                  <div className="space-y-4">
                    {selected.words.map((w, i) => (
                      <div key={w.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-rose-600">단어 {i + 1}</span>
                          <IconBtn onClick={() => patchSelected({ words: selected.words.filter(x => x.id !== w.id) })} danger title="삭제">
                            <Trash2 className="w-4 h-4" />
                          </IconBtn>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                          <Field label="단어" value={w.word} onChange={v => patchSelected({ words: selected.words.map(x => x.id === w.id ? { ...x, word: v } : x) })} placeholder="always" />
                          <Field label="발음기호" value={w.pronunciation} onChange={v => patchSelected({ words: selected.words.map(x => x.id === w.id ? { ...x, pronunciation: v } : x) })} placeholder="ɔ:lwéiz" />
                          <Field label="품사" value={w.partOfSpeech} onChange={v => patchSelected({ words: selected.words.map(x => x.id === w.id ? { ...x, partOfSpeech: v } : x) })} placeholder="adv." />
                        </div>
                        <Field label="영영 정의" value={w.definition} onChange={v => patchSelected({ words: selected.words.map(x => x.id === w.id ? { ...x, definition: v } : x) })} placeholder="Always means that something happens all the time." />
                        <Field label="예문" value={w.example} onChange={v => patchSelected({ words: selected.words.map(x => x.id === w.id ? { ...x, example: v } : x) })} placeholder="They always brush their teeth in the morning." />
                        <Field label="이미지 URL (선택)" value={w.imageUrl || ""} onChange={v => patchSelected({ words: selected.words.map(x => x.id === w.id ? { ...x, imageUrl: v } : x) })} placeholder="https://..." />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercise A */}
              {subTab === "exerciseA" && renderMcqEditor(selected.definitionQuestions, "definitionQuestions", "정의 (예: a clear liquid)")}

              {/* Exercise B */}
              {subTab === "exerciseB" && renderMcqEditor(selected.antonymQuestions, "antonymQuestions", "대상 단어 (예: disgusting)")}

              {/* Exercise C */}
              {subTab === "exerciseC" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-600">
                      밑줄(__양쪽에 언더스코어 2개__) 친 부분과 비슷한 뜻의 단어를 쓰는 문제입니다. 힌트는 글자 수만큼 _ 와 보여줄 글자로 작성하세요.
                    </p>
                    <button
                      onClick={() => patchSelected({ fillBlanks: [...selected.fillBlanks, emptyVocaFillBlank()] })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700"
                    >
                      <Plus className="w-4 h-4" /> 문제 추가
                    </button>
                  </div>
                  <div className="space-y-4">
                    {selected.fillBlanks.map((fb, i) => (
                      <div key={fb.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-rose-600">문제 {i + 1}</span>
                          <IconBtn onClick={() => patchSelected({ fillBlanks: selected.fillBlanks.filter(x => x.id !== fb.id) })} danger title="삭제">
                            <Trash2 className="w-4 h-4" />
                          </IconBtn>
                        </div>
                        <Field
                          label="문장 (밑줄 부분은 __로 감싸기)"
                          value={fb.sentence}
                          onChange={v => patchSelected({ fillBlanks: selected.fillBlanks.map(x => x.id === fb.id ? { ...x, sentence: v } : x) })}
                          placeholder="They grow __orange vegetables__ in their garden."
                          textarea rows={2}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                          <Field
                            label="글자 힌트"
                            value={fb.hint}
                            onChange={v => patchSelected({ fillBlanks: selected.fillBlanks.map(x => x.id === fb.id ? { ...x, hint: v } : x) })}
                            placeholder="__r__t_"
                          />
                          <Field
                            label="정답"
                            value={fb.answer}
                            onChange={v => patchSelected({ fillBlanks: selected.fillBlanks.map(x => x.id === fb.id ? { ...x, answer: v } : x) })}
                            placeholder="carrots"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reading */}
              {subTab === "reading" && (
                <div>
                  <Field
                    label="지문 제목"
                    value={selected.passage.title}
                    onChange={v => patchSelected({ passage: { ...selected.passage, title: v } })}
                    placeholder="Eat Healthy!"
                  />
                  <Field
                    label="지문 내용 (**단어** 로 타겟 단어 강조, 문단은 빈 줄로 구분)"
                    value={selected.passage.content}
                    onChange={v => patchSelected({ passage: { ...selected.passage, content: v } })}
                    textarea rows={10}
                  />
                  <div className="flex items-center justify-between mt-6 mb-3">
                    <p className="text-sm font-bold text-gray-700">Reading Comprehension 문제</p>
                    <button
                      onClick={() => patchSelected({ passage: { ...selected.passage, questions: [...selected.passage.questions, emptyVocaPassageQuestion()] } })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700"
                    >
                      <Plus className="w-4 h-4" /> 문제 추가
                    </button>
                  </div>
                  <div className="space-y-4">
                    {selected.passage.questions.map((q, i) => {
                      const isMcq = q.options.length > 0;
                      return (
                        <div key={q.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-rose-600">문제 {i + 1} {isMcq ? "(객관식)" : "(단답형)"}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => patchSelected({
                                  passage: {
                                    ...selected.passage,
                                    questions: selected.passage.questions.map(x =>
                                      x.id === q.id
                                        ? { ...x, options: isMcq ? [] : ["", "", "", ""], answer: isMcq ? "" : 0 }
                                        : x
                                    ),
                                  },
                                })}
                                className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                              >
                                {isMcq ? "단답형으로" : "객관식으로"}
                              </button>
                              <IconBtn
                                onClick={() => patchSelected({ passage: { ...selected.passage, questions: selected.passage.questions.filter(x => x.id !== q.id) } })}
                                danger title="삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </IconBtn>
                            </div>
                          </div>
                          <Field
                            label="문제"
                            value={q.question}
                            onChange={v => patchSelected({
                              passage: { ...selected.passage, questions: selected.passage.questions.map(x => x.id === q.id ? { ...x, question: v } : x) },
                            })}
                          />
                          {isMcq ? (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                {q.options.map((opt, oi) => (
                                  <Field
                                    key={oi}
                                    label={`선택지 ${String.fromCharCode(97 + oi)}`}
                                    value={opt}
                                    onChange={v => patchSelected({
                                      passage: {
                                        ...selected.passage,
                                        questions: selected.passage.questions.map(x =>
                                          x.id === q.id ? { ...x, options: x.options.map((o, j) => j === oi ? v : o) } : x
                                        ),
                                      },
                                    })}
                                  />
                                ))}
                              </div>
                              <label className="block">
                                <span className="block text-xs font-bold text-gray-600 mb-1">정답 번호</span>
                                <select
                                  value={typeof q.answer === "number" ? q.answer : 0}
                                  onChange={e => patchSelected({
                                    passage: {
                                      ...selected.passage,
                                      questions: selected.passage.questions.map(x =>
                                        x.id === q.id ? { ...x, answer: parseInt(e.target.value, 10) } : x
                                      ),
                                    },
                                  })}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                >
                                  {q.options.map((_, oi) => (
                                    <option key={oi} value={oi}>{oi} ({String.fromCharCode(97 + oi)})</option>
                                  ))}
                                </select>
                              </label>
                            </>
                          ) : (
                            <Field
                              label="모범 답안"
                              value={String(q.answer)}
                              onChange={v => patchSelected({
                                passage: { ...selected.passage, questions: selected.passage.questions.map(x => x.id === q.id ? { ...x, answer: v } : x) },
                              })}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">레슨 삭제</h3>
            <p className="text-sm text-gray-600 mb-4">이 레슨을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV help modal */}
      {showCsvHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-3">SGR Voca CSV 형식 안내</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>각 행은 <code className="bg-gray-100 px-1 rounded">section,key,value1,value2,...</code> 형식입니다.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><b>META</b>: title, unitNumber, passageTitle, subject, category</li>
                <li><b>WORD</b>: 단어, 발음기호, 품사, 영영 정의, 예문, 이미지URL(선택)</li>
                <li><b>DEF_Q</b>: 정의 프롬프트, 선택지(| 구분), 정답 인덱스(0부터)</li>
                <li><b>ANT_Q</b>: 단어 프롬프트, 선택지(| 구분), 정답 인덱스(0부터)</li>
                <li><b>FILL</b>: 문장(__밑줄__), 글자 힌트(예: __r__t_), 정답</li>
                <li><b>PASSAGE_TITLE</b>: 지문 제목</li>
                <li><b>PASSAGE</b>: 지문 내용 (**bold** 지원, 문단 구분은 \n)</li>
                <li><b>PASSAGE_Q</b>: 문제, 선택지(| 구분, 비우면 단답형), 정답(인덱스 또는 텍스트)</li>
              </ul>
              <p>대량 업로드 시 <code className="bg-gray-100 px-1 rounded">META,title</code> 행이 나올 때마다 새 레슨으로 구분됩니다.</p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowCsvHelp(false)}
                className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-bold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
