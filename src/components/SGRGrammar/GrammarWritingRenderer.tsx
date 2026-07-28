import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ListChecks, FilePenLine, Languages, PencilLine, MessageSquareText } from "lucide-react";
import type { GrammarUnit, GrammarWritingContent } from "./types";
import { fmt } from "./SGRGrammarViewer";

interface Props {
  unit: GrammarUnit;
  content: GrammarWritingContent;
  showAnswer: boolean;
}

type SubSection =
  | "explanation"
  | "bracketMcq"
  | "wordBank"
  | "rearrange"
  | "errorCorrection"
  | "translation"
  | "dialogue";

const SUB_SECTIONS: Array<{ id: SubSection; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "explanation", label: "문법 설명", icon: ListChecks },
  { id: "bracketMcq", label: "문장 속 문법 훈련", icon: FilePenLine },
  { id: "wordBank", label: "알맞은 형태로 쓰기", icon: PencilLine },
  { id: "rearrange", label: "문장 배열", icon: PencilLine },
  { id: "errorCorrection", label: "틀린 부분 고치기", icon: CheckCircle2 },
  { id: "translation", label: "통문장 실제로 쓰기", icon: Languages },
  { id: "dialogue", label: "대화 완성", icon: MessageSquareText },
];

export function GrammarWritingRenderer({ unit, content, showAnswer }: Props) {
  const [sub, setSub] = useState<SubSection>("explanation");

  const hasDialogue = !!content.dialogue;
  const tabs = hasDialogue ? SUB_SECTIONS : SUB_SECTIONS.filter((t) => t.id !== "dialogue");

  return (
    <div>
      {/* Unit header */}
      <div className="mb-6 pb-4 border-b-2 border-emerald-600 dark:border-emerald-500">
        <div className="flex items-center gap-3">
          <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
            {unit.unitNumber}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              UNIT · 문법 writing
            </p>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {unit.unitTitle}
            </h2>
          </div>
        </div>
      </div>

      {/* Sub-section tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = sub === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm font-bold transition-colors border-b-2 -mb-px ${
                active
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={sub}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {sub === "explanation" && (
            <ExplanationView content={content} />
          )}
          {sub === "bracketMcq" && (
            <BracketMcqView content={content} showAnswer={showAnswer} />
          )}
          {sub === "wordBank" && (
            <WordBankView content={content} showAnswer={showAnswer} />
          )}
          {sub === "rearrange" && (
            <RearrangeView content={content} showAnswer={showAnswer} />
          )}
          {sub === "errorCorrection" && (
            <ErrorCorrectionView content={content} showAnswer={showAnswer} />
          )}
          {sub === "translation" && (
            <TranslationView content={content} showAnswer={showAnswer} />
          )}
          {sub === "dialogue" && content.dialogue && (
            <DialogueView content={content} showAnswer={showAnswer} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── 설명 섹션 (A, B, …) ────────────────────────────
function ExplanationView({ content }: { content: GrammarWritingContent }) {
  if (content.sections.length === 0) {
    return (
      <EmptyState message="이 유형에는 아직 문법 설명이 없습니다. CMS에서 A, B 섹션을 추가해주세요." />
    );
  }
  return (
    <div className="space-y-6">
      {content.sections.map((sec) => (
        <div key={sec.id} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: examples + summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-base font-black">
                {sec.label}
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {sec.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {sec.summary}
                </p>
              </div>
            </div>
            <div className="space-y-3 pl-1">
              {sec.examples.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-300">{ex.korean}</p>
                  <div className="flex items-start gap-2 mt-1">
                    <span className="text-emerald-500 mt-0.5">→</span>
                    <p className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-100">
                      {fmt(ex.english)}
                    </p>
                  </div>
                  {ex.note && (
                    <p className="text-[11px] mt-1 text-emerald-600 dark:text-emerald-400 font-medium ml-5">
                      · {ex.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: rule boxes */}
          <div className="space-y-3">
            {sec.rules.map((rule) => (
              <div
                key={rule.id}
                className="p-3 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20"
              >
                {rule.title && (
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1.5 pb-1 border-b border-emerald-200 dark:border-emerald-800">
                    {rule.title}
                  </p>
                )}
                <ul className="space-y-1 text-[13px] text-gray-700 dark:text-gray-200">
                  {rule.lines.map((line, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span className="text-emerald-500">·</span>
                      <span>{fmt(line)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 문장 속 문법 훈련하기 (괄호 선택형) ─────────────
function BracketMcqView({
  content,
  showAnswer,
}: {
  content: GrammarWritingContent;
  showAnswer: boolean;
}) {
  if (content.bracketMcq.length === 0) {
    return <EmptyState message="문장 속 문법 훈련 문항이 아직 없습니다." />;
  }
  return (
    <div className="space-y-3">
      <SectionCallout title="괄호 안에서 알맞은 말 고르기" tone="cyan" />
      {content.bracketMcq.map((item, i) => (
        <div
          key={item.id}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start gap-3">
            <span className="shrink-0 text-sm font-black text-emerald-600 dark:text-emerald-400 w-6 text-right">
              {i + 1}
            </span>
            <p className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-100">
              {renderBracketSentence(item.sentence, item.options, item.answer, showAnswer)}
            </p>
          </div>
          {item.note && (
            <p className="ml-9 mt-1 text-[11px] text-gray-500 dark:text-gray-400 italic">
              {item.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function renderBracketSentence(
  sentence: string,
  options: string[],
  answerIdx: number,
  showAnswer: boolean
): React.ReactNode {
  // (A / B) 형태를 찾아 치환
  const regex = /\(([^)]+)\)/;
  const m = sentence.match(regex);
  if (!m) return sentence;
  const before = sentence.slice(0, m.index);
  const after = sentence.slice((m.index || 0) + m[0].length);
  return (
    <>
      {before}
      <span className="inline-flex items-center gap-1 px-1 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
        <span className="text-emerald-600 dark:text-emerald-400">(</span>
        {options.map((op, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-400">/</span>}
            <span
              className={
                showAnswer && i === answerIdx
                  ? "font-bold text-emerald-700 dark:text-emerald-300 underline decoration-2"
                  : ""
              }
            >
              {op}
            </span>
          </span>
        ))}
        <span className="text-emerald-600 dark:text-emerald-400">)</span>
      </span>
      {after}
    </>
  );
}

// ─── 알맞은 말 골라 알맞은 형태로 쓰기 ────────────
function WordBankView({
  content,
  showAnswer,
}: {
  content: GrammarWritingContent;
  showAnswer: boolean;
}) {
  const { bank, items } = content.wordBankFill;
  if (items.length === 0) return <EmptyState message="문항이 아직 없습니다." />;
  return (
    <div className="space-y-3">
      <SectionCallout title="알맞은 말 골라 알맞은 형태로 쓰기" tone="cyan" />
      {bank.length > 0 && (
        <div className="p-3 flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
          <span className="px-2 py-0.5 rounded bg-black text-white text-xs font-bold">
            보기
          </span>
          {bank.map((w) => (
            <span
              key={w}
              className="text-sm font-medium text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
            >
              {w}
            </span>
          ))}
        </div>
      )}
      {items.map((item, i) => (
        <div
          key={item.id}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start gap-3">
            <span className="shrink-0 text-sm font-black text-emerald-600 dark:text-emerald-400 w-6 text-right">
              {i + 1}
            </span>
            <p className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-100">
              {renderBlankSentence(item.sentence, item.answer, showAnswer)}
            </p>
          </div>
          <p className="ml-9 mt-1 text-[11px] text-gray-400 dark:text-gray-500">
            힌트 · {item.baseWord}
          </p>
        </div>
      ))}
    </div>
  );
}

function renderBlankSentence(
  sentence: string,
  answer: string,
  showAnswer: boolean
): React.ReactNode {
  const parts = sentence.split("___");
  return parts.map((p, i) => (
    <span key={i}>
      {p}
      {i < parts.length - 1 &&
        (showAnswer ? (
          <span className="inline-block px-2 mx-0.5 border-b-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold">
            {answer}
          </span>
        ) : (
          <span className="inline-block min-w-[100px] px-2 mx-0.5 border-b-2 border-gray-400 dark:border-gray-500" />
        ))}
    </span>
  ));
}

// ─── 문장 정확하게 쓰기 - 배열 ──────────────────────
function RearrangeView({
  content,
  showAnswer,
}: {
  content: GrammarWritingContent;
  showAnswer: boolean;
}) {
  if (content.rearrange.length === 0)
    return <EmptyState message="배열 문항이 아직 없습니다." />;
  return (
    <div className="space-y-3">
      <SectionCallout title="주어진 말 바르게 배열하여 쓰기" tone="cyan" />
      {content.rearrange.map((item, i) => (
        <div
          key={item.id}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start gap-3">
            <span className="shrink-0 text-sm font-black text-emerald-600 dark:text-emerald-400 w-6 text-right">
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-200">
                {item.korean}{" "}
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ({item.words.join(" / ")})
                </span>
              </p>
              <div className="mt-2 flex items-start gap-2 text-[15px] text-gray-800 dark:text-gray-100">
                <span className="text-emerald-500">›</span>
                {showAnswer ? (
                  <p className="font-bold text-emerald-700 dark:text-emerald-300">
                    {item.answer}
                  </p>
                ) : (
                  <p className="text-gray-700 dark:text-gray-200">
                    {item.starter && <span className="font-bold">{item.starter} </span>}
                    <span className="inline-block min-w-[240px] border-b-2 border-gray-300 dark:border-gray-600" />
                    {item.ending && <span className="ml-1">{item.ending}</span>}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 문장 정확하게 쓰기 - 오류 수정 ─────────────────
function ErrorCorrectionView({
  content,
  showAnswer,
}: {
  content: GrammarWritingContent;
  showAnswer: boolean;
}) {
  if (content.errorCorrection.length === 0)
    return <EmptyState message="틀린 부분 고치기 문항이 아직 없습니다." />;
  return (
    <div className="space-y-3">
      <SectionCallout title="틀린 부분 고쳐 문장 다시 쓰기" tone="amber" />
      {content.errorCorrection.map((item, i) => (
        <div
          key={item.id}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start gap-3">
            <span className="shrink-0 text-sm font-black text-amber-600 dark:text-amber-400 w-6 text-right">
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-200">{item.korean}</p>
              <p className="text-[15px] text-gray-800 dark:text-gray-100 mt-1 line-through decoration-amber-500 decoration-2">
                {item.wrong}
              </p>
              <div className="mt-2 flex items-start gap-2">
                <span className="text-emerald-500">›</span>
                {showAnswer ? (
                  <p className="font-bold text-emerald-700 dark:text-emerald-300">
                    {item.answer}
                  </p>
                ) : (
                  <span className="inline-block flex-1 min-w-0 border-b-2 border-gray-300 dark:border-gray-600 h-6" />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 통문장 실제로 쓰기 (우리말 → 영어) ─────────────
function TranslationView({
  content,
  showAnswer,
}: {
  content: GrammarWritingContent;
  showAnswer: boolean;
}) {
  if (content.translation.length === 0)
    return <EmptyState message="통문장 쓰기 문항이 아직 없습니다." />;
  return (
    <div className="space-y-3">
      <SectionCallout title="우리말을 영어로 옮겨 쓰기" tone="cyan" />
      {content.translation.map((item, i) => (
        <div
          key={item.id}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start gap-3">
            <span className="shrink-0 text-sm font-black text-emerald-600 dark:text-emerald-400 w-6 text-right">
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-200">
                {item.korean}{" "}
                {item.hints.length > 0 && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    ({item.hints.join(" / ")})
                  </span>
                )}
              </p>
              <div className="mt-2 flex items-start gap-2 text-[15px]">
                <span className="text-emerald-500">›</span>
                {showAnswer ? (
                  <p className="font-bold text-emerald-700 dark:text-emerald-300">
                    {item.answer}
                  </p>
                ) : (
                  <span className="inline-block flex-1 min-w-0 border-b-2 border-gray-300 dark:border-gray-600 h-6" />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 대화 완성하기 ──────────────────────────────────
function DialogueView({
  content,
  showAnswer,
}: {
  content: GrammarWritingContent;
  showAnswer: boolean;
}) {
  const d = content.dialogue;
  if (!d) return null;
  return (
    <div className="space-y-4">
      <SectionCallout title="빈칸에 알맞은 말 넣어 대화 완성하기" tone="cyan" />
      {d.intro && (
        <p className="text-sm text-gray-600 dark:text-gray-300 italic">{d.intro}</p>
      )}
      {d.hintGroups && d.hintGroups.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {d.hintGroups.map((g, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"
            >
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                {g.label}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                {g.words.join(" / ")}
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-2">
        {d.lines.map((line) => {
          const parts = line.text.split("___");
          let ai = 0;
          return (
            <div
              key={line.id}
              className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold">
                  {line.speaker}
                </span>
                <p className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-100">
                  {parts.map((p, i) => (
                    <span key={i}>
                      {p}
                      {i < parts.length - 1 &&
                        (showAnswer ? (
                          <span className="inline-block px-2 mx-0.5 border-b-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold">
                            {line.answers[ai++] || ""}
                          </span>
                        ) : (
                          <span className="inline-block min-w-[100px] px-2 mx-0.5 border-b-2 border-gray-400 dark:border-gray-500" />
                        ))}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 공통 헬퍼 ──────────────────────────────────────
function SectionCallout({ title, tone }: { title: string; tone: "cyan" | "amber" }) {
  const cls =
    tone === "amber"
      ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
      : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200";
  return (
    <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border ${cls}`}>
      {title}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-10 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-500 dark:text-gray-400 text-sm">
      {message}
    </div>
  );
}
