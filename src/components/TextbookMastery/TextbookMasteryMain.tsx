import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, BookOpen, Brain, Layers, Target, Search, FileText, Download, Printer, FileDown, ChevronLeft, ChevronRight, AlertTriangle, Trophy, CheckCircle2, Lock, RotateCcw, Flame, Sparkles, Pencil, Check } from "lucide-react";
import { VocaBuildUp } from "./VocaBuildUp";
import { TextAnalysis } from "./TextAnalysis";
import { ScaffoldingTraining } from "./ScaffoldingTraining";
import { FlowChart } from "./FlowChart";
import { MockTest } from "./MockTest";
import { ParagraphSummary } from "./ParagraphSummary";
import type { LessonData, StepProgress, WeaknessItem } from "./types";
import { SAMPLE_LESSON, SAMPLE_LESSON_KOREAN } from "./types";
import { downloadMasteryExamPDF, downloadMasteryExamWord, downloadMasteryVocaPDF, downloadMasteryBlankPDF } from "../../utils/downloadHelpers";

// ─── localStorage 키 (LMSTextbookMastery와 동일) ───
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

// 레슨 표시 형식: "중등영어 1-1", "고등국어 2-2" 형태로 변환
function formatLessonLabel(lesson: LessonData): string {
  const { subject, category, semester } = lesson;
  
  // category에서 학교급 추출
  let schoolLevel = "";
  let grade = "";
  
  if (category.startsWith("초")) {
    schoolLevel = "초등";
    grade = category.replace("초", "");
  } else if (category.startsWith("중")) {
    schoolLevel = "중등";
    grade = category.replace("중", "");
  } else if (category.startsWith("고")) {
    schoolLevel = "고등";
    grade = category.replace("고", "");
  } else {
    // 기본 형식 (예외 케이스)
    return `${subject} · ${category}${semester ? ` · ${semester}학기` : ""}`;
  }
  
  // "중등영어 1-1" 형태로 반환
  if (semester) {
    return `${schoolLevel}${subject} ${grade}-${semester}`;
  } else {
    return `${schoolLevel}${subject} ${grade}`;
  }
}

interface TextbookMasteryMainProps {
  subject?: string;
  category?: string;
}

const ALL_STEPS = [
  { id: 1, key: 'step2_analysis', tabKey: 'analysis', label: '본문 완전 분석', shortLabel: '분석', icon: BookOpen, color: 'blue', description: 'Text Analysis' },
  { id: 2, key: 'step1_voca', tabKey: 'voca', label: '단어 웜업', shortLabel: '단어', icon: Zap, color: 'cyan', description: 'Voca Build-up' },
  { id: 3, key: 'step3_scaffolding', tabKey: 'scaffolding', label: '본문 체화', shortLabel: '체화', icon: Brain, color: 'purple', description: 'Scaffolding Training' },
  { id: 4, key: 'step4_flow', tabKey: 'flow', label: '구조 파악', shortLabel: '구조', icon: Layers, color: 'amber', description: 'Flow Chart' },
  { id: 5, key: 'step5_mock', tabKey: 'mock', label: '실전 뽀개기', shortLabel: '실전', icon: Target, color: 'red', description: 'Mock Test' },
];

const STEP_COLORS: Record<string, { bg: string; text: string; ring: string; gradient: string }> = {
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', ring: 'ring-cyan-400', gradient: 'from-cyan-400 to-cyan-600' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-400', gradient: 'from-blue-400 to-blue-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', ring: 'ring-purple-400', gradient: 'from-purple-400 to-purple-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-400', gradient: 'from-amber-400 to-amber-600' },
  red: { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-400', gradient: 'from-red-400 to-red-600' },
};

