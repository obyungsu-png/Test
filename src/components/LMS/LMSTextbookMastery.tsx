import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, Plus, Trash2, Edit3, Save, X, Upload, Download,
  ChevronDown, ChevronRight, Copy, Search, GripVertical,
  Zap, FileText, Brain, Layers, Target, Eye, AlertTriangle,
  Check, Volume2, ArrowUp, ArrowDown, RotateCcw
} from "lucide-react";
import type { LessonData, VocaItem, SentenceItem, ParagraphItem, ProblemItem } from "../TextbookMastery/types";
import { SAMPLE_LESSON, SAMPLE_LESSON_KOREAN } from "../TextbookMastery/types";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

// ─── localStorage 키 ───
const STORAGE_KEY = "textbookMastery_lessons";

// ─── 유틸 ───
function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

function loadLessons(): LessonData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [SAMPLE_LESSON, SAMPLE_LESSON_KOREAN];
  } catch { return [SAMPLE_LESSON, SAMPLE_LESSON_KOREAN]; }
}
function saveLessons(lessons: LessonData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
  window.dispatchEvent(new Event("textbookMasteryUpdated"));
}

// ─── 서브 탭 타입 ───
type SubTab = "overview" | "vocabulary" | "sentences" | "paragraphs" | "problems";

const SUB_TABS: { id: SubTab; label: string; icon: any; color: string }[] = [
  { id: "overview", label: "개요", icon: Eye, color: "cyan" },
  { id: "vocabulary", label: "단어", icon: Zap, color: "cyan" },
  { id: "sentences", label: "문장", icon: FileText, color: "blue" },
  { id: "paragraphs", label: "문단", icon: Layers, color: "purple" },
  { id: "problems", label: "문제", icon: Target, color: "red" },
];

// ─── 빈 항목 생성 ───
function emptyVoca(): VocaItem {
  return { id: uid(), word: "", meaning: "", pos: "명사", example: "", exampleKo: "", synonym: "", antonym: "" };
}
function emptySentence(paragraphId = 1): SentenceItem {
  return { id: Date.now(), english: "", korean: "", chunks: [], grammarPoint: "", importance: "mid", paragraphId };
}
function emptyParagraph(id: number): ParagraphItem {
  return { id, topic: "", structure: "" };
}
function emptyProblem(): ProblemItem {
  return { id: uid(), type: "multiple_choice", question: "", options: ["", "", "", ""], answer: "", explanation: "", relatedSentenceId: undefined };
}
function emptyLesson(): LessonData {
  return {
    id: uid(),
    title: "새 레슨",
    subject: "영어",
    category: "",
    semester: "1",
    vocabulary: [],
    sentences: [],
    paragraphs: [{ id: 1, topic: "", structure: "" }],
    problems: [],
  };
}

