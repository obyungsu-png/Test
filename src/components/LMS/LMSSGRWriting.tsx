import { useState, useMemo, useRef } from "react";
import {
  BookOpen, Plus, Trash2, Save, Upload, Copy,
  FileText, Sparkles, PenLine, Layers, AlertCircle,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import type { SGRWritingLesson } from "../SGRWriting/types";
import {
  loadWritingLessons, saveWritingLessons, emptyWritingLesson,
  emptyWritingWord, emptyWritingExpression, emptyWritingReview,
  uid, SAMPLE_WRITING_LESSON,
} from "../SGRWriting/types";
import {
  parseCsvToWritingLesson, parseCsvToWritingLessons,
  writingLessonToCsv, getWritingCsvTemplate,
} from "../SGRWriting/csvUtils";
import { downloadSGRWritingPdf } from "../SGRWriting/pdfUtils";

type SubTab = "overview" | "words" | "expressions" | "reviews";

const SUB_TABS: Array<{ id: SubTab; label: string; icon: any }> = [
  { id: "overview", label: "개요", icon: BookOpen },
  { id: "words", label: "1. 핵심 단어", icon: Sparkles },
  { id: "expressions", label: "2. 주요 표현", icon: FileText },
  { id: "reviews", label: "3. 복습 영작", icon: PenLine },
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function LMSSGRWriting() {
  const [lessons, setLessons] = useState<SGRWritingLesson[]>(loadWritingLessons);
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

  const patchSelected = (patch: Partial<SGRWritingLesson>) => {
    if (!selected) return;
    setLessons(prev => prev.map(l =>
      l.id === selected.id ? { ...l, ...patch, updatedAt: Date.now() } : l
    ));
    setDirty(true);
  };

  const handleSave = () => {
    saveWritingLessons(lessons);
    setDirty(false);
    toast.success("SGR Writing 자료가 저장되었습니다.");
  };

  const handleNew = () => {
    const nl = emptyWritingLesson();
    setLessons(prev => [nl, ...prev]);
    setSelectedId(nl.id);
    setSubTab("overview");
    setDirty(true);
  };

  const handleDuplicate = (id: string) => {
    const src = lessons.find(l => l.id === id);
    if (!src) return;
    const dup: SGRWritingLesson = {
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
    const s: SGRWritingLesson = { ...JSON.parse(JSON.stringify(SAMPLE_WRITING_LESSON)), id: uid(), createdAt: Date.now(), updatedAt: Date.now() };
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
      const lesson = parseCsvToWritingLesson(text);
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
      const newLessons = parseCsvToWritingLessons(text);
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
    const csv = writingLessonToCsv(selected);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sgr-writing-${selected.unitNumber}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTemplateDownload = () => {
    const csv = getWritingCsvTemplate();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sgr-writing-template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV 템플릿을 다운로드했습니다.");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <PenLine className="w-6 h-6 text-indigo-600" />
            SGR Writing 관리
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            영작 학습지를 만들고 관리합니다. (CSV 대량 업로드 지원)
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
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          >
            <Upload className="w-4 h-4" /> CSV 1개
          </button>
          <input ref={csvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvUpload} />
          <button
            onClick={() => bulkCsvInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold"
          >
            <Layers className="w-4 h-4" /> 대량 CSV
          </button>
          <input ref={bulkCsvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleBulkCsvUpload} />
          <button
            onClick={() => setShowCsvHelp(true)}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
            title="업로드 형식 안내"
          >
            <AlertCircle className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg ${
              dirty
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
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
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
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
            className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {filteredLessons.map(l => (
              <div
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                className={`p-2.5 rounded-lg cursor-pointer border transition-colors ${
                  l.id === selectedId
                    ? "bg-indigo-50 border-indigo-300"
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-800 truncate">
                      Unit {l.unitNumber} · {l.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{l.bookTitle}</div>
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
                          ? "border-indigo-600 text-indigo-600"
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
                    onClick={() => downloadSGRWritingPdf(selected, "question")}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <FileText className="w-3.5 h-3.5" /> PDF 미리보기
                  </button>
                </div>
              </div>

              {/* 개요 */}
              {subTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <Field label="레슨 제목" value={selected.title} onChange={v => patchSelected({ title: v })} placeholder="CHAPTER 5 | EASY WRITING" />
                  <Field label="Unit 번호" value={selected.unitNumber} onChange={v => patchSelected({ unitNumber: v })} placeholder="05" />
                  <Field label="책 제목" value={selected.bookTitle} onChange={v => patchSelected({ bookTitle: v })} placeholder="Animal Farm" />
                  <Field label="카테고리" value={selected.category || ""} onChange={v => patchSelected({ category: v })} placeholder="중등영어1-1" />
                  <div className="md:col-span-2">
                    <Field label="공지" value={selected.notice} onChange={v => patchSelected({ notice: v })} placeholder="공지: ..." />
                  </div>
                  <div className="md:col-span-2">
                    <Field label="인용문 (영어)" value={selected.quoteEn} onChange={v => patchSelected({ quoteEn: v })} textarea rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <Field label="인용문 (한글)" value={selected.quoteKr} onChange={v => patchSelected({ quoteKr: v })} textarea rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <Field label="오늘의 핵심 표현" value={selected.keyExpression} onChange={v => patchSelected({ keyExpression: v })} placeholder="be forced to [동사원형] = 어쩔 수 없이 ~해야만 하다" />
                  </div>
                  <Field label="핵심 문장 미리보기 (영어)" value={selected.previewEn} onChange={v => patchSelected({ previewEn: v })} />
                  <Field label="핵심 문장 미리보기 (한글)" value={selected.previewKr} onChange={v => patchSelected({ previewKr: v })} />
                </div>
              )}

              {/* 핵심 단어 */}
              {subTab === "words" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-600">첫 글자 힌트와 뜻을 보고 단어를 맞추는 문제입니다.</p>
                    <button
                      onClick={() => patchSelected({ words: [...selected.words, emptyWritingWord()] })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4" /> 단어 추가
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selected.words.map((w, i) => (
                      <div key={w.id} className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 bg-gray-50">
                        <span className="w-6 text-sm font-bold text-indigo-600">{i + 1}</span>
                        <input
                          type="text"
                          value={w.hint}
                          onChange={(e) => patchSelected({ words: selected.words.map(x => x.id === w.id ? { ...x, hint: e.target.value } : x) })}
                          placeholder="힌트"
                          className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm text-center font-bold"
                          maxLength={2}
                        />
                        <input
                          type="text"
                          value={w.kr}
                          onChange={(e) => patchSelected({ words: selected.words.map(x => x.id === w.id ? { ...x, kr: e.target.value } : x) })}
                          placeholder="한국어 뜻"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="text"
                          value={w.ans}
                          onChange={(e) => patchSelected({ words: selected.words.map(x => x.id === w.id ? { ...x, ans: e.target.value } : x) })}
                          placeholder="정답 단어"
                          className="w-40 px-2 py-1.5 border border-gray-300 rounded text-sm font-bold"
                        />
                        <IconBtn onClick={() => patchSelected({ words: selected.words.filter(x => x.id !== w.id) })} danger title="삭제">
                          <Trash2 className="w-4 h-4" />
                        </IconBtn>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 주요 표현 */}
              {subTab === "expressions" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-600">주요 표현 학습 블록입니다. (보통 3개)</p>
                    <button
                      onClick={() => patchSelected({ expressions: [...selected.expressions, emptyWritingExpression()] })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4" /> 표현 추가
                    </button>
                  </div>
                  <div className="space-y-4">
                    {selected.expressions.map((ex, i) => (
                      <div key={ex.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-indigo-600">표현 {i + 1}</span>
                          <IconBtn onClick={() => patchSelected({ expressions: selected.expressions.filter(x => x.id !== ex.id) })} danger title="삭제">
                            <Trash2 className="w-4 h-4" />
                          </IconBtn>
                        </div>
                        <Field label="표현 제목" value={ex.title} onChange={v => patchSelected({ expressions: selected.expressions.map(x => x.id === ex.id ? { ...x, title: v } : x) })} placeholder="1. side with [명사] = ~의 편을 들다" />
                        <Field label="NOTE" value={ex.note} onChange={v => patchSelected({ expressions: selected.expressions.map(x => x.id === ex.id ? { ...x, note: v } : x) })} placeholder="NOTE: ..." />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                          <Field label="[연습] 한글" value={ex.exampleKr} onChange={v => patchSelected({ expressions: selected.expressions.map(x => x.id === ex.id ? { ...x, exampleKr: v } : x) })} />
                          <Field label="[연습] 영어" value={ex.exampleEn} onChange={v => patchSelected({ expressions: selected.expressions.map(x => x.id === ex.id ? { ...x, exampleEn: v } : x) })} />
                          <Field label="[도전] 한글" value={ex.challengeKr} onChange={v => patchSelected({ expressions: selected.expressions.map(x => x.id === ex.id ? { ...x, challengeKr: v } : x) })} />
                          <Field label="[도전] 영어 (정답)" value={ex.challengeEn} onChange={v => patchSelected({ expressions: selected.expressions.map(x => x.id === ex.id ? { ...x, challengeEn: v } : x) })} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 복습 영작 */}
              {subTab === "reviews" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-600">복습 응용 영작 문제입니다. (보통 3개)</p>
                    <button
                      onClick={() => patchSelected({ reviews: [...selected.reviews, emptyWritingReview()] })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4" /> 문제 추가
                    </button>
                  </div>
                  <div className="space-y-4">
                    {selected.reviews.map((r, i) => (
                      <div key={r.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-indigo-600">문제 {i + 1}</span>
                          <IconBtn onClick={() => patchSelected({ reviews: selected.reviews.filter(x => x.id !== r.id) })} danger title="삭제">
                            <Trash2 className="w-4 h-4" />
                          </IconBtn>
                        </div>
                        <Field label="한글 문장" value={r.kr} onChange={v => patchSelected({ reviews: selected.reviews.map(x => x.id === r.id ? { ...x, kr: v } : x) })} />
                        <Field label="어순 가이드" value={r.guide} onChange={v => patchSelected({ reviews: selected.reviews.map(x => x.id === r.id ? { ...x, guide: v } : x) })} placeholder="(어순 가이드: ...)" />
                        <Field label="영어 정답" value={r.ans} onChange={v => patchSelected({ reviews: selected.reviews.map(x => x.id === r.id ? { ...x, ans: v } : x) })} />
                      </div>
                    ))}
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
            <h3 className="text-lg font-bold text-gray-800 mb-3">SGR Writing CSV 형식 안내</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>각 행은 <code className="bg-gray-100 px-1 rounded">section,key,value1,value2,...</code> 형식입니다.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><b>META</b>: title, unitNumber, bookTitle, notice, quoteEn, quoteKr, keyExpression, previewEn, previewKr, subject, category</li>
                <li><b>WORD</b>: value1=힌트(첫글자), value2=한국어 뜻, value3=정답 단어</li>
                <li><b>EXPRESSION</b>: value1=제목, value2=NOTE, value3=연습한글, value4=연습영어, value5=도전한글, value6=도전영어</li>
                <li><b>REVIEW</b>: value1=한글 문장, value2=어순 가이드, value3=영어 정답</li>
              </ul>
              <p>대량 업로드 시 <code className="bg-gray-100 px-1 rounded">META,title</code> 행이 나올 때마다 새 레슨으로 구분됩니다.</p>
              <p className="text-gray-500">쉼표가 포함된 값은 큰따옴표로 감싸세요. 템플릿 CSV를 다운로드해 참고하세요.</p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowCsvHelp(false)}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold"
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
