import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner@2.0.3";
import { FileText, BookOpen, GraduationCap, Globe, Award, BookOpenCheck, Library, Search, Trash2, X, ChevronLeft, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getVocaWords, VocaWord, getMaxDay, getDayNames } from "./VocaManagement";
import { Input } from "./ui/input";
import { WordTest } from "./WordTest";
import { FlashCard } from "./FlashCard";
import { VocabStudy } from "./VocabStudy";
import { downloadHackersVocaPDF, downloadHackersVocaWord } from "../utils/downloadHelpers";

interface DaySelection {
  [key: number]: boolean;
}

export function VocaPage() {
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [daySelections, setDaySelections] = useState<DaySelection>({});
  const [selectAll, setSelectAll] = useState(false);
  
  // 출제 문제수 - 표제어와 동의어 분리
  const [engToKorHeadwordCount, setEngToKorHeadwordCount] = useState(0);
  const [engToKorSynonymCount, setEngToKorSynonymCount] = useState(0);
  const [korToEngHeadwordCount, setKorToEngHeadwordCount] = useState(0);
  const [korToEngSynonymCount, setKorToEngSynonymCount] = useState(0);
  
  // SAT 전용: 영영 풀이 → 영어 쓰기
  const [defToEngHeadwordCount, setDefToEngHeadwordCount] = useState(0);
  const [defToEngSynonymCount, setDefToEngSynonymCount] = useState(0);

  const [allWords, setAllWords] = useState<VocaWord[]>([]);
  const [dayNames, setDayNames] = useState<any>({});
  
  // 모달 상태
  const [showStep1Modal, setShowStep1Modal] = useState(false);
  const [showStep2Modal, setShowStep2Modal] = useState(false);
  const [wordSelections, setWordSelections] = useState<{[key: string]: boolean}>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"engToKor" | "korToEng" | "defToEng">("engToKor");
  
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

  const exams = ["TOEFL", "SAT", "IELTS", "ACT", "TOEIC"];
  
  // 동적으로 Day 계산 (DAY 30 이후도 포함)
  const maxDay = selectedExam ? getMaxDay(allWords, selectedExam) : 30;
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  useEffect(() => {
    loadWords();
    loadDayNames();
    
    // 단어 업데이트 이벤트 리스너
    const handleUpdate = () => {
      loadWords();
      loadDayNames();
    };
    window.addEventListener('vocaWordsUpdated', handleUpdate);
    window.addEventListener('vocaDayNamesUpdated', handleUpdate);
    return () => {
      window.removeEventListener('vocaWordsUpdated', handleUpdate);
      window.removeEventListener('vocaDayNamesUpdated', handleUpdate);
    };
  }, []);

  const loadWords = async () => {
    try {
      const words = await getVocaWords();
      setAllWords(words);
    } catch (error) {
      console.error('Error loading words:', error);
      toast.error('단어 로딩 중 오류 발생');
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
  
  // Day 이름 가져오기
  const getDayName = (exam: string, day: number): string => {
    return dayNames[exam]?.[day] || `Day ${day}`;
  };

  const handleExamChange = (exam: string) => {
    setSelectedExam(exam);
    setDaySelections({});
    setSelectAll(false);
    setEngToKorHeadwordCount(0);
    setEngToKorSynonymCount(0);
    setKorToEngHeadwordCount(0);
    setKorToEngSynonymCount(0);
    setDefToEngHeadwordCount(0);
    setDefToEngSynonymCount(0);
  };

  const handleDayToggle = (day: number) => {
    setDaySelections((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleSelectAllToggle = () => {
    if (selectAll) {
      setDaySelections({});
    } else {
      const allSelected: DaySelection = {};
      days.forEach((day) => {
        allSelected[day] = true;
      });
      setDaySelections(allSelected);
    }
    setSelectAll(!selectAll);
  };

  const getSelectedDays = () => {
    return Object.keys(daySelections)
      .filter((day) => daySelections[parseInt(day)])
      .map((day) => parseInt(day));
  };

  const getTotalQuestions = () => {
    return engToKorHeadwordCount + engToKorSynonymCount + korToEngHeadwordCount + korToEngSynonymCount + defToEngHeadwordCount + defToEngSynonymCount;
  };

  const getAvailableWords = () => {
    const selectedDays = getSelectedDays();
    return allWords.filter(
      (word) => word.exam === selectedExam && selectedDays.includes(word.day)
    );
  };

  // 표제어와 동의어 개수 계산
  const getHeadwordCount = () => {
    return getAvailableWords().length;
  };

  const getSynonymCount = () => {
    return getAvailableWords().reduce((total, word) => {
      if (word.synonyms && word.synonyms.trim()) {
        const synonyms = word.synonyms.split(',').map(s => s.trim()).filter(s => s);
        return total + synonyms.length;
      }
      return total;
    }, 0);
  };

  const handleCreateTest = () => {
    if (!selectedExam) {
      toast.error("교재를 선택해주세요.");
      return;
    }

    const selectedDays = getSelectedDays();
    if (selectedDays.length === 0) {
      toast.error("출제범위를 선택해주세요.");
      return;
    }

    const totalQuestions = getTotalQuestions();
    if (totalQuestions === 0) {
      toast.error("출제 문제수를 설정해주세요.");
      return;
    }

    const availableWords = getAvailableWords();
    if (availableWords.length === 0) {
      toast.error("선택한 범위에 등록된 단어가 없습니다. LMS에서 단어를 먼저 등록해주세요.");
      return;
    }

    const maxPossible = getHeadwordCount() + getSynonymCount();
    if (totalQuestions > maxPossible) {
      toast.error(`출제 문제수가 사용 가능한 문제(${maxPossible}개)보다 많습니다.`);
      return;
    }

    // Step 1 모달 열기
    const initialSelections: {[key: string]: boolean} = {};
    availableWords.slice(0, Math.min(totalQuestions, availableWords.length)).forEach(word => {
      initialSelections[word.id] = true;
    });
    setWordSelections(initialSelections);
    setShowStep1Modal(true);
  };

  const getSelectedWordsCount = () => {
    return Object.values(wordSelections).filter(Boolean).length;
  };

  const handleProceedToStep2 = () => {
    const selectedCount = getSelectedWordsCount();
    if (selectedCount === 0) {
      toast.error("최소 1개 이상의 단어를 선택해주세요.");
      return;
    }
    setShowStep1Modal(false);
    setShowStep2Modal(true);
  };

  // 선택된 Day 범위 텍스트
  const getSelectedDayRange = (): string => {
    const selectedDayNums = Object.keys(daySelections).filter(k => daySelections[Number(k)]).map(Number).sort((a, b) => a - b);
    if (selectedDayNums.length === 0) return '전체';
    if (selectedDayNums.length === 1) return `Day ${selectedDayNums[0]}`;
    return `Day ${selectedDayNums[0]}~${selectedDayNums[selectedDayNums.length - 1]}`;
  };

  // 다운로드 함수들
  const handleDownloadPDF = () => {
    const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
    if (selectedWords.length === 0) {
      toast.error("다운로드할 단어를 선택해주세요.");
      return;
    }
    downloadHackersVocaPDF(selectedWords, selectedExam, getSelectedDayRange());
    toast.success("PDF 인쇄 창이 열렸습니다! 'PDF로 저장'을 선택하세요.");
  };

  const handleDownloadWord = () => {
    const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
    if (selectedWords.length === 0) {
      toast.error("다운로드할 단어를 선택해주세요.");
      return;
    }
    downloadHackersVocaWord(selectedWords, selectedExam, getSelectedDayRange());
    toast.success("워드 파일로 다운로드되었습니다!");
  };



  // 테스트 관련 핸들러 함수들
  const handleStartTest = (type: 'multiple' | 'subjective' | 'mixed') => {
    const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
    
    if (selectedWords.length === 0) {
      toast.error("출제할 단어를 선택해주세요.");
      return;
    }
    
    console.log('Starting test with:', selectedWords.length, 'words');
    setTestType(type);
    setShowTestMode(true);
    setShowStep2Modal(false);
    setCurrentWordIndex(0);
    setTestAnswers({});
    setShowTestResult({});
    setSubjectiveAnswer('');
    setIncorrectQuestions([]);
  };

  const handleNextWord = () => {
    setCurrentWordIndex(prev => prev + 1);
    setSubjectiveAnswer('');
  };

  const generateTestOptions = (correctAnswer: string, allWords: any[], seed: number) => {
    // correctAnswer는 한국어 뜻 (definition)
    // allWords는 {word: english, definition: korean, context: synonyms} 배열
    const currentWord = allWords.find((w: any) => w.definition === correctAnswer);
    
    if (!currentWord) {
      console.error('Current word not found for:', correctAnswer);
      return [];
    }
    
    // Seeded random function for consistent ordering per question
    const seededRandom = (index: number) => {
      const x = Math.sin(seed * 9999 + index * 1234) * 10000;
      return x - Math.floor(x);
    };
    
    // 오답 보기 3개 생성 (다른 단어들의 영어)
    const incorrectOptions = allWords
      .filter((w: any) => w.word !== currentWord?.word)
      .map((w: any, idx: number) => ({ word: w.word, sortKey: seededRandom(idx) }))
      .sort((a: any, b: any) => a.sortKey - b.sortKey)
      .slice(0, 3)
      .map((item: any) => item.word);
    
    // 정답 + 오답 3개 = 총 4개 선택지
    const allOptions = [currentWord?.word, ...incorrectOptions];
    
    // 4개 선택지를 무작위로 섞기
    const sortedOptions = allOptions
      .map((opt, idx) => ({ word: opt, sortKey: seededRandom(idx + 100) }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(item => item.word);
    
    return sortedOptions;
  };

  const handleTestAnswer = (questionIndex: number, answer: string, correctAnswer: string) => {
    setTestAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    setShowTestResult(prev => ({ ...prev, [questionIndex]: true }));
    
    if (answer !== correctAnswer) {
      setIncorrectQuestions(prev => {
        if (!prev.includes(questionIndex)) {
          return [...prev, questionIndex];
        }
        return prev;
      });
    }
    // Sound is handled by WordTest component's showFeedback
  };

  const handleRetryQuestion = (questionIndex: number) => {
    setTestAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionIndex];
      return newAnswers;
    });
    setShowTestResult(prev => {
      const newResults = { ...prev };
      delete newResults[questionIndex];
      return newResults;
    });
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

  const filteredWords = getAvailableWords().filter(word => 
    word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.korean.includes(searchTerm) ||
    word.synonyms.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableWordsCount = getHeadwordCount();
  const availableSynonymsCount = getSynonymCount();
  const maxQuestions = availableWordsCount + availableSynonymsCount;

  // 교재 데이터 - AP 페이지 스타일
  const examData = [
    {
      name: "TOEFL",
      icon: GraduationCap,
      color: "#B3E5FC",
      description: "Test of English as a Foreign Language"
    },
    {
      name: "SAT",
      icon: Award,
      color: "#FFE0B2",
      description: "Scholastic Assessment Test"
    },
    {
      name: "IELTS",
      icon: Globe,
      color: "#D1C4E9",
      description: "International English Language Testing"
    },
    {
      name: "ACT",
      icon: BookOpenCheck,
      color: "#C8E6C9",
      description: "American College Testing"
    },
    {
      name: "TOEIC",
      icon: Library,
      color: "#FFCDD2",
      description: "Test of English for International Communication"
    }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* 교재 선택 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-6">교재 선택</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {examData.map((exam) => {
            const IconComponent = exam.icon;
            const isSelected = selectedExam === exam.name;
            return (
              <motion.button
                key={exam.name}
                onClick={() => handleExamChange(exam.name)}
                className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${
                  isSelected
                    ? "shadow-lg scale-105"
                    : "shadow-md hover:shadow-lg"
                }`}
                style={{ 
                  backgroundColor: isSelected ? exam.color : "#F5F5F5"
                }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div 
                    className={`p-3 rounded-full transition-colors ${
                      isSelected
                        ? "bg-white/80"
                        : "bg-white/60 group-hover:bg-white/80"
                    }`}
                  >
                    <IconComponent 
                      className={`w-8 h-8 ${
                        isSelected
                          ? "text-cyan-600"
                          : "text-gray-600 group-hover:text-cyan-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-1 ${
                      isSelected
                        ? "text-gray-800"
                        : "text-gray-700"
                    }`}>
                      {exam.name}
                    </h3>
                    <p className={`text-xs ${
                      isSelected
                        ? "text-gray-700"
                        : "text-gray-500"
                    }`}>
                      {exam.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* 교재 선택 후 표시되는 영역 */}
      {selectedExam && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 왼쪽: 출제범위 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">출제범위</h3>
                <p className="text-sm text-gray-600">
                  * 출제범위 No.를 입력하세요. (예시: 1, 3-5, 7-8)
                </p>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleSelectAllToggle}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectAll
                      ? "bg-cyan-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  선택
                </button>
                <button
                  onClick={handleSelectAllToggle}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  전체선택
                </button>
              </div>

              {/* DAY 목록 */}
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-2">
                {days.map((day) => {
                  const wordsInDay = allWords.filter(
                    (w) => w.exam === selectedExam && w.day === day
                  ).length;
                  const isCustomDay = day > 30;
                  
                  return (
                    <label
                      key={day}
                      className={`flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer ${
                        isCustomDay ? 'bg-red-50 border border-red-200' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={daySelections[day] || false}
                        onChange={() => handleDayToggle(day)}
                        className={`w-5 h-5 rounded border-gray-300 focus:ring-cyan-500 ${
                          isCustomDay ? 'text-red-600 focus:ring-red-500' : 'text-cyan-600'
                        }`}
                      />
                      <span className={`flex-1 ${isCustomDay ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                        {getDayName(selectedExam, day)}
                        {isCustomDay && <span className="text-xs ml-2">(추가됨)</span>}
                      </span>
                      <span className={`text-sm ${isCustomDay ? 'text-red-500' : 'text-gray-500'}`}>
                        ({wordsInDay}단어)
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 오른쪽: 출제 가능 문제수 & 출제 문제수 */}
            <div className="space-y-6">
              {/* 출제 가능 문제수 */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">
                  출제 가능 문제수 <span className="text-sm text-gray-600">(선택한 출제범위 내)</span>
                </h3>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold text-cyan-600 mb-2">
                    {maxQuestions}+ <span className="text-2xl">문제</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    표제어 <span className="text-teal-600 font-semibold">{availableWordsCount}</span> / 동의어 <span className="text-teal-600 font-semibold">{availableSynonymsCount}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    * 한 번에 최대 400문제 출제 가능
                  </p>
                </div>
              </div>

              {/* 출제 문제수 */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
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
                  <div className="ml-8 mb-3">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm text-gray-600 w-16">└ 표제어</span>
                      <button
                        onClick={() => setEngToKorHeadwordCount(Math.max(0, engToKorHeadwordCount - 1))}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                      >
                        -
                      </button>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max={availableWordsCount}
                          value={engToKorHeadwordCount}
                          onChange={(e) => {
                            const value = Math.min(Math.max(0, parseInt(e.target.value) || 0), availableWordsCount);
                            setEngToKorHeadwordCount(value);
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-24 text-center text-xl font-bold border-2 border-gray-300 rounded-lg py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (getTotalQuestions() < maxQuestions && engToKorHeadwordCount < availableWordsCount) {
                            setEngToKorHeadwordCount(engToKorHeadwordCount + 1);
                          } else {
                            toast.error("출제 가능한 단어 수를 초과했습니다.");
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 동의어 */}
                  <div className="ml-8">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 w-16">└ 동의어</span>
                      <button
                        onClick={() => setEngToKorSynonymCount(Math.max(0, engToKorSynonymCount - 1))}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                      >
                        -
                      </button>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max={availableSynonymsCount}
                          value={engToKorSynonymCount}
                          onChange={(e) => {
                            const value = Math.min(Math.max(0, parseInt(e.target.value) || 0), availableSynonymsCount);
                            setEngToKorSynonymCount(value);
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-24 text-center text-xl font-bold border-2 border-gray-300 rounded-lg py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (getTotalQuestions() < maxQuestions && engToKorSynonymCount < availableSynonymsCount) {
                            setEngToKorSynonymCount(engToKorSynonymCount + 1);
                          } else {
                            toast.error("출제 가능한 동의어 수를 초과했습니다.");
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* 한글 뜻 → 영어 쓰기 */}
                <div className={selectedExam === "SAT" ? "mb-6 pb-6 border-b border-gray-200" : ""}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium text-gray-800">한글 뜻 →</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium">
                      E 영어 쓰기
                    </span>
                  </div>
                  
                  {/* 표제어 */}
                  <div className="ml-8 mb-3">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm text-gray-600 w-16">└ 표제어</span>
                      <button
                        onClick={() => setKorToEngHeadwordCount(Math.max(0, korToEngHeadwordCount - 1))}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                      >
                        -
                      </button>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max={availableWordsCount}
                          value={korToEngHeadwordCount}
                          onChange={(e) => {
                            const value = Math.min(Math.max(0, parseInt(e.target.value) || 0), availableWordsCount);
                            setKorToEngHeadwordCount(value);
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-24 text-center text-xl font-bold border-2 border-gray-300 rounded-lg py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (getTotalQuestions() < maxQuestions && korToEngHeadwordCount < availableWordsCount) {
                            setKorToEngHeadwordCount(korToEngHeadwordCount + 1);
                          } else {
                            toast.error("출제 가능한 단어 수를 초과했습니다.");
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 동의어 */}
                  <div className="ml-8">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 w-16">└ 동의어</span>
                      <button
                        onClick={() => setKorToEngSynonymCount(Math.max(0, korToEngSynonymCount - 1))}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                      >
                        -
                      </button>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max={availableSynonymsCount}
                          value={korToEngSynonymCount}
                          onChange={(e) => {
                            const value = Math.min(Math.max(0, parseInt(e.target.value) || 0), availableSynonymsCount);
                            setKorToEngSynonymCount(value);
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-24 text-center text-xl font-bold border-2 border-gray-300 rounded-lg py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (getTotalQuestions() < maxQuestions && korToEngSynonymCount < availableSynonymsCount) {
                            setKorToEngSynonymCount(korToEngSynonymCount + 1);
                          } else {
                            toast.error("출제 가능한 동의어 수를 초과했습니다.");
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* SAT 전용: 영영 풀이 → 영어 쓰기 */}
                {selectedExam === "SAT" && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-medium text-gray-800">영영 풀이 →</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm font-medium">
                        E 영어 쓰기
                      </span>
                    </div>
                    
                    {/* 표제어 */}
                    <div className="ml-8 mb-3">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm text-gray-600 w-16">└ 표제어</span>
                        <button
                          onClick={() => setDefToEngHeadwordCount(Math.max(0, defToEngHeadwordCount - 1))}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                        >
                          -
                        </button>
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            max={availableWordsCount}
                            value={defToEngHeadwordCount}
                            onChange={(e) => {
                              const value = Math.min(Math.max(0, parseInt(e.target.value) || 0), availableWordsCount);
                              setDefToEngHeadwordCount(value);
                            }}
                            onFocus={(e) => e.target.select()}
                            className="w-24 text-center text-xl font-bold border-2 border-gray-300 rounded-lg py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (getTotalQuestions() < maxQuestions && defToEngHeadwordCount < availableWordsCount) {
                              setDefToEngHeadwordCount(defToEngHeadwordCount + 1);
                            } else {
                              toast.error("출제 가능한 단어 수를 초과했습니다.");
                            }
                          }}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* 동의어 */}
                    <div className="ml-8">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 w-16">└ 동의어</span>
                        <button
                          onClick={() => setDefToEngSynonymCount(Math.max(0, defToEngSynonymCount - 1))}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                        >
                          -
                        </button>
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            max={availableSynonymsCount}
                            value={defToEngSynonymCount}
                            onChange={(e) => {
                              const value = Math.min(Math.max(0, parseInt(e.target.value) || 0), availableSynonymsCount);
                              setDefToEngSynonymCount(value);
                            }}
                            onFocus={(e) => e.target.select()}
                            className="w-24 text-center text-xl font-bold border-2 border-gray-300 rounded-lg py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (getTotalQuestions() < maxQuestions && defToEngSynonymCount < availableSynonymsCount) {
                              setDefToEngSynonymCount(defToEngSynonymCount + 1);
                            } else {
                              toast.error("출제 가능한 동의어 수를 초과했습니다.");
                            }
                          }}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 총 문제수 표시 */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <span className="text-lg text-gray-700">총 </span>
                    <span className="text-3xl font-bold text-cyan-600">
                      {getTotalQuestions()} 문제
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 어휘 시험 출제하기 버튼 */}
          <div className="mt-8">
            <Button
              onClick={handleCreateTest}
              disabled={!selectedExam || getSelectedDays().length === 0 || getTotalQuestions() === 0}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white py-6 text-lg font-semibold rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5 mr-2" />
              어휘 시험 출제하기
            </Button>
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
              {/* 헤더 */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 sm:p-6 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-2xl font-bold leading-tight">단어 시험 출제하기</h2>
                    <p className="text-[11px] sm:text-sm text-white/80 mt-0.5">(단어 시험지 · 답안지 제작)</p>
                  </div>
                  <button
                    onClick={() => setShowStep1Modal(false)}
                    className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              {/* 컨텐츠 */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)] sm:max-h-[calc(90vh-180px)]">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-xl font-semibold text-teal-600 mb-3 sm:mb-4">
                    Step 1. 출제 단어 확인 및 선택
                  </h3>
                  
                  {/* 탭 */}
                  <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-2 mb-4">
                    <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                      <button
                        onClick={() => setActiveTab("engToKor")}
                        className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base font-medium transition-colors ${
                          activeTab === "engToKor"
                            ? "bg-teal-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        영어→한글
                      </button>
                      <button
                        onClick={() => setActiveTab("korToEng")}
                        className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base font-medium transition-colors ${
                          activeTab === "korToEng"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        한글→영어
                      </button>
                      {selectedExam === "SAT" && (
                        <button
                          onClick={() => setActiveTab("defToEng")}
                          className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base font-medium transition-colors ${
                            activeTab === "defToEng"
                              ? "bg-purple-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          영영풀이→영어
                        </button>
                      )}
                    </div>
                    <div className="hidden sm:block flex-1" />
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[11px] sm:text-sm text-gray-600 whitespace-nowrap">영단어 첫 글자 보이기</span>
                      <button className="px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg bg-green-100 text-green-700 font-medium text-[11px] sm:text-sm">ON</button>
                      <button className="px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg bg-gray-200 text-gray-600 text-[11px] sm:text-sm">OFF</button>
                    </div>
                  </div>
                </div>

                {/* 단어 리스트 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* 전체 리스트 */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base">전체 리스트</h4>
                      <button className="text-teal-600 text-sm flex items-center gap-1">
                        <span>정렬 초기화</span>
                      </button>
                    </div>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="단어입력"
                        className="pl-10"
                      />
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredWords.map((word) => (
                        <div
                          key={word.id}
                          className="bg-white p-3 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors"
                        >
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <div className="w-16 sm:w-20 font-medium text-gray-800 flex-shrink-0 truncate">
                              {activeTab === "engToKor" ? word.english : activeTab === "korToEng" ? word.korean : word.definition || word.english}
                            </div>
                            <div className="w-14 sm:w-20 text-gray-600 flex-shrink-0 truncate">
                              {activeTab === "engToKor" ? word.korean : word.english}
                            </div>
                            <div className="flex-1 text-gray-500 text-[10px] sm:text-xs truncate min-w-0">
                              {word.synonyms || "-"}
                            </div>
                            <div className="text-gray-400 text-[10px] sm:text-xs flex-shrink-0 hidden xs:block">
                              표제어
                            </div>
                            <div className="flex-shrink-0">
                              <button
                                onClick={() => {
                                  setWordSelections(prev => ({
                                    ...prev,
                                    [word.id]: true
                                  }));
                                }}
                                className="px-3 py-1 bg-teal-500 text-white rounded text-xs hover:bg-teal-600"
                              >
                                담
                              </button>
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
                      <button className="text-teal-600 text-xs sm:text-sm flex items-center gap-1">
                        <span>정렬 초기화</span>
                      </button>
                    </div>
                    <div className="mb-3 sm:mb-4">
                      <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                        <button className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white rounded-lg text-xs sm:text-sm font-medium border border-gray-200">
                          전체({getSelectedWordsCount()}개)
                        </button>
                        <button className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-teal-500 text-white rounded-lg text-xs sm:text-sm font-medium">
                          한글 뜻 쓰기({engToKorHeadwordCount + engToKorSynonymCount})
                        </button>
                        <button className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-600 rounded-lg text-xs sm:text-sm font-medium">
                          영어 쓰기({korToEngHeadwordCount + korToEngSynonymCount})
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {getAvailableWords().filter(w => wordSelections[w.id]).map((word, index) => (
                        <div
                          key={word.id}
                          className="bg-white p-3 rounded-lg border border-teal-200"
                        >
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <div className="w-16 sm:w-20 font-medium text-gray-800 flex-shrink-0 truncate">
                              {activeTab === "engToKor" ? word.english : word.korean}
                            </div>
                            <div className="w-14 sm:w-20 text-gray-600 flex-shrink-0 truncate">
                              {activeTab === "engToKor" ? word.korean : word.english}
                            </div>
                            <div className="flex-1 text-gray-500 text-[10px] sm:text-xs truncate min-w-0">
                              {word.synonyms || "-"}
                            </div>
                            <div className="text-gray-400 text-[10px] sm:text-xs flex-shrink-0 hidden xs:block">
                              표제어
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <button
                                onClick={() => {
                                  setWordSelections(prev => ({
                                    ...prev,
                                    [word.id]: false
                                  }));
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 출제하기 버튼 - 출제 리스트 바로 아래 */}
                <div className="mt-4 sm:mt-6">
                  <Button
                    onClick={handleProceedToStep2}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full"
                  >
                    출제하기
                  </Button>
                </div>

                {/* 하단 옵션 */}
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-3 sm:p-4 rounded-lg gap-3 pb-6">
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <label className="flex items-center gap-1.5 sm:gap-2">
                      <input type="checkbox" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
                      <span className="text-xs sm:text-sm">영어→한글 뜻 쓰기</span>
                    </label>
                    <label className="flex items-center gap-1.5 sm:gap-2">
                      <input type="checkbox" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                      <span className="text-xs sm:text-sm">한글 뜻→영어 쓰기</span>
                    </label>
                    <label className="flex items-center gap-1.5 sm:gap-2">
                      <input type="checkbox" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                      <span className="text-xs sm:text-sm">선택안함</span>
                    </label>
                  </div>
                  <p className="text-[11px] sm:text-sm text-gray-500">
                    * 출제 리스트에서 유형별 출제 단어 확인 후, [출제하기] 버튼을 클릭하세요.
                  </p>
                </div>
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
              {/* 헤더 */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <button
                      onClick={() => {
                        setShowStep2Modal(false);
                        setShowStep1Modal(true);
                      }}
                      className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <h2 className="text-base sm:text-2xl font-bold truncate">Step 2. 저장 및 다운로드</h2>
                  </div>
                  <button
                    onClick={() => setShowStep2Modal(false)}
                    className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              {/* 컨텐츠 */}
              <div className="p-4 sm:p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                  {/* 왼쪽: 출제 결과 */}
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">출제 결과</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 sm:gap-3 bg-white p-3 sm:p-4 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">영어 →</span>
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded text-xs sm:text-sm font-medium flex-shrink-0">
                          한글 뜻 쓰기
                        </span>
                        <span className="text-base sm:text-xl font-bold text-gray-800 ml-auto">
                          {engToKorHeadwordCount + engToKorSynonymCount}문제
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 bg-white p-3 sm:p-4 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">한글 뜻 →</span>
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded text-xs sm:text-sm font-medium flex-shrink-0">
                          영어 쓰기
                        </span>
                        <span className="text-base sm:text-xl font-bold text-gray-800 ml-auto">
                          {korToEngHeadwordCount + korToEngSynonymCount}문제
                        </span>
                      </div>
                      {selectedExam === "SAT" && (defToEngHeadwordCount + defToEngSynonymCount > 0) && (
                        <div className="flex items-center gap-2 sm:gap-3 bg-white p-3 sm:p-4 rounded-lg">
                          <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">영영 풀이 →</span>
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 text-purple-700 rounded text-xs sm:text-sm font-medium flex-shrink-0">
                            영어 쓰기
                          </span>
                          <span className="text-base sm:text-xl font-bold text-gray-800 ml-auto">
                            {defToEngHeadwordCount + defToEngSynonymCount}문제
                          </span>
                        </div>
                      )}
                      <div className="bg-teal-50 p-3 sm:p-4 rounded-lg border-2 border-teal-200 mt-3 sm:mt-4">
                        <div className="text-center">
                          <span className="text-xs sm:text-sm text-gray-600">총 문항수</span>
                          <div className="text-2xl sm:text-3xl font-bold text-teal-600 mt-1 sm:mt-2">
                            {getTotalQuestions()} 문제
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽: 테스트 정보 설정 */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">테스트 정보 설정</h3>
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">• 시험일자</label>
                      <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">• 테스트명 (시험지 제목)</label>
                      <Input placeholder="테스트명 (시험지 제목)을 입력하세요." />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">• 학교/학원/클래스명</label>
                      <Input placeholder="교실기관명을 입력하세요." />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        • 학교/학원 로고 <span className="text-xs text-gray-500 ml-2">*파일형식 jpg, png, gif (1MB 이하)</span>
                      </label>
                      <div className="flex gap-2">
                        <Input placeholder="파일명 파일 없음" disabled className="flex-1" />
                        <Button variant="outline">파일 선택</Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 다운로드 섹션 */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-teal-600 mb-4 text-center">단어 시험지 · 답안지 다운로드</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white py-6 text-lg rounded-full" onClick={handleDownloadPDF}>
                      <Download className="w-5 h-5 mr-2" />PDF 파일로 다운로드
                    </Button>
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white py-6 text-lg rounded-full" onClick={handleDownloadWord}>
                      <Download className="w-5 h-5 mr-2" />워드 파일로 다운로드
                    </Button>
                  </div>
                </div>

                {/* 온라인 학습 섹션 */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">온라인 학습</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative">
                      <Button
                        className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-black hover:to-gray-800 text-white py-6 text-lg rounded-full transition-all duration-300 hover:shadow-xl hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
                          if (selectedWords.length === 0) { toast.error("단어를 선택해주세요."); return; }
                          setShowQuizTypeModal(true);
                        }}
                      >
                        학습하기
                      </Button>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white py-6 text-lg rounded-full transition-all duration-300 hover:shadow-xl hover:scale-105"
                      onClick={() => {
                        const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
                        if (selectedWords.length === 0) { toast.error("단어를 선택해주세요."); return; }
                        setShowFlashCardMode(true);
                      }}
                    >
                      플래시 카드
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white py-6 text-lg rounded-full transition-all duration-300 hover:shadow-xl hover:scale-105"
                      onClick={() => {
                        const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
                        if (selectedWords.length === 0) { toast.error("단어를 선택해주세요."); return; }
                        setShowVocabStudyMode(true);
                      }}
                    >
                      어휘 학습
                    </Button>
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
                                  <input type="radio" name="mcFormatCert" checked={multipleChoiceFormat === 'engToKor'} onChange={() => setMultipleChoiceFormat('engToKor')} className="w-4 h-4 text-[#1E3A8A]" />
                                  <span className="text-sm text-gray-700">영어 → 한글</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="radio" name="mcFormatCert" checked={multipleChoiceFormat === 'korToEng'} onChange={() => setMultipleChoiceFormat('korToEng')} className="w-4 h-4 text-[#1E3A8A]" />
                                  <span className="text-sm text-gray-700">한글 → 영어</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="radio" name="mcFormatCert" checked={multipleChoiceFormat === 'defToEng'} onChange={() => setMultipleChoiceFormat('defToEng')} className="w-4 h-4 text-[#1E3A8A]" />
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
              title: `${selectedExam} 단어 테스트`
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

      {/* 플래시 카드 모드 - Full Screen */}
      {showFlashCardMode && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <FlashCard
            words={getAvailableWords().filter(w => wordSelections[w.id]).map(w => ({
              word: w.english,
              definition: w.korean,
              engDefinition: w.definition,
              context: w.synonyms
            }))}
            title={`${selectedExam} 플래시 카드`}
            onClose={() => setShowFlashCardMode(false)}
          />
        </div>
      )}

      {/* 어휘 학습 모드 - Full Screen */}
      {showVocabStudyMode && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <VocabStudy
            words={getAvailableWords().filter(w => wordSelections[w.id]).map(w => ({
              word: w.english,
              definition: w.korean,
              context: w.synonyms
            }))}
            title={`${selectedExam} 어휘 학습`}
            onClose={() => setShowVocabStudyMode(false)}
          />
        </div>
      )}
    </div>
  );
}