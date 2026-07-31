import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, Plus, Trash2, Save, X, Upload, Download, Copy,
  ChevronDown, ChevronRight, Library, Users, Quote, Sparkles,
  HelpCircle, Zap, FileText, ImageIcon, ArrowUp, ArrowDown,
  AlertCircle, Check, Eye, Clock,
} from "lucide-react";
import { toast } from "sonner";
import type {
  SGRNovel, NovelChapter, NovelTheme, NovelCharacter, NovelQuote,
  NovelQuiz, QuizType, DirectReadingItem, PassageParagraph,
} from "../SGRNovel/types";
import {
  loadNovels, saveNovels, emptyNovel, emptyChapter, emptyTheme,
  emptyCharacter, emptyQuote, emptyQuiz, emptyDirectReading, emptyParagraph,
  uid, SAMPLE_NOVEL,
} from "../SGRNovel/types";
import "../../utils/sgrNovelApi"; // 서버 연동 함수 등록

type SubTab = "overview" | "chapters" | "csv";

const SUB_TABS: Array<{ id: SubTab; label: string; icon: any }> = [
  { id: "overview", label: "개요 / 전체 분석", icon: Library },
  { id: "chapters", label: "챕터 관리", icon: BookOpen },
  { id: "csv", label: "CSV / JSON", icon: Upload },
];

