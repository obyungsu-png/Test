import React, { useState } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, X, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Word {
  word: string;
  definition: string;
  engDefinition?: string;
  context?: string;
}

interface FlashCardProps {
  words: Word[];
  title: string;
  onClose: () => void;
}

export function FlashCard({ words, title, onClose }: FlashCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? Math.round(((currentIndex + 1) / words.length) * 100) : 0;

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 100);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 100);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = () => {
    if (currentWord && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // 키보드 네비게이션
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped]);

  if (!currentWord) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-800">단어 카드</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSpeak}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Volume2 className="w-4 h-4" />
            음성 재생
          </button>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-indigo-600">{currentIndex + 1} / {words.length}</span>
        <span className="text-sm font-semibold text-indigo-600">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flash Card */}
      <div className="relative" style={{ perspective: '1000px' }}>
        <div
          onClick={handleFlip}
          className="cursor-pointer w-full min-h-[350px] md:min-h-[420px] rounded-2xl shadow-lg relative overflow-hidden transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front - English */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl"
            style={{
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #5b6abf 0%, #4f5baf 50%, #6366f1 100%)',
            }}
          >
            <p className="text-base text-indigo-200 mb-4 font-medium">영어 단어</p>
            <p className="text-4xl md:text-5xl font-bold text-white text-center leading-tight">
              {currentWord.word}
            </p>
            <p className="text-sm text-indigo-200 mt-8">클릭하여 뒤집기</p>
          </div>

          {/* Back - Korean */}
          <div
            className="absolute inset-0 flex flex-col items-center p-8 pt-10 rounded-2xl bg-white border-2 border-gray-200 overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-base text-indigo-500 mb-2 font-semibold">한글 뜻</p>
            <p className="text-3xl md:text-4xl font-bold text-indigo-900 text-center mb-8">
              {currentWord.definition}
            </p>

            {/* 영영 정의 + 동의어 섹션 */}
            <div className="w-full max-w-lg space-y-3">
              {/* 영영 정의 */}
              {currentWord.engDefinition && (
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-300">
                  <p className="text-sm font-bold text-gray-800 mb-1.5">영영 정의</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{currentWord.engDefinition}</p>
                </div>
              )}

              {/* 동의어 */}
              {currentWord.context && (
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-300">
                  <p className="text-sm font-bold text-gray-800 mb-1.5">동의어</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{currentWord.context}</p>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-400 mt-auto pt-4">클릭하여 뒤집기</p>
          </div>
        </div>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-[-20px] md:left-[-28px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors z-10 border border-gray-200"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        )}
        {currentIndex < words.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-[-20px] md:right-[-28px] top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-600 shadow-lg rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-6 flex-wrap">
        {words.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { setIsFlipped(false); setCurrentIndex(idx); }}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === currentIndex
                ? 'bg-indigo-500 scale-125'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-gray-400 mt-4">
        ← → 키로 이동, 스페이스바로 뒤집기
      </p>
    </div>
  );
}