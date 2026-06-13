import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner@2.0.3";
import { Plus, Trash2, Edit2, Save, X, Search, BookOpen, Upload, Download, FileSpreadsheet, FileText, CloudUpload, Cloud, Filter, EyeOff, Eye, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Textarea } from "./ui/textarea";
import { generateWordsForDay } from "./vocaWordSets";
import * as vocaApi from "../utils/vocaApi";
import { migrateLocalStorageToSupabase, uploadSampleWordsToSupabase, getDataStats } from "../utils/vocaMigration";

export interface VocaWord {
  id: string;
  exam: string; // 인증시험: 'TOEFL'|'SAT'|'IELTS'|'ACT'|'TOEIC', 한국학교: 'KR-초등영어'|'KR-중등영어'|'KR-고등영어'|'KR-내신영단어'
  day: number; // 1-30+
  english: string;
  korean: string;
  definition?: string; // 영영풀이 (SAT 전용)
  synonyms: string; // 쉼표로 구분
  textbook?: string; // 한국학교 교과서 ID (예: '천재-함순애', '대교-이재근' 등)
  grade?: number; // 학년 (1-6: 초등, 1-3: 중등, 1-3: 고등)
  semester?: number; // 학기 (1 or 2)
}

// 한국학교 교과서 목록 (LMS, KoreanVocaPage 공용)
export interface TextbookInfo {
  id: string;
  name: string;
  publisher: string;
  author: string;
}

export const KOREAN_TEXTBOOKS_BY_EXAM: { [key: string]: TextbookInfo[] } = {
  "KR-초등영어": [
    { id: "천재-함순애", name: "천재교육", publisher: "천재교육", author: "함순애" },
    { id: "대교-이재근", name: "대교", publisher: "대교", author: "이재근" },
    { id: "YBM-김혜리", name: "YBM", publisher: "YBM", author: "김혜리" },
    { id: "동아-윤정미", name: "동아출판", publisher: "동아출판", author: "윤정미" },
    { id: "능률-김혜련", name: "NE능률", publisher: "NE능률", author: "김혜련" },
    { id: "기타", name: "기타", publisher: "기타", author: "" },
  ],
  "KR-중등영어": [
    { id: "동아-윤정미", name: "동아출판", publisher: "동아출판", author: "윤정미" },
    { id: "능률-김성곤", name: "NE능률", publisher: "NE능률", author: "김성곤" },
    { id: "천재-이재영", name: "천재교육", publisher: "천재교육", author: "이재영" },
    { id: "미래엔-최연희", name: "미래엔", publisher: "미래엔", author: "최연희" },
    { id: "YBM-박준언", name: "YBM", publisher: "YBM", author: "박준언" },
    { id: "비상-김진완", name: "비상교육", publisher: "비상교육", author: "김진완" },
    { id: "기타", name: "기타", publisher: "기타", author: "" },
  ],
  "KR-고등영어": [
    { id: "능률-김성곤", name: "NE능률", publisher: "NE능률", author: "김성곤" },
    { id: "천재-이재영", name: "천재교육", publisher: "천재교육", author: "이재영" },
    { id: "비상-홍민표", name: "비상교육", publisher: "비상교육", author: "홍민표" },
    { id: "YBM-박준언", name: "YBM", publisher: "YBM", author: "박준언" },
    { id: "동아-윤정미", name: "동아출판", publisher: "동아출판", author: "윤정미" },
    { id: "미래엔-배두본", name: "미래엔", publisher: "미래엔", author: "배두본" },
    { id: "기타", name: "기타", publisher: "기타", author: "" },
  ],
  "KR-내신영단어": [],
};

// 출판사명/교과서명 → 교과서 ID 자동 매핑 (CSV 업로드용)
export function autoMapTextbookId(examId: string, textbookInput: string): string {
  if (!textbookInput || !textbookInput.trim()) return "";
  const input = textbookInput.trim().toLowerCase();
  const textbooks = KOREAN_TEXTBOOKS_BY_EXAM[examId] || [];
  
  // 정확한 ID 매치
  const exactMatch = textbooks.find(t => t.id.toLowerCase() === input);
  if (exactMatch) return exactMatch.id;
  
  // 출판사명 매치
  const publisherMatch = textbooks.find(t => 
    t.publisher.toLowerCase() === input || 
    t.name.toLowerCase() === input
  );
  if (publisherMatch) return publisherMatch.id;
  
  // 저자명 매치
  const authorMatch = textbooks.find(t => t.author && t.author.toLowerCase() === input);
  if (authorMatch) return authorMatch.id;
  
  // 부분 매치 (포함 검색)
  const partialMatch = textbooks.find(t =>
    t.publisher.toLowerCase().includes(input) ||
    t.name.toLowerCase().includes(input) ||
    t.id.toLowerCase().includes(input) ||
    input.includes(t.publisher.toLowerCase()) ||
    input.includes(t.name.toLowerCase())
  );
  if (partialMatch) return partialMatch.id;

  return "기타";
}

// Day 이름 매핑 인터페이스
export interface DayNameMapping {
  [exam: string]: {
    [day: number]: string;
  };
}

// Supabase에서 Day 이름 매핑 가져오기
export const getDayNames = async (): Promise<DayNameMapping> => {
  try {
    return await vocaApi.fetchDayNames();
  } catch (error) {
    console.error('Failed to fetch day names from server, using localStorage fallback:', error);
    const stored = localStorage.getItem('vocaDayNames');
    return stored ? JSON.parse(stored) : {};
  }
};

// Supabase에 Day 이름 매핑 저장
export const saveDayNames = async (names: DayNameMapping) => {
  try {
    await vocaApi.saveDayNames(names);
    // 로컬에도 백업 저장
    localStorage.setItem('vocaDayNames', JSON.stringify(names));
    window.dispatchEvent(new Event('vocaDayNamesUpdated'));
  } catch (error) {
    console.error('Failed to save day names to server:', error);
    toast.error('서버 저장 실패. 로컬에만 저장됩니다.');
    localStorage.setItem('vocaDayNames', JSON.stringify(names));
    window.dispatchEvent(new Event('vocaDayNamesUpdated'));
  }
};

