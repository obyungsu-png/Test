import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { X, ChevronLeft, ChevronRight, Clock, CheckCircle2, Brain, BookOpen, Calculator, AlertCircle, Highlighter, Pencil, Underline, Lightbulb, BarChart3, BookMarked } from "lucide-react";
import { extractQuestionsFromMaterial, generateQuestionsWithGLM, ParsedQuestion } from "./utils/questionParser";
import { toast } from "sonner@2.0.3";

interface Question {
  id: number;
  type: 'reading' | 'math';
  passage?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  section: string;
  explanation?: string;    // 해설 (CMS에서 편집 가능)
  analysis?: string;       // 분석 (CMS에서 편집 가능)
  vocab?: string;          // 단어 (CMS에서 편집 가능)
  aiInsight?: string;
  calculatorAllowed?: boolean;
}

export interface FeedbackTabConfig {
  key: 'explanation' | 'analysis' | 'vocab';
  label: string;
  emoji: string;
}

export const DEFAULT_FEEDBACK_TABS: FeedbackTabConfig[] = [
  { key: 'explanation', label: '해설', emoji: '🔍' },
  { key: 'analysis',    label: '분석', emoji: '📐' },
  { key: 'vocab',       label: 'AI',   emoji: '🤖' },
];

interface InteractivePracticeTestProps {
  materialTitle: string;
  material?: any;
  questionEdits?: {[key: string]: {explanation: string, analysis: string, vocab: string}};
  feedbackTabs?: FeedbackTabConfig[];
  onExit: () => void;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    type: 'reading',
    section: 'Reading Comprehension',
    passage: `"The scientist's findings were so ______ that even her harshest critics had to acknowledge the validity of her research."`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: [
      "ambiguous",
      "compelling",
      "trivial",
      "controversial"
    ],
    correctAnswer: 1,
    explanation: "\"compelling\"은 '설득력 있는'이라는 뜻으로, 가장 가혹한 비평가들조차 연구의 타당성을 인정해야 했다는 맥락에 가장 적합합니다. \"ambiguous\"(모호한)는 반대 의미이고, \"trivial\"(사소한)과 \"controversial\"(논쟁적인)은 비평가들이 '인정'하게 되는 맥락과 맞지 않습니다."
  },
  {
    id: 2,
    type: 'reading',
    section: 'Writing and Language',
    passage: `Climate scientists have long debated the most effective strategies for reducing global carbon emissions. While renewable energy sources like solar and wind power have gained significant attention, some researchers argue that nuclear energy represents the most viable path toward rapid decarbonization.`,
    question: "According to the passage, which of the following best describes the relationship between renewable and nuclear energy?",
    options: [
      "They are complementary approaches to reducing emissions",
      "Nuclear energy is presented as an alternative to renewables",
      "Renewable energy has been proven more effective",
      "Both have equal public acceptance"
    ],
    correctAnswer: 1,
    explanation: "지문에서 재생 에너지가 주목받고 있지만(While renewable energy sources... have gained significant attention), 일부 연구자들은 핵에너지가 가장 실행 가능한 경로라고 주장한다(nuclear energy represents the most viable path)고 서술하고 있습니다. 이는 핵에너지를 재생 에너지의 대안으로 제시하는 구조입니다."
  },
  {
    id: 3,
    type: 'math',
    section: 'Algebra',
    calculatorAllowed: true,
    question: "If 3x + 7 = 22, what is the value of 6x + 14?",
    options: [
      "30",
      "44",
      "58",
      "72"
    ],
    correctAnswer: 1,
    explanation: "6x + 14 = 2(3x + 7)입니다. 3x + 7 = 22이므로, 6x + 14 = 2 × 22 = 44입니다. 직접 x = 5를 구해 대입해도 6(5) + 14 = 44로 같은 결과입니다."
  }
];

