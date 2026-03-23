import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, Loader2, Star, ChevronDown, ChevronUp, Award, RefreshCw, PenLine, Wand2 } from "lucide-react";
import type { ParagraphItem, SentenceItem } from "./types";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7db3bef3`;

interface ParagraphSummaryProps {
  paragraphs: ParagraphItem[];
  sentences: SentenceItem[];
  lessonTitle: string;
}

interface AISummary {
  paragraphId: number;
  topicKo: string;
  keywords: string[];
  summaryEn: string;
}

interface GradingResult {
  score: number;
  grade: string;
  accuracy?: { score: number; comment: string };
  completeness?: { score: number; comment: string };
  language?: { score: number; comment: string };
  overallComment: string;
  improvedVersion?: string;
}

export function ParagraphSummary({ paragraphs, sentences, lessonTitle }: ParagraphSummaryProps) {
  const [aiSummaries, setAiSummaries] = useState<AISummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Student writing
  const [studentInputs, setStudentInputs] = useState<Record<number, string>>({});
  const [gradingResults, setGradingResults] = useState<Record<number, GradingResult>>({});
  const [gradingLoading, setGradingLoading] = useState<Record<number, boolean>>({});

  // UI
  const [expandedParagraphs, setExpandedParagraphs] = useState<Set<number>>(new Set());
  const [showStudentMode, setShowStudentMode] = useState(false);

  const toggleExpanded = (id: number) => {
    setExpandedParagraphs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group sentences by paragraph
  const getSentencesForParagraph = (pId: number) =>
    sentences.filter(s => s.paragraphId === pId);

  // ── AI 자동 요약 생성 ──
  const generateAISummaries = async () => {
    setLoading(true);
    setError(null);
    try {
      const paragraphData = paragraphs.map(p => ({
        id: p.id,
        topic: p.topic,
        structure: p.structure,
        sentences: getSentencesForParagraph(p.id).map(s => ({
          english: s.english,
          korean: s.korean,
        })),
      }));

      const res = await fetch(`${API_BASE}/ai/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ lessonTitle, paragraphs: paragraphData }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Server error ${res.status}: ${errBody}`);
      }

      const data = await res.json();
      setAiSummaries(data.summaries || []);
      // Expand all paragraphs to show results
      setExpandedParagraphs(new Set(paragraphs.map(p => p.id)));
    } catch (err: any) {
      console.error("AI summarize error:", err);
      setError(err.message || "AI 요약 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  // ── 학생 요약 채점 ──
  const gradeStudentSummary = async (paragraphId: number) => {
    const text = studentInputs[paragraphId]?.trim();
    if (!text) return;

    setGradingLoading(prev => ({ ...prev, [paragraphId]: true }));
    try {
      const pSentences = getSentencesForParagraph(paragraphId);
      const paragraph = paragraphs.find(p => p.id === paragraphId);

      const res = await fetch(`${API_BASE}/ai/grade-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          studentSummary: text,
          paragraphTopic: paragraph?.topic || "",
          sentences: pSentences.map(s => ({ english: s.english, korean: s.korean })),
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Grading error ${res.status}: ${errBody}`);
      }

      const data = await res.json();
      setGradingResults(prev => ({ ...prev, [paragraphId]: data }));
    } catch (err: any) {
      console.error("Grading error:", err);
      setGradingResults(prev => ({
        ...prev,
        [paragraphId]: {
          score: 0,
          grade: "Error",
          overallComment: err.message || "채점 실패. 다시 시도해주세요.",
        },
      }));
    } finally {
      setGradingLoading(prev => ({ ...prev, [paragraphId]: false }));
    }
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getStarCount = (score: number) => {
    if (score >= 90) return 5;
    if (score >= 75) return 4;
    if (score >= 60) return 3;
    if (score >= 40) return 2;
    return 1;
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={generateAISummaries}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-bold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 shadow-md"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          {loading ? "AI 분석 중..." : "AI 자동 요약"}
        </button>

        <button
          onClick={() => setShowStudentMode(!showStudentMode)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            showStudentMode
              ? "bg-cyan-600 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <PenLine className="w-4 h-4" />
          내가 요약하기
        </button>

        {aiSummaries.length > 0 && (
          <button
            onClick={() => { setAiSummaries([]); setExpandedParagraphs(new Set()); }}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 초기화
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Paragraph Cards */}
      <div className="space-y-3">
        {paragraphs.map((p) => {
          const pSentences = getSentencesForParagraph(p.id);
          const aiSummary = aiSummaries.find(s => s.paragraphId === p.id);
          const isExpanded = expandedParagraphs.has(p.id);
          const grading = gradingResults[p.id];
          const isGrading = gradingLoading[p.id];

          return (
            <motion.div
              key={p.id}
              layout
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => toggleExpanded(p.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-sm font-bold text-amber-700">
                    {p.id}
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-gray-800">{p.topic}</h4>
                    <p className="text-xs text-gray-400">{p.structure} | {pSentences.length}문장</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {aiSummary && (
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI
                    </span>
                  )}
                  {grading && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getGradeColor(grading.score)}`}>
                      {grading.score}점
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                      {/* Original sentences */}
                      <div className="bg-gray-50 rounded-lg p-5">
                        <p className="text-sm font-bold text-gray-500 mb-2">원문</p>
                        <div className="space-y-1.5">
                          {pSentences.map(s => (
                            <p key={s.id} className="text-base text-gray-700 leading-relaxed">
                              {s.english}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* AI Summary */}
                      {aiSummary && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100"
                        >
                          <p className="text-xs font-bold text-purple-600 mb-2 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI 요약
                          </p>
                          <p className="text-sm text-gray-800 font-medium mb-2">
                            {aiSummary.summaryEn}
                          </p>
                          <p className="text-xs text-purple-700 mb-2">
                            <span className="font-bold">주제:</span> {aiSummary.topicKo}
                          </p>
                          {aiSummary.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {aiSummary.keywords.map((kw, i) => (
                                <span key={i} className="text-xs bg-white text-purple-600 px-2 py-0.5 rounded-full border border-purple-200">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Student Summary Input */}
                      {showStudentMode && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-cyan-600 flex items-center gap-1">
                            <PenLine className="w-3 h-3" /> 나의 요약 (영어 또는 한국어)
                          </p>
                          <textarea
                            value={studentInputs[p.id] || ""}
                            onChange={(e) =>
                              setStudentInputs(prev => ({ ...prev, [p.id]: e.target.value }))
                            }
                            placeholder="이 문단을 1-2문장으로 요약해보세요..."
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:border-cyan-400 focus:outline-none"
                            rows={3}
                          />
                          <button
                            onClick={() => gradeStudentSummary(p.id)}
                            disabled={isGrading || !studentInputs[p.id]?.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-bold hover:bg-cyan-700 transition-colors disabled:opacity-40"
                          >
                            {isGrading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            {isGrading ? "채점 중..." : "AI 채점"}
                          </button>

                          {/* Grading Result */}
                          {grading && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`rounded-lg p-4 border ${getGradeColor(grading.score)}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Award className="w-5 h-5" />
                                  <span className="text-lg font-bold">{grading.score}점</span>
                                  <span className="text-sm font-medium">({grading.grade})</span>
                                </div>
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < getStarCount(grading.score)
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Sub-scores */}
                              {grading.accuracy && (
                                <div className="space-y-1.5 mb-3">
                                  {[
                                    { label: "정확성", data: grading.accuracy },
                                    { label: "완전성", data: grading.completeness },
                                    { label: "언어", data: grading.language },
                                  ].filter(item => item.data).map((item) => (
                                    <div key={item.label} className="flex items-center gap-2 text-xs">
                                      <span className="font-bold w-12">{item.label}</span>
                                      <div className="flex-1 h-1.5 bg-white/50 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-current rounded-full transition-all"
                                          style={{ width: `${item.data!.score}%` }}
                                        />
                                      </div>
                                      <span className="font-bold w-8 text-right">{item.data!.score}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <p className="text-sm leading-relaxed">{grading.overallComment}</p>

                              {grading.improvedVersion && (
                                <div className="mt-3 p-2.5 bg-white/60 rounded-lg">
                                  <p className="text-xs font-bold mb-1">모범 답안:</p>
                                  <p className="text-sm text-gray-700">{grading.improvedVersion}</p>
                                </div>
                              )}
                            </motion.div>
                          )}
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
    </div>
  );
}