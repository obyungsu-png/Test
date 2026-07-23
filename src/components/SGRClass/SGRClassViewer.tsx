import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Download, Moon, Sun,
  BookOpen, ImageIcon, Eye, EyeOff, Sparkles,
  FileText, HelpCircle, Layers,
  Volume2, Zap, MousePointer, Highlighter
} from "lucide-react";
import type { SGRLesson, Question, OutlineQuestion, DirectReadingItem, BookType } from "./types";
import { loadLessons, SGR_EVENT, syncFromServer, BOOK_TYPE_META, normalizeBookType } from "./types";
import { ReadingExploreRenderer } from "./ReadingExploreRenderer";
import { downloadSGRPdf } from "./pdfUtils";
import { ToeflAiWidget } from "../ToeflAiWidget";
import { WordPopup } from "./WordPopup";
import { AiActionPopup } from "./AiActionPopup";
import { ReadingReviewPassage } from "./ReadingReviewPassage";
import { ReadingReviewActions } from "./ReadingReviewToolbar";
import "../../utils/sgrClassApi"; // 서버 연동 함수 등록
import { useAnswers, isTextCorrect, type AnswerValue } from "./answerState";

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
      render: (m) => <strong className="text-cyan-700 dark:text-cyan-300 font-bold">{m}</strong>,
    },
    {
      regex: /__(.+?)__/,
      render: (m) => <u className="decoration-2">{m}</u>,
    },
    {
      regex: /___+/,
      render: () =>
        showAnswer && answer ? (
          <span className="inline-block px-2 border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-300 font-bold">
            {answer}
          </span>
        ) : (
          <span className="inline-block min-w-[80px] border-b-2 border-gray-400 dark:border-gray-500" />
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
    parts.push(
      <span key={key++}>{patterns[matchIdx].render(matched[1] || "")}</span>
    );
    remaining = remaining.slice(earliest + matched[0].length);
  }
  return <>{parts}</>;
}