// 최대 Day 번호 가져오기
export const getMaxDay = (words: VocaWord[], exam: string): number => {
  const examWords = words.filter(w => w.exam === exam);
  if (examWords.length === 0) return 30;
  return Math.max(...examWords.map(w => w.day), 30);
};

// Supabase에서 단어 데이터 가져오기
export const getVocaWords = async (): Promise<VocaWord[]> => {
  try {
    return await vocaApi.fetchVocaWords();
  } catch (error) {
    console.error('Failed to fetch words from server, using localStorage fallback:', error);
    const stored = localStorage.getItem('vocaWords');
    return stored ? JSON.parse(stored) : [];
  }
};

// Supabase에 단어 데이터 저장
export const saveVocaWords = async (words: VocaWord[]) => {
  try {
    await vocaApi.saveVocaWords(words);
    // 로컬에도 백업 저장
    localStorage.setItem('vocaWords', JSON.stringify(words));
    window.dispatchEvent(new Event('vocaWordsUpdated'));
  } catch (error) {
    console.error('Failed to save words to server:', error);
    toast.error('서버 저장 실패. 로컬에만 저장됩니다.');
    localStorage.setItem('vocaWords', JSON.stringify(words));
    window.dispatchEvent(new Event('vocaWordsUpdated'));
  }
};

