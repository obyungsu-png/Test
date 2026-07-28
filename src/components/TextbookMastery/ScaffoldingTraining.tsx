import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, RotateCcw, ChevronRight, ArrowUpDown, Pencil, Sparkles, Zap, Target, ArrowRight } from "lucide-react";
import type { SentenceItem } from "./types";
import { getBlankWordsByType } from "./types";
import type { BlankType } from "./types";

interface ScaffoldingTrainingProps {
  sentences: SentenceItem[];
  onComplete: () => void;
  onWrongAnswer: (sentenceId: number, type: string) => void;
}

type TrainingMode = 'blank' | 'unscramble' | 'writing';

export function ScaffoldingTraining({ sentences, onComplete, onWrongAnswer }: ScaffoldingTrainingProps) {
  const [mode, setMode] = useState<TrainingMode>('blank');
  const [blankLevel, setBlankLevel] = useState<BlankType>('grammar');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Blank Mode State
  const [blankInputs, setBlankInputs] = useState<Record<number, string>>({});

  // Unscramble State
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);

  // Writing State
  const [writingInput, setWritingInput] = useState("");
  const [writingChecked, setWritingChecked] = useState(false);
  const [writingDiff, setWritingDiff] = useState<{ word: string; correct: boolean }[]>([]);

  const current = sentences[currentIdx];
  const progress = ((currentIdx) / sentences.length) * 100;

  // Initialize unscramble
  useEffect(() => {
    if (mode === 'unscramble' && current) {
      const words = current.english.replace(/[.,!?"]/g, '').split(' ');
      setScrambledWords([...words].sort(() => Math.random() - 0.5));
      setArrangedWords([]);
    }
  }, [mode, currentIdx, current]);

  // Reset blank inputs
  useEffect(() => {
    setBlankInputs({});
    setShowResult(false);
    setWritingInput("");
    setWritingChecked(false);
    setWritingDiff([]);
  }, [currentIdx, mode, blankLevel]);

  // === BLANK MODE ===
  const handleBlankCheck = () => {
    if (!current) return;
    const { blanks } = getBlankWordsByType(current.english, blankLevel);
    let allCorrect = true;

    blanks.forEach(b => {
      const userInput = (blankInputs[b.index] || '').trim().toLowerCase();
      const correctWord = b.word.replace(/[^a-zA-Z']/g, '').toLowerCase();
      if (userInput !== correctWord) allCorrect = false;
    });

    setIsCorrect(allCorrect);
    setShowResult(true);
    if (allCorrect) {
      setScore(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
      onWrongAnswer(current.id, 'blank');
    }
  };

  // === UNSCRAMBLE MODE ===
  const addWord = (word: string, idx: number) => {
    setArrangedWords(prev => [...prev, word]);
    setScrambledWords(prev => prev.filter((_, i) => i !== idx));
  };

  const removeWord = (idx: number) => {
    const word = arrangedWords[idx];
    setScrambledWords(prev => [...prev, word]);
    setArrangedWords(prev => prev.filter((_, i) => i !== idx));
  };

  const checkUnscramble = () => {
    if (!current) return;
    const originalWords = current.english.replace(/[.,!?"]/g, '').split(' ');
    const correct = arrangedWords.join(' ').toLowerCase() === originalWords.join(' ').toLowerCase();

    setIsCorrect(correct);
    setShowResult(true);
    if (correct) {
      setScore(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
      onWrongAnswer(current.id, 'unscramble');
    }
  };

  // === WRITING MODE ===
  const checkWriting = () => {
    if (!current) return;
    const originalWords = current.english.toLowerCase().replace(/[.,!?"]/g, '').split(/\s+/);
    const userWords = writingInput.toLowerCase().replace(/[.,!?"]/g, '').split(/\s+/);

    const diff = originalWords.map((word, i) => ({
      word: current.english.split(/\s+/)[i] || word,
      correct: userWords[i]?.toLowerCase() === word,
    }));

    const correct = diff.every(d => d.correct);
    setWritingDiff(diff);
    setWritingChecked(true);
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) {
      setScore(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
      onWrongAnswer(current.id, 'writing');
    }
  };

  const nextSentence = () => {
    if (currentIdx < sentences.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  if (!current) return null;

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">{currentIdx + 1} / {sentences.length}</span>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-600 font-bold">{score.correct} 정답</span>
            <span className="text-red-500 font-bold">{score.wrong} 오답</span>
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full" animate={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Mode Tabs — 빈칸 채우기만 */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5">
        {([
          { key: 'blank' as TrainingMode, label: '빈칸 채우기', icon: Sparkles },
        ]).map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setCurrentIdx(0); setScore({ correct: 0, wrong: 0 }); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === m.key ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <m.icon className="w-3.5 h-3.5" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Blank Level Selector */}
      {mode === 'blank' && (
        <div className="flex gap-2 mb-5">
          {([
            { key: 'grammar' as BlankType, label: '어법', icon: Zap, color: 'text-indigo-700' },
            { key: 'keyword' as BlankType, label: '키워드', icon: Target, color: 'text-cyan-700' },
            { key: 'connector' as BlankType, label: '연결어', icon: ArrowRight, color: 'text-amber-700' },
          ]).map(lv => (
            <button
              key={lv.key}
              onClick={() => { setBlankLevel(lv.key); setCurrentIdx(0); setScore({ correct: 0, wrong: 0 }); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                blankLevel === lv.key ? `bg-white ${lv.color} shadow-sm border border-gray-200` : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <lv.icon className="w-4 h-4" />
              {lv.label}
            </button>
          ))}
        </div>
      )}

      {/* Korean Guide (for all modes) */}
      <div className="mb-4 p-5 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-base text-amber-800">
          <span className="font-bold text-amber-600 mr-1">해석:</span>
          {current.korean}
        </p>
      </div>

      {/* === BLANK MODE CONTENT === */}
      {mode === 'blank' && (() => {
        const { blanks } = getBlankWordsByType(current.english, blankLevel);
        const words = current.english.split(' ');

        return (
          <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex flex-wrap gap-1.5 items-center leading-loose text-[15px]">
              {words.map((word, i) => {
                const blank = blanks.find(b => b.index === i);
                if (blank) {
                  const userVal = blankInputs[i] || '';
                  const correctWord = blank.word.replace(/[^a-zA-Z']/g, '').toLowerCase();
                  const isChecked = showResult;
                  const isRight = isChecked && userVal.trim().toLowerCase() === correctWord;

                  return (
                    <span key={i} className="inline-flex items-center">
                      <input
                        type="text"
                        value={userVal}
                        onChange={(e) => setBlankInputs(prev => ({ ...prev, [i]: e.target.value }))}
                        disabled={showResult}
                        className={`w-24 px-2 py-1 border-b-2 text-center text-sm font-medium bg-transparent outline-none transition-colors ${
                          isChecked
                            ? isRight ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'
                            : 'border-cyan-300 text-gray-800 focus:border-cyan-500'
                        }`}
                        placeholder="..."
                      />
                      {isChecked && !isRight && (
                        <span className="ml-1 text-xs text-green-600 font-bold">({blank.word.replace(/[.,!?"]/g, '')})</span>
                      )}
                    </span>
                  );
                }
                return <span key={i} className="text-gray-800">{word}</span>;
              })}
            </div>

            {!showResult ? (
              <button onClick={handleBlankCheck} className="mt-5 w-full py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors">
                정답 확인
              </button>
            ) : (
              <div className="mt-4 flex gap-3">
                <button onClick={nextSentence} className="flex-1 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2">
                  다음 문장 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* === UNSCRAMBLE MODE CONTENT === */}
      {mode === 'unscramble' && (
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
          {/* Arranged area */}
          <div className="min-h-[60px] p-3 bg-gray-50 rounded-xl mb-4 flex flex-wrap gap-2 items-center border-2 border-dashed border-gray-200">
            {arrangedWords.length === 0 && (
              <span className="text-sm text-gray-400">아래 단어를 순서대로 배치하세요</span>
            )}
            <AnimatePresence>
              {arrangedWords.map((word, i) => (
                <motion.button
                  key={`a-${i}-${word}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => !showResult && removeWord(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    showResult
                      ? isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 cursor-pointer'
                  }`}
                >
                  {word}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Word bank */}
          <div className="flex flex-wrap gap-2 mb-4">
            {scrambledWords.map((word, i) => (
              <motion.button
                key={`s-${i}-${word}`}
                whileTap={{ scale: 0.9 }}
                onClick={() => !showResult && addWord(word, i)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                {word}
              </motion.button>
            ))}
          </div>

          {showResult && !isCorrect && (
            <div className="p-3 bg-green-50 rounded-xl mb-3">
              <p className="text-sm text-green-700"><span className="font-bold">정답:</span> {current.english}</p>
            </div>
          )}

          {!showResult ? (
            <button
              onClick={checkUnscramble}
              disabled={scrambledWords.length > 0}
              className={`w-full py-3 rounded-xl font-bold transition-colors ${
                scrambledWords.length === 0 ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {scrambledWords.length === 0 ? '정답 확인' : `남은 단어: ${scrambledWords.length}개`}
            </button>
          ) : (
            <button onClick={nextSentence} className="w-full py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2">
              다음 문장 <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* === WRITING MODE CONTENT === */}
      {mode === 'writing' && (
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
          <textarea
            value={writingInput}
            onChange={(e) => setWritingInput(e.target.value)}
            disabled={writingChecked}
            placeholder="한글 해석을 보고 영어 문장을 작성하세요..."
            className="w-full h-28 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:bg-gray-50"
          />

          {writingChecked && (
            <div className="mt-3">
              {/* Word-by-word diff */}
              <div className="p-3 bg-gray-50 rounded-xl mb-3">
                <p className="text-xs font-medium text-gray-500 mb-2">단어별 채점:</p>
                <div className="flex flex-wrap gap-1">
                  {writingDiff.map((d, i) => (
                    <span
                      key={i}
                      className={`px-1.5 py-0.5 rounded text-sm font-medium ${d.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 line-through'}`}
                    >
                      {d.word}
                    </span>
                  ))}
                </div>
              </div>
              {!isCorrect && (
                <div className="p-3 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-700"><span className="font-bold">정답:</span> {current.english}</p>
                </div>
              )}
            </div>
          )}

          {!writingChecked ? (
            <button
              onClick={checkWriting}
              disabled={!writingInput.trim()}
              className={`mt-3 w-full py-3 rounded-xl font-bold transition-colors ${
                writingInput.trim() ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              정답 확인
            </button>
          ) : (
            <button onClick={nextSentence} className="mt-3 w-full py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2">
              다음 문장 <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Result Feedback */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 p-3 rounded-xl text-center font-bold text-sm ${
              isCorrect ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
            }`}
          >
            {isCorrect ? '정답입니다! 잘했어요!' : '아쉬워요! 다시 확인해보세요.'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}