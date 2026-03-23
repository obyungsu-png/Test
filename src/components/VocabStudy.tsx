import React, { useState } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';

interface Word {
  word: string;
  definition: string;
  context?: string;
}

interface VocabStudyProps {
  words: Word[];
  title: string;
  onClose: () => void;
  onNext?: () => void;
}

export function VocabStudy({ words, title, onClose, onNext }: VocabStudyProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-800 mb-2">단어 확인</h2>
        <p className="text-base text-gray-500">{words.length}개 단어 선택됨</p>
      </div>

      {/* Word List */}
      <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1 space-y-3 mb-6">
        {words.map((word, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
          >
            <div className="flex items-start gap-4">
              {/* Number badge */}
              <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                {idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                {/* Word and Definition */}
                <div className="flex items-baseline gap-3 flex-wrap">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSpeak(word.word); }}
                    className="text-lg font-bold text-indigo-700 hover:text-indigo-900 transition-colors"
                  >
                    {word.word}
                  </button>
                  <span className="text-base text-gray-700 font-medium">{word.definition}</span>
                </div>

                {/* Context / Synonyms - always show if available */}
                {word.context && (
                  <p className="text-sm text-gray-500 mt-2">
                    {word.context}
                  </p>
                )}
              </div>

              {/* Speaker icon */}
              <button
                onClick={(e) => { e.stopPropagation(); handleSpeak(word.word); }}
                className="p-2 hover:bg-indigo-50 rounded-lg transition-colors flex-shrink-0"
              >
                <Volume2 className="w-4 h-4 text-indigo-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button
          onClick={onClose}
          variant="outline"
          className="px-6 py-3 rounded-full border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
        >
          이전 단계
        </Button>
        {onNext && (
          <Button
            onClick={onNext}
            className="px-8 py-3 rounded-full text-white font-bold hover:opacity-90 transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#3730a3' }}
          >
            다음 단계
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