// ─── Sub-page components ───────────────────────────
function PagePreview({ lesson, showAnswer, dark }: { lesson: SGRLesson; showAnswer: boolean; dark: boolean }) {
  return (
    <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
      {/* Unit hero */}
      <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-800 to-gray-700 dark:from-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><path d=%22M0 60 Q 25 20 50 60 T 100 60 L 100 100 L 0 100 Z%22 fill=%22white%22/></svg>')] bg-repeat-x bg-bottom" />
        <div className="relative flex items-center gap-6 p-8 lg:p-12">
          <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center shadow-xl border-4 border-cyan-400">
            <div className="text-center text-white">
              <div className="text-[10px] font-bold tracking-widest">Unit</div>
              <div className="text-2xl font-black leading-none">{lesson.unitNumber}</div>
            </div>
          </div>
          <h1 className="text-3xl lg:text-5xl font-black text-white drop-shadow-lg">
            {lesson.title}
          </h1>
        </div>
      </div>

      {/* Visual Preview */}
      {lesson.previewQuestion && (
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-5">
            <div className="shrink-0 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-lg font-bold text-sm shadow-sm">
              Visual<br />Preview
            </div>
            <p className="text-xl lg:text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-1">
              {lesson.previewQuestion}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lesson.previewCards.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {c.image ? (
                    <img src={c.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <p className="text-base text-gray-700 dark:text-gray-200 text-center italic leading-snug">
                  {c.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vocabulary Preview */}
      {lesson.vocabularyPreview.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-3 h-3 rounded-full bg-cyan-500" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Vocabulary Preview</h2>
            <span className="text-gray-500 dark:text-gray-400">|</span>
            <span className="text-gray-600 dark:text-gray-300 text-base">
              {lesson.vocabPreviewInstruction}
            </span>
          </div>
          {/* Word bank pill */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full px-6 py-3 mb-5 shadow-inner">
            <div className="flex flex-wrap justify-center gap-6">
              {lesson.vocabularyPreview.map((v) => (
                <span key={v.id} className="italic text-gray-700 dark:text-gray-200 font-medium">
                  {v.word}
                </span>
              ))}
            </div>
          </div>
          {/* Fill blanks */}
          <div className="space-y-3">
            {lesson.vocabularyPreview.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 text-xl">
                <span className="w-7 shrink-0 font-bold text-cyan-600 dark:text-cyan-400">{i + 1}</span>
                {showAnswer ? (
                  <span className="inline-block px-3 py-1 border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-300 font-bold">
                    {v.word}
                  </span>
                ) : (
                  <span className="inline-block min-w-[140px] border-b-2 border-gray-400 dark:border-gray-500 h-7" />
                )}
                <span className="text-gray-700 dark:text-gray-200">: {v.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PagePassage({ lesson, dark }: { lesson: SGRLesson; dark: boolean }) {
  // split paragraphs into two "book pages" for visual balance
  const half = Math.ceil(lesson.passageParagraphs.length / 2);
  const left = lesson.passageParagraphs.slice(0, half);
  const right = lesson.passageParagraphs.slice(half);

  return (
    <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
      {/* Title hero */}
      <div className="relative mb-8">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800 dark:from-gray-900 dark:to-black shadow-lg h-40 flex items-end">
          <div className="px-8 py-4">
            <h1 className="text-3xl lg:text-4xl font-black text-white drop-shadow-lg leading-tight">
              {lesson.passageTitle}
            </h1>
          </div>
        </div>
      </div>

      {/* Two-column passage layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4 text-gray-800 dark:text-gray-100">
          {left.map((p, i) => (
            <div key={p.id} className="relative">
              <p className="text-[18px] lg:text-[19px] leading-relaxed text-justify">
                {i === 0 ? (
                  <>
                    <span className="float-left mr-2 text-5xl font-black text-cyan-700 dark:text-cyan-400 leading-none">
                      {p.content.trim().charAt(0)}
                    </span>
                    {formatInline(p.content.trim().slice(1), false)}
                  </>
                ) : (
                  formatInline(p.content, false)
                )}
              </p>
              {p.imageCaption && (
                <div className="mt-3 rounded-lg bg-gray-100 dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mb-2">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 text-center">▲ {p.imageCaption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-4 text-gray-800 dark:text-gray-100">
          {right.map((p) => (
            <div key={p.id} className="relative">
              <p className="text-[18px] lg:text-[19px] leading-relaxed text-justify">
                {formatInline(p.content, false)}
              </p>
              {p.imageCaption && (
                <div className="mt-3 rounded-lg bg-gray-100 dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mb-2">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 text-center">▲ {p.imageCaption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuestionRenderer({
  q, index, showAnswer, answers, onAnswer,
}: {
  q: Question;
  index: number;
  showAnswer: boolean;
  answers: Record<string, AnswerValue>;
  onAnswer: (key: string, v: AnswerValue) => void;
}) {
  const numBadge = (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-sm shrink-0">
      {index + 1}
    </span>
  );

  if (q.type === "main_idea" || q.type === "multiple_choice" || q.type === "vocabulary") {
    const picked = answers[q.id];
    const pickedIdx = typeof picked === "number" ? picked : null;
    return (
      <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex gap-3 mb-3">
          {numBadge}
          <p className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-gray-100">
            {q.question}
          </p>
        </div>
        <div className="ml-11 space-y-2">
          {q.options.map((o, i) => {
            const isCorrect = i === q.answer;
            const isPicked = pickedIdx === i;
            let cls =
              "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:border-cyan-300 dark:hover:border-cyan-700";
            if (showAnswer && isCorrect) {
              cls = "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-200 font-bold";
            } else if (isPicked && showAnswer && !isCorrect) {
              cls = "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300";
            } else if (isPicked) {
              cls = "border-cyan-500 bg-cyan-50/60 dark:bg-cyan-950/20 text-cyan-800 dark:text-cyan-200";
            }
            return (
              <button
                type="button"
                key={i}
                onClick={() => onAnswer(q.id, isPicked ? null : i)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${cls}`}
              >
                <span className="font-bold mr-2">{String.fromCharCode(97 + i)}.</span>
                {o}
                {showAnswer && isCorrect && <span className="ml-2">✓</span>}
                {isPicked && showAnswer && !isCorrect && <span className="ml-2">✗</span>}
                {isPicked && !showAnswer && (
                  <span className="ml-2 text-cyan-500">●</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (q.type === "fill_blank") {
    const key = `${q.id}:0`;
    const val = typeof answers[key] === "string" ? (answers[key] as string) : "";
    const correct = isTextCorrect(val, q.answer);
    return (
      <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex gap-3">
          {numBadge}
          <div className="flex-1">
            <p className="text-lg lg:text-xl text-gray-800 dark:text-gray-100">
              {renderWithInput(q.question, val, (v) => onAnswer(key, v), showAnswer, q.answer, correct)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (q.type === "complete_sentence") {
    return (
      <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex gap-3 mb-3">
          {numBadge}
          <p className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-gray-100">
            Complete the sentences.
          </p>
        </div>
        {q.wordBank && q.wordBank.length > 0 && (
          <div className="ml-11 mb-3 bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2 flex flex-wrap justify-center gap-4 text-sm">
            {q.wordBank.map((w, i) => (
              <span key={i} className="italic text-gray-700 dark:text-gray-200">{w}</span>
            ))}
          </div>
        )}
        <div className="ml-11 space-y-3">
          {q.sentences.map((s, i) => {
            const key = `${q.id}:${s.id}`;
            const val = typeof answers[key] === "string" ? (answers[key] as string) : "";
            const correct = isTextCorrect(val, s.answer);
            return (
              <div key={s.id} className="flex gap-2 text-lg text-gray-800 dark:text-gray-100">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{String.fromCharCode(97 + i)}.</span>
                <span className="flex-1">
                  {renderWithInput(s.text, val, (v) => onAnswer(key, v), showAnswer, s.answer, correct)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (q.type === "outline") {
    const col = (title: string, items: OutlineQuestion["leftItems"], side: string) => (
      <div className="rounded-xl border-2 border-cyan-200 dark:border-cyan-800 bg-white dark:bg-gray-800 p-4">
        <div className="pb-2 mb-3 border-b border-cyan-200 dark:border-cyan-800 text-center">
          <span className="inline-block px-4 py-1 bg-black text-white rounded-full text-sm font-bold">
            {title}
          </span>
        </div>
        <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-100">
          {items.map((it) => {
            const key = `${q.id}:${side}:${it.id}`;
            const val = typeof answers[key] === "string" ? (answers[key] as string) : "";
            const hasBlank = /___/.test(it.text) && it.answer;
            const correct = hasBlank ? isTextCorrect(val, it.answer || "") : false;
            return (
              <li key={it.id} className="flex gap-2">
                <span className="text-cyan-600 dark:text-cyan-400">•</span>
                <span className="flex-1">
                  {hasBlank
                    ? renderWithInput(it.text, val, (v) => onAnswer(key, v), showAnswer, it.answer || "", correct)
                    : formatInline(it.text, showAnswer, it.answer)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
    return (
      <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex gap-3 mb-3">
          {numBadge}
          <p className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-gray-100">
            Complete the outline.
          </p>
        </div>
        <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-4">
          {col(q.leftTitle, q.leftItems, "L")}
          {col(q.rightTitle, q.rightItems, "R")}
        </div>
      </div>
    );
  }

  if (q.type === "true_false") {
    return (
      <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex gap-3 mb-3">
          {numBadge}
          <div>
            <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold rounded">
              Quick Check
            </span>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Check T (True) or F (False).</span>
          </div>
        </div>
        <div className="ml-11 space-y-2">
          {q.statements.map((s, i) => {
            const key = `${q.id}:${s.id}`;
            const raw = answers[key];
            const picked = typeof raw === "boolean" ? raw : null;
            const pill = (label: string, value: boolean) => {
              const isPicked = picked === value;
              const isCorrect = s.answer === value;
              let cls = "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-cyan-400";
              if (showAnswer && isCorrect) {
                cls = "border-cyan-500 bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300";
              } else if (isPicked && showAnswer && !isCorrect) {
                cls = "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300";
              } else if (isPicked) {
                cls = "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300";
              }
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onAnswer(key, isPicked ? null : value)}
                  className={`px-3 py-1 rounded border-2 font-bold text-sm transition-colors ${cls}`}
                >
                  {label}
                  {showAnswer && isCorrect && " ✓"}
                  {isPicked && showAnswer && !isCorrect && " ✗"}
                </button>
              );
            };
            return (
              <div key={s.id} className="flex items-center gap-3 text-lg text-gray-800 dark:text-gray-100">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{i + 1}</span>
                <span className="flex-1">{s.text}</span>
                {pill("T", true)}
                {pill("F", false)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

// ─── 텍스트에 ___ 자리마다 입력 필드를 렌더 ─────────
function renderWithInput(
  text: string,
  value: string,
  onChange: (v: string) => void,
  showAnswer: boolean,
  answer: string,
  correct: boolean
): React.ReactNode {
  const parts = text.split(/(?:___|_{2,})/);
  const first = parts[0] ?? "";
  const rest = parts.slice(1);
  return (
    <>
      {formatInline(first, false, "")}
      {rest.map((p, i) => {
        const inputCls = showAnswer
          ? correct
            ? "border-cyan-500 text-cyan-700 dark:text-cyan-300"
            : "border-red-400 text-red-600 dark:text-red-400"
          : "border-gray-400 dark:border-gray-500 text-gray-800 dark:text-gray-100 focus:border-cyan-500";
        return (
          <span key={i}>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`inline-block min-w-[80px] max-w-[180px] mx-1 px-2 py-0.5 border-b-2 bg-transparent outline-none font-bold ${inputCls}`}
              placeholder={showAnswer ? answer : "___"}
            />
            {showAnswer && (
              <span className={`ml-1 text-xs font-bold ${correct ? "text-cyan-600" : "text-red-500"}`}>
                {correct ? "✓" : `(정답: ${answer})`}
              </span>
            )}
            {formatInline(p, false, "")}
          </span>
        );
      })}
    </>
  );
}

function PageQuestions({ lesson, showAnswer }: { lesson: SGRLesson; showAnswer: boolean }) {
  const { bucket, set, clear } = useAnswers("sgrClass", lesson.id);
  return (
    <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-sm font-bold">
          Main Idea and Details
        </span>
        <button
          onClick={clear}
          className="ml-auto text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          내 답안 지우기
        </button>
      </div>
      <div className="space-y-4">
        {lesson.questions.map((q, i) => (
          <QuestionRenderer
            key={q.id}
            q={q}
            index={i}
            showAnswer={showAnswer}
            answers={bucket}
            onAnswer={set}
          />
        ))}
      </div>
    </div>
  );
}

function PageVocabReview({ lesson, showAnswer }: { lesson: SGRLesson; showAnswer: boolean }) {
  const { wordBank, items } = lesson.vocabReview;
  return (
    <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-3 h-3 rounded-full bg-cyan-500" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Vocabulary Review</h2>
        <span className="text-gray-500 dark:text-gray-400">|</span>
        <span className="text-gray-600 dark:text-gray-300 text-base">
          Complete each sentence. Change the form if necessary.
        </span>
      </div>
      {wordBank.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full px-6 py-3 mb-6 shadow-inner">
          <div className="flex flex-wrap justify-center gap-6">
            {wordBank.map((w, i) => (
              <span key={i} className="italic text-gray-700 dark:text-gray-200 font-medium">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={it.id} className="flex items-center gap-3 text-xl">
            <span className="w-7 shrink-0 font-bold text-cyan-600 dark:text-cyan-400">{i + 1}</span>
            <span className="text-gray-700 dark:text-gray-200 flex-1">
              {formatInline(it.sentence, showAnswer, it.answer)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 자동 직독직해 유틸리티 ──────────────────────────
function splitSentences(text: string): string[] {
  return text.replace(/\n/g, " ").match(/[^.!?]+[.!?]+/g) || [text];
}

// 쉼표/접속사/관계대명사 기준 청크 분할
function autoChunk(text: string): string[] {
  const parts = text.split(/(,\s+|\s+which\s+|\s+who\s+|\s+that\s+|\s+where\s+|\s+when\s+|\s+because\s+|\s+so\s+|\s+but\s+|\s+and\s+|\s+or\s+)/i);
  const chunks: string[] = [];
  let current = "";
  for (let i = 0; i < parts.length; i++) {
    current += parts[i];
    if (parts[i].match(/,\s+|\s+(which|who|that|where|when|because|so|but|and|or)\s+/i)) {
      if (current.trim()) chunks.push(current.trim());
      current = "";
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

const SKIP_WORDS = new Set([
  "the", "this", "that", "these", "those", "with", "from", "into", "have",
  "been", "were", "they", "their", "there", "which", "would", "could",
  "should", "such", "also", "than", "when", "where", "while", "about",
]);

function isBlankCandidate(word: string): boolean {
  const w = word.toLowerCase().replace(/[^a-z']/g, "");
  return w.length >= 4 && !SKIP_WORDS.has(w);
}

function firstLetterBlank(word: string): string {
  const clean = word.replace(/[^a-zA-Z']/g, "");
  if (clean.length < 2) return word;
  return clean[0] + "_".repeat(clean.length - 1);
}

// ─── 직독직해 페이지 (passage 전체 자동 직독직해 + 서브탭) ──
type DirectReadingSubTab = "direct" | "outline" | "fillblank";

function PageDirectReading({ lesson, showAnswer }: { lesson: SGRLesson; showAnswer: boolean }) {
  const [subTab, setSubTab] = useState<DirectReadingSubTab>("direct");
  const [showChunking, setShowChunking] = useState(true);
  const [showKeyPhrases, setShowKeyPhrases] = useState(false);
  const [revealedSentences, setRevealedSentences] = useState<Set<string>>(new Set());
  const [expandedGrammar, setExpandedGrammar] = useState<string | null>(null);
  const [viewedSentences, setViewedSentences] = useState<Set<string>>(new Set());

  // passage에서 자동 directReading 생성 (CMS 데이터 없을 때)
  const autoDirectReading = useMemo<DirectReadingItem[]>(() => {
    if (lesson.directReading.length > 0) return lesson.directReading;
    const items: DirectReadingItem[] = [];
    lesson.passageParagraphs.forEach((para, pi) => {
      const sentences = splitSentences(para.content);
      sentences.forEach((sent) => {
        items.push({
          id: `auto-${pi}-${items.length}`,
          english: sent,
          korean: "",
          chunks: autoChunk(sent),
          paragraphId: pi + 1,
          paragraphTitle: `단락 ${pi + 1}`,
          importance: "mid",
          difficulty: "medium",
          grammarPoints: [],
        });
      });
    });
    return items;
  }, [lesson.directReading, lesson.passageParagraphs]);

  const toggleReveal = (id: string) => {
    setRevealedSentences(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setViewedSentences(prev => new Set(prev).add(id));
  };

  const revealAll = () => {
    const allIds = new Set(autoDirectReading.map(s => s.id));
    setRevealedSentences(allIds);
    setViewedSentences(allIds);
  };
  const hideAll = () => setRevealedSentences(new Set());

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  // Group by paragraphId
  const paragraphs = useMemo(() => {
    const groups: { paragraph: number; title: string; sentences: DirectReadingItem[] }[] = [];
    autoDirectReading.forEach(s => {
      const pid = s.paragraphId || 1;
      const existing = groups.find(g => g.paragraph === pid);
      if (existing) {
        existing.sentences.push(s);
      } else {
        groups.push({ paragraph: pid, title: s.paragraphTitle || `단락 ${pid}`, sentences: [s] });
      }
    });
    return groups;
  }, [autoDirectReading]);

  const progressPercent = Math.round((viewedSentences.size / Math.max(1, autoDirectReading.length)) * 100);

  const SUB_TABS: Array<{ id: DirectReadingSubTab; label: string }> = [
    { id: "direct", label: "직독직해" },
    { id: "outline", label: "Outline" },
    { id: "fillblank", label: "빈칸넣기" },
  ];

  // 렛슨의 outline 문제 (Complete the outline) 를 찾아 outline 탭에서 사용
  const outlineQ = useMemo<OutlineQuestion | null>(() => {
    const q = lesson.questions.find((x) => x.type === "outline") as
      | OutlineQuestion
      | undefined;
    return q || null;
  }, [lesson.questions]);

  // ─── 빈칸넣기(passage 전체) 데이터 준비 ─────────────
  // 핵심단어 후보 = 4자 이상 & SKIP_WORDS 제외. 문단당 최대 4개.
  const fillBlankData = useMemo(() => {
    return lesson.passageParagraphs.map((para, pi) => {
      const words = para.content.split(/(\s+)/); // 공백을 유지해서 분할
      const wordIndices: number[] = [];
      words.forEach((w, i) => {
        if (/\S/.test(w) && isBlankCandidate(w.replace(/[^a-zA-Z']/g, "")))
          wordIndices.push(i);
      });
      // 균등하게 분포된 4개 뽑기
      const pickCount = Math.min(4, wordIndices.length);
      const step = wordIndices.length / Math.max(1, pickCount);
      const blankIdxSet = new Set<number>();
      for (let k = 0; k < pickCount; k++) {
        blankIdxSet.add(wordIndices[Math.floor(k * step)]);
      }
      let blankNumber = 0;
      const blanks: Array<{ number: number; answer: string }> = [];
      const nodes: Array<{ kind: "text" | "blank"; content: string; number?: number; answer?: string }> = [];
      words.forEach((w, i) => {
        if (blankIdxSet.has(i)) {
          blankNumber += 1;
          const answer = w.replace(/[^a-zA-Z']/g, "");
          blanks.push({ number: blankNumber, answer });
          nodes.push({ kind: "blank", content: w, number: blankNumber, answer });
        } else {
          nodes.push({ kind: "text", content: w });
        }
      });
      return { paragraphNumber: pi + 1, nodes, blanks };
    });
  }, [lesson.passageParagraphs]);

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-8">
      {/* Sub tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`shrink-0 px-4 py-2 text-sm font-bold transition-colors border-b-2 -mb-px ${
              subTab === t.id
                ? "border-cyan-600 text-cyan-600 dark:text-cyan-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── 직독직해 탭 ─── */}
      {subTab === "direct" && (
        <>
          {/* Progress Bar */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">본문 분석 진행률</span>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{viewedSentences.size}/{autoDirectReading.length} 문장</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <button
              onClick={() => setShowChunking(!showChunking)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${showChunking ? 'bg-cyan-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
            >
              끊어읽기 {showChunking ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={revealedSentences.size === autoDirectReading.length ? hideAll : revealAll}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                revealedSentences.size === autoDirectReading.length
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {revealedSentences.size === autoDirectReading.length ? '전체 숨기기' : '전체 해석 보기'}
            </button>
            <button
              onClick={() => setShowKeyPhrases((v) => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                showKeyPhrases
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
              title="핵심 문법 / 주요 구문 표시"
            >
              <Zap className="w-3.5 h-3.5" />
              주요구문 {showKeyPhrases ? 'ON' : 'OFF'}
            </button>
            <span className="ml-auto text-xs text-gray-400 hidden sm:flex items-center gap-1">
              <MousePointer className="w-3 h-3" /> 문장을 클릭하여 해석 확인
            </span>
          </div>

          {/* Paragraph Groups */}
          {paragraphs.map((para) => (
            <div key={para.paragraph} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
              {/* Paragraph Header */}
              <div className="flex items-start gap-3 px-5 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <span className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                  {para.paragraph}
                </span>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-800 dark:text-gray-100">{para.title}</h3>
                </div>
              </div>

              {/* Sentences */}
              <div className="p-3 space-y-2">
                {para.sentences.map((s) => (
                  <motion.div
                    key={s.id}
                    className={`relative rounded-xl border transition-all overflow-hidden cursor-pointer ${
                      s.isKeyExam ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } ${revealedSentences.has(s.id) ? 'ring-2 ring-cyan-200 dark:ring-cyan-800' : 'hover:border-cyan-300 dark:hover:border-cyan-700'}`}
                    onClick={() => toggleReveal(s.id)}
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        {/* Difficulty badge */}
                        <span className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          s.difficulty === 'hard' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' :
                          s.difficulty === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' :
                          'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                        }`}>
                          {autoDirectReading.indexOf(s) + 1}
                        </span>
                        {s.isKeyExam && (
                          <span className="inline-block text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 rounded font-bold mt-1 shrink-0">
                            시험빈출
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          {/* English with chunks */}
                          <div className="flex items-start gap-2">
                            <p className="text-[17px] lg:text-[18px] leading-relaxed text-gray-800 dark:text-gray-100 font-medium flex-1">
                              {showChunking
                                ? s.chunks.map((chunk, i) => (
                                    <span key={i}>
                                      {i > 0 && <span className="text-cyan-400 dark:text-cyan-600 mx-0.5 font-bold">/</span>}
                                      <span className="hover:bg-cyan-50 dark:hover:bg-cyan-950/30 rounded px-0.5 transition-colors">{chunk}</span>
                                    </span>
                                  ))
                                : s.english
                              }
                            </p>
                            <button
                              onClick={(e) => { e.stopPropagation(); speak(s.english); }}
                              className="shrink-0 p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 rounded-lg transition-colors"
                              title="음성 듣기"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Korean translation (revealed on click) */}
                          <AnimatePresence>
                            {revealedSentences.has(s.id) && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-sm mt-2 text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/30 px-3 py-2 rounded-lg border border-cyan-100 dark:border-cyan-900"
                              >
                                {s.korean || (
                                  <span className="text-gray-400 italic">
                                    해석이 없습니다. AI 튜터에게 해석을 요청해보세요.
                                  </span>
                                )}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          {/* Grammar points */}
                          {s.grammarPoints && s.grammarPoints.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {s.grammarPoints.map((gp, gi) => (
                                <button
                                  key={gi}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedGrammar(expandedGrammar === `${s.id}-${gi}` ? null : `${s.id}-${gi}`);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                >
                                  <Zap className="w-3 h-3" />
                                  {gp.label}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Grammar detail expansion */}
                          <AnimatePresence>
                            {s.grammarPoints && s.grammarPoints.map((gp, gi) => (
                              (showKeyPhrases || expandedGrammar === `${s.id}-${gi}`) && (
                                <motion.div
                                  key={gi}
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">{gp.type}</span>
                                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">{gp.label}</span>
                                    </div>
                                    <p className="text-sm text-indigo-600 dark:text-indigo-300 mb-1">
                                      <span className="font-medium bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded">"{gp.highlight}"</span>
                                    </p>
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400">{gp.description}</p>
                                  </div>
                                </motion.div>
                              )
                            ))}
                          </AnimatePresence>
                          {/* 문법 포인트가 아예 없을 때 주요구문 ON이면 안내 표시 */}
                          {showKeyPhrases && (!s.grammarPoints || s.grammarPoints.length === 0) && (
                            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 italic">
                              이 문장에 등록된 주요구문이 없습니다.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ─── Outline 탭 (Complete the outline 스타일) ─── */}
      {subTab === "outline" && (
        <div className="space-y-3">
          <div className="p-4 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800">
            <h3 className="text-base font-bold text-cyan-700 dark:text-cyan-300 mb-1">Outline</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              지문의 핵심 구조를 두 축으로 정리했습니다. 빈칸에 알맞은 단어를 채워보세요.
            </p>
          </div>
          {outlineQ ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: outlineQ.leftTitle, items: outlineQ.leftItems },
                { title: outlineQ.rightTitle, items: outlineQ.rightItems },
              ].map((col, ci) => (
                <div
                  key={ci}
                  className="rounded-2xl border-2 border-cyan-200 dark:border-cyan-800 bg-white dark:bg-gray-800 p-4"
                >
                  <div className="pb-2 mb-3 border-b border-cyan-200 dark:border-cyan-800 text-center">
                    <span className="inline-block px-4 py-1 bg-black text-white rounded-full text-sm font-bold">
                      {col.title}
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-100">
                    {col.items.map((it) => (
                      <li key={it.id} className="flex gap-2">
                        <span className="text-cyan-600 dark:text-cyan-400">•</span>
                        <span>{formatInline(it.text, showAnswer, it.answer)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
              <p className="text-sm">이 레슨에는 등록된 Outline 데이터가 없습니다.</p>
              <p className="text-xs mt-1">CMS의 Questions 탭에서 “Complete the outline” 문제를 추가해주세요.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── 빈칸넣기 탭 (Passage 전체 통합 뷰) ─── */}
      {subTab === "fillblank" && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
            <h3 className="text-base font-bold text-amber-700 dark:text-amber-300 mb-1">
              Passage 빈칸넣기
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              지문 전체에서 핵심 단어·구문·문법 요소를 빈칸으로 표시했습니다. 알맞은 단어를 채워보세요.
            </p>
          </div>

          {/* 지문 전체 (한 번에 보여줌) */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            {lesson.passageTitle && (
              <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                {lesson.passageTitle}
              </h4>
            )}
            <div className="space-y-4 text-[16px] leading-[1.9] text-gray-800 dark:text-gray-100">
              {fillBlankData.map((para) => (
                <p key={para.paragraphNumber}>
                  <span className="mr-2 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    ({para.paragraphNumber})
                  </span>
                  {para.nodes.map((n, i) => {
                    if (n.kind === "text") return <span key={i}>{n.content}</span>;
                    return showAnswer ? (
                      <span
                        key={i}
                        className="inline-block px-1.5 mx-0.5 border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-300 font-bold"
                      >
                        {n.answer}
                      </span>
                    ) : (
                      <span
                        key={i}
                        className="inline-block px-1 mx-0.5 border-b-2 border-gray-400 dark:border-gray-500 text-gray-600 dark:text-gray-300 font-mono font-bold"
                        title={`빈칸 ${n.number}`}
                      >
                        {firstLetterBlank(n.answer || "")}
                      </span>
                    );
                  })}
                </p>
              ))}
            </div>
          </div>

          {/* 정답 리스트 */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              빈칸 정답 목록
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
              {fillBlankData.flatMap((p) => p.blanks).map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                >
                  <span className="shrink-0 w-6 h-6 rounded-full bg-cyan-600 text-white text-xs font-bold flex items-center justify-center">
                    {b.number}
                  </span>
                  {showAnswer ? (
                    <span className="font-bold text-cyan-700 dark:text-cyan-300">
                      {b.answer}
                    </span>
                  ) : (
                    <span className="font-mono text-gray-400 dark:text-gray-500">
                      {firstLetterBlank(b.answer)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Viewer ───────────────────────────────────
type PageKey =
  | "preview" | "passage" | "questions" | "vocabReview" | "directReading"
  | "re_reading" | "re_comprehension" | "re_skill" | "re_vocab";

const PAGES: Array<{ key: PageKey; label: string; icon: any }> = [
  { key: "preview", label: "Preview", icon: Sparkles },
  { key: "passage", label: "Passage", icon: BookOpen },
  { key: "questions", label: "Questions", icon: HelpCircle },
  { key: "vocabReview", label: "Vocab Review", icon: Layers },
  { key: "directReading", label: "직독직해", icon: FileText },
];

const PAGES_RE: Array<{ key: PageKey; label: string; icon: any }> = [
  { key: "re_reading", label: "Reading", icon: BookOpen },
  { key: "re_comprehension", label: "Comprehension", icon: HelpCircle },
  { key: "re_skill", label: "Reading Skill", icon: FileText },
  { key: "re_vocab", label: "Vocab Practice", icon: Layers },
];

function getBookType(l: SGRLesson | undefined): BookType {
  return normalizeBookType(l?.bookType);
}

function BookTypePicker({
  groups,
  onPick,
}: {
  groups: Map<BookType, SGRLesson[]>;
  onPick: (bt: BookType) => void;
}) {
  const entries = Array.from(groups.entries());
  return (
    <div className="max-w-[1200px] mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">책 선택</h1>
        <p className="text-gray-500 dark:text-gray-400">
          진행할 책 종류를 골라주세요. 각 책마다 화면 형식이 달라집니다.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entries.map(([bt, list]) => {
          const meta = BOOK_TYPE_META[bt] || {
            label: bt,
            color: "from-gray-500 to-gray-700",
            description: "커스텀 책 종류",
          };
          return (
            <button
              key={bt}
              onClick={() => onPick(bt)}
              className="group text-left rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:shadow-xl hover:border-cyan-400 transition-all"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-md mb-4`}
              >
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                {meta.label}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {meta.description}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold">
                레슨 {list.length}개
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SGRClassViewer() {
  const [lessons, setLessons] = useState<SGRLesson[]>(loadLessons);
  const [selectedBookType, setSelectedBookType] = useState<BookType | null>(() => {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem("sgrClass_bookType") as BookType | null) || null;
  });
  const [selectedId, setSelectedId] = useState<string>("");
  const [pageKey, setPageKey] = useState<PageKey>("preview");
  const [showAnswer, setShowAnswer] = useState(false);
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sgrClass_dark") === "1";
  });

  // Tools (drag-popover based highlight/underline/dictionary)
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

  const handleAiTutor = (action: "explain" | "translate" | "analyze" | "rewrite", text: string) => {
    // 말풍선으로 결과 표시
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const rect = range?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 - 160 : window.innerWidth / 2 - 160;
    const y = rect ? rect.bottom + 10 : window.innerHeight / 2;
    setAiActionPopup({ action, text, x, y });
  };

  // 책 종류별로 그룹화
  const bookGroups = useMemo(() => {
    const map = new Map<BookType, SGRLesson[]>();
    for (const l of lessons) {
      const bt = getBookType(l);
      if (!map.has(bt)) map.set(bt, []);
      map.get(bt)!.push(l);
    }
    return map;
  }, [lessons]);

  const availableBookTypes = useMemo(() => Array.from(bookGroups.keys()), [bookGroups]);

  const filteredLessons = useMemo(() => {
    if (!selectedBookType) return lessons;
    return bookGroups.get(selectedBookType) || [];
  }, [lessons, bookGroups, selectedBookType]);

  // 책 종류 바뀌면 첫 레슨으로
  useEffect(() => {
    if (!selectedBookType) return;
    localStorage.setItem("sgrClass_bookType", selectedBookType);
    if (!filteredLessons.find((l) => l.id === selectedId)) {
      setSelectedId(filteredLessons[0]?.id || "");
      setPageKey(selectedBookType === "reading_explore" ? "re_reading" : "preview");
    }
  }, [selectedBookType, filteredLessons, selectedId]);

  const selected = useMemo(
    () => filteredLessons.find((l) => l.id === selectedId) || filteredLessons[0],
    [filteredLessons, selectedId]
  );
  const currentBookType = selectedBookType || getBookType(selected);
  const activePages = currentBookType === "reading_explore" ? PAGES_RE : PAGES;

  const handleDictionary = useCallback((data: { word: string; context: string; x: number; y: number }) => {
    setPopupData(data);
  }, []);

  const handleClearAll = useCallback(() => {
    setClearTrigger(c => c + 1);
  }, []);

  // Sync from CMS
  useEffect(() => {
    const handler = () => {
      const next = loadLessons();
      setLessons(next);
      if (!next.find(l => l.id === selectedId)) {
        setSelectedId(next[0]?.id || "");
      }
    };
    window.addEventListener(SGR_EVENT, handler);
    // 마운트 시 Supabase에서 데이터 동기화
    syncFromServer().then(serverLessons => {
      setLessons(serverLessons);
      if (!serverLessons.find(l => l.id === selectedId)) {
        setSelectedId(serverLessons[0]?.id || "");
      }
    });
    return () => window.removeEventListener(SGR_EVENT, handler);
  }, [selectedId]);

  useEffect(() => {
    localStorage.setItem("sgrClass_dark", dark ? "1" : "0");
  }, [dark]);

  // 책 종류 선택 화면: 항상 picker를 거쳐 진입
  if (!selectedBookType) {
    return (
      <BookTypePicker
        groups={bookGroups}
        onPick={(bt) => {
          setSelectedBookType(bt);
          const first = (bookGroups.get(bt) || [])[0];
          setSelectedId(first?.id || "");
          setPageKey(bt === "reading_explore" ? "re_reading" : "preview");
        }}
      />
    );
  }

  if (!selected) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-gray-500">
        <p>아직 등록된 SGR Class 자료가 없습니다. CMS에서 추가해주세요.</p>
        {selectedBookType && (
          <button
            onClick={() => setSelectedBookType(null)}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
          >
            책 종류 다시 선택
          </button>
        )}
      </div>
    );
  }

  const currentIdx = activePages.findIndex(p => p.key === pageKey);
  const goPrev = () => setPageKey(activePages[Math.max(0, currentIdx - 1)].key);
  const goNext = () => setPageKey(activePages[Math.min(activePages.length - 1, currentIdx + 1)].key);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/40 dark:from-gray-950 dark:to-gray-900 transition-colors">
        {/* Toolbar */}
        <div className="sticky top-0 z-30 backdrop-blur bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3">
          <div className="max-w-[1600px] mx-auto flex flex-wrap items-center gap-3">
            {/* Book type switcher */}
            {availableBookTypes.length > 1 && (
              <button
                onClick={() => setSelectedBookType(null)}
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40 text-cyan-800 dark:text-cyan-200 hover:from-cyan-200 hover:to-blue-200"
                title="다른 책 종류로 전환"
              >
                📚 {BOOK_TYPE_META[currentBookType]?.label || currentBookType}
              </button>
            )}
            {/* lesson picker (책 종류 내에서) */}
            {filteredLessons.length > 1 && (
              <select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setPageKey(currentBookType === "reading_explore" ? "re_reading" : "preview");
                }}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              >
                {filteredLessons.map(l => (
                  <option key={l.id} value={l.id}>
                    Unit {l.unitNumber} · {l.title}
                  </option>
                ))}
              </select>
            )}

            {/* Page tabs */}
            <div className="flex items-center gap-1 flex-1 overflow-x-auto">
              {activePages.map(p => {
                const Icon = p.icon;
                const active = pageKey === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => setPageKey(p.key)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      active
                        ? "bg-cyan-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
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
                    ? "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300"
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

              {/* Tools button + actions */}
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
                  onClearAll={handleClearAll}
                  language={language}
                  onLanguageChange={setLanguage}
                  enableChinese
                />
              )}
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-cyan-600 hover:bg-cyan-700 text-white">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-40">
                  <button
                    onClick={() => downloadSGRPdf(selected, "question")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-cyan-50 dark:hover:bg-cyan-950/30 text-gray-800 dark:text-gray-200"
                  >
                    📄 문제편
                  </button>
                  <button
                    onClick={() => downloadSGRPdf(selected, "answer")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-cyan-50 dark:hover:bg-cyan-950/30 text-gray-800 dark:text-gray-200 border-t border-gray-100 dark:border-gray-700"
                  >
                    ✅ 문제 + 해답편
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <ReadingReviewPassage
          toolsOpen={toolsOpen}
          onDictionary={handleDictionary}
          onAiTutor={handleAiTutor}
          clearTrigger={clearTrigger}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pageKey + selected.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {pageKey === "preview" && <PagePreview lesson={selected} showAnswer={showAnswer} dark={dark} />}
              {pageKey === "passage" && <PagePassage lesson={selected} dark={dark} />}
              {pageKey === "questions" && <PageQuestions lesson={selected} showAnswer={showAnswer} />}
              {pageKey === "vocabReview" && <PageVocabReview lesson={selected} showAnswer={showAnswer} />}
              {pageKey === "directReading" && <PageDirectReading lesson={selected} showAnswer={showAnswer} />}
              {(pageKey === "re_reading" || pageKey === "re_comprehension" || pageKey === "re_skill" || pageKey === "re_vocab") &&
                selected.readingExplore && (
                  <ReadingExploreRenderer
                    lesson={selected}
                    content={selected.readingExplore}
                    showAnswer={showAnswer}
                    subTab={
                      pageKey === "re_reading" ? "reading"
                      : pageKey === "re_comprehension" ? "comprehension"
                      : pageKey === "re_skill" ? "readingSkill"
                      : "vocabPractice"
                    }
                  />
                )}
              {(pageKey === "re_reading" || pageKey === "re_comprehension" || pageKey === "re_skill" || pageKey === "re_vocab") &&
                !selected.readingExplore && (
                  <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                    이 레슨에는 Reading Explore 데이터가 없습니다. CMS에서 등록해주세요.
                  </div>
                )}
            </motion.div>
          </AnimatePresence>
        </ReadingReviewPassage>

        {/* 단어 뜻 팝업 (createPortal 기반) */}
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

        {/* Bottom nav */}
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 py-6 border-t border-gray-200 dark:border-gray-700 mt-8">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold ${
              currentIdx === 0
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> 이전
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {currentIdx + 1} / {activePages.length} · {activePages[currentIdx]?.label || ""}
          </span>
          <button
            onClick={goNext}
            disabled={currentIdx === activePages.length - 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold ${
              currentIdx === activePages.length - 1
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-700 text-white shadow-md"
            }`}
          >
            다음 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI 튜터 FAB */}
      <ToeflAiWidget
        position="right"
        zIndex={80}
        open={aiTutorOpen}
        onOpenChange={setAiTutorOpen}
        initialPrompt={aiTutorPrompt}
        contextLabel={`SGR Class · Unit ${selected?.unitNumber || ""} ${selected?.title || ""}`}
        questionData={selected}
        suggestedQuestions={[
          '이 레슨의 핵심 어휘를 설명해줘',
          '지문의 주제와 요약을 알려줘',
          '문법 포인트를 분석해줘',
          '문제 정답과 해설을 알려줘',
        ]}
      />
    </div>
  );
}
