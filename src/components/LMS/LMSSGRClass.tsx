import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, Plus, Trash2, Save, X, Upload, Download, Copy,
  ChevronDown, ChevronRight, FileText, Sparkles, HelpCircle,
  Layers, Zap, Image as ImageIcon, ArrowUp, ArrowDown, AlertCircle,
  Check, Eye
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import type {
  SGRLesson, Question, McqQuestion, FillBlankQuestion,
  CompleteSentenceQuestion, OutlineQuestion, TrueFalseQuestion,
  PreviewCard, VocabPreviewItem, PassageParagraph, DirectReadingItem, VocabReviewItem,
} from "../SGRClass/types";
import {
  loadLessons, saveLessons, emptyLesson, emptyPreviewCard,
  emptyVocabPreview, emptyParagraph, emptyMcq, emptyFillBlank,
  emptyCompleteSentence, emptyOutline, emptyTrueFalse, emptyDirectReading,
  emptyVocabReviewItem, uid, SAMPLE_LESSON,
} from "../SGRClass/types";
import { parseCsvToLesson, lessonToCsv, getCsvTemplate } from "../SGRClass/csvUtils";
import { downloadSGRPdf } from "../SGRClass/pdfUtils";

type SubTab = "overview" | "preview" | "passage" | "questions" | "vocabReview" | "directReading";

const SUB_TABS: Array<{ id: SubTab; label: string; icon: any }> = [
  { id: "overview", label: "개요", icon: BookOpen },
  { id: "preview", label: "1. Preview", icon: Sparkles },
  { id: "passage", label: "2. Passage", icon: FileText },
  { id: "questions", label: "3. Questions", icon: HelpCircle },
  { id: "vocabReview", label: "4. Vocab Review", icon: Layers },
  { id: "directReading", label: "직독직해", icon: Zap },
];

