import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, ChevronLeft, ChevronRight, RotateCcw, Check, X, Shuffle, Eye, EyeOff, Star, BookOpen, Layers, Search, CheckCircle2, XCircle } from "lucide-react";
import type { VocaItem } from "./types";

interface VocaBuildUpProps {
  vocabulary: VocaItem[];
  onComplete: (knownCount: number, totalCount: number) => void;
}

type VocaSubTab = 'study' | 'flashcard' | 'quiz';
type QuizMode = 'word' | 'synonym'; // 본문단어 | 유의어

// 유의어 난이도 분류 (2 비슷 + 1 어려움)
function getSynonymDifficulty(synonym: string): { text: string; level: 'easy' | 'medium' | 'hard' }[] {
  if (!synonym) return [];
  const parts = synonym.split(/[,;/]/).map(s => s.trim()).filter(Boolean);
  return parts.map((s, i) => ({
    text: s,
    level: i < 2 ? (i === 0 ? 'easy' : 'medium') : 'hard',
  }));
}

// ===================== 어휘 학습 컴포넌트 =====================
function VocaStudyList({ vocabulary, speak }: { vocabulary: VocaItem[]; speak: (text: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mastered, setMastered] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('vocaBuildUp_mastered');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const filtered = useMemo(() => {
    if (!searchTerm) return vocabulary;
    const lower = searchTerm.toLowerCase();
    return vocabulary.filter(v =>
      v.word.toLowerCase().includes(lower) ||
      v.meaning.includes(searchTerm) ||
      (v.synonym && v.synonym.toLowerCase().includes(lower))
    );
  }, [vocabulary, searchTerm]);

  const toggleMastered = (id: string) => {
    setMastered(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem('vocaBuildUp_mastered', JSON.stringify([...next]));
      return next;
    });
  };

  const masteredCount = vocabulary.filter(v => mastered.has(v.id)).length;

  return (
    <div>
      {/* Progress & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-cyan-50 px-4 py-2 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-cyan-600" />
          <span className="text-sm font-bold text-cyan-700">{masteredCount} / {vocabulary.length} 암기 완료</span>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="단어 검색..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Word List */}
      <div className="space-y-2">
        {filtered.map((item, idx) => {
          const isExpanded = expandedId === item.id;
          const isMastered = mastered.has(item.id);
          const synonyms = getSynonymDifficulty(item.synonym || '');

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className={`border rounded-xl overflow-hidden transition-all ${
                isMastered ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-white'
              }`}
            >
              {/* Word Row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <span className="text-xs font-bold text-gray-300 w-6 text-center">{idx + 1}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); speak(item.word); }}
                  className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center hover:bg-cyan-100 transition-colors shrink-0"
                >
                  <Volume2 className="w-4 h-4 text-cyan-600" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{item.word}</span>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.pos}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{item.meaning}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleMastered(item.id); }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                    isMastered ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <Check className="w-4 h-4" />
                </button>
                <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3">
                      {/* Example */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-800 font-medium italic mb-1">"{item.example}"</p>
                        <p className="text-xs text-blue-600">{item.exampleKo}</p>
                        <button
                          onClick={() => speak(item.example)}
                          className="mt-1.5 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                        >
                          <Volume2 className="w-3 h-3" /> 예문 듣기
                        </button>
                      </div>
                      {/* Synonym with difficulty */}
                      {synonyms.length > 0 && (
                        <div className="bg-indigo-50 rounded-lg p-3">
                          <span className="text-[10px] font-bold text-indigo-500 uppercase mb-2 block">유의어 (Synonyms)</span>
                          <div className="flex flex-wrap gap-2">
                            {synonyms.map((syn, si) => (
                              <span
                                key={si}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                  syn.level === 'easy' ? 'bg-green-100 text-green-700' :
                                  syn.level === 'medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}
                              >
                                {syn.text}
                                <span className={`text-[9px] px-1 py-0.5 rounded ${
                                  syn.level === 'easy' ? 'bg-green-200/60' :
                                  syn.level === 'medium' ? 'bg-amber-200/60' :
                                  'bg-red-200/60'
                                }`}>
                                  {syn.level === 'easy' ? '쉬움' : syn.level === 'medium' ? '비슷' : '어려움'}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Antonym */}
                      {item.antonym && (
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Antonym</span>
                          <p className="text-sm font-medium text-gray-700">{item.antonym}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  );
}

// ===================== 플래시카드 컴포넌트 =====================
function FlashcardMode({ vocabulary, onComplete, speak }: {
  vocabulary: VocaItem[];
  onComplete: (knownCount: number, totalCount: number) => void;
  speak: (text: string) => void;
}) {
  const [cards, setCards] = useState<VocaItem[]>(vocabulary);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [unknown, setUnknown] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<'study' | 'review' | 'complete'>('study');
  const [showExample, setShowExample] = useState(false);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);

  const currentCard = cards[currentIndex];
  const progress = ((known.size + unknown.size) / vocabulary.length) * 100;

  const handleKnown = useCallback(() => {
    if (!currentCard) return;
    setSwipeDir('right');
    setTimeout(() => {
      setKnown(prev => new Set([...prev, currentCard.id]));
      setSwipeDir(null);
      setIsFlipped(false);
      setShowExample(false);
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        checkComplete();
      }
    }, 250);
  }, [currentCard, currentIndex, cards.length]);

  const handleUnknown = useCallback(() => {
    if (!currentCard) return;
    setSwipeDir('left');
    setTimeout(() => {
      setUnknown(prev => new Set([...prev, currentCard.id]));
      setSwipeDir(null);
      setIsFlipped(false);
      setShowExample(false);
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        checkComplete();
      }
    }, 250);
  }, [currentCard, currentIndex, cards.length]);

  const checkComplete = () => {
    const unknownCards = vocabulary.filter(v => unknown.has(v.id) && !known.has(v.id));
    if (unknownCards.length === 0) {
      setMode('complete');
      onComplete(known.size, vocabulary.length);
    } else {
      setCards(unknownCards);
      setCurrentIndex(0);
      setUnknown(new Set());
      setMode('review');
    }
  };

  const shuffleCards = () => {
    setCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const restart = () => {
    setCards(vocabulary);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());
    setMode('study');
    setShowExample(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsFlipped(f => !f); }
      if (e.key === 'ArrowRight') handleKnown();
      if (e.key === 'ArrowLeft') handleUnknown();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKnown, handleUnknown]);

  if (mode === 'complete') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Star className="w-10 h-10 text-green-500 fill-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">플래시카드 완료!</h2>
        <p className="text-gray-600 mb-6">{vocabulary.length}개 단어를 모두 학습했습니다.</p>
        <button onClick={restart} className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors">
          <RotateCcw className="w-4 h-4" /> 다시 테스트하기
        </button>
      </motion.div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            {mode === 'review' ? '복습 모드' : '카드 모드'} - {currentIndex + 1} / {cards.length}
          </span>
          <span className="text-sm font-bold text-cyan-600">{known.size}개 완료</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600" animate={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={shuffleCards} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
          <Shuffle className="w-3.5 h-3.5" /> 섞기
        </button>
        <button onClick={() => setShowExample(!showExample)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
          {showExample ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showExample ? "예문 숨기기" : "예문 보기"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id + currentIndex}
          initial={{ opacity: 0, x: swipeDir === 'left' ? -200 : swipeDir === 'right' ? 200 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: swipeDir === 'left' ? -200 : swipeDir === 'right' ? 200 : 0 }}
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative cursor-pointer select-none"
        >
          <div className="relative w-full rounded-2xl shadow-lg border border-gray-100 overflow-hidden" style={{ minHeight: showExample ? '300px' : '220px' }}>
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 ${isFlipped ? 'pointer-events-none' : ''}`}
              style={{ opacity: isFlipped ? 0 : 1, background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%)' }}>
              <span className="text-xs font-medium text-cyan-500 mb-3 px-3 py-1 bg-cyan-50 rounded-full border border-cyan-200">{currentCard.pos}</span>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">{currentCard.word}</h2>
              <button onClick={(e) => { e.stopPropagation(); speak(currentCard.word); }} className="flex items-center gap-1.5 text-cyan-600 hover:text-cyan-700 text-sm">
                <Volume2 className="w-5 h-5" /> 발음 듣기
              </button>
              {showExample && <div className="mt-5 p-3 bg-white/70 rounded-xl text-center w-full"><p className="text-sm text-gray-700 italic">"{currentCard.example}"</p></div>}
              <p className="text-xs text-gray-400 mt-4">탭하여 뜻 확인</p>
            </div>
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 ${!isFlipped ? 'pointer-events-none' : ''}`}
              style={{ opacity: isFlipped ? 1 : 0, background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)' }}>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{currentCard.word}</h2>
              <p className="text-xl text-amber-700 font-semibold mb-3">{currentCard.meaning}</p>
              {currentCard.synonym && <p className="text-xs text-gray-500">유의어: <span className="font-medium text-gray-700">{currentCard.synonym}</span></p>}
              {currentCard.antonym && <p className="text-xs text-gray-500">반의어: <span className="font-medium text-gray-700">{currentCard.antonym}</span></p>}
              <p className="text-xs text-gray-400 mt-4">탭하여 영어 보기</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-6 mt-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleUnknown} className="flex flex-col items-center gap-1.5">
          <div className="w-16 h-16 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center hover:bg-red-100"><X className="w-7 h-7 text-red-500" /></div>
          <span className="text-xs font-medium text-red-500">모르겠어요</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsFlipped(!isFlipped)} className="flex flex-col items-center gap-1.5">
          <div className="w-12 h-12 bg-gray-50 border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100"><RotateCcw className="w-5 h-5 text-gray-500" /></div>
          <span className="text-xs font-medium text-gray-500">뒤집기</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleKnown} className="flex flex-col items-center gap-1.5">
          <div className="w-16 h-16 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center hover:bg-green-100"><Check className="w-7 h-7 text-green-500" /></div>
          <span className="text-xs font-medium text-green-500">알고 있어요</span>
        </motion.button>
      </div>
    </div>
  );
}

// ===================== 테스트 (본문단어 / 유의어) 컴포넌트 =====================
function QuizTest({ vocabulary, onComplete, speak }: {
  vocabulary: VocaItem[];
  onComplete: (knownCount: number, totalCount: number) => void;
  speak: (text: string) => void;
}) {
  const [quizMode, setQuizMode] = useState<QuizMode>('word');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Filter vocab: synonym mode only works with items that have synonyms
  const quizItems = useMemo(() => {
    if (quizMode === 'synonym') {
      return vocabulary.filter(v => v.synonym && v.synonym.trim().length > 0);
    }
    return vocabulary;
  }, [vocabulary, quizMode]);

  const current = quizItems[currentIdx];

  // Generate 4 options
  const options = useMemo(() => {
    if (!current) return [];

    if (quizMode === 'word') {
      // 뜻 → 영단어 선택
      const correct = current.word;
      const others = vocabulary
        .filter(v => v.id !== current.id)
        .map(v => v.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      return [correct, ...others].sort(() => Math.random() - 0.5);
    } else {
      // 영단어 → 유의어 선택
      const synonymParts = (current.synonym || '').split(/[,;/]/).map(s => s.trim()).filter(Boolean);
      const correct = synonymParts[0] || current.synonym || '';
      // Generate wrong options from other words' synonyms or random words
      const allSynonyms = vocabulary
        .filter(v => v.id !== current.id && v.synonym)
        .flatMap(v => (v.synonym || '').split(/[,;/]/).map(s => s.trim()).filter(Boolean));
      const otherWords = vocabulary
        .filter(v => v.id !== current.id)
        .map(v => v.word);
      const wrongPool = [...new Set([...allSynonyms, ...otherWords])].filter(w => w !== correct && !synonymParts.includes(w));
      const wrongs = wrongPool.sort(() => Math.random() - 0.5).slice(0, 3);
      return [correct, ...wrongs].sort(() => Math.random() - 0.5);
    }
  }, [current?.id, quizMode]);

  const handleSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);

    let isCorrect: boolean;
    if (quizMode === 'word') {
      isCorrect = answer === current.word;
    } else {
      const synonymParts = (current.synonym || '').split(/[,;/]/).map(s => s.trim().toLowerCase());
      isCorrect = synonymParts.includes(answer.toLowerCase());
    }

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
    }));

    setTimeout(() => {
      if (currentIdx < quizItems.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setIsComplete(true);
        onComplete(score.correct + (isCorrect ? 1 : 0), quizItems.length);
      }
    }, 1200);
  };

  const restart = () => {
    setCurrentIdx(0);
    setScore({ correct: 0, wrong: 0 });
    setSelectedAnswer(null);
    setShowResult(false);
    setIsComplete(false);
  };

  const switchMode = (mode: QuizMode) => {
    setQuizMode(mode);
    restart();
  };

  if (isComplete) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Star className="w-10 h-10 text-green-500 fill-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {quizMode === 'word' ? '본문단어' : '유의어'} 테스트 완료!
        </h2>
        <div className="flex gap-4 mb-2">
          <span className="text-green-600 font-bold">정답 {score.correct}</span>
          <span className="text-red-500 font-bold">오답 {score.wrong}</span>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          {Math.round((score.correct / quizItems.length) * 100)}% 정답률
        </p>
        <div className="flex gap-3">
          <button onClick={restart} className="flex items-center gap-2 px-5 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors">
            <RotateCcw className="w-4 h-4" /> 다시 풀기
          </button>
          {quizMode === 'word' && vocabulary.some(v => v.synonym) && (
            <button onClick={() => switchMode('synonym')} className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
              유의어 테스트
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  if (!current) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="font-medium">{quizMode === 'synonym' ? '유의어가 있는 단어가 없습니다.' : '테스트할 단어가 없습니다.'}</p>
        {quizMode === 'synonym' && (
          <button onClick={() => switchMode('word')} className="mt-4 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg text-sm font-bold">
            본문단어 테스트로 전환
          </button>
        )}
      </div>
    );
  }

  const correctAnswer = quizMode === 'word' ? current.word : (current.synonym || '').split(/[,;/]/)[0]?.trim();
  const isCorrectAnswer = (answer: string) => {
    if (quizMode === 'word') return answer === current.word;
    const synonymParts = (current.synonym || '').split(/[,;/]/).map(s => s.trim().toLowerCase());
    return synonymParts.includes(answer.toLowerCase());
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Quiz Mode Toggle */}
      <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
        <button
          onClick={() => switchMode('word')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            quizMode === 'word' ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          본문단어
        </button>
        <button
          onClick={() => switchMode('synonym')}
          disabled={!vocabulary.some(v => v.synonym)}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            quizMode === 'synonym' ? 'bg-white text-indigo-700 shadow-sm' :
            !vocabulary.some(v => v.synonym) ? 'text-gray-300 cursor-not-allowed' :
            'text-gray-500 hover:text-gray-700'
          }`}
        >
          유의어
        </button>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">{currentIdx + 1} / {quizItems.length}</span>
          <div className="flex gap-3 text-sm">
            <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {score.correct}</span>
            <span className="text-red-500 font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> {score.wrong}</span>
          </div>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${quizMode === 'synonym' ? 'bg-gradient-to-r from-indigo-400 to-indigo-600' : 'bg-gradient-to-r from-purple-400 to-purple-600'}`}
            animate={{ width: `${(currentIdx / quizItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        key={current.id + currentIdx}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl shadow-lg border p-6 sm:p-8 text-center mb-6 ${
          quizMode === 'synonym'
            ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100'
            : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100'
        }`}
      >
        {quizMode === 'word' ? (
          <>
            <span className="text-xs font-medium text-purple-500 mb-2 px-3 py-1 bg-purple-50 rounded-full border border-purple-200 inline-block">
              {current.pos}
            </span>
            <p className="text-lg text-gray-600 mt-3 mb-1">{current.meaning}</p>
            <p className="text-sm text-gray-400">다음 중 올바른 영단어를 선택하세요</p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gray-800 mt-2 mb-2">{current.word}</h2>
            <button onClick={() => speak(current.word)} className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-700 text-sm mx-auto">
              <Volume2 className="w-5 h-5" /> 발음 듣기
            </button>
            <p className="text-sm text-gray-400 mt-3">다음 중 올바른 유의어를 선택하세요</p>
          </>
        )}
      </motion.div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {options.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          const correct = isCorrectAnswer(option);
          let bgClass = 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50';
          if (showResult && isSelected && correct) {
            bgClass = 'bg-green-50 border-green-400 ring-2 ring-green-200';
          } else if (showResult && isSelected && !correct) {
            bgClass = 'bg-red-50 border-red-400 ring-2 ring-red-200';
          } else if (showResult && correct) {
            bgClass = 'bg-green-50 border-green-300';
          }

          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(option)}
              disabled={showResult}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${bgClass}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm font-medium text-gray-700">{option}</span>
                {showResult && correct && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />}
                {showResult && isSelected && !correct && <XCircle className="w-5 h-5 text-red-500 ml-auto" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ===================== 메인 VocaBuildUp 컴포넌트 =====================
export function VocaBuildUp({ vocabulary, onComplete }: VocaBuildUpProps) {
  const [activeSubTab, setActiveSubTab] = useState<VocaSubTab>('study');

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return (
    <div>
      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveSubTab('study')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
            activeSubTab === 'study' ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          어휘 학습
        </button>
        <button
          onClick={() => setActiveSubTab('flashcard')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
            activeSubTab === 'flashcard' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          단어 카드
        </button>
        <button
          onClick={() => setActiveSubTab('quiz')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
            activeSubTab === 'quiz' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          테스트
        </button>
      </div>

      {/* Sub-Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeSubTab === 'study' ? (
            <VocaStudyList vocabulary={vocabulary} speak={speak} />
          ) : activeSubTab === 'flashcard' ? (
            <FlashcardMode vocabulary={vocabulary} onComplete={onComplete} speak={speak} />
          ) : (
            <QuizTest vocabulary={vocabulary} onComplete={onComplete} speak={speak} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
