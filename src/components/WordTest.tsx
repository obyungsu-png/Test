import React from 'react';
import { Button } from './ui/button';
import { ChevronLeft, X, Eye } from 'lucide-react';
import { toast } from 'sonner';

// 사운드 효과 함수
const playSound = (isCorrect: boolean) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (isCorrect) {
      // 정답: 밝은 2음 (C5 -> E5)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else {
      // 오답: 큰 전기 버저 소리 (삐~)
      const duration = 0.6;
      
      // 메인 버저 (높은 주파수 사각파)
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(440, audioContext.currentTime);
      osc1.frequency.setValueAtTime(380, audioContext.currentTime + 0.15);
      osc1.frequency.setValueAtTime(320, audioContext.currentTime + 0.3);
      gain1.gain.setValueAtTime(0.5, audioContext.currentTime);
      gain1.gain.setValueAtTime(0.55, audioContext.currentTime + 0.1);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.start(audioContext.currentTime);
      osc1.stop(audioContext.currentTime + duration);
      
      // 노이즈 레이어 (전기 느낌)
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(180, audioContext.currentTime);
      osc2.frequency.setValueAtTime(150, audioContext.currentTime + 0.2);
      gain2.gain.setValueAtTime(0.35, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + duration);
      
      // 고주파 찌릿 레이어
      const osc3 = audioContext.createOscillator();
      const gain3 = audioContext.createGain();
      osc3.type = 'square';
      osc3.frequency.setValueAtTime(880, audioContext.currentTime);
      osc3.frequency.setValueAtTime(660, audioContext.currentTime + 0.15);
      gain3.gain.setValueAtTime(0.15, audioContext.currentTime);
      gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
      osc3.connect(gain3);
      gain3.connect(audioContext.destination);
      osc3.start(audioContext.currentTime);
      osc3.stop(audioContext.currentTime + 0.35);
    }
  } catch (error) {
    console.log('Audio playback not supported:', error);
  }
};

interface Word {
  word: string;
  definition: string;
  context?: string;
}

interface WordTestProps {
  selectedWordList: {
    words: Word[];
    title: string;
  };
  currentWordIndex: number;
  setCurrentWordIndex: (index: number) => void;
  testAnswers: {[key: number]: string};
  setTestAnswers: (answers: {[key: number]: string} | ((prev: {[key: number]: string}) => {[key: number]: string})) => void;
  showTestResult: {[key: number]: boolean};
  setShowTestResult: (results: {[key: number]: boolean} | ((prev: {[key: number]: boolean}) => {[key: number]: boolean})) => void;
  subjectiveAnswer: string;
  setSubjectiveAnswer: (answer: string) => void;
  setWordStudyMode: (mode: 'list' | 'flashcard' | 'test') => void;
  generateTestOptions: (definition: string, allWords: any[], currentIndex: number) => string[];
  handleTestAnswer: (questionIndex: number, answer: string, correctAnswer: string) => void;
  handleNextWord: () => void;
  handleRetryQuestion: (questionIndex: number) => void;
  incorrectQuestions: number[];
  setIncorrectQuestions: (questions: number[] | ((prev: number[]) => number[])) => void;
  testType: 'multiple' | 'subjective' | 'mixed';
  onBackToDownload: () => void;
  multipleChoiceFormat?: 'engToKor' | 'korToEng' | 'defToEng';
}

