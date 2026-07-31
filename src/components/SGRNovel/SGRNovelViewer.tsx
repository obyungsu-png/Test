import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Moon, Sun,
  BookOpen, ImageIcon, Eye, EyeOff,
  FileText, HelpCircle, Users, Quote, Layers,
  Zap, Highlighter, Download, Library, Sparkles, Clock, ExternalLink,
} from "lucide-react";
import type { SGRNovel, NovelChapter, NovelQuiz, NovelTheme, NovelCharacter, NovelQuote, DirectReadingItem } from "./types";
import { loadNovels, NOVEL_EVENT, syncNovelsFromServer } from "./types";
import { ToeflAiWidget } from "../ToeflAiWidget";
import { WordPopup } from "../SGRClass/WordPopup";
import { AiActionPopup } from "../SGRClass/AiActionPopup";
import { ReadingReviewPassage } from "../SGRClass/ReadingReviewPassage";
import { ReadingReviewActions } from "../SGRClass/ReadingReviewToolbar";
import { DrawingCanvas } from "../SGRClass/DrawingCanvas";
import "../../utils/sgrNovelApi"; // 서버 연동 함수 등록
import { useAnswers, isTextCorrect, type AnswerValue } from "../SGRClass/answerState";

// ─── inline formatter: **bold**, __underline__, ___blank___ ──
function formatInline(text: string, showAnswer: boolean, answer?: string) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const patterns: Array<{
    regex: RegExp;
    render: (m: string) => React.ReactNode;
  }> = [
    {
      regex: /\*\*(.+?)\*\*/,
      render: (m) => <strong className="text-amber-700 dark:text-amber-300 font-bold">{m}</strong>,
    },
    {
      regex: /__(.+?)__/,
      render: (m) => <u className="decoration-2">{m}</u>,
    },
    {
      regex: /___+/,
      render: () =>
        showAnswer && answer ? (
          <span className="inline-block min-w-[100px] px-2 border-b-2 border-amber-500 text-amber-600 dark:text-amber-300 font-bold">
            {answer}
          </span>
        ) : (
          <span className="inline-block min-w-[100px] border-b-2 border-gray-400 dark:border-gray-500" />
        ),
    },
  ];

  while (remaining.length > 0) {
    let earliest = -1;
    let matchIdx = -1;
    let matched: RegExpMatchArray | null = null;

    for (let i = 0; i < patterns.length; i++) {
      const m = remaining.match(patterns[i].regex);
      if (m && m.index !== undefined) {
        if (earliest === -1 || m.index < earliest) {
          earliest = m.index;
          matched = m;
          matchIdx = i;
        }
      }
    }
    if (!matched || earliest === -1) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
    if (earliest > 0) parts.push(<span key={key++}>{remaining.slice(0, earliest)}</span>);
    parts.push(<span key={key++}>{patterns[matchIdx].render(matched[1] || "")}</span>);
    remaining = remaining.slice(earliest + matched[0].length);
  }
  return <>{parts}</>;
}

