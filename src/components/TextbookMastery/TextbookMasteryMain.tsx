import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Zap, Target, Brain, Search, FileText, Download, Printer, FileDown, ChevronLeft, Volume2, Check, Pencil } from "lucide-react";
import { VocaBuildUp } from "./VocaBuildUp";
import { ScaffoldingTraining } from "./ScaffoldingTraining";
import type { LessonData, SentenceItem, ParagraphItem } from "./types";
import { SAMPLE_LESSON, SAMPLE_LESSON_KOREAN } from "./types";
import { downloadMasteryExamPDF, downloadMasteryExamWord, downloadMasteryVocaPDF, downloadMasteryBlankPDF } from "../../utils/downloadHelpers";

const STORAGE_KEY = "textbookMastery_lessons";

function loadLessonsFromStorage(): LessonData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [SAMPLE_LESSON, SAMPLE_LESSON_KOREAN];
}

function formatLessonLabel(lesson: LessonData): string {
  const { subject, category, semester } = lesson;
  let schoolLevel = "";
  let grade = "";
  if (category.startsWith("초")) { schoolLevel = "초등"; grade = category.replace("초", ""); }
  else if (category.startsWith("중")) { schoolLevel = "중등"; grade = category.replace("중", ""); }
  else if (category.startsWith("고")) { schoolLevel = "고등"; grade = category.replace("고", ""); }
  else return `${subject} · ${category}${semester ? ` · ${semester}학기` : ""}`;
  return semester ? `${schoolLevel}${subject} ${grade}-${semester}` : `${schoolLevel}${subject} ${grade}`;
}

interface TextbookMasteryMainProps {
  subject?: string;
  category?: string;
}

const TABS = [
  { id: "text",   label: "본문·해석",  icon: BookOpen },
  { id: "voca",   label: "단어",        icon: Zap },
  { id: "phrase", label: "핵심구문",    icon: Target },
  { id: "blank",  label: "빈칸",        icon: Brain },
];