export function WordTest({
  selectedWordList,
  currentWordIndex,
  setCurrentWordIndex,
  testAnswers,
  setTestAnswers,
  showTestResult,
  setShowTestResult,
  subjectiveAnswer,
  setSubjectiveAnswer,
  setWordStudyMode,
  generateTestOptions,
  handleTestAnswer,
  handleNextWord,
  handleRetryQuestion,
  incorrectQuestions,
  setIncorrectQuestions,
  testType,
  onBackToDownload,
  multipleChoiceFormat = 'engToKor'
}: WordTestProps) {
  
  const [showHint, setShowHint] = React.useState(false);
  const [feedbackOverlay, setFeedbackOverlay] = React.useState<'correct' | 'wrong' | null>(null);
  
  // 오답 재시험 모드
  const [retryMode, setRetryMode] = React.useState(false);
  const [retryIndices, setRetryIndices] = React.useState<number[]>([]);
  const [retryPosition, setRetryPosition] = React.useState(0);
  
  // 리뷰 화면 닫기 추적 (해당 인덱스 문제를 건너뛰지 않도록)
  const [dismissedReviews, setDismissedReviews] = React.useState<Set<number>>(new Set());
  
  // Reset hint when moving to next question
  React.useEffect(() => {
    setShowHint(false);
  }, [currentWordIndex]);

  // 오답 재시험 모드: retryPosition이 변경되면 해당 인덱스로 이동
  React.useEffect(() => {
    if (retryMode && retryIndices.length > 0 && retryPosition < retryIndices.length) {
      const targetIdx = retryIndices[retryPosition];
      if (currentWordIndex !== targetIdx) {
        setCurrentWordIndex(targetIdx);
      }
    }
  }, [retryPosition, retryMode]);
  
  // Show feedback overlay when answer is given
  const showFeedback = (isCorrect: boolean) => {
    playSound(isCorrect);
    setFeedbackOverlay(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => setFeedbackOverlay(null), 1200);
  };
  
  // Calculate total questions and type based on testType
  const totalQuestions = testType === 'mixed' 
    ? selectedWordList.words.length * 2 // Each word twice: multiple choice + subjective
    : selectedWordList.words.length; // Each word once
    
  const shouldShowReview = !retryMode && currentWordIndex % 10 === 0 && currentWordIndex !== 0 && currentWordIndex < totalQuestions && !showTestResult[currentWordIndex] && !dismissedReviews.has(currentWordIndex);
  
  // Determine if current question is multiple choice based on testType
  let isMultipleChoice: boolean;
  let wordIdx: number;
  
  if (testType === 'multiple') {
    isMultipleChoice = true;
    wordIdx = currentWordIndex;
  } else if (testType === 'subjective') {
    isMultipleChoice = false;
    wordIdx = currentWordIndex;
  } else { // mixed
    isMultipleChoice = Math.floor(currentWordIndex / 10) % 2 === 0;
    wordIdx = Math.floor(currentWordIndex / 20) * 10 + (currentWordIndex % 10);
  }
  
  const currentWord = selectedWordList.words[wordIdx];
  
  // Helper function to get the correct word index for a given question index
  const getWordIdx = (questionIdx: number): number => {
    if (testType === 'mixed') {
      return Math.floor(questionIdx / 20) * 10 + (questionIdx % 10);
    }
    return questionIdx;
  };

  // 실시간 점수 계산
  const answeredCount = Object.keys(showTestResult).length;
  const correctCount = Object.keys(showTestResult).filter(idx => {
    const qWordIdx = getWordIdx(Number(idx));
    const word = selectedWordList.words[qWordIdx];
    return testAnswers[Number(idx)] === word?.word;
  }).length;
  const wrongCount = answeredCount - correctCount;
  const currentAccuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  
  // Review Screen
  if (shouldShowReview) {
    const roundStart = currentWordIndex - 10;
    const roundEnd = currentWordIndex;
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl">학습하기</h2>
          <button 
            onClick={onBackToDownload}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl mb-2">잘했어요. 점점 더 나아가고 있어요.</h2>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all" 
                  style={{ width: `${(currentWordIndex / totalQuestions) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                총 세트 전체률: <span className="text-green-600">{Math.round((currentWordIndex / totalQuestions) * 100)}%</span>
              </span>
            </div>
          </div>

          <h3 className="text-lg mb-4">이 라운드에서 학습한 단어</h3>
          <div className="space-y-3 mb-6">
            {Array.from({ length: 10 }).map((_, idx) => {
              const questionIdx = roundStart + idx;
              const qWordIdx = getWordIdx(questionIdx);
              const word = selectedWordList.words[qWordIdx];
              
              if (!word) return null;
              
              return (
                <div key={questionIdx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-gray-800">{word.word}</span>
                    <span className="text-gray-500 text-sm">{word.definition}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => {
                // 리뷰 닫고 해당 인덱스의 문제를 정상 표시 (문제를 건너뛰지 않음)
                setDismissedReviews(prev => new Set([...prev, currentWordIndex]));
              }}
              className="px-8 py-3 rounded-lg text-white hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#4F46E5' }}
            >
              계속
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Test Complete Screen
  if (!currentWord || currentWordIndex >= totalQuestions) {
    // Calculate results
    const correctAnswers = Object.keys(showTestResult).filter(idx => {
      const qWordIdx = getWordIdx(Number(idx));
      const word = selectedWordList.words[qWordIdx];
      return testAnswers[Number(idx)] === word?.word;
    }).length;
    const totalAnswered = Object.keys(showTestResult).length;
    const incorrectAnswers = totalAnswered - correctAnswers;
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
    
    const handleDownloadResults = () => {
      const results = {
        testTitle: selectedWordList.title,
        testDate: new Date().toLocaleDateString('ko-KR'),
        totalQuestions: totalAnswered,
        correctAnswers,
        incorrectAnswers,
        accuracy: `${accuracy}%`,
        words: selectedWordList.words.map((word: any, idx: number) => ({
          word: word.word,
          definition: word.definition,
          context: word.context,
          multipleChoiceResult: showTestResult[idx] ? (testAnswers[idx] === word.word ? '정답' : '오답') : '미응답',
          subjectiveResult: showTestResult[idx + 10] ? (testAnswers[idx + 10] === word.word ? '정답' : '오답') : '미응답'
        }))
      };
      
      const dataStr = JSON.stringify(results, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `단어테스트_결과_${new Date().toLocaleDateString('ko-KR')}.json`;
      link.click();
      URL.revokeObjectURL(url);
    };
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl mb-3">🎉 테스트 완료!</h2>
            <p className="text-gray-600">모든 단어 학습을 완료했습니다.</p>
          </div>
          
          {/* Score Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg mb-4 text-center">점수 요약</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl mb-1">{accuracy}%</div>
                <div className="text-sm text-gray-600">정답률</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-green-600 mb-1">{correctAnswers}</div>
                <div className="text-sm text-gray-600">정답</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-orange-600 mb-1">{incorrectAnswers}</div>
                <div className="text-sm text-gray-600">오답</div>
              </div>
            </div>
            <div className="text-center text-sm text-gray-500">
              총 {totalAnswered}문제 응답
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  // 다시보기 - 모든 문제 초기화
                  setCurrentWordIndex(0);
                  setTestAnswers({});
                  setShowTestResult({});
                  setSubjectiveAnswer('');
                  setIncorrectQuestions([]);
                  setDismissedReviews(new Set());
                  toast.success("테스트를 처음부터 다시 시작합니다!");
                }}
                className="w-full px-6 py-3 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                다시보기
              </Button>
              
              <Button
                onClick={() => {
                  // 틀린것만 보기
                  if (incorrectQuestions.length === 0) {
                    toast.info("모든 문제를 맞혔습니다! 🎉");
                    return;
                  }
                  
                  // 오답 재시험 모드 활성화
                  const sortedRetryIndices = [...incorrectQuestions].sort((a, b) => a - b);
                  setRetryIndices(sortedRetryIndices);
                  setRetryPosition(0);
                  setRetryMode(true);
                  
                  // 틀린 문제의 답안만 초기화
                  const newAnswers = { ...testAnswers };
                  const newResults = { ...showTestResult };
                  incorrectQuestions.forEach(idx => {
                    delete newAnswers[idx];
                    delete newResults[idx];
                  });
                  setTestAnswers(newAnswers);
                  setShowTestResult(newResults);
                  setIncorrectQuestions([]);
                  
                  // 첫 번째 틀린 문제로 이동
                  setCurrentWordIndex(sortedRetryIndices[0]);
                  setSubjectiveAnswer('');
                  
                  toast.success(`틀린 ${sortedRetryIndices.length}개 문제를 다시 풀어보세요!`);
                }}
                className="w-full px-6 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                disabled={incorrectQuestions.length === 0}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                틀린것만 다시 풀기 ({incorrectQuestions.length})
              </Button>
            </div>
            
            <Button
              onClick={() => {
                onBackToDownload();
                setCurrentWordIndex(0);
                setTestAnswers({});
                setShowTestResult({});
                setSubjectiveAnswer('');
              }}
              className="w-full px-8 py-3 rounded-lg text-white hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#4F46E5' }}
            >
              다운로드 화면으로 돌아가기
            </Button>
            
            <Button
              onClick={handleDownloadResults}
              variant="outline"
              className="w-full px-6 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              학습 결과 다운로드 (JSON)
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Regular Question
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1E3A8A]">{selectedWordList.title}</h2>
          {retryMode && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                오답 재시험 ({retryPosition + 1}/{retryIndices.length})
              </span>
              <button
                onClick={() => {
                  setRetryMode(false);
                  setRetryIndices([]);
                  setRetryPosition(0);
                  setCurrentWordIndex(totalQuestions);
                }}
                className="text-xs text-gray-500 hover:text-red-500 underline"
              >
                재시험 종료
              </button>
            </div>
          )}
        </div>
        <button 
          onClick={onBackToDownload}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1">
          {retryMode ? (
            <>
              <span className="text-sm text-orange-600">오답 재시험 {retryPosition + 1} / {retryIndices.length}</span>
              <span className="text-sm text-orange-600 font-medium">{Math.round(((retryPosition + 1) / retryIndices.length) * 100)}%</span>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-600">문제 {currentWordIndex + 1} / {totalQuestions}</span>
              <span className="text-sm text-[#1E3A8A] font-medium">{Math.round(((currentWordIndex + 1) / totalQuestions) * 100)}%</span>
            </>
          )}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${retryMode ? 'bg-orange-500' : 'bg-[#1E3A8A]'}`}
            style={{ width: retryMode 
              ? `${((retryPosition + 1) / retryIndices.length) * 100}%` 
              : `${((currentWordIndex + 1) / totalQuestions) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* 실시간 점수 표시 */}
      {answeredCount > 0 && (
        <div className="mb-6 flex items-center justify-center gap-6 bg-white border border-gray-200 rounded-xl py-2.5 px-6 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-gray-500">정답률</span>
            <span className={`text-lg font-bold ${currentAccuracy >= 80 ? 'text-green-600' : currentAccuracy >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{currentAccuracy}%</span>
          </div>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">{correctCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600">{wrongCount}</span>
          </div>
          <div className="w-px h-5 bg-gray-200" />
          <span className="text-xs text-gray-400">{answeredCount}/{totalQuestions}</span>
        </div>
      )}
      
      {/* Test Card - Multiple Choice */}
      {isMultipleChoice ? (
        <div className="bg-gray-50 rounded-2xl p-6 md:p-10 mb-6">
          {/* Question prompt */}
          <p className="text-lg md:text-xl font-semibold text-[#1E3A8A] mb-6">
            {multipleChoiceFormat === 'engToKor'
              ? '다음 영어 단어의 한글 뜻을 고르세요:'
              : multipleChoiceFormat === 'korToEng'
              ? '다음 한글 뜻에 해당하는 영어 단어를 고르세요:'
              : '다음 영영풀이에 해당하는 영어 단어를 고르세요:'}
          </p>

          {/* Word display box */}
          <div className="border-2 border-[#1E3A8A] rounded-xl p-6 mb-8 bg-white text-center">
            <span className="text-2xl md:text-3xl font-bold text-gray-800">
              {multipleChoiceFormat === 'engToKor'
                ? currentWord?.word
                : multipleChoiceFormat === 'korToEng'
                ? currentWord?.definition
                : (currentWord?.context || currentWord?.definition)}
            </span>
            {multipleChoiceFormat === 'defToEng' && currentWord?.context && (
              <p className="text-sm text-gray-500 mt-2">(영영풀이)</p>
            )}
          </div>

          {/* Answer Options - Vertical list */}
          <div className="space-y-3">
            {generateTestOptions(
              currentWord?.definition,
              selectedWordList.words,
              wordIdx
            ).map((option, idx) => {
              const isSelected = testAnswers[currentWordIndex] === option;
              const isCorrect = option === currentWord?.word;
              const showResult = showTestResult[currentWordIndex];
              const isWrongAnswer = showResult && testAnswers[currentWordIndex] !== currentWord?.word;
              // Display based on format
              const optionWord = selectedWordList.words.find(w => w.word === option);
              const optionDisplay = multipleChoiceFormat === 'engToKor'
                ? (optionWord?.definition || option)
                : option; // korToEng, defToEng: show English word directly
              
              return (
                <button
                  key={idx}
                  onClick={() => {
                    handleTestAnswer(currentWordIndex, option, currentWord?.word);
                    showFeedback(isCorrect);
                  }}
                  disabled={showResult}
                  className={`w-full p-4 text-left rounded-xl transition-all ${
                    showResult && isSelected && isCorrect
                      ? 'border-2 border-green-500 bg-green-50'
                      : showResult && isSelected && !isCorrect
                      ? 'border-2 border-red-500 bg-red-50'
                      : showResult
                      ? 'border-2 border-gray-200 bg-white opacity-60'
                      : isSelected
                      ? 'border-2 border-[#1E3A8A] bg-blue-50'
                      : 'border-2 border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${
                      showResult && isSelected && isCorrect ? 'text-green-600'
                      : showResult && isSelected && !isCorrect ? 'text-red-600'
                      : 'text-gray-500'
                    }`}>
                      {idx + 1}.
                    </span>
                    <span className="text-base text-gray-800">{optionDisplay}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showTestResult[currentWordIndex] && (
            <div className="mt-5 md:block hidden">
              {testAnswers[currentWordIndex] === currentWord?.word ? (
                <p className="text-green-600 font-medium text-center text-lg">{['잘했어요!', '훌륭해요!', '정답입니다!'][currentWordIndex % 3]}</p>
              ) : (
                <div className="mt-3 p-4 bg-gray-100 rounded-xl border border-gray-200">
                  <p className="text-red-600 font-semibold text-center mb-2">오답입니다</p>
                  <div className="text-center">
                    <span className="text-sm text-gray-500">정답: </span>
                    <span className="text-base font-bold text-[#1E3A8A]">
                      {multipleChoiceFormat === 'engToKor' ? currentWord?.definition : currentWord?.word}
                    </span>
                    {multipleChoiceFormat === 'engToKor' && (
                      <span className="text-sm text-gray-400 ml-2">({currentWord?.word})</span>
                    )}
                    {multipleChoiceFormat !== 'engToKor' && (
                      <span className="text-sm text-gray-400 ml-2">({currentWord?.definition})</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Subjective Question */
        <div className="bg-gray-50 rounded-2xl p-6 md:p-10 mb-6">
          <p className="text-lg md:text-xl font-semibold text-[#1E3A8A] mb-6">
            다음 한글 뜻에 해당하는 영어 단어를 입력하세요:
          </p>

          {/* Definition display box */}
          <div className="border-2 border-[#1E3A8A] rounded-xl p-6 mb-8 bg-white text-center">
            <span className="text-2xl md:text-3xl font-bold text-gray-800">
              {currentWord?.definition}
            </span>
          </div>

          {showTestResult[currentWordIndex] ? (
            <>
              {testAnswers[currentWordIndex] === currentWord?.word ? (
                <div className="text-center">
                  <div className="p-4 rounded-xl border-2 border-green-500 bg-green-50 mb-3">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-800 font-medium">{currentWord?.word}</span>
                  </div>
                  <p className="text-green-600 font-medium">{['잘했어요!', '훌륭해요!', '정답입니다!'][currentWordIndex % 3]}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border-2 border-red-500 bg-red-50">
                    <span className="text-red-600 mr-2">✕</span>
                    <span className="text-gray-800 line-through">{testAnswers[currentWordIndex]}</span>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-xl border border-gray-200">
                    <p className="text-red-600 font-semibold text-center mb-1">오답입니다</p>
                    <div className="text-center">
                      <span className="text-sm text-gray-500">정답: </span>
                      <span className="text-base font-bold text-[#1E3A8A]">{currentWord?.word}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  value={subjectiveAnswer}
                  onChange={(e) => setSubjectiveAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && subjectiveAnswer.trim()) {
                      handleTestAnswer(currentWordIndex, subjectiveAnswer.trim(), currentWord?.word);
                      showFeedback(subjectiveAnswer.trim() === currentWord?.word);
                      setShowHint(false);
                    }
                  }}
                  placeholder="답을 입력하세요"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
                />
                {showHint && (
                  <div className="mt-2 text-sm text-gray-500 pl-2">
                    힌트: <span className="font-mono font-medium text-[#1E3A8A]">{currentWord?.word?.slice(0, (currentWord?.word?.length || 0) < 6 ? Math.min(2, (currentWord?.word?.length || 1) - 1) : Math.min(3, currentWord?.word?.length || 0))}___</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-2 px-5 py-3 text-sm text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  <Eye className="w-4 h-4" />
                  힌트
                </button>
                <button
                  onClick={() => {
                    if (subjectiveAnswer.trim()) {
                      handleTestAnswer(currentWordIndex, subjectiveAnswer.trim(), currentWord?.word);
                      showFeedback(subjectiveAnswer.trim() === currentWord?.word);
                      setShowHint(false);
                    }
                  }}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors text-center ${
                    subjectiveAnswer.trim()
                      ? 'bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!subjectiveAnswer.trim()}
                >
                  답변 제출
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Navigation Buttons - 이전 / 다음 */}
      <div className="flex justify-between items-center mt-6 gap-3">
        <button
          onClick={() => {
            if (retryMode) {
              if (retryPosition > 0) {
                setRetryPosition(retryPosition - 1);
                setSubjectiveAnswer('');
              }
            } else {
              if (currentWordIndex > 0) {
                setCurrentWordIndex(currentWordIndex - 1);
                setSubjectiveAnswer('');
              }
            }
          }}
          disabled={retryMode ? retryPosition === 0 : currentWordIndex === 0}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border-2 font-medium transition-colors text-sm sm:text-base min-w-[80px] sm:min-w-[100px] ${
            (retryMode ? retryPosition === 0 : currentWordIndex === 0) 
              ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          &lt; 이전
        </button>
        <button
          onClick={() => {
            if (retryMode) {
              if (retryPosition < retryIndices.length - 1) {
                setRetryPosition(retryPosition + 1);
                setSubjectiveAnswer('');
              } else {
                // 오답 재시험 완료 → 결과 화면으로
                setRetryMode(false);
                setRetryIndices([]);
                setRetryPosition(0);
                setCurrentWordIndex(totalQuestions);
              }
            } else {
              if (currentWordIndex < totalQuestions - 1) {
                handleNextWord();
              } else {
                setCurrentWordIndex(totalQuestions);
              }
            }
          }}
          disabled={!showTestResult[currentWordIndex]}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-w-[80px] sm:min-w-[100px] ${
            !showTestResult[currentWordIndex]
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : retryMode
              ? 'bg-orange-600 text-white hover:bg-orange-700'
              : 'bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90'
          }`}
        >
          {retryMode && retryPosition >= retryIndices.length - 1 ? '완료' : '다음'} &gt;
        </button>
      </div>

      {/* Feedback Overlay - Big Circle with X or Checkmark */}
      {feedbackOverlay && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
          <div
            className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center shadow-2xl ${
              feedbackOverlay === 'correct' ? 'bg-[#4CAF50]' : 'bg-[#EF4444]'
            }`}
            style={{
              animation: 'feedbackPop 1.2s ease-out forwards',
            }}
          >
            {feedbackOverlay === 'correct' ? (
              <svg className="w-20 h-20 md:w-24 md:h-24 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-20 h-20 md:w-24 md:h-24 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes feedbackPop {
          0% { transform: scale(0.3); opacity: 0; }
          20% { transform: scale(1.15); opacity: 1; }
          40% { transform: scale(0.95); opacity: 1; }
          60% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}