// ─── Reusable small inputs ──────────────────────
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
          : "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
      }`}
    >
      {children}
    </button>
  );
}

function SectionCard({ title, icon: Icon, children, onAdd, addLabel }: {
  title: string; icon: any; children: React.ReactNode; onAdd?: () => void; addLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Icon className="w-4 h-4 text-amber-500" /> {title}
        </h3>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100">
            <Plus className="w-3 h-3" /> {addLabel || "추가"}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Main CMS component ─────────────────────────
export default function LMSSGRNovel() {
  const [novels, setNovels] = useState<SGRNovel[]>(loadNovels);
  const [selectedId, setSelectedId] = useState<string>(novels[0]?.id || "");
  const [subTab, setSubTab] = useState<SubTab>("overview");
  const [dirty, setDirty] = useState(false);
  const [search, setSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const bulkCsvInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const bulkJsonInputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => novels.find(n => n.id === selectedId) || null,
    [novels, selectedId]
  );

  const filteredNovels = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return novels;
    return novels.filter(n =>
      n.title.toLowerCase().includes(s) ||
      n.author.toLowerCase().includes(s) ||
      (n.category || "").toLowerCase().includes(s)
    );
  }, [novels, search]);

  const patchSelected = (patch: Partial<SGRNovel>) => {
    if (!selected) return;
    setNovels(prev => prev.map(n =>
      n.id === selected.id ? { ...n, ...patch, updatedAt: Date.now() } : n
    ));
    setDirty(true);
  };

  const patchChapter = (chapterId: string, patch: Partial<NovelChapter>) => {
    if (!selected) return;
    setNovels(prev => prev.map(n =>
      n.id === selected.id
        ? { ...n, chapters: n.chapters.map(c => c.id === chapterId ? { ...c, ...patch } : c), updatedAt: Date.now() }
        : n
    ));
    setDirty(true);
  };

  const handleSave = () => {
    saveNovels(novels);
    setDirty(false);
    toast.success("SGR Novels 자료가 저장되었습니다.");
  };

  const handleNew = () => {
    const nn = emptyNovel();
    setNovels(prev => [nn, ...prev]);
    setSelectedId(nn.id);
    setSubTab("overview");
    setDirty(true);
  };

  const handleDuplicate = (id: string) => {
    const src = novels.find(n => n.id === id);
    if (!src) return;
    const dup: SGRNovel = {
      ...JSON.parse(JSON.stringify(src)),
      id: uid(),
      title: src.title + " (복사본)",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNovels(prev => [dup, ...prev]);
    setSelectedId(dup.id);
    setDirty(true);
  };

  const handleDelete = (id: string) => {
    setNovels(prev => {
      const next = prev.filter(n => n.id !== id);
      if (id === selectedId) setSelectedId(next[0]?.id || "");
      return next;
    });
    setShowDeleteConfirm(null);
    setDirty(true);
  };

  const handleLoadSample = () => {
    const s: SGRNovel = { ...JSON.parse(JSON.stringify(SAMPLE_NOVEL)), id: uid(), createdAt: Date.now(), updatedAt: Date.now() };
    setNovels(prev => [s, ...prev]);
    setSelectedId(s.id);
    setDirty(true);
    toast.success("샘플 소설(The Great Gatsby)을 불러왔습니다.");
  };

  // ─── Chapter handlers ───
  const handleAddChapter = () => {
    if (!selected) return;
    const nc = emptyChapter();
    nc.chapterNumber = `Chapter ${selected.chapters.length + 1}`;
    patchSelected({ chapters: [...selected.chapters, nc] });
    setExpandedChapter(nc.id);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (!selected) return;
    patchSelected({ chapters: selected.chapters.filter(c => c.id !== chapterId) });
  };

  const handleMoveChapter = (chapterId: string, dir: -1 | 1) => {
    if (!selected) return;
    const idx = selected.chapters.findIndex(c => c.id === chapterId);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= selected.chapters.length) return;
    const arr = [...selected.chapters];
    const [item] = arr.splice(idx, 1);
    arr.splice(newIdx, 0, item);
    patchSelected({ chapters: arr });
  };

  // ─── CSV / JSON ───
  const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const arr: SGRNovel[] = Array.isArray(data) ? data : [data];
      if (arr.length === 0) throw new Error("No novels");
      const withIds = arr.map(n => ({ ...n, id: n.id || uid(), createdAt: n.createdAt || Date.now(), updatedAt: Date.now() }));
      setNovels(prev => [...withIds, ...prev]);
      setSelectedId(withIds[0].id);
      setDirty(true);
      toast.success(`${withIds.length}개 소설 JSON 업로드 완료`);
    } catch (err) {
      console.error(err);
      toast.error("JSON 파싱에 실패했습니다. 형식을 확인해주세요.");
    } finally {
      if (jsonInputRef.current) jsonInputRef.current.value = "";
    }
  };

  const handleBulkJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const arr: SGRNovel[] = Array.isArray(data) ? data : [data];
      const withIds = arr.map(n => ({ ...n, id: n.id || uid(), createdAt: n.createdAt || Date.now(), updatedAt: Date.now() }));
      setNovels(prev => [...withIds, ...prev]);
      setSelectedId(withIds[0]?.id || "");
      setDirty(true);
      toast.success(`${withIds.length}개 소설 대량 업로드 완료`);
    } catch (err) {
      console.error(err);
      toast.error("대량 JSON 파싱에 실패했습니다.");
    } finally {
      if (bulkJsonInputRef.current) bulkJsonInputRef.current.value = "";
    }
  };

  // CSV: 단일 소설 (챕터 행 단위)
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const novel = parseCsvToNovel(text);
      setNovels(prev => [novel, ...prev]);
      setSelectedId(novel.id);
      setSubTab("overview");
      setDirty(true);
      toast.success(`CSV 업로드 완료: ${novel.title} (${novel.chapters.length} 챕터)`);
    } catch (err) {
      console.error(err);
      toast.error("CSV 파싱에 실패했습니다. 형식을 확인해주세요.");
    } finally {
      if (csvInputRef.current) csvInputRef.current.value = "";
    }
  };

  const handleCsvExport = () => {
    if (!selected) return;
    const csv = novelToCsv(selected);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sgr-novel-${selected.title.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTemplateDownload = () => {
    const csv = getCsvTemplate();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sgr-novel-template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV 템플릿을 다운로드했습니다.");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Library className="w-6 h-6 text-amber-500" /> SGR Novels 관리
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">소설 기반 수업용 콘텐츠 — 챕터별 Plot/Theme/Character/Quiz/직독직해</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleNew} className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg">
            <Plus className="w-4 h-4" /> 새 소설
          </button>
          <button onClick={handleLoadSample} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg">
            <BookOpen className="w-4 h-4" /> 샘플
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 text-white text-sm font-bold rounded-lg ${dirty ? "bg-rose-500 hover:bg-rose-600 animate-pulse" : "bg-emerald-500 hover:bg-emerald-600"}`}
          >
            <Save className="w-4 h-4" /> {dirty ? "저장 필요" : "저장됨"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Novel list */}
        <div className="lg:w-72 shrink-0">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="소설 검색..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
          />
          <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
            {filteredNovels.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">소설이 없습니다.</p>
            ) : filteredNovels.map(n => (
              <div
                key={n.id}
                onClick={() => { setSelectedId(n.id); setSubTab("overview"); setExpandedChapter(null); }}
                className={`cursor-pointer p-2.5 rounded-lg border transition-all ${
                  selectedId === n.id
                    ? "border-amber-400 bg-amber-50"
                    : "border-gray-200 bg-white hover:border-amber-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-800 truncate">{n.title}</div>
                    <div className="text-xs text-gray-500 truncate">{n.author}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">챕터 {n.chapters.length}</span>
                      {n.category && <span className="text-[10px] text-gray-400">{n.category}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <IconBtn onClick={() => handleDuplicate(n.id)} title="복제"><Copy className="w-3.5 h-3.5" /></IconBtn>
                    <IconBtn onClick={() => setShowDeleteConfirm(n.id)} title="삭제" danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0">
          {!selected ? (
            <div className="bg-white rounded-xl p-10 text-center text-gray-400">
              <Library className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>왼쪽에서 소설을 선택하거나 '새 소설'을 만들어주세요.</p>
            </div>
          ) : (
            <>
              {/* Sub tabs */}
              <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
                {SUB_TABS.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSubTab(t.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold border-b-2 transition-all ${
                        subTab === t.id
                          ? "border-amber-500 text-amber-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Overview tab */}
              {subTab === "overview" && (
                <div className="bg-white rounded-xl p-5">
                  <h2 className="text-lg font-bold text-gray-800 mb-3">소설 정보</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="제목 (Title)" value={selected.title} onChange={v => patchSelected({ title: v })} />
                    <Field label="저자 (Author)" value={selected.author} onChange={v => patchSelected({ author: v })} />
                    <Field label="출판연도" value={selected.publishedYear || ""} onChange={v => patchSelected({ publishedYear: v })} />
                    <Field label="난이도 (Level)" value={selected.level || ""} onChange={v => patchSelected({ level: v })} />
                    <Field label="카테고리 (Category)" value={selected.category || ""} onChange={v => patchSelected({ category: v })} />
                    <Field label="참고 URL (LitCharts 등)" value={selected.sourceUrl || ""} onChange={v => patchSelected({ sourceUrl: v })} />
                  </div>
                  <Field label="표지 이미지 URL (Cover Image URL)" value={selected.coverImage || ""} onChange={v => patchSelected({ coverImage: v })} placeholder="https://..." />
                  <Field label="소설 개요 (Description)" value={selected.description} onChange={v => patchSelected({ description: v })} textarea rows={3} />

                  {/* Novel-level themes */}
                  <NovelLevelThemesEditor novel={selected} patch={patchSelected} />
                  {/* Novel-level characters */}
                  <NovelLevelCharactersEditor novel={selected} patch={patchSelected} />
                  {/* Novel-level quotes */}
                  <NovelLevelQuotesEditor novel={selected} patch={patchSelected} />
                </div>
              )}

              {/* Chapters tab */}
              {subTab === "chapters" && (
                <div className="bg-white rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-800">챕터 목록 ({selected.chapters.length})</h2>
                    <button onClick={handleAddChapter} className="flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700">
                      <Plus className="w-4 h-4" /> 챕터 추가
                    </button>
                  </div>
                  {selected.chapters.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">챕터가 없습니다. '챕터 추가'를 눌러주세요.</p>
                  ) : (
                    <div className="space-y-2">
                      {selected.chapters.map((c, i) => (
                        <div key={c.id} className="rounded-lg border border-gray-200 overflow-hidden">
                          <div className="flex items-center gap-2 p-3 bg-gray-50">
                            <button onClick={() => setExpandedChapter(expandedChapter === c.id ? null : c.id)} className="text-gray-500">
                              {expandedChapter === c.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{c.chapterNumber}</span>
                            <span className="text-sm font-medium text-gray-800 flex-1 truncate">{c.title || "(제목 없음)"}</span>
                            <div className="flex items-center gap-0.5">
                              <IconBtn onClick={() => handleMoveChapter(c.id, -1)} title="위로"><ArrowUp className="w-3.5 h-3.5" /></IconBtn>
                              <IconBtn onClick={() => handleMoveChapter(c.id, 1)} title="아래로"><ArrowDown className="w-3.5 h-3.5" /></IconBtn>
                              <IconBtn onClick={() => handleDeleteChapter(c.id)} title="삭제" danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
                            </div>
                          </div>
                          <AnimatePresence>
                            {expandedChapter === c.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="p-4 border-t border-gray-200"
                              >
                                <ChapterEditor chapter={c} patch={(p) => patchChapter(c.id, p)} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CSV tab */}
              {subTab === "csv" && (
                <div className="bg-white rounded-xl p-5 space-y-4">
                  <h2 className="text-lg font-bold text-gray-800">CSV / JSON 업로드</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-5 text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-bold text-gray-700 mb-1">단일 소설 CSV</p>
                      <p className="text-xs text-gray-500 mb-3">META 행 + 챕터 행 단위</p>
                      <input ref={csvInputRef} type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
                      <button onClick={() => csvInputRef.current?.click()} className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700">CSV 선택</button>
                    </div>
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-5 text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-bold text-gray-700 mb-1">JSON 업로드</p>
                      <p className="text-xs text-gray-500 mb-3">소설 1개 또는 배열</p>
                      <input ref={jsonInputRef} type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
                      <button onClick={() => jsonInputRef.current?.click()} className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700">JSON 선택</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={handleCsvExport} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
                      <Download className="w-4 h-4" /> 현재 소설 CSV 내보내기
                    </button>
                    <button onClick={handleTemplateDownload} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
                      <FileText className="w-4 h-4" /> CSV 템플릿 다운로드
                    </button>
                    <input ref={bulkCsvInputRef} type="file" accept=".csv" className="hidden" />
                    <input ref={bulkJsonInputRef} type="file" accept=".json" onChange={handleBulkJsonUpload} className="hidden" />
                    <button onClick={() => bulkJsonInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
                      <Upload className="w-4 h-4" /> 대량 JSON 업로드
                    </button>
                  </div>
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800">
                    <p className="font-bold mb-1">CSV 형식 안내</p>
                    <p>META,title,The Great Gatsby</p>
                    <p>META,author,F. Scott Fitzgerald</p>
                    <p>META,description,...</p>
                    <p>CHAPTER,Chapter 1,The Narrator Arrives,plot summary...,plotKorean...,"paragraph1 || paragraph2"</p>
                    <p>THEME,Chapter 1,테마명,설명,인용문</p>
                    <p>CHARACTER,Chapter 1,이름,역할,설명</p>
                    <p>QUOTE,Chapter 1,인용문,화자,분석</p>
                    <p>QUIZ,Chapter 1,multiple_choice,질문,정답,"보기1|보기2|보기3",해설</p>
                    <p>QUIZ,Chapter 1,true_false,질문,true,,해설</p>
                    <p>QUIZ,Chapter 1,short_answer,질문,정답,,해설</p>
                    <p className="mt-1 text-amber-600">문단 구분자: ||  | 보기 구분자: |  | 셀 내 쉼표는 " " 로 감쌈</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">삭제 확인</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">이 소설과 모든 챕터 데이터를 삭제합니다. 되돌릴 수 없습니다.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowDeleteConfirm(null)} className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">취소</button>
                <button onClick={() => handleDelete(showDeleteConfirm)} className="px-3 py-1.5 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600">삭제</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Novel-level editors ─────────────────────────
function NovelLevelThemesEditor({ novel, patch }: { novel: SGRNovel; patch: (p: Partial<SGRNovel>) => void }) {
  const update = (themes: NovelTheme[]) => patch({ overallThemes: themes });
  return (
    <SectionCard title={`전체 테마 (${novel.overallThemes.length})`} icon={Sparkles} onAdd={() => update([...novel.overallThemes, emptyTheme()])} addLabel="테마 추가">
      {novel.overallThemes.length === 0 ? <p className="text-xs text-gray-400">테마가 없습니다.</p> : novel.overallThemes.map((t, i) => (
        <div key={t.id} className="rounded-lg border border-gray-200 p-3 mb-2">
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-gray-400 mt-2">{i + 1}.</span>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
              <Field label="테마명" value={t.name} onChange={v => update(novel.overallThemes.map(x => x.id === t.id ? { ...x, name: v } : x))} />
              <Field label="대표 인용문" value={t.quote || ""} onChange={v => update(novel.overallThemes.map(x => x.id === t.id ? { ...x, quote: v } : x))} />
            </div>
            <IconBtn onClick={() => update(novel.overallThemes.filter(x => x.id !== t.id))} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
          </div>
          <Field label="설명" value={t.description} onChange={v => update(novel.overallThemes.map(x => x.id === t.id ? { ...x, description: v } : x))} textarea rows={2} />
        </div>
      ))}
    </SectionCard>
  );
}

function NovelLevelCharactersEditor({ novel, patch }: { novel: SGRNovel; patch: (p: Partial<SGRNovel>) => void }) {
  const update = (characters: NovelCharacter[]) => patch({ overallCharacters: characters });
  return (
    <SectionCard title={`전체 인물 (${novel.overallCharacters.length})`} icon={Users} onAdd={() => update([...novel.overallCharacters, emptyCharacter()])} addLabel="인물 추가">
      {novel.overallCharacters.length === 0 ? <p className="text-xs text-gray-400">인물이 없습니다.</p> : novel.overallCharacters.map((c, i) => (
        <div key={c.id} className="rounded-lg border border-gray-200 p-3 mb-2">
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-gray-400 mt-2">{i + 1}.</span>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
              <Field label="이름" value={c.name} onChange={v => update(novel.overallCharacters.map(x => x.id === c.id ? { ...x, name: v } : x))} />
              <Field label="역할" value={c.role} onChange={v => update(novel.overallCharacters.map(x => x.id === c.id ? { ...x, role: v } : x))} />
            </div>
            <IconBtn onClick={() => update(novel.overallCharacters.filter(x => x.id !== c.id))} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
          </div>
          <Field label="설명" value={c.description} onChange={v => update(novel.overallCharacters.map(x => x.id === c.id ? { ...x, description: v } : x))} textarea rows={2} />
          <Field label="성격 특징 (쉼표로 구분)" value={(c.traits || []).join(", ")} onChange={v => update(novel.overallCharacters.map(x => x.id === c.id ? { ...x, traits: v.split(",").map(s => s.trim()).filter(Boolean) } : x))} />
        </div>
      ))}
    </SectionCard>
  );
}

function NovelLevelQuotesEditor({ novel, patch }: { novel: SGRNovel; patch: (p: Partial<SGRNovel>) => void }) {
  const update = (quotes: NovelQuote[]) => patch({ overallQuotes: quotes });
  return (
    <SectionCard title={`전체 인용문 (${novel.overallQuotes.length})`} icon={Quote} onAdd={() => update([...novel.overallQuotes, emptyQuote()])} addLabel="인용문 추가">
      {novel.overallQuotes.length === 0 ? <p className="text-xs text-gray-400">인용문이 없습니다.</p> : novel.overallQuotes.map((q, i) => (
        <div key={q.id} className="rounded-lg border border-gray-200 p-3 mb-2">
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-gray-400 mt-2">{i + 1}.</span>
            <div className="flex-1">
              <Field label="인용문" value={q.text} onChange={v => update(novel.overallQuotes.map(x => x.id === q.id ? { ...x, text: v } : x))} textarea rows={2} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Field label="화자" value={q.speaker || ""} onChange={v => update(novel.overallQuotes.map(x => x.id === q.id ? { ...x, speaker: v } : x))} />
                <Field label="분석(한국어)" value={q.analysisKorean || ""} onChange={v => update(novel.overallQuotes.map(x => x.id === q.id ? { ...x, analysisKorean: v } : x))} />
              </div>
              <Field label="분석(영어)" value={q.analysis || ""} onChange={v => update(novel.overallQuotes.map(x => x.id === q.id ? { ...x, analysis: v } : x))} textarea rows={2} />
            </div>
            <IconBtn onClick={() => update(novel.overallQuotes.filter(x => x.id !== q.id))} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
          </div>
        </div>
      ))}
    </SectionCard>
  );
}

// ─── Chapter editor (챕터별 상세) ──────────────────
function ChapterEditor({ chapter, patch }: { chapter: NovelChapter; patch: (p: Partial<NovelChapter>) => void }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Field label="챕터 번호" value={chapter.chapterNumber} onChange={v => patch({ chapterNumber: v })} />
        <Field label="챕터 제목" value={chapter.title} onChange={v => patch({ title: v })} />
        <Field label="예상 읽기 시간(분)" value={String(chapter.readingTime || "")} onChange={v => patch({ readingTime: v ? Number(v) : undefined })} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Field label="PDF URL (선택)" value={chapter.pdfUrl || ""} onChange={v => patch({ pdfUrl: v })} />
        <Field label="EPUB URL (선택)" value={chapter.epubUrl || ""} onChange={v => patch({ epubUrl: v })} />
      </div>

      {/* Plot summary */}
      <SectionCard title="Plot Summary" icon={FileText}>
        <Field label="Plot Summary (English)" value={chapter.plotSummary} onChange={v => patch({ plotSummary: v })} textarea rows={3} />
        <Field label="Plot Summary (한국어)" value={chapter.plotSummaryKorean || ""} onChange={v => patch({ plotSummaryKorean: v })} textarea rows={3} />
      </SectionCard>

      {/* Content paragraphs */}
      <SectionCard title={`본문 단락 (${chapter.contentParagraphs.length})`} icon={BookOpen}
        onAdd={() => patch({ contentParagraphs: [...chapter.contentParagraphs, emptyParagraph()] })} addLabel="단락 추가">
        {chapter.contentParagraphs.map((p, i) => (
          <div key={p.id} className="rounded-lg border border-gray-200 p-2 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-gray-400">단락 {i + 1}</span>
              <IconBtn onClick={() => patch({ contentParagraphs: chapter.contentParagraphs.filter(x => x.id !== p.id) })} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
            </div>
            <Field label="내용 (**bold**, __underline__ 지원)" value={p.content} onChange={v => patch({ contentParagraphs: chapter.contentParagraphs.map(x => x.id === p.id ? { ...x, content: v } : x) })} textarea rows={3} />
            <Field label="이미지 URL (선택)" value={p.image || ""} onChange={v => patch({ contentParagraphs: chapter.contentParagraphs.map(x => x.id === p.id ? { ...x, image: v } : x) })} />
            <Field label="이미지 캡션 (선택)" value={p.imageCaption || ""} onChange={v => patch({ contentParagraphs: chapter.contentParagraphs.map(x => x.id === p.id ? { ...x, imageCaption: v } : x) })} />
          </div>
        ))}
      </SectionCard>

      {/* Chapter themes */}
      <SectionCard title={`챕터 테마 (${chapter.themes.length})`} icon={Sparkles}
        onAdd={() => patch({ themes: [...chapter.themes, emptyTheme()] })} addLabel="테마 추가">
        {chapter.themes.map(t => (
          <div key={t.id} className="rounded-lg border border-gray-200 p-2 mb-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                <Field label="테마명" value={t.name} onChange={v => patch({ themes: chapter.themes.map(x => x.id === t.id ? { ...x, name: v } : x) })} />
                <Field label="인용문" value={t.quote || ""} onChange={v => patch({ themes: chapter.themes.map(x => x.id === t.id ? { ...x, quote: v } : x) })} />
              </div>
              <IconBtn onClick={() => patch({ themes: chapter.themes.filter(x => x.id !== t.id) })} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
            </div>
            <Field label="설명" value={t.description} onChange={v => patch({ themes: chapter.themes.map(x => x.id === t.id ? { ...x, description: v } : x) })} textarea rows={2} />
          </div>
        ))}
      </SectionCard>

      {/* Chapter characters */}
      <SectionCard title={`챕터 인물 (${chapter.characters.length})`} icon={Users}
        onAdd={() => patch({ characters: [...chapter.characters, emptyCharacter()] })} addLabel="인물 추가">
        {chapter.characters.map(c => (
          <div key={c.id} className="rounded-lg border border-gray-200 p-2 mb-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                <Field label="이름" value={c.name} onChange={v => patch({ characters: chapter.characters.map(x => x.id === c.id ? { ...x, name: v } : x) })} />
                <Field label="역할" value={c.role} onChange={v => patch({ characters: chapter.characters.map(x => x.id === c.id ? { ...x, role: v } : x) })} />
              </div>
              <IconBtn onClick={() => patch({ characters: chapter.characters.filter(x => x.id !== c.id) })} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
            </div>
            <Field label="설명" value={c.description} onChange={v => patch({ characters: chapter.characters.map(x => x.id === c.id ? { ...x, description: v } : x) })} textarea rows={2} />
          </div>
        ))}
      </SectionCard>

      {/* Chapter quotes */}
      <SectionCard title={`챕터 인용문 (${chapter.quotes.length})`} icon={Quote}
        onAdd={() => patch({ quotes: [...chapter.quotes, emptyQuote()] })} addLabel="인용문 추가">
        {chapter.quotes.map(q => (
          <div key={q.id} className="rounded-lg border border-gray-200 p-2 mb-2">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Field label="인용문" value={q.text} onChange={v => patch({ quotes: chapter.quotes.map(x => x.id === q.id ? { ...x, text: v } : x) })} textarea rows={2} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Field label="화자" value={q.speaker || ""} onChange={v => patch({ quotes: chapter.quotes.map(x => x.id === q.id ? { ...x, speaker: v } : x) })} />
                  <Field label="분석" value={q.analysis || ""} onChange={v => patch({ quotes: chapter.quotes.map(x => x.id === q.id ? { ...x, analysis: v } : x) })} />
                </div>
              </div>
              <IconBtn onClick={() => patch({ quotes: chapter.quotes.filter(x => x.id !== q.id) })} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
            </div>
          </div>
        ))}
      </SectionCard>

      {/* Chapter quizzes */}
      <SectionCard title={`챕터 퀴즈 (${chapter.quizzes.length})`} icon={HelpCircle}>
        <div className="flex gap-1.5 mb-2">
          {(["multiple_choice", "true_false", "fill_blank", "short_answer"] as QuizType[]).map(t => (
            <button key={t} onClick={() => patch({ quizzes: [...chapter.quizzes, emptyQuiz(t)] })}
              className="text-xs font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100">
              + {t === "multiple_choice" ? "객관식" : t === "true_false" ? "O/X" : t === "fill_blank" ? "빈칸" : "주관식"}
            </button>
          ))}
        </div>
        {chapter.quizzes.map((qz, i) => (
          <div key={qz.id} className="rounded-lg border border-gray-200 p-2 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-gray-400">Q{i + 1} · {qz.type}</span>
              <IconBtn onClick={() => patch({ quizzes: chapter.quizzes.filter(x => x.id !== qz.id) })} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
            </div>
            <Field label="질문 (fill_blank는 ___ 사용)" value={qz.question} onChange={v => patch({ quizzes: chapter.quizzes.map(x => x.id === qz.id ? { ...x, question: v } : x) })} textarea rows={2} />
            {qz.type === "multiple_choice" && (
              <>
                <Field label="보기 (| 로 구분)" value={(qz.options || []).join(" | ")} onChange={v => patch({ quizzes: chapter.quizzes.map(x => x.id === qz.id ? { ...x, options: v.split("|").map(s => s.trim()) } : x) })} />
                <Field label="정답 (보기 텍스트 그대로)" value={qz.answer} onChange={v => patch({ quizzes: chapter.quizzes.map(x => x.id === qz.id ? { ...x, answer: v } : x) })} />
              </>
            )}
            {qz.type === "true_false" && (
              <Field label="정답 (true 또는 false)" value={qz.answer} onChange={v => patch({ quizzes: chapter.quizzes.map(x => x.id === qz.id ? { ...x, answer: v === "true" ? "true" : "false" } : x) })} />
            )}
            {(qz.type === "fill_blank" || qz.type === "short_answer") && (
              <Field label="정답" value={qz.answer} onChange={v => patch({ quizzes: chapter.quizzes.map(x => x.id === qz.id ? { ...x, answer: v } : x) })} />
            )}
            <Field label="해설 (선택)" value={qz.explanation || ""} onChange={v => patch({ quizzes: chapter.quizzes.map(x => x.id === qz.id ? { ...x, explanation: v } : x) })} />
          </div>
        ))}
      </SectionCard>

      {/* Chapter directReading */}
      <SectionCard title={`직독직해 (${chapter.directReading.length})`} icon={Zap}
        onAdd={() => patch({ directReading: [...chapter.directReading, emptyDirectReading()] })} addLabel="항목 추가">
        {chapter.directReading.map(d => (
          <div key={d.id} className="rounded-lg border border-gray-200 p-2 mb-2">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Field label="English" value={d.english} onChange={v => patch({ directReading: chapter.directReading.map(x => x.id === d.id ? { ...x, english: v } : x) })} textarea rows={2} />
                <Field label="한국어" value={d.korean} onChange={v => patch({ directReading: chapter.directReading.map(x => x.id === d.id ? { ...x, korean: v } : x) })} textarea rows={2} />
                <Field label="청크 (| 로 구분)" value={(d.chunks || []).join(" | ")} onChange={v => patch({ directReading: chapter.directReading.map(x => x.id === d.id ? { ...x, chunks: v.split("|").map(s => s.trim()).filter(Boolean) } : x) })} />
              </div>
              <IconBtn onClick={() => patch({ directReading: chapter.directReading.filter(x => x.id !== d.id) })} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

// ─── CSV 파싱 / 직렬화 ──────────────────────────────
// 간단한 CSV 파서 (따옴표, 쉼표 처리)
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { result.push(cur); cur = ""; }
      else cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function parseCsvToNovel(text: string): SGRNovel {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const novel: SGRNovel = emptyNovel();
  const chapterMap = new Map<string, NovelChapter>();

  for (const line of lines) {
    const cells = parseCsvLine(line);
    const type = cells[0]?.trim().toUpperCase();
    if (!type) continue;

    if (type === "META") {
      const key = cells[1]?.trim();
      const val = cells[2] || "";
      if (key === "title") novel.title = val;
      else if (key === "author") novel.author = val;
      else if (key === "description") novel.description = val;
      else if (key === "level") novel.level = val;
      else if (key === "category") novel.category = val;
      else if (key === "sourceUrl") novel.sourceUrl = val;
      else if (key === "publishedYear") novel.publishedYear = val;
      else if (key === "coverImage") novel.coverImage = val;
    } else if (type === "CHAPTER") {
      const chNum = cells[1] || `Chapter ${chapterMap.size + 1}`;
      const ch: NovelChapter = {
        ...emptyChapter(),
        id: uid(),
        chapterNumber: chNum,
        title: cells[2] || "",
        plotSummary: cells[3] || "",
        plotSummaryKorean: cells[4] || "",
        contentParagraphs: (cells[5] || "").split("||").map(p => p.trim()).filter(Boolean).map(content => ({ id: uid(), content })),
      };
      chapterMap.set(chNum, ch);
    } else if (type === "THEME") {
      const ch = ensureChapter(chapterMap, cells[1]);
      ch.themes.push({ id: uid(), name: cells[2] || "", description: cells[3] || "", quote: cells[4] || "" });
    } else if (type === "CHARACTER") {
      const ch = ensureChapter(chapterMap, cells[1]);
      ch.characters.push({ id: uid(), name: cells[2] || "", role: cells[3] || "", description: cells[4] || "" });
    } else if (type === "QUOTE") {
      const ch = ensureChapter(chapterMap, cells[1]);
      ch.quotes.push({ id: uid(), text: cells[2] || "", speaker: cells[3] || "", analysis: cells[4] || "" });
    } else if (type === "QUIZ") {
      const ch = ensureChapter(chapterMap, cells[1]);
      const qType = (cells[2] as QuizType) || "multiple_choice";
      const question = cells[3] || "";
      const answer = cells[4] || "";
      const optionsStr = cells[5] || "";
      const explanation = cells[6] || "";
      const qz: NovelQuiz = {
        id: uid(),
        type: qType,
        question,
        answer,
        explanation,
        options: qType === "multiple_choice" ? optionsStr.split("|").map(s => s.trim()).filter(Boolean) : undefined,
      };
      ch.quizzes.push(qz);
    } else if (type === "DIRECT") {
      const ch = ensureChapter(chapterMap, cells[1]);
      ch.directReading.push({
        id: uid(),
        english: cells[2] || "",
        korean: cells[3] || "",
        chunks: (cells[4] || "").split("|").map(s => s.trim()).filter(Boolean),
        grammarPoints: [],
      });
    }
  }

  novel.chapters = Array.from(chapterMap.values());
  if (novel.chapters.length === 0) novel.chapters = [emptyChapter()];
  novel.id = uid();
  novel.createdAt = Date.now();
  novel.updatedAt = Date.now();
  return novel;
}

function ensureChapter(map: Map<string, NovelChapter>, chNum: string): NovelChapter {
  const key = chNum || `Chapter ${map.size + 1}`;
  if (!map.has(key)) {
    map.set(key, { ...emptyChapter(), id: uid(), chapterNumber: key });
  }
  return map.get(key)!;
}

function novelToCsv(novel: SGRNovel): string {
  const rows: string[] = [];
  const q = (s: string) => `"${(s || "").replace(/"/g, '""')}"`;
  rows.push(`META,title,${q(novel.title)}`);
  rows.push(`META,author,${q(novel.author)}`);
  rows.push(`META,description,${q(novel.description)}`);
  if (novel.level) rows.push(`META,level,${q(novel.level)}`);
  if (novel.category) rows.push(`META,category,${q(novel.category)}`);
  if (novel.sourceUrl) rows.push(`META,sourceUrl,${q(novel.sourceUrl)}`);
  if (novel.publishedYear) rows.push(`META,publishedYear,${q(novel.publishedYear)}`);
  if (novel.coverImage) rows.push(`META,coverImage,${q(novel.coverImage)}`);

  for (const c of novel.chapters) {
    const paras = c.contentParagraphs.map(p => p.content).join(" || ");
    rows.push(`CHAPTER,${q(c.chapterNumber)},${q(c.title)},${q(c.plotSummary)},${q(c.plotSummaryKorean || "")},${q(paras)}`);
    for (const t of c.themes) rows.push(`THEME,${q(c.chapterNumber)},${q(t.name)},${q(t.description)},${q(t.quote || "")}`);
    for (const ch of c.characters) rows.push(`CHARACTER,${q(c.chapterNumber)},${q(ch.name)},${q(ch.role)},${q(ch.description)}`);
    for (const qq of c.quotes) rows.push(`QUOTE,${q(c.chapterNumber)},${q(qq.text)},${q(qq.speaker || "")},${q(qq.analysis || "")}`);
    for (const qz of c.quizzes) {
      const opts = qz.options ? qz.options.join("|") : "";
      rows.push(`QUIZ,${q(c.chapterNumber)},${qz.type},${q(qz.question)},${q(qz.answer)},${q(opts)},${q(qz.explanation || "")}`);
    }
    for (const d of c.directReading) rows.push(`DIRECT,${q(c.chapterNumber)},${q(d.english)},${q(d.korean)},${q((d.chunks || []).join("|"))}`);
  }
  return rows.join("\n");
}

