import React from 'react';
import { Button } from './ui/button';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// 사운드 효과 함수
const playSound = (isCorrect: boolean) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (isCorrect) {
      // 정답: 밝은 2음 (C5 -> E5)
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else {
      // 오답: 낮은 단음
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
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
  onBackToDownload
}: WordTestProps) {
  
  const [showHint, setShowHint] = React.useState(false);
  
  // Reset hint when moving to next question
  React.useEffect(() => {
    setShowHint(false);
  }, [currentWordIndex]);
  
  // Calculate total questions and type based on testType
  const totalQuestions = testType === 'mixed' 
    ? selectedWordList.words.length * 2 // Each word twice: multiple choice + subjective
    : selectedWordList.words.length; // Each word once
    
  const shouldShowReview = currentWordIndex % 10 === 0 && currentWordIndex !== 0 && currentWordIndex < totalQuestions && !showTestResult[currentWordIndex];
  
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
              let qWordIdx: number;
              if (testType === 'mixed') {
                qWordIdx = Math.floor(questionIdx / 20) * 10 + (questionIdx % 10);
              } else {
                qWordIdx = questionIdx;
              }
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
                // Move to next question - don't mark current as answered
                handleNextWord();
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
      const qWordIdx = Math.floor(Number(idx) / 20) * 10 + (Number(idx) % 10);
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
                  
                  // 틀린 문제만 필터링하여 새로운 테스트 시작
                  const firstIncorrectIndex = Math.min(...incorrectQuestions);
                  setCurrentWordIndex(firstIncorrectIndex);
                  
                  // 틀린 문제의 답안만 초기화
                  const newAnswers = { ...testAnswers };
                  const newResults = { ...showTestResult };
                  incorrectQuestions.forEach(idx => {
                    delete newAnswers[idx];
                    delete newResults[idx];
                  });
                  setTestAnswers(newAnswers);
                  setShowTestResult(newResults);
                  
                  toast.success(`틀린 ${incorrectQuestions.length}개 문제를 다시 풀어보세요!`);
                }}
                className="w-full px-6 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                disabled={incorrectQuestions.length === 0}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                틀린것만 보기 ({incorrectQuestions.length})
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

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-1">
            {Array.from({ length: totalQuestions }).map((_, idx) => {
              const isAnswered = showTestResult[idx];
              const qWordIdx = Math.floor(idx / 20) * 10 + (idx % 10);
              const isCorrect = isAnswered && testAnswers[idx] === selectedWordList.words[qWordIdx]?.word;
              
              return (
                <div
                  key={idx}
                  className={`flex-1 h-3 rounded-full transition-all relative ${
                    isCorrect
                      ? 'bg-green-500'
                      : isAnswered
                      ? 'bg-orange-500'
                      : idx === currentWordIndex
                      ? 'bg-gray-400'
                      : 'bg-gray-200'
                  }`}
                >
                  {idx === currentWordIndex && (
                    <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded-full">
                      {idx + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {totalQuestions}
          </span>
        </div>
      </div>

      {/* Test Card - Multiple Choice */}
      {isMultipleChoice ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          {/* Word Definition */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">뜻</span>
            </div>
            <p className="text-xl text-gray-800 leading-relaxed">
              {currentWord?.definition}
            </p>
          </div>

          {/* Answer Options */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm ${
                showTestResult[currentWordIndex] && testAnswers[currentWordIndex] === currentWord?.word
                  ? 'text-green-600'
                  : showTestResult[currentWordIndex] && testAnswers[currentWordIndex] !== currentWord?.word
                  ? 'text-orange-600'
                  : 'text-gray-600'
              }`}>
                {showTestResult[currentWordIndex] && testAnswers[currentWordIndex] === currentWord?.word
                  ? ['잘했어요!', '훌륭해요!', '정답입니다'][currentWordIndex % 3]
                  : showTestResult[currentWordIndex] && testAnswers[currentWordIndex] !== currentWord?.word
                  ? '걱정하지 마세요, 아직 배우고 있잖아요!'
                  : '정답을 고르세요'}
              </p>
              {/* Retry button for incorrect answers */}
              {showTestResult[currentWordIndex] && testAnswers[currentWordIndex] !== currentWord?.word && (
                <button
                  onClick={() => handleRetryQuestion(currentWordIndex)}
                  className="text-sm text-orange-600 hover:underline"
                >
                  다시 해봅시다
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {generateTestOptions(
                currentWord?.definition,
                selectedWordList.words,
                wordIdx
              ).map((option, idx) => {
                const isSelected = testAnswers[currentWordIndex] === option;
                const isCorrect = option === currentWord?.word;
                const showResult = showTestResult[currentWordIndex];
                
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      handleTestAnswer(currentWordIndex, option, currentWord?.word);
                    }}
                    disabled={showResult}
                    className={`p-4 text-left rounded-lg transition-all relative ${
                      showResult && isCorrect
                        ? 'border-2 border-green-500 bg-white'
                        : showResult && isSelected && !isCorrect
                        ? 'border-2 border-orange-500 bg-white'
                        : showResult && !isSelected && isCorrect
                        ? 'border-2 border-dashed border-green-500 bg-white'
                        : 'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    style={showResult && !isSelected && isCorrect ? { borderStyle: 'dashed' } : {}}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <span className={`text-sm ${
                          showResult && isCorrect
                            ? 'text-green-600'
                            : showResult && isSelected && !isCorrect
                            ? 'text-orange-600'
                            : 'text-gray-500'
                        }`}>
                          {showResult && isCorrect
                            ? '✓'
                            : showResult && isSelected && !isCorrect
                            ? 'X'
                            : idx + 1}
                        </span>
                        <span className="text-gray-800">{option}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Subjective Question */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          {/* Word Type */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-gray-600">뜻</span>
          </div>

          {/* Definition */}
          <p className="text-xl text-gray-800 leading-relaxed mb-12">
            {currentWord?.definition}
          </p>

          {/* Feedback and Answer */}
          {showTestResult[currentWordIndex] ? (
            <>
              {testAnswers[currentWordIndex] === currentWord?.word ? (
                // Correct Answer
                <>
                  <p className="text-green-600 text-sm mb-4">
                    {['잘했어요!', '훌륭해요!', '정답입니다'][currentWordIndex % 3]}
                  </p>
                  
                  {/* Correct Answer */}
                  <div className="p-4 rounded-lg border-2 border-green-500 bg-white">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-800">{currentWord?.word}</span>
                    </div>
                  </div>
                </>
              ) : (
                // Wrong Answer
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-orange-600 text-sm">
                      걱정하지 마세요, 아직 배우고 있잖아요!
                    </p>
                    {/* Retry button for incorrect answers */}
                    <button
                      onClick={() => handleRetryQuestion(currentWordIndex)}
                      className="text-sm text-orange-600 hover:underline"
                    >
                      다시 해봅시다
                    </button>
                  </div>
                  
                  {/* Wrong Answer */}
                  <div className="mb-4 p-4 rounded-lg border-2 border-orange-500 bg-white">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">✕</span>
                      <span className="text-gray-800">{testAnswers[currentWordIndex]}</span>
                    </div>
                  </div>

                  {/* Correct Answer Label */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-green-600">정답</h3>
                  </div>

                  {/* Correct Answer */}
                  <div className="p-4 rounded-lg border-2 border-dashed border-green-500 bg-white">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-800">{currentWord?.word}</span>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Answer Input Section */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-600 mb-3">당신의 답</h3>
                <input
                  type="text"
                  value={subjectiveAnswer}
                  onChange={(e) => setSubjectiveAnswer(e.target.value)}
                  placeholder="정답을 입력하세요"
                  className="w-full p-4 border-2 border-blue-400 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Hint and Submit Section */}
              <div className="flex items-center justify-between mb-6">
                {/* Hint Button and Hint Display */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowHint(!showHint)}
                    className="px-4 py-2 text-sm text-blue-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    힌트 보기
                  </button>
                  
                  {/* Hint Display - Show inline next to button */}
                  {showHint && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">&gt;</span>
                      <span className="text-sm text-gray-600">
                        {currentWord?.word?.slice(0, Math.min(4, currentWord?.word?.length || 0))}___
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Right side: Submit button */}
                <div className="flex items-center gap-3">
                  {/* Submit Button - Only show when answer is entered */}
                  {subjectiveAnswer.trim() && (
                    <Button
                      onClick={() => {
                        handleTestAnswer(currentWordIndex, subjectiveAnswer.trim(), currentWord?.word);
                        setShowHint(false); // Reset hint when submitting
                      }}
                      className="px-5 py-2 text-sm rounded-full text-white hover:opacity-90 transition-colors"
                      style={{ backgroundColor: '#1E40AF' }}
                    >
                      답하기
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Continue Button and Message */}
      {showTestResult[currentWordIndex] && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            정답을 클릭하거나 이동 키나 놓고 계속하세요
          </p>
          <Button
            onClick={() => {
              if (currentWordIndex < totalQuestions - 1) {
                handleNextWord();
              } else {
                // Test complete - will show complete screen
                setCurrentWordIndex(totalQuestions);
              }
            }}
            className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-colors text-sm"
            style={{ backgroundColor: '#1E40AF' }}
          >
            계속
          </Button>
        </div>
      )}
    </div>
  );
}