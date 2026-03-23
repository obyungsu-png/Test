import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowDown, Check, X, RotateCcw, ArrowUpDown, Link2, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import type { ParagraphItem, SentenceItem } from "./types";

interface FlowChartProps {
  paragraphs: ParagraphItem[];
  sentences: SentenceItem[];
  onComplete: () => void;
}

type FlowMode = 'ordering' | 'matching';

export function FlowChart({ paragraphs, sentences, onComplete }: FlowChartProps) {
  const [mode, setMode] = useState<FlowMode>('ordering');
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [showPassage, setShowPassage] = useState(false);

  // Ordering Mode
  const [shuffledParas, setShuffledParas] = useState<ParagraphItem[]>([]);
  const [userOrder, setUserOrder] = useState<ParagraphItem[]>([]);
  const [orderChecked, setOrderChecked] = useState(false);
  const [orderCorrect, setOrderCorrect] = useState(false);

  // Matching Mode
  const [shuffledTopics, setShuffledTopics] = useState<string[]>([]);
  const [matchPairs, setMatchPairs] = useState<Record<number, string | null>>({});
  const [selectedParaId, setSelectedParaId] = useState<number | null>(null);
  const [matchChecked, setMatchChecked] = useState(false);

  // Group sentences by paragraph
  const sentencesByParagraph = paragraphs.map(p => ({
    paragraph: p,
    sentences: sentences.filter(s => s.paragraphId === p.id),
  }));

  // Initialize ordering
  useEffect(() => {
    const shuffled = [...paragraphs].sort(() => Math.random() - 0.5);
    setShuffledParas(shuffled);
    setUserOrder([]);
    setOrderChecked(false);
  }, [paragraphs]);

  // Initialize matching
  useEffect(() => {
    const topics = paragraphs.map(p => p.topic).sort(() => Math.random() - 0.5);
    setShuffledTopics(topics);
    const pairs: Record<number, string | null> = {};
    paragraphs.forEach(p => { pairs[p.id] = null; });
    setMatchPairs(pairs);
    setSelectedParaId(null);
    setMatchChecked(false);
  }, [paragraphs]);

  // Get first sentence of each paragraph
  const getParaPreview = (paraId: number) => {
    const s = sentences.find(s => s.paragraphId === paraId);
    return s ? s.english.substring(0, 60) + (s.english.length > 60 ? '...' : '') : '';
  };

  // === ORDERING ===
  const addToOrder = (para: ParagraphItem) => {
    setUserOrder(prev => [...prev, para]);
    setShuffledParas(prev => prev.filter(p => p.id !== para.id));
  };

  const removeFromOrder = (idx: number) => {
    const para = userOrder[idx];
    setUserOrder(prev => prev.filter((_, i) => i !== idx));
    setShuffledParas(prev => [...prev, para]);
  };

  const checkOrder = () => {
    const correct = userOrder.every((p, i) => p.id === paragraphs[i].id);
    setOrderCorrect(correct);
    setOrderChecked(true);
    if (correct) {
      setScore(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
    }
  };

  const resetOrder = () => {
    const shuffled = [...paragraphs].sort(() => Math.random() - 0.5);
    setShuffledParas(shuffled);
    setUserOrder([]);
    setOrderChecked(false);
  };

  // === MATCHING ===
  const handleTopicClick = (topic: string) => {
    if (selectedParaId === null || matchChecked) return;
    setMatchPairs(prev => ({ ...prev, [selectedParaId]: topic }));
    setShuffledTopics(prev => prev.filter(t => t !== topic));
    setSelectedParaId(null);
  };

  const handleParaClick = (paraId: number) => {
    if (matchChecked) return;
    if (matchPairs[paraId]) {
      setShuffledTopics(prev => [...prev, matchPairs[paraId]!]);
      setMatchPairs(prev => ({ ...prev, [paraId]: null }));
    }
    setSelectedParaId(paraId);
  };

  const checkMatch = () => {
    let allCorrect = true;
    paragraphs.forEach(p => {
      if (matchPairs[p.id] !== p.topic) allCorrect = false;
    });
    setMatchChecked(true);
    if (allCorrect) {
      setScore(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
    }
  };

  const resetMatch = () => {
    const topics = paragraphs.map(p => p.topic).sort(() => Math.random() - 0.5);
    setShuffledTopics(topics);
    const pairs: Record<number, string | null> = {};
    paragraphs.forEach(p => { pairs[p.id] = null; });
    setMatchPairs(pairs);
    setSelectedParaId(null);
    setMatchChecked(false);
  };

  const allMatched = Object.values(matchPairs).every(v => v !== null);

  // ─── 본문 보기 패널 ───
  const PassagePanel = () => {
    if (sentences.length === 0) return null;
    return (
      <div className="mb-5">
        <button
          onClick={() => setShowPassage(!showPassage)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
            showPassage
              ? 'bg-teal-50 text-teal-700 border border-teal-200'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>본문 보기</span>
            <span className="text-xs font-normal text-gray-400">({sentences.length}문장)</span>
          </div>
          {showPassage ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {showPassage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-2 bg-white border border-gray-200 rounded-xl max-h-[320px] overflow-y-auto">
                <div className="p-4 space-y-4">
                  {sentencesByParagraph.map((group, gi) => (
                    <div key={gi}>
                      {group.paragraph && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                            {group.paragraph.id}연
                          </span>
                          <span className="text-xs text-gray-400">{group.paragraph.topic}</span>
                          <span className="text-xs text-gray-300">· {group.paragraph.structure}</span>
                        </div>
                      )}
                      <div className="space-y-2">
                        {group.sentences.map((s) => (
                          <div key={s.id} className="group">
                            <p className={`text-sm leading-relaxed ${
                              s.importance === 'high' ? 'text-gray-800 font-medium' : 'text-gray-700'
                            }`}>
                              <span className="text-xs text-gray-300 mr-1.5">{s.id}.</span>
                              {s.english}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 pl-4">{s.korean}</p>
                          </div>
                        ))}
                      </div>
                      {gi < sentencesByParagraph.length - 1 && (
                        <div className="border-t border-dashed border-gray-100 mt-3" />
                      )}
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

  return (
    <div>
      {/* Score */}
      <div className="flex items-center justify-end gap-3 mb-4 text-sm">
        <span className="text-green-600 font-bold">{score.correct} 정답</span>
        <span className="text-red-500 font-bold">{score.wrong} 오답</span>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
        <button
          onClick={() => setMode('ordering')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'ordering' ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" /> 순서 배열
        </button>
        <button
          onClick={() => setMode('matching')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'matching' ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" /> 주제 찾기
        </button>
      </div>

      {/* 본문 보기 (공통) */}
      <PassagePanel />

      {/* === ORDERING MODE === */}
      {mode === 'ordering' && (
        <div>
          <p className="text-sm text-gray-500 mb-4">뒤섞인 단락들을 원래 글의 순서대로 배치하세요.</p>

          {/* User arranged area */}
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">배치된 순서</p>
            <div className="min-h-[80px] p-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 space-y-2">
              {userOrder.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">아래 단락을 순서대로 클릭하세요</p>
              )}
              {userOrder.map((para, idx) => {
                const isCorrectPos = orderChecked && para.id === paragraphs[idx].id;
                return (
                  <motion.div
                    key={`order-${para.id}`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`p-3 rounded-xl flex items-start gap-3 transition-colors ${
                      !orderChecked ? 'bg-white border border-cyan-200 cursor-pointer hover:bg-cyan-50' :
                      isCorrectPos ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}
                    onClick={() => !orderChecked && removeFromOrder(idx)}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      !orderChecked ? 'bg-cyan-100 text-cyan-700' :
                      isCorrectPos ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{para.structure}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{getParaPreview(para.id)}</p>
                    </div>
                    {orderChecked && (isCorrectPos ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />)}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Available paragraphs */}
          {shuffledParas.length > 0 && !orderChecked && (
            <div>
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">선택할 단락들</p>
              <div className="space-y-2">
                {shuffledParas.map(para => (
                  <motion.button
                    key={`pick-${para.id}`}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToOrder(para)}
                    className="w-full p-3 bg-white rounded-xl border border-gray-200 text-left hover:border-cyan-300 hover:bg-cyan-50 transition-all"
                  >
                    <p className="text-sm font-medium text-gray-700">{para.structure}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{getParaPreview(para.id)}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {orderChecked && !orderCorrect && (
            <div className="mt-4 p-3 bg-green-50 rounded-xl">
              <p className="text-xs font-bold text-green-600 mb-2">정답 순서:</p>
              {paragraphs.map((p, i) => (
                <p key={p.id} className="text-sm text-green-700">{i + 1}. {p.topic} ({p.structure})</p>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            {!orderChecked ? (
              <button
                onClick={checkOrder}
                disabled={userOrder.length !== paragraphs.length}
                className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                  userOrder.length === paragraphs.length ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                정답 확인
              </button>
            ) : (
              <>
                <button onClick={resetOrder} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> 다시하기
                </button>
                <button onClick={onComplete} className="flex-1 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors">
                  다음 단계
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* === MATCHING MODE === */}
      {mode === 'matching' && (
        <div>
          <p className="text-sm text-gray-500 mb-4">각 단락의 구조를 보고, 어울리는 소제목을 연결하세요.</p>

          {/* Paragraph slots */}
          <div className="space-y-3 mb-5">
            {paragraphs.map(para => {
              const matched = matchPairs[para.id];
              const isSelected = selectedParaId === para.id;
              const isCorrectMatch = matchChecked && matched === para.topic;
              const isWrongMatch = matchChecked && matched && matched !== para.topic;

              return (
                <motion.button
                  key={`match-${para.id}`}
                  onClick={() => handleParaClick(para.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    matchChecked
                      ? isCorrectMatch ? 'border-green-400 bg-green-50' : isWrongMatch ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                      : isSelected ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                      {para.id}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">{para.structure}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{getParaPreview(para.id)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowDown className="w-3 h-3 text-gray-300" />
                      {matched ? (
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          matchChecked
                            ? isCorrectMatch ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                            : 'bg-cyan-100 text-cyan-700'
                        }`}>
                          {matched}
                        </span>
                      ) : (
                        <span className={`px-3 py-1 rounded-lg text-xs ${isSelected ? 'bg-cyan-100 text-cyan-600 font-bold' : 'bg-gray-100 text-gray-400'}`}>
                          {isSelected ? '소제목 선택...' : '?'}
                        </span>
                      )}
                    </div>
                  </div>
                  {matchChecked && isWrongMatch && (
                    <p className="text-xs text-green-600 mt-2">정답: {para.topic}</p>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Topic bank */}
          {shuffledTopics.length > 0 && !matchChecked && (
            <div>
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">소제목 선택</p>
              <div className="flex flex-wrap gap-2">
                {shuffledTopics.map((topic, i) => (
                  <motion.button
                    key={`topic-${i}-${topic}`}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTopicClick(topic)}
                    disabled={selectedParaId === null}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedParaId !== null ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {topic}
                  </motion.button>
                ))}
              </div>
              {selectedParaId === null && shuffledTopics.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">먼저 위에서 단락을 선택하세요</p>
              )}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            {!matchChecked ? (
              <button
                onClick={checkMatch}
                disabled={!allMatched}
                className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                  allMatched ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                정답 확인
              </button>
            ) : (
              <>
                <button onClick={resetMatch} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> 다시하기
                </button>
                <button onClick={onComplete} className="flex-1 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors">
                  다음 단계
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}