// ─── Read (챕터 본문) ───────────────────────────────
function PageRead({ chapter, dark }: { chapter: NovelChapter; dark: boolean }) {
  return (
    <div className="max-w-[820px] mx-auto p-6 lg:p-10">
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="text-xs font-bold tracking-widest text-amber-600 dark:text-amber-400 mb-1">
          {chapter.chapterNumber}
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-gray-800 dark:text-gray-100 mb-2">
          {chapter.title}
        </h1>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {chapter.readingTime ? (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> 약 {chapter.readingTime}분
            </span>
          ) : null}
          {(chapter.pdfUrl || chapter.epubUrl) && (
            <div className="flex items-center gap-2">
              {chapter.pdfUrl && (
                <a href={chapter.pdfUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 font-bold hover:bg-red-100">
                  <FileText className="w-3 h-3" /> PDF
                </a>
              )}
              {chapter.epubUrl && (
                <a href={chapter.epubUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 font-bold hover:bg-emerald-100">
                  <BookOpen className="w-3 h-3" /> EPUB
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        {chapter.contentParagraphs.length === 0 ? (
          <p className="text-gray-400 italic">이 챕터에 본문이 없습니다. CMS에서 등록해주세요.</p>
        ) : (
          chapter.contentParagraphs.map((p, i) => (
            <div key={p.id} className="mb-5">
              <p className="text-base lg:text-[17px] leading-[1.9] text-gray-800 dark:text-gray-200">
                {formatInline(p.content, false)}
              </p>
              {p.image && (
                <figure className="my-4">
                  <img src={p.image} alt={p.imageCaption || ""} className="rounded-lg shadow-md w-full" />
                  {p.imageCaption && (
                    <figcaption className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                      {p.imageCaption}
                    </figcaption>
                  )}
                </figure>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Plot Summary ───────────────────────────────────
function PagePlot({ chapter, dark }: { chapter: NovelChapter; dark: boolean }) {
  return (
    <div className="max-w-[820px] mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Plot Summary</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{chapter.chapterNumber} · {chapter.title}</p>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-amber-100 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-6 mb-6">
        <div className="text-xs font-bold tracking-widest text-amber-600 dark:text-amber-400 mb-2">ENGLISH</div>
        <p className="text-base lg:text-lg leading-[1.9] text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
          {chapter.plotSummary || "등록된 plot summary가 없습니다."}
        </p>
      </div>

      {chapter.plotSummaryKorean && (
        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <div className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 mb-2">한국어 요약</div>
          <p className="text-base leading-[1.9] text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
            {chapter.plotSummaryKorean}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Themes ─────────────────────────────────────────
function PageThemes({ themes, title }: { themes: NovelTheme[]; title: string }) {
  return (
    <div className="max-w-[820px] mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center shadow-md">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Themes</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
        </div>
      </div>

      {themes.length === 0 ? (
        <p className="text-gray-400 italic">등록된 테마가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {themes.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border-2 border-violet-100 dark:border-violet-900/40 bg-white dark:bg-gray-800 p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-violet-700 dark:text-violet-300 mb-1">{t.name}</h3>
                  <p className="text-sm lg:text-base text-gray-700 dark:text-gray-200 leading-relaxed mb-2">
                    {t.description}
                  </p>
                  {t.quote && (
                    <div className="mt-2 pl-3 border-l-4 border-violet-300 dark:border-violet-700">
                      <p className="text-sm italic text-gray-600 dark:text-gray-300">"{t.quote}"</p>
                      {t.quoteKorean && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.quoteKorean}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Characters ─────────────────────────────────────
function PageCharacters({ characters, title }: { characters: NovelCharacter[]; title: string }) {
  return (
    <div className="max-w-[820px] mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Characters</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
        </div>
      </div>

      {characters.length === 0 ? (
        <p className="text-gray-400 italic">등록된 인물이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {characters.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border-2 border-cyan-100 dark:border-cyan-900/40 bg-white dark:bg-gray-800 p-5 shadow-sm"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-lg">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{c.name}</h3>
                  <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 mt-0.5">
                    {c.role}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{c.description}</p>
              {c.traits && c.traits.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {c.traits.map((tr, idx) => (
                    <span key={idx} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {tr}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Quotes ─────────────────────────────────────────
function PageQuotes({ quotes, title }: { quotes: NovelQuote[]; title: string }) {
  return (
    <div className="max-w-[820px] mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md">
          <Quote className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Key Quotes</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
        </div>
      </div>

      {quotes.length === 0 ? (
        <p className="text-gray-400 italic">등록된 인용문이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {quotes.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative rounded-2xl border-2 border-rose-100 dark:border-rose-900/40 bg-white dark:bg-gray-800 p-5 pl-8 shadow-sm"
            >
              <Quote className="absolute top-3 left-3 w-5 h-5 text-rose-300 dark:text-rose-700" />
              <p className="text-base lg:text-lg italic font-medium text-gray-800 dark:text-gray-100 leading-relaxed mb-2">
                "{q.text}"
              </p>
              {q.speaker && (
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-2">— {q.speaker}</p>
              )}
              {q.analysis && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    <span className="font-bold text-rose-600 dark:text-rose-400">분석: </span>{q.analysis}
                  </p>
                  {q.analysisKorean && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{q.analysisKorean}</p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Quiz ───────────────────────────────────────────
function PageQuiz({ chapter, novelId, showAnswer }: { chapter: NovelChapter; novelId: string; showAnswer: boolean }) {
  const { bucket, set } = useAnswers("sgrNovel", `${novelId}::${chapter.id}`);

  const isCorrect = (q: NovelQuiz): boolean => {
    if (!bucket[q.id]) return false;
    return isTextCorrect(String(bucket[q.id]), q.answer);
  };

  if (chapter.quizzes.length === 0) {
    return (
      <div className="max-w-[820px] mx-auto p-6 lg:p-10">
        <p className="text-gray-400 italic">이 챕터에 등록된 퀴즈가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[820px] mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
          <HelpCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Chapter Quiz</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{chapter.chapterNumber} · {chapter.title}</p>
        </div>
      </div>

      <div className="space-y-5">
        {chapter.quizzes.map((q, i) => {
          const val = bucket[q.id];
          const correct = isCorrect(q);
          const answered = !!val;
          return (
            <div key={q.id} className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="shrink-0 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  {i + 1}
                </div>
                <p className="text-base font-semibold text-gray-800 dark:text-gray-100 pt-0.5">
                  {formatInline(q.question, showAnswer, q.type === "fill_blank" ? q.answer : undefined)}
                </p>
              </div>

              {q.type === "multiple_choice" && q.options && (
                <div className="grid grid-cols-1 gap-2 pl-10">
                  {q.options.map((opt, oi) => {
                    const selected = val === opt;
                    const isAns = showAnswer && opt === q.answer;
                    return (
                      <button
                        key={oi}
                        onClick={() => set(q.id, opt as AnswerValue)}
                        className={`text-left px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                          isAns
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold"
                            : selected
                            ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300"
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-cyan-300"
                        }`}
                      >
                        <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === "true_false" && (
                <div className="flex gap-2 pl-10">
                  {[
                    { v: "true", label: "O (True)" },
                    { v: "false", label: "X (False)" },
                  ].map((opt) => {
                    const selected = val === opt.v;
                    const isAns = showAnswer && opt.v === q.answer;
                    return (
                      <button
                        key={opt.v}
                        onClick={() => set(q.id, opt.v as AnswerValue)}
                        className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-bold transition-all ${
                          isAns
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                            : selected
                            ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300"
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-cyan-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {(q.type === "fill_blank" || q.type === "short_answer") && (
                <div className="pl-10">
                  <input
                    type="text"
                    value={val ? String(val) : ""}
                    onChange={(e) => set(q.id, e.target.value as AnswerValue)}
                    placeholder="정답 입력"
                    className={`w-full px-3 py-2 rounded-lg border-2 text-sm bg-white dark:bg-gray-900 ${
                      answered && correct
                        ? "border-emerald-500 text-emerald-700 dark:text-emerald-300"
                        : answered
                        ? "border-rose-400 text-rose-600 dark:text-rose-300"
                        : "border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
                    } focus:outline-none focus:border-cyan-500`}
                  />
                </div>
              )}

              {showAnswer && (
                <div className="mt-3 pl-10">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                    정답: {q.answer}
                  </div>
                  {q.explanation && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{q.explanation}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 직독직해 ───────────────────────────────────────
function splitSentences(text: string): string[] {
  return text
    .replace(/([.!?])\s+/g, "$1\u0001")
    .split("\u0001")
    .map((s) => s.trim())
    .filter(Boolean);
}

function autoChunk(sent: string): string[] {
  const words = sent.split(/\s+/);
  if (words.length <= 4) return [sent];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

function PageDirectReading({ chapter, showAnswer }: { chapter: NovelChapter; showAnswer: boolean }) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const items: DirectReadingItem[] = useMemo(() => {
    if (chapter.directReading.length > 0) return chapter.directReading;
    const out: DirectReadingItem[] = [];
    chapter.contentParagraphs.forEach((para, pi) => {
      splitSentences(para.content).forEach((sent) => {
        out.push({
          id: `auto-${pi}-${out.length}`,
          english: sent,
          korean: "",
          chunks: autoChunk(sent),
          paragraphId: pi + 1,
          paragraphTitle: `${chapter.chapterNumber} · 단락 ${pi + 1}`,
          importance: "mid",
          difficulty: "medium",
          grammarPoints: [],
        });
      });
    });
    return out;
  }, [chapter.directReading, chapter.contentParagraphs, chapter.chapterNumber]);

  if (items.length === 0) {
    return (
      <div className="max-w-[820px] mx-auto p-6 lg:p-10">
        <p className="text-gray-400 italic">직독직해 데이터가 없습니다. CMS에서 등록하거나 본문을 추가해주세요.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">직독직해</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{chapter.chapterNumber} · {chapter.title}</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((it, i) => {
          const isRevealed = revealed.has(it.id) || showAnswer;
          return (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {it.chunks.map((c, ci) => (
                    <span key={ci} className="text-sm lg:text-base font-medium text-gray-800 dark:text-gray-100 px-1.5 py-0.5 rounded bg-gray-50 dark:bg-gray-700">
                      {c}
                    </span>
                  ))}
                  {it.importance === "high" && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300">핵심</span>
                  )}
                </div>
                <p className="text-base lg:text-lg text-gray-800 dark:text-gray-100 leading-relaxed mb-2">{it.english}</p>
                <button
                  onClick={() => setRevealed(prev => {
                    const next = new Set(prev);
                    if (next.has(it.id)) next.delete(it.id); else next.add(it.id);
                    return next;
                  })}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  {isRevealed ? "▼ 한국어 숨기기" : "▶ 한국어 보기"}
                </button>
                <AnimatePresence>
                  {isRevealed && it.korean && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-gray-600 dark:text-gray-300 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 leading-relaxed"
                    >
                      {it.korean}
                    </motion.p>
                  )}
                </AnimatePresence>
                {it.grammarPoints && it.grammarPoints.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {it.grammarPoints.map((g, gi) => (
                      <span key={gi} title={g.description}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-bold border border-violet-200 dark:border-violet-800">
                        {g.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Novel Overview (책 선택 화면) ──────────────────
function NovelPicker({ novels, onPick }: { novels: SGRNovel[]; onPick: (n: SGRNovel) => void }) {
  return (
    <div className="max-w-[1200px] mx-auto p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
          <Library className="w-8 h-8 text-amber-500" /> SGR Novels
        </h1>
        <p className="text-gray-500 dark:text-gray-400">읽고 싶은 소설을 선택하세요. 챕터별로 분석과 퀴즈가 제공됩니다.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {novels.map((n) => (
          <button
            key={n.id}
            onClick={() => onPick(n)}
            className="group text-left rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-xl hover:border-amber-400 transition-all"
          >
            <div className="aspect-[3/4] bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40 flex items-center justify-center overflow-hidden">
              {n.coverImage ? (
                <img src={n.coverImage} alt={n.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-16 h-16 text-amber-400 group-hover:scale-110 transition-transform" />
              )}
            </div>
            <div className="p-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1">{n.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{n.author}{n.publishedYear ? ` · ${n.publishedYear}` : ""}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{n.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                  챕터 {n.chapters.length}개
                </span>
                {n.level && (
                  <span className="text-[11px] text-gray-400">{n.level}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page tabs ──────────────────────────────────────
type PageKey = "read" | "plot" | "themes" | "characters" | "quotes" | "quiz" | "directReading";

const PAGES: Array<{ key: PageKey; label: string; icon: any }> = [
  { key: "read", label: "Read", icon: BookOpen },
  { key: "plot", label: "Plot", icon: FileText },
  { key: "themes", label: "Themes", icon: Sparkles },
  { key: "characters", label: "Characters", icon: Users },
  { key: "quotes", label: "Quotes", icon: Quote },
  { key: "quiz", label: "Quiz", icon: HelpCircle },
  { key: "directReading", label: "직독직해", icon: Zap },
];

export default function SGRNovelViewer() {
  const [novels, setNovels] = useState<SGRNovel[]>(loadNovels);
  const [selectedId, setSelectedId] = useState<string>("");
  const [chapterIdx, setChapterIdx] = useState(0);
  const [pageKey, setPageKey] = useState<PageKey>("read");
  const [showAnswer, setShowAnswer] = useState(false);
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sgrNovel_dark") === "1";
  });

  // Tools
  const [toolsOpen, setToolsOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "ko" | "ch">("en");
  const [popupData, setPopupData] = useState<{ word: string; context: string; x: number; y: number } | null>(null);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [aiTutorPrompt, setAiTutorPrompt] = useState<string | undefined>(undefined);
  const [aiActionPopup, setAiActionPopup] = useState<{
    action: "explain" | "translate" | "analyze" | "rewrite";
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const [drawOpen, setDrawOpen] = useState(false);

  const handleAiTutor = useCallback((action: "explain" | "translate" | "analyze" | "rewrite", text: string) => {
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const rect = range?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 - 160 : window.innerWidth / 2 - 160;
    const y = rect ? rect.bottom + 10 : window.innerHeight / 2;
    setAiActionPopup({ action, text, x, y });
  }, []);

  // Sync from CMS / server
  useEffect(() => {
    const handler = () => {
      const next = loadNovels();
      setNovels(next);
      if (!next.find(n => n.id === selectedId)) setSelectedId("");
    };
    window.addEventListener(NOVEL_EVENT, handler);
    syncNovelsFromServer().then(serverNovels => {
      setNovels(serverNovels);
      if (selectedId && !serverNovels.find(n => n.id === selectedId)) setSelectedId("");
    });
    return () => window.removeEventListener(NOVEL_EVENT, handler);
  }, [selectedId]);

  useEffect(() => {
    localStorage.setItem("sgrNovel_dark", dark ? "1" : "0");
  }, [dark]);

  const selected = useMemo(
    () => novels.find(n => n.id === selectedId),
    [novels, selectedId]
  );

  // 책 선택 화면
  if (!selected) {
    return (
      <div className={dark ? "dark" : ""}>
        <div className="min-h-screen bg-gradient-to-br from-amber-50/40 to-orange-50/30 dark:from-gray-950 dark:to-gray-900 transition-colors">
          <div className="sticky top-0 z-30 backdrop-blur bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3 flex justify-end">
            <button
              onClick={() => setDark(v => !v)}
              title="다크모드 토글"
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
          <NovelPicker novels={novels} onPick={(n) => { setSelectedId(n.id); setChapterIdx(0); setPageKey("read"); }} />
        </div>
      </div>
    );
  }

  const chapter: NovelChapter | undefined = selected.chapters[chapterIdx];

  if (!chapter) {
    return (
      <div className={`min-h-[400px] flex flex-col items-center justify-center gap-3 text-gray-500 ${dark ? "dark" : ""}`}>
        <p>이 소설에 등록된 챕터가 없습니다. CMS에서 추가해주세요.</p>
        <button onClick={() => setSelectedId("")} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200">
          책 목록으로
        </button>
      </div>
    );
  }

  const goPrevCh = () => { setChapterIdx(i => Math.max(0, i - 1)); setPageKey("read"); };
  const goNextCh = () => { setChapterIdx(i => Math.min(selected.chapters.length - 1, i + 1)); setPageKey("read"); };
  const currentIdx = PAGES.findIndex(p => p.key === pageKey);
  const goPrevPage = () => setPageKey(PAGES[Math.max(0, currentIdx - 1)].key);
  const goNextPage = () => setPageKey(PAGES[Math.min(PAGES.length - 1, currentIdx + 1)].key);

  // 테마/인물은 챕터가 비어있으면 소설 전체 분석 사용
  const themesToShow = chapter.themes.length > 0 ? chapter.themes : selected.overallThemes;
  const charsToShow = chapter.characters.length > 0 ? chapter.characters : selected.overallCharacters;
  const quotesToShow = chapter.quotes.length > 0 ? chapter.quotes : selected.overallQuotes;
  const themesTitle = chapter.themes.length > 0 ? `${chapter.chapterNumber}` : "전체";
  const charsTitle = chapter.characters.length > 0 ? `${chapter.chapterNumber}` : "전체";
  const quotesTitle = chapter.quotes.length > 0 ? `${chapter.chapterNumber}` : "전체";

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 to-orange-50/20 dark:from-gray-950 dark:to-gray-900 transition-colors">
        {/* Toolbar */}
        <div className="sticky top-0 z-30 backdrop-blur bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3">
          <div className="max-w-[1600px] mx-auto flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSelectedId("")}
              className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-800 dark:text-amber-200 hover:from-amber-200 hover:to-orange-200"
              title="책 목록으로"
            >
              <Library className="w-3.5 h-3.5" /> {selected.title.length > 18 ? selected.title.slice(0, 18) + "…" : selected.title}
            </button>

            {/* Chapter picker */}
            {selected.chapters.length > 1 && (
              <select
                value={chapterIdx}
                onChange={(e) => { setChapterIdx(Number(e.target.value)); setPageKey("read"); }}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              >
                {selected.chapters.map((c, i) => (
                  <option key={c.id} value={i}>
                    {c.chapterNumber} · {c.title}
                  </option>
                ))}
              </select>
            )}

            {/* Page tabs */}
            <div className="flex items-center gap-1 flex-1 overflow-x-auto">
              {PAGES.map(p => {
                const Icon = p.icon;
                const active = pageKey === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => setPageKey(p.key)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      active
                        ? "bg-amber-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{p.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAnswer(v => !v)}
                title="정답 토글"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  showAnswer
                    ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                {showAnswer ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="hidden sm:inline">정답</span>
              </button>
              <button
                onClick={() => setDark(v => !v)}
                title="다크모드 토글"
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Tools */}
              <button
                onClick={() => setToolsOpen(v => !v)}
                title="Tools: drag to highlight/underline/dictionary"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  toolsOpen
                    ? "bg-[#1e6b73] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Highlighter className="w-4 h-4" />
                <span className="hidden sm:inline">Tools</span>
              </button>
              {toolsOpen && (
                <ReadingReviewActions
                  onClearAll={() => setClearTrigger(c => c + 1)}
                  language={language}
                  onLanguageChange={setLanguage}
                  enableChinese
                  onDraw={() => setDrawOpen(true)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Novel info banner (Read 페이지에서만) */}
        {pageKey === "read" && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-100 dark:border-amber-900/40 px-4 lg:px-6 py-2">
            <div className="max-w-[1600px] mx-auto flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                <span className="font-bold text-amber-700 dark:text-amber-300">{selected.title}</span>
                <span className="text-gray-400 mx-1">·</span>{selected.author}
              </div>
              {selected.sourceUrl && (
                <a href={selected.sourceUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline">
                  <ExternalLink className="w-3 h-3" /> LitCharts 참고
                </a>
              )}
            </div>
          </div>
        )}

        {/* Page content */}
        <ReadingReviewPassage
          toolsOpen={toolsOpen}
          onDictionary={(data) => setPopupData(data)}
          onAiTutor={handleAiTutor}
          clearTrigger={clearTrigger}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pageKey + chapter.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {pageKey === "read" && <PageRead chapter={chapter} dark={dark} />}
              {pageKey === "plot" && <PagePlot chapter={chapter} dark={dark} />}
              {pageKey === "themes" && <PageThemes themes={themesToShow} title={themesTitle} />}
              {pageKey === "characters" && <PageCharacters characters={charsToShow} title={charsTitle} />}
              {pageKey === "quotes" && <PageQuotes quotes={quotesToShow} title={quotesTitle} />}
              {pageKey === "quiz" && <PageQuiz chapter={chapter} novelId={selected.id} showAnswer={showAnswer} />}
              {pageKey === "directReading" && <PageDirectReading chapter={chapter} showAnswer={showAnswer} />}
            </motion.div>
          </AnimatePresence>
        </ReadingReviewPassage>

        {/* 단어 뜻 팝업 */}
        {popupData && (
          <WordPopup
            word={popupData.word}
            context={popupData.context}
            language={language}
            x={popupData.x}
            y={popupData.y}
            onClose={() => setPopupData(null)}
            onLanguageChange={setLanguage}
            availableLanguages={["en", "ko", "ch"]}
          />
        )}

        {/* AI 액션 말풍선 */}
        {aiActionPopup && (
          <AiActionPopup
            action={aiActionPopup.action}
            selectedText={aiActionPopup.text}
            x={aiActionPopup.x}
            y={aiActionPopup.y}
            onClose={() => setAiActionPopup(null)}
          />
        )}

        {/* 필기 캔버스 */}
        <DrawingCanvas active={drawOpen} onClose={() => setDrawOpen(false)} />

        {/* Bottom nav: 챕터 + 페이지 이동 */}
        <div className="max-w-[1600px] mx-auto px-6 py-6 border-t border-gray-200 dark:border-gray-700 mt-8 space-y-3">
          {/* 페이지 이동 */}
          <div className="flex items-center justify-between">
            <button
              onClick={goPrevPage}
              disabled={currentIdx === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> 이전 탭
            </button>
            <span className="text-xs text-gray-400 font-medium">
              {PAGES[currentIdx]?.label}
            </span>
            <button
              onClick={goNextPage}
              disabled={currentIdx === PAGES.length - 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음 탭 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {/* 챕터 이동 */}
          <div className="flex items-center justify-between">
            <button
              onClick={goPrevCh}
              disabled={chapterIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> 이전 챕터
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {chapter.chapterNumber} ({chapterIdx + 1}/{selected.chapters.length})
            </span>
            <button
              onClick={goNextCh}
              disabled={chapterIdx === selected.chapters.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음 챕터 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AI 튜터 FAB */}
      <ToeflAiWidget
        position="right"
        zIndex={80}
        open={aiTutorOpen}
        onOpenChange={setAiTutorOpen}
        initialPrompt={aiTutorPrompt}
        contextLabel={`SGR Novels · ${selected.title} · ${chapter.chapterNumber}`}
        questionData={{ novel: selected.title, author: selected.author, chapter: chapter.title, plot: chapter.plotSummary, themes: themesToShow, characters: charsToShow }}
        suggestedQuestions={[
          '이 챕터의 줄거리를 요약해줘',
          '이 소설의 주요 테마를 설명해줘',
          '주요 인물의 성격을 분석해줘',
          '이 인용문의 의미를 분석해줘',
        ]}
      />
    </div>
  );
}
