import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Check, X, ChevronRight, ChevronDown, ChevronUp, RotateCcw, AlertCircle, Trophy, BookOpen, FileText, Target, Zap, ChevronLeft } from "lucide-react";
import type { ProblemItem, SentenceItem, ParagraphItem, LessonData } from "./types";

interface MockTestProps {
  problems: ProblemItem[];
  sentences?: SentenceItem[];
  paragraphs?: ParagraphItem[];
  lessonData?: LessonData;
  onComplete: (score: number, total: number) => void;
}

type ReportTab = 'summary' | 'wrong' | 'all';

export function MockTest({ problems, sentences = [], paragraphs = [], lessonData, onComplete }: MockTestProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [testComplete, setTestComplete] = useState(false);
  const [showPassage, setShowPassage] = useState(false);
  const [reportTab, setReportTab] = useState<ReportTab>('summary');
  // Retry mode: only wrong questions
  const [retryMode, setRetryMode] = useState(false);
  const [retryProblems, setRetryProblems] = useState<ProblemItem[]>([]);
  const [retryAnswers, setRetryAnswers] = useState<Record<string, string>>({});
  const [retryComplete, setRetryComplete] = useState(false);
  const [retryShowResult, setRetryShowResult] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeProblems = retryMode ? retryProblems : problems;
  const activeAnswers = retryMode ? retryAnswers : answers;
  const current = activeProblems[currentIdx];
  const hasPassage = sentences.length > 0;

  const sentencesByParagraph = paragraphs.length > 0
    ? paragraphs.map(p => ({ paragraph: p, sentences: sentences.filter(s => s.paragraphId === p.id) }))
    : [{ paragraph: null as ParagraphItem | null, sentences }];

  // Timer
  useEffect(() => {
    if (!isTimerRunning || testComplete) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, testComplete]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    if (retryMode) {
      setRetryAnswers(prev => ({ ...prev, [current.id]: answer }));
    } else {
      setAnswers(prev => ({ ...prev, [current.id]: answer }));
    }
  };

  const isAnswered = (id: string) => {
    const a = retryMode ? retryAnswers[id] : answers[id];
    return a !== undefined && a !== '';
  };

  const checkAnswer = (id: string, ans?: Record<string, string>) => {
    const problem = problems.find(p => p.id === id) || retryProblems.find(p => p.id === id);
    if (!problem) return false;
    const source = ans || (retryMode ? retryAnswers : answers);
    const userAnswer = source[id]?.trim().toLowerCase() || '';
    const correctAnswer = problem.answer.trim().toLowerCase();
    if (['multiple_choice', 'grammar_fix', 'sentence_insert', 'content_match'].includes(problem.type)) {
      return userAnswer === correctAnswer || userAnswer === correctAnswer.charAt(0).toLowerCase();
    }
    return userAnswer === correctAnswer;
  };

  const getScore = () => problems.filter(p => checkAnswer(p.id, answers)).length;

  const wrongProblems = useMemo(() => {
    if (!testComplete) return [];
    return problems.filter(p => !checkAnswer(p.id, answers));
  }, [testComplete, answers]);

  const correctProblems = useMemo(() => {
    if (!testComplete) return [];
    return problems.filter(p => checkAnswer(p.id, answers));
  }, [testComplete, answers]);

  // Per-type score breakdown
  const typeBreakdown = useMemo(() => {
    if (!testComplete) return [];
    const types: Record<string, { total: number; correct: number; label: string }> = {};
    const typeLabels: Record<string, string> = {
      multiple_choice: '객관식', grammar_fix: '어법', sentence_insert: '문장삽입',
      content_match: '내용일치', short_answer: '서술형'
    };
    problems.forEach(p => {
      if (!types[p.type]) types[p.type] = { total: 0, correct: 0, label: typeLabels[p.type] || p.type };
      types[p.type].total++;
      if (checkAnswer(p.id, answers)) types[p.type].correct++;
    });
    return Object.values(types);
  }, [testComplete, answers]);

  const finishTest = () => {
    setIsTimerRunning(false);
    setTestComplete(true);
    setReportTab('summary');
    const score = getScore();
    onComplete(score, problems.length);
  };

  const goNext = () => {
    if (currentIdx < activeProblems.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setShowResult(false);
      setRetryShowResult(false);
    }
  };
  const goPrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setShowResult(false);
      setRetryShowResult(false);
    }
  };

  const restart = () => {
    setCurrentIdx(0);
    setAnswers({});
    setShowResult(false);
    setTimer(0);
    setIsTimerRunning(true);
    setTestComplete(false);
    setShowPassage(false);
    setRetryMode(false);
    setRetryProblems([]);
    setRetryAnswers({});
    setRetryComplete(false);
    setRetryShowResult(false);
    setReportTab('summary');
  };

  const startRetry = () => {
    const wrongs = problems.filter(p => !checkAnswer(p.id, answers));
    if (wrongs.length === 0) return;
    setRetryProblems(wrongs);
    setRetryAnswers({});
    setRetryMode(true);
    setRetryComplete(false);
    setRetryShowResult(false);
    setCurrentIdx(0);
    setShowResult(false);
  };

  const finishRetry = () => {
    setRetryComplete(true);
  };

  const retryScore = useMemo(() => {
    if (!retryComplete) return 0;
    return retryProblems.filter(p => checkAnswer(p.id, retryAnswers)).length;
  }, [retryComplete, retryAnswers]);

  // Passage Panel
  const PassagePanel = () => {
    if (!hasPassage) return null;
    return (
      <div className="mb-5">
        <button
          onClick={() => setShowPassage(!showPassage)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
            showPassage ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300'
          }`}
        >
          <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> 본문 보기 <span className="text-xs font-normal text-gray-400">({sentences.length}문장)</span></div>
          {showPassage ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <AnimatePresence>
          {showPassage && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-2 bg-white border border-gray-200 rounded-xl max-h-[320px] overflow-y-auto">
                <div className="p-4 space-y-4">
                  {sentencesByParagraph.map((group, gi) => (
                    <div key={gi}>
                      {group.paragraph && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{group.paragraph.id}연</span>
                          <span className="text-xs text-gray-400">{group.paragraph.topic}</span>
                        </div>
                      )}
                      <div className="space-y-2">
                        {group.sentences.map(s => (
                          <div key={s.id}><p className={`text-sm leading-relaxed ${s.importance === 'high' ? 'text-gray-800 font-medium' : 'text-gray-700'}`}><span className="text-xs text-gray-300 mr-1.5">{s.id}.</span>{s.english}</p><p className="text-xs text-gray-400 mt-0.5 pl-4">{s.korean}</p></div>
                        ))}
                      </div>
                      {gi < sentencesByParagraph.length - 1 && <div className="border-t border-dashed border-gray-100 mt-3" />}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ==================== RETRY COMPLETE ====================
  if (retryMode && retryComplete) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto text-center py-12">
        <div className="w-24 h-24 mx-auto rounded-full bg-indigo-100 flex items-center justify-center mb-5">
          <RotateCcw className="w-12 h-12 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">오답 재풀이 완료!</h2>
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-indigo-600">{retryScore}<span className="text-xl text-gray-400">/{retryProblems.length}</span></p>
            <p className="text-sm text-gray-500">정답</p>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-700">{Math.round((retryScore / retryProblems.length) * 100)}%</p>
            <p className="text-sm text-gray-500">정답률</p>
          </div>
        </div>
        {/* Show still-wrong items */}
        {retryProblems.filter(p => !checkAnswer(p.id, retryAnswers)).length > 0 && (
          <div className="text-left mb-6">
            <h3 className="text-sm font-bold text-red-600 mb-3">아직 틀린 문제</h3>
            <div className="space-y-2">
              {retryProblems.filter(p => !checkAnswer(p.id, retryAnswers)).map((p, i) => (
                <div key={p.id} className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm">
                  <p className="text-gray-700 font-medium">{i + 1}. {p.question.slice(0, 80)}...</p>
                  <p className="text-red-500 mt-1">내 답: {retryAnswers[p.id] || '(미답)'} → 정답: {p.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => { setRetryMode(false); setReportTab('summary'); }} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200">
            리포트로 돌아가기
          </button>
          <button onClick={restart} className="flex-1 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> 전체 다시 풀기
          </button>
        </div>
      </motion.div>
    );
  }

  // ==================== REPORT SCREEN ====================
  if (testComplete && !retryMode) {
    const score = getScore();
    const percentage = Math.round((score / problems.length) * 100);
    const isPerfect = score === problems.length;
    const pointPer = problems.length > 0 ? Math.round(100 / problems.length) : 0;

    return (
      <div className="max-w-4xl mx-auto">
        {/* Report Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${isPerfect ? 'bg-yellow-100' : percentage >= 70 ? 'bg-green-100' : 'bg-red-100'}`}>
            {isPerfect ? <Trophy className="w-12 h-12 text-yellow-500" /> : percentage >= 70 ? <Check className="w-12 h-12 text-green-500" /> : <AlertCircle className="w-12 h-12 text-red-400" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{isPerfect ? '110점 도전권 획득!' : percentage >= 70 ? '잘했어요!' : '좀 더 노력해봐요!'}</h2>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center"><p className="text-4xl font-bold text-cyan-600">{score}<span className="text-lg text-gray-400">/{problems.length}</span></p><p className="text-xs text-gray-500">정답</p></div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center"><p className="text-4xl font-bold text-gray-700">{percentage}%</p><p className="text-xs text-gray-500">정답률</p></div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center"><p className="text-4xl font-bold text-gray-700">{formatTime(timer)}</p><p className="text-xs text-gray-500">소요시간</p></div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center"><p className="text-4xl font-bold text-orange-500">{score * pointPer}</p><p className="text-xs text-gray-500">예상 점수</p></div>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden mt-5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, delay: 0.3 }}
              className={`h-full rounded-full ${isPerfect ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : percentage >= 70 ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`} />
          </div>
        </motion.div>

        {/* Report Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
          {([
            { key: 'summary' as ReportTab, label: '유형별 분석', icon: Target },
            { key: 'wrong' as ReportTab, label: `오답 노트 (${wrongProblems.length})`, icon: X },
            { key: 'all' as ReportTab, label: '전체 문제', icon: FileText },
          ]).map(t => (
            <button key={t.key} onClick={() => setReportTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all ${reportTab === t.key ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>

        {/* Summary Tab */}
        {reportTab === 'summary' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {typeBreakdown.map((tb, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center">
                  <span className="text-lg font-bold text-cyan-600">{tb.correct}/{tb.total}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-700">{tb.label}</p>
                  <div className="h-2 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${tb.correct === tb.total ? 'bg-green-400' : tb.correct > 0 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${(tb.correct / tb.total) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-500">{Math.round((tb.correct / tb.total) * 100)}%</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Wrong Tab */}
        {reportTab === 'wrong' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {wrongProblems.length === 0 ? (
              <div className="text-center py-12"><Check className="w-12 h-12 text-green-400 mx-auto mb-3" /><p className="text-lg font-bold text-green-600">모두 맞았습니다!</p></div>
            ) : (
              <div className="space-y-4">
                {wrongProblems.map((problem, idx) => {
                  const userAnswer = answers[problem.id] || '(미답)';
                  const typeLabel = { multiple_choice: '객관식', grammar_fix: '어법', sentence_insert: '문장삽입', content_match: '내용일치', short_answer: '서술형' }[problem.type] || problem.type;
                  return (
                    <div key={problem.id} className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                            {problems.indexOf(problem) + 1}
                          </span>
                          <div className="flex-1">
                            <span className="text-xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">{typeLabel}</span>
                            <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{problem.question}</p>
                          </div>
                        </div>
                        {problem.options && (
                          <div className="ml-11 space-y-1 mb-3">
                            {problem.options.map((opt, i) => (
                              <p key={i} className={`text-sm px-3 py-1.5 rounded-lg ${
                                opt.charAt(0) === problem.answer ? 'bg-green-100 text-green-700 font-bold' :
                                opt.charAt(0).toLowerCase() === userAnswer.toLowerCase() ? 'bg-red-100 text-red-600 line-through' : 'text-gray-500'
                              }`}>{opt}</p>
                            ))}
                          </div>
                        )}
                        <div className="ml-11 space-y-1">
                          <p className="text-sm text-red-500">내 답: <strong>{userAnswer}</strong></p>
                          <p className="text-sm text-green-600 font-bold">정답: {problem.answer}</p>
                        </div>
                        <div className="ml-11 mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                          <p className="text-xs font-bold text-amber-600 mb-1">해설</p>
                          <p className="text-sm text-amber-800">{problem.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* All Questions Tab */}
        {reportTab === 'all' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PassagePanel />
            <div className="space-y-3">
              {problems.map((problem, idx) => {
                const correct = checkAnswer(problem.id, answers);
                const userAnswer = answers[problem.id] || '(미답)';
                return (
                  <div key={problem.id} className={`p-4 rounded-xl border ${correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-2">{problem.question}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs">
                          <span className={correct ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>내 답: {userAnswer}</span>
                          {!correct && <span className="text-green-600 font-bold">정답: {problem.answer}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          {wrongProblems.length > 0 && (
            <button onClick={startRetry} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" /> 오답 다시 풀기 ({wrongProblems.length}문제)
            </button>
          )}
          <button onClick={restart} className="flex-1 py-3.5 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> 전체 다시 풀기
          </button>
        </div>
      </div>
    );
  }

  // ==================== TEST MODE ====================
  if (!current) return null;
  const activeShowResult = retryMode ? retryShowResult : showResult;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Timer & Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {retryMode && <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">오답 재풀이</span>}
          <Clock className="w-5 h-5 text-gray-500" />
          <span className="text-xl font-mono font-bold text-gray-700">{formatTime(timer)}</span>
        </div>
        <span className="text-base font-medium text-gray-500">{currentIdx + 1} / {activeProblems.length}</span>
      </div>

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
        <motion.div className={`h-full rounded-full ${retryMode ? 'bg-gradient-to-r from-indigo-400 to-indigo-600' : 'bg-gradient-to-r from-cyan-400 to-cyan-600'}`}
          animate={{ width: `${((currentIdx + 1) / activeProblems.length) * 100}%` }} />
      </div>

      <PassagePanel />

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div key={current.id + (retryMode ? '-retry' : '')} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 min-h-[400px]">
          <span className={`inline-block px-3.5 py-1.5 rounded-full text-sm font-bold mb-5 ${
            current.type === 'multiple_choice' ? 'bg-blue-100 text-blue-700' :
            current.type === 'grammar_fix' ? 'bg-purple-100 text-purple-700' :
            current.type === 'sentence_insert' ? 'bg-amber-100 text-amber-700' :
            current.type === 'content_match' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {current.type === 'multiple_choice' ? '객관식' : current.type === 'grammar_fix' ? '어법' : current.type === 'sentence_insert' ? '문장삽입' : current.type === 'content_match' ? '내용일치' : '서술형'}
          </span>

          <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line mb-6">{current.question}</p>

          {current.options ? (
            <div className="space-y-3">
              {current.options.map((opt, i) => {
                const letter = opt.charAt(0);
                const isSelected = activeAnswers[current.id] === letter;
                const isCorrectOpt = activeShowResult && letter === current.answer;
                const isWrongOpt = activeShowResult && isSelected && letter !== current.answer;
                return (
                  <button key={i} onClick={() => !activeShowResult && handleAnswer(letter)} disabled={activeShowResult}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 text-base transition-all ${
                      activeShowResult
                        ? isCorrectOpt ? 'border-green-400 bg-green-50 text-green-700' : isWrongOpt ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-100 bg-gray-50 text-gray-500'
                        : isSelected ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                    }`}>
                    <span className="font-medium">{opt}</span>
                    {activeShowResult && isCorrectOpt && <Check className="inline w-5 h-5 ml-2 text-green-500" />}
                    {activeShowResult && isWrongOpt && <X className="inline w-5 h-5 ml-2 text-red-500" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <input ref={inputRef} type="text" value={activeAnswers[current.id] || ''} onChange={e => handleAnswer(e.target.value)} disabled={activeShowResult}
                placeholder="답을 입력하세요..." className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-cyan-400 disabled:bg-gray-50" />
              {activeShowResult && (
                <div className={`mt-3 p-3 rounded-lg text-base ${checkAnswer(current.id) ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                  {checkAnswer(current.id) ? '정답!' : `오답 - 정답: ${current.answer}`}
                </div>
              )}
            </div>
          )}

          {activeShowResult && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-sm font-bold text-amber-600 mb-2">해설</p>
              <p className="text-base text-amber-800">{current.explanation}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button onClick={goPrev} disabled={currentIdx === 0} className="px-5 py-3 text-base font-medium text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-30">이전</button>
        <div className="flex gap-3">
          {!activeShowResult ? (
            <button onClick={() => retryMode ? setRetryShowResult(true) : setShowResult(true)} disabled={!isAnswered(current.id)}
              className={`px-6 py-3 rounded-xl text-base font-bold transition-colors ${isAnswered(current.id) ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              정답 확인
            </button>
          ) : currentIdx === activeProblems.length - 1 ? (
            <button onClick={retryMode ? finishRetry : finishTest} className="px-6 py-3 bg-cyan-600 text-white rounded-xl text-base font-bold hover:bg-cyan-700">
              {retryMode ? '재풀이 완료' : '시험 완료'}
            </button>
          ) : (
            <button onClick={goNext} className="px-6 py-3 bg-cyan-600 text-white rounded-xl text-base font-bold hover:bg-cyan-700 flex items-center gap-1.5">
              다음 <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Question Nav Dots */}
      <div className="flex flex-wrap gap-2 mt-6 justify-center">
        {activeProblems.map((p, i) => (
          <button key={p.id} onClick={() => { setCurrentIdx(i); setShowResult(false); setRetryShowResult(false); }}
            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
              i === currentIdx ? (retryMode ? 'bg-indigo-600 text-white' : 'bg-cyan-600 text-white') :
              isAnswered(p.id) ? (retryMode ? 'bg-indigo-100 text-indigo-600' : 'bg-cyan-100 text-cyan-600') : 'bg-gray-100 text-gray-400'
            }`}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