// =====================================================================
//  메인 컴포넌트
// =====================================================================
export default function LMSTextbookMastery() {
  const [lessons, setLessons] = useState<LessonData[]>(loadLessons);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<SubTab>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTextUploadModal, setShowTextUploadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<{ valid: boolean; message: string; testing?: boolean } | null>(null);

  const selectedLesson = lessons.find(l => l.id === selectedLessonId) || null;

  // persist
  useEffect(() => { if (dirty) { saveLessons(lessons); setDirty(false); } }, [dirty]);

  // ─── Test DeepSeek API Key ───
  const testApiKey = async () => {
    setApiKeyStatus({ valid: false, message: "테스트 중...", testing: true });
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7db3bef3/ai/test-key`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${publicAnonKey}`
        }
      });
      const result = await response.json();
      setApiKeyStatus({ valid: result.valid, message: result.message });
      
      // Auto-hide success message after 3 seconds
      if (result.valid) {
        setTimeout(() => setApiKeyStatus(null), 3000);
      }
    } catch (err: any) {
      setApiKeyStatus({ valid: false, message: `테스트 실패: ${err.message}` });
    }
  };

  // ─── Lesson CRUD ───
  const addLesson = () => {
    const nl = emptyLesson();
    setLessons(prev => [...prev, nl]);
    setSelectedLessonId(nl.id);
    setSubTab("overview");
    setDirty(true);
  };

  const duplicateLesson = (id: string) => {
    const src = lessons.find(l => l.id === id);
    if (!src) return;
    const dup: LessonData = JSON.parse(JSON.stringify(src));
    dup.id = uid();
    dup.title = src.title + " (복사)";
    setLessons(prev => [...prev, dup]);
    setSelectedLessonId(dup.id);
    setDirty(true);
  };

  const deleteLesson = (id: string) => {
    setLessons(prev => prev.filter(l => l.id !== id));
    if (selectedLessonId === id) setSelectedLessonId(null);
    setShowDeleteConfirm(null);
    setDirty(true);
  };

  const updateLesson = (updated: LessonData) => {
    setLessons(prev => prev.map(l => l.id === updated.id ? updated : l));
    setDirty(true);
  };

  // ─── Import / Export ───
  const exportLesson = (lesson: LessonData) => {
    const json = JSON.stringify(lesson, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lesson.title.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAll = () => {
    const json = JSON.stringify(lessons, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "textbook_mastery_all_lessons.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── 검색 필터 ───
  const filtered = lessons.filter(l =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.subject.includes(searchTerm) ||
    l.category.includes(searchTerm)
  );

  // ===================== 레슨 목록 (좌측) =====================
  if (!selectedLesson) {
    return (
      <div>
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-cyan-600" />
              교과서 뽀개기 관리
            </h1>
            <p className="text-sm text-gray-500 mt-1">레슨별 단어·문장·문단·문제를 관리합니다</p>
            {apiKeyStatus && (
              <div className={`mt-2 text-sm ${apiKeyStatus.valid ? 'text-green-600' : apiKeyStatus.testing ? 'text-blue-600' : 'text-red-600'}`}>
                <div className="flex items-center gap-2">
                  {apiKeyStatus.testing ? (
                    <Brain className="w-4 h-4 animate-pulse" />
                  ) : apiKeyStatus.valid ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {apiKeyStatus.message}
                </div>
                {!apiKeyStatus.valid && !apiKeyStatus.testing && (
                  <div className="mt-1 text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded px-2 py-1.5">
                    💡 <strong>해결 방법:</strong> Figma Make 설정에서 <code className="bg-yellow-100 px-1 rounded">DEEPSEEK_API_KEY</code> 환경 변수를 업데이트하세요. 
                    <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                      새 API 키 발급받기 →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={testApiKey} className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-cyan-200 rounded-xl text-sm font-medium text-cyan-600 hover:bg-cyan-50 transition-colors">
              <Brain className="w-4 h-4" /> AI 키 확인
            </button>
            <button onClick={() => setShowTextUploadModal(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-sm font-bold hover:from-cyan-600 hover:to-blue-600 transition-colors shadow-sm">
              <Zap className="w-4 h-4" /> 텍스트 업로드
            </button>
            <button onClick={() => setShowImportModal(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" /> JSON 가져오기
            </button>
            <button onClick={exportAll} className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" /> 전체 내보내기
            </button>
            <button onClick={addLesson} className="flex items-center gap-1.5 px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> 새 레슨
            </button>
          </div>
        </div>

        {/* 검색 */}
        <div className="relative mb-5 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="레슨 제목, 과목, 카테고리 검색..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* 레슨 카드 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((lesson, idx) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white rounded-xl border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all group overflow-hidden"
            >
              {/* 카드 상단 컬러 바 */}
              <div className="h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { setSelectedLessonId(lesson.id); setSubTab("overview"); }}>
                    <h3 className="font-bold text-gray-800 truncate group-hover:text-cyan-700 transition-colors">{lesson.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{lesson.subject} · {lesson.category || "미분류"}</p>
                  </div>
                  {/* 액션 버튼들 */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button onClick={() => duplicateLesson(lesson.id)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="복제">
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button onClick={() => exportLesson(lesson)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="내보내기">
                      <Download className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(lesson.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="삭제">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* 통계 배지 */}
                <div className="flex flex-wrap gap-2">
                  <StatBadge icon={Zap} label="단어" count={lesson.vocabulary.length} color="cyan" />
                  <StatBadge icon={FileText} label="문장" count={lesson.sentences.length} color="blue" />
                  <StatBadge icon={Layers} label="문단" count={lesson.paragraphs.length} color="purple" />
                  <StatBadge icon={Target} label="문제" count={lesson.problems.length} color="red" />
                </div>

                {/* 열기 버튼 */}
                <button
                  onClick={() => { setSelectedLessonId(lesson.id); setSubTab("overview"); }}
                  className="w-full mt-4 py-2 bg-gray-50 hover:bg-cyan-50 text-gray-600 hover:text-cyan-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> 편집하기
                </button>
              </div>
            </motion.div>
          ))}

          {/* 새 레슨 추가 카드 */}
          <motion.button
            onClick={addLesson}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: filtered.length * 0.04 }}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-cyan-300 hover:text-cyan-500 hover:bg-cyan-50/30 transition-all min-h-[200px]"
          >
            <Plus className="w-8 h-8" />
            <span className="text-sm font-medium">새 레슨 추가</span>
          </motion.button>
        </div>

        {/* 삭제 확인 모달 */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <Modal onClose={() => setShowDeleteConfirm(null)}>
              <div className="text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">레슨 삭제</h3>
                <p className="text-sm text-gray-500 mb-6">이 레슨과 모든 데이터가 영구 삭제됩니다.<br />이 작업은 되돌릴 수 없습니다.</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setShowDeleteConfirm(null)} className="px-5 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors">취소</button>
                  <button onClick={() => deleteLesson(showDeleteConfirm)} className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors">삭제</button>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>

        {/* JSON Import 모달 */}
        <AnimatePresence>
          {showImportModal && (
            <ImportModal
              onClose={() => setShowImportModal(false)}
              onImport={(imported) => {
                const arr = Array.isArray(imported) ? imported : [imported];
                const newLessons = arr.map((l: any) => ({ ...l, id: l.id || uid() }));
                setLessons(prev => [...prev, ...newLessons]);
                setDirty(true);
                setShowImportModal(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* 텍스트 파일 업로드 모달 */}
        <AnimatePresence>
          {showTextUploadModal && (
            <TextUploadModal
              onClose={() => setShowTextUploadModal(false)}
              onUpload={(imported) => {
                const arr = Array.isArray(imported) ? imported : [imported];
                const newLessons = arr.map((l: any) => ({ ...l, id: l.id || uid() }));
                setLessons(prev => [...prev, ...newLessons]);
                setDirty(true);
                setShowTextUploadModal(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ===================== 레슨 편집 =====================
  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => setSelectedLessonId(null)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-600 transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" /> 목록
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-800 truncate">{selectedLesson.title}</h1>
          <p className="text-xs text-gray-400">{selectedLesson.subject} · {selectedLesson.category || "미분류"} · ID: {selectedLesson.id.slice(0, 12)}</p>
        </div>
        <button onClick={() => exportLesson(selectedLesson)} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
          <Download className="w-4 h-4" /> 내보내기
        </button>
      </div>

      {/* 서브 탭 */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {SUB_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          const count = tab.id === "vocabulary" ? selectedLesson.vocabulary.length
            : tab.id === "sentences" ? selectedLesson.sentences.length
            : tab.id === "paragraphs" ? selectedLesson.paragraphs.length
            : tab.id === "problems" ? selectedLesson.problems.length : null;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                isActive ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {count !== null && <span className={`text-xs ml-0.5 ${isActive ? "text-cyan-600" : "text-gray-400"}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* 탭 콘텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div key={subTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
          {subTab === "overview" && <OverviewEditor lesson={selectedLesson} onChange={updateLesson} />}
          {subTab === "vocabulary" && <VocabularyEditor lesson={selectedLesson} onChange={updateLesson} />}
          {subTab === "sentences" && <SentenceEditor lesson={selectedLesson} onChange={updateLesson} />}
          {subTab === "paragraphs" && <ParagraphEditor lesson={selectedLesson} onChange={updateLesson} />}
          {subTab === "problems" && <ProblemEditor lesson={selectedLesson} onChange={updateLesson} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// =====================================================================
//  개요 편집기
// =====================================================================
function OverviewEditor({ lesson, onChange }: { lesson: LessonData; onChange: (l: LessonData) => void }) {
  const [title, setTitle] = useState(lesson.title);
  const [subject, setSubject] = useState(lesson.subject);
  const [category, setCategory] = useState(lesson.category);
  const [semester, setSemester] = useState(lesson.semester || "1");
  const [visibleTabs, setVisibleTabs] = useState<string[]>(lesson.visibleTabs || ['analysis', 'voca', 'scaffolding', 'flow', 'mock']);

  useEffect(() => { 
    setTitle(lesson.title); 
    setSubject(lesson.subject); 
    setCategory(lesson.category);
    setSemester(lesson.semester || "1");
    setVisibleTabs(lesson.visibleTabs || ['analysis', 'voca', 'scaffolding', 'flow', 'mock']);
  }, [lesson.id]);

  const save = () => onChange({ ...lesson, title, subject, category, semester, visibleTabs });

  const subjects = ["영어", "수학", "국어", "과학", "사회", "한국사", "도덕", "기술가정", "제2외국어"];
  const categories = ["중1", "중2", "중3", "고1", "고2", "고3", "초등", "기타"];

  const ALL_TABS = [
    { key: 'analysis', label: '분석 (본문 완전 분석)', desc: '끊어읽기, 문법태그, 직독직해' },
    { key: 'voca', label: '단어 (어휘 학습)', desc: '어휘학습, 플래시카드, 테스트' },
    { key: 'scaffolding', label: '체화 (본문 체화)', desc: '빈칸채우기, 문장재배열, 한영영작' },
    { key: 'flow', label: '구조 (구조 파악)', desc: '플로차트, AI 문단요약' },
    { key: 'mock', label: '실전 (실전 뽀개기)', desc: '실전 시험, 오답노트' },
  ];

  const toggleTab = (key: string) => {
    setVisibleTabs(prev => {
      if (prev.includes(key)) {
        if (prev.length <= 1) return prev;
        return prev.filter(t => t !== key);
      }
      return [...prev, key];
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
      <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
        <Eye className="w-5 h-5 text-cyan-600" /> 레슨 기본 정보
      </h2>

      <div className="space-y-4">
        <Field label="레슨 제목">
          <input value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="예: Lesson 1: My New Friends" />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="과목">
            <select value={subject} onChange={e => setSubject(e.target.value)} className="input-field">
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="학년">
            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
              <option value="">학년 선택</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="학기">
            <select value={semester} onChange={e => setSemester(e.target.value)} className="input-field">
              <option value="1">1학기</option>
              <option value="2">2학기</option>
            </select>
          </Field>
        </div>

        {/* 탭 표시/숨기기 설정 */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4" /> 학생 화면 탭 설정
          </h3>
          <p className="text-[10px] text-indigo-600 mb-3">학년/선생님 강조 포인트에 따라 보이는 탭을 조정합니다. 체크 해제 시 해당 단계가 학생에게 숨겨집니다.</p>
          <div className="space-y-2">
            {ALL_TABS.map(tab => {
              const isVisible = visibleTabs.includes(tab.key);
              return (
                <label key={tab.key} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${isVisible ? 'bg-white border border-indigo-200' : 'bg-gray-50 border border-gray-200 opacity-60'}`}>
                  <input type="checkbox" checked={isVisible} onChange={() => toggleTab(tab.key)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-gray-800">{tab.label}</span>
                    <p className="text-[10px] text-gray-500">{tab.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
          <p className="text-xs text-cyan-800">
            💡 <strong>학년과 과목을 정확히 선택하세요.</strong> 학생들이 영어 탭에서 자신의 학년 과목 레슨만 볼 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-6">
          <StatCard label="단어" count={lesson.vocabulary.length} color="bg-cyan-50 text-cyan-700" />
          <StatCard label="문장" count={lesson.sentences.length} color="bg-blue-50 text-blue-700" />
          <StatCard label="문단" count={lesson.paragraphs.length} color="bg-purple-50 text-purple-700" />
          <StatCard label="문제" count={lesson.problems.length} color="bg-red-50 text-red-700" />
        </div>

        <button 
          onClick={save} 
          disabled={!category} 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors mt-4 w-full justify-center ${
            category ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" /> 저장
        </button>
      </div>
    </div>
  );
}

// =====================================================================
//  단어 편집기
// =====================================================================
function VocabularyEditor({ lesson, onChange }: { lesson: LessonData; onChange: (l: LessonData) => void }) {
  const [vocab, setVocab] = useState<VocaItem[]>(lesson.vocabulary);
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState("");

  useEffect(() => { setVocab(lesson.vocabulary); }, [lesson.id]);

  const save = (items: VocaItem[]) => { setVocab(items); onChange({ ...lesson, vocabulary: items }); };

  const addWord = () => {
    const nw = emptyVoca();
    const items = [...vocab, nw];
    save(items);
    setEditId(nw.id);
  };

  const updateWord = (id: string, field: keyof VocaItem, value: string) => {
    save(vocab.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const deleteWord = (id: string) => { save(vocab.filter(v => v.id !== id)); };

  const moveWord = (id: string, dir: -1 | 1) => {
    const idx = vocab.findIndex(v => v.id === id);
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === vocab.length - 1)) return;
    const arr = [...vocab];
    [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
    save(arr);
  };

  // 일괄 추가 (탭 구분: word\tmeaning\tpos)
  const handleBulkAdd = () => {
    const lines = bulkText.trim().split("\n").filter(Boolean);
    const newWords: VocaItem[] = lines.map(line => {
      const parts = line.split("\t");
      return {
        id: uid(),
        word: parts[0]?.trim() || "",
        meaning: parts[1]?.trim() || "",
        pos: parts[2]?.trim() || "명사",
        example: parts[3]?.trim() || "",
        exampleKo: parts[4]?.trim() || "",
        synonym: parts[5]?.trim() || "",
        antonym: parts[6]?.trim() || "",
      };
    });
    save([...vocab, ...newWords]);
    setBulkText("");
    setShowBulkAdd(false);
  };

  const filtered = vocab.filter(v =>
    v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.meaning.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-600" /> 단어 관리 <span className="text-sm font-normal text-gray-400">({vocab.length}개)</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="검색..." className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-40 focus:border-cyan-400 focus:outline-none" />
          </div>
          <button onClick={() => setShowBulkAdd(!showBulkAdd)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <FileText className="w-3.5 h-3.5" /> 일괄 추가
          </button>
          <button onClick={addWord} className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-bold hover:bg-cyan-700">
            <Plus className="w-4 h-4" /> 추가
          </button>
        </div>
      </div>

      {/* 일괄 추가 패널 */}
      <AnimatePresence>
        {showBulkAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-600 mb-2 font-medium">탭으로 구분하여 입력 (word → meaning → pos → example → exampleKo → synonym → antonym)</p>
              <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={5} className="w-full border border-blue-200 rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-blue-400" placeholder={"introduce\t소개하다\t동사\tLet me introduce myself.\t제 소개를 하겠습니다.\tpresent\t"} />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setShowBulkAdd(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">취소</button>
                <button onClick={handleBulkAdd} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">추가</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 단어 테이블 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium w-8">#</th>
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium">단어</th>
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium">뜻</th>
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium w-20">품사</th>
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium">예문</th>
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium">유의어</th>
                <th className="text-center py-2.5 px-3 text-gray-500 font-medium w-28">관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, idx) => {
                const isEditing = editId === v.id;
                return (
                  <tr key={v.id} className={`border-b border-gray-100 ${isEditing ? "bg-cyan-50/50" : "hover:bg-gray-50"}`}>
                    <td className="py-2 px-3 text-gray-400">{idx + 1}</td>
                    <td className="py-2 px-3">
                      {isEditing ? (
                        <input value={v.word} onChange={e => updateWord(v.id, "word", e.target.value)} className="input-sm w-full" autoFocus />
                      ) : (
                        <span className="font-bold text-gray-800">{v.word || <span className="text-gray-300 italic">비어있음</span>}</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {isEditing ? (
                        <input value={v.meaning} onChange={e => updateWord(v.id, "meaning", e.target.value)} className="input-sm w-full" />
                      ) : (
                        <span className="text-gray-600">{v.meaning}</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {isEditing ? (
                        <select value={v.pos} onChange={e => updateWord(v.id, "pos", e.target.value)} className="input-sm">
                          {["명사", "동사", "형용사", "부사", "접속사", "전치사", "대명사", "감탄사", "동사/명사", "형용사/명사"].map(p => <option key={p}>{p}</option>)}
                        </select>
                      ) : (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">{v.pos}</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input value={v.example} onChange={e => updateWord(v.id, "example", e.target.value)} className="input-sm w-full" placeholder="영문 예문" />
                          <input value={v.exampleKo} onChange={e => updateWord(v.id, "exampleKo", e.target.value)} className="input-sm w-full" placeholder="한글 해석" />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic truncate block max-w-[200px]">{v.example}</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input value={v.synonym || ""} onChange={e => updateWord(v.id, "synonym", e.target.value)} className="input-sm w-full" placeholder="유의어" />
                          <input value={v.antonym || ""} onChange={e => updateWord(v.id, "antonym", e.target.value)} className="input-sm w-full" placeholder="반의어" />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">{v.synonym}</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setEditId(isEditing ? null : v.id)} className={`p-1.5 rounded-lg transition-colors ${isEditing ? "bg-cyan-100 text-cyan-600" : "hover:bg-gray-100 text-gray-400"}`}>
                          {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => moveWord(v.id, -1)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><ArrowUp className="w-3.5 h-3.5" /></button>
                        <button onClick={() => moveWord(v.id, 1)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><ArrowDown className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteWord(v.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {vocab.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">단어가 없습니다. '추가' 또는 '일괄 추가'를 사용하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
//  문장 편집기
// =====================================================================
function SentenceEditor({ lesson, onChange }: { lesson: LessonData; onChange: (l: LessonData) => void }) {
  const [sentences, setSentences] = useState<SentenceItem[]>(lesson.sentences);
  const [editId, setEditId] = useState<number | null>(null);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState("");

  useEffect(() => { setSentences(lesson.sentences); }, [lesson.id]);

  const save = (items: SentenceItem[]) => { setSentences(items); onChange({ ...lesson, sentences: items }); };

  const addSentence = () => {
    const ns = emptySentence();
    ns.id = sentences.length > 0 ? Math.max(...sentences.map(s => s.id)) + 1 : 1;
    save([...sentences, ns]);
    setEditId(ns.id);
  };

  const updateSentence = (id: number, field: string, value: any) => {
    save(sentences.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSentence = (id: number) => { save(sentences.filter(s => s.id !== id)); };

  const handleBulkAdd = () => {
    const lines = bulkText.trim().split("\n").filter(Boolean);
    let nextId = sentences.length > 0 ? Math.max(...sentences.map(s => s.id)) + 1 : 1;
    const newSentences: SentenceItem[] = lines.map(line => {
      const parts = line.split("\t");
      return {
        id: nextId++,
        english: parts[0]?.trim() || "",
        korean: parts[1]?.trim() || "",
        chunks: (parts[0]?.trim() || "").split(" / ").length > 1 ? (parts[2]?.trim() || "").split(" / ") : (parts[0]?.trim() || "").split(", "),
        grammarPoint: parts[3]?.trim() || "",
        importance: (parts[4]?.trim() as any) || "mid",
        paragraphId: parseInt(parts[5]?.trim() || "1") || 1,
      };
    });
    save([...sentences, ...newSentences]);
    setBulkText("");
    setShowBulkAdd(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> 문장 관리 <span className="text-sm font-normal text-gray-400">({sentences.length}개)</span>
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowBulkAdd(!showBulkAdd)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <FileText className="w-3.5 h-3.5" /> 일괄 추가
          </button>
          <button onClick={addSentence} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
            <Plus className="w-4 h-4" /> 추가
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showBulkAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-600 mb-2 font-medium">탭 구분: english → korean → chunks(/ 구분) → grammarPoint → importance → paragraphId</p>
              <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={4} className="w-full border border-blue-200 rounded-lg p-3 text-sm font-mono focus:outline-none" placeholder={"Today is my first day.\t오늘은 첫날이다.\tToday / is my first day\tbe동사\thigh\t1"} />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setShowBulkAdd(false)} className="px-3 py-1.5 text-sm text-gray-500">취소</button>
                <button onClick={handleBulkAdd} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold">추가</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 문장 목록 */}
      <div className="space-y-3">
        {sentences.map((s, idx) => {
          const isEditing = editId === s.id;
          return (
            <div key={s.id} className={`bg-white border rounded-xl overflow-hidden ${isEditing ? "border-blue-300 ring-1 ring-blue-100" : "border-gray-200"}`}>
              <div className="flex items-start gap-3 p-4">
                <span className="text-xs font-bold text-gray-300 mt-1 w-6 text-center shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Field label="영문">
                        <textarea value={s.english} onChange={e => updateSentence(s.id, "english", e.target.value)} className="input-field text-sm" rows={2} />
                      </Field>
                      <Field label="한국어">
                        <textarea value={s.korean} onChange={e => updateSentence(s.id, "korean", e.target.value)} className="input-field text-sm" rows={2} />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="끊어읽기 (쉼표 구분)">
                          <input value={s.chunks.join(", ")} onChange={e => updateSentence(s.id, "chunks", e.target.value.split(",").map(c => c.trim()))} className="input-field text-sm" />
                        </Field>
                        <Field label="문법 포인트">
                          <input value={s.grammarPoint || ""} onChange={e => updateSentence(s.id, "grammarPoint", e.target.value)} className="input-field text-sm" />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="중요도">
                          <select value={s.importance} onChange={e => updateSentence(s.id, "importance", e.target.value)} className="input-field text-sm">
                            <option value="high">높음 (high)</option>
                            <option value="mid">보통 (mid)</option>
                            <option value="low">낮음 (low)</option>
                          </select>
                        </Field>
                        <Field label="문단 ID">
                          <select value={s.paragraphId} onChange={e => updateSentence(s.id, "paragraphId", parseInt(e.target.value))} className="input-field text-sm">
                            {lesson.paragraphs.map(p => <option key={p.id} value={p.id}>문단 {p.id}: {p.topic || "(제목 없음)"}</option>)}
                          </select>
                        </Field>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-800 font-medium text-sm">{s.english || <span className="text-gray-300 italic">영문 비어있음</span>}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{s.korean}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${s.importance === "high" ? "bg-red-100 text-red-600" : s.importance === "mid" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"}`}>
                          {s.importance}
                        </span>
                        {s.grammarPoint && <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">{s.grammarPoint}</span>}
                        <span className="text-[10px] text-gray-400">P{s.paragraphId}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditId(isEditing ? null : s.id)} className={`p-1.5 rounded-lg transition-colors ${isEditing ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-400"}`}>
                    {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => deleteSentence(s.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sentences.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl py-12 text-center text-gray-400">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">문장이 없습니다. '추가'를 눌러 시작하세요.</p>
        </div>
      )}
    </div>
  );
}

// =====================================================================
//  문단 편집기
// =====================================================================
function ParagraphEditor({ lesson, onChange }: { lesson: LessonData; onChange: (l: LessonData) => void }) {
  const [paragraphs, setParagraphs] = useState<ParagraphItem[]>(lesson.paragraphs);

  useEffect(() => { setParagraphs(lesson.paragraphs); }, [lesson.id]);

  const save = (items: ParagraphItem[]) => { setParagraphs(items); onChange({ ...lesson, paragraphs: items }); };

  const addParagraph = () => {
    const nextId = paragraphs.length > 0 ? Math.max(...paragraphs.map(p => p.id)) + 1 : 1;
    save([...paragraphs, emptyParagraph(nextId)]);
  };

  const updateParagraph = (id: number, field: keyof ParagraphItem, value: any) => {
    save(paragraphs.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const deleteParagraph = (id: number) => { save(paragraphs.filter(p => p.id !== id)); };

  const structures = ["상황 제시", "사건 전개", "발견과 깨달음", "결론 및 성찰", "문제 제기", "원인 분석", "해결 방안", "예시와 근거", "비교 대조", "기타"];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600" /> 문단 관리 <span className="text-sm font-normal text-gray-400">({paragraphs.length}개)</span>
        </h2>
        <button onClick={addParagraph} className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700">
          <Plus className="w-4 h-4" /> 추가
        </button>
      </div>

      <div className="space-y-3">
        {paragraphs.map((p, idx) => {
          const sentenceCount = lesson.sentences.filter(s => s.paragraphId === p.id).length;
          return (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm shrink-0">
                  P{p.id}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="주제">
                    <input value={p.topic} onChange={e => updateParagraph(p.id, "topic", e.target.value)} className="input-field text-sm" placeholder="문단의 핵심 주제" />
                  </Field>
                  <Field label="전개 방식">
                    <select value={p.structure} onChange={e => updateParagraph(p.id, "structure", e.target.value)} className="input-field text-sm">
                      <option value="">선택...</option>
                      {structures.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className="text-[10px] text-gray-400">{sentenceCount}문장</span>
                  <button onClick={() => deleteParagraph(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {paragraphs.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl py-12 text-center text-gray-400">
          <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">문단이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

// =====================================================================
//  문제 편집기
// =====================================================================
function ProblemEditor({ lesson, onChange }: { lesson: LessonData; onChange: (l: LessonData) => void }) {
  const [problems, setProblems] = useState<ProblemItem[]>(lesson.problems);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => { setProblems(lesson.problems); }, [lesson.id]);

  const save = (items: ProblemItem[]) => { setProblems(items); onChange({ ...lesson, problems: items }); };

  const addProblem = () => {
    const np = emptyProblem();
    save([...problems, np]);
    setEditId(np.id);
  };

  const updateProblem = (id: string, field: string, value: any) => {
    save(problems.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const updateOption = (problemId: string, optIdx: number, value: string) => {
    save(problems.map(p => {
      if (p.id !== problemId) return p;
      const opts = [...(p.options || [])];
      opts[optIdx] = value;
      return { ...p, options: opts };
    }));
  };

  const deleteProblem = (id: string) => { save(problems.filter(p => p.id !== id)); };

  const typeLabels: Record<string, string> = {
    multiple_choice: "객관식",
    short_answer: "주관식",
    sentence_insert: "문장 삽입",
    grammar_fix: "어법",
    content_match: "내용 일치",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Target className="w-5 h-5 text-red-500" /> 문제 관리 <span className="text-sm font-normal text-gray-400">({problems.length}개)</span>
        </h2>
        <button onClick={addProblem} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600">
          <Plus className="w-4 h-4" /> 추가
        </button>
      </div>

      <div className="space-y-3">
        {problems.map((p, idx) => {
          const isEditing = editId === p.id;
          return (
            <div key={p.id} className={`bg-white border rounded-xl overflow-hidden ${isEditing ? "border-red-300 ring-1 ring-red-100" : "border-gray-200"}`}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded mt-0.5 shrink-0">Q{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="유형">
                            <select value={p.type} onChange={e => updateProblem(p.id, "type", e.target.value)} className="input-field text-sm">
                              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                          </Field>
                          <Field label="관련 문장 ID">
                            <select value={p.relatedSentenceId || ""} onChange={e => updateProblem(p.id, "relatedSentenceId", parseInt(e.target.value) || undefined)} className="input-field text-sm">
                              <option value="">없음</option>
                              {lesson.sentences.map(s => <option key={s.id} value={s.id}>#{s.id}: {s.english.slice(0, 40)}...</option>)}
                            </select>
                          </Field>
                        </div>
                        <Field label="문제">
                          <textarea value={p.question} onChange={e => updateProblem(p.id, "question", e.target.value)} className="input-field text-sm" rows={3} />
                        </Field>
                        {(p.type === "multiple_choice" || p.type === "sentence_insert" || p.type === "grammar_fix" || p.type === "content_match") && (
                          <Field label="보기 (선택지)">
                            <div className="space-y-1.5">
                              {(p.options || []).map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400 w-6 text-center">{String.fromCharCode(65 + oi)}.</span>
                                  <input value={opt} onChange={e => updateOption(p.id, oi, e.target.value)} className="input-sm flex-1" placeholder={`보기 ${String.fromCharCode(65 + oi)}`} />
                                </div>
                              ))}
                              <button
                                onClick={() => updateProblem(p.id, "options", [...(p.options || []), ""])}
                                className="text-xs text-blue-500 hover:text-blue-700 ml-8"
                              >
                                + 보기 추가
                              </button>
                            </div>
                          </Field>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="정답">
                            <input value={p.answer} onChange={e => updateProblem(p.id, "answer", e.target.value)} className="input-field text-sm" placeholder="예: B" />
                          </Field>
                        </div>
                        <Field label="해설">
                          <textarea value={p.explanation} onChange={e => updateProblem(p.id, "explanation", e.target.value)} className="input-field text-sm" rows={2} />
                        </Field>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            p.type === "multiple_choice" ? "bg-blue-100 text-blue-600" :
                            p.type === "short_answer" ? "bg-green-100 text-green-600" :
                            p.type === "grammar_fix" ? "bg-purple-100 text-purple-600" :
                            "bg-amber-100 text-amber-600"
                          }`}>{typeLabels[p.type]}</span>
                          {p.relatedSentenceId && <span className="text-[10px] text-gray-400">문장 #{p.relatedSentenceId}</span>}
                        </div>
                        <p className="text-sm text-gray-800 whitespace-pre-line line-clamp-2">{p.question || <span className="text-gray-300 italic">문제 비어있음</span>}</p>
                        <p className="text-xs text-green-600 mt-1">정답: {p.answer}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setEditId(isEditing ? null : p.id)} className={`p-1.5 rounded-lg transition-colors ${isEditing ? "bg-red-100 text-red-600" : "hover:bg-gray-100 text-gray-400"}`}>
                      {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => deleteProblem(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {problems.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl py-12 text-center text-gray-400">
          <Target className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">문제가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

// =====================================================================
//  공통 컴포넌트
// =====================================================================
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function StatBadge({ icon: Icon, label, count, color }: { icon: any; label: string; count: number; color: string }) {
  const colors: Record<string, string> = {
    cyan: "bg-cyan-50 text-cyan-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${colors[color]}`}>
      <Icon className="w-3 h-3" /> {label} {count}
    </span>
  );
}

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`rounded-xl p-3 text-center ${color}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs font-medium mt-0.5">{label}</p>
    </div>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function ImportModal({ onClose, onImport }: { onClose: () => void; onImport: (data: any) => void }) {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setJsonText(ev.target?.result as string || "");
      setError("");
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(jsonText);
      // 기본 검증
      if (Array.isArray(data)) {
        if (data.length === 0) { setError("빈 배열입니다."); return; }
        if (!data[0].title) { setError("유효한 레슨 데이터가 아닙니다."); return; }
      } else {
        if (!data.title) { setError("유효한 레슨 데이터가 아닙니다 (title 필드 필요)."); return; }
      }
      onImport(data);
    } catch {
      setError("JSON 파싱 오류. 형식을 확인해주세요.");
    }
  };

  return (
    <Modal onClose={onClose}>
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-cyan-600" /> JSON 가져오기
      </h3>

      <div className="space-y-4">
        {/* 파일 업로드 */}
        <div>
          <input ref={fileRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 text-center hover:border-cyan-300 hover:bg-cyan-50/30 transition-all">
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <span className="text-sm text-gray-500">JSON 파일을 선택하세요</span>
          </button>
        </div>

        <div className="text-center text-xs text-gray-400">또는 직접 붙여넣기</div>

        <textarea
          value={jsonText}
          onChange={e => { setJsonText(e.target.value); setError(""); }}
          rows={8}
          className="w-full border border-gray-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-cyan-400"
          placeholder='{"id":"...","title":"Lesson 1","subject":"영어",...}'
        />

        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">취소</button>
          <button onClick={handleImport} disabled={!jsonText.trim()} className="px-5 py-2 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 disabled:opacity-40 transition-colors">
            가져오기
          </button>
        </div>
      </div>
    </Modal>
  );
}

function TextUploadModal({ onClose, onUpload }: { onClose: () => void; onUpload: (data: any) => void }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [subject, setSubject] = useState("영어");
  const [category, setCategory] = useState("");
  const [semester, setSemester] = useState("1");
  const [title, setTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setText(ev.target?.result as string || "");
      setError("");
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!text.trim()) {
      setError("텍스트를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setProgress("AI가 텍스트를 분석하고 있습니다...");

    try {
      // First, test if the API key is configured
      console.log("Testing API connection...");
      
      // Call AI API to analyze text
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7db3bef3/ai/analyze-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ text })
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errData = await response.json();
        console.error("Text analysis error response:", errData);
        const errorMsg = errData.error || "분석 실패";
        const details = errData.details ? `\n상세: ${errData.details}` : "";
        const hint = errData.hint ? `\n힌트: ${errData.hint}` : "";
        throw new Error(`${errorMsg}${details}${hint}`);
      }

      const result = await response.json();
      console.log("AI analysis result:", result);

      setProgress("레슨 데이터 생성 중...");

      // Create lesson from AI analysis
      const lesson: LessonData = {
        id: uid(),
        title: title.trim() || "새 레슨 (텍스트 업로드)",
        subject: subject,
        category: category,
        semester: semester,
        vocabulary: result.vocabulary || [],
        sentences: result.sentences || [],
        paragraphs: result.paragraphs || [],
        problems: result.problems || []
      };

      setProgress("완료!");
      
      // Wait a bit to show success message
      await new Promise(resolve => setTimeout(resolve, 500));

      onUpload(lesson);
    } catch (err: any) {
      console.error("Text analysis error:", err);
      
      // Provide more detailed error messages
      let errorMessage = "텍스트 분석 오류: ";
      
      if (err.message === "Failed to fetch") {
        errorMessage += "서버 연결 실패. Claude API 키가 유효하지 않거나 서버가 응답하지 않습니다.\n\n해결 방법:\n1. '🧠 AI 키 확인' 버튼을 눌러 API 키가 설정되었는지 확인하세요.\n2. 브라우저 콘솔(F12)에서 더 자세한 오류를 확인하세요.";
      } else {
        errorMessage += err.message || String(err);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-600" /> 영어 텍스트 자동 분석
        </h3>
        <p className="text-xs text-gray-500 mb-4">영어 텍스트를 입력하면 AI가 자동으로 단어, 문장, 문단, 문제를 생성합니다.</p>

        <div className="space-y-4">
          {/* 레슨 정보 입력 */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-cyan-800 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> 레슨 정보
            </h4>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">레슨 제목</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={loading}
                placeholder="예: Lesson 1: My New Friends"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 disabled:bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">과목</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 disabled:bg-gray-50"
                >
                  <option value="영어">영어</option>
                  <option value="수학">수학</option>
                  <option value="국어">국어</option>
                  <option value="과학">과학</option>
                  <option value="사회">사회</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">학년 <span className="text-red-500">*</span></label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 disabled:bg-gray-50"
                >
                  <option value="">학년 선택</option>
                  <option value="중1">중1</option>
                  <option value="중2">중2</option>
                  <option value="중3">중3</option>
                  <option value="고1">고1</option>
                  <option value="고2">고2</option>
                  <option value="고3">고3</option>
                  <option value="초등">초등</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">학기</label>
              <select
                value={semester}
                onChange={e => setSemester(e.target.value)}
                disabled={loading}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 disabled:bg-gray-50"
              >
                <option value="1">1학기</option>
                <option value="2">2학기</option>
              </select>
            </div>

            <p className="text-[10px] text-cyan-700">
              💡 학년을 정확히 선택하세요. 학생들은 자신의 학년 레슨만 볼 수 있습니다.
            </p>
          </div>

          {/* 파일 업로드 */}
          <div>
            <input ref={fileRef} type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
            <button 
              onClick={() => fileRef.current?.click()} 
              disabled={loading}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 text-center hover:border-cyan-300 hover:bg-cyan-50/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <span className="text-sm text-gray-500">텍스트 파일(.txt)을 선택하세요</span>
            </button>
          </div>

          <div className="text-center text-xs text-gray-400">또는 직접 붙여넣기</div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">영어 텍스트 입력</label>
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setError(""); }}
              rows={12}
              disabled={loading}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="예:\n\nMy New Friends\n\nToday is my first day at school. I am very excited to meet new friends. In the morning, I introduced myself to my classmates. Everyone was very kind and welcoming.\n\nI made two new friends. Their names are Sarah and Tom. Sarah likes reading books, and Tom enjoys playing soccer. We talked about our hobbies during lunch time.\n\n..."
            />
            <p className="text-[10px] text-gray-400 mt-1">* 문단은 빈 줄로 구분해주세요</p>
          </div>

          {loading && (
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-bold text-cyan-700">{progress}</span>
              </div>
              <p className="text-xs text-cyan-600">AI가 텍스트를 분석하여 학습 자료를 생성하는 중입니다. 잠시만 기다려주세요...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button 
              onClick={onClose} 
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              취소
            </button>
            <button 
              onClick={handleUpload} 
              disabled={!text.trim() || !category || loading} 
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-sm font-bold hover:from-cyan-600 hover:to-blue-600 disabled:opacity-40 transition-colors flex items-center gap-2"
              title={!category ? "학년을 선택해주세요" : ""}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  분석 중...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  AI로 분석하기
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}