function getCsvTemplate(): string {
  return [
    "META,title,\"Sample Novel\"",
    "META,author,\"Sample Author\"",
    "META,description,\"A sample novel for SGR Novels.\"",
    "META,level,\"High School\"",
    "META,category,\"Classic\"",
    "META,sourceUrl,\"https://www.litcharts.com/lit/sample\"",
    "META,publishedYear,\"1925\"",
    "CHAPTER,\"Chapter 1\",\"The Beginning\",\"Plot summary in English...\",\"줄거리 한국어 요약...\",\"First paragraph here. || Second paragraph here.\"",
    "THEME,\"Chapter 1\",\"Hope\",\"Description of the theme.\",\"A representative quote.\"",
    "CHARACTER,\"Chapter 1\",\"Protagonist\",\"Main character\",\"Description of the character.\"",
    "QUOTE,\"Chapter 1\",\"A key quote.\",\"Speaker\",\"Analysis of the quote.\"",
    "QUIZ,\"Chapter 1\",\"multiple_choice\",\"What happens in Chapter 1?\",\"Option A\",\"Option A|Option B|Option C\",\"Explanation here.\"",
    "QUIZ,\"Chapter 1\",\"true_false\",\"The protagonist is brave.\",\"true\",\"\",\"Explanation.\"",
    "QUIZ,\"Chapter 1\",\"short_answer\",\"What is the main symbol?\",\"green light\",\"\",\"Explanation.\"",
    "DIRECT,\"Chapter 1\",\"It was the best of times.\",\"그것은 최고의 시대였다.\",\"It was the best of times|.\",",
  ].join("\n");
}