export function TextbookMasteryMain({ subject, category }: TextbookMasteryMainProps) {
  const [lessons, setLessons] = useState<LessonData[]>(loadLessonsFromStorage);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const lesson = lessons.find(l => l.id === selectedLessonId) || null;

  // localStorage 변경 감지 (LMS에서 수정 시 동기화)
  useEffect(() => {
    const handleUpdate = () => setLessons(loadLessonsFromStorage());
    window.addEventListener("textbookMasteryUpdated", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) handleUpdate();
    });
    return () => {
      window.removeEventListener("textbookMasteryUpdated", handleUpdate);
      // storage listener도 정리 (간략화)
    };
  }, []);

  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState<StepProgress>({
    step1_voca: 0,
    step2_analysis: 0,
    step3_scaffolding: 0,
    step4_flow: 0,
    step5_mock: 0,
  });
  const [weaknesses, setWeaknesses] = useState<WeaknessItem[]>([]);
  const [showWeakness, setShowWeakness] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState<string | null>(null);
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editLabel, setEditLabel] = useState("");
  const [editTitle, setEditTitle] = useState("");

  // Update lesson in state and localStorage
  const updateLessonData = (updated: LessonData) => {
    setLessons(prev => {
      const next = prev.map(l => l.id === updated.id ? updated : l);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("textbookMasteryUpdated"));
      return next;
    });
  };

  // Load saved progress from localStorage
  useEffect(() => {
    if (lesson) {
      const saved = localStorage.getItem(`mastery_progress_${lesson.id}`);
      if (saved) {
        try { setProgress(JSON.parse(saved)); } catch {}
      }
      const savedWeak = localStorage.getItem(`mastery_weakness_${lesson.id}`);
      if (savedWeak) {
        try { setWeaknesses(JSON.parse(savedWeak)); } catch {}
      }
    }
  }, [lesson]);

  const saveProgress = (newProgress: StepProgress) => {
    if (lesson) {
      setProgress(newProgress);
      localStorage.setItem(`mastery_progress_${lesson.id}`, JSON.stringify(newProgress));
    }
  };

  const saveWeakness = (item: WeaknessItem) => {
    if (lesson) {
      setWeaknesses(prev => {
        const existing = prev.find(w => w.sentenceId === item.sentenceId && w.type === item.type);
        let newList;
        if (existing) {
          newList = prev.map(w => w.sentenceId === item.sentenceId && w.type === item.type ? { ...w, wrongCount: w.wrongCount + 1, lastWrong: item.lastWrong } : w);
        } else {
          newList = [...prev, item];
        }
        localStorage.setItem(`mastery_weakness_${lesson.id}`, JSON.stringify(newList));
        return newList;
      });
    }
  };

  // Total progress gauge
  const totalProgress = Object.values(progress).reduce((sum, v) => sum + v, 0) / 5;

  // Step completion check
  const isStepComplete = (stepKey: string) => {
    return progress[stepKey as keyof StepProgress] >= 80;
  };

  const isStepUnlocked = (stepId: number) => {
    if (stepId === 1) return true;
    return isStepComplete(ALL_STEPS[stepId - 2].key);
  };

  const handleStepClick = (stepId: number) => {
    if (!isStepUnlocked(stepId)) return; // Block locked steps
    setCurrentStep(stepId);
    setShowWeakness(false);
  };

  // Step completion handlers
  const handleVocaComplete = (knownCount: number, totalCount: number) => {
    const pct = Math.round((knownCount / totalCount) * 100);
    saveProgress({ ...progress, step1_voca: pct });
  };

  const handleAnalysisComplete = () => {
    saveProgress({ ...progress, step2_analysis: 100 });
  };

  const handleScaffoldingComplete = () => {
    saveProgress({ ...progress, step3_scaffolding: Math.min(progress.step3_scaffolding + 33, 100) });
  };

  const handleFlowComplete = () => {
    saveProgress({ ...progress, step4_flow: Math.min(progress.step4_flow + 50, 100) });
  };

  const handleMockComplete = (score: number, total: number) => {
    const pct = Math.round((score / total) * 100);
    saveProgress({ ...progress, step5_mock: pct });
  };

  const handleWrongAnswer = (sentenceId: number, type: string) => {
    const sentence = lesson?.sentences.find(s => s.id === sentenceId);
    if (sentence) {
      saveWeakness({
        sentenceId,
        sentence: sentence.english,
        wrongCount: 1,
        lastWrong: new Date().toISOString(),
        type: type as any,
      });
    }
  };

  // ─── 레슨 선택 화면 ───
  if (!lesson) {
    // 과목과 학년(카테고리)으로 필터링
    const filteredLessons = lessons.filter(l => {
      const matchesSubject = subject ? l.subject === subject : true;
      const matchesCategory = category ? l.category === category : true;
      const matchesSearch = searchTerm 
        ? l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.subject.includes(searchTerm) ||
          l.category.includes(searchTerm)
        : true;
      return matchesSubject && matchesCategory && matchesSearch;
    });

    return (
      <div className="min-h-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-1">
            <BookOpen className="w-6 h-6 text-cyan-600" />
            교과서 뽀개기
          </h2>
          <p className="text-sm text-gray-500">학습할 레슨을 선택하세요. CMS에서 레슨을 추가·편집할 수 있습니다.</p>
          {(subject || category) && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-bold text-white bg-cyan-600 px-3 py-1.5 rounded-full">
                {subject || '전체 과목'} {category ? `· ${category}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* 검색 */}
        <div className="relative mb-5 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="레슨 제목, 과목, 카테고리 검색..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {filteredLessons.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {subject || category ? `${subject || '선택한 과목'} ${category || '학년'}에 등록된 레슨이 없습니다` : '등록된 레슨이 없습니다'}
            </p>
            <p className="text-sm text-gray-400 mt-1">CMS 관리자 페이지에서 레슨을 추가하세요.</p>
            {(subject || category) && (
              <div className="mt-4 p-4 bg-cyan-50 border border-cyan-200 rounded-lg max-w-md mx-auto">
                <p className="text-xs text-cyan-800">
                  💡 현재 <strong>{subject || '전체'} {category && `· ${category}`}</strong> 레슨만 표시됩니다.<br />
                  다른 과목 레슨을 보려면 상단 메뉴에서 과목을 변경하세요.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map((l, idx) => {
              const savedProgress = (() => {
                try {
                  const raw = localStorage.getItem(`mastery_progress_${l.id}`);
                  if (raw) {
                    const p = JSON.parse(raw) as StepProgress;
                    return Math.round(Object.values(p).reduce((s, v) => s + v, 0) / 5);
                  }
                } catch {}
                return 0;
              })();

              return (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-xl border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all text-left group overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedLessonId(l.id);
                    setCurrentStep(1);
                    setProgress({ step1_voca: 0, step2_analysis: 0, step3_scaffolding: 0, step4_flow: 0, step5_mock: 0 });
                    setWeaknesses([]);
                    setShowWeakness(false);
                  }}
                >
                  <div className="h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500" />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 truncate group-hover:text-cyan-700 transition-colors">{l.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">
                          {formatLessonLabel(l)}
                        </p>
                      </div>
                      {savedProgress > 0 && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          savedProgress >= 80 ? 'bg-green-100 text-green-700' : 'bg-cyan-50 text-cyan-600'
                        }`}>
                          {savedProgress}%
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full">
                        <Zap className="w-3 h-3" /> 단어 {l.vocabulary.length}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        <FileText className="w-3 h-3" /> 문장 {l.sentences.length}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        <Layers className="w-3 h-3" /> 문단 {l.paragraphs.length}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                        <Target className="w-3 h-3" /> 문제 {l.problems.length}
                      </span>
                    </div>
                    {savedProgress > 0 && (
                      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                          style={{ width: `${savedProgress}%` }}
                        />
                      </div>
                    )}

                    {/* 시험보기 / 다운로드 버튼 */}
                    <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLessonId(l.id);
                          setCurrentStep(5);
                          setProgress({ step1_voca: 0, step2_analysis: 0, step3_scaffolding: 0, step4_flow: 0, step5_mock: 0 });
                          setWeaknesses([]);
                          setShowWeakness(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-cyan-50 text-gray-600 hover:text-cyan-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                      >
                        시험보기
                      </button>
                      <div className="relative flex-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDownloadMenu(showDownloadMenu === l.id ? null : l.id);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-cyan-50 text-gray-600 hover:text-cyan-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                        >
                          <Download className="w-3.5 h-3.5" /> 다운로드
                        </button>
                        <AnimatePresence>
                          {showDownloadMenu === l.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden"
                            >
                              <button
                                onClick={(e) => { e.stopPropagation(); downloadMasteryExamPDF(l); setShowDownloadMenu(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" /> 시험지+정답지 (PDF)
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); downloadMasteryExamWord(l); setShowDownloadMenu(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors border-t border-gray-100"
                              >
                                <FileDown className="w-3.5 h-3.5" /> 시험지+정답지 (Word)
                              </button>
                              {l.vocabulary.length > 0 && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); downloadMasteryVocaPDF(l); setShowDownloadMenu(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors border-t border-gray-100"
                                >
                                  <Zap className="w-3.5 h-3.5" /> 단어 시험지 (PDF)
                                </button>
                              )}
                              {l.sentences.length > 0 && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); downloadMasteryBlankPDF(l); setShowDownloadMenu(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors border-t border-gray-100"
                                >
                                  <Zap className="w-3.5 h-3.5" /> 빈칸 시험지 (PDF)
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── 레슨 학습 화면 ───
  return (
    <div className="min-h-0">
      {/* Top Header - EnglishAI Style */}
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedLessonId(null)}
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-600" />
                교과서 뽀개기
              </h1>
              <p className="text-xs text-gray-400">단계별로 학습을 진행하세요</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {weaknesses.length > 0 && (
              <button
                onClick={() => setShowWeakness(!showWeakness)}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" /> 약점 {weaknesses.length}
              </button>
            )}
          </div>
        </div>

        {/* Stage Navigation - EnglishAI Style Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {ALL_STEPS.filter(step => {
            const vt = lesson.visibleTabs || ['analysis', 'voca', 'scaffolding', 'flow', 'mock'];
            return vt.includes(step.tabKey);
          }).map((step) => {
            const isActive = currentStep === step.id;
            const unlocked = isStepUnlocked(step.id);
            const isComplete = isStepComplete(step.key);
            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive ? 'bg-cyan-600 text-white shadow-lg scale-105' :
                  isComplete ? 'bg-green-50 text-green-700 hover:bg-green-100' :
                  unlocked ? 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100' :
                  'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : !unlocked ? <Lock className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{step.shortLabel}</span>
                <span className="sm:hidden">{step.shortLabel.slice(0, 1)}</span>
              </button>
            );
          })}
          {/* Remove bypass button - stages must be completed */}
        </div>

        {/* Lesson Header with Download */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              {isEditingHeader ? (
                <div className="space-y-2">
                  <input
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    placeholder="라벨 (예: 중등영어 1-1)"
                    className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1.5 rounded-full border border-cyan-200 focus:outline-none focus:border-cyan-400 w-auto"
                  />
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="레슨 제목 (예: Lesson 1: My New Friends)"
                    className="block w-full text-xl font-bold text-gray-800 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (lesson && editTitle.trim()) {
                          updateLessonData({ ...lesson, title: editTitle.trim(), category: editLabel.trim() || lesson.category });
                        }
                        setIsEditingHeader(false);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-bold hover:bg-cyan-700"
                    >
                      <Check className="w-3 h-3" /> 저장
                    </button>
                    <button
                      onClick={() => setIsEditingHeader(false)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-200"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="group cursor-pointer"
                  onClick={() => {
                    setEditLabel(formatLessonLabel(lesson));
                    setEditTitle(lesson.title);
                    setIsEditingHeader(true);
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full">
                      {formatLessonLabel(lesson)}
                    </span>
                    <Pencil className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <h2 className="text-xl font-bold text-gray-800">{lesson.title}</h2>
                    <Pencil className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              )}
            </div>
            <div className="relative ml-3 shrink-0">
              <button
                onClick={() => setShowDownloadMenu(showDownloadMenu === 'study' ? null : 'study')}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" /> 다운로드
              </button>
              <AnimatePresence>
                {showDownloadMenu === 'study' && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden"
                  >
                    <button
                      onClick={() => { downloadMasteryExamPDF(lesson); setShowDownloadMenu(null); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> 시험지+정답지 (PDF)
                    </button>
                    <button
                      onClick={() => { downloadMasteryExamWord(lesson); setShowDownloadMenu(null); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors border-t border-gray-100"
                    >
                      <FileDown className="w-3.5 h-3.5" /> 시험지+정답지 (Word)
                    </button>
                    {lesson.vocabulary.length > 0 && (
                      <button
                        onClick={() => { downloadMasteryVocaPDF(lesson); setShowDownloadMenu(null); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors border-t border-gray-100"
                      >
                        <Zap className="w-3.5 h-3.5" /> 단어 시험지 (PDF)
                      </button>
                    )}
                    {lesson.sentences.length > 0 && (
                      <button
                        onClick={() => { downloadMasteryBlankPDF(lesson); setShowDownloadMenu(null); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors border-t border-gray-100"
                      >
                        <Zap className="w-3.5 h-3.5" /> 빈칸 시험지 (PDF)
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 뽀개기 게이지 */}
        <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-bold text-gray-700">뽀개기 게이지</span>
            </div>
            <span className="text-sm font-bold text-cyan-600">{Math.round(totalProgress)}%</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 0.5 }}
            />
            {totalProgress >= 100 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg -mr-1"
              >
                <Trophy className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </div>
          {totalProgress >= 100 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm font-bold text-yellow-600 mt-2">
              110점 도전권 획득! 완벽하게 뽀갰습니다!
            </motion.p>
          )}
        </div>

        {/* Weakness Panel */}
        <AnimatePresence>
          {showWeakness && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-5"
            >
              <div className="bg-red-50 rounded-xl border border-red-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> 나의 약점 문장 (My Weakness)
                  </h3>
                  <button
                    onClick={() => { setWeaknesses([]); localStorage.removeItem(`mastery_weakness_${lesson?.id}`); }}
                    className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> 초기화
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {weaknesses.map((w, i) => (
                    <div key={i} className="p-2.5 bg-white rounded-lg text-sm">
                      <p className="text-gray-700 font-medium">{w.sentence}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-red-500 font-bold">틀린 횟수: {w.wrongCount}</span>
                        <span className="text-xs text-gray-400">{w.type === 'blank' ? '빈칸' : w.type === 'unscramble' ? '재배열' : w.type === 'writing' ? '영작' : '실전'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage Content */}
      </div>{/* Close p-4 md:p-6 wrapper */}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={[1, 3, 4].includes(currentStep) ? 'px-0' : 'px-4 md:px-6'}
          >
            {currentStep === 1 && (
              <TextAnalysis
                sentences={lesson.sentences}
                paragraphs={lesson.paragraphs}
                onComplete={handleAnalysisComplete}
              />
            )}
            {currentStep === 2 && (
              <VocaBuildUp
                vocabulary={lesson.vocabulary}
                onComplete={handleVocaComplete}
              />
            )}
            {currentStep === 3 && (
              <ScaffoldingTraining
                sentences={lesson.sentences}
                onComplete={handleScaffoldingComplete}
                onWrongAnswer={handleWrongAnswer}
              />
            )}
            {currentStep === 4 && (
              <div className="space-y-8">
                <FlowChart
                  paragraphs={lesson.paragraphs}
                  sentences={lesson.sentences}
                  onComplete={handleFlowComplete}
                />
                <div className="pt-6 border-t-2 border-dashed border-amber-200">
                  <button
                    onClick={() => setShowAiSummary(!showAiSummary)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      showAiSummary
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 hover:shadow-md'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    AI 자동요약
                  </button>
                  <AnimatePresence>
                    {showAiSummary && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4">
                          <ParagraphSummary
                            paragraphs={lesson.paragraphs}
                            sentences={lesson.sentences}
                            lessonTitle={lesson.title}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
            {currentStep === 5 && (
              <MockTest
                problems={lesson.problems}
                sentences={lesson.sentences}
                paragraphs={lesson.paragraphs}
                lessonData={lesson}
                onComplete={handleMockComplete}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Stage Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-200 px-4 md:px-6">
          <button
            onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            이전 단계
          </button>
          <span className="text-sm text-gray-500 font-medium">
            {currentStep} / {ALL_STEPS.length} 단계
          </span>
          <button
            onClick={() => currentStep < 5 && isStepUnlocked(currentStep + 1) && setCurrentStep(currentStep + 1)}
            disabled={currentStep === 5 || !isStepUnlocked(currentStep + 1)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              currentStep === 5 || !isStepUnlocked(currentStep + 1)
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-md'
            }`}
          >
            {!isStepUnlocked(currentStep + 1) && currentStep < 5 ? (
              <><Lock className="w-4 h-4" /> 현 단계를 완료하세요</>
            ) : (
              <>다음 단계 <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
    </div>
  );
}