// ─── 본문·해석 탭 ───
function TextPassageView({ sentences, paragraphs }: { sentences: SentenceItem[]; paragraphs: ParagraphItem[] }) {
  const [expandedGrammar, setExpandedGrammar] = useState<number | null>(null);

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  const grouped = paragraphs.map(p => ({ ...p, sentences: sentences.filter(s => s.paragraphId === p.id) }));

  return (
    <div className="space-y-6">
      {grouped.map(para => (
        <div key={para.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-gradient-to-r from-cyan-50 to-white border-b border-gray-100 flex items-center gap-2">
            <span className="text-xs font-bold text-white bg-cyan-500 px-2 py-0.5 rounded">{para.id}단락</span>
            <span className="text-sm font-bold text-gray-700">{para.topic}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {para.sentences.map(s => (
              <div key={s.id} className="px-5 py-4">
                {/* 영어 + 한국어 좌우 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  {/* 영어 */}
                  <div className="flex items-start gap-2">
                    <span className="mt-1 w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">{s.id}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] leading-relaxed text-gray-800 font-medium">
                        {s.chunks.map((chunk, i) => (
                          <span key={i}>
                            {i > 0 && <span className="text-cyan-400 mx-1">/</span>}
                            <span>{chunk}</span>
                          </span>
                        ))}
                      </p>
                      {s.grammarPoint && (
                        <button
                          onClick={() => setExpandedGrammar(expandedGrammar === s.id ? null : s.id)}
                          className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium hover:bg-indigo-100"
                        >
                          <Zap className="w-3 h-3" />
                          {s.grammarPoint.replace(/\s*\(.*?\)$/, "")}
                        </button>
                      )}
                      <AnimatePresence>
                        {expandedGrammar === s.id && s.grammarPoint && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                              <p className="text-xs text-indigo-700 font-medium">{s.grammarPoint}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button onClick={() => speak(s.english)} className="mt-1 text-gray-300 hover:text-cyan-500 transition-colors flex-shrink-0">
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* 한국어 */}
                  <div className="md:border-l md:border-dashed md:border-gray-200 md:pl-6">
                    <p className="text-[14px] leading-relaxed text-gray-500">{s.korean}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 핵심구문 탭 ───
function KeyPhrasesView({ sentences }: { sentences: SentenceItem[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  const keyItems = sentences.filter(s => s.importance === "high" || s.grammarPoint);

  if (keyItems.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>등록된 핵심구문이 없습니다.</p>
        <p className="text-sm mt-1">CMS에서 importance를 'high'로 설정하거나 grammarPoint를 입력하세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">총 <span className="font-bold text-cyan-600">{keyItems.length}개</span>의 핵심구문</p>
      {keyItems.map((s, idx) => {
        const isExpanded = expandedId === s.id;
        const grammarLabel = s.grammarPoint?.replace(/\s*\(.*?\)$/, "") || "";
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          >
            <div
              className="px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : s.id)}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  {s.importance === "high" && (
                    <span className="inline-block mb-1.5 text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded font-bold">시험빈출</span>
                  )}
                  <p className="text-[15px] font-bold text-gray-800 leading-relaxed">
                    {s.chunks.map((chunk, i) => (
                      <span key={i}>{i > 0 && <span className="text-cyan-300 mx-1">/</span>}{chunk}</span>
                    ))}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{s.korean}</p>
                  {grammarLabel && (
                    <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                      <Zap className="w-3 h-3" />{grammarLabel}
                    </span>
                  )}
                </div>
                <button onClick={(e) => { e.stopPropagation(); speak(s.english); }} className="mt-1 text-gray-300 hover:text-cyan-500 flex-shrink-0">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <AnimatePresence>
              {isExpanded && s.grammarPoint && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-5 pb-4 pt-0 border-t border-gray-100">
                    <div className="bg-indigo-50 rounded-lg p-3 mt-2">
                      <p className="text-sm font-bold text-indigo-700 mb-1">{grammarLabel}</p>
                      <p className="text-sm text-indigo-600">{s.grammarPoint}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── 메인 컴포넌트 ───
export function TextbookMasteryMain({ subject, category }: TextbookMasteryMainProps) {
  const [lessons, setLessons] = useState<LessonData[]>(loadLessonsFromStorage);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("text");
  const [showDownloadMenu, setShowDownloadMenu] = useState<string | null>(null);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editLabel, setEditLabel] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const lesson = lessons.find(l => l.id === selectedLessonId) || null;

  useEffect(() => {
    const handleUpdate = () => setLessons(loadLessonsFromStorage());
    window.addEventListener("textbookMasteryUpdated", handleUpdate);
    return () => window.removeEventListener("textbookMasteryUpdated", handleUpdate);
  }, []);

  const updateLessonData = (updated: LessonData) => {
    setLessons(prev => {
      const next = prev.map(l => l.id === updated.id ? updated : l);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("textbookMasteryUpdated"));
      return next;
    });
  };

  // ─── 레슨 선택 화면 ───
  if (!lesson) {
    const filteredLessons = lessons.filter(l => {
      const matchesSubject = subject ? l.subject === subject : true;
      const matchesCategory = category ? l.category === category : true;
      const matchesSearch = searchTerm
        ? l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.subject.includes(searchTerm) || l.category.includes(searchTerm)
        : true;
      return matchesSubject && matchesCategory && matchesSearch;
    });

    return (
      <div className="min-h-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-1">
            <BookOpen className="w-6 h-6 text-cyan-600" />교과서 뽀개기
          </h2>
          <p className="text-sm text-gray-500">학습할 레슨을 선택하세요.</p>
        </div>
        <div className="relative mb-5 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="레슨 검색..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-cyan-400 focus:outline-none" />
        </div>
        {filteredLessons.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">등록된 레슨이 없습니다</p>
            <p className="text-sm text-gray-400 mt-1">CMS에서 레슨을 추가하세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map((l, idx) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                className="bg-white rounded-xl border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all overflow-hidden cursor-pointer group"
                onClick={() => { setSelectedLessonId(l.id); setCurrentTab("text"); }}
              >
                <div className="h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500" />
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 truncate group-hover:text-cyan-700 mb-0.5">{l.title}</h3>
                  <p className="text-xs text-gray-500 font-medium mb-3">{formatLessonLabel(l)}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full">
                      <Zap className="w-3 h-3" />단어 {l.vocabulary.length}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      <FileText className="w-3 h-3" />문장 {l.sentences.length}
                    </span>
                  </div>
                  {/* 다운로드 버튼 */}
                  <div className="flex gap-2 mt-4" onClick={e => e.stopPropagation()}>
                    <div className="relative flex-1">
                      <button onClick={e => { e.stopPropagation(); setShowDownloadMenu(showDownloadMenu === l.id ? null : l.id); }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-cyan-50 text-gray-600 hover:text-cyan-700 rounded-lg text-sm font-medium border border-gray-200">
                        <Download className="w-3.5 h-3.5" />다운로드
                      </button>
                      <AnimatePresence>
                        {showDownloadMenu === l.id && (
                          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                            className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                            <button onClick={e => { e.stopPropagation(); downloadMasteryExamPDF(l); setShowDownloadMenu(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50">
                              <Printer className="w-3.5 h-3.5" />시험지+정답지 (PDF)
                            </button>
                            <button onClick={e => { e.stopPropagation(); downloadMasteryExamWord(l); setShowDownloadMenu(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 border-t border-gray-100">
                              <FileDown className="w-3.5 h-3.5" />시험지+정답지 (Word)
                            </button>
                            {l.vocabulary.length > 0 && (
                              <button onClick={e => { e.stopPropagation(); downloadMasteryVocaPDF(l); setShowDownloadMenu(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 border-t border-gray-100">
                                <Zap className="w-3.5 h-3.5" />단어 시험지 (PDF)
                              </button>
                            )}
                            {l.sentences.length > 0 && (
                              <button onClick={e => { e.stopPropagation(); downloadMasteryBlankPDF(l); setShowDownloadMenu(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 border-t border-gray-100">
                                <Zap className="w-3.5 h-3.5" />빈칸 시험지 (PDF)
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── 레슨 학습 화면 ───
  const tabIdx = TABS.findIndex(t => t.id === currentTab);

  return (
    <div className="min-h-0">
      <div className="px-4 md:px-6 pt-4 pb-0">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedLessonId(null)}
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            {isEditingHeader ? (
              <div className="flex items-center gap-2">
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="레슨 제목"
                  className="text-base font-bold bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-400 w-64" />
                <button onClick={() => { if (lesson && editTitle.trim()) updateLessonData({ ...lesson, title: editTitle.trim() }); setIsEditingHeader(false); }}
                  className="p-1.5 bg-cyan-600 text-white rounded-lg">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setIsEditingHeader(false)} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm">취소</button>
              </div>
            ) : (
              <div className="group cursor-pointer" onClick={() => { setEditTitle(lesson.title); setIsEditingHeader(true); }}>
                <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full">{formatLessonLabel(lesson)}</span>
                <div className="flex items-center gap-1 mt-1">
                  <h2 className="text-lg font-bold text-gray-800">{lesson.title}</h2>
                  <Pencil className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            )}
          </div>
          {/* 다운로드 */}
          <div className="relative">
            <button onClick={() => setShowDownloadMenu(showDownloadMenu === "study" ? null : "study")}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50">
              <Download className="w-4 h-4" />다운로드
            </button>
            <AnimatePresence>
              {showDownloadMenu === "study" && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  <button onClick={() => { downloadMasteryExamPDF(lesson); setShowDownloadMenu(null); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50">
                    <Printer className="w-3.5 h-3.5" />시험지+정답지 (PDF)
                  </button>
                  <button onClick={() => { downloadMasteryExamWord(lesson); setShowDownloadMenu(null); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 border-t border-gray-100">
                    <FileDown className="w-3.5 h-3.5" />시험지+정답지 (Word)
                  </button>
                  {lesson.vocabulary.length > 0 && (
                    <button onClick={() => { downloadMasteryVocaPDF(lesson); setShowDownloadMenu(null); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 border-t border-gray-100">
                      <Zap className="w-3.5 h-3.5" />단어 시험지 (PDF)
                    </button>
                  )}
                  {lesson.sentences.length > 0 && (
                    <button onClick={() => { downloadMasteryBlankPDF(lesson); setShowDownloadMenu(null); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 border-t border-gray-100">
                      <Zap className="w-3.5 h-3.5" />빈칸 시험지 (PDF)
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 탭 바 */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all -mb-px ${
                  isActive ? "border-cyan-500 text-cyan-600" : "border-transparent text-gray-400 hover:text-gray-700"
                }`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 2)}</span>
              </button>
            );
          })}
          {/* 탭 위치 표시 */}
          <div className="ml-auto flex items-center pr-1">
            <span className="text-xs text-gray-400 font-medium">{tabIdx + 1} / {TABS.length}</span>
          </div>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div key={currentTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
          className={currentTab === "text" || currentTab === "blank" ? "px-4 md:px-6" : "px-4 md:px-6"}
        >
          {currentTab === "text" && (
            <TextPassageView sentences={lesson.sentences} paragraphs={lesson.paragraphs} />
          )}
          {currentTab === "voca" && (
            <VocaBuildUp vocabulary={lesson.vocabulary} onComplete={() => {}} />
          )}
          {currentTab === "phrase" && (
            <KeyPhrasesView sentences={lesson.sentences} />
          )}
          {currentTab === "blank" && (
            <ScaffoldingTraining
              sentences={lesson.sentences}
              onComplete={() => {}}
              onWrongAnswer={() => {}}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* 하단 탭 이동 */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200 px-4 md:px-6">
        <button onClick={() => { if (tabIdx > 0) setCurrentTab(TABS[tabIdx - 1].id); }}
          disabled={tabIdx === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tabIdx === 0 ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}>
          <ChevronLeft className="w-4 h-4" />이전
        </button>
        <div className="flex gap-1.5">
          {TABS.map((tab, i) => (
            <button key={tab.id} onClick={() => setCurrentTab(tab.id)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === tabIdx ? "bg-cyan-500 w-5" : "bg-gray-300 hover:bg-gray-400"}`} />
          ))}
        </div>
        <button onClick={() => { if (tabIdx < TABS.length - 1) setCurrentTab(TABS[tabIdx + 1].id); }}
          disabled={tabIdx === TABS.length - 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tabIdx === TABS.length - 1 ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-cyan-600 text-white hover:bg-cyan-700 shadow-md"
          }`}>
          다음<ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
}