export function VocaManagement() {
  const [words, setWords] = useState<VocaWord[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('TOEFL');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  // effectiveExam: 한국학교 모드 + 교과서 선택 시 "KR-초등영어::천재-함순애" 형태로 저장 키 분리
  // 이 값을 단어 저장/조회/필터링에 모두 사용해서 교과서별로 완전히 분리 저장됨
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ english: "", korean: "", definition: "", synonyms: "" });
  const [newWord, setNewWord] = useState({ english: "", korean: "", definition: "", synonyms: "" });
  const [loading, setLoading] = useState(false);
  
  // 일괄 입력 & 업로드 모달
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [uploadMode, setUploadMode] = useState<"manual" | "csv">("manual");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Day 이름 관리
  const [dayNames, setDayNames] = useState<DayNameMapping>({});
  const [editingDayName, setEditingDayName] = useState<number | null>(null);
  const [dayNameInput, setDayNameInput] = useState("");
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  
  // 마이그레이션 모달
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  // DAY 생략(숨기기) 관리
  const [hiddenDays, setHiddenDays] = useState<{ [exam: string]: number[] }>(() => {
    try {
      const stored = localStorage.getItem('vocaHiddenDays');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });
  const [showHiddenDays, setShowHiddenDays] = useState(false);
  const [showDeleteDayConfirm, setShowDeleteDayConfirm] = useState(false);

  // 모드: 인증시험 vs 한국학교
  const [vocaMode, setVocaMode] = useState<'certification' | 'korean'>('certification');
  
  // 한국학교 교과서 필터
  const [selectedTextbook, setSelectedTextbook] = useState<string>("");

  // 내신영단어 전용: 학교급 선택 (초등/중등/고등)
  const [naeshinSchoolLevel, setNaeshinSchoolLevel] = useState<'초등' | '중등' | '고등'>('중등');

  // 한국학교 학년/학기 선택 (NEW)
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);

  const certExams = ['TOEFL', 'SAT', 'IELTS', 'ACT', 'TOEIC'];
  const koreanExams = [
    { id: 'KR-초등영어', name: '초등영어' },
    { id: 'KR-중등영어', name: '중등영어' },
    { id: 'KR-고등영어', name: '고등영어' },
    { id: 'KR-내신영단어', name: '내신영단어' },
  ];
  const exams = vocaMode === 'certification' ? certExams : koreanExams.map(e => e.id);
  const getExamLabel = (examId: string) => {
    const kr = koreanExams.find(e => e.id === examId);
    return kr ? kr.name : examId;
  };

  // 학년-학기 모드 판별: 초등/중등/고등 영어는 학년-학기 사용
  const isGradeSemesterMode = ['KR-초등영어', 'KR-중등영어', 'KR-고등영어', 'KR-내신영단어'].includes(selectedExam);
  const isNaeshinMode = selectedExam === 'KR-내신영단어'; // 내신영단어: 학교급 선택 추가

  // effectiveExam: 교과서 선택 시 "KR-초등영어::천재-함순애", 내신영단어는 "KR-내신영단어::중등" 형태로 분리 저장
  const effectiveExam = (() => {
    if (vocaMode !== 'korean' || !selectedExam.startsWith('KR-')) return selectedExam;
    if (isNaeshinMode) {
      const base = `${selectedExam}::${naeshinSchoolLevel}`;
      return selectedTextbook ? `${base}::${selectedTextbook}` : base;
    }
    // grade/semester 모드: KoreanVocaPage의 effectiveExamKey와 키 구조를 맞춤
    // KoreanVocaPage: "KR-고등영어_1_1" 또는 "KR-고등영어_1_1::textbook"
    const base = isGradeSemesterMode
      ? `${selectedExam}_${selectedGrade}_${selectedSemester}`
      : selectedExam;
    return selectedTextbook ? `${base}::${selectedTextbook}` : base;
  })();


  // 학년 범위 설정
  const getGradeRange = (examId: string): number[] => {
    switch (examId) {
      case 'KR-초등영어': return [3, 4, 5, 6]; // 초등 3~6학년
      case 'KR-중등영어': return [1, 2, 3]; // 중1~3
      case 'KR-고등영어': return [1, 2, 3]; // 고1~3
      case 'KR-내신영단어':
        if (naeshinSchoolLevel === '초등') return [3, 4, 5, 6];
        if (naeshinSchoolLevel === '고등') return [1, 2, 3];
        return [1, 2, 3]; // 중등 기본
      default: return [];
    }
  };

  // 학년-학기 옵션 생성
  const gradeSemesterOptions = isGradeSemesterMode
    ? getGradeRange(selectedExam).flatMap(grade => [1, 2].map(sem => {
        const schoolPrefix = isNaeshinMode ? `${naeshinSchoolLevel} ` : '';
        return { grade, semester: sem, label: `${grade}-${sem}`, fullLabel: `${schoolPrefix}${grade}학년 ${sem}학기` };
      }))
    : [];

  // 학년-학기를 Day로 변환 (backward compat)
  const gradeSemesterToDay = (grade: number, semester: number): number => {
    const grades = getGradeRange(selectedExam);
    const gradeIndex = grades.indexOf(grade);
    if (gradeIndex === -1) return 1;
    return gradeIndex * 2 + semester;
  };

  // 교재 변경 시 학년/학기 기본값 설정
  useEffect(() => {
    if (isGradeSemesterMode) {
      const grades = getGradeRange(selectedExam);
      setSelectedGrade(grades[0] || 1);
      setSelectedSemester(1);
      setSelectedDay(1);
    }
  }, [selectedExam]);

  // 학년/학기 변경 시 DAY 1로 리셋
  useEffect(() => {
    if (isGradeSemesterMode) {
      setSelectedDay(1);
    }
  }, [selectedGrade, selectedSemester]);

  // 내신영단어 학교급 변경 시 학년/학기/DAY 리셋
  useEffect(() => {
    if (isNaeshinMode) {
      const grades = getGradeRange('KR-내신영단어');
      setSelectedGrade(grades[0] || 1);
      setSelectedSemester(1);
      setSelectedDay(1);
    }
  }, [naeshinSchoolLevel]);

  // 학년-학기 모드에서는 해당 grade+semester 단어들의 최대 day 기준으로 maxDay 계산
  const gsWordsForMax = isGradeSemesterMode
    ? words.filter(w => w.exam === effectiveExam && w.grade === selectedGrade && w.semester === selectedSemester)
    : [];
  const maxDay = isGradeSemesterMode
    ? Math.max(30, ...gsWordsForMax.map(w => w.day || 0))
    : getMaxDay(words, effectiveExam);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  useEffect(() => {
    loadWords();
    loadDayNames();
    
    // Day 이름 업데이트 이벤트 리스너
    const handleDayNamesUpdate = () => loadDayNames();
    window.addEventListener('vocaDayNamesUpdated', handleDayNamesUpdate);
    return () => window.removeEventListener('vocaDayNamesUpdated', handleDayNamesUpdate);
  }, []);

  const loadWords = async () => {
    setLoading(true);
    try {
      const fetchedWords = await getVocaWords();
      setWords(fetchedWords);
    } catch (error) {
      console.error('Error loading words:', error);
      toast.error('단어 로딩 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };
  
  const loadDayNames = async () => {
    try {
      const names = await getDayNames();
      setDayNames(names);
    } catch (error) {
      console.error('Error loading day names:', error);
    }
  };
  
  // Day 이름 가져오기 헬퍼 함수
  const getDayName = (exam: string, day: number): string => {
    return dayNames[exam]?.[day] || `Day ${day}`;
  };
  
  // Day 이름 수정
  const handleSaveDayName = async () => {
    if (!dayNameInput.trim()) {
      toast.error("Day 이름을 입력해주세요.");
      return;
    }
    
    const newDayNames = { ...dayNames };
    if (!newDayNames[effectiveExam]) {
      newDayNames[effectiveExam] = {};
    }
    newDayNames[effectiveExam][editingDayName!] = dayNameInput.trim();
    
    setDayNames(newDayNames);
    await saveDayNames(newDayNames);
    setEditingDayName(null);
    setDayNameInput("");
    toast.success("Day 이름이 변경되었습니다.");
  };
  
  // 새 Day 추가
  const handleAddNewDay = () => {
    const newDay = maxDay + 1;
    setSelectedDay(newDay);
    setShowAddDayModal(false);
    toast.success(`Day ${newDay}가 추가되었습니다. 단어를 추가해주세요.`);
  };

  // === DAY 관리: 전체 삭제 & 생략(숨기기) ===
  const currentHiddenDays = hiddenDays[effectiveExam] || [];
  const isDayHidden = currentHiddenDays.includes(selectedDay);
  const currentDayLabel = isGradeSemesterMode
    ? `${getDayName(effectiveExam, selectedDay)} (${selectedGrade}학년 ${selectedSemester}학기)`
    : getDayName(effectiveExam, selectedDay);

  // 현재 DAY 전체 단어 삭제
  const handleDeleteAllDayWords = async () => {
    const dayWordsCount = filteredWords.length;
    if (dayWordsCount === 0) {
      toast.error("삭제할 단어가 없습니다.");
      setShowDeleteDayConfirm(false);
      return;
    }
    const updatedWords = words.filter(w => {
      if (w.exam !== effectiveExam) return true;
      if (w.day !== selectedDay) return true;
      if (isGradeSemesterMode) {
        return !(w.grade === selectedGrade && w.semester === selectedSemester);
      }
      return false;
    });
    setWords(updatedWords);
    await saveVocaWords(updatedWords);
    setShowDeleteDayConfirm(false);
    toast.success(`${currentDayLabel}의 ${dayWordsCount}개 단어가 모두 삭제되었습니다.`);
  };

  // DAY 생략(숨기기) 토글
  const handleToggleDayHidden = (day: number) => {
    const examHidden = hiddenDays[effectiveExam] || [];
    let newExamHidden: number[];
    if (examHidden.includes(day)) {
      newExamHidden = examHidden.filter(d => d !== day);
    } else {
      newExamHidden = [...examHidden, day];
    }
    const newHiddenDays = { ...hiddenDays, [effectiveExam]: newExamHidden };
    setHiddenDays(newHiddenDays);
    localStorage.setItem('vocaHiddenDays', JSON.stringify(newHiddenDays));
    if (newExamHidden.includes(day)) {
      toast.success(`${isGradeSemesterMode ? currentDayLabel : getDayName(effectiveExam, day)}이(가) 숨김 처리되었습니다.`);
    } else {
      toast.success(`${isGradeSemesterMode ? currentDayLabel : getDayName(effectiveExam, day)} 숨김이 해제되었습니다.`);
    }
  };

  // DAY 숨김 해제 (복원)
  const handleRestoreDay = (day: number) => {
    const examHidden = hiddenDays[effectiveExam] || [];
    const newExamHidden = examHidden.filter(d => d !== day);
    const newHiddenDays = { ...hiddenDays, [effectiveExam]: newExamHidden };
    setHiddenDays(newHiddenDays);
    localStorage.setItem('vocaHiddenDays', JSON.stringify(newHiddenDays));
    toast.success("DAY 숨김이 해제되었습니다.");
  };

  // 숨긴 DAY를 제외한 visible days (드롭다운용)
  const visibleDays = showHiddenDays ? days : days.filter(d => !currentHiddenDays.includes(d));

  const filteredWords = words.filter(
    (word) =>
      word.exam === effectiveExam &&
      word.day === selectedDay &&
      (isGradeSemesterMode
        ? (word.grade === selectedGrade && word.semester === selectedSemester)
        : true) &&
      (searchTerm === "" ||
        word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.korean.includes(searchTerm))
  );

  // 현재 교재에 해당하는 교과서 목록
  const currentTextbooks = vocaMode === 'korean' ? (KOREAN_TEXTBOOKS_BY_EXAM[selectedExam] || []) : [];

  const handleAddWord = async () => {
    if (!newWord.english.trim() || !newWord.korean.trim()) {
      toast.error("영어 단어와 한글 뜻을 입력해주세요.");
      return;
    }

    const word: VocaWord = {
      id: Date.now().toString(),
      exam: effectiveExam,
      day: selectedDay,
      english: newWord.english.trim(),
      korean: newWord.korean.trim(),
      definition: newWord.definition?.trim(),
      synonyms: newWord.synonyms.trim(),
      ...(vocaMode === 'korean' && selectedTextbook ? { textbook: selectedTextbook } : {}),
      ...(vocaMode === 'korean' ? { grade: selectedGrade, semester: selectedSemester } : {}),
    };

    const updatedWords = [...words, word];
    setWords(updatedWords);
    await saveVocaWords(updatedWords);
    setNewWord({ english: "", korean: "", definition: "", synonyms: "" });
    toast.success("단어가 추가되었습니다.");
  };

  const handleEditWord = (word: VocaWord) => {
    setEditingId(word.id);
    setEditForm({
      english: word.english,
      korean: word.korean,
      definition: word.definition || "",
      synonyms: word.synonyms,
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.english.trim() || !editForm.korean.trim()) {
      toast.error("영어 단어와 한글 뜻을 입력해주세요.");
      return;
    }

    const updatedWords = words.map((word) =>
      word.id === editingId
        ? {
            ...word,
            english: editForm.english.trim(),
            korean: editForm.korean.trim(),
            definition: editForm.definition?.trim(),
            synonyms: editForm.synonyms.trim(),
          }
        : word
    );

    setWords(updatedWords);
    await saveVocaWords(updatedWords);
    setEditingId(null);
    toast.success("단어가 수정되었습니다.");
  };

  const handleDeleteWord = async (id: string) => {
    const updatedWords = words.filter((word) => word.id !== id);
    setWords(updatedWords);
    await saveVocaWords(updatedWords);
    toast.success("단어가 삭제되었습니다.");
  };

  const handleBulkImport = async () => {
    if (!bulkText.trim()) {
      toast.error("단어 데이터를 입력해주세요.");
      return;
    }

    const lines = bulkText.trim().split('\n');
    const newWords: VocaWord[] = [];
    let errorCount = 0;

    lines.forEach((line, index) => {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length < 2) {
        errorCount++;
        return;
      }

      const [english, korean, definition = "", synonyms = ""] = parts;
      if (english && korean) {
        newWords.push({
          id: `${Date.now()}-${index}`,
          exam: effectiveExam,
          day: selectedDay,
          english: english.trim(),
          korean: korean.trim(),
          definition: definition.trim(),
          synonyms: synonyms.trim(),
          ...(vocaMode === 'korean' && selectedTextbook ? { textbook: selectedTextbook } : {}),
          ...(vocaMode === 'korean' ? { grade: selectedGrade, semester: selectedSemester } : {}),
        });
      } else {
        errorCount++;
      }
    });

    if (newWords.length === 0) {
      toast.error("추가할 수 있는 단어가 없습니다.");
      return;
    }

    const updatedWords = [...words, ...newWords];
    setWords(updatedWords);
    await saveVocaWords(updatedWords);
    setBulkText("");
    setShowBulkModal(false);
    
    toast.success(`${newWords.length}개의 단어가 추가되었습니다.${errorCount > 0 ? ` (${errorCount}개 오류)` : ''}`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isKorean = vocaMode === 'korean';
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const newWords: VocaWord[] = [];
      let errorCount = 0;
      let mappedTextbooks = new Map<string, string>();

      // Skip header row
      lines.slice(1).forEach((line, index) => {
        if (!line.trim()) return;
        
        const parts = line.split(/[,\t]/).map(p => p.trim().replace(/"/g, ''));
        if (parts.length < 2) {
          errorCount++;
          return;
        }

        const [english, korean, definition = "", synonyms = "", textbookCol = ""] = parts;
        if (english && korean) {
          // 한국학교 모드: CSV에 교과서 열이 있으면 자동 매핑, 없으면 선택된 교과서 사용
          let textbookId = "";
          if (isKorean) {
            if (textbookCol.trim()) {
              textbookId = autoMapTextbookId(selectedExam, textbookCol);
              mappedTextbooks.set(textbookCol.trim(), textbookId);
            } else if (selectedTextbook) {
              textbookId = selectedTextbook;
            }
          }

          newWords.push({
            id: `${Date.now()}-${index}`,
            exam: textbookId ? `${selectedExam}::${textbookId}` : effectiveExam,
            day: selectedDay,
            english: english.trim(),
            korean: korean.trim(),
            definition: definition.trim(),
            synonyms: synonyms.trim(),
            ...(textbookId ? { textbook: textbookId } : {}),
            ...(vocaMode === 'korean' ? { grade: selectedGrade, semester: selectedSemester } : {}),
          });
        } else {
          errorCount++;
        }
      });

      if (newWords.length === 0) {
        toast.error("추가할 수 있는 단어가 없습니다.");
        return;
      }

      const updatedWords = [...words, ...newWords];
      setWords(updatedWords);
      saveVocaWords(updatedWords);
      setShowBulkModal(false);
      
      let message = `${newWords.length}개의 단어가 추가되었습니다.`;
      if (errorCount > 0) message += ` (${errorCount}개 오류)`;
      if (mappedTextbooks.size > 0) {
        const mappingInfo = Array.from(mappedTextbooks.entries()).map(([input, id]) => `${input}→${id}`).join(', ');
        message += `\n교과서 자동 매핑: ${mappingInfo}`;
      }
      toast.success(message);
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const isKorean = vocaMode === 'korean';
    const template = isKorean
      ? `영어,한글,영영풀이,유의어,교과서\nabandon,버리다,,desert; leave,천재교육\nabundant,풍부한,,plentiful; ample,YBM\nachieve,성취하다,,accomplish; attain,동아출판`
      : `영어,한글,영영풀이,유의어\nabandon,버리다,desert; leave\nabundant,풍부한,plentiful; ample\nachieve,성취하다,accomplish; attain`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `단어_업로드_양식_${selectedExam}_DAY${selectedDay}.csv`;
    link.click();
    toast.success("양식 파일이 다운로드되었습니다.");
  };

  const handleExportWords = () => {
    if (filteredWords.length === 0) {
      toast.error("내보낼 단어가 없습니다.");
      return;
    }

    const isKorean = vocaMode === 'korean';
    const csvContent = isKorean
      ? [
          '영어,한글,영영풀이,유의어,교과서',
          ...filteredWords.map(word => {
            const tbName = currentTextbooks.find(t => t.id === word.textbook)?.name || word.textbook || '';
            return `${word.english},${word.korean},${word.definition || ''},${word.synonyms},${tbName}`;
          })
        ].join('\n')
      : [
          '영어,한글,영영풀이,유의어',
          ...filteredWords.map(word => `${word.english},${word.korean},${word.definition || ''},${word.synonyms}`)
        ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `단어목록_${selectedExam}_DAY${selectedDay}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success(`${filteredWords.length}개 단어가 내보내졌습니다.`);
  };

  const handleGenerateSampleWords = async () => {
    const confirm = window.confirm('7,800개의 샘플 단어를 생성하시겠습니까?\n\n포함 내용:\n• TOEFL, SAT, IELTS, ACT, TOEIC (5개 시험)\n• 각 시험별 DAY 1-30 (30일)\n• 각 Day별 50개 단어\n• 초등영어 1~6학년 (12학기 × 25단어 = 300단어)\n\n이 작업은 몇 초 소요될 수 있습니다.');
    
    if (!confirm) return;

    setLoading(true);
    toast.loading('샘플 단어 생성 중...', { id: 'generate-sample' });

    try {
      const result = await uploadSampleWordsToSupabase();
      
      if (result.success) {
        await loadWords(); // 다시 로드
        toast.success(`✅ ${result.wordCount}개의 샘플 단어가 Supabase에 저장되었습니다!`, { id: 'generate-sample' });
      } else {
        toast.error(`❌ 샘플 단어 생성 실패: ${result.error}`, { id: 'generate-sample' });
      }
    } catch (error) {
      toast.error(`❌ 오류 발생: ${String(error)}`, { id: 'generate-sample' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllSampleWords = async () => {
    if (window.confirm('생성된 샘플 단어를 모두 삭제하시겠습니까?')) {
      // ID 패턴으로 샘플 단어 식별
      const allExamIds = [...certExams, ...koreanExams.map(e => e.id)];
      const filteredWords = words.filter(word => {
        // 샘플 단어 ID 패턴: EXAM-DAY-INDEX-TIMESTAMP 또는 KR-NAME-DAY-INDEX-TIMESTAMP
        const isSample = allExamIds.some(examId => word.id.startsWith(`${examId}-`));
        return !isSample;
      });
      
      const deletedCount = words.length - filteredWords.length;
      setWords(filteredWords);
      await saveVocaWords(filteredWords);
      toast.success(`${deletedCount}개의 샘플 단어가 삭제되었습니다.`);
    }
  };

  const handleMigrateToSupabase = async () => {
    const confirm = window.confirm('localStorage의 단어 데이터를 Supabase로 마이그레이션하시겠습니까?\n\n이 작업은 기존 데이터를 덮어씁니다.');
    
    if (!confirm) return;

    setLoading(true);
    toast.loading('마이그레이션 중...', { id: 'migrate' });

    try {
      const result = await migrateLocalStorageToSupabase();
      
      if (result.success) {
        await loadWords(); // 다시 로드
        toast.success(`✅ ${result.wordCount}개의 단어가 Supabase로 마이그레이션되었습니다!`, { id: 'migrate' });
      } else {
        toast.error(`❌ 마이그레이션 실패: ${result.error}`, { id: 'migrate' });
      }
    } catch (error) {
      toast.error(`❌ 오류 발생: ${String(error)}`, { id: 'migrate' });
    } finally {
      setLoading(false);
    }
  };

  const handleShowStats = () => {
    const stats = getDataStats(words);
    
    let message = `📊 단어 통계\n\n총 단어: ${stats.totalWords}개\n\n시험별 단어 수:\n`;
    
    Object.entries(stats.byExam).forEach(([exam, count]) => {
      message += `• ${exam}: ${count}개\n`;
    });

    alert(message);
  };

  return (
    <div className="p-3 sm:p-6 space-y-3 sm:space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">단어 관리</h1>
        </div>
      </div>

      {/* 액션 버튼들 - 모바일: 2열 그리드 */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        <Button
          onClick={() => setShowBulkModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm h-9 sm:h-10"
        >
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          일괄 입력/업로드
        </Button>
        <Button
          onClick={handleGenerateSampleWords}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm h-9 sm:h-10"
          disabled={loading}
        >
          <CloudUpload className="w-3.5 h-3.5 mr-1.5" />
          샘플 생성 (7,500개)
        </Button>
        <Button
          onClick={handleMigrateToSupabase}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-9 sm:h-10"
          disabled={loading}
        >
          <Cloud className="w-3.5 h-3.5 mr-1.5" />
          <span className="hidden sm:inline">localStorage → </span>Supabase
        </Button>
        <Button
          onClick={handleShowStats}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm h-9 sm:h-10"
        >
          📊 통계 보기
        </Button>
        <Button
          onClick={handleDeleteAllSampleWords}
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50 text-xs sm:text-sm h-9 sm:h-10 col-span-2 sm:col-span-1"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          샘플 삭제
        </Button>
      </div>

      {/* 모드 선택: 인증시험 / 한국학교 */}
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-medium text-gray-700">단어장 모드:</span>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden flex-1 sm:flex-none">
            <button
              onClick={() => { setVocaMode('certification'); setSelectedExam('TOEFL'); setSelectedDay(1); }}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${vocaMode === 'certification' ? 'bg-cyan-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              인증시험
            </button>
            <button
              onClick={() => { setVocaMode('korean'); setSelectedExam('KR-초등영어'); setSelectedDay(1); }}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${vocaMode === 'korean' ? 'bg-cyan-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              한국학교 Voca
            </button>
          </div>
          {vocaMode === 'korean' && (
            <span className="text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded">한국학교 탭에서 독립 운영</span>
          )}
        </div>
      </div>

      {/* 시험 및 Day 선택 */}
      <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              {vocaMode === 'certification' ? '시험 선택' : '교재 선택'}
            </label>
            <select
              value={selectedExam}
              onChange={(e) => { setSelectedExam(e.target.value as any); setSelectedTextbook(""); }}
              className="w-full border border-gray-300 rounded-lg px-2 sm:px-4 py-2 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none"
            >
              {exams.map((exam) => (
                <option key={exam} value={exam}>
                  {getExamLabel(exam)}
                </option>
              ))}
            </select>
          </div>
          {/* 내신영단어 전용: 학교급 선택 */}
          {isNaeshinMode && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                학교급
              </label>
              <select
                value={naeshinSchoolLevel}
                onChange={(e) => setNaeshinSchoolLevel(e.target.value as '초등' | '중등' | '고등')}
                className="w-full border border-cyan-400 rounded-lg px-2 sm:px-4 py-2 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none font-semibold text-cyan-700 bg-cyan-50"
              >
                <option value="초등">초등</option>
                <option value="중등">중등</option>
                <option value="고등">고등</option>
              </select>
            </div>
          )}
          {/* 학년-학기 선택 */}
          {isGradeSemesterMode && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                학년-학기
              </label>
              <select
                value={`${selectedGrade}-${selectedSemester}`}
                onChange={(e) => {
                  const [g, s] = e.target.value.split('-').map(Number);
                  setSelectedGrade(g);
                  setSelectedSemester(s);
                }}
                className="w-full border border-gray-300 rounded-lg px-2 sm:px-4 py-2 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none font-semibold"
              >
                {gradeSemesterOptions.map((opt) => (
                  <option key={opt.label} value={opt.label}>
                    {opt.label} ({opt.fullLabel})
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* DAY 선택 */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              DAY 선택
            </label>
            <div className="flex gap-1.5">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                className="flex-1 border border-gray-300 rounded-lg px-2 sm:px-4 py-2 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none min-w-0"
              >
                {visibleDays.map((day) => {
                  const isCustomDay = day > 30;
                  const isHidden = currentHiddenDays.includes(day);
                  const wordCountInDay = words.filter(w => {
                    if (w.exam !== effectiveExam || w.day !== day) return false;
                    if (isGradeSemesterMode) return w.grade === selectedGrade && w.semester === selectedSemester;
                    return true;
                  }).length;
                  return (
                    <option 
                      key={day} 
                      value={day}
                      style={isCustomDay ? { color: '#ef4444', fontWeight: 'bold' } : isHidden ? { color: '#9ca3af', fontStyle: 'italic' } : {}}
                    >
                      {getDayName(effectiveExam, day)} ({wordCountInDay}단어){isCustomDay ? ' (추가됨)' : ''}{isHidden ? ' (숨김)' : ''}
                    </option>
                  );
                })}
              </select>
              <Button
                onClick={() => {
                  setEditingDayName(selectedDay);
                  setDayNameInput(getDayName(effectiveExam, selectedDay));
                }}
                variant="outline"
                size="sm"
                className="px-2 sm:px-3 h-9"
                title="Day 이름 변경"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                onClick={() => setShowAddDayModal(true)}
                variant="outline"
                size="sm"
                className="px-2 sm:px-3 h-9 border-red-300 text-red-600 hover:bg-red-50"
                title="새 Day 추가"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              검색
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="단어 검색..."
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* 한국학교 모드: 교과서 필터 */}
        {vocaMode === 'korean' && currentTextbooks.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-3.5 h-3.5 text-cyan-600" />
              <label className="text-xs sm:text-sm font-medium text-gray-700">교과서 필터</label>
              {selectedTextbook && (
                <button
                  onClick={() => setSelectedTextbook("")}
                  className="text-xs text-gray-500 hover:text-red-500 ml-1"
                >
                  (전체 보기)
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedTextbook("")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                  selectedTextbook === ""
                    ? "bg-cyan-600 text-white border-cyan-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-cyan-400"
                }`}
              >
                전체
              </button>
              {currentTextbooks.map((tb) => (
                <button
                  key={tb.id}
                  onClick={() => setSelectedTextbook(tb.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                    selectedTextbook === tb.id
                      ? "bg-cyan-600 text-white border-cyan-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-cyan-400"
                  }`}
                >
                  {tb.name}{tb.author ? ` (${tb.author})` : ''}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DAY 관리 액션 바 */}
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-medium text-gray-700">DAY 관리:</span>
            <span className="text-xs sm:text-sm text-gray-500">
              {currentDayLabel}
              {isDayHidden && (
                <span className="ml-1 text-xs text-amber-600 font-medium">(숨김)</span>
              )}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {filteredWords.length}개 단어
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              onClick={() => setShowDeleteDayConfirm(true)}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-50 text-xs h-8"
              disabled={filteredWords.length === 0}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              전체 단어 삭제
            </Button>
            <Button
              onClick={() => handleToggleDayHidden(selectedDay)}
              variant="outline"
              size="sm"
              className={`text-xs h-8 ${isDayHidden
                ? "border-green-300 text-green-600 hover:bg-green-50"
                : "border-amber-300 text-amber-600 hover:bg-amber-50"
              }`}
            >
              {isDayHidden ? (
                <><Eye className="w-3 h-3 mr-1" />숨김 해제</>
              ) : (
                <><EyeOff className="w-3 h-3 mr-1" />DAY 생략</>
              )}
            </Button>
            {currentHiddenDays.length > 0 && (
              <Button
                onClick={() => setShowHiddenDays(!showHiddenDays)}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-600 hover:bg-gray-50 text-xs h-8"
              >
                {showHiddenDays ? (
                  <><Eye className="w-3 h-3 mr-1" />숨긴 DAY 포함</>
                ) : (
                  <><EyeOff className="w-3 h-3 mr-1" />숨긴 DAY ({currentHiddenDays.length}개)</>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* 숨긴 DAY 목록 표시 */}
        {currentHiddenDays.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <EyeOff className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">숨긴 DAY 목록:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentHiddenDays.sort((a, b) => a - b).map(day => {
                const gsOpt = isGradeSemesterMode
                  ? gradeSemesterOptions[day - 1]
                  : null;
                const label = gsOpt ? gsOpt.label : getDayName(effectiveExam, day);
                return (
                  <button
                    key={day}
                    onClick={() => handleRestoreDay(day)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-700 border border-gray-200 hover:border-green-300 transition-colors group"
                    title="클릭하여 숨김 해제"
                  >
                    <span>{label}</span>
                    <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <X className="w-3 h-3 opacity-100 group-hover:opacity-0 transition-opacity -ml-3" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* DAY 전체 삭제 확인 모달 */}
      <AnimatePresence>
        {showDeleteDayConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteDayConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">DAY 전체 단어 삭제</h3>
                    <p className="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다.</p>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-800">
                    <strong>{getExamLabel(selectedExam)}</strong>의 <strong>{currentDayLabel}</strong>에 등록된 <strong className="text-red-600">{filteredWords.length}개</strong>의 단어를 모두 삭제하시겠습니까?
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3 rounded-b-lg">
                <Button
                  onClick={handleDeleteAllDayWords}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  전체 삭제
                </Button>
                <Button
                  onClick={() => setShowDeleteDayConfirm(false)}
                  variant="outline"
                  className="px-6"
                >
                  취소
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 새 단어 추가 */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-3 sm:p-6 border-2 border-cyan-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800">
            새 단어 추가
            <span className="ml-1.5 text-xs font-normal text-gray-500">
              ({isNaeshinMode ? `내신영단어-${naeshinSchoolLevel}` : effectiveExam} · {isGradeSemesterMode ? `${selectedGrade}학년 ${selectedSemester}학기 / ` : ''}{getDayName(effectiveExam, selectedDay)})
            </span>
            {vocaMode === 'korean' && selectedTextbook && (
              <span className="ml-1.5 text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                {currentTextbooks.find(t => t.id === selectedTextbook)?.name || selectedTextbook}
              </span>
            )}
          </h2>
          {selectedDay > 30 && (
            <Button
              onClick={() => {
                setEditingDayName(selectedDay);
                setDayNameInput(getDayName(effectiveExam, selectedDay));
              }}
              variant="outline"
              size="sm"
              className="px-2 h-7 text-xs"
            >
              <Edit2 className="w-3 h-3 mr-1" />
              이름 변경
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mb-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">영어 단어 *</label>
            <Input
              value={newWord.english}
              onChange={(e) => setNewWord({ ...newWord, english: e.target.value })}
              placeholder="예: abandon"
              className="text-sm h-9"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">한글 뜻 *</label>
            <Input
              value={newWord.korean}
              onChange={(e) => setNewWord({ ...newWord, korean: e.target.value })}
              placeholder="예: 버리다, 포기하다"
              className="text-sm h-9"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-gray-600 mb-1">영영풀이 (선택)</label>
            <Input
              value={newWord.definition}
              onChange={(e) => setNewWord({ ...newWord, definition: e.target.value })}
              placeholder="예: desert, leave"
              className="text-sm h-9"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-gray-600 mb-1">유의어 (선택)</label>
            <Input
              value={newWord.synonyms}
              onChange={(e) => setNewWord({ ...newWord, synonyms: e.target.value })}
              placeholder="예: desert, leave"
              className="text-sm h-9"
            />
          </div>
        </div>
        <Button
          onClick={handleAddWord}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-9 text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          단어 추가
        </Button>
      </div>

      {/* 단어 목록 */}
      <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800">
            등록된 단어 ({filteredWords.length}개)
          </h2>
          {filteredWords.length > 0 && (
            <Button
              onClick={handleExportWords}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              CSV 내보내기
            </Button>
          )}
        </div>

        {filteredWords.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">등록된 단어가 없습니다.</p>
            <p className="text-sm">위에서 단어를 추가해주세요.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            <AnimatePresence>
              {filteredWords.map((word, index) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {editingId === word.id ? (
                    // 편집 모드
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            영어 단어
                          </label>
                          <Input
                            value={editForm.english}
                            onChange={(e) =>
                              setEditForm({ ...editForm, english: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            한글 뜻
                          </label>
                          <Input
                            value={editForm.korean}
                            onChange={(e) =>
                              setEditForm({ ...editForm, korean: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            영영풀이
                          </label>
                          <Input
                            value={editForm.definition}
                            onChange={(e) =>
                              setEditForm({ ...editForm, definition: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            유의어
                          </label>
                          <Input
                            value={editForm.synonyms}
                            onChange={(e) =>
                              setEditForm({ ...editForm, synonyms: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveEdit}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          저장
                        </Button>
                        <Button
                          onClick={() => setEditingId(null)}
                          size="sm"
                          variant="outline"
                        >
                          <X className="w-4 h-4 mr-1" />
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // 보기 모드
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-500 w-8">
                        {index + 1}
                      </span>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">영어</div>
                          <div className="font-medium text-gray-800">
                            {word.english}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">한글</div>
                          <div className="text-gray-700">{word.korean}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">영영풀이</div>
                          <div className="text-gray-600 text-sm">
                            {word.definition || "-"}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">유의어</div>
                            <div className="text-gray-600 text-sm">
                              {word.synonyms || "-"}
                            </div>
                          </div>
                          {word.textbook && (
                            <span className="text-[10px] bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {currentTextbooks.find(t => t.id === word.textbook)?.name || word.textbook}
                            </span>
                          )}
                          {isGradeSemesterMode && word.grade && word.semester && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {word.grade}-{word.semester}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditWord(word)}
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteWord(word.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 일괄 입력/업로드 모달 */}
      <AnimatePresence>
        {showBulkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBulkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
            >
              {/* 헤더 */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">단어 일괄 입력/업로드</h2>
                    <p className="text-sm text-white/90 mt-1">
                      {selectedExam} - DAY {selectedDay}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBulkModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 컨텐츠 */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* 탭 */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setUploadMode("manual")}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                      uploadMode === "manual"
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <FileText className="w-5 h-5 inline-block mr-2" />
                    직접 입력
                  </button>
                  <button
                    onClick={() => setUploadMode("csv")}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                      uploadMode === "csv"
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <FileSpreadsheet className="w-5 h-5 inline-block mr-2" />
                    CSV/엑셀 업로드
                  </button>
                </div>

                {uploadMode === "manual" ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">입력 형식</h3>
                      <p className="text-sm text-blue-700 mb-2">
                        각 줄에 하나씩 입력하세요. 탭(Tab)으로 구분합니다.
                      </p>
                      <div className="bg-white p-3 rounded border border-blue-200">
                        <code className="text-sm text-gray-700">
                          영어단어 [TAB] 한글뜻 [TAB] 영영풀이(선택) [TAB] 유의어(선택)
                        </code>
                        <div className="text-xs text-gray-500 mt-2">
                          예시:<br />
                          <span className="text-teal-600">abandon	버리다	desert, leave</span><br />
                          <span className="text-teal-600">abundant	풍부한	plentiful, ample</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        단어 데이터 입력
                      </label>
                      <Textarea
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder="abandon	버리다	desert, leave
abundant	풍부한	plentiful, ample
achieve	성취하다	accomplish, attain"
                        className="h-64 font-mono text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">CSV/엑셀 업로드</h3>
                      <p className="text-sm text-purple-700 mb-3">
                        표준 양식을 다운로드하여 작성한 후 업로드하세요.
                      </p>
                      <Button
                        onClick={handleDownloadTemplate}
                        variant="outline"
                        className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        표준 양식 다운로드 (.csv)
                      </Button>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 transition-colors">
                      <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-4">
                        CSV 파일을 선택하거나 드래그하여 업로드하세요
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          파일 선택
                        </Button>
                      </label>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">파일 형식 안내</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 첫 번째 줄은 헤더(영어, 한글, 영영풀이, 유의어{vocaMode === 'korean' ? ', 교과서' : ''})로 작성</li>
                        <li>• 각 열은 쉼표(,) 또는 탭(Tab)으로 구분</li>
                        <li>• UTF-8 인코딩 권장</li>
                        <li>• 최대 1,000개 단어까지 한 번에 업로드 가능</li>
                        {vocaMode === 'korean' && (
                          <li className="text-cyan-700 font-medium">
                             교과서 열에 출판사명(천재교육, YBM, 동아출판 등) 또는 저자명을 입력하면 자동 매핑됩니다
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* 푸터 */}
              {uploadMode === "manual" && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="flex gap-3">
                    <Button
                      onClick={handleBulkImport}
                      className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-3"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      일괄 등록하기
                    </Button>
                    <Button
                      onClick={() => {
                        setShowBulkModal(false);
                        setBulkText("");
                      }}
                      variant="outline"
                      className="px-6"
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 새 Day 추가 모달 */}
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
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800">새 Day 추가</h2>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedExam}에 Day {maxDay + 1}을(를) 추가하시겠습니까?
                </p>
              </div>

              {/* 내용 */}
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    • 현재 교재: <span className="font-semibold">{selectedExam}</span>
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    • 추가될 Day: <span className="font-semibold">Day {maxDay + 1}</span>
                  </p>
                  <p className="text-sm text-blue-800 mt-2">
                    Day가 추가되면 해당 Day에 단어를 등록할 수 있습니다.
                  </p>
                </div>
              </div>

              {/* 푸터 */}
              <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
                <Button
                  onClick={handleAddNewDay}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Day 추가
                </Button>
                <Button
                  onClick={() => setShowAddDayModal(false)}
                  variant="outline"
                  className="px-6"
                >
                  취소
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day 이름 변경 모달 */}
      <AnimatePresence>
        {editingDayName !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setEditingDayName(null);
              setDayNameInput("");
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800">Day 이름 변경</h2>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedExam} - Day {editingDayName}의 이름을 변경합니다.
                </p>
              </div>

              {/* 내용 */}
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새 이름 *
                  </label>
                  <Input
                    value={dayNameInput}
                    onChange={(e) => setDayNameInput(e.target.value)}
                    placeholder="예: 핵심 어휘 1, 고난도 단어 등"
                    className="w-full"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveDayName();
                      }
                    }}
                    autoFocus
                  />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs text-amber-800">
                    💡 <strong>팁:</strong> Day 1-30은 기본 단어장이며, Day 31 이상은 사용자 정의 학습 세트입니다.
                  </p>
                  <p className="text-xs text-amber-800 mt-2">
                    예시: "핵심 어휘", "오답노트", "추가 학습" 등
                  </p>
                </div>
              </div>

              {/* 푸터 */}
              <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
                <Button
                  onClick={handleSaveDayName}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </Button>
                <Button
                  onClick={() => {
                    setEditingDayName(null);
                    setDayNameInput("");
                  }}
                  variant="outline"
                  className="px-6"
                >
                  취소
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}