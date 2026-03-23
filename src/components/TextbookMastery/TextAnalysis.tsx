import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, Zap } from "lucide-react";
import type { SentenceItem, ParagraphItem } from "./types";

interface TextAnalysisProps {
  sentences: SentenceItem[];
  paragraphs: ParagraphItem[];
  onComplete: () => void;
}

// grammarPoint에서 짧은 태그 레이블과 상세 설명을 추출
function parseGrammarPoint(gp: string): { label: string; type: string; highlight: string; description: string } | null {
  if (!gp) return null;
  // "be동사 현재형 (is)" → label: "be동사 현재형", highlight: "is", description: full
  const match = gp.match(/^(.+?)\s*\((.+?)\)$/);
  if (match) {
    return {
      label: match[1].trim(),
      type: match[1].trim(),
      highlight: match[2].trim(),
      description: gp,
    };
  }
  return {
    label: gp,
    type: gp,
    highlight: "",
    description: gp,
  };
}

export function TextAnalysis({ sentences, paragraphs, onComplete }: TextAnalysisProps) {
  const [expandedGrammar, setExpandedGrammar] = useState<string | null>(null);
  const [readSentences, setReadSentences] = useState<Set<number>>(new Set());

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  const markRead = (id: number) => {
    setReadSentences(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const groupedByParagraph = paragraphs.map(p => ({
    ...p,
    sentences: sentences.filter(s => s.paragraphId === p.id),
  }));

  const readProgress = (readSentences.size / sentences.length) * 100;

  return (
    <div>
      {/* Progress */}
      <div className="mb-5 px-4 md:px-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">본문 분석 진행률</span>
          <span className="text-sm font-bold text-cyan-600">{readSentences.size}/{sentences.length} 문장</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full" animate={{ width: `${readProgress}%` }} />
        </div>
      </div>

      {/* Paragraph Groups */}
      <div className="space-y-6">
        {groupedByParagraph.map((para) => (
          <div key={para.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Paragraph Header */}
            <div className="px-5 py-3 bg-gradient-to-r from-cyan-50 to-white border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white bg-cyan-500 px-2 py-0.5 rounded">
                  {para.id}연
                </span>
                <span className="text-sm font-bold text-gray-700">{para.topic}</span>
              </div>
            </div>

            {/* Sentences */}
            <div className="divide-y divide-gray-50">
              {para.sentences.map((sentence) => {
                const isRead = readSentences.has(sentence.id);
                const grammar = parseGrammarPoint(sentence.grammarPoint || "");
                const grammarKey = `${sentence.id}-grammar`;

                return (
                  <div
                    key={sentence.id}
                    className={`px-5 py-4 transition-colors ${isRead ? 'bg-green-50/30' : ''}`}
                    onClick={() => markRead(sentence.id)}
                  >
                    {/* Sentence Number + Importance + English + Speaker */}
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        isRead ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {sentence.id}
                      </span>

                      {sentence.importance === 'high' && (
                        <span className="mt-0.5 text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded font-bold flex-shrink-0">
                          시험빈출
                        </span>
                      )}

                      <div className="flex-1 min-w-0">
                        {/* English with chunks (always slash-separated) */}
                        <p className="text-[15px] leading-relaxed text-gray-800 font-medium">
                          {sentence.chunks.map((chunk, i) => (
                            <span key={i}>
                              {i > 0 && <span className="text-cyan-400 mx-1">/</span>}
                              <span className="hover:bg-cyan-50 rounded px-0.5 transition-colors">{chunk}</span>
                            </span>
                          ))}
                        </p>

                        {/* Grammar Tag Button */}
                        {grammar && (
                          <div className="mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedGrammar(expandedGrammar === grammarKey ? null : grammarKey);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors"
                            >
                              <Zap className="w-3 h-3" />
                              {grammar.label}
                            </button>
                          </div>
                        )}

                        {/* Grammar Detail (expanded) */}
                        <AnimatePresence>
                          {grammar && expandedGrammar === grammarKey && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-indigo-700">{grammar.type}</span>
                                  {grammar.highlight && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-indigo-200 text-indigo-700 rounded">
                                      grammar_select_all
                                    </span>
                                  )}
                                </div>
                                {grammar.highlight && (
                                  <p className="text-sm text-indigo-600 mb-1">
                                    <span className="font-medium bg-indigo-100 px-1 rounded">"{grammar.highlight}"</span>
                                  </p>
                                )}
                                <p className="text-xs text-indigo-500">{grammar.description}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Speaker button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); speak(sentence.english); }}
                        className="mt-1 text-gray-300 hover:text-cyan-500 transition-colors flex-shrink-0"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Complete Button */}
      {readProgress >= 80 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
          <button onClick={onComplete} className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors text-sm">
            본문 분석 완료! 다음 단계로 이동
          </button>
        </motion.div>
      )}
    </div>
  );
}
