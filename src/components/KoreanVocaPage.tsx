import { useState, useEffect } from "react";
import { FileText, BookOpen, GraduationCap, Search, Trash2, X, ChevronLeft, Download, Languages, Layers, Baby, Plus, Save, RotateCcw, Settings, GripVertical, Filter, Lock, Edit2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";
import { getVocaWords, VocaWord, getMaxDay, getDayNames, saveDayNames } from "./VocaManagement";
import { Input } from "./ui/input";
import { WordTest } from "./WordTest";
import { FlashCard } from "./FlashCard";
import { VocabStudy } from "./VocabStudy";
import { downloadHackersVocaPDF, downloadHackersVocaWord } from "../utils/downloadHelpers";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { useIsMobile } from "./ui/use-mobile";

// 한국학교 전용 교재 목록 (접두사 "KR-"로 인증시험 데이터와 분리)
const KOREAN_EXAM_PREFIX = "KR-";

// 전체 교재 목록 (학년별 필터링에 사용)
const ALL_KOREAN_EXAMS = [
  { id: "KR-초등영어", name: "초등영어", icon: Baby, color: "#FFECB3", description: "초등학교 영어 교과서 어휘", level: "초등" },
  { id: "KR-중등영어", name: "중등영어", icon: BookOpen, color: "#B3E5FC", description: "중학교 영어 교과서 어휘", level: "중등" },
  { id: "KR-고등영어", name: "고등영어", icon: GraduationCap, color: "#FFE0B2", description: "고등학교 영어 교과서 어휘", level: "고등" },
  { id: "KR-내신영단어", name: "내신영단어", icon: Layers, color: "#C8E6C9", description: "내신 시험 빈출 어휘", level: "전체" },
];

// 학년별 하위 교과서 목록
interface Textbook {
  id: string;
  name: string;
  publisher: string;
  author: string;
  color: string;
}

const DEFAULT_TEXTBOOKS_BY_EXAM: { [key: string]: Textbook[] } = {
  "KR-초등영어": [
    { id: "천재-함순애", name: "천재교육", publisher: "천재교육", author: "함순애", color: "#E3F2FD" },
    { id: "대교-이재근", name: "대교", publisher: "대교", author: "이재근", color: "#FFF3E0" },
    { id: "YBM-김혜리", name: "YBM", publisher: "YBM", author: "김혜리", color: "#E8F5E9" },
    { id: "동아-윤정미", name: "동아출판", publisher: "동아출판", author: "윤정미", color: "#FCE4EC" },
    { id: "능률-김혜련", name: "NE능률", publisher: "NE능률", author: "김혜련", color: "#F3E5F5" },
    { id: "기타", name: "기타", publisher: "기타", author: "", color: "#F5F5F5" },
  ],
  "KR-중등영어": [
    { id: "동아-윤정미", name: "동아출판", publisher: "동아출판", author: "윤정미", color: "#E3F2FD" },
    { id: "능률-김성곤", name: "NE능률", publisher: "NE능률", author: "김성곤", color: "#FFF3E0" },
    { id: "천재-이재영", name: "천재교육", publisher: "천재교육", author: "이재영", color: "#E8F5E9" },
    { id: "미래엔-최연희", name: "미래엔", publisher: "미래엔", author: "최연희", color: "#FCE4EC" },
    { id: "YBM-박준언", name: "YBM", publisher: "YBM", author: "박준언", color: "#F3E5F5" },
    { id: "비상-김진완", name: "비상교육", publisher: "비상교육", author: "김진완", color: "#E0F7FA" },
    { id: "기타", name: "기타", publisher: "기타", author: "", color: "#F5F5F5" },
  ],
  "KR-고등영어": [
    { id: "능률-김성곤", name: "NE능률", publisher: "NE능률", author: "김성곤", color: "#E3F2FD" },
    { id: "천재-이재영", name: "천재교육", publisher: "천재교육", author: "이재영", color: "#FFF3E0" },
    { id: "비상-홍민표", name: "비상교육", publisher: "비상교육", author: "홍민표", color: "#E8F5E9" },
    { id: "YBM-박준언", name: "YBM", publisher: "YBM", author: "박준언", color: "#FCE4EC" },
    { id: "동아-윤정미", name: "동아출판", publisher: "동아출판", author: "윤정미", color: "#F3E5F5" },
    { id: "미래엔-배두본", name: "미래엔", publisher: "미래엔", author: "배두본", color: "#E0F7FA" },
    { id: "기타", name: "기타", publisher: "기타", author: "", color: "#F5F5F5" },
  ],
  "KR-내신영단어": [],
};

// localStorage 키
const CUSTOM_TEXTBOOKS_KEY = "customTextbooks";

// localStorage에서 커스텀 교과서 불러오기
function loadCustomTextbooks(): { [key: string]: Textbook[] } {
  try {
    const raw = localStorage.getItem(CUSTOM_TEXTBOOKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

// 커스텀 교과서 저장
function saveCustomTextbooks(data: { [key: string]: Textbook[] }) {
  localStorage.setItem(CUSTOM_TEXTBOOKS_KEY, JSON.stringify(data));
}

// 기본값 + 커스텀 머지 (커스텀이 있으면 커스텀 우선)
function getMergedTextbooks(customData: { [key: string]: Textbook[] }): { [key: string]: Textbook[] } {
  const result: { [key: string]: Textbook[] } = {};
  for (const key of Object.keys(DEFAULT_TEXTBOOKS_BY_EXAM)) {
    result[key] = customData[key] || DEFAULT_TEXTBOOKS_BY_EXAM[key];
  }
  for (const key of Object.keys(customData)) {
    if (!result[key]) result[key] = customData[key];
  }
  return result;
}

const PASTEL_COLORS = ["#E3F2FD", "#FFF3E0", "#E8F5E9", "#FCE4EC", "#F3E5F5", "#E0F7FA", "#FFF8E1", "#F1F8E9", "#E8EAF6", "#FBE9E7"];

// 사이드바 카테고리 → 교재 레벨 매핑
function getGradeLevelFromCategory(category: string): string {
  if (category.startsWith("초등영어")) return "초등";
  if (category.startsWith("중등영어")) return "중등";
  if (category.startsWith("고등영어")) return "고등";
  if (category.startsWith("영어") || category.startsWith("실용영어") || category.startsWith("영어회화") || category.startsWith("영어독해")) return "고등";
  return "전체";
}

// 사이드바 카테고리 → KR- 교재 ID 매핑 (자동 선택용)
function getDefaultExamFromCategory(category: string): string {
  if (category.startsWith("초등영어")) return "KR-초등영어";
  if (category.startsWith("중등영어")) return "KR-중등영어";
  if (category.startsWith("고등영어")) return "KR-고등영어";
  if (category.startsWith("영어") || category.startsWith("실용영어") || category.startsWith("영어회화") || category.startsWith("영어독해")) return "KR-고등영어";
  return "";
}

// 사이드바 카테고리에서 학년-학기 파싱 (예: "중등영어2-1" → { grade: 2, semester: 1 })
function parseGradeSemesterFromCategory(category: string): { grade: number; semester: number } | null {
  const match = category.match(/(\d)-(\d)$/);
  if (match) return { grade: parseInt(match[1]), semester: parseInt(match[2]) };
  return null;
}

interface KoreanVocaPageProps {
  selectedCategory?: string;
}

interface DaySelection {
  [key: number]: boolean;
}

// 학년-학기 모드 헬퍼
const GRADE_SEMESTER_EXAMS = ['KR-초등영어', 'KR-중등영어', 'KR-고등영어'];

function isGradeSemesterExam(examId: string): boolean {
  return GRADE_SEMESTER_EXAMS.includes(examId);
}

function getGradeRangeForExam(examId: string): number[] {
  switch (examId) {
    case 'KR-초등영어': return [3, 4, 5, 6];
    case 'KR-중등영어': return [1, 2, 3];
    case 'KR-고등영어': return [1, 2, 3];
    default: return [];
  }
}

function getGradeSemesterOptions(examId: string) {
  const grades = getGradeRangeForExam(examId);
  return grades.flatMap(grade =>
    [1, 2].map(sem => ({
      grade,
      semester: sem,
      day: grades.indexOf(grade) * 2 + sem,
      label: `${grade}-${sem}`,
      fullLabel: `${grade}학년 ${sem}학기`,
    }))
  );
}

function getGradeSemesterLabel(examId: string, day: number): string {
  const opts = getGradeSemesterOptions(examId);
  const found = opts.find(o => o.day === day);
  return found ? `${found.label} (${found.fullLabel})` : `Day ${day}`;
}

export function KoreanVocaPage({ selectedCategory = "" }: KoreanVocaPageProps) {
  const gradeLevel = getGradeLevelFromCategory(selectedCategory);
  
  // 사이드바에서 학년-학기 파싱 (예: "중등영어2-1" → grade=2, semester=1)
  const parsedGS = parseGradeSemesterFromCategory(selectedCategory);
  const sidebarGrade = parsedGS?.grade ?? null;
  const sidebarSemester = parsedGS?.semester ?? null;
  const hasSidebarGradeSemester = sidebarGrade !== null && sidebarSemester !== null;
  
  // 학년별로 보이는 교재 필터링 (내신영단어는 항상 표시)
  const KOREAN_EXAMS = ALL_KOREAN_EXAMS.filter(
    exam => exam.level === "전체" || exam.level === gradeLevel || gradeLevel === "전체"
  );
  
  // 교과서 커스텀 관리
  const [customTextbooks, setCustomTextbooks] = useState<{ [key: string]: Textbook[] }>(loadCustomTextbooks());
  const TEXTBOOKS_BY_EXAM = getMergedTextbooks(customTextbooks);
  const [showTextbookManager, setShowTextbookManager] = useState(false);
  const [editingTextbooks, setEditingTextbooks] = useState<Textbook[]>([]);
  const [editingExamKey, setEditingExamKey] = useState("");
  const [showManagerPassword, setShowManagerPassword] = useState(false);
  const [managerPasswordInput, setManagerPasswordInput] = useState("");
  const [managerPasswordError, setManagerPasswordError] = useState(false);
  const [pendingManagerExamKey, setPendingManagerExamKey] = useState("");

  const defaultExam = getDefaultExamFromCategory(selectedCategory);
  const [selectedMainExam, setSelectedMainExam] = useState<string>(defaultExam);
  const [selectedTextbook, setSelectedTextbook] = useState<string>("");
  const [naeshinSchoolLevel, setNaeshinSchoolLevel] = useState<'초등' | '중등' | '고등'>('중등');
  const isNaeshinMode = selectedMainExam === 'KR-내신영단어';
  const [daySelections, setDaySelections] = useState<DaySelection>({});
  const [selectAll, setSelectAll] = useState(false);

  // 출제 문제수
  const [engToKorHeadwordCount, setEngToKorHeadwordCount] = useState(0);
  const [engToKorSynonymCount, setEngToKorSynonymCount] = useState(0);
  const [korToEngHeadwordCount, setKorToEngHeadwordCount] = useState(0);
  const [korToEngSynonymCount, setKorToEngSynonymCount] = useState(0);

  const [allWords, setAllWords] = useState<VocaWord[]>([]);
  const [dayNames, setDayNames] = useState<any>({});

  // 모달 상태
  const [showStep1Modal, setShowStep1Modal] = useState(false);
  const [showStep2Modal, setShowStep2Modal] = useState(false);
  const [wordSelections, setWordSelections] = useState<{[key: string]: boolean}>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"engToKor" | "korToEng">("engToKor");

  // 테스트 관련 state
  const [showTestMode, setShowTestMode] = useState(false);
  const [showFlashCardMode, setShowFlashCardMode] = useState(false);
  const [showVocabStudyMode, setShowVocabStudyMode] = useState(false);
  const [testType, setTestType] = useState<'multiple' | 'subjective' | 'mixed'>('multiple');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState<{[key: number]: string}>({});
  const [showTestResult, setShowTestResult] = useState<{[key: number]: boolean}>({});
  const [subjectiveAnswer, setSubjectiveAnswer] = useState('');
  const [incorrectQuestions, setIncorrectQuestions] = useState<number[]>([]);
  
  // showTestMode가 변경될 때 이벤트 발생 (모바일 footer 숨김 제어)
  useEffect(() => {
    if (showTestMode) {
      window.dispatchEvent(new Event('vocaTestStart'));
    } else {
      window.dispatchEvent(new Event('vocaTestEnd'));
    }
  }, [showTestMode]);

  // 시험 유형 선택 모달 상태
  const [showQuizTypeModal, setShowQuizTypeModal] = useState(false);
  const [selectedQuizType, setSelectedQuizType] = useState<'multiple' | 'subjective' | 'mixed'>('multiple');
  const [multipleChoiceFormat, setMultipleChoiceFormat] = useState<'engToKor' | 'korToEng' | 'defToEng'>('engToKor');

  // 시험지 정보 상태
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [testName, setTestName] = useState('');
  const [institutionName, setInstitutionName] = useState('');

  // 한국학교 단어만 필터 (KR- 접두사)
  const koreanWords = allWords.filter(w => w.exam.startsWith(KOREAN_EXAM_PREFIX));

  // 학년-학기 모드 상태 (모바일 대응)
  const isMobile = useIsMobile();
  const [internalGrade, setInternalGrade] = useState<number | null>(null);
  const [internalSemester, setInternalSemester] = useState<number | null>(null);

  const effectiveGrade = sidebarGrade || internalGrade;
  const effectiveSemester = sidebarSemester || internalSemester;
  const hasEffectiveGS = effectiveGrade !== null && effectiveSemester !== null;

  // 학년-학기가 결정된 경우 DAY 이름을 학년-학기별로 독립 관리하기 위해 복합 키 사용
  const effectiveExamKey = hasEffectiveGS
    ? `${selectedMainExam}_${effectiveGrade}_${effectiveSemester}`
    : selectedMainExam;

  // effectiveMainExam: 교과서가 선택된 경우 "KR-초등영어::천재-함순애" 형태로 단어 조회 키 생성
  const effectiveMainExam = (() => {
    if (!selectedMainExam.startsWith('KR-')) return selectedMainExam;
    const base = isNaeshinMode ? `${selectedMainExam}::${naeshinSchoolLevel}` : selectedMainExam;
    return selectedTextbook ? `${base}::${selectedTextbook}` : base;
  })();

  // 사이드바나 내부 선택을 통해 학년-학기가 결정되지 않았으면 GS 선택 모드
  const isGSMode = !hasEffectiveGS && isGradeSemesterExam(selectedMainExam);
  const gsOptions = isGradeSemesterExam(selectedMainExam) ? getGradeSemesterOptions(selectedMainExam) : [];

  // DAY 관리 상태
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [editingDayName, setEditingDayName] = useState<number | null>(null);
  const [dayNameInput, setDayNameInput] = useState("");
  
  // 커스텀 최대 DAY 수 (localStorage에 저장)
  const customMaxDayKey = `customMaxDay_${selectedMainExam}_${effectiveGrade ?? ''}_${effectiveSemester ?? ''}`;
  const [customMaxDays, setCustomMaxDays] = useState<{ [key: string]: number }>(() => {
    try {
      const raw = localStorage.getItem('koreanVoca_customMaxDays');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  // 선택된 학년-학기에 속하는 단어들의 DAY를 기준으로 표시
  const wordsForCurrentGS = hasEffectiveGS 
    ? koreanWords.filter(w => {
        if (w.exam !== effectiveMainExam) return false;
        if (w.grade !== undefined && w.semester !== undefined) {
          return w.grade === effectiveGrade && w.semester === effectiveSemester;
        }
        return false;
      })
    : [];
  
  const customDayCount = customMaxDays[customMaxDayKey] || 30;

  // effectiveMainExam 기준으로 실제 단어가 있는 DAY 목록 계산
  const wordsForEffectiveExam = allWords.filter(w => w.exam === effectiveMainExam);
  const daysWithWords = [...new Set(wordsForEffectiveExam.map(w => w.day))].sort((a, b) => a - b);

  const maxDay = selectedMainExam 
    ? (isGSMode 
        ? gsOptions.length 
        : (hasEffectiveGS 
            ? Math.max(customDayCount, ...wordsForCurrentGS.map(w => w.day || 0))
            : (daysWithWords.length > 0
                ? Math.max(customDayCount, ...daysWithWords)
                : Math.max(customDayCount, getMaxDay(koreanWords.filter(w => w.exam === effectiveMainExam) as any[], effectiveMainExam)))))
    : 30;
  const days = isGSMode ? gsOptions.map(o => o.day) : Array.from({ length: maxDay }, (_, i) => i + 1);

  // 교과서(effectiveMainExam) 변경 시 DAY 선택 초기화
  useEffect(() => {
    setDaySelections({});
    setSelectAll(false);
  }, [effectiveMainExam]);

  useEffect(() => {
    loadWords();
    loadDayNames();
    const handleUpdate = () => { loadWords(); loadDayNames(); };
    window.addEventListener('vocaWordsUpdated', handleUpdate);
    window.addEventListener('vocaDayNamesUpdated', handleUpdate);
    // CMS(다른 뷰)에서 단어 제목 변경 후 돌아왔을 때 최신 데이터 반영
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadDayNames();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('vocaWordsUpdated', handleUpdate);
      window.removeEventListener('vocaDayNamesUpdated', handleUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const loadWords = async () => {
    // 1. localStorage에서 즉시 표시 (CMS 저장값 바로 반영)
    try {
      const stored = localStorage.getItem('vocaWords');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) setAllWords(parsed);
      }
    } catch {}
    // 2. 서버에서 최신값으로 갱신 (백그라운드)
    try {
      const words = await getVocaWords();
      setAllWords(words);
      localStorage.setItem('vocaWords', JSON.stringify(words));
    } catch (error) {
      console.error('Error loading words:', error);
    }
  };

  const loadDayNames = async () => {
    // 1. localStorage에서 즉시 표시 (CMS 저장값 바로 반영)
    try {
      const stored = localStorage.getItem('vocaDayNames');
      if (stored) {
        const parsed = JSON.parse(stored);
        setDayNames(parsed);
      }
    } catch {}
    // 2. 서버에서 최신값으로 갱신 (백그라운드)
    try {
      const names = await getDayNames();
      setDayNames(names);
      localStorage.setItem('vocaDayNames', JSON.stringify(names));
    } catch (error) {
      console.error('Error loading day names from server:', error);
    }
  };

  const getDayName = (exam: string, day: number): string => {
    // 1. 비동기로 로드된 state 확인
    if (dayNames[exam]?.[day]) return dayNames[exam][day];
    // 2. state가 아직 로드 안 됐거나 CMS에서 막 변경된 경우: localStorage 직접 읽기
    try {
      const stored = localStorage.getItem('vocaDayNames');
      if (stored) {
        const names = JSON.parse(stored);
        if (names[exam]?.[day]) return names[exam][day];
      }
    } catch {}
    return `Day ${day}`;
  };

  const handleExamChange = (examId: string) => {
    setSelectedMainExam(examId);
    setSelectedTextbook("");
    setDaySelections({});
    setSelectAll(false);
    setInternalGrade(null);
    setInternalSemester(null);
    setEngToKorHeadwordCount(0);
    setEngToKorSynonymCount(0);
    setKorToEngHeadwordCount(0);
    setKorToEngSynonymCount(0);
  };

  const handleDayToggle = (day: number) => {
    setDaySelections(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSelectAllToggle = () => {
    if (selectAll) {
      setDaySelections({});
    } else {
      const allSelected: DaySelection = {};
      days.forEach(day => { allSelected[day] = true; });
      setDaySelections(allSelected);
    }
    setSelectAll(!selectAll);
  };

  const getSelectedDays = () => Object.keys(daySelections).filter(day => daySelections[parseInt(day)]).map(day => parseInt(day));

  const getTotalQuestions = () => engToKorHeadwordCount + engToKorSynonymCount + korToEngHeadwordCount + korToEngSynonymCount;

  const getAvailableWords = () => {
    const selectedDays = getSelectedDays();
    return allWords.filter(word => {
      if (word.exam !== effectiveMainExam) return false;
      
      if (hasEffectiveGS) {
        // 학년-학기가 결정됨 (사이드바 또는 내부 선택)
        if (word.grade !== undefined && word.semester !== undefined) {
          if (word.grade !== effectiveGrade || word.semester !== effectiveSemester) return false;
        } else {
          return false; // grade/semester 정보 없는 단어는 제외
        }
        return selectedDays.includes(word.day);
      }
      
      if (isGSMode) {
        // Grade-semester mode: match by grade+semester OR by day
        return selectedDays.some(day => {
          const opt = gsOptions.find(o => o.day === day);
          if (!opt) return false;
          if (word.grade !== undefined && word.semester !== undefined) {
            return word.grade === opt.grade && word.semester === opt.semester;
          }
          return word.day === day;
        });
      }
      
      return selectedDays.includes(word.day);
    });
  };

  const getHeadwordCount = () => getAvailableWords().length;

  const getSynonymCount = () => {
    return getAvailableWords().reduce((total, word) => {
      if (word.synonyms && word.synonyms.trim()) {
        return total + word.synonyms.split(',').map(s => s.trim()).filter(s => s).length;
      }
      return total;
    }, 0);
  };

  const handleCreateTest = () => {
    if (!selectedMainExam) { toast.error("교재를 선택해주세요."); return; }
    const selectedDays = getSelectedDays();
    if (selectedDays.length === 0) { toast.error("출제범위를 선택해주세요."); return; }
    const totalQuestions = getTotalQuestions();
    if (totalQuestions === 0) { toast.error("출제 문제수를 설정해주세요."); return; }
    const availableWords = getAvailableWords();
    if (availableWords.length === 0) { toast.error("선택한 범위에 등록된 단어가 없습니다. LMS에서 단어를 먼저 등록해주세요."); return; }
    const maxPossible = getHeadwordCount() + getSynonymCount();
    if (totalQuestions > maxPossible) { toast.error(`출제 문제수가 사용 가능한 문제(${maxPossible}개)보다 많습니다.`); return; }
    const initialSelections: {[key: string]: boolean} = {};
    availableWords.slice(0, Math.min(totalQuestions, availableWords.length)).forEach(word => { initialSelections[word.id] = true; });
    setWordSelections(initialSelections);
    setShowStep1Modal(true);
  };

  const getSelectedWordsCount = () => Object.values(wordSelections).filter(Boolean).length;

  const handleProceedToStep2 = () => {
    if (getSelectedWordsCount() === 0) { toast.error("최소 1개 이상의 단어를 선택해주세요."); return; }
    setShowStep1Modal(false);
    setShowStep2Modal(true);
  };

  const getSelectedDayRange = (): string => {
    const selectedDayNums = Object.keys(daySelections).filter(k => daySelections[Number(k)]).map(Number).sort((a, b) => a - b);
    if (selectedDayNums.length === 0) return '전체';
    if (hasEffectiveGS) {
      const gsLabel = `${effectiveGrade}-${effectiveSemester}`;
      if (selectedDayNums.length === 1) return `${gsLabel} Day ${selectedDayNums[0]}`;
      return `${gsLabel} Day ${selectedDayNums[0]}~${selectedDayNums[selectedDayNums.length - 1]}`;
    }
    if (isGSMode) {
      const labels = selectedDayNums.map(d => {
        const opt = gsOptions.find(o => o.day === d);
        return opt ? opt.label : `Day ${d}`;
      });
      if (labels.length === 1) return labels[0];
      return `${labels[0]}~${labels[labels.length - 1]}`;
    }
    if (selectedDayNums.length === 1) return `Day ${selectedDayNums[0]}`;
    return `Day ${selectedDayNums[0]}~${selectedDayNums[selectedDayNums.length - 1]}`;
  };

  const getExamDisplayName = () => {
    const baseName = KOREAN_EXAMS.find(e => e.id === selectedMainExam)?.name || selectedMainExam;
    if (hasEffectiveGS) {
      return `${baseName} ${effectiveGrade}-${effectiveSemester}`;
    }
    return baseName;
  };

  const handleDownloadPDF = () => {
    const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
    if (selectedWords.length === 0) { toast.error("다운로드할 단어를 선택해주세요."); return; }
    downloadHackersVocaPDF(selectedWords, getExamDisplayName(), getSelectedDayRange(), 'engToKor', { testDate, testName, institutionName });
    toast.success("PDF 인쇄 창이 열렸습니다! 'PDF로 저장'을 선택하세요.");
  };

  const handleDownloadWord = () => {
    const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
    if (selectedWords.length === 0) { toast.error("다운로드할 단어를 선택해주세요."); return; }
    downloadHackersVocaWord(selectedWords, getExamDisplayName(), getSelectedDayRange(), 'engToKor', { testDate, testName, institutionName });
    toast.success("워드 파일로 다운로드되었습니다!");
  };

  // 테스트 핸들러
  const handleStartTest = (type: 'multiple' | 'subjective' | 'mixed') => {
    const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
    if (selectedWords.length === 0) { toast.error("출제할 단어를 선택해주세요."); return; }
    setTestType(type);
    setShowTestMode(true);
    setShowStep2Modal(false);
    setCurrentWordIndex(0);
    setTestAnswers({});
    setShowTestResult({});
    setSubjectiveAnswer('');
    setIncorrectQuestions([]);
  };

  const handleNextWord = () => { setCurrentWordIndex(prev => prev + 1); setSubjectiveAnswer(''); };

  const generateTestOptions = (correctAnswer: string, allTestWords: any[], seed: number) => {
    const currentWord = allTestWords.find((w: any) => w.definition === correctAnswer);
    if (!currentWord) return [];
    const seededRandom = (index: number) => { const x = Math.sin(seed * 9999 + index * 1234) * 10000; return x - Math.floor(x); };
    const incorrectOptions = allTestWords.filter((w: any) => w.word !== currentWord?.word).map((w: any, idx: number) => ({ word: w.word, sortKey: seededRandom(idx) })).sort((a: any, b: any) => a.sortKey - b.sortKey).slice(0, 3).map((item: any) => item.word);
    const allOptions = [currentWord?.word, ...incorrectOptions];
    return allOptions.map((opt, idx) => ({ word: opt, sortKey: seededRandom(idx + 100) })).sort((a, b) => a.sortKey - b.sortKey).map(item => item.word);
  };

  const handleTestAnswer = (questionIndex: number, answer: string, correctAnswer: string) => {
    setTestAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    setShowTestResult(prev => ({ ...prev, [questionIndex]: true }));
    if (answer !== correctAnswer) {
      setIncorrectQuestions(prev => prev.includes(questionIndex) ? prev : [...prev, questionIndex]);
    }
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      if (answer === correctAnswer) {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } else {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      }
    } catch (error) { console.log('Audio playback failed:', error); }
  };

  const handleRetryQuestion = (questionIndex: number) => {
    setTestAnswers(prev => { const n = { ...prev }; delete n[questionIndex]; return n; });
    setShowTestResult(prev => { const n = { ...prev }; delete n[questionIndex]; return n; });
    setSubjectiveAnswer('');
  };

  const handleBackToDownload = () => {
    setShowTestMode(false);
    setShowStep2Modal(true);
    setCurrentWordIndex(0);
    setTestAnswers({});
    setShowTestResult({});
    setSubjectiveAnswer('');
    setIncorrectQuestions([]);
  };

  // === 교과서 관리 핸들러 ===
  const openTextbookManager = (examKey: string) => {
    setPendingManagerExamKey(examKey);
    setManagerPasswordInput("");
    setManagerPasswordError(false);
    setShowManagerPassword(true);
  };

  const handleManagerPasswordSubmit = () => {
    if (managerPasswordInput === "matanboy00") {
      setShowManagerPassword(false);
      setEditingExamKey(pendingManagerExamKey);
      setEditingTextbooks(JSON.parse(JSON.stringify(TEXTBOOKS_BY_EXAM[pendingManagerExamKey] || [])));
      setShowTextbookManager(true);
    } else {
      setManagerPasswordError(true);
      setTimeout(() => setManagerPasswordError(false), 2000);
    }
  };

  const handleSaveTextbooks = () => {
    const newCustom = { ...customTextbooks, [editingExamKey]: editingTextbooks };
    setCustomTextbooks(newCustom);
    saveCustomTextbooks(newCustom);
    setShowTextbookManager(false);
    toast.success("교과서 목록이 저장되었습니다.");
  };

  const handleResetTextbooks = () => {
    if (!confirm("교과서 목록을 기본값으로 되돌리시겠습니까?")) return;
    const newCustom = { ...customTextbooks };
    delete newCustom[editingExamKey];
    setCustomTextbooks(newCustom);
    saveCustomTextbooks(newCustom);
    setEditingTextbooks(JSON.parse(JSON.stringify(DEFAULT_TEXTBOOKS_BY_EXAM[editingExamKey] || [])));
    toast.success("기본값으로 복원되었습니다.");
  };

  const handleAddTextbook = () => {
    const newId = `custom-${Date.now()}`;
    const colorIdx = editingTextbooks.length % PASTEL_COLORS.length;
    setEditingTextbooks([...editingTextbooks, {
      id: newId, name: "새 교과서", publisher: "출판사", author: "저자", color: PASTEL_COLORS[colorIdx]
    }]);
  };

  const handleEditTextbookField = (index: number, field: keyof Textbook, value: string) => {
    setEditingTextbooks(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      // id 자동 업데이트 (이름-저자)
      if (field === 'name' || field === 'author') {
        const n = field === 'name' ? value : copy[index].name;
        const a = field === 'author' ? value : copy[index].author;
        if (!copy[index].id.startsWith('custom-')) {
          // 기존 항목은 id 유지
        } else {
          copy[index].id = `${n}-${a}`.replace(/\s+/g, '');
        }
      }
      return copy;
    });
  };

  const handleRemoveTextbook = (index: number) => {
    setEditingTextbooks(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveTextbook = (index: number, direction: 'up' | 'down') => {
    setEditingTextbooks(prev => {
      const copy = [...prev];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= copy.length) return copy;
      [copy[index], copy[targetIdx]] = [copy[targetIdx], copy[index]];
      return copy;
    });
  };

  // DAY 이름 저장
  const handleSaveDayName = async () => {
    if (editingDayName === null) return;
    const newDayNames = { ...dayNames };
    if (!newDayNames[effectiveExamKey]) newDayNames[effectiveExamKey] = {};
    const trimmed = dayNameInput.trim();
    if (trimmed && trimmed !== `Day ${editingDayName}`) {
      newDayNames[effectiveExamKey][editingDayName] = trimmed;
    } else {
      delete newDayNames[effectiveExamKey]?.[editingDayName];
    }
    setDayNames(newDayNames);
    await saveDayNames(newDayNames);
    setEditingDayName(null);
    toast.success("DAY 이름이 변경되었습니다.");
    window.dispatchEvent(new Event('vocaDayNamesUpdated'));
  };

  // 새 DAY 추가
  const handleAddNewDay = () => {
    const newMax = maxDay + 1;
    const updated = { ...customMaxDays, [customMaxDayKey]: newMax };
    setCustomMaxDays(updated);
    localStorage.setItem('koreanVoca_customMaxDays', JSON.stringify(updated));
    setShowAddDayModal(false);
    toast.success(`Day ${newMax}가 추가되었습니다.`);
  };

  const filteredWords = getAvailableWords().filter(word =>
    word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.korean.includes(searchTerm) ||
    word.synonyms.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableWordsCount = getHeadwordCount();
  const availableSynonymsCount = getSynonymCount();
  const maxQuestions = availableWordsCount + availableSynonymsCount;

  // selectedCategory 변경 시 교재 자동 선택
  useEffect(() => {
    const newExam = getDefaultExamFromCategory(selectedCategory);
    if (newExam) {
      setSelectedMainExam(newExam);
      setSelectedTextbook("");
      setDaySelections({});
      setSelectAll(false);
      setInternalGrade(null);
      setInternalSemester(null);
      setEngToKorHeadwordCount(0);
      setEngToKorSynonymCount(0);
      setKorToEngHeadwordCount(0);
      setKorToEngSynonymCount(0);
    }
  }, [selectedCategory]);

  return (
    <div className="space-y-6 pb-8">
      {/* 교재 선택 - 한국학교 전용 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
            <Languages className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              한국학교 단어장
              {hasSidebarGradeSemester && (
                <span className="ml-2 text-sm font-medium text-cyan-600">({selectedCategory})</span>
              )}
            </h2>
            <p className="text-xs text-gray-500">
              {hasSidebarGradeSemester 
                ? '교과서를 선택하고 DAY별 단어 시험을 출제하세요'
                : '교재를 선택하고 단어 시험을 출제하���요'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {KOREAN_EXAMS.map((exam) => {
            const IconComponent = exam.icon;
            const isSelected = selectedMainExam === exam.id;
            return (
              <motion.button
                key={exam.id}
                onClick={() => handleExamChange(exam.id)}
                className={`group relative overflow-hidden rounded-xl p-4 sm:p-6 transition-all duration-300 ${
                  isSelected ? "shadow-lg scale-105" : "shadow-md hover:shadow-lg"
                }`}
                style={{ backgroundColor: isSelected ? exam.color : "#F5F5F5" }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                  <div className={`p-2.5 sm:p-3 rounded-full transition-colors ${isSelected ? "bg-white/80" : "bg-white/60 group-hover:bg-white/80"}`}>
                    <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${isSelected ? "text-cyan-600" : "text-gray-600 group-hover:text-cyan-600"}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-sm sm:text-base mb-0.5 sm:mb-1 ${isSelected ? "text-gray-800" : "text-gray-700"}`}>{exam.name}</h3>
                    <p className={`text-[10px] sm:text-xs ${isSelected ? "text-gray-700" : "text-gray-500"}`}>{exam.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>


      {/* 내신영단어 학교급 선택 */}
      {isNaeshinMode && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-5 sm:p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-semibold text-gray-700">학교급 선택</span>
          </div>
          <div className="flex gap-2">
            {(['초등', '중등', '고등'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setNaeshinSchoolLevel(level)}
                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                  naeshinSchoolLevel === level
                    ? 'bg-cyan-500 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* 하위 교과서 선택 탭 */}
      {selectedMainExam && (TEXTBOOKS_BY_EXAM[selectedMainExam] || []).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-5 sm:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-cyan-600" />
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                교과서 필터
              </h3>
              <span className="text-xs text-gray-400 ml-1">
                ({!selectedTextbook ? "전체 보기" : (TEXTBOOKS_BY_EXAM[selectedMainExam] || []).find(t => t.id === selectedTextbook)?.name || selectedTextbook})
              </span>
            </div>
            <button
              onClick={() => openTextbookManager(selectedMainExam)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors border border-gray-200 hover:border-cyan-300"
              title="교과서 목록 관리"
            >
              <Settings className="w-3.5 h-3.5" />
              관리
            </button>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* 전체 보기 버튼 */}
            <button
              onClick={() => {
                setSelectedTextbook("");
                setDaySelections({});
                setSelectAll(false);
              }}
              className={`relative flex flex-col items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 transition-all duration-200 min-w-[70px] sm:min-w-[80px] ${
                !selectedTextbook
                  ? "border-cyan-500 bg-cyan-50 shadow-md scale-[1.03]"
                  : "border-gray-200 bg-white hover:border-cyan-300 hover:bg-gray-50"
              }`}
            >
              {!selectedTextbook && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <span className={`text-xs sm:text-sm font-semibold ${!selectedTextbook ? "text-cyan-700" : "text-gray-700"}`}>
                전체
              </span>
            </button>
            {(TEXTBOOKS_BY_EXAM[selectedMainExam] || []).map((tb) => {
              const isActive = selectedTextbook === tb.id;
              return (
                <button
                  key={tb.id}
                  onClick={() => {
                    setSelectedTextbook(isActive ? "" : tb.id);
                    setDaySelections({});
                    setSelectAll(false);
                    setEngToKorHeadwordCount(0);
                    setEngToKorSynonymCount(0);
                    setKorToEngHeadwordCount(0);
                    setKorToEngSynonymCount(0);
                  }}
                  className={`relative flex flex-col items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 transition-all duration-200 min-w-[70px] sm:min-w-[80px] ${
                    isActive
                      ? "border-cyan-500 bg-cyan-50 shadow-md scale-[1.03]"
                      : "border-gray-200 bg-white hover:border-cyan-300 hover:bg-gray-50"
                  }`}
                >
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <span className={`text-xs sm:text-sm font-semibold ${isActive ? "text-cyan-700" : "text-gray-700"}`}>
                    {tb.name}{tb.author ? ` (${tb.author})` : ''}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedTextbook && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                선택된 교과서: <span className="font-medium text-cyan-600">
                  {(TEXTBOOKS_BY_EXAM[selectedMainExam] || []).find(t => t.id === selectedTextbook)?.name}
                  {(TEXTBOOKS_BY_EXAM[selectedMainExam] || []).find(t => t.id === selectedTextbook)?.author &&
                    ` (${(TEXTBOOKS_BY_EXAM[selectedMainExam] || []).find(t => t.id === selectedTextbook)?.author})`}
                </span>
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* 교재 선택 후 표시되는 영역 */}
      {selectedMainExam && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 sm:p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* 왼쪽: 출제범위 */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">출제범위</h3>
                {hasEffectiveGS ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg font-medium text-xs border border-cyan-200">
                        {effectiveGrade}학년 {effectiveSemester}학기
                      </span>
                      {!hasSidebarGradeSemester && internalGrade && (
                        <button 
                          onClick={() => { 
                            setInternalGrade(null); 
                            setInternalSemester(null); 
                            setDaySelections({}); 
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-cyan-600 rounded-md hover:bg-cyan-50 transition-colors border border-gray-100"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>변경</span>
                        </button>
                      )}
                      <span className="ml-1">출제할 DAY를 선택하세요.</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      {isGSMode 
                        ? '* 출제할 학년-학기를 선택하세요.' 
                        : '* 출제범위 No.를 입력하세요. (예시: 1, 3-5, 7-8)'}
                    </p>
                    
                    {isGSMode && (
                      <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">학년 선택</label>
                          <div className="flex flex-wrap gap-2">
                            {getGradeRangeForExam(selectedMainExam).map(g => (
                              <button
                                key={g}
                                onClick={() => {
                                  setInternalGrade(g);
                                  setInternalSemester(null);
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  internalGrade === g 
                                    ? "bg-cyan-600 text-white shadow-md scale-105" 
                                    : "bg-white text-gray-600 border border-gray-200 hover:border-cyan-200 hover:bg-cyan-50/30"
                                }`}
                              >
                                {g}학년
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {internalGrade && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2 pt-2 border-t border-gray-200"
                          >
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">학기 선택</label>
                            <div className="flex gap-2">
                              {[1, 2].map(s => (
                                <button
                                  key={s}
                                  onClick={() => setInternalSemester(s)}
                                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                    internalSemester === s 
                                      ? "bg-orange-500 text-white shadow-md" 
                                      : "bg-white text-gray-700 border border-gray-200 hover:border-orange-200 hover:bg-orange-50/30"
                                  }`}
                                >
                                  {s}학기
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={handleSelectAllToggle}
                  disabled={isGSMode}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectAll ? "bg-cyan-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${isGSMode ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {selectAll ? "선택 해제" : "전체선택"}
                </button>
                {!isGSMode && (
                  <button
                    onClick={() => setShowAddDayModal(true)}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    DAY 추가
                  </button>
                )}
              </div>

              {/* DAY 목록 (학년-학기 모드 or Day 모드) */}
              <div className="max-h-[540px] overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-2">
                {isGSMode && !hasEffectiveGS ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Layers className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500 font-medium">학년과 학기를 먼저 선택해주세요.</p>
                      <p className="text-xs text-gray-400">선택한 범위의 DAY 목록이 여기에 표시됩니다.</p>
                    </div>
                  </div>
                ) : days.map((day) => {
                  const wordsInDay = allWords.filter(w => {
                    if (w.exam !== effectiveMainExam) return false;
                    if (hasEffectiveGS) {
                      if (w.grade !== undefined && w.semester !== undefined) {
                        if (w.grade !== effectiveGrade || w.semester !== effectiveSemester) return false;
                      } else {
                        return false;
                      }
                      return w.day === day;
                    }
                    return w.day === day;
                  }).length;
                  const isCustomDay = !isGSMode && day > 30;
                  const dayLabel = getDayName(effectiveExamKey, day);
                  return (
                    <div
                      key={day}
                      className={`flex items-center gap-3 p-2 rounded hover:bg-gray-50 ${
                        isCustomDay ? 'bg-red-50 border border-red-200' : ''
                      }`}
                    >
                      <label className="flex items-center gap-3 flex-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={daySelections[day] || false}
                          onChange={() => handleDayToggle(day)}
                          className={`w-5 h-5 rounded border-gray-300 focus:ring-cyan-500 ${
                            isCustomDay ? 'text-red-600 focus:ring-red-500' : 'text-cyan-600'
                          }`}
                        />
                        <span className={`flex-1 ${isCustomDay ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                          {dayLabel}
                          {isCustomDay && <span className="text-xs ml-2">(추가됨)</span>}
                        </span>
                        <span className={`text-sm ${wordsInDay > 0 ? 'text-cyan-600 font-medium' : 'text-gray-400'}`}>
                          ({wordsInDay}단어)
                        </span>
                      </label>
                      {/* DAY 이름 변경 버튼 (학년-학기 모드가 아닐 때만) */}
                      {!isGSMode && (
                        <button
                          onClick={() => {
                            setEditingDayName(day);
                            setDayNameInput(getDayName(effectiveExamKey, day));
                          }}
                          className="p-1 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
                          title="DAY 이름 변경"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* DAY 이름 변경 인라인 에디터 */}
              <AnimatePresence>
                {editingDayName !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3 bg-cyan-50 border border-cyan-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 whitespace-nowrap">DAY {editingDayName} 이름:</span>
                      <Input
                        value={dayNameInput}
                        onChange={(e) => setDayNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveDayName();
                          } else if (e.key === 'Escape') {
                            setEditingDayName(null);
                          }
                        }}
                        className="flex-1 h-8 text-sm"
                        placeholder={`Day ${editingDayName}`}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveDayName}
                        className="p-1.5 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
                        title="저장"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingDayName(null)}
                        className="p-1.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
                        title="취소"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 오른쪽: 출제 가능 문제수 & 출제 문제수 */}
            <div className="space-y-6">
              {/* 출제 가능 문제수 */}
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">
                  출제 가능 문제수 <span className="text-sm text-gray-600">(선택한 출제범위 내)</span>
                </h3>
                <div className="text-center py-4">
                  <div className="text-4xl sm:text-5xl font-bold text-cyan-600 mb-2">
                    {maxQuestions}+ <span className="text-xl sm:text-2xl">문제</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    표제어 <span className="text-teal-600 font-semibold">{availableWordsCount}</span> / 동의어 <span className="text-teal-600 font-semibold">{availableSynonymsCount}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">* 한 번에 최대 400문제 출제 가능</p>
                </div>
              </div>

              {/* 출제 문제수 */}
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">출제 문제수</h3>

                {/* 영어 → 한글 뜻 쓰기 */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium text-gray-800">영어 →</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium">
                      한 한글 뜻 쓰기
                    </span>
                  </div>
                  {/* 표제어 */}
                  <div className="ml-4 sm:ml-8 mb-3">
                    <div className="flex items-center gap-3 sm:gap-4 mb-2">
                      <span className="text-sm text-gray-600 w-14 sm:w-16">└ 표제어</span>
                      <button onClick={() => setEngToKorHeadwordCount(Math.max(0, engToKorHeadwordCount - 1))} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors">-</button>
                      <input type="number" min="0" max={availableWordsCount} value={engToKorHeadwordCount} onChange={(e) => setEngToKorHeadwordCount(Math.min(Math.max(0, parseInt(e.target.value) || 0), availableWordsCount))} onFocus={(e) => e.target.select()} className="w-20 sm:w-24 text-center text-lg sm:text-xl font-bold border-2 border-gray-300 rounded-lg py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200" />
                      <button onClick={() => { if (getTotalQuestions() < maxQuestions && engToKorHeadwordCount < availableWordsCount) setEngToKorHeadwordCount(engToKorHeadwordCount + 1); else toast.error("출제 가능한 단어 수를 초과했습니다."); }} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors">+</button>
                    </div>
                  </div>
                  {/* 동의어 */}
                  <div className="ml-4 sm:ml-8">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="text-sm text-gray-600 w-14 sm:w-16">└ 동의어</span>
                      <button onClick={() => setEngToKorSynonymCount(Math.max(0, engToKorSynonymCount - 1))} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors">-</button>
                      <input type="number" min="0" max={availableSynonymsCount} value={engToKorSynonymCount} onChange={(e) => setEngToKorSynonymCount(Math.min(Math.max(0, parseInt(e.target.value) || 0), availableSynonymsCount))} onFocus={(e) => e.target.select()} className="w-20 sm:w-24 text-center text-lg sm:text-xl font-bold border-2 border-gray-300 rounded-lg py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200" />
                      <button onClick={() => { if (getTotalQuestions() < maxQuestions && engToKorSynonymCount < availableSynonymsCount) setEngToKorSynonymCount(engToKorSynonymCount + 1); else toast.error("출제 가능한 동의어 수를 초과했습니다."); }} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors">+</button>
                    </div>
                  </div>
                </div>

                {/* 한글 뜻 → 영어 쓰기 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium text-gray-800">한글 뜻 →</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium">
                      E 영어 쓰기
                    </span>
                  </div>
                  <div className="ml-4 sm:ml-8 mb-3">
                    <div className="flex items-center gap-3 sm:gap-4 mb-2">
                      <span className="text-sm text-gray-600 w-14 sm:w-16">└ 표제어</span>
                      <button onClick={() => setKorToEngHeadwordCount(Math.max(0, korToEngHeadwordCount - 1))} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors">-</button>
                      <input type="number" min="0" max={availableWordsCount} value={korToEngHeadwordCount} onChange={(e) => setKorToEngHeadwordCount(Math.min(Math.max(0, parseInt(e.target.value) || 0), availableWordsCount))} onFocus={(e) => e.target.select()} className="w-20 sm:w-24 text-center text-lg sm:text-xl font-bold border-2 border-gray-300 rounded-lg py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200" />
                      <button onClick={() => { if (getTotalQuestions() < maxQuestions && korToEngHeadwordCount < availableWordsCount) setKorToEngHeadwordCount(korToEngHeadwordCount + 1); else toast.error("출제 가능한 단어 수를 초과했습니다."); }} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors">+</button>
                    </div>
                  </div>
                  <div className="ml-4 sm:ml-8">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="text-sm text-gray-600 w-14 sm:w-16">└ 동의어</span>
                      <button onClick={() => setKorToEngSynonymCount(Math.max(0, korToEngSynonymCount - 1))} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors">-</button>
                      <input type="number" min="0" max={availableSynonymsCount} value={korToEngSynonymCount} onChange={(e) => setKorToEngSynonymCount(Math.min(Math.max(0, parseInt(e.target.value) || 0), availableSynonymsCount))} onFocus={(e) => e.target.select()} className="w-20 sm:w-24 text-center text-lg sm:text-xl font-bold border-2 border-gray-300 rounded-lg py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200" />
                      <button onClick={() => { if (getTotalQuestions() < maxQuestions && korToEngSynonymCount < availableSynonymsCount) setKorToEngSynonymCount(korToEngSynonymCount + 1); else toast.error("출제 가능한 동의어 수를 초과했습니다."); }} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors">+</button>
                    </div>
                  </div>
                </div>

                {/* 총 문제수 */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <span className="text-lg text-gray-700">총 </span>
                    <span className="text-3xl font-bold text-cyan-600">{getTotalQuestions()} 문제</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 어휘 시험 출제하기 버튼 */}
          <div className="mt-8">
            <button
              onClick={handleCreateTest}
              disabled={!selectedMainExam || getSelectedDays().length === 0 || getTotalQuestions() === 0}
              className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white py-6 text-lg font-semibold rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5 mr-2" />
              어휘 시험 출제하기
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 1 Modal - 단어 확인 및 선택 */}
      <AnimatePresence>
        {showStep1Modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStep1Modal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 sm:p-6 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-2xl font-bold leading-tight">단어 시험 출제하기</h2>
                    <p className="text-[11px] sm:text-sm text-white/80 mt-0.5">(단어 시험지 · 답안지 제작) - {getExamDisplayName()}</p>
                  </div>
                  <button onClick={() => setShowStep1Modal(false)} className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0">
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)] sm:max-h-[calc(90vh-180px)]">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-xl font-semibold text-teal-600 mb-3 sm:mb-4">
                    Step 1. 출제 단어 확인 및 선택
                  </h3>
                  <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-2 mb-4">
                    <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                      <button
                        onClick={() => setActiveTab("engToKor")}
                        className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base font-medium transition-colors ${activeTab === "engToKor" ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        영어→한글
                      </button>
                      <button
                        onClick={() => setActiveTab("korToEng")}
                        className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base font-medium transition-colors ${activeTab === "korToEng" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        한글→영어
                      </button>
                    </div>
                    <div className="hidden sm:block flex-1" />
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[11px] sm:text-sm text-gray-600 whitespace-nowrap">영단어 첫 글자 보이기</span>
                      <button className="px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg bg-green-100 text-green-700 font-medium text-[11px] sm:text-sm">ON</button>
                      <button className="px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg bg-gray-200 text-gray-600 text-[11px] sm:text-sm">OFF</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* 전체 리스트 */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base">전체 리스트</h4>
                      <button className="text-teal-600 text-sm flex items-center gap-1"><span>정렬 초기화</span></button>
                    </div>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="단어입력" className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredWords.map((word) => (
                        <div key={word.id} className="bg-white p-3 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors">
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <div className="w-16 sm:w-20 font-medium text-gray-800 flex-shrink-0 truncate">
                              {activeTab === "engToKor" ? word.english : word.korean}
                            </div>
                            <div className="w-14 sm:w-20 text-gray-600 flex-shrink-0 truncate">
                              {activeTab === "engToKor" ? word.korean : word.english}
                            </div>
                            <div className="flex-1 text-gray-500 text-[10px] sm:text-xs truncate min-w-0">{word.synonyms || "-"}</div>
                            <div className="flex-shrink-0">
                              <button onClick={() => setWordSelections(prev => ({ ...prev, [word.id]: true }))} className="px-3 py-1 bg-teal-500 text-white rounded text-xs hover:bg-teal-600">담</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 출제 리스트 */}
                  <div className="bg-teal-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                        출제 리스트 <span className="text-teal-600">총 {getSelectedWordsCount()}개</span>
                      </h4>
                    </div>
                    <div className="mb-3 sm:mb-4">
                      <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                        <button className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white rounded-lg text-xs sm:text-sm font-medium border border-gray-200">전체({getSelectedWordsCount()}개)</button>
                        <button className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-teal-500 text-white rounded-lg text-xs sm:text-sm font-medium">한글 뜻 쓰기({engToKorHeadwordCount + engToKorSynonymCount})</button>
                        <button className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-600 rounded-lg text-xs sm:text-sm font-medium">영어 쓰기({korToEngHeadwordCount + korToEngSynonymCount})</button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {getAvailableWords().filter(w => wordSelections[w.id]).map((word) => (
                        <div key={word.id} className="bg-white p-3 rounded-lg border border-teal-200">
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <div className="w-16 sm:w-20 font-medium text-gray-800 flex-shrink-0 truncate">
                              {activeTab === "engToKor" ? word.english : word.korean}
                            </div>
                            <div className="w-14 sm:w-20 text-gray-600 flex-shrink-0 truncate">
                              {activeTab === "engToKor" ? word.korean : word.english}
                            </div>
                            <div className="flex-1 text-gray-500 text-[10px] sm:text-xs truncate min-w-0">{word.synonyms || "-"}</div>
                            <div className="col-span-1 flex justify-end">
                              <button onClick={() => setWordSelections(prev => ({ ...prev, [word.id]: false }))} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 하단 옵션 - 모바일에서 숨김 */}
                <div className="mt-4 sm:mt-6 hidden md:flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-3 sm:p-4 rounded-lg gap-3">
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <label className="flex items-center gap-1.5 sm:gap-2"><input type="checkbox" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" /><span className="text-xs sm:text-sm">영어→한글 뜻 쓰기</span></label>
                    <label className="flex items-center gap-1.5 sm:gap-2"><input type="checkbox" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" /><span className="text-xs sm:text-sm">한글 뜻→영어 쓰기</span></label>
                    <label className="flex items-center gap-1.5 sm:gap-2"><input type="checkbox" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" /><span className="text-xs sm:text-sm">선택안함</span></label>
                  </div>
                  <p className="text-[11px] sm:text-sm text-gray-500">* 출제 리스트에서 유형별 출제 단어 확인 후, [출제하기] 버튼을 클릭하세요.</p>
                </div>
              </div>

              <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
                <button onClick={handleProceedToStep2} className="w-full flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full">
                  출제하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 2 Modal - 저장 및 다운로드 */}
      <AnimatePresence>
        {showStep2Modal && !showTestMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStep2Modal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <button onClick={() => { setShowStep2Modal(false); setShowStep1Modal(true); }} className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0">
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <h2 className="text-base sm:text-2xl font-bold truncate">Step 2. 저장 및 다운로드</h2>
                  </div>
                  <button onClick={() => setShowStep2Modal(false)} className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0">
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                  {/* ���제 결과 */}
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">출제 결과</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 sm:gap-3 bg-white p-3 sm:p-4 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">영어 →</span>
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded text-xs sm:text-sm font-medium flex-shrink-0">한글 뜻 쓰기</span>
                        <span className="text-base sm:text-xl font-bold text-gray-800 ml-auto">{engToKorHeadwordCount + engToKorSynonymCount}문제</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 bg-white p-3 sm:p-4 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">한글 뜻 →</span>
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded text-xs sm:text-sm font-medium flex-shrink-0">영어 쓰기</span>
                        <span className="text-base sm:text-xl font-bold text-gray-800 ml-auto">{korToEngHeadwordCount + korToEngSynonymCount}문제</span>
                      </div>
                      <div className="bg-teal-50 p-3 sm:p-4 rounded-lg border-2 border-teal-200 mt-3 sm:mt-4">
                        <div className="text-center">
                          <span className="text-xs sm:text-sm text-gray-600">총 문항수</span>
                          <div className="text-2xl sm:text-3xl font-bold text-teal-600 mt-1 sm:mt-2">{getTotalQuestions()} 문제</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 테스트 정보 설정 */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">테스트 정보 설정</h3>
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">• 시험일자</label>
                      <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">• 테스트명 (시험지 제목)</label>
                      <input value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="테스트명 (시험지 제목)을 입력하세요." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">• 학교/학원/클래스명</label>
                      <input value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} placeholder="교실기관명을 입력하세요." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        • 학교/학원 로고 <span className="text-xs text-gray-500 ml-2">*파일형식 jpg, png, gif (1MB 이하)</span>
                      </label>
                      <div className="flex gap-2">
                        <input placeholder="파일명 파일 없음" disabled className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500" />
                        <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">파일 선택</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 다운로드 섹션 */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-teal-600 mb-4 text-center">단어 시험지 · 답안지 다운로드</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white py-6 text-lg rounded-full" onClick={handleDownloadPDF}>
                      <Download className="w-5 h-5 mr-2" />PDF 파일로 다운로드
                    </button>
                    <button className="flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white py-6 text-lg rounded-full" onClick={handleDownloadWord}>
                      <Download className="w-5 h-5 mr-2" />워드 파일로 다운로드
                    </button>
                  </div>
                </div>

                {/* 온라인 학습 섹션 */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">온라인 학습</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative">
                      <button
                        className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-black hover:to-gray-800 text-white py-6 text-lg rounded-full transition-all duration-300 hover:shadow-xl hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
                          if (selectedWords.length === 0) { toast.error("단어를 선택해주세요."); return; }
                          setShowQuizTypeModal(true);
                        }}
                      >
                        학습하기
                      </button>
                    </div>
                    <button
                      className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white py-6 text-lg rounded-full transition-all duration-300 hover:shadow-xl hover:scale-105"
                      onClick={() => {
                        const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
                        if (selectedWords.length === 0) { toast.error("단어를 선택해주세요."); return; }
                        setShowFlashCardMode(true);
                      }}
                    >
                      플래시 카드
                    </button>
                    <button
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white py-6 text-lg rounded-full transition-all duration-300 hover:shadow-xl hover:scale-105"
                      onClick={() => {
                        const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
                        if (selectedWords.length === 0) { toast.error("단어를 선택해주세요."); return; }
                        setShowVocabStudyMode(true);
                      }}
                    >
                      어휘 학습
                    </button>
                  </div>

                  {/* 시험 유형 선택 모달 */}
                  {showQuizTypeModal && (
                    <>
                      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setShowQuizTypeModal(false)} />
                      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[70] w-full max-w-lg p-8">
                        <h3 className="text-2xl font-bold text-[#1E3A8A] mb-6">시험 유형 선택</h3>
                        <div className="space-y-3">
                          {/* 객관식 */}
                          <button
                            onClick={() => { setSelectedQuizType('multiple'); }}
                            className={`w-full text-left p-5 rounded-xl border-2 transition-all ${selectedQuizType === 'multiple' ? 'border-[#1E3A8A] bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            <div className="font-bold text-gray-900 text-lg">객관식</div>
                            <div className="text-sm text-gray-500 mb-3">4지선다 형식</div>
                            {selectedQuizType === 'multiple' && (
                              <div className="mt-2 pl-2 space-y-2">
                                <div className="text-sm font-medium text-gray-700 mb-1">문제 형식:</div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="radio" name="mcFormat" checked={multipleChoiceFormat === 'engToKor'} onChange={() => setMultipleChoiceFormat('engToKor')} className="w-4 h-4 text-[#1E3A8A]" />
                                  <span className="text-sm text-gray-700">영어 → 한글</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="radio" name="mcFormat" checked={multipleChoiceFormat === 'korToEng'} onChange={() => setMultipleChoiceFormat('korToEng')} className="w-4 h-4 text-[#1E3A8A]" />
                                  <span className="text-sm text-gray-700">한글 → 영어</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="radio" name="mcFormat" checked={multipleChoiceFormat === 'defToEng'} onChange={() => setMultipleChoiceFormat('defToEng')} className="w-4 h-4 text-[#1E3A8A]" />
                                  <span className="text-sm text-gray-700">영영풀이 → 영어</span>
                                </label>
                              </div>
                            )}
                          </button>
                          {/* 주관식 */}
                          <button
                            onClick={() => setSelectedQuizType('subjective')}
                            className={`w-full text-left p-5 rounded-xl border-2 transition-all ${selectedQuizType === 'subjective' ? 'border-[#1E3A8A] bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            <div className="font-bold text-gray-900 text-lg">주관식</div>
                            <div className="text-sm text-gray-500">직접 답을 입력</div>
                          </button>
                          {/* 혼합형 */}
                          <button
                            onClick={() => setSelectedQuizType('mixed')}
                            className={`w-full text-left p-5 rounded-xl border-2 transition-all ${selectedQuizType === 'mixed' ? 'border-[#1E3A8A] bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            <div className="font-bold text-gray-900 text-lg">혼합형</div>
                            <div className="text-sm text-gray-500">객관식과 주관식 혼합</div>
                          </button>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <button onClick={() => setShowQuizTypeModal(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">취소</button>
                          <button onClick={() => { handleStartTest(selectedQuizType); setShowQuizTypeModal(false); }} className="flex-1 py-3 rounded-xl bg-[#1E3A8A] text-white font-medium hover:bg-[#1E3A8A]/90 transition-colors">시작하기</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 테스트 모드 - Full Screen */}
      {showTestMode && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <WordTest
            selectedWordList={{
              words: getAvailableWords().filter(w => wordSelections[w.id]).map(w => ({
                word: w.english,
                definition: w.korean,
                context: w.synonyms
              })),
              title: `${getExamDisplayName()} 단어 테스트`
            }}
            currentWordIndex={currentWordIndex}
            setCurrentWordIndex={setCurrentWordIndex}
            testAnswers={testAnswers}
            setTestAnswers={setTestAnswers}
            showTestResult={showTestResult}
            setShowTestResult={setShowTestResult}
            subjectiveAnswer={subjectiveAnswer}
            setSubjectiveAnswer={setSubjectiveAnswer}
            setWordStudyMode={() => {}}
            generateTestOptions={generateTestOptions}
            handleTestAnswer={handleTestAnswer}
            handleNextWord={handleNextWord}
            handleRetryQuestion={handleRetryQuestion}
            incorrectQuestions={incorrectQuestions}
            setIncorrectQuestions={setIncorrectQuestions}
            testType={testType}
            onBackToDownload={handleBackToDownload}
            multipleChoiceFormat={multipleChoiceFormat}
          />
        </div>
      )}

      {/* 플래시 카드 모드 */}
      {showFlashCardMode && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <FlashCard
            words={getAvailableWords().filter(w => wordSelections[w.id]).map(w => ({
              word: w.english,
              definition: w.korean,
              engDefinition: w.definition,
              context: w.synonyms
            }))}
            title={`${getExamDisplayName()} 플래시 카드`}
            onClose={() => setShowFlashCardMode(false)}
          />
        </div>
      )}

      {/* 어휘 학습 모드 */}
      {showVocabStudyMode && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <VocabStudy
            words={getAvailableWords().filter(w => wordSelections[w.id]).map(w => ({
              word: w.english,
              definition: w.korean,
              context: w.synonyms
            }))}
            title={`${getExamDisplayName()} 어휘 학습`}
            onClose={() => setShowVocabStudyMode(false)}
          />
        </div>
      )}

      {/* ===== 관리 비밀번호 모달 ===== */}
      <AnimatePresence>
        {showManagerPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center sm:p-4 z-50"
            onClick={() => setShowManagerPassword(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-sm shadow-xl border-t sm:border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sm:hidden flex justify-center pt-2.5 pb-1">
                <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-800">관리자 인증</h2>
                    <p className="text-xs text-gray-500">비밀번호를 입력해주세요</p>
                  </div>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleManagerPasswordSubmit(); }}>
                  <input
                    type="password"
                    value={managerPasswordInput}
                    onChange={(e) => { setManagerPasswordInput(e.target.value); setManagerPasswordError(false); }}
                    placeholder="비밀번호 입력"
                    autoFocus
                    className={`w-full h-12 sm:h-11 px-4 text-sm rounded-xl sm:rounded-lg border-2 outline-none transition-colors ${
                      managerPasswordError
                        ? 'border-red-400 bg-red-50 animate-shake'
                        : 'border-gray-200 focus:border-cyan-500 bg-white'
                    }`}
                  />
                  {managerPasswordError && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">비밀번호가 틀렸습니다.</p>
                  )}
                  <div className="flex gap-2.5 mt-4 pb-2 sm:pb-0">
                    <button
                      type="button"
                      onClick={() => setShowManagerPassword(false)}
                      className="flex-1 h-12 sm:h-11 text-sm font-medium rounded-xl sm:rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="flex-1 h-12 sm:h-11 text-sm font-medium rounded-xl sm:rounded-lg text-white transition-colors"
                      style={{ background: 'linear-gradient(135deg, #00bcd4, #0097a7)' }}
                    >
                      확인
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 교과서 관리 모달 ===== */}
      <AnimatePresence>
        {showTextbookManager && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowTextbookManager(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-600 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">교과서 목록 관리</h2>
                    <p className="text-xs text-gray-500">
                      {ALL_KOREAN_EXAMS.find(e => e.id === editingExamKey)?.name || editingExamKey} — 이름·저자 편집, 추가/삭제/순서 변경
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowTextbookManager(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* 모달 바디 */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {editingTextbooks.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">등록된 교과서가 없습니다</p>
                    <p className="text-xs mt-1">아래 버튼으로 교과서를 추가하세요</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editingTextbooks.map((tb, idx) => (
                      <div
                        key={`${tb.id}-${idx}`}
                        className="group flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-cyan-300 hover:shadow-sm transition-all bg-white"
                      >
                        {/* 순서 이동 */}
                        <div className="flex flex-col gap-0.5 pt-1.5 shrink-0">
                          <button
                            onClick={() => handleMoveTextbook(idx, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 text-gray-300 hover:text-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="위로"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" /></svg>
                          </button>
                          <GripVertical className="w-4 h-4 text-gray-300" />
                          <button
                            onClick={() => handleMoveTextbook(idx, 'down')}
                            disabled={idx === editingTextbooks.length - 1}
                            className="p-0.5 text-gray-300 hover:text-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="아래로"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        </div>

                        {/* 색상 미리보기 */}
                        <div
                          className="w-10 h-10 rounded-lg shrink-0 mt-1 border border-gray-200 cursor-pointer relative overflow-hidden"
                          style={{ backgroundColor: tb.color }}
                          title="색상 변경"
                        >
                          <input
                            type="color"
                            value={tb.color}
                            onChange={(e) => handleEditTextbookField(idx, 'color', e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>

                        {/* 필드들 */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">표시 이름</label>
                            <input
                              value={tb.name}
                              onChange={(e) => handleEditTextbookField(idx, 'name', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                              placeholder="예: 천재교육"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">출판사</label>
                            <input
                              value={tb.publisher}
                              onChange={(e) => handleEditTextbookField(idx, 'publisher', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                              placeholder="예: 천재교육"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">저자</label>
                            <input
                              value={tb.author}
                              onChange={(e) => handleEditTextbookField(idx, 'author', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                              placeholder="예: 함순애"
                            />
                          </div>
                        </div>

                        {/* 삭제 버튼 */}
                        <button
                          onClick={() => handleRemoveTextbook(idx)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 mt-1"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 교과서 추가 버튼 */}
                <button
                  onClick={handleAddTextbook}
                  className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 hover:border-cyan-400 rounded-xl text-sm font-medium text-gray-400 hover:text-cyan-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  교과서 추가
                </button>
              </div>

              {/* 모달 푸터 */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
                <button
                  onClick={handleResetTextbooks}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  기본값 복원
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTextbookManager(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveTextbooks}
                    className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    저장
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DAY 추가 모달 */}
      <AnimatePresence>
        {showAddDayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddDayModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-gray-800 text-lg mb-3">새 DAY 추가</h3>
              <p className="text-sm text-gray-600 mb-4">
                Day {maxDay + 1}이 추가됩니다. 단어 관리(LMS)에서 해당 DAY에 단어를 등록할 수 있습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleAddNewDay}
                  className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium text-sm transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Day {maxDay + 1} 추가
                </button>
                <button
                  onClick={() => setShowAddDayModal(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition-colors"
                >
                  취소
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}