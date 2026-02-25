import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { X, ChevronLeft, ChevronRight, Clock, CheckCircle2, Brain, BookOpen, Calculator, AlertCircle, Highlighter, Pencil, Underline } from "lucide-react";
import { extractQuestionsFromMaterial, ParsedQuestion } from "./utils/questionParser";
import { toast } from "sonner@2.0.3";

interface Question {
  id: number;
  type: 'reading' | 'math';
  passage?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  section: string;
  explanation?: string;
  aiInsight?: string;
  calculatorAllowed?: boolean;
}

interface InteractivePracticeTestProps {
  materialTitle: string;
  material?: any;
  onExit: () => void;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    type: 'reading',
    section: 'Reading Comprehension',
    passage: `The concept of "flow state" was first introduced by psychologist Mihaly Csikszentmihalyi in the 1970s. Flow state refers to a mental state in which a person performing an activity is fully immersed in a feeling of energized focus, full involvement, and enjoyment in the process of the activity. In essence, flow is characterized by the complete absorption in what one does, and a resulting transformation in one's sense of time.

During flow state, people typically experience a loss of reflective self-consciousness, a merging of action and awareness where the person becomes one with the activity. The activity becomes autotelic – that is, an end in itself. Time appears to slow down or speed up; hours can pass by unnoticed, or alternatively, time can seem to freeze in moments of intense concentration.

Research has shown that flow state can be achieved in various activities, from sports and creative pursuits to everyday tasks like cooking or gardening. The key conditions for achieving flow include having clear goals, immediate feedback, and a balance between the challenge level and one's skill level. When the challenge is too low relative to skill, boredom ensues; when challenge exceeds skill level significantly, anxiety results.`,
    question: "According to the passage, which of the following is NOT mentioned as a characteristic of flow state?",
    options: [
      "Complete absorption in the activity",
      "Loss of reflective self-consciousness", 
      "Enhanced memory formation",
      "Altered perception of time"
    ],
    correctAnswer: 2
  },
  {
    id: 2,
    type: 'reading',
    section: 'Writing and Language',
    question: "The students worked diligently on their project, _____ they completed it ahead of schedule.",
    options: [
      "but",
      "so", 
      "because",
      "although"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    type: 'math',
    section: 'Algebra and Functions',
    calculatorAllowed: true,
    question: "If 3x + 7 = 22, what is the value of 6x + 14?",
    options: [
      "30",
      "44",
      "58", 
      "72"
    ],
    correctAnswer: 1
  },
  {
    id: 4,
    type: 'math',
    section: 'Algebra and Functions',
    calculatorAllowed: false,
    question: "The function f is defined by f(x) = 2x² - 5x + 3. What is the value of f(4)?",
    options: [
      "15",
      "21",
      "35",
      "51"
    ],
    correctAnswer: 2
  },
  {
    id: 5,
    type: 'reading',
    section: 'Reading Comprehension',
    passage: `Climate scientists have long debated the most effective strategies for reducing global carbon emissions. While renewable energy sources like solar and wind power have gained significant attention, some researchers argue that nuclear energy represents the most viable path toward rapid decarbonization. Nuclear power plants produce virtually no greenhouse gas emissions during operation and can generate electricity consistently, unlike solar and wind which depend on weather conditions.

However, concerns about nuclear waste disposal, high construction costs, and safety risks have limited public acceptance of nuclear energy. Recent technological advances in small modular reactors (SMRs) may address some of these concerns by offering enhanced safety features and reduced capital requirements.`,
    question: "The passage suggests that nuclear energy differs from solar and wind power primarily in its:",
    options: [
      "Environmental impact during construction",
      "Ability to generate electricity consistently",
      "Long-term cost effectiveness", 
      "Public acceptance and support"
    ],
    correctAnswer: 1
  },
  {
    id: 6,
    type: 'math',
    section: 'Problem Solving',
    calculatorAllowed: true,
    question: "A store offers a 20% discount on all items. If Sarah pays $80 after the discount, what was the original price?",
    options: [
      "$96",
      "$100",
      "$104",
      "$120"
    ],
    correctAnswer: 1
  }
];