export function InteractivePracticeTest({ materialTitle, material, questionEdits = {}, feedbackTabs = DEFAULT_FEEDBACK_TABS, onExit }: InteractivePracticeTestProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: number}>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isUploadedContent, setIsUploadedContent] = useState(false);
  
  // Feedback sections
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showVocab, setShowVocab] = useState(false);
  const [analysisCache, setAnalysisCache] = useState<{[key: string]: string}>({});
  const [vocabCache, setVocabCache] = useState<{[key: string]: string}>({});
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [vocabLoading, setVocabLoading] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);

  // Mobile
  const [mobileView, setMobileView] = useState<'question' | 'passage'>('question');
  
  // Highlighter
  const [highlightMode, setHighlightMode] = useState<'none' | 'yellow' | 'pink' | 'blue' | 'underline'>('none');
  const [showHighlightTools, setShowHighlightTools] = useState(false);
  const passageRef = useRef<HTMLDivElement>(null);
  const questionNavRef = useRef<HTMLDivElement>(null);

  // 언마운트 시 탭바 복원
  useEffect(() => {
    return () => { window.dispatchEvent(new Event('aiChatClose')); };
  }, []);

  // Load questions from material
  useEffect(() => {
    const loadQuestions = async () => {
      if (!material) {
        setQuestions(sampleQuestions);
        setIsLoading(false);
        return;
      }

      try {
        const parsedQuestions = await extractQuestionsFromMaterial(material);
        if (parsedQuestions.length > 0) {
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
          setQuestions(convertedQuestions);
          setIsUploadedContent(true);
          toast.success(`${convertedQuestions.length}개 문제를 불러왔습니다!`);
        } else {
          // 업로드 파일 없는 샘플 자료 → GLM으로 문제 자동 생성
          toast.info("AI가 문제를 생성 중입니다...");
          try {
            const glmQuestions = await generateQuestionsWithGLM(material);
            if (glmQuestions.length > 0) {
              const converted: Question[] = glmQuestions.map(pq => ({
                id: pq.id,
                type: pq.type || 'reading',
                passage: pq.passage,
                question: pq.question,
                options: pq.options,
                correctAnswer: pq.correctAnswer,
                section: pq.section || '일반',
                explanation: pq.explanation,
                calculatorAllowed: false,
              }));
              setQuestions(converted);
              setIsUploadedContent(true);
              toast.success(`AI가 ${converted.length}개 문제를 생성했습니다!`);
            } else {
              setQuestions(sampleQuestions);
              setIsUploadedContent(false);
              toast.warning("문제 생성에 실패하여 샘플 문제를 표시합니다.");
            }
          } catch {
            setQuestions(sampleQuestions);
            setIsUploadedContent(false);
          }
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
  const completedCount = answeredQuestions.size;
  const isCurrentAnswered = answeredQuestions.has(currentQuestion?.id);
  const currentUserAnswer = userAnswers[currentQuestion?.id];
  const isCurrentCorrect = isCurrentAnswered && currentUserAnswer === currentQuestion?.correctAnswer;

  // Timer
  useEffect(() => {
    if (!showResults) {
      const timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionLetter = (index: number) => {
    const firstOption = currentQuestion?.options[0];
    const isKorean = firstOption && /^[가나다라마]/.test(firstOption);
    if (isKorean) return ['가', '나', '다', '라', '마'][index];
    return String.fromCharCode(65 + index);
  };

  const getCorrectLetter = (q: Question) => {
    const firstOption = q.options[0];
    const isKorean = firstOption && /^[가나다라마]/.test(firstOption);
    if (isKorean) return ['가', '나', '다', '라', '마'][q.correctAnswer];
    return String.fromCharCode(65 + q.correctAnswer);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (isCurrentAnswered) return; // Can't change answer once submitted
    
    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));
    setAnsweredQuestions(prev => new Set([...prev, currentQuestion.id]));
    
    // Reset feedback sections
    setShowInterpretation(false);
    setShowAnalysis(false);
    setShowVocab(false);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setMobileView('question');
      setShowInterpretation(false);
      setShowAnalysis(false);
      setShowVocab(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setMobileView('question');
      setShowInterpretation(false);
      setShowAnalysis(false);
      setShowVocab(false);
    }
  };

  const handleFinishTest = () => setShowResults(true);

  const handleRetakeIncorrect = () => {
    const incorrectQuestions = questions.filter(q => {
      const ua = userAnswers[q.id];
      return ua !== undefined && ua !== q.correctAnswer;
    });
    if (incorrectQuestions.length === 0) {
      toast.info('틀린 문제가 없습니다!');
      return;
    }
    setQuestions(incorrectQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setAnsweredQuestions(new Set());
    setTimeElapsed(0);
    setShowResults(false);
    toast.success(`틀린 ${incorrectQuestions.length}개 문제로 다시 시작합니다!`);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => { if (userAnswers[q.id] === q.correctAnswer) correct++; });
    return { correct, total: totalQuestions, percentage: Math.round((correct / totalQuestions) * 100) };
  };

  // Highlight handler
  const handleTextSelection = () => {
    if (highlightMode === 'none') return;
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '' || selection.rangeCount === 0) return;
    try {
      const range = selection.getRangeAt(0);
      const extractedContent = range.extractContents();
      const span = document.createElement('span');
      span.className = 'highlight-marker';
      span.style.padding = '2px 0';
      span.style.borderRadius = '2px';
      if (highlightMode === 'yellow') span.style.backgroundColor = '#fef08a';
      else if (highlightMode === 'pink') span.style.backgroundColor = '#fda4af';
      else if (highlightMode === 'blue') span.style.backgroundColor = '#bfdbfe';
      else if (highlightMode === 'underline') { span.style.borderBottom = '3px solid #000'; span.style.backgroundColor = 'transparent'; }
      span.appendChild(extractedContent);
      range.insertNode(span);
      selection.removeAllRanges();
      toast.success('하이라이트 적용!');
    } catch (e) {
      console.error('Highlight failed:', e);
    }
  };

  // Generate helper content - questionEdits(CMS) > q 필드 > 자동 생성 순서
  const getEditKey = (q: Question) => `${materialTitle}-Q${q.id}`;

  const getInterpretation = (q: Question) => {
    const edit = questionEdits[getEditKey(q)];
    if (edit?.explanation) return edit.explanation;
    if (q.explanation) return q.explanation;
    if (q.passage) {
      return `이 지문은 ${q.section} 영역의 문제입니다. 핵심 내용을 파악하고, 선택지와의 관계를 분석하는 것이 중요합니다. 지문의 주요 키워드와 논리적 흐름에 주목하세요.`;
    }
    return `이 문제는 ${q.section} 유형의 문제입니다. 문제의 핵심 요구사항을 정확히 파악하고, 각 선택지의 차이점을 비교하여 가장 적합한 답을 선택하세요.`;
  };

  const GLM_API_KEY = "dc2213720f4b4a88ae06ddbd434ab1dd.qDGcLtBM9gGqp6ff";

  const callGLM = async (prompt: string): Promise<string> => {
    const res = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: "glm-4-flash",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`GLM Error: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  };

  const fetchAnalysis = async (q: Question) => {
    const key = getEditKey(q);
    if (analysisCache[key]) return;
    setAnalysisLoading(true);
    try {
      const text = (q.passage || '') + ' ' + q.question + ' ' + q.options.join(' ');
      const prompt = `다음 영어 시험 문제/지문에서 중요 어휘를 추출해서 아래 형식으로 정리해줘. 반드시 줄바꿈을 지켜줘.

[텍스트]
${text}

출력 형식 (6~8개):
단어 [품사] 뜻
예) compelling [adj] 강렬한, 설득력 있는
예) acknowledge [v] 인정하다
예) validity [n] 타당성, 유효성

형식만 맞추고 불필요한 설명 없이 단어 목록만 출력해줘.`;
      const result = await callGLM(prompt);
      setAnalysisCache(prev => ({ ...prev, [key]: result }));
    } catch {
      setAnalysisCache(prev => ({ ...prev, [key]: getAnalysisFallback(q) }));
    } finally {
      setAnalysisLoading(false);
    }
  };

  const sendAiChat = async (userMsg: string, q: Question) => {
    if (!userMsg.trim() || aiChatLoading) return;
    const newMessages = [...aiChatMessages, { role: 'user' as const, text: userMsg }];
    setAiChatMessages(newMessages);
    setAiChatInput('');
    setAiChatLoading(true);
    try {
      const context = `너는 영어 시험 문제 도우미야. 아래 문제를 기반으로 학생 질문에 한국어로 친절하게 짧게 답해줘.

[문제] ${q.question}
[선택지] ${q.options.map((o,i)=>`${String.fromCharCode(65+i)}.${o}`).join(' / ')}
[정답] ${String.fromCharCode(65+q.correctAnswer)}. ${q.options[q.correctAnswer]}
${q.passage ? `[지문] ${q.passage.slice(0,300)}` : ''}`;

      const messages = [
        { role: 'system', content: context },
        ...newMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
      ];
      const res = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GLM_API_KEY}` },
        body: JSON.stringify({ model: "glm-4-flash", max_tokens: 400, messages }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "답변을 불러오지 못했어요.";
      setAiChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch {
      setAiChatMessages(prev => [...prev, { role: 'ai', text: '오류가 발생했어요. 다시 시도해주세요.' }]);
    } finally {
      setAiChatLoading(false);
    }
  };

  const getAnalysisFallback = (q: Question) => {
    const correctLetter = getCorrectLetter(q);
    return `✅ 정답: ${correctLetter}. ${q.options[q.correctAnswer]}\n\n❌ 오답 분석:\n${q.options.map((opt, i) => {
      const letter = String.fromCharCode(65 + i);
      return i === q.correctAnswer ? null : `• ${letter}: ${opt}`;
    }).filter(Boolean).join('\n')}`;
  };

  const getVocabFallback = (q: Question) => {
    const text = (q.passage || '') + ' ' + q.question + ' ' + q.options.join(' ');
    const words = [...new Set(text.split(/\s+/).filter(w => w.length > 6 && /^[a-zA-Z]+$/.test(w)).map(w => w.toLowerCase()))].slice(0, 6);
    return words.length ? words.map(w => `${w} - (사전 검색 권장)`).join('\n') : q.options.join('\n');
  };

  const getAnalysis = (q: Question) => {
    const edit = questionEdits[getEditKey(q)];
    if (edit?.analysis) return edit.analysis;
    if (q.analysis) return q.analysis;
    const correctLetter = getCorrectLetter(q);
    return `정답 분석: ${correctLetter}번 "${q.options[q.correctAnswer]}"\n\n각 선택지 비교:\n${q.options.map((opt, i) => {
      const letter = String.fromCharCode(65 + i);
      const isCorrect = i === q.correctAnswer;
      return `${letter}. ${opt} ${isCorrect ? '← 정답' : ''}`;
    }).join('\n')}`;
  };

  const getVocab = (q: Question) => {
    const edit = questionEdits[getEditKey(q)];
    if (edit?.vocab) return edit.vocab;
    if (q.vocab) return q.vocab;
    const text = (q.passage || '') + ' ' + q.question + ' ' + q.options.join(' ');
    const complexWords: string[] = [];
    const words = text.split(/\s+/);
    words.forEach(w => { if (w.length > 7 && /^[a-zA-Z]+$/.test(w)) complexWords.push(w.toLowerCase()); });
    const unique = [...new Set(complexWords)].slice(0, 6);
    if (unique.length === 0) return "이 문제에서 주요 어휘: " + q.options.join(', ');
    return `주요 어휘:\n${unique.map(w => `• ${w}`).join('\n')}\n\n선택지 어휘:\n${q.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n')}`;
  };

  const score = showResults ? calculateScore() : null;

  // Loading
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">문제를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  // Error
  if (hasError) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl text-gray-900 mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-6">문제를 불러올 수 없습니다.</p>
          <Button onClick={onExit} className="bg-gray-900 hover:bg-gray-800 text-white w-full">돌아가기</Button>
        </div>
      </div>
    );
  }

  // ========== RESULTS SCREEN ==========
  if (showResults) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
        <div className="min-h-full flex items-start sm:items-center justify-center p-4 py-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-5 sm:p-8 w-full max-w-3xl shadow-lg border border-gray-200"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-9 h-9 sm:w-12 sm:h-12 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl text-gray-900 mb-1">시험 완료!</h2>
              <p className="text-sm text-gray-500">수고하셨습니다. 결과를 확인하세요.</p>
            </div>

            <div className="bg-gray-50 p-5 sm:p-8 rounded-xl mb-4 border border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl sm:text-4xl text-slate-700 font-bold">{score?.correct}/{score?.total}</div>
                  <div className="text-xs text-gray-500 mt-1">정답 수</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl text-slate-700 font-bold">{score?.percentage}%</div>
                  <div className="text-xs text-gray-500 mt-1">정답률</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl text-slate-700 font-bold">{formatTime(timeElapsed)}</div>
                  <div className="text-xs text-gray-500 mt-1">소요 시간</div>
                </div>
              </div>
            </div>

            {/* Question review */}
            <div className="space-y-2 max-h-[40vh] overflow-y-auto mb-5">
              {questions.map((question, index) => {
                const userAnswer = userAnswers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                const wasAnswered = userAnswer !== undefined;
                const correctLetter = getCorrectLetter(question);
                
                return (
                  <div key={question.id} className="bg-gray-50 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-3 sm:p-4">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Q{index + 1}</span>
                        <span className="text-xs text-gray-500 truncate">{question.question.substring(0, 40)}...</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <span className="text-[10px] sm:text-xs text-gray-500">
                          정답: <span className="font-bold text-green-700">{correctLetter}</span>
                        </span>
                        {wasAnswered ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                            isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {isCorrect ? '정답' : '오답'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 text-gray-600">미응답</span>
                        )}
                      </div>
                    </div>
                    {(!wasAnswered || !isCorrect) && question.explanation && (
                      <div className="px-3 pb-3">
                        <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                          {question.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <Button onClick={handleRetakeIncorrect} className="flex-1 bg-amber-700 hover:bg-amber-800 text-white h-11 rounded-xl">
                틀린 문제 다시 풀기
              </Button>
              <Button onClick={onExit} className="flex-1 bg-slate-700 hover:bg-slate-800 text-white h-11 rounded-xl">
                돌아가기
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ========== MAIN TEST SCREEN ==========
  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50">
      {/* ===== Top Header ===== */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">유형 연습</span>
              <span className="text-sm text-gray-600 hidden sm:inline">같은 유형 {totalQuestions}문제</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 hidden sm:inline">{materialTitle} 파생된 연습 문제</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-600 font-medium tabular-nums">{formatTime(timeElapsed)}</span>
              </div>
              <button onClick={onExit} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Mobile: Passage/Question toggle ===== */}
      {currentQuestion.passage && (
        <div className="sm:hidden flex-shrink-0 border-b border-gray-100 bg-white">
          <div className="flex">
            <button
              onClick={() => setMobileView('passage')}
              className={`flex-1 py-3 text-sm font-semibold text-center transition-all relative flex items-center justify-center gap-1.5 ${
                mobileView === 'passage'
                  ? 'text-white bg-gradient-to-r from-indigo-500 to-blue-500'
                  : 'text-gray-400 bg-white hover:bg-gray-50'
              }`}
            >
              <span>📄</span>
              지문 보기
            </button>
            <button
              onClick={() => setMobileView('question')}
              className={`flex-1 py-3 text-sm font-semibold text-center transition-all relative flex items-center justify-center gap-1.5 ${
                mobileView === 'question'
                  ? 'text-white bg-gradient-to-r from-violet-500 to-purple-500'
                  : 'text-gray-400 bg-white hover:bg-gray-50'
              }`}
            >
              <span>✏️</span>
              문제 풀기
              {isCurrentAnswered && <span className="w-2 h-2 bg-green-400 rounded-full inline-block ml-0.5"></span>}
            </button>
          </div>
        </div>
      )}

      {/* ===== Main Content Area ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Passage Section - 더 넓게, 글씨 크게 */}
        {currentQuestion.passage && (
          <div className={`
            ${mobileView === 'passage' ? 'flex' : 'hidden'} 
            sm:flex sm:w-[55%] w-full flex-col bg-gray-50 border-r border-gray-200
          `}>
            <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
              <div className="max-w-2xl ml-auto">
                <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-5">
                  문제 {currentQuestionIndex + 1} / {totalQuestions}
                </div>
                <div ref={passageRef} onMouseUp={handleTextSelection}>
                  {currentQuestion.passage.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-5 text-gray-800 leading-loose text-[18px] sm:text-[20px] italic select-text">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right: Question Section */}
        <div className={`
          ${currentQuestion.passage ? (mobileView === 'question' ? 'flex' : 'hidden') : 'flex'}
          sm:flex ${currentQuestion.passage ? 'sm:w-[45%]' : 'w-full'} w-full flex-col overflow-hidden
        `}>
          <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
            <div className="max-w-xl mx-auto">
              {/* No passage: show question number badge */}
              {!currentQuestion.passage && (
                <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-4">
                  문제 {currentQuestionIndex + 1} / {totalQuestions}
                </div>
              )}

              {/* Question header */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Question {currentQuestionIndex + 1}
              </h3>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8">
                {currentQuestion.question}
              </p>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const letter = getOptionLetter(index);
                  const isSelected = currentUserAnswer === index;
                  const isAnswered = isCurrentAnswered;
                  const isCorrectOption = index === currentQuestion.correctAnswer;
                  const isWrongSelected = isAnswered && isSelected && !isCorrectOption;

                  // 미니멀 스타일
                  let letterColor = 'text-gray-400 bg-gray-100';
                  let textColor = 'text-gray-700';
                  let rowStyle = 'border-transparent';
                  let icon = null;

                  if (isAnswered) {
                    if (isCorrectOption) {
                      letterColor = 'text-white bg-green-500';
                      textColor = 'text-gray-800 font-semibold';
                      rowStyle = 'border-green-200 bg-green-50/40';
                    } else if (isWrongSelected) {
                      letterColor = 'text-white bg-red-400';
                      textColor = 'text-gray-400 line-through';
                      rowStyle = 'border-transparent';
                    } else {
                      letterColor = 'text-gray-300 bg-gray-50';
                      textColor = 'text-gray-300';
                    }
                  } else if (isSelected) {
                    letterColor = 'text-white bg-blue-500';
                    textColor = 'text-gray-800';
                    rowStyle = 'border-blue-200';
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={isAnswered}
                      whileTap={!isAnswered ? { scale: 0.97 } : undefined}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all bg-white ${rowStyle} ${isAnswered ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${letterColor}`}>
                          {letter}
                        </span>
                        <span className={`flex-1 text-sm sm:text-base transition-colors ${textColor}`}>{option}</span>
                        {isAnswered && isCorrectOption && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                        {isWrongSelected && <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* ===== Feedback Section (after answering) ===== */}
              <AnimatePresence>
                {isCurrentAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 space-y-4"
                  >
                    {/* Correct / Incorrect — 최소화 */}
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                      isCurrentCorrect ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {isCurrentCorrect
                        ? <><CheckCircle2 className="w-3.5 h-3.5" /> 정답</>
                        : <><X className="w-3.5 h-3.5" /> 오답 · 정답 {getCorrectLetter(currentQuestion)}</>
                      }
                    </div>

                    {/* 해설 / 분석 / 단어 탭 — feedbackTabs 설정 기반 */}
                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                      <div className={`grid border-b border-gray-100`} style={{ gridTemplateColumns: `repeat(${feedbackTabs.length}, 1fr)` }}>
                        {feedbackTabs.map((tab, ti) => {
                          const isActive = (tab.key === 'explanation' && showInterpretation) ||
                                           (tab.key === 'analysis' && showAnalysis) ||
                                           (tab.key === 'vocab' && showVocab);
                          return (
                            <button
                              key={tab.key}
                              onClick={() => {
                                const nextAnalysis = tab.key === 'analysis' ? !showAnalysis : false;
                                const nextVocab = tab.key === 'vocab' ? !showVocab : false;
                                setShowInterpretation(tab.key === 'explanation' ? !showInterpretation : false);
                                setShowAnalysis(nextAnalysis);
                                setShowVocab(nextVocab);
                                if (nextAnalysis && !analysisCache[getEditKey(currentQuestion)]) fetchAnalysis(currentQuestion);
                                if (nextVocab) {
                                  setAiChatMessages([]);
                                  setAiChatInput('');
                                  window.dispatchEvent(new Event('aiChatOpen'));
                                } else {
                                  window.dispatchEvent(new Event('aiChatClose'));
                                }
                              }}
                              className={`py-3 flex flex-col items-center gap-1 transition-all text-xs font-semibold ${ti > 0 ? 'border-l border-gray-100' : ''} ${
                                isActive
                                  ? 'bg-gray-800 text-white'
                                  : 'bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-700'
                              }`}
                            >
                              <span className="text-base">{tab.emoji}</span>
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* 탭 콘텐츠 */}
                      <AnimatePresence>
                        {showInterpretation && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-amber-50 border-t border-amber-100">
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {currentQuestion.explanation || getInterpretation(currentQuestion)}
                              </p>
                            </div>
                          </motion.div>
                        )}
                        {showAnalysis && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-blue-50 border-t border-blue-100">
                              {analysisLoading && !analysisCache[getEditKey(currentQuestion)] ? (
                                <div className="flex items-center gap-2 text-sm text-blue-500">
                                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                  AI 분석 중...
                                </div>
                              ) : (
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                  {analysisCache[getEditKey(currentQuestion)] || getAnalysis(currentQuestion)}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                        {showVocab && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-gray-100 bg-gray-50">
                              {/* 채팅 메시지 */}
                              <div className="p-3 space-y-2 max-h-52 overflow-y-auto">
                                {aiChatMessages.length === 0 && (
                                  <p className="text-xs text-gray-400 text-center py-3">이 문제에 대해 무엇이든 물어보세요 🤖</p>
                                )}
                                {aiChatMessages.map((msg, i) => (
                                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                                      msg.role === 'user'
                                        ? 'bg-blue-500 text-white rounded-br-none'
                                        : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                                    }`}>
                                      {msg.text}
                                    </div>
                                  </div>
                                ))}
                                {aiChatLoading && (
                                  <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 px-3 py-2 rounded-xl rounded-bl-none flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                                    </div>
                                  </div>
                                )}
                              </div>
                              {/* 입력창 */}
                              <div className="flex items-center gap-2 px-3 pb-3">
                                <input
                                  type="text"
                                  value={aiChatInput}
                                  onChange={e => setAiChatInput(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && sendAiChat(aiChatInput, currentQuestion)}
                                  placeholder="질문을 입력하세요..."
                                  className="flex-1 text-xs bg-white border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:border-blue-400"
                                />
                                <button
                                  onClick={() => sendAiChat(aiChatInput, currentQuestion)}
                                  disabled={aiChatLoading || !aiChatInput.trim()}
                                  className="w-8 h-8 bg-blue-500 disabled:bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0"
                                >
                                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Bottom Navigation ===== */}
      <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 pb-20 sm:pb-4 [padding-bottom:calc(80px+env(safe-area-inset-bottom))] sm:[padding-bottom:1rem] flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Previous */}
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              currentQuestionIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전</span>
          </button>

          {/* Center: progress */}
          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-xs sm:text-sm font-semibold rounded-full border border-blue-200">
              {completedCount} / {totalQuestions} 완료
            </span>
          </div>

          {/* Next / Finish */}
          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={handleFinishTest}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              완료
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