// ─── Reusable small inputs ──────────────────────
function Field({
  label, value, onChange, placeholder, multiline, textarea, rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  textarea?: boolean;
  rows?: number;
}) {
  const isTextarea = textarea || multiline;
  return (
    <label className="block mb-3">
      <span className="block text-xs font-bold text-gray-600 mb-1">{label}</span>
      {isTextarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows || 3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
          : "text-gray-500 hover:text-cyan-600 hover:bg-cyan-50"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Main component ─────────────────────────────
export default function LMSSGRClass() {
  const [lessons, setLessons] = useState<SGRLesson[]>(loadLessons);
  const [selectedId, setSelectedId] = useState<string>(lessons[0]?.id || "");
  const [subTab, setSubTab] = useState<SubTab>("overview");
  const [dirty, setDirty] = useState(false);
  const [search, setSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCsvHelp, setShowCsvHelp] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

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

  // Helpers to mutate the selected lesson
  const patchSelected = (patch: Partial<SGRLesson>) => {
    if (!selected) return;
    setLessons(prev => prev.map(l =>
      l.id === selected.id ? { ...l, ...patch, updatedAt: Date.now() } : l
    ));
    setDirty(true);
  };

  const handleSave = () => {
    saveLessons(lessons);
    setDirty(false);
    toast.success("SGR Class 자료가 저장되었습니다.");
  };

  const handleNew = () => {
    const nl = emptyLesson();
    setLessons(prev => [nl, ...prev]);
    setSelectedId(nl.id);
    setSubTab("overview");
    setDirty(true);
  };

  const handleDuplicate = (id: string) => {
    const src = lessons.find(l => l.id === id);
    if (!src) return;
    const dup: SGRLesson = {
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
    const s: SGRLesson = { ...JSON.parse(JSON.stringify(SAMPLE_LESSON)), id: uid(), createdAt: Date.now(), updatedAt: Date.now() };
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
      const lesson = parseCsvToLesson(text);
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

  const handleCsvExport = () => {
    if (!selected) return;
    const csv = lessonToCsv(selected);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sgr-class-${selected.unitNumber}-${selected.title.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTemplateDownload = () => {
    const csv = getCsvTemplate();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sgr-class-template.csv";
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
            <Sparkles className="w-6 h-6 text-cyan-600" />
            SGR Class 관리
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            수업용 교과서형 자료를 만들고 관리합니다. (CSV 업로드 지원)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTemplateDownload}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <FileText className="w-4 h-4" /> CSV 템플릿
          </button>
          <button
            onClick={() => csvInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-cyan-300 text-cyan-700 hover:bg-cyan-50"
          >
            <Upload className="w-4 h-4" /> CSV 업로드
          </button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleCsvUpload}
          />
          <button
            onClick={() => setShowCsvHelp(true)}
            className="p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg"
            title="CSV 형식 안내"
          >
            <AlertCircle className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg ${
              dirty
                ? "bg-cyan-600 text-white hover:bg-cyan-700"
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
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cyan-600 text-white rounded-lg text-sm font-bold hover:bg-cyan-700"
            >
              <Plus className="w-4 h-4" /> 새 레슨
            </button>
            <button
              onClick={handleLoadSample}
              title="샘플 불러오기"
              className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색..."
            className="w-full px-3 py-1.5 mb-2 border border-gray-300 rounded-lg text-sm"
          />
          <div className="space-y-1 max-h-[560px] overflow-y-auto pr-1">
            {filteredLessons.length === 0 && (
              <p className="text-xs text-gray-400 py-4 text-center">
                레슨이 없습니다.
              </p>
            )}
            {filteredLessons.map(l => (
              <div
                key={l.id}
                className={`group flex items-center gap-1 rounded-lg ${
                  l.id === selectedId ? "bg-cyan-50 border border-cyan-200" : "hover:bg-gray-50"
                }`}
              >
                <button
                  onClick={() => setSelectedId(l.id)}
                  className="flex-1 text-left px-3 py-2"
                >
                  <div className="text-[10px] font-bold text-cyan-600">
                    Unit {l.unitNumber}
                  </div>
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {l.title || "(제목 없음)"}
                  </div>
                  {l.category && (
                    <div className="text-[10px] text-gray-500">{l.category}</div>
                  )}
                </button>
                <div className="opacity-0 group-hover:opacity-100 flex items-center pr-1">
                  <IconBtn onClick={() => handleDuplicate(l.id)} title="복제">
                    <Copy className="w-3.5 h-3.5" />
                  </IconBtn>
                  <IconBtn onClick={() => setShowDeleteConfirm(l.id)} title="삭제" danger>
                    <Trash2 className="w-3.5 h-3.5" />
                  </IconBtn>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div>
          {!selected ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              레슨을 선택하거나 새로 만들어주세요.
            </div>
          ) : (
            <div>
              {/* Sub tabs */}
              <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-4 overflow-x-auto">
                {SUB_TABS.map(t => {
                  const Icon = t.icon;
                  const active = subTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSubTab(t.id)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                        active ? "bg-cyan-600 text-white" : "text-gray-600 hover:bg-cyan-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  );
                })}
                <div className="flex-1" />
                <button
                  onClick={handleCsvExport}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  title="이 레슨을 CSV로 저장"
                >
                  <Download className="w-4 h-4" /> CSV 저장
                </button>
                <div className="relative group shrink-0">
                  <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg text-cyan-700 hover:bg-cyan-50">
                    <Download className="w-4 h-4" /> PDF
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-40">
                    <button
                      onClick={() => downloadSGRPdf(selected, "question")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-cyan-50 text-gray-700"
                    >
                      문제편
                    </button>
                    <button
                      onClick={() => downloadSGRPdf(selected, "answer")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-cyan-50 text-gray-700 border-t border-gray-100"
                    >
                      문제+해답편
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                {subTab === "overview" && <OverviewEditor lesson={selected} onPatch={patchSelected} />}
                {subTab === "preview" && <PreviewEditor lesson={selected} onPatch={patchSelected} />}
                {subTab === "passage" && <PassageEditor lesson={selected} onPatch={patchSelected} />}
                {subTab === "questions" && <QuestionsEditor lesson={selected} onPatch={patchSelected} />}
                {subTab === "vocabReview" && <VocabReviewEditor lesson={selected} onPatch={patchSelected} />}
                {subTab === "directReading" && <DirectReadingEditor lesson={selected} onPatch={patchSelected} />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">레슨 삭제</h3>
              <p className="text-sm text-gray-600 mb-4">이 작업은 되돌릴 수 없습니다.</p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  삭제
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSV help modal */}
      <AnimatePresence>
        {showCsvHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCsvHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">CSV 형식 안내</h3>
                <button
                  onClick={() => setShowCsvHelp(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-gray-700 space-y-3">
                <p>CSV 파일 첫 열은 <b>section</b>, 두번째는 <b>key</b>, 나머지는 <b>value1~value4</b>입니다.</p>
                <div>
                  <p className="font-bold mb-1">지원되는 section:</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li><b>META</b> — key: title, unitNumber, subject, category, previewQuestion, passageTitle, vocabPreviewInstruction</li>
                    <li><b>PREVIEW_CARD</b> — value1: 캡션</li>
                    <li><b>VOCAB_PREVIEW</b> — value1: 단어, value2: 뜻</li>
                    <li><b>PARAGRAPH</b> — value1: 본문 (**굵게**), value2: 이미지 캡션(선택)</li>
                    <li><b>QUESTION_MC</b> — value1: main_idea|multiple_choice|vocabulary, value2: 질문, value3: 옵션(| 구분), value4: 정답 인덱스(0부터)</li>
                    <li><b>QUESTION_FILL</b> — value1: 문항(___로 빈칸), value2: 정답</li>
                    <li><b>QUESTION_COMPLETE</b> — key=wordBank일 때 value1: 단어(|), 아니면 value1: 문장, value2: 정답</li>
                    <li><b>QUESTION_OUTLINE</b> — key=title: value1(left/right), value2: 제목 / 항목: value1(left/right), value2: 문항, value3: 정답</li>
                    <li><b>QUESTION_TF</b> — value1: 문장, value2: T 또는 F</li>
                    <li><b>VOCAB_REVIEW_BANK</b> — value1: 단어</li>
                    <li><b>VOCAB_REVIEW</b> — value1: 문장(___), value2: 정답</li>
                    <li><b>DIRECT_READING</b> — value1: 영어, value2: 한글, value3: chunks(| 구분)</li>
                  </ul>
                </div>
                <button
                  onClick={handleTemplateDownload}
                  className="mt-2 flex items-center gap-1.5 px-3 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                >
                  <Download className="w-4 h-4" /> 템플릿 다운로드
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================
//  Editor sub-components
// =============================================================

function OverviewEditor({
  lesson, onPatch,
}: { lesson: SGRLesson; onPatch: (p: Partial<SGRLesson>) => void }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">개요</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Unit 번호" value={lesson.unitNumber} onChange={(v) => onPatch({ unitNumber: v })} placeholder="01" />
        <Field label="제목" value={lesson.title} onChange={(v) => onPatch({ title: v })} placeholder="The U.S. Geography" />
        <Field label="과목" value={lesson.subject} onChange={(v) => onPatch({ subject: v })} placeholder="영어" />
        <Field label="카테고리" value={lesson.category || ""} onChange={(v) => onPatch({ category: v })} placeholder="중등영어1-1" />
      </div>
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-bold mb-2">📝 편집 팁</p>
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li>본문 및 문항에서 <code className="bg-white px-1 rounded">**단어**</code>는 굵게 표시됩니다.</li>
          <li>빈칸은 <code className="bg-white px-1 rounded">___</code> (밑줄 3개)로 표시하세요.</li>
          <li>모든 변경은 <b>저장</b> 버튼을 눌러야 반영됩니다.</li>
          <li>CSV로 대량 업로드 가능합니다. (상단 CSV 업로드 버튼)</li>
        </ul>
      </div>
    </div>
  );
}

function PreviewEditor({
  lesson, onPatch,
}: { lesson: SGRLesson; onPatch: (p: Partial<SGRLesson>) => void }) {
  const addCard = () => onPatch({ previewCards: [...lesson.previewCards, emptyPreviewCard()] });
  const removeCard = (id: string) => onPatch({ previewCards: lesson.previewCards.filter(c => c.id !== id) });
  const updateCard = (id: string, patch: Partial<PreviewCard>) =>
    onPatch({ previewCards: lesson.previewCards.map(c => c.id === id ? { ...c, ...patch } : c) });

  const addVoca = () => onPatch({ vocabularyPreview: [...lesson.vocabularyPreview, emptyVocabPreview()] });
  const removeVoca = (id: string) => onPatch({ vocabularyPreview: lesson.vocabularyPreview.filter(v => v.id !== id) });
  const updateVoca = (id: string, patch: Partial<VocabPreviewItem>) =>
    onPatch({ vocabularyPreview: lesson.vocabularyPreview.map(v => v.id === id ? { ...v, ...patch } : v) });

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">1. Preview 페이지</h2>

      <div className="mb-6 pb-6 border-b border-gray-200">
        <Field
          label="Visual Preview 질문"
          value={lesson.previewQuestion}
          onChange={(v) => onPatch({ previewQuestion: v })}
          placeholder="What are some features of the different regions in the United States?"
          textarea
        />
      </div>

      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-700">Preview 카드 (사진 캡션)</h3>
          <button
            onClick={addCard}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            <Plus className="w-3 h-3" /> 카드 추가
          </button>
        </div>
        <div className="space-y-3">
          {lesson.previewCards.map((c, i) => (
            <div key={c.id} className="p-3 border border-gray-200 rounded-lg flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <textarea
                  value={c.caption}
                  onChange={(e) => updateCard(c.id, { caption: e.target.value })}
                  placeholder="캡션 텍스트"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <IconBtn onClick={() => removeCard(c.id)} danger>
                <Trash2 className="w-4 h-4" />
              </IconBtn>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-700">Vocabulary Preview</h3>
          <button
            onClick={addVoca}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            <Plus className="w-3 h-3" /> 단어 추가
          </button>
        </div>
        <Field
          label="지시문"
          value={lesson.vocabPreviewInstruction}
          onChange={(v) => onPatch({ vocabPreviewInstruction: v })}
          placeholder="Write the correct word next to its meaning."
        />
        <div className="space-y-2 mt-3">
          {lesson.vocabularyPreview.map((v, i) => (
            <div key={v.id} className="flex gap-2 items-center">
              <span className="w-7 shrink-0 text-cyan-600 font-bold text-sm">{i + 1}.</span>
              <input
                type="text"
                value={v.word}
                onChange={(e) => updateVoca(v.id, { word: e.target.value })}
                placeholder="단어"
                className="w-40 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-400">:</span>
              <input
                type="text"
                value={v.meaning}
                onChange={(e) => updateVoca(v.id, { meaning: e.target.value })}
                placeholder="영어 뜻"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
              <IconBtn onClick={() => removeVoca(v.id)} danger>
                <Trash2 className="w-4 h-4" />
              </IconBtn>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PassageEditor({
  lesson, onPatch,
}: { lesson: SGRLesson; onPatch: (p: Partial<SGRLesson>) => void }) {
  const addPara = () => onPatch({ passageParagraphs: [...lesson.passageParagraphs, emptyParagraph()] });
  const removePara = (id: string) => onPatch({ passageParagraphs: lesson.passageParagraphs.filter(p => p.id !== id) });
  const updatePara = (id: string, patch: Partial<PassageParagraph>) =>
    onPatch({ passageParagraphs: lesson.passageParagraphs.map(p => p.id === id ? { ...p, ...patch } : p) });
  const movePara = (id: string, dir: -1 | 1) => {
    const arr = [...lesson.passageParagraphs];
    const idx = arr.findIndex(p => p.id === id);
    const to = idx + dir;
    if (idx < 0 || to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    onPatch({ passageParagraphs: arr });
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">2. Passage 페이지</h2>
      <Field
        label="본문 제목"
        value={lesson.passageTitle}
        onChange={(v) => onPatch({ passageTitle: v })}
        placeholder="The Regions of the United States"
      />

      <div className="flex items-center justify-between mb-3 mt-4">
        <h3 className="font-bold text-gray-700">문단</h3>
        <button
          onClick={addPara}
          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          <Plus className="w-3 h-3" /> 문단 추가
        </button>
      </div>
      <div className="space-y-3">
        {lesson.passageParagraphs.map((p, i) => (
          <div key={p.id} className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-600">문단 {i + 1}</span>
              <div className="flex items-center gap-0.5">
                <IconBtn onClick={() => movePara(p.id, -1)} title="위로">
                  <ArrowUp className="w-3.5 h-3.5" />
                </IconBtn>
                <IconBtn onClick={() => movePara(p.id, 1)} title="아래로">
                  <ArrowDown className="w-3.5 h-3.5" />
                </IconBtn>
                <IconBtn onClick={() => removePara(p.id)} danger>
                  <Trash2 className="w-3.5 h-3.5" />
                </IconBtn>
              </div>
            </div>
            <textarea
              value={p.content}
              onChange={(e) => updatePara(p.id, { content: e.target.value })}
              placeholder="본문 텍스트 (**굵게** 표시 지원)"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-2"
            />
            <input
              type="text"
              value={p.imageCaption || ""}
              onChange={(e) => updatePara(p.id, { imageCaption: e.target.value })}
              placeholder="관련 이미지 캡션 (선택, 예: cash crop)"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionsEditor({
  lesson, onPatch,
}: { lesson: SGRLesson; onPatch: (p: Partial<SGRLesson>) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const addQ = (type: Question["type"]) => {
    let q: Question;
    if (type === "main_idea") q = { ...emptyMcq("main_idea") };
    else if (type === "vocabulary") q = { ...emptyMcq("vocabulary") };
    else if (type === "multiple_choice") q = emptyMcq("multiple_choice");
    else if (type === "fill_blank") q = emptyFillBlank();
    else if (type === "complete_sentence") q = emptyCompleteSentence();
    else if (type === "outline") q = emptyOutline();
    else q = emptyTrueFalse();
    onPatch({ questions: [...lesson.questions, q] });
    setOpenId(q.id);
  };

  const removeQ = (id: string) => onPatch({ questions: lesson.questions.filter(q => q.id !== id) });
  const updateQ = (id: string, patch: any) =>
    onPatch({ questions: lesson.questions.map(q => q.id === id ? { ...q, ...patch } : q) });
  const moveQ = (id: string, dir: -1 | 1) => {
    const arr = [...lesson.questions];
    const idx = arr.findIndex(q => q.id === id);
    const to = idx + dir;
    if (idx < 0 || to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    onPatch({ questions: arr });
  };

  const typeLabel = (q: Question) => {
    switch (q.type) {
      case "main_idea": return "주제";
      case "multiple_choice": return "객관식";
      case "vocabulary": return "어휘 의미";
      case "fill_blank": return "빈칸";
      case "complete_sentence": return "문장 완성";
      case "outline": return "구조 표";
      case "true_false": return "T/F";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">3. Questions 페이지</h2>
        <div className="flex items-center gap-1 flex-wrap">
          {(["main_idea", "multiple_choice", "vocabulary", "fill_blank", "complete_sentence", "outline", "true_false"] as Question["type"][]).map(t => (
            <button
              key={t}
              onClick={() => addQ(t)}
              className="px-2.5 py-1 text-xs bg-cyan-50 text-cyan-700 rounded hover:bg-cyan-100 font-medium"
            >
              + {t === "main_idea" ? "주제" :
                  t === "multiple_choice" ? "객관식" :
                  t === "vocabulary" ? "어휘" :
                  t === "fill_blank" ? "빈칸" :
                  t === "complete_sentence" ? "문장완성" :
                  t === "outline" ? "구조표" : "T/F"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {lesson.questions.map((q, i) => {
          const isOpen = openId === q.id;
          return (
            <div key={q.id} className="border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-t-lg">
                <button
                  onClick={() => setOpenId(isOpen ? null : q.id)}
                  className="text-gray-500"
                >
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <span className="w-6 h-6 bg-cyan-600 text-white rounded-full text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 bg-white border border-cyan-200 text-cyan-700 rounded">
                  {typeLabel(q)}
                </span>
                <span className="flex-1 text-sm text-gray-700 truncate">
                  {(q as any).question ||
                    (q.type === "complete_sentence" ? `${q.sentences.length}개 문장` :
                     q.type === "outline" ? `${q.leftTitle} / ${q.rightTitle}` :
                     q.type === "true_false" ? `${q.statements.length}개 T/F` : "")}
                </span>
                <IconBtn onClick={() => moveQ(q.id, -1)}><ArrowUp className="w-3.5 h-3.5" /></IconBtn>
                <IconBtn onClick={() => moveQ(q.id, 1)}><ArrowDown className="w-3.5 h-3.5" /></IconBtn>
                <IconBtn onClick={() => removeQ(q.id)} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
              </div>
              {isOpen && (
                <div className="p-4 border-t border-gray-200">
                  <SingleQuestionEditor q={q} onUpdate={(p) => updateQ(q.id, p)} />
                </div>
              )}
            </div>
          );
        })}
        {lesson.questions.length === 0 && (
          <p className="text-sm text-gray-400 py-8 text-center">
            문제가 없습니다. 위 버튼으로 문제를 추가하세요.
          </p>
        )}
      </div>
    </div>
  );
}

function SingleQuestionEditor({ q, onUpdate }: { q: Question; onUpdate: (p: any) => void }) {
  if (q.type === "main_idea" || q.type === "multiple_choice" || q.type === "vocabulary") {
    const updateOption = (i: number, v: string) => {
      const options = [...q.options];
      options[i] = v;
      onUpdate({ options });
    };
    return (
      <div>
        <Field label="질문" value={q.question} onChange={(v) => onUpdate({ question: v })} textarea rows={2} />
        <div className="space-y-2 mb-3">
          {q.options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <label className="flex items-center gap-1 shrink-0">
                <input
                  type="radio"
                  checked={q.answer === i}
                  onChange={() => onUpdate({ answer: i })}
                  className="accent-cyan-600"
                />
                <span className="text-xs font-bold text-gray-500">{String.fromCharCode(97 + i)}.</span>
              </label>
              <input
                type="text"
                value={o}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`옵션 ${String.fromCharCode(97 + i)}`}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
              {q.options.length > 2 && (
                <IconBtn onClick={() => {
                  const options = q.options.filter((_, idx) => idx !== i);
                  onUpdate({ options, answer: Math.max(0, q.answer >= i ? q.answer - 1 : q.answer) });
                }} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
              )}
            </div>
          ))}
        </div>
        {q.options.length < 5 && (
          <button
            onClick={() => onUpdate({ options: [...q.options, ""] })}
            className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            + 옵션 추가
          </button>
        )}
        <Field label="해설 (선택)" value={q.explanation || ""} onChange={(v) => onUpdate({ explanation: v })} textarea />
      </div>
    );
  }

  if (q.type === "fill_blank") {
    return (
      <div>
        <Field
          label="문항 (빈칸 위치는 ___로 표시)"
          value={q.question}
          onChange={(v) => onUpdate({ question: v })}
          textarea
        />
        <Field label="정답" value={q.answer} onChange={(v) => onUpdate({ answer: v })} />
      </div>
    );
  }

  if (q.type === "complete_sentence") {
    const updateSentence = (id: string, patch: any) => {
      onUpdate({ sentences: q.sentences.map(s => s.id === id ? { ...s, ...patch } : s) });
    };
    const addSentence = () => onUpdate({ sentences: [...q.sentences, { id: uid(), text: "", answer: "" }] });
    const removeSentence = (id: string) => onUpdate({ sentences: q.sentences.filter(s => s.id !== id) });

    return (
      <div>
        <Field
          label="단어 뱅크 (공백 또는 | 로 구분, 선택)"
          value={(q.wordBank || []).join(" | ")}
          onChange={(v) => onUpdate({ wordBank: v.split(/[|]/g).map(w => w.trim()).filter(Boolean) })}
        />
        <div className="space-y-2 mb-2">
          {q.sentences.map((s, i) => (
            <div key={s.id} className="flex gap-2 items-start">
              <span className="w-6 shrink-0 pt-2 text-cyan-600 font-bold text-sm">{String.fromCharCode(97 + i)}.</span>
              <textarea
                value={s.text}
                onChange={(e) => updateSentence(s.id, { text: e.target.value })}
                placeholder="문장 (___로 빈칸)"
                rows={2}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                value={s.answer}
                onChange={(e) => updateSentence(s.id, { answer: e.target.value })}
                placeholder="정답"
                className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
              <IconBtn onClick={() => removeSentence(s.id)} danger><Trash2 className="w-4 h-4" /></IconBtn>
            </div>
          ))}
        </div>
        <button onClick={addSentence} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">
          + 문장 추가
        </button>
      </div>
    );
  }

  if (q.type === "outline") {
    const updateItem = (side: "left" | "right", id: string, patch: any) => {
      const key = side === "left" ? "leftItems" : "rightItems";
      onUpdate({ [key]: q[key].map(it => it.id === id ? { ...it, ...patch } : it) });
    };
    const addItem = (side: "left" | "right") => {
      const key = side === "left" ? "leftItems" : "rightItems";
      onUpdate({ [key]: [...q[key], { id: uid(), text: "", answer: "" }] });
    };
    const removeItem = (side: "left" | "right", id: string) => {
      const key = side === "left" ? "leftItems" : "rightItems";
      onUpdate({ [key]: q[key].filter(it => it.id !== id) });
    };

    const renderCol = (side: "left" | "right", title: string, items: OutlineQuestion["leftItems"]) => (
      <div className="border border-gray-200 rounded-lg p-3">
        <input
          type="text"
          value={title}
          onChange={(e) => onUpdate({ [side === "left" ? "leftTitle" : "rightTitle"]: e.target.value })}
          placeholder={side === "left" ? "좌측 제목" : "우측 제목"}
          className="w-full px-3 py-1.5 mb-2 border border-gray-300 rounded text-sm font-bold"
        />
        <div className="space-y-2 mb-2">
          {items.map(it => (
            <div key={it.id} className="flex gap-1 items-start">
              <textarea
                value={it.text}
                onChange={(e) => updateItem(side, it.id, { text: e.target.value })}
                placeholder="항목 (___로 빈칸)"
                rows={2}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
              />
              <input
                type="text"
                value={it.answer || ""}
                onChange={(e) => updateItem(side, it.id, { answer: e.target.value })}
                placeholder="정답"
                className="w-24 px-2 py-1 border border-gray-300 rounded text-xs"
              />
              <IconBtn onClick={() => removeItem(side, it.id)} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
            </div>
          ))}
        </div>
        <button onClick={() => addItem(side)} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">
          + 항목 추가
        </button>
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {renderCol("left", q.leftTitle, q.leftItems)}
        {renderCol("right", q.rightTitle, q.rightItems)}
      </div>
    );
  }

  if (q.type === "true_false") {
    const updateStatement = (id: string, patch: any) => {
      onUpdate({ statements: q.statements.map(s => s.id === id ? { ...s, ...patch } : s) });
    };
    const addStatement = () => onUpdate({ statements: [...q.statements, { id: uid(), text: "", answer: true }] });
    const removeStatement = (id: string) => onUpdate({ statements: q.statements.filter(s => s.id !== id) });

    return (
      <div>
        <div className="space-y-2 mb-2">
          {q.statements.map((s, i) => (
            <div key={s.id} className="flex gap-2 items-center">
              <span className="w-6 shrink-0 text-cyan-600 font-bold text-sm">{i + 1}.</span>
              <input
                type="text"
                value={s.text}
                onChange={(e) => updateStatement(s.id, { text: e.target.value })}
                placeholder="문장"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
              />
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  checked={s.answer === true}
                  onChange={() => updateStatement(s.id, { answer: true })}
                  className="accent-cyan-600"
                />
                T
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  checked={s.answer === false}
                  onChange={() => updateStatement(s.id, { answer: false })}
                  className="accent-cyan-600"
                />
                F
              </label>
              <IconBtn onClick={() => removeStatement(s.id)} danger><Trash2 className="w-4 h-4" /></IconBtn>
            </div>
          ))}
        </div>
        <button onClick={addStatement} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">
          + 문장 추가
        </button>
      </div>
    );
  }

  return null;
}

function VocabReviewEditor({
  lesson, onPatch,
}: { lesson: SGRLesson; onPatch: (p: Partial<SGRLesson>) => void }) {
  const { vocabReview } = lesson;
  const updateBank = (v: string) =>
    onPatch({ vocabReview: { ...vocabReview, wordBank: v.split(/[|]/g).map(w => w.trim()).filter(Boolean) } });

  const addItem = () =>
    onPatch({ vocabReview: { ...vocabReview, items: [...vocabReview.items, emptyVocabReviewItem()] } });
  const removeItem = (id: string) =>
    onPatch({ vocabReview: { ...vocabReview, items: vocabReview.items.filter(i => i.id !== id) } });
  const updateItem = (id: string, patch: Partial<VocabReviewItem>) =>
    onPatch({ vocabReview: { ...vocabReview, items: vocabReview.items.map(i => i.id === id ? { ...i, ...patch } : i) } });

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">4. Vocabulary Review 페이지</h2>
      <Field
        label="단어 뱅크 (| 로 구분)"
        value={vocabReview.wordBank.join(" | ")}
        onChange={updateBank}
        placeholder="physical environment | arid | stretch | landform | dominate"
      />
      <div className="flex items-center justify-between mb-3 mt-4">
        <h3 className="font-bold text-gray-700">복습 문항</h3>
        <button
          onClick={addItem}
          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          <Plus className="w-3 h-3" /> 문항 추가
        </button>
      </div>
      <div className="space-y-2">
        {vocabReview.items.map((it, i) => (
          <div key={it.id} className="flex gap-2 items-start">
            <span className="w-6 shrink-0 pt-2 text-cyan-600 font-bold text-sm">{i + 1}.</span>
            <textarea
              value={it.sentence}
              onChange={(e) => updateItem(it.id, { sentence: e.target.value })}
              placeholder="문장 (___로 빈칸)"
              rows={2}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              value={it.answer}
              onChange={(e) => updateItem(it.id, { answer: e.target.value })}
              placeholder="정답"
              className="w-40 px-3 py-1.5 border border-gray-300 rounded text-sm"
            />
            <IconBtn onClick={() => removeItem(it.id)} danger><Trash2 className="w-4 h-4" /></IconBtn>
          </div>
        ))}
      </div>
    </div>
  );
}

function DirectReadingEditor({
  lesson, onPatch,
}: { lesson: SGRLesson; onPatch: (p: Partial<SGRLesson>) => void }) {
  const addItem = () => onPatch({ directReading: [...lesson.directReading, emptyDirectReading()] });
  const removeItem = (id: string) => onPatch({ directReading: lesson.directReading.filter(d => d.id !== id) });
  const updateItem = (id: string, patch: Partial<DirectReadingItem>) =>
    onPatch({ directReading: lesson.directReading.map(d => d.id === id ? { ...d, ...patch } : d) });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">직독직해</h2>
        <button
          onClick={addItem}
          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          <Plus className="w-3 h-3" /> 문장 추가
        </button>
      </div>
      <div className="space-y-3">
        {lesson.directReading.map((d, i) => (
          <div key={d.id} className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-600">문장 {i + 1}</span>
              <IconBtn onClick={() => removeItem(d.id)} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
            </div>
            <textarea
              value={d.english}
              onChange={(e) => updateItem(d.id, { english: e.target.value })}
              placeholder="영어 문장"
              rows={2}
              className="w-full px-3 py-1.5 mb-2 border border-gray-300 rounded text-sm"
            />
            <textarea
              value={d.korean}
              onChange={(e) => updateItem(d.id, { korean: e.target.value })}
              placeholder="한글 해석"
              rows={2}
              className="w-full px-3 py-1.5 mb-2 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              value={d.chunks.join(" | ")}
              onChange={(e) => updateItem(d.id, { chunks: e.target.value.split(/[|]/g).map(c => c.trim()).filter(Boolean) })}
              placeholder="청크 (| 로 구분: e.g. The United States | can be divided | into five regions)"
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs"
            />
          </div>
        ))}
        {lesson.directReading.length === 0 && (
          <p className="text-sm text-gray-400 py-8 text-center">
            직독직해 문장이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
