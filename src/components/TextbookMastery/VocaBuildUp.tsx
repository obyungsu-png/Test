import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, ChevronRight, Check, Search, CheckCircle2 } from "lucide-react";
import type { VocaItem } from "./types";

interface VocaBuildUpProps {
  vocabulary: VocaItem[];
  onComplete: (knownCount: number, totalCount: number) => void;
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
      v.meaning.includes(searchTerm)
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

// ===================== 메인 VocaBuildUp 컴포넌트 =====================
export function VocaBuildUp({ vocabulary, onComplete }: VocaBuildUpProps) {
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
      <VocaStudyList vocabulary={vocabulary} speak={speak} />
    </div>
  );
}
