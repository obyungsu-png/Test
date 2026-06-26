import React from "react";
import { motion, AnimatePresence } from "motion/react";
const { useState, useMemo } = React;
import {
  Brain, Upload, FileText, Sparkles, ChevronRight,
  Eye, Volume2, BookOpen, Target, Layers, Zap, CheckCircle2,
  XCircle, RotateCcw, ArrowRight, Lightbulb, Lock,
  Unlock, PenTool, Star,
  CheckCheck, MousePointer, Download, Flame, Trophy, Printer, FileDown,
  Clock, ChevronDown, ChevronUp, AlertCircle
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import type { ParagraphItem, SentenceItem as TBSentenceItem } from "./TextbookMastery/types";
import { downloadMasteryExamPDF, downloadMasteryExamWord, downloadMasteryVocaPDF } from "../utils/downloadHelpers";

// ===================== Types =====================
interface AnalyzedSentence {
  id: number;
  english: string;
  korean: string;
  chunks: string[];
  grammarPoints: GrammarPoint[];
  keywords: string[];
  connectors: string[];
  difficulty: "easy" | "medium" | "hard";
  isKeyExam: boolean;
  paragraph: number;
  paragraphTitle: string;
  paragraphSubtitle: string;
}

interface GrammarPoint {
  type: string;
  label: string;
  description: string;
  highlight: string;
  quizType: string;
}

interface VocaCard {
  id: string;
  word: string;
  meaning: string;
  pos: string;
  synonyms: string[];
  antonyms: string[];
  contextSentence: string;
}

interface KillerQuestion {
  id: string;
  type: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: "killer" | "hard" | "medium";
}

// ===================== Sample Data =====================
const SAMPLE_PASSAGE = `The discovery that the universe is expanding was one of the great intellectual revolutions of the twentieth century. With hindsight, it is easy to wonder why no one had thought of it before. Newton and others should have realized that a static universe would soon start to contract under the influence of gravity. But suppose instead that the universe is expanding. If it was expanding fairly slowly, the force of gravity would cause it eventually to stop expanding and then to start contracting. However, if it was expanding at more than a certain critical rate, gravity would never be strong enough to stop it, and the universe would continue to expand forever.`;

const SAMPLE_SENTENCES: AnalyzedSentence[] = [
  {
    id: 1,
    english: "The discovery that the universe is expanding was one of the great intellectual revolutions of the twentieth century.",
    korean: "우주가 팽창하고 있다는 발견은 20세기의 위대한 지적 혁명 중 하나였다.",
    chunks: ["The discovery", "that the universe is expanding", "was one of", "the great intellectual revolutions", "of the twentieth century"],
    grammarPoints: [
      { type: "동격 that절", label: "동격", description: "discovery와 동격인 that절 (명사를 부연 설명)", highlight: "that the universe is expanding", quizType: "grammar_select_all" }
    ],
    keywords: ["discovery", "expanding", "intellectual", "revolutions"],
    connectors: [],
    difficulty: "medium",
    isKeyExam: true,
    paragraph: 1,
    paragraphTitle: "우주 팽창 발견의 의의",
    paragraphSubtitle: "도입 및 배경"
  },
  {
    id: 2,
    english: "With hindsight, it is easy to wonder why no one had thought of it before.",
    korean: "돌이켜 보면, 왜 이전에 아무도 그것을 생각하지 못했는지 궁금해하기 쉽다.",
    chunks: ["With hindsight,", "it is easy", "to wonder", "why no one had thought of it", "before"],
    grammarPoints: [
      { type: "가주어-진주어", label: "It~to", description: "it(가주어)... to wonder(진주어) 구문", highlight: "it is easy to wonder", quizType: "grammar_select_all" },
      { type: "과거완료", label: "과거완료", description: "had thought: 대과거 시점 표현", highlight: "had thought", quizType: "grammar_fill" }
    ],
    keywords: ["hindsight", "wonder"],
    connectors: [],
    difficulty: "medium",
    isKeyExam: false,
    paragraph: 1,
    paragraphTitle: "우주 팽창 발견의 의의",
    paragraphSubtitle: "도입 및 배경"
  },
  {
    id: 3,
    english: "Newton and others should have realized that a static universe would soon start to contract under the influence of gravity.",
    korean: "뉴턴과 다른 사람들은 정적인 우주가 중력의 영향으로 곧 수축하기 시작할 것임을 깨달았어야 했다.",
    chunks: ["Newton and others", "should have realized", "that a static universe", "would soon start to contract", "under the influence of gravity"],
    grammarPoints: [
      { type: "should have p.p.", label: "추측/후회", description: "should have realized: ~했어야 했다 (과거 사실에 대한 후회)", highlight: "should have realized", quizType: "grammar_select_all" }
    ],
    keywords: ["static", "contract", "influence", "gravity"],
    connectors: [],
    difficulty: "hard",
    isKeyExam: true,
    paragraph: 1,
    paragraphTitle: "우주 팽창 발견의 의의",
    paragraphSubtitle: "도입 및 배경"
  },
  {
    id: 4,
    english: "But suppose instead that the universe is expanding.",
    korean: "그러나 대신 우주가 팽창하고 있다고 가정해 보자.",
    chunks: ["But suppose instead", "that the universe is expanding"],
    grammarPoints: [
      { type: "명령문", label: "명령문", description: "suppose: 동사원형으로 시작하는 명령문", highlight: "suppose", quizType: "grammar_fill" }
    ],
    keywords: ["suppose", "expanding"],
    connectors: ["But", "instead"],
    difficulty: "easy",
    isKeyExam: false,
    paragraph: 2,
    paragraphTitle: "팽창 속도에 따른 우주의 운명",
    paragraphSubtitle: "가정과 결론"
  },
  {
    id: 5,
    english: "If it was expanding fairly slowly, the force of gravity would cause it eventually to stop expanding and then to start contracting.",
    korean: "만약 우주가 상당히 느리게 팽창하고 있었다면, 중력은 결국 팽창을 멈추고 수축하기 시작하게 만들 것이다.",
    chunks: ["If it was expanding fairly slowly,", "the force of gravity", "would cause it", "eventually to stop expanding", "and then to start contracting"],
    grammarPoints: [
      { type: "가정법 과거", label: "가정법", description: "If + 과거시제, would + 동사원형: 현재 사실의 반대 가정", highlight: "If it was expanding... would cause", quizType: "grammar_select_all" },
      { type: "cause + 목적어 + to부정사", label: "5형식", description: "cause it to stop: 5형식 구문", highlight: "cause it eventually to stop", quizType: "grammar_fill" }
    ],
    keywords: ["expanding", "gravity", "contracting"],
    connectors: ["If", "and then"],
    difficulty: "hard",
    isKeyExam: true,
    paragraph: 2,
    paragraphTitle: "팽창 속도에 따른 우주의 운명",
    paragraphSubtitle: "가정과 결론"
  },
  {
    id: 6,
    english: "However, if it was expanding at more than a certain critical rate, gravity would never be strong enough to stop it, and the universe would continue to expand forever.",
    korean: "그러나 만약 우주가 특정 임계 속도 이상으로 팽창하고 있었다면, 중력은 결코 그것을 멈출 만큼 강하지 않을 것이고, 우주는 영원히 계속 팽창할 것이다.",
    chunks: ["However,", "if it was expanding", "at more than a certain critical rate,", "gravity would never be", "strong enough to stop it,", "and the universe would continue", "to expand forever"],
    grammarPoints: [
      { type: "enough to", label: "enough to", description: "strong enough to stop: ~할 만큼 충분히 강한", highlight: "strong enough to stop", quizType: "grammar_fill" },
      { type: "비교급 + than", label: "비교급", description: "more than a certain critical rate", highlight: "more than a certain critical rate", quizType: "grammar_select_all" }
    ],
    keywords: ["critical", "rate", "gravity", "expand"],
    connectors: ["However"],
    difficulty: "hard",
    isKeyExam: true,
    paragraph: 2,
    paragraphTitle: "팽창 속도에 따른 우주의 운명",
    paragraphSubtitle: "가정과 결론"
  },
];

const SAMPLE_VOCAB: VocaCard[] = [
  { id: "v1", word: "expanding", meaning: "팽창하는, 확장하는", pos: "adj", synonyms: ["growing", "extending"], antonyms: ["contracting"], contextSentence: "The universe is expanding at an accelerating rate." },
  { id: "v2", word: "intellectual", meaning: "지적인, 지성의", pos: "adj", synonyms: ["cognitive", "cerebral"], antonyms: ["emotional"], contextSentence: "It was one of the great intellectual revolutions." },
  { id: "v3", word: "hindsight", meaning: "뒤늦은 깨달음, 사후 판단", pos: "n", synonyms: ["retrospect", "afterthought"], antonyms: ["foresight"], contextSentence: "With hindsight, the answer seems obvious." },
  { id: "v4", word: "contract", meaning: "수축하다, 줄어들다", pos: "v", synonyms: ["shrink", "compress"], antonyms: ["expand"], contextSentence: "The universe would start to contract under gravity." },
  { id: "v5", word: "gravity", meaning: "중력, 인력", pos: "n", synonyms: ["gravitation", "attraction"], antonyms: ["repulsion"], contextSentence: "The force of gravity holds us to the earth." },
  { id: "v6", word: "critical", meaning: "임계의, 결정적인", pos: "adj", synonyms: ["crucial", "decisive"], antonyms: ["trivial"], contextSentence: "Expanding at more than a certain critical rate." },
];

const SAMPLE_KILLER_QUESTIONS: KillerQuestion[] = [
  {
    id: "q1",
    type: "Grammar",
    question: "Which of the following underlined parts is grammatically CORRECT?",
    options: [
      "A. The discovery that the universe is expanding",
      "B. Newton should have been realized that...",
      "C. gravity would cause it eventually to stop expanding",
      "D. strong enough stopping it"
    ],
    answer: 0,
    explanation: "Option A uses an appositive 'that' clause correctly. Option C also uses 'cause + O + to V' correctly. Option B should be 'should have realized' (active voice), and Option D should be 'strong enough to stop' (enough + to-infinitive).",
    difficulty: "killer"
  },
  {
    id: "q2",
    type: "Blank Inference",
    question: "Choose the most appropriate word for the blank.\n\n\"If the universe was expanding at more than a certain _______ rate, gravity would never be strong enough to stop it.\"",
    options: ["critical", "nominal", "marginal", "peripheral", "trivial"],
    answer: 0,
    explanation: "'Critical rate' refers to the threshold speed at which gravity can no longer halt the expansion. In context, 'critical' meaning 'decisive / of a threshold' is the most appropriate choice.",
    difficulty: "hard"
  },
  {
    id: "q3",
    type: "Ordering",
    question: "Choose the correct order of the passages following the given paragraph.\n\n(A) However, if it was expanding at more than a certain critical rate, gravity would never be strong enough to stop it.\n(B) Newton and others should have realized that a static universe would soon start to contract.\n(C) But suppose instead that the universe is expanding fairly slowly.",
    options: [
      "(A)-(C)-(B)",
      "(B)-(A)-(C)",
      "(B)-(C)-(A)",
      "(C)-(A)-(B)",
      "(C)-(B)-(A)"
    ],
    answer: 2,
    explanation: "After the introductory sentence about the discovery, (B) discusses what Newton should have realized, (C) introduces the hypothesis of slow expansion, and (A) presents the contrasting scenario of fast expansion.",
    difficulty: "medium"
  },
];

// ===================== FlowChart Sample Data =====================
const SAMPLE_PARAGRAPHS: ParagraphItem[] = [
  { id: 1, topic: "우주 팽창 발견의 의의", structure: "도입 및 배경" },
  { id: 2, topic: "팽창 속도에 따른 우주의 운명", structure: "가정과 결론" },
];

const SAMPLE_TB_SENTENCES: TBSentenceItem[] = [
  { id: 1, english: "The discovery that the universe is expanding was one of the great intellectual revolutions of the twentieth century.", korean: "우주가 팽창하고 있다는 발견은 20세기의 위대한 지적 혁명 중 하나였다.", chunks: ["The discovery", "that the universe is expanding", "was one of", "the great intellectual revolutions"], importance: "high", paragraphId: 1 },
  { id: 2, english: "With hindsight, it is easy to wonder why no one had thought of it before.", korean: "돌이켜 보면, 왜 이전에 아무도 그것을 생각하지 못했는지 궁금해하기 쉽다.", chunks: ["With hindsight,", "it is easy", "to wonder"], importance: "mid", paragraphId: 1 },
  { id: 3, english: "Newton and others should have realized that a static universe would soon start to contract under the influence of gravity.", korean: "뉴턴과 다른 사람들은 정적인 우주가 중력의 영향으로 곧 수축하기 시작할 것임을 깨달았어야 했다.", chunks: ["Newton and others", "should have realized", "that a static universe", "would soon start to contract"], importance: "high", paragraphId: 1 },
  { id: 4, english: "But suppose instead that the universe is expanding.", korean: "그러나 대신 우주가 팽창하고 있다고 가정해 보자.", chunks: ["But suppose instead", "that the universe is expanding"], importance: "mid", paragraphId: 2 },
  { id: 5, english: "If it was expanding fairly slowly, the force of gravity would cause it eventually to stop expanding and then to start contracting.", korean: "만약 우주가 상당히 느리게 팽창하고 있었다면, 중력은 결국 팽창을 멈추고 수축하기 시작하게 만들 것이다.", chunks: ["If it was expanding fairly slowly,", "the force of gravity", "would cause it"], importance: "high", paragraphId: 2 },
  { id: 6, english: "However, if it was expanding at more than a certain critical rate, gravity would never be strong enough to stop it, and the universe would continue to expand forever.", korean: "그러나 만약 우주가 특정 임계 속도 이상으로 팽창하고 있었다면, 중력은 결코 그것을 멈출 만큼 강하지 않을 것이다.", chunks: ["However,", "if it was expanding", "at more than a certain critical rate"], importance: "high", paragraphId: 2 },
];

// ===================== Sub Components =====================

// AI Analysis Gauge
function AnalysisGauge({ progress, label }: { progress: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-bold text-cyan-600">{progress}%</span>
    </div>
  );
}

// Stage Lock Indicator
function StageLock({ stage, currentStage, label, icon: Icon, unlockedStage }: { stage: number; currentStage: number; label: string; icon: any; unlockedStage?: number }) {
  const isUnlocked = (unlockedStage ?? currentStage) >= stage;
  const isActive = currentStage === stage;
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
        isActive ? 'bg-cyan-600 text-white shadow-lg scale-105' :
        isUnlocked ? 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100' :
        'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      {isUnlocked ? <Icon className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">S{stage}</span>
    </div>
  );
}

