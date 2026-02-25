import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner@2.0.3";
import { FileText, BookOpen, GraduationCap, Globe, Award, BookOpenCheck, Library, Search, Trash2, X, ChevronLeft, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getVocaWords, VocaWord, getMaxDay, getDayNames } from "./VocaManagement";
import { Input } from "./ui/input";
import { WordTest } from "./WordTest";
import { downloadHackersVocaPDF, downloadHackersVocaWord, downloadHackersVocaHWP } from "../utils/downloadHelpers";

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
  const [testType, setTestType] = useState<'multiple' | 'subjective' | 'mixed'>('multiple');
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState<{[key: number]: string}>({});
  const [showTestResult, setShowTestResult] = useState<{[key: number]: boolean}>({});
  const [subjectiveAnswer, setSubjectiveAnswer] = useState('');
  const [incorrectQuestions, setIncorrectQuestions] = useState<number[]>([]);

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

  // 다운로드 함수들
  const handleDownloadPDF = () => {
    const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
    
    // PDF 생성 시뮬레이션 (실제 PDF 라이브러리 필요)
    const content = `단어 시험지\n\n교재: ${selectedExam}\n총 문제수: ${getTotalQuestions()}개\n\n영어→한글 뜻 쓰기 (표제어 ${engToKorHeadwordCount}, 동의어 ${engToKorSynonymCount})\n한글 뜻→영어 쓰기 (표제어 ${korToEngHeadwordCount}, 동의어 ${korToEngSynonymCount})\n\n\n출제 단어:\n${selectedWords.map((word, i) => `${i + 1}. ${word.english} - ${word.korean}`).join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `단어시험지_${selectedExam}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    toast.success("PDF 파일로 다운로드되었습니다!");
  };

  const handleDownloadWord = () => {
    const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
    
    const content = `단어 시험지\n\n교재: ${selectedExam}\n출제일: ${new Date().toLocaleDateString('ko-KR')}\n총 문제수: ${getTotalQuestions()}개\n\n[영어→한글 뜻 쓰기]\n표제어: ${engToKorHeadwordCount}문제\n동의어: ${engToKorSynonymCount}문제\n\n[한글 뜻→영어 쓰기]\n표제어: ${korToEngHeadwordCount}문제\n동의어: ${korToEngSynonymCount}문제\n\n\n=== 시험 문제 ===\n\n${selectedWords.map((word, i) => `${i + 1}. ${word.english}\n   답: _____________________\n`).join('\n')}\n\n\n=== ���답 ===\n\n${selectedWords.map((word, i) => `${i + 1}. ${word.korean} (유의어: ${word.synonyms || '없음'})`).join('\n')}`;
    
    const blob = new Blob([content], { type: 'application/msword;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `단어시험지_${selectedExam}_${new Date().toISOString().split('T')[0]}.doc`;
    link.click();
    toast.success("워드 파일로 다운로드되었습니다!");
  };

  const handleDownloadHWP = () => {
    const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
    
    const content = `단어 시험지\n\n교재: ${selectedExam}\n출제일: ${new Date().toLocaleDateString('ko-KR')}\n총 문제수: ${getTotalQuestions()}개\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n[영어→한글 뜻 쓰기]\n표제어: ${engToKorHeadwordCount}문제 | 동의어: ${engToKorSynonymCount}문제\n\n[한글 뜻→영어 쓰]\n표제어: ${korToEngHeadwordCount}문제 | 동의어: ${korToEngSynonymCount}문제\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n\n【 시험 문제 】\n\n${selectedWords.map((word, i) => `${i + 1}. ${word.english}\n\n   뜻: _________________________________\n`).join('\n')}\n\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n\n【 정답 및 해설 】\n\n${selectedWords.map((word, i) => `${i + 1}. ${word.english}\n   정답: ${word.korean}\n   유의어: ${word.synonyms || '없음'}\n`).join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `단어시험지_${selectedExam}_${new Date().toISOString().split('T')[0]}.hwp.txt`;
    link.click();
    toast.success("한글 파일로 다운로드되었습니다!");
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
    
    // Play sound - 정답/오답 모두 사운드 재생
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (answer === correctAnswer) {
        // 정답: 밝은 2음 (C5 -> E5)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } else {
        // 오답: 낮은 단음
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      }
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
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
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    단어 시험 출제하기 (단어 시험지 · 답안지 제작)
                  </h2>
                  <button
                    onClick={() => setShowStep1Modal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 컨텐츠 */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-teal-600 mb-4">
                    Step 1. 출제 단어 확인 및 선택
                  </h3>
                  
                  {/* 탭 */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setActiveTab("engToKor")}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === "engToKor"
                          ? "bg-teal-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      영어→한글
                    </button>
                    <button
                      onClick={() => setActiveTab("korToEng")}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
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
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          activeTab === "defToEng"
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        영영 풀이→영어
                      </button>
                    )}
                    <div className="flex-1" />
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <span>영단어 첫 글자 보이기</span>
                      <button className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium">ON</button>
                      <button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600">OFF</button>
                    </div>
                  </div>
                </div>

                {/* 단어 리스트 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 전체 리스트 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800">전체 리스트</h4>
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
                          <div className="grid grid-cols-12 gap-2 items-center text-sm">
                            <div className="col-span-3 font-medium text-gray-800">
                              {activeTab === "engToKor" ? word.english : activeTab === "korToEng" ? word.korean : word.definition || word.english}
                            </div>
                            <div className="col-span-3 text-gray-600">
                              {activeTab === "engToKor" ? word.korean : word.english}
                            </div>
                            <div className="col-span-3 text-gray-500 text-xs">
                              {word.synonyms || "-"}
                            </div>
                            <div className="col-span-2 text-gray-500 text-xs">
                              표제어
                            </div>
                            <div className="col-span-1 flex justify-end">
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
                  <div className="bg-teal-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800">
                        출제 리스트 <span className="text-teal-600">총 {getSelectedWordsCount()}개</span>
                      </h4>
                      <button className="text-teal-600 text-sm flex items-center gap-1">
                        <span>정렬 초기화</span>
                      </button>
                    </div>
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white rounded-lg text-sm font-medium border border-gray-200">
                          전체(총 {getSelectedWordsCount()}개)
                        </button>
                        <button className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium">
                          한글 뜻 쓰기({engToKorHeadwordCount + engToKorSynonymCount}문제)
                        </button>
                        <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium">
                          영어 쓰기({korToEngHeadwordCount + korToEngSynonymCount}문제)
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {getAvailableWords().filter(w => wordSelections[w.id]).map((word, index) => (
                        <div
                          key={word.id}
                          className="bg-white p-3 rounded-lg border border-teal-200"
                        >
                          <div className="grid grid-cols-12 gap-2 items-center text-sm">
                            <div className="col-span-3 font-medium text-gray-800">
                              {activeTab === "engToKor" ? word.english : word.korean}
                            </div>
                            <div className="col-span-3 text-gray-600">
                              {activeTab === "engToKor" ? word.korean : word.english}
                            </div>
                            <div className="col-span-3 text-gray-500 text-xs">
                              {word.synonyms || "-"}
                            </div>
                            <div className="col-span-2 text-gray-500 text-xs">
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

                {/* 하단 옵션 */}
                <div className="mt-6 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">영어→한글 뜻 쓰기</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">한글 뜻→영어 쓰기</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">선택안함</span>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    * 출제 리스트에서 유형별 출제 단어 확인 후,
                    오른쪽의 [출제하기] 버튼을 클릭하세요.
                  </p>
                </div>
              </div>

              {/* 푸터 */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <Button
                  onClick={handleProceedToStep2}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-4 text-lg font-semibold rounded-full"
                >
                  출제하기
                </Button>
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
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setShowStep2Modal(false);
                        setShowStep1Modal(true);
                      }}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold">Step 2. 저장 및 다운로드</h2>
                  </div>
                  <button
                    onClick={() => setShowStep2Modal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 컨텐츠 */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 왼쪽: 출제 결과 */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">출제 결과</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-white p-4 rounded-lg">
                        <span className="text-sm text-gray-600">영어 →</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                          한글 뜻 쓰기
                        </span>
                        <span className="text-xl font-bold text-gray-800 ml-auto">
                          {engToKorHeadwordCount + engToKorSynonymCount}문제
                        </span>
                      </div>
                      <div className="flex items-center gap-3 bg-white p-4 rounded-lg">
                        <span className="text-sm text-gray-600">한글 뜻 →</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                          영어 쓰기
                        </span>
                        <span className="text-xl font-bold text-gray-800 ml-auto">
                          {korToEngHeadwordCount + korToEngSynonymCount}문제
                        </span>
                      </div>
                      <div className="bg-teal-50 p-4 rounded-lg border-2 border-teal-200 mt-4">
                        <div className="text-center">
                          <span className="text-sm text-gray-600">총 문항수</span>
                          <div className="text-3xl font-bold text-teal-600 mt-2">
                            {getTotalQuestions()} 문제
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽: 테스트 정보 설정 */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">테스트 정보 설정</h3>
                    
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">• 시험일자</label>
                      <Input type="date" defaultValue="2025-11-16" />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 mb-2">
                        <input type="checkbox" className="w-4 h-4 text-teal-600" defaultChecked />
                        <span className="text-sm text-gray-600">시험</span>
                      </label>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        • 테스트명 (시험지 제목)
                      </label>
                      <Input placeholder="테스트명 (시험지 제목)을 입력하세요." />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        • 학교/학원/클래스명
                      </label>
                      <Input placeholder="교실기관명을 입력하세요." />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        • 학교/학원 로고
                        <span className="text-xs text-gray-500 ml-2">*파일형식 jpg, png, gif (1MB 이하)</span>
                      </label>
                      <div className="flex gap-2">
                        <Input placeholder="파일명 파일 없음" disabled className="flex-1" />
                        <Button variant="outline">파일 선택</Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        • 해커스북 로고 (시험지 하단 노출)
                      </label>
                      <div className="flex gap-4">
                        <button className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm">
                          ON
                        </button>
                        <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm">
                          OFF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 다운로드 섹션 */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-teal-600 mb-4 text-center">
                    단어 시험지 · 답안지 다운로드
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white py-6 text-lg rounded-full" onClick={handleDownloadPDF}>
                      <Download className="w-5 h-5 mr-2" />
                      PDF 파일로 다운로드
                    </Button>
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white py-6 text-lg rounded-full" onClick={handleDownloadWord}>
                      <Download className="w-5 h-5 mr-2" />
                      워드 파일로 다운로드
                    </Button>
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white py-6 text-lg rounded-full" onClick={handleDownloadHWP}>
                      <Download className="w-5 h-5 mr-2" />
                      한글 파일로 다운로드
                    </Button>
                  </div>
                </div>

                {/* 테스트 섹션 */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                    온라인 테스트
                  </h3>
                  <div className="relative">
                    <Button 
                      className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-black hover:to-gray-800 text-white py-6 text-lg rounded-full transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('테스트 시작하기 버튼 클릭됨, 현재 showTestDialog:', showTestDialog);
                        const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
                        console.log('선택된 단어 개수:', selectedWords.length);
                        setShowTestDialog(!showTestDialog);
                      }}
                    >
                      테스트 시작하기
                    </Button>
                    
                    {/* 테스트 옵션 다이얼로그 */}
                    {showTestDialog && (
                      <>
                        <div 
                          className="fixed inset-0 bg-black/20 z-[60]" 
                          onClick={() => setShowTestDialog(false)}
                        />
                        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl border border-gray-200 p-6 z-[70] min-w-max">
                          <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">테스트 유형을 선택하세요</h3>
                          </div>
                          <div className="flex gap-4">
                            {/* 객관식 버튼 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('객관식 버튼 클릭됨');
                                handleStartTest('multiple');
                                setShowTestDialog(false);
                              }}
                              className="group flex flex-col items-center gap-3 px-8 py-6 rounded-xl bg-white hover:bg-gray-50 transition-all duration-300 border-2 border-gray-200 hover:border-gray-900 hover:shadow-xl cursor-pointer"
                            >
                              <div className="w-16 h-16 rounded-full bg-gray-700 group-hover:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800 group-hover:text-gray-900 text-base transition-colors">객관식</div>
                                <div className="text-xs text-gray-500 mt-1">4지선다</div>
                              </div>
                            </button>
                            
                            {/* 주관식 버튼 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('주관식 버튼 클릭됨');
                                handleStartTest('subjective');
                                setShowTestDialog(false);
                              }}
                              className="group flex flex-col items-center gap-3 px-8 py-6 rounded-xl bg-white hover:bg-gray-50 transition-all duration-300 border-2 border-gray-200 hover:border-gray-900 hover:shadow-xl cursor-pointer"
                            >
                              <div className="w-16 h-16 rounded-full bg-gray-600 group-hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800 group-hover:text-gray-900 text-base transition-colors">주관식</div>
                                <div className="text-xs text-gray-500 mt-1">직접 입력</div>
                              </div>
                            </button>
                            
                            {/* 혼합 버튼 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('혼합 버튼 클릭됨');
                                handleStartTest('mixed');
                                setShowTestDialog(false);
                              }}
                              className="group flex flex-col items-center gap-3 px-8 py-6 rounded-xl bg-white hover:bg-gray-50 transition-all duration-300 border-2 border-gray-200 hover:border-gray-900 hover:shadow-xl cursor-pointer"
                            >
                              <div className="w-16 h-16 rounded-full bg-gray-500 group-hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800 group-hover:text-gray-900 text-base transition-colors">혼합</div>
                                <div className="text-xs text-gray-500 mt-1">객관식+주관식</div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
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
          />
        </div>
      )}
    </div>
  );
}