export function InteractivePracticeTest({ materialTitle, material, onExit }: InteractivePracticeTestProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: number}>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isUploadedContent, setIsUploadedContent] = useState(false);
  
  // Highlighter states
  const [highlightMode, setHighlightMode] = useState<'none' | 'yellow' | 'pink' | 'blue' | 'underline' | 'note'>('none');
  const [passageHighlights, setPassageHighlights] = useState<{[questionId: number]: any[]}>({});
  const [noteText, setNoteText] = useState('');
  const passageRef = useRef<HTMLDivElement>(null);
  const [selectionRange, setSelectionRange] = useState<{start: number, end: number} | null>(null);
  
  // Load questions from material if available
  useEffect(() => {
    const loadQuestions = async () => {
      if (!material) {
        console.log('No material provided, using sample questions');
        setQuestions(sampleQuestions);
        setIsLoading(false);
        return;
      }

      console.log('=== Loading questions from material ===');
      console.log('Material:', JSON.stringify(material, null, 2).substring(0, 500));
      console.log('Has previewFileData:', !!material.previewFileData);
      if (material.previewFileData) {
        console.log('PreviewFileData keys:', Object.keys(material.previewFileData));
        console.log('PreviewFileData fileName:', material.previewFileData.fileName);
        console.log('PreviewFileData fileType:', material.previewFileData.fileType);
        console.log('PreviewFileData fileData length:', material.previewFileData.fileData?.length || 0);
      }
      console.log('Has uploadData:', !!material.uploadData);

      try {
        const parsedQuestions = await extractQuestionsFromMaterial(material);
        console.log('Parsed questions:', parsedQuestions);
        
        if (parsedQuestions.length > 0) {
          // Convert ParsedQuestion to Question format
          const convertedQuestions: Question[] = parsedQuestions.map(pq => ({
            id: pq.id,
            type: pq.type || 'reading',
            passage: pq.passage,
            question: pq.question,
            options: pq.options,
            correctAnswer: pq.correctAnswer,
            section: pq.section || '일반',
            explanation: pq.explanation,
            aiInsight: pq.aiInsight,
            calculatorAllowed: pq.type === 'math'
          }));
          console.log('Converted questions:', convertedQuestions);
          setQuestions(convertedQuestions);
          setIsUploadedContent(true);
          toast.success(`✅ 업로드된 ${convertedQuestions.length}개 문제를 불러왔습니다!`);
        } else {
          // No questions found, use sample
          console.log('No parsed questions, using sample');
          setQuestions(sampleQuestions);
          setIsUploadedContent(false);
          toast.warning("⚠️ 업로드된 문제를 찾을 수 없어 샘플 문제를 표시합니다. TXT 파일 형식을 확인해주세요.");
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        setHasError(true);
        toast.error("문제를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [material]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Timer effect
  useEffect(() => {
    if (!showResults) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    // 답안 저장
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleFinishTest = () => {
    setShowResults(true);
  };

  const handleRetakeIncorrect = () => {
    // 틀린 문제만 필터링
    const incorrectQuestions = questions.filter(question => {
      const userAnswer = userAnswers[question.id];
      return userAnswer !== undefined && userAnswer !== question.correctAnswer;
    });

    if (incorrectQuestions.length === 0) {
      toast.info('틀린 문제가 없습니다!');
      return;
    }

    // 상태 리셋하고 틀린 문제로 다시 시작
    setQuestions(incorrectQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeElapsed(0);
    setShowResults(false);
    setShowAnswer(false);
    toast.success(`틀린 ${incorrectQuestions.length}개 문제로 다시 시작합니다!`);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: totalQuestions, percentage: Math.round((correct / totalQuestions) * 100) };
  };

  // Handle text selection for highlighting
  const handleTextSelection = () => {
    if (highlightMode === 'none') return;

    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '' || selection.rangeCount === 0) return;

    const selectedText = selection.toString();
    const range = selection.getRangeAt(0);
    
    try {
      // Extract the contents
      const extractedContent = range.extractContents();
      
      // Create highlight element
      const highlightSpan = document.createElement('span');
      highlightSpan.className = 'highlight-marker';
      highlightSpan.style.padding = '2px 0';
      highlightSpan.style.borderRadius = '2px';
      
      if (highlightMode === 'yellow') {
        highlightSpan.style.backgroundColor = '#fef08a';
      } else if (highlightMode === 'pink') {
        highlightSpan.style.backgroundColor = '#fda4af';
      } else if (highlightMode === 'blue') {
        highlightSpan.style.backgroundColor = '#bfdbfe';
      } else if (highlightMode === 'underline') {
        highlightSpan.style.borderBottom = '3px solid #000';
        highlightSpan.style.backgroundColor = 'transparent';
      }
      
      // Append the extracted content to the highlight span
      highlightSpan.appendChild(extractedContent);
      
      // Insert the highlight span at the range
      range.insertNode(highlightSpan);
      
      // Save highlight data
      const currentHighlights = passageHighlights[currentQuestion.id] || [];
      setPassageHighlights({
        ...passageHighlights,
        [currentQuestion.id]: [
          ...currentHighlights,
          {
            text: selectedText,
            type: highlightMode,
            note: highlightMode === 'note' ? noteText : undefined
          }
        ]
      });
      
      selection.removeAllRanges();
      toast.success('하이라이트가 적용되었습니다!');
    } catch (e) {
      console.error('Highlight failed:', e);
      toast.error('하이라이트 적용에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const score = showResults ? calculateScore() : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">문제를 불러오는 중입니다...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl text-gray-900 mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-6">문제를 불러올 수 없습니다.</p>
          <Button onClick={onExit} className="bg-gray-900 hover:bg-gray-800 text-white w-full">
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 w-full max-w-3xl shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl text-gray-900 mb-2">시험 완료!</h2>
            <p className="text-gray-600">수고하셨습니다. 결과를 확인하세요.</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-8 rounded-2xl mb-6 border border-cyan-100">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 mb-2">
                  {score?.correct}/{score?.total}
                </div>
                <div className="text-sm text-gray-600">정답 수</div>
              </div>
              <div>
                <div className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 mb-2">
                  {score?.percentage}%
                </div>
                <div className="text-sm text-gray-600">정답률</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-600" />
              시험 요약
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-gray-600">소요 시간</span>
                <span className="font-medium text-gray-900">{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-gray-600">응답 문제</span>
                <span className="font-medium text-gray-900">{Object.keys(userAnswers).length}/{totalQuestions}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
            {questions.map((question, index) => {
              const userAnswer = userAnswers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              const wasAnswered = userAnswer !== undefined;
              
              return (
                <div key={question.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-700">문제 {index + 1}</span>
                  <div className="flex items-center space-x-2">
                    {wasAnswered ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {isCorrect ? '정답' : '오답'}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                        미응답
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleRetakeIncorrect} 
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white h-12 rounded-xl text-base"
            >
              틀린 문제 다시 풀기
            </Button>
            <Button 
              onClick={onExit} 
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white h-12 rounded-xl text-base"
            >
              자료로 돌아가기
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-[95vw] max-h-[95vh] h-full flex flex-col overflow-hidden">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* Logo and Title */}
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-shrink">
                <h1 className="text-sm text-gray-900 font-medium truncate">
                  {materialTitle}
                </h1>
                <p className="text-xs text-gray-500">{currentQuestion.section}</p>
              </div>
              
              {/* Timer */}
              <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-600">{formatTime(timeElapsed)}</span>
              </div>
              
              {/* Compact Highlighter Tools */}
              {currentQuestion.passage && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200 ml-2 flex-shrink-0">
                  {/* Color buttons - smaller */}
                  <button
                    onClick={() => setHighlightMode(highlightMode === 'yellow' ? 'none' : 'yellow')}
                    className={`w-6 h-6 rounded-full bg-yellow-400 transition-all hover:scale-110 ${
                      highlightMode === 'yellow' ? 'ring-2 ring-yellow-500 ring-offset-1' : ''
                    }`}
                    title="노란색 형광펜"
                  />
                  <button
                    onClick={() => setHighlightMode(highlightMode === 'blue' ? 'none' : 'blue')}
                    className={`w-6 h-6 rounded-full bg-blue-400 transition-all hover:scale-110 ${
                      highlightMode === 'blue' ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                    }`}
                    title="파란색 형광펜"
                  />
                  <button
                    onClick={() => setHighlightMode(highlightMode === 'pink' ? 'none' : 'pink')}
                    className={`w-6 h-6 rounded-full bg-pink-400 transition-all hover:scale-110 ${
                      highlightMode === 'pink' ? 'ring-2 ring-pink-500 ring-offset-1' : ''
                    }`}
                    title="분홍색 형광펜"
                  />
                  
                  {/* Underline button - smaller */}
                  <button
                    onClick={() => setHighlightMode(highlightMode === 'underline' ? 'none' : 'underline')}
                    className={`w-6 h-6 rounded flex items-center justify-center transition-all hover:bg-gray-100 ${
                      highlightMode === 'underline' ? 'bg-gray-200' : ''
                    }`}
                    title="밑줄"
                  >
                    <span className="text-sm font-bold" style={{ textDecoration: 'underline' }}>U</span>
                  </button>
                  
                  {/* Divider */}
                  <div className="w-px h-4 bg-gray-300 mx-0.5"></div>
                  
                  {/* Delete button - smaller */}
                  <button
                    onClick={() => {
                      const highlights = document.querySelectorAll('.highlight-marker');
                      highlights.forEach(h => {
                        const parent = h.parentNode;
                        while (h.firstChild) {
                          parent?.insertBefore(h.firstChild, h);
                        }
                        parent?.removeChild(h);
                      });
                      toast.success('모든 하이라이트가 제거되었습니다.');
                    }}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 transition-all"
                    title="하이라이트 삭제"
                  >
                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  
                  {/* Copy button - smaller */}
                  <button
                    onClick={() => {
                      const selection = window.getSelection()?.toString();
                      if (selection) {
                        navigator.clipboard.writeText(selection);
                        toast.success('클립보드에 복사되었습니다.');
                      } else {
                        toast.error('복사할 텍스트를 선택해주세요.');
                      }
                    }}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 transition-all"
                    title="복사"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            {/* Question counter and close button */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="text-xs text-gray-500">
                문제 {currentQuestionIndex + 1} / {totalQuestions}
              </span>
              <button
                onClick={onExit}
                className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Passage Section with Highlighter Tools */}
        {currentQuestion.passage && (
          <div className="w-1/2 flex flex-col bg-white border-r border-gray-200">
            {/* Passage Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">지문</h3>
                </div>
                <div className="prose prose-gray" ref={passageRef} onMouseUp={handleTextSelection}>
                  {currentQuestion.passage.split('\\n\\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed select-text">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Question Section */}
        <div className={`${currentQuestion.passage ? 'w-1/2' : 'w-full'} p-6 overflow-y-auto`}>
          <div className="max-w-3xl mx-auto">
            {/* Question */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{currentQuestionIndex + 1}</span>
                </div>
                <h3 className="text-lg text-gray-900 leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>
              
              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  // Detect if using Korean letters (가, 나, 다, 라, 마)
                  const firstOption = currentQuestion.options[0];
                  const isKoreanFormat = firstOption && /^[가나다라마]/.test(firstOption);
                  const koreanLetters = ['가', '나', '다', '라', '마'];
                  const optionLetter = isKoreanFormat ? koreanLetters[index] : String.fromCharCode(65 + index);
                  const isSelected = userAnswers[currentQuestion.id] === index;
                  
                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-400 shadow-md'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-medium ${
                          isSelected 
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {optionLetter}
                        </span>
                        <span className={`flex-1 ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                          {option}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Answer Section - Quizlet style */}
            {showAnswer && (
              <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">정답</span>
                  <button
                    onClick={() => setShowAnswer(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    숨기기
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-semibold text-gray-900">{String.fromCharCode(65 + currentQuestion.correctAnswer)}</span>
                  <span className="text-gray-800">
                    {currentQuestion.options[currentQuestion.correctAnswer]}
                  </span>
                </div>
                {currentQuestion.explanation && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{currentQuestion.explanation}</p>
                  </div>
                )}
              </div>
            )}
            
            {!showAnswer && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAnswer(true)}
                  className="w-full py-3 px-4 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-700 hover:border-cyan-500 hover:bg-gray-50 transition-all"
                >
                  정답 보기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </Button>
          
          <div className="flex gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  setShowAnswer(false);
                }}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : userAnswers[questions[index].id] !== undefined
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleFinishTest}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white flex items-center gap-2"
            >
              완료
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white flex items-center gap-2"
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}