// ===================== Stage 1: Direct Reading & Grammar Radar =====================
function Stage1DirectReading({ sentences, onComplete }: { sentences: AnalyzedSentence[]; onComplete?: () => void }) {
  const [showChunking, setShowChunking] = useState(true);
  const [expandedGrammar, setExpandedGrammar] = useState<number | null>(null);
  const [revealedSentences, setRevealedSentences] = useState<Set<number>>(new Set());
  const [viewedSentences, setViewedSentences] = useState<Set<number>>(new Set());

  const toggleReveal = (id: number) => {
    setRevealedSentences(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setViewedSentences(prev => new Set(prev).add(id));
  };

  const revealAll = () => { const allIds = new Set(sentences.map(s => s.id)); setRevealedSentences(allIds); setViewedSentences(allIds); };
  const hideAll = () => { setRevealedSentences(new Set()); };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-GB';
      u.rate = 0.85;
      const voices = window.speechSynthesis.getVoices();
      const femaleGB = voices.find(v => v.lang === 'en-GB' && /female|fiona|kate|hazel|martha/i.test(v.name))
        || voices.find(v => v.lang === 'en-GB')
        || voices.find(v => v.lang.startsWith('en-GB'));
      if (femaleGB) u.voice = femaleGB;
      window.speechSynthesis.speak(u);
    }
  };



  // Group sentences by paragraph
  const paragraphs = useMemo(() => {
    const groups: { paragraph: number; title: string; subtitle: string; sentences: AnalyzedSentence[] }[] = [];
    sentences.forEach(s => {
      const existing = groups.find(g => g.paragraph === s.paragraph);
      if (existing) {
        existing.sentences.push(s);
      } else {
        groups.push({ paragraph: s.paragraph, title: s.paragraphTitle, subtitle: s.paragraphSubtitle, sentences: [s] });
      }
    });
    return groups;
  }, [sentences]);

  const progressPercent = Math.round((viewedSentences.size / sentences.length) * 100);

  React.useEffect(() => {
    if (viewedSentences.size === sentences.length && onComplete) onComplete();
  }, [viewedSentences.size, sentences.length]);

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="p-4 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-700">본문 분석 진행률</span>
          <span className="text-sm font-bold text-cyan-600">{viewedSentences.size}/{sentences.length} 문장</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowChunking(!showChunking)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${showChunking ? 'bg-cyan-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          끊어읽기 {showChunking ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={revealedSentences.size === sentences.length ? hideAll : revealAll}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${
            revealedSentences.size === sentences.length ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          {revealedSentences.size === sentences.length ? '전체 숨기기' : '전체 해석 보기'}
        </button>
        <span className="ml-auto text-xs text-gray-400 hidden sm:flex items-center gap-1">
          <MousePointer className="w-3 h-3" /> 문장을 클릭하여 해석 확인
        </span>
      </div>

      {/* Paragraph Groups */}
      {paragraphs.map((para) => (
        <div key={para.paragraph} className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
          {/* Paragraph Header */}
          <div className="flex items-start gap-3 px-5 py-4 bg-white border-b border-gray-100">
            <span className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
              {para.paragraph}
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-gray-800">{para.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{para.subtitle}</p>
            </div>
          </div>

          {/* Sentences */}
          <div className="p-3 space-y-2">
            {para.sentences.map((s) => (
              <motion.div
                key={s.id}
                className={`relative rounded-xl border transition-all overflow-hidden cursor-pointer ${
                  s.isKeyExam ? 'border-red-200 bg-red-50/30' : 'border-gray-100 bg-white'
                } ${revealedSentences.has(s.id) ? 'ring-2 ring-cyan-200' : 'hover:border-cyan-300'}`}
                onClick={() => toggleReveal(s.id)}
              >
                <div className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <span className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      s.difficulty === 'hard' ? 'bg-red-100 text-red-600' :
                      s.difficulty === 'medium' ? 'bg-amber-100 text-amber-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {s.id}
                    </span>
                    {s.isKeyExam && (
                      <span className="inline-block text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-bold mt-1 shrink-0">
                        시험빈출
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] leading-relaxed text-gray-800 font-medium">
                        {showChunking
                          ? s.chunks.map((chunk, i) => (
                              <span key={i}>
                                {i > 0 && <span className="text-cyan-400 mx-0.5 font-bold">/</span>}
                                <span className="hover:bg-cyan-50 rounded px-0.5 transition-colors">{chunk}</span>
                              </span>
                            ))
                          : s.english
                        }
                      </p>
                      <AnimatePresence>
                        {revealedSentences.has(s.id) && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm mt-1.5 text-cyan-700 bg-cyan-50 px-2 py-1 rounded-lg border border-cyan-100"
                          >
                            {s.korean}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      {s.grammarPoints.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {s.grammarPoints.map((gp, gi) => (
                            <button
                              key={gi}
                              onClick={() => setExpandedGrammar(expandedGrammar === s.id * 100 + gi ? null : s.id * 100 + gi)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors"
                            >
                              <Zap className="w-3 h-3" />
                              {gp.label}
                            </button>
                          ))}
                        </div>
                      )}
                      <AnimatePresence>
                        {s.grammarPoints.map((gp, gi) => (
                          expandedGrammar === s.id * 100 + gi && (
                            <motion.div
                              key={gi}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-indigo-700">{gp.type}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 bg-indigo-200 text-indigo-700 rounded">{gp.quizType}</span>
                                </div>
                                <p className="text-sm text-indigo-600 mb-1">
                                  <span className="font-medium bg-indigo-100 px-1 rounded">"{gp.highlight}"</span>
                                </p>
                                <p className="text-xs text-indigo-500">{gp.description}</p>
                              </div>
                            </motion.div>
                          )
                        ))}
                      </AnimatePresence>
                    </div>
                    <button
                      onClick={() => speak(s.english)}
                      className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center hover:bg-cyan-100 transition-colors shrink-0 mt-1"
                    >
                      <Volume2 className="w-4 h-4 text-cyan-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ===================== Stage 2: Vocabulary Challenge =====================
function Stage2VocaChallenge({ vocab, onComplete }: { vocab: VocaCard[]; onComplete?: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mode, setMode] = useState<"study" | "test">("study");
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());

  const current = vocab[currentIdx];

  const contextOptions = useMemo(() => {
    if (!current) return [];
    const correct = current.word;
    const distractors = vocab.filter(v => v.id !== current.id).map(v => v.word).sort(() => Math.random() - 0.5).slice(0, 3);
    return [correct, ...distractors].sort(() => Math.random() - 0.5);
  }, [currentIdx, mode, vocab, current]);

  const handleTestSelect = (word: string) => {
    if (quizAnswer) return;
    setQuizAnswer(word);
    const isCorrect = word === current.word;
    setScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), wrong: prev.wrong + (isCorrect ? 0 : 1) }));
    setTimeout(() => {
      setQuizAnswer(null);
      if (currentIdx < vocab.length - 1) setCurrentIdx(prev => prev + 1);
      else {
        toast.success(`테스트 완료! 정답: ${score.correct + (isCorrect ? 1 : 0)}/${vocab.length}`);
        if (onComplete) onComplete();
        setCurrentIdx(0);
        setScore({ correct: 0, wrong: 0 });
      }
    }, 1200);
  };

  const toggleLearned = (id: string) => {
    setLearnedWords(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  return (
    <div>
      {/* 2-Tab Toggle: 어휘 학습 / 테스트 */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
        <button onClick={() => { setMode("study"); setCurrentIdx(0); }}
          className={`flex-1 py-3 rounded-lg text-base font-bold transition-all ${mode === "study" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500"}`}>
          어휘 학습
        </button>
        <button onClick={() => { setMode("test"); setCurrentIdx(0); setQuizAnswer(null); setScore({ correct: 0, wrong: 0 }); }}
          className={`flex-1 py-3 rounded-lg text-base font-bold transition-all ${mode === "test" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500"}`}>
          테스트
        </button>
      </div>

      {/* 어휘 학습 */}
      {mode === "study" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base text-gray-600">학습 완료: <span className="font-bold text-emerald-600 text-lg">{learnedWords.size}/{vocab.length}</span></span>
            <div className="h-2 flex-1 mx-4 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" animate={{ width: `${(learnedWords.size / vocab.length) * 100}%` }} />
            </div>
          </div>
          {vocab.map((v) => {
            const isLearned = learnedWords.has(v.id);
            return (
              <motion.div key={v.id} layout className={`p-5 rounded-xl border transition-all ${isLearned ? "border-emerald-200 bg-emerald-50/50" : "border-gray-100 bg-white"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-xl font-bold text-gray-800">{v.word}</h3>
                      <span className="text-xs text-cyan-500 bg-cyan-50 px-1.5 py-0.5 rounded-full border border-cyan-200">{v.pos}</span>
                    </div>
                    <p className="text-base text-gray-600 font-medium">{v.meaning}</p>
                    <p className="text-base font-bold text-gray-900 mt-2">"{v.contextSentence}"</p>
                    {(v.synonyms.length > 0 || v.antonyms.length > 0) && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {v.synonyms.map((s, i) => (<span key={i} className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full border border-green-100">{s}</span>))}
                        {v.antonyms.map((a, i) => (<span key={`a-${i}`} className="text-xs px-2 py-0.5 bg-red-50 text-red-500 rounded-full border border-red-100">{a}</span>))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => toggleLearned(v.id)}
                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isLearned ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 테스트 (context only, 서브탭 없음) */}
      {mode === "test" && current && (
        <div>
          <div className="flex items-center justify-between mb-3 text-base">
            <span className="text-gray-500 font-medium">{currentIdx + 1} / {vocab.length}</span>
            <div className="flex gap-4">
              <span className="text-green-600 font-bold">{score.correct} 정답</span>
              <span className="text-red-500 font-bold">{score.wrong} 오답</span>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full" animate={{ width: `${((currentIdx + 1) / vocab.length) * 100}%` }} />
          </div>
          <motion.div key={currentIdx} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl shadow-lg border bg-gradient-to-br from-cyan-50 to-sky-50 border-cyan-100 p-8 text-center mb-6">
            <p className="text-base text-cyan-500 mb-3">뜻에 맞는 영어 단어를 고르세요</p>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{current.meaning}</h2>
            <p className="text-base font-bold text-gray-900 mt-2">"{current.contextSentence}"</p>
          </motion.div>
          <div className="grid grid-cols-1 gap-3">
            {contextOptions.map((opt, i) => {
              const isSelected = quizAnswer === opt;
              const isCorrectOpt = opt === current.word;
              let cls = "bg-white border-gray-200 hover:border-cyan-300 hover:bg-cyan-50";
              if (quizAnswer && isSelected && isCorrectOpt) cls = "bg-green-50 border-green-400 ring-2 ring-green-200";
              else if (quizAnswer && isSelected && !isCorrectOpt) cls = "bg-red-50 border-red-400 ring-2 ring-red-200";
              else if (quizAnswer && isCorrectOpt) cls = "bg-green-50 border-green-300";
              return (
                <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => handleTestSelect(opt)}
                  disabled={quizAnswer !== null}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${cls}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">{String.fromCharCode(65 + i)}</span>
                    <span className="text-base font-medium text-gray-700">{opt}</span>
                    {quizAnswer && isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />}
                    {quizAnswer && isSelected && !isCorrectOpt && <XCircle className="w-5 h-5 text-red-500 ml-auto" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


// ===================== Stage 3: Structural Memory (Multi-blank + Unscramble + Writing) =====================
function Stage3StructuralMemory({ sentences, onComplete }: { sentences: AnalyzedSentence[]; onComplete?: () => void }) {
  const [topMode, setTopMode] = useState<"blank" | "unscramble" | "writing" | "phrase">("blank");
  const [blankDone, setBlankDone] = useState(false);
  const [unscrambleDone, setUnscrambleDone] = useState(false);

  // === BLANK MODE STATE ===
  const [blankMode, setBlankMode] = useState<"grammar" | "keyword" | "connector">("grammar");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  // === UNSCRAMBLE MODE STATE ===
  const [unscrambleIdx, setUnscrambleIdx] = useState(0);
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [unscrambleChecked, setUnscrambleChecked] = useState(false);
  const [unscrambleCorrect, setUnscrambleCorrect] = useState(false);
  const [unscrambleScore, setUnscrambleScore] = useState({ correct: 0, wrong: 0 });

  // === WRITING MODE STATE ===
  const [writingIdx, setWritingIdx] = useState(0);
  const [writingInput, setWritingInput] = useState("");
  const [writingChecked, setWritingChecked] = useState(false);
  const [writingCorrect, setWritingCorrect] = useState(false);
  const [writingDiff, setWritingDiff] = useState<{ word: string; correct: boolean }[]>([]);
  const [writingScore, setWritingScore] = useState({ correct: 0, wrong: 0 });

  const unscrambleSentence = sentences[unscrambleIdx];
  const writingSentence = sentences[writingIdx];

  const initUnscramble = (idx: number) => {
    const s = sentences[idx];
    if (s) {
      const words = s.english.replace(/[.,!?"]/g, '').split(' ');
      setScrambledWords([...words].sort(() => Math.random() - 0.5));
      setArrangedWords([]);
      setUnscrambleChecked(false);
      setUnscrambleCorrect(false);
    }
  };

  const resetTopMode = (mode: "blank" | "unscramble" | "writing") => {
    setTopMode(mode);
    if (mode === "unscramble") {
      setUnscrambleIdx(0);
      setUnscrambleScore({ correct: 0, wrong: 0 });
      initUnscramble(0);
    } else if (mode === "writing") {
      setWritingIdx(0);
      setWritingInput("");
      setWritingChecked(false);
      setWritingCorrect(false);
      setWritingDiff([]);
      setWritingScore({ correct: 0, wrong: 0 });
    } else {
      setAnswers({});
      setShowResults(false);
    }
  };

  // === BLANK HELPERS (unchanged) ===
  const getBlankTargets = (sentence: AnalyzedSentence): { original: string; position: number }[] => {
    switch (blankMode) {
      case "grammar":
        return sentence.grammarPoints.map(gp => ({
          original: gp.highlight,
          position: sentence.english.indexOf(gp.highlight),
        })).filter(t => t.position >= 0);
      case "keyword":
        return sentence.keywords.map(kw => ({
          original: kw,
          position: sentence.english.toLowerCase().indexOf(kw.toLowerCase()),
        })).filter(t => t.position >= 0);
      case "connector":
        return sentence.connectors.map(c => ({
          original: c,
          position: sentence.english.indexOf(c),
        })).filter(t => t.position >= 0);
    }
  };

  const renderSentenceWithBlanks = (sentence: AnalyzedSentence) => {
    const targets = getBlankTargets(sentence);
    if (targets.length === 0) {
      return <p className="text-sm text-gray-400 italic">이 모드에서 빈칸이 없습니다</p>;
    }

    const text = sentence.english;
    const parts: { text: string; isBlank: boolean; blankId: string; original: string }[] = [];
    const sorted = [...targets].sort((a, b) => a.position - b.position);
    let lastEnd = 0;

    sorted.forEach((target, i) => {
      const blankId = `${sentence.id}-${blankMode}-${i}`;
      if (target.position > lastEnd) {
        parts.push({ text: text.slice(lastEnd, target.position), isBlank: false, blankId: "", original: "" });
      }
      parts.push({ text: "", isBlank: true, blankId, original: target.original });
      lastEnd = target.position + target.original.length;
    });
    if (lastEnd < text.length) {
      parts.push({ text: text.slice(lastEnd), isBlank: false, blankId: "", original: "" });
    }

    return (
      <div className="text-[15px] leading-relaxed text-gray-800 font-medium flex flex-wrap items-baseline gap-y-1">
        {parts.map((part, i) =>
          part.isBlank ? (
            <span key={i} className="inline-flex items-center mx-1">
              <input
                type="text"
                value={answers[part.blankId] || ""}
                onChange={e => setAnswers(prev => ({ ...prev, [part.blankId]: e.target.value }))}
                placeholder="..."
                className={`border-b-2 px-1 py-0.5 text-center text-sm font-medium outline-none transition-colors min-w-[60px] max-w-[200px] bg-transparent ${
                  showResults
                    ? (answers[part.blankId]?.toLowerCase().trim() === part.original.toLowerCase().trim()
                        ? 'border-green-500 text-green-700'
                        : 'border-red-500 text-red-600')
                    : 'border-cyan-400 text-cyan-700 focus:border-cyan-600'
                }`}
                style={{ width: `${Math.max(60, part.original.length * 9)}px` }}
              />
              {showResults && answers[part.blankId]?.toLowerCase().trim() !== part.original.toLowerCase().trim() && (
                <span className="text-xs text-red-500 ml-1">({part.original})</span>
              )}
            </span>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
      </div>
    );
  };

  // === UNSCRAMBLE HELPERS ===
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
    if (!unscrambleSentence) return;
    const originalWords = unscrambleSentence.english.replace(/[.,!?"]/g, '').split(' ');
    const correct = arrangedWords.join(' ').toLowerCase() === originalWords.join(' ').toLowerCase();
    setUnscrambleCorrect(correct);
    setUnscrambleChecked(true);
    if (correct) setUnscrambleScore(s => ({ ...s, correct: s.correct + 1 }));
    else setUnscrambleScore(s => ({ ...s, wrong: s.wrong + 1 }));
  };

  const nextUnscramble = () => {
    if (unscrambleIdx < sentences.length - 1) {
      const next = unscrambleIdx + 1;
      setUnscrambleIdx(next);
      initUnscramble(next);
    } else {
      setUnscrambleDone(true);
      if (blankDone && onComplete) onComplete();
    }
  };

  // === WRITING HELPERS ===
  const checkWriting = () => {
    if (!writingSentence) return;
    const originalWords = writingSentence.english.toLowerCase().replace(/[.,!?"]/g, '').split(/\s+/);
    const userWords = writingInput.toLowerCase().replace(/[.,!?"]/g, '').split(/\s+/);
    const diff = originalWords.map((word, i) => ({
      word: writingSentence.english.split(/\s+/)[i] || word,
      correct: userWords[i]?.toLowerCase() === word,
    }));
    const correct = diff.every(d => d.correct);
    setWritingDiff(diff);
    setWritingChecked(true);
    setWritingCorrect(correct);
    if (correct) setWritingScore(s => ({ ...s, correct: s.correct + 1 }));
    else setWritingScore(s => ({ ...s, wrong: s.wrong + 1 }));
  };

  const nextWriting = () => {
    if (writingIdx < sentences.length - 1) {
      setWritingIdx(prev => prev + 1);
      setWritingInput("");
      setWritingChecked(false);
      setWritingCorrect(false);
      setWritingDiff([]);
    }
  };

  return (
    <div>
      {/* Top-level Mode Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5">
        {([
          { key: "blank" as const, label: "빈칸 채우기", icon: Sparkles },
          { key: "phrase" as const, label: "핵심 어구", icon: Target },
          { key: "unscramble" as const, label: "문장 재배열", icon: ArrowRight },
          { key: "writing" as const, label: "한영 영작", icon: PenTool },
        ]).map(m => (
          <button
            key={m.key}
            onClick={() => resetTopMode(m.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              topMode === m.key ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <m.icon className="w-3.5 h-3.5" />
            {m.label}
          </button>
        ))}
      </div>

      {/* PHRASE MODE — 핵심 어구 분석 */}
      {topMode === "phrase" && (() => {
        // 단락별로 묶기
        const byParagraph = sentences.reduce((acc, s) => {
          const key = `${s.paragraph}||${s.paragraphTitle}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(s);
          return acc;
        }, {} as Record<string, AnalyzedSentence[]>);

        return (
          <div className="space-y-6">
            {Object.entries(byParagraph).map(([key, sents]) => {
              const [paraNum, paraTitle] = key.split('||');
              // 이 단락의 keywords + grammarPoints 수집
              const allKeywords = [...new Set(sents.flatMap(s => s.keywords))];
              const allGrammar = sents.flatMap(s =>
                s.grammarPoints.map(gp => ({ ...gp, sentence: s }))
              );

              return (
                <div key={key} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  {/* 단락 헤더 */}
                  <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100 flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-indigo-500 px-2 py-0.5 rounded">{paraNum}단락</span>
                    <span className="text-sm font-bold text-gray-700">{paraTitle}</span>
                  </div>

                  <div className="px-5 py-4 space-y-5">
                    {/* 핵심 단어 */}
                    {allKeywords.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-2">핵심 단어</p>
                        <div className="flex flex-wrap gap-2">
                          {allKeywords.map((kw, i) => (
                            <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-100">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 핵심 어구 (grammarPoints) */}
                    {allGrammar.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-cyan-500 uppercase tracking-wide mb-2">핵심 어구 분석</p>
                        <div className="space-y-3">
                          {allGrammar.map((gp, i) => (
                            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold">{gp.label}</span>
                                <span className="text-xs text-gray-500">문장 {gp.sentence.id}</span>
                              </div>
                              {/* 해당 어구 강조 표시 */}
                              <p className="text-[15px] text-gray-800 leading-relaxed mb-2">
                                {gp.sentence.english.split(gp.highlight).map((part, idx, arr) => (
                                  <span key={idx}>
                                    {part}
                                    {idx < arr.length - 1 && (
                                      <span className="bg-yellow-200 text-gray-900 font-bold px-0.5 rounded">
                                        {gp.highlight}
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </p>
                              <p className="text-sm text-indigo-600 font-medium">{gp.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {allKeywords.length === 0 && allGrammar.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">이 단락에 등록된 핵심 어구가 없습니다.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* BLANK MODE */}
      {topMode === "blank" && (
        <>
          <div className="flex gap-2 mb-5">
            {[
              { key: "grammar" as const, label: "어법", icon: Zap, color: "text-indigo-700" },
              { key: "keyword" as const, label: "키워드", icon: Target, color: "text-cyan-700" },
              { key: "connector" as const, label: "연결어", icon: ArrowRight, color: "text-amber-700" },
            ].map(m => (
              <button
                key={m.key}
                onClick={() => { setBlankMode(m.key); setAnswers({}); setShowResults(false); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  blankMode === m.key ? `bg-white ${m.color} shadow-sm border border-gray-200` : "text-gray-500 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <m.icon className="w-4 h-4" />
                {m.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {sentences.map(s => (
              <div key={s.id} className="p-4 rounded-xl border border-gray-100 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">{s.id}</span>
                  {s.isKeyExam && <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded font-bold">빈출</span>}
                </div>
                {renderSentenceWithBlanks(s)}
                <p className="text-xs text-gray-400 mt-2">{s.korean}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <button onClick={() => { setShowResults(true); setBlankDone(true); if (unscrambleDone && onComplete) onComplete(); }} className="px-6 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 transition-colors">
              <CheckCheck className="w-4 h-4 inline mr-1" />채점하기
            </button>
            <button onClick={() => { setAnswers({}); setShowResults(false); }} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
              <RotateCcw className="w-4 h-4 inline mr-1" />초기화
            </button>
          </div>
        </>
      )}

      {/* UNSCRAMBLE MODE */}
      {topMode === "unscramble" && unscrambleSentence && (
        <div>
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{unscrambleIdx + 1} / {sentences.length}</span>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-green-600 font-bold">{unscrambleScore.correct} 정답</span>
                <span className="text-red-500 font-bold">{unscrambleScore.wrong} 오답</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full" animate={{ width: `${(unscrambleIdx / sentences.length) * 100}%` }} />
            </div>
          </div>

          <div className="mb-4 p-5 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-base text-amber-800">
              <span className="font-bold text-amber-600 mr-1">해석:</span>
              {unscrambleSentence.korean}
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="min-h-[60px] p-3 bg-gray-50 rounded-xl mb-4 flex flex-wrap gap-2 items-center border-2 border-dashed border-gray-200">
              {arrangedWords.length === 0 && <span className="text-sm text-gray-400">아래 단어를 순서대로 배치하세요</span>}
              <AnimatePresence>
                {arrangedWords.map((word, i) => (
                  <motion.button
                    key={`a-${i}-${word}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={() => !unscrambleChecked && removeWord(i)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      unscrambleChecked
                        ? unscrambleCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 cursor-pointer'
                    }`}
                  >
                    {word}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {scrambledWords.map((word, i) => (
                <motion.button
                  key={`s-${i}-${word}`}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => !unscrambleChecked && addWord(word, i)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {word}
                </motion.button>
              ))}
            </div>

            {unscrambleChecked && !unscrambleCorrect && (
              <div className="p-3 bg-green-50 rounded-xl mb-3">
                <p className="text-sm text-green-700"><span className="font-bold">정답:</span> {unscrambleSentence.english}</p>
              </div>
            )}

            {!unscrambleChecked ? (
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
              <button onClick={nextUnscramble}
                className="w-full py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2">
                {unscrambleIdx >= sentences.length - 1 ? '문장 재배열 완료!' : <>다음 문장 <ChevronRight className="w-4 h-4" /></>}
              </button>
            )}
          </div>

          <AnimatePresence>
            {unscrambleChecked && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`mt-4 p-3 rounded-xl text-center font-bold text-sm ${unscrambleCorrect ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {unscrambleCorrect ? '정답입니다! 잘했어요!' : '아쉬워요! 다시 확인해보세요.'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* WRITING MODE */}
      {topMode === "writing" && writingSentence && (
        <div>
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{writingIdx + 1} / {sentences.length}</span>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-green-600 font-bold">{writingScore.correct} 정답</span>
                <span className="text-red-500 font-bold">{writingScore.wrong} 오답</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full" animate={{ width: `${(writingIdx / sentences.length) * 100}%` }} />
            </div>
          </div>

          <div className="mb-4 p-5 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-base text-amber-800">
              <span className="font-bold text-amber-600 mr-1">해석:</span>
              {writingSentence.korean}
            </p>
          </div>

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
                <div className="p-3 bg-gray-50 rounded-xl mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">단어별 채점:</p>
                  <div className="flex flex-wrap gap-1">
                    {writingDiff.map((d, i) => (
                      <span key={i} className={`px-1.5 py-0.5 rounded text-sm font-medium ${d.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 line-through'}`}>
                        {d.word}
                      </span>
                    ))}
                  </div>
                </div>
                {!writingCorrect && (
                  <div className="p-3 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-700"><span className="font-bold">정답:</span> {writingSentence.english}</p>
                  </div>
                )}
              </div>
            )}

            {!writingChecked ? (
              <button onClick={checkWriting} disabled={!writingInput.trim()}
                className={`mt-3 w-full py-3 rounded-xl font-bold transition-colors ${
                  writingInput.trim() ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}>
                정답 확인
              </button>
            ) : (
              <button onClick={nextWriting} disabled={writingIdx >= sentences.length - 1}
                className="mt-3 w-full py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                다음 문장 <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {writingChecked && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`mt-4 p-3 rounded-xl text-center font-bold text-sm ${writingCorrect ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {writingCorrect ? '정답입니다! 잘했어요!' : '아쉬워요! 다시 확인해보세요.'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ===================== Stage 4: 구조 파악 (글의 흐름 + 주제) =====================
function Stage4FlowMastery({ paragraphs, sentences }: { paragraphs: typeof SAMPLE_PARAGRAPHS; sentences: typeof SAMPLE_TB_SENTENCES; onComplete?: () => void }) {
  const [tab, setTab] = useState<'topic' | 'flow'>('topic');

  // ── 주제 파악 ──
  const correctTopic = "우주 팽창 발견의 의의와 팽창 속도에 따른 우주의 운명";
  const topicOptions = [
    "우주 팽창 발견의 의의와 팽창 속도에 따른 우주의 운명",
    "뉴턴이 중력 이론을 완성한 역사적 배경",
    "블랙홀의 형성 과정과 우주 수축의 원인",
    "정적인 우주론과 현대 천문학의 차이점",
  ];
  const [topicAnswer, setTopicAnswer] = useState<number | null>(null);
  const [topicConfirmed, setTopicConfirmed] = useState(false);

  // ── 글의 흐름 ──
  const [shuffled, setShuffled] = useState(() =>
    [...paragraphs].sort(() => Math.random() - 0.5)
  );
  const [arranged, setArranged] = useState<typeof paragraphs>([]);
  const [flowChecked, setFlowChecked] = useState(false);
  const [flowCorrect, setFlowCorrect] = useState(false);

  const addPara = (p: (typeof paragraphs)[0]) => {
    setArranged(prev => [...prev, p]);
    setShuffled(prev => prev.filter(x => x.id !== p.id));
    setFlowChecked(false);
  };
  const removePara = (idx: number) => {
    const p = arranged[idx];
    setArranged(prev => prev.filter((_, i) => i !== idx));
    setShuffled(prev => [...prev, p]);
    setFlowChecked(false);
  };
  const checkFlow = () => {
    const ok = arranged.every((p, i) => p.id === paragraphs[i].id);
    setFlowCorrect(ok);
    setFlowChecked(true);
  };
  const resetFlow = () => {
    setShuffled([...paragraphs].sort(() => Math.random() - 0.5));
    setArranged([]);
    setFlowChecked(false);
  };

  return (
    <div>
      {/* 탭 */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        <button onClick={() => setTab('topic')}
          className={`flex-1 py-3 rounded-lg text-base font-bold transition-all ${tab === 'topic' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}>
          📌 주제 파악
        </button>
        <button onClick={() => setTab('flow')}
          className={`flex-1 py-3 rounded-lg text-base font-bold transition-all ${tab === 'flow' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'}`}>
          🔀 글의 흐름
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ── 주제 파악 ── */}
        {tab === 'topic' && (
          <motion.div key="topic" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* 지문 요약 */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
              <p className="text-sm font-bold text-blue-600 mb-3 uppercase tracking-wide">지문 요약</p>
              {paragraphs.map(p => (
                <div key={p.id} className="mb-2 last:mb-0">
                  <span className="text-xs font-bold text-white bg-blue-400 px-2 py-0.5 rounded mr-2">{p.id}단락</span>
                  <span className="text-base text-blue-900 font-medium">{p.topic}</span>
                </div>
              ))}
            </div>

            <p className="text-xl font-bold text-gray-800 mb-5">이 글의 주제로 가장 적절한 것은?</p>
            <div className="space-y-3">
              {topicOptions.map((opt, i) => {
                const isSelected = topicAnswer === i;
                const isCorrect = opt === correctTopic;
                let cls = "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50";
                if (topicConfirmed && isSelected && isCorrect) cls = "bg-green-50 border-green-400 ring-2 ring-green-200";
                else if (topicConfirmed && isSelected && !isCorrect) cls = "bg-red-50 border-red-400 ring-2 ring-red-200";
                else if (topicConfirmed && isCorrect) cls = "bg-green-50 border-green-300";
                return (
                  <button key={i} onClick={() => { if (!topicConfirmed) setTopicAnswer(i); }}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${cls}`}>
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base font-bold text-gray-600 shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-base text-gray-800">{opt}</span>
                      {topicConfirmed && isCorrect && <span className="ml-auto text-green-500 text-lg">✓</span>}
                      {topicConfirmed && isSelected && !isCorrect && <span className="ml-auto text-red-500 text-lg">✗</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            {topicAnswer !== null && !topicConfirmed && (
              <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => setTopicConfirmed(true)}
                className="mt-5 w-full py-3.5 bg-blue-600 text-white rounded-xl text-base font-bold hover:bg-blue-700">
                정답 확인
              </motion.button>
            )}
            {topicConfirmed && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`mt-5 p-5 rounded-xl text-base font-bold text-center ${topicAnswer !== null && topicOptions[topicAnswer] === correctTopic ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {topicAnswer !== null && topicOptions[topicAnswer] === correctTopic ? '🎉 정답입니다!' : `😅 오답 — 정답: ${correctTopic}`}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── 글의 흐름 ── */}
        {tab === 'flow' && (
          <motion.div key="flow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="text-xl font-bold text-gray-800 mb-2">문단을 글의 순서대로 배열하세요</p>
            <p className="text-base text-gray-500 mb-6">아래에서 선택 → 순서대로 위로 올라갑니다</p>

            {/* 정렬 영역 */}
            <div className="mb-4">
              <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">내 답안</p>
              <div className="min-h-[80px] bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-xl p-3 space-y-2">
                {arranged.length === 0 && (
                  <p className="text-base text-indigo-300 text-center py-4">아래에서 문단을 선택하세요</p>
                )}
                {arranged.map((p, i) => (
                  <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                      flowChecked
                        ? p.id === paragraphs[i].id
                          ? 'bg-green-50 border-green-400'
                          : 'bg-red-50 border-red-400'
                        : 'bg-white border-indigo-200 hover:border-red-300'
                    }`}
                    onClick={() => { if (!flowChecked) removePara(i); }}>
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-base font-medium text-gray-800 flex-1">{p.topic}</span>
                    {flowChecked && (
                      <span className="text-lg">{p.id === paragraphs[i].id ? '✓' : '✗'}</span>
                    )}
                    {!flowChecked && <span className="text-gray-300 text-sm">클릭하여 제거</span>}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 선택지 */}
            <div className="mb-5">
              <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">선택 가능한 문단</p>
              <div className="space-y-2">
                {shuffled.map(p => (
                  <motion.button key={p.id} layout whileTap={{ scale: 0.98 }}
                    onClick={() => addPara(p)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl text-left transition-all">
                    <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold text-base flex items-center justify-center shrink-0">?</span>
                    <span className="text-base font-medium text-gray-800">{p.topic}</span>
                  </motion.button>
                ))}
                {shuffled.length === 0 && arranged.length === paragraphs.length && !flowChecked && (
                  <p className="text-base text-gray-400 text-center py-2">모든 문단이 배치됐습니다 ↑</p>
                )}
              </div>
            </div>

            {/* 확인/리셋 */}
            <div className="flex gap-3">
              {arranged.length === paragraphs.length && !flowChecked && (
                <motion.button initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  onClick={checkFlow}
                  className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl text-base font-bold hover:bg-indigo-700">
                  순서 확인
                </motion.button>
              )}
              <button onClick={resetFlow}
                className="px-5 py-3.5 bg-gray-100 text-gray-600 rounded-xl text-base font-bold hover:bg-gray-200">
                초기화
              </button>
            </div>

            {flowChecked && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-5 rounded-xl text-base font-bold text-center ${flowCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {flowCorrect ? '🎉 완벽한 순서입니다!' : '😅 순서를 다시 확인해 보세요. 초기화 후 재도전!'}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===================== Stage 4: Killer Questions (MockTest Style) =====================
function Stage4KillerTest({ questions, sentences }: { questions: KillerQuestion[]; sentences: AnalyzedSentence[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [testComplete, setTestComplete] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [showPassage, setShowPassage] = useState(false);

  const current = activeQuestions[currentIdx];

  // Timer
  React.useEffect(() => {
    if (!isTimerRunning || testComplete) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, testComplete]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setAnswers(prev => ({ ...prev, [current.id]: idx }));
  };

  const isAnswered = (id: string) => answers[id] !== undefined && answers[id] !== null;
  const checkAnswer = (id: string) => {
    const q = questions.find(q => q.id === id);
    return q ? answers[id] === q.answer : false;
  };
  const getScore = () => activeQuestions.filter(q => checkAnswer(q.id)).length;

  const finishTest = () => { setIsTimerRunning(false); setTestComplete(true); };

  const goNext = () => { if (currentIdx < activeQuestions.length - 1) { setCurrentIdx(prev => prev + 1); setShowResult(false); } };
  const goPrev = () => { if (currentIdx > 0) { setCurrentIdx(prev => prev - 1); setShowResult(false); } };

  const [reportTab, setReportTab] = useState<'score' | 'wrong'>('score');
  const [retryQuestionIds, setRetryQuestionIds] = useState<string[] | null>(null);

  const activeQuestions = retryQuestionIds ? questions.filter(q => retryQuestionIds.includes(q.id)) : questions;

  const wrongQuestions = questions.filter(q => !checkAnswer(q.id));

  const restart = (wrongOnly?: boolean) => {
    const wrongIds = wrongOnly ? wrongQuestions.map(q => q.id) : null;
    setCurrentIdx(0); setAnswers({}); setShowResult(false);
    setTimer(0); setIsTimerRunning(true); setTestComplete(false);
    setReviewMode(false); setShowPassage(false); setReportTab('score');
    setRetryQuestionIds(wrongIds);
  };

  // Group sentences by paragraph
  const sentencesByParagraph = useMemo(() => {
    const paragraphs = Array.from(new Set(sentences.map(s => s.paragraph))).sort();
    return paragraphs.map(pId => ({
      id: pId,
      title: sentences.find(s => s.paragraph === pId)?.paragraphTitle || '',
      sentences: sentences.filter(s => s.paragraph === pId),
    }));
  }, [sentences]);

  // Passage panel
  const PassagePanel = () => (
    <div className="mb-5">
      <button
        onClick={() => setShowPassage(!showPassage)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
          showPassage ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50'
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
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="mt-2 bg-white border border-gray-200 rounded-xl max-h-[320px] overflow-y-auto">
              <div className="p-4 space-y-4">
                {sentencesByParagraph.map((group, gi) => (
                  <div key={gi}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{group.id}연</span>
                      <span className="text-xs text-gray-400">{group.title}</span>
                    </div>
                    <div className="space-y-2">
                      {group.sentences.map(s => (
                        <div key={s.id} className="group">
                          <p className={`text-sm leading-relaxed ${s.isKeyExam ? 'text-gray-800 font-medium' : 'text-gray-700'}`}>
                            <span className="text-xs text-gray-300 mr-1.5">{s.id}.</span>{s.english}
                          </p>
                        </div>
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

  // === FINAL REPORT ===
  if (testComplete) {
    const score = getScore();
    const percentage = Math.round((score / activeQuestions.length) * 100);
    const isPerfect = score === activeQuestions.length;
    const wrongOnes = activeQuestions.filter(q => !checkAnswer(q.id));

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Report Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${isPerfect ? 'bg-yellow-100' : percentage >= 70 ? 'bg-green-100' : 'bg-red-100'}`}
          >
            {isPerfect ? <Trophy className="w-12 h-12 text-yellow-500" /> : percentage >= 70 ? <CheckCircle2 className="w-12 h-12 text-green-500" /> : <AlertCircle className="w-12 h-12 text-red-400" />}
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {retryQuestionIds ? '오답 재도전 결과' : '최종 리포트'}
          </h2>
          <p className="text-sm text-gray-400">
            {isPerfect ? 'Perfect! 모든 문제를 맞혔습니다!' : percentage >= 70 ? '잘했어요! 조금만 더 노력하면 완벽해요.' : '틀린 문제를 복습하고 다시 도전해보세요.'}
          </p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-cyan-600">{score}<span className="text-lg text-gray-400">/{activeQuestions.length}</span></p>
            <p className="text-xs text-gray-400 mt-1">정답</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-3xl font-bold ${percentage >= 70 ? 'text-green-600' : 'text-red-500'}`}>{percentage}%</p>
            <p className="text-xs text-gray-400 mt-1">정답률</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-gray-700">{formatTime(timer)}</p>
            <p className="text-xs text-gray-400 mt-1">소요시간</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
          <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, delay: 0.3 }}
            className={`h-full rounded-full ${isPerfect ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : percentage >= 70 ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`} />
        </div>

        {/* Tabs: 점수 / 오답노트 */}
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1">
          {[
            { key: 'score' as const, label: '점수 요약', icon: Star },
            { key: 'wrong' as const, label: `오답노트 (${wrongOnes.length})`, icon: XCircle },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setReportTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                reportTab === t.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {reportTab === 'score' ? (
          <div className="space-y-3">
            {/* Per-question summary */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-700">문제별 결과</span>
              </div>
              <div className="divide-y divide-gray-50">
                {activeQuestions.map((q, idx) => {
                  const correct = checkAnswer(q.id);
                  return (
                    <div key={q.id} className="flex items-center gap-3 px-4 py-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {idx + 1}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        q.type === 'Grammar' ? 'bg-purple-50 text-purple-600' :
                        q.type === 'Blank Inference' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>{q.type}</span>
                      <span className="flex-1 text-sm text-gray-600 truncate">{q.question.split('\n')[0]}</span>
                      {correct ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {wrongOnes.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-lg font-bold text-gray-700">오답이 없습니다!</p>
                <p className="text-sm text-gray-400 mt-1">모든 문제를 정확히 풀었어요.</p>
              </div>
            ) : (
              <>
                <PassagePanel />
                {wrongOnes.map((q, idx) => {
                  const userAnswer = answers[q.id];
                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-xl border border-red-200 overflow-hidden"
                    >
                      <div className="px-5 py-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {activeQuestions.indexOf(q) + 1}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          q.type === 'Grammar' ? 'bg-purple-100 text-purple-700' :
                          q.type === 'Blank Inference' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>{q.type}</span>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
                          q.difficulty === 'killer' ? 'bg-red-100 text-red-600' : q.difficulty === 'hard' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                        }`}>{q.difficulty}</span>
                      </div>
                      <div className="p-5">
                        <p className="text-base text-gray-800 whitespace-pre-line mb-4">{q.question}</p>
                        <div className="space-y-2 mb-4">
                          {q.options.map((opt, i) => (
                            <div key={i} className={`px-4 py-2.5 rounded-lg text-sm ${
                              i === q.answer ? 'bg-green-50 border border-green-200 text-green-700 font-bold' :
                              i === userAnswer ? 'bg-red-50 border border-red-200 text-red-600 line-through' :
                              'bg-gray-50 text-gray-500'
                            }`}>
                              {String.fromCharCode(65 + i)}. {opt}
                              {i === q.answer && <CheckCircle2 className="inline w-4 h-4 ml-2" />}
                              {i === userAnswer && i !== q.answer && <XCircle className="inline w-4 h-4 ml-2" />}
                            </div>
                          ))}
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <p className="text-xs font-bold text-amber-600 mb-1 flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5" /> Explanation</p>
                          <p className="text-sm text-amber-800">{q.explanation}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          {wrongOnes.length > 0 && (
            <button
              onClick={() => restart(true)}
              className="flex-1 py-3.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" /> 틀린 문제만 다시 풀기
            </button>
          )}
          <button
            onClick={() => restart()}
            className="flex-1 py-3.5 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" /> 전체 다시 풀기
          </button>
        </div>
      </motion.div>
    );
  }

  // === TEST MODE ===
  return (
    <div>
      {/* Timer & Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-500" />
          <span className="text-xl font-mono font-bold text-gray-700">{formatTime(timer)}</span>
        </div>
        <span className="text-base font-medium text-gray-500">{currentIdx + 1} / {activeQuestions.length}</span>
      </div>

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
        <motion.div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full" animate={{ width: `${((currentIdx + 1) / activeQuestions.length) * 100}%` }} />
      </div>

      {/* Passage Panel */}
      <PassagePanel />

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 min-h-[400px]"
        >
          <span className={`inline-block px-3.5 py-1.5 rounded-full text-sm font-bold mb-5 ${
            current.type === 'Grammar' ? 'bg-purple-100 text-purple-700' :
            current.type === 'Blank Inference' ? 'bg-blue-100 text-blue-700' :
            current.type === 'Ordering' ? 'bg-amber-100 text-amber-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {current.type}
          </span>

          <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line mb-6">{current.question}</p>

          <div className="space-y-3">
            {current.options.map((opt, i) => {
              const isSelected = answers[current.id] === i;
              const isCorrectOpt = showResult && i === current.answer;
              const isWrongOpt = showResult && isSelected && i !== current.answer;

              return (
                <button
                  key={i}
                  onClick={() => !showResult && handleAnswer(i)}
                  disabled={showResult}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 text-base transition-all ${
                    showResult
                      ? isCorrectOpt ? 'border-green-400 bg-green-50 text-green-700' :
                        isWrongOpt ? 'border-red-400 bg-red-50 text-red-700' :
                        'border-gray-100 bg-gray-50 text-gray-500'
                      : isSelected ? 'border-cyan-500 bg-cyan-50 text-cyan-700' :
                        'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="font-medium">{String.fromCharCode(65 + i)}. {opt}</span>
                  {showResult && isCorrectOpt && <CheckCircle2 className="inline w-5 h-5 ml-2 text-green-500" />}
                  {showResult && isWrongOpt && <XCircle className="inline w-5 h-5 ml-2 text-red-500" />}
                </button>
              );
            })}
          </div>

          {showResult && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-sm font-bold text-amber-600 mb-2">Explanation</p>
              <p className="text-base text-amber-800">{current.explanation}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button onClick={goPrev} disabled={currentIdx === 0} className="px-5 py-3 text-base font-medium text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-30">
          이전
        </button>
        <div className="flex gap-3">
          {!showResult ? (
            <button
              onClick={() => setShowResult(true)}
              disabled={!isAnswered(current.id)}
              className={`px-6 py-3 rounded-xl text-base font-bold transition-colors ${
                isAnswered(current.id) ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              정답 확인
            </button>
          ) : currentIdx === activeQuestions.length - 1 ? (
            <button onClick={finishTest} className="px-6 py-3 bg-cyan-600 text-white rounded-xl text-base font-bold hover:bg-cyan-700 transition-colors">시험 완료</button>
          ) : (
            <button onClick={goNext} className="px-6 py-3 bg-cyan-600 text-white rounded-xl text-base font-bold hover:bg-cyan-700 transition-colors flex items-center gap-1.5">
              다음 <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Question Nav Dots */}
      <div className="flex flex-wrap gap-2 mt-6 justify-center">
        {activeQuestions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => { setCurrentIdx(i); setShowResult(false); }}
            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
              i === currentIdx ? 'bg-cyan-600 text-white' :
              isAnswered(q.id) ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

// ===================== AI Analysis API Call =====================
async function analyzePassageWithAI(passage: string): Promise<{
  sentences: AnalyzedSentence[];
  vocab: VocaCard[];
  killerQuestions: KillerQuestion[];
  paragraphs: { id: number; topic: string; structure: string }[];
  tbSentences: { id: number; english: string; korean: string; chunks: string[]; importance: "high" | "mid" | "low"; paragraphId: number }[];
}> {
  const GLM_API_KEY = "dc2213720f4b4a88ae06ddbd434ab1dd.qDGcLtBM9gGqp6ff";

  const prompt = `You are an expert Korean high school English teacher. Analyze the following English passage for Korean students (내신 대비).

PASSAGE:
"""
${passage}
"""

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:

{
  "paragraphs": [
    { "id": 1, "topic": "단락 주제 (한국어)", "structure": "전개방식 (한국어, 예: 도입, 전개, 결론)" }
  ],
  "sentences": [
    {
      "id": 1,
      "english": "exact sentence from passage",
      "korean": "정확한 한국어 해석",
      "chunks": ["끊어읽기 단위1", "단위2", "단위3"],
      "grammarPoints": [
        {
          "type": "문법 유형 (예: 동격 that절)",
          "label": "짧은 레이블 (예: 동격)",
          "description": "문법 설명 (한국어)",
          "highlight": "해당 구문 (영어 원문 그대로)",
          "quizType": "grammar_select_all"
        }
      ],
      "keywords": ["핵심단어1", "핵심단어2"],
      "connectors": ["연결어1"],
      "difficulty": "easy|medium|hard",
      "isKeyExam": true|false,
      "paragraph": 1,
      "paragraphTitle": "단락 주제",
      "paragraphSubtitle": "전개방식"
    }
  ],
  "tbSentences": [
    {
      "id": 1,
      "english": "exact sentence",
      "korean": "한국어 해석",
      "chunks": ["chunk1", "chunk2"],
      "importance": "high|mid|low",
      "paragraphId": 1
    }
  ],
  "vocab": [
    {
      "id": "v1",
      "word": "영단어",
      "meaning": "한국어 의미",
      "pos": "n|v|adj|adv",
      "synonyms": ["synonym1"],
      "antonyms": ["antonym1"],
      "contextSentence": "예문 (지문에서)"
    }
  ],
  "killerQuestions": [
    {
      "id": "q1",
      "type": "Grammar|Blank Inference|Ordering|Content Match",
      "question": "문제 (한국어/영어 혼용)",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4", "선택지5"],
      "answer": 0,
      "explanation": "해설 (한국어)",
      "difficulty": "killer|hard|medium"
    }
  ]
}

Rules:
- Split passage into logical paragraphs (1-4 paragraphs)
- Extract ALL sentences from the passage
- sentences and tbSentences should match (same sentences, different format)
- vocab: pick 6-10 important words
- killerQuestions: create exactly 4-5 challenging exam questions (Grammar, Blank Inference, Ordering, Content Match types)
- grammarPoints: identify key grammar for each sentence (can be empty array)
- isKeyExam: mark ~40% of sentences as true
- highlight field must be exact substring of the english sentence`;

  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: "glm-4-flash",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ===================== Main Dashboard (Input) =====================
function InputDashboard({ onAnalyze }: { onAnalyze: (text: string, aiData: Awaited<ReturnType<typeof analyzePassageWithAI>> | null) => void }) {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gauges, setGauges] = useState({ syntax: 0, vocab: 0, exam: 0 });
  const [analysisStep, setAnalysisStep] = useState("");

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error("지문을 입력해 주세요.");
      return;
    }
    setIsAnalyzing(true);
    setGauges({ syntax: 0, vocab: 0, exam: 0 });

    // Animate gauges while waiting
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setGauges({
        syntax: Math.min(step * 3, 90),
        vocab: Math.min(step * 2.5, 85),
        exam: Math.min(step * 3.5, 92),
      });
    }, 200);

    try {
      setAnalysisStep("구문 분석 중...");
      setTimeout(() => setAnalysisStep("어휘 등급 분류 중..."), 3000);
      setTimeout(() => setAnalysisStep("내신 문제 생성 중..."), 6000);

      const aiData = await analyzePassageWithAI(text);
      clearInterval(interval);
      setGauges({ syntax: 100, vocab: 100, exam: 100 });

      setTimeout(() => {
        onAnalyze(text, aiData);
        setIsAnalyzing(false);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      console.error("AI analysis error:", err);
      toast.error("AI 분석 중 오류가 발생했습니다. 샘플 데이터로 진행합니다.");
      setTimeout(() => {
        onAnalyze(text, null);
        setIsAnalyzing(false);
      }, 500);
    }
  };

  const loadSample = () => {
    setText(SAMPLE_PASSAGE);
    toast.success("샘플 지문이 로드되었습니다!");
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">SGR AI 내신 분석</h1>
        <p className="text-gray-500">지문을 넣으면 AI가 구문 분석, 어휘 등급, 내신 빈출 포인트를 자동으로 분석합니다</p>
      </motion.div>

      {/* Input Area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="지문을 붙여넣으세요..."
          className="w-full h-48 p-5 border-2 border-gray-200 rounded-2xl text-[15px] leading-relaxed resize-none focus:border-cyan-400 focus:outline-none transition-colors"
        />
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={loadSample}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200"
          >
            <FileText className="w-3.5 h-3.5 inline mr-1" />샘플 지문
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200">
            <Upload className="w-3.5 h-3.5 inline mr-1" />PDF/이미지
          </button>
        </div>
      </div>

      {/* AI Analysis Gauges */}
      {isAnalyzing && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2.5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-cyan-500 animate-pulse" />
            <span className="text-sm font-bold text-gray-700">{analysisStep || "AI 분석 중..."}</span>
          </div>
          <AnalysisGauge progress={gauges.syntax} label="구문 난이도" />
          <AnalysisGauge progress={gauges.vocab} label="어휘 등급" />
          <AnalysisGauge progress={gauges.exam} label="내신 빈출도" />
        </motion.div>
      )}

      {/* Analyze Button */}
      <div className="flex justify-center mt-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAnalyze}
          disabled={isAnalyzing || !text.trim()}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              AI 분석 시작
            </>
          )}
        </motion.button>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 mt-8 justify-center">
        {[
          { icon: BookOpen, label: "직독직해" },
          { icon: Layers, label: "어휘 챌린지" },
          { icon: Target, label: "구조 암기" },
          { icon: Brain, label: "구조 파악" },
          { icon: Zap, label: "실전 테스트" },
        ].map((f, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600">
            <f.icon className="w-3.5 h-3.5 text-cyan-500" />
            {f.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== Main Component =====================
export default function EnglishAI() {
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  // AI-generated data (null = use sample)
  const [aiSentences, setAiSentences] = useState<AnalyzedSentence[] | null>(null);
  const [aiVocab, setAiVocab] = useState<VocaCard[] | null>(null);
  const [aiKillerQuestions, setAiKillerQuestions] = useState<KillerQuestion[] | null>(null);
  const [aiParagraphs, setAiParagraphs] = useState<typeof SAMPLE_PARAGRAPHS | null>(null);
  const [aiTbSentences, setAiTbSentences] = useState<typeof SAMPLE_TB_SENTENCES | null>(null);

  // Active data (AI if available, else sample)
  const activeSentences = aiSentences ?? SAMPLE_SENTENCES;
  const activeVocab = aiVocab ?? SAMPLE_VOCAB;
  const activeKillerQuestions = aiKillerQuestions ?? SAMPLE_KILLER_QUESTIONS;
  const activeParagraphs = aiParagraphs ?? SAMPLE_PARAGRAPHS;
  const activeTbSentences = aiTbSentences ?? SAMPLE_TB_SENTENCES;

  // Build MasteryLesson-compatible object for download helpers
  const buildLessonForDownload = () => ({
    id: 'ai-english-1',
    title: aiSentences ? 'AI 분석 지문' : 'Lesson 1: My New Friends',
    subject: '영어',
    category: '내신영어',
    vocabulary: activeVocab.map(v => ({
      id: v.id, word: v.word, meaning: v.meaning, pos: v.pos,
      example: v.contextSentence, exampleKo: '',
      synonym: v.synonyms.join(', '), antonym: v.antonyms.join(', '),
    })),
    sentences: activeTbSentences,
    problems: [
      ...activeSentences.filter(s => s.grammarPoints.length > 0).slice(0, 3).map((s, i) => {
        const gp = s.grammarPoints[0];
        const blanked = s.english.replace(gp.highlight, '_________');
        return {
          id: `blank-${i}`,
          type: 'short_answer' as const,
          question: `[빈칸넣기] 다음 문장의 빈칸에 알맞은 표현을 쓰시오.\n\n${blanked}`,
          options: [] as string[],
          answer: gp.highlight,
          explanation: gp.description,
        };
      }),
      ...activeKillerQuestions.map((q, i) => ({
        id: q.id,
        type: 'multiple_choice' as const,
        question: q.question,
        options: q.options.map((opt, j) => `${String.fromCharCode(65 + j)}. ${opt}`),
        answer: String.fromCharCode(65 + q.answer),
        explanation: q.explanation,
      })),
    ],
    paragraphs: activeParagraphs,
  });

  const handleDownloadPDF = () => {
    setShowDownloadMenu(false);
    downloadMasteryExamPDF(buildLessonForDownload());
    toast.success("시험지+정답지 PDF 인쇄 창이 열립니다!");
  };

  const handleDownloadWord = () => {
    setShowDownloadMenu(false);
    downloadMasteryExamWord(buildLessonForDownload());
    toast.success("시험지+정답지 Word 다운로드를 시작합니다!");
  };

  const handleDownloadVoca = () => {
    setShowDownloadMenu(false);
    downloadMasteryVocaPDF(buildLessonForDownload());
    toast.success("단어 시험지 PDF 인쇄 창이 열립니다!");
  };

  const handleAnalyze = (text: string, aiData: Awaited<ReturnType<typeof analyzePassageWithAI>> | null) => {
    if (aiData) {
      setAiSentences(aiData.sentences);
      setAiVocab(aiData.vocab);
      setAiKillerQuestions(aiData.killerQuestions);
      setAiParagraphs(aiData.paragraphs);
      setAiTbSentences(aiData.tbSentences);
      toast.success("AI 분석 완료! 지문 맞춤 학습 콘텐츠가 생성되었습니다 🎉");
    } else {
      setAiSentences(null);
      setAiVocab(null);
      setAiKillerQuestions(null);
      setAiParagraphs(null);
      setAiTbSentences(null);
    }
    setIsAnalyzed(true);
    setCurrentStage(1);
  };

  const handleBack = () => {
    setIsAnalyzed(false);
    setCurrentStage(1);
  };

  const stages = [
    { stage: 1, label: "직독직해", icon: BookOpen },
    { stage: 2, label: "어휘 챌린지", icon: Layers },
    { stage: 3, label: "구조 암기", icon: Target },
    { stage: 4, label: "구조 파악", icon: Brain },
    { stage: 5, label: "실전 테스트", icon: Zap },
  ];

  return (
    <div>
      {!isAnalyzed ? (
        <div className="p-4 md:p-6">
          <InputDashboard onAnalyze={handleAnalyze} />
        </div>
      ) : (
        <div className="p-4 md:p-6">
          {/* Lesson Header with Download + Back */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button onClick={handleBack} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4 text-gray-600 rotate-180" />
                </button>
                <div>
                  <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full">
                    {aiSentences ? "🤖 AI 분석 완료" : "중등영어1-1"}
                  </span>
                  <h2 className="text-xl font-bold text-gray-800 mt-2">
                    {aiSentences ? `AI 맞춤 분석 (${activeSentences.length}문장)` : "Lesson 1: My New Friends"}
                  </h2>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" /> 다운로드
                </button>
                <AnimatePresence>
                  {showDownloadMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden"
                    >
                      <button
                        onClick={handleDownloadPDF}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" /> 시험지+정답지 (PDF)
                      </button>
                      <button
                        onClick={handleDownloadWord}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors border-t border-gray-100"
                      >
                        <FileDown className="w-3.5 h-3.5" /> 시험지+정답지 (Word)
                      </button>
                      <button
                        onClick={handleDownloadVoca}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors border-t border-gray-100"
                      >
                        <Zap className="w-3.5 h-3.5" /> 단어 시험지 (PDF)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Stage Navigation — 자유 클릭 */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            {stages.map((s) => {
              const Icon = s.icon;
              const isActive = currentStage === s.stage;
              return (
                <button key={s.stage} onClick={() => setCurrentStage(s.stage)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive ? "bg-cyan-600 text-white shadow-md scale-105" : "bg-gray-100 text-gray-600 hover:bg-cyan-50 hover:text-cyan-700"
                  }`}>
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">S{s.stage}</span>
                </button>
              );
            })}
          </div>

          {/* 단순 진행 표시 */}
          <div className="flex items-center gap-2 mb-6">
            {stages.map((s) => (
              <div key={s.stage} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full transition-all ${
                currentStage === s.stage ? "bg-cyan-500 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {currentStage === s.stage && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />}
                {s.stage}
              </div>
            ))}
            <span className="text-xs text-gray-400 ml-1">{currentStage}/{stages.length}</span>
          </div>

          {/* Stage Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentStage === 1 && <Stage1DirectReading sentences={activeSentences} onComplete={() => {}} />}
              {currentStage === 2 && <Stage2VocaChallenge vocab={activeVocab} onComplete={() => {}} />}
              {currentStage === 3 && <Stage3StructuralMemory sentences={activeSentences} onComplete={() => {}} />}
              {currentStage === 4 && (
                <Stage4FlowMastery paragraphs={activeParagraphs} sentences={activeTbSentences} onComplete={() => setCurrentStage(5)} />
              )}
              {currentStage === 5 && <Stage4KillerTest questions={activeKillerQuestions} sentences={activeSentences} />}
            </motion.div>
          </AnimatePresence>

          {/* Bottom Stage Navigation */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-200">
            <button
              onClick={() => setCurrentStage(prev => Math.max(prev - 1, 1))}
              disabled={currentStage === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                currentStage === 1
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              이전 단계
            </button>
            <span className="text-sm text-gray-500 font-medium">
              {currentStage} / {stages.length} 단계
            </span>
            <button
              onClick={() => setCurrentStage(prev => Math.min(prev + 1, stages.length))}
              disabled={currentStage === stages.length}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                currentStage === stages.length
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-cyan-600 text-white hover:bg-cyan-700 shadow-md"
              }`}
            >
              다음 단계
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}