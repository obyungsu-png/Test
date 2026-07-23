import { useMemo } from "react";
import type {
  SGRLesson,
  ReadingExploreContent,
  RELabeledParagraph,
  REConceptMapNode,
} from "./types";
import { useAnswers, isTextCorrect, type AnswerValue } from "./answerState";

/** Reading Explore 형식 렌더러 (사진 2-4 레이아웃) */

interface Props {
  lesson: SGRLesson;
  content: ReadingExploreContent;
  showAnswer: boolean;
  subTab: "reading" | "comprehension" | "readingSkill" | "vocabPractice";
}

// ── 인라인 포맷: **bold**, __underline__, ==red== ──
function fmt(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|__[^_]+__|==[^=]+==)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(<span key={key++}>{text.slice(last, m.index)}</span>);
    const raw = m[0];
    if (raw.startsWith("**")) {
      nodes.push(<strong key={key++} className="font-bold">{raw.slice(2, -2)}</strong>);
    } else if (raw.startsWith("__")) {
      nodes.push(
        <span key={key++} className="underline decoration-2 underline-offset-2">
          {raw.slice(2, -2)}
        </span>
      );
    } else {
      nodes.push(
        <span key={key++} className="font-bold text-rose-600 dark:text-rose-400">
          {raw.slice(2, -2)}
        </span>
      );
    }
    last = m.index + raw.length;
  }
  if (last < text.length) nodes.push(<span key={key++}>{text.slice(last)}</span>);
  return nodes;
}

export function ReadingExploreRenderer(props: Props) {
  const { subTab } = props;
  if (subTab === "reading") return <ReadingView {...props} />;
  if (subTab === "comprehension") return <ComprehensionView {...props} />;
  if (subTab === "readingSkill") return <ReadingSkillView {...props} />;
  return <VocabPracticeView {...props} />;
}

// ─── Reading (본문) ─────────────────────────────────
function ReadingView({ content }: Props) {
  const { reading } = content;
  return (
    <div className="max-w-[820px] mx-auto p-6 lg:p-10 bg-gradient-to-br from-white to-rose-50/40 dark:from-gray-900 dark:to-gray-800 rounded-2xl">
      {/* Headline */}
      <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight text-gray-800 dark:text-gray-100 mb-2">
        {reading.headline}
        {reading.headlineAccent && (
          <span className="block text-rose-600 dark:text-rose-400">
            {reading.headlineAccent}
          </span>
        )}
      </h1>
      {reading.intro && (
        <p className="italic text-gray-600 dark:text-gray-300 mb-6">
          {reading.intro}
        </p>
      )}

      {/* Paragraphs */}
      <div className="space-y-4 text-[16px] leading-[1.8] text-gray-800 dark:text-gray-100">
        {reading.paragraphs.map((p) => (
          <ReadingParagraph key={p.id} p={p} subhead={
            reading.subheads?.find((s) => s.afterParagraphId === p.id)?.text
          } />
        ))}
      </div>

      {/* Footnotes */}
      {reading.footnotes.length > 0 && (
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1 text-xs text-gray-500 dark:text-gray-400">
          {reading.footnotes.map((f) => (
            <p key={f.id}>
              <sup className="font-bold mr-1">{f.marker}</sup>
              {fmt(f.text)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function ReadingParagraph({ p, subhead }: { p: RELabeledParagraph; subhead?: string }) {
  return (
    <>
      <p>
        <span className="inline-block w-6 mr-2 text-sm font-bold text-gray-500 align-top">
          {p.label}
        </span>
        {fmt(p.content)}
      </p>
      {p.imageCaption && (
        <p className="ml-8 text-sm font-bold text-gray-700 dark:text-gray-200">
          ▲ {p.imageCaption}
        </p>
      )}
      {subhead && (
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-4 mb-1">
          {subhead}
        </h2>
      )}
    </>
  );
}

// ─── Reading Comprehension ─────────────────────────
function ComprehensionView({ lesson, content, showAnswer }: Props) {
  const { bucket, set } = useAnswers("sgrClass_re_comp", lesson.id);
  const { mcq, matching } = content.comprehension;
  return (
    <div className="max-w-[1000px] mx-auto p-6 lg:p-10 space-y-6">
      <SectionHeader label="READING COMPREHENSION" />
      <div className="space-y-4">
        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
          A. Choose the best answer for each question.
        </p>
        {mcq.map((q, i) => {
          const picked = bucket[q.id];
          const pickedIdx = typeof picked === "number" ? picked : null;
          return (
            <div
              key={q.id}
              className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <span className="shrink-0 w-24 text-right text-[11px] font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-400 pt-1">
                  {q.category}
                </span>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    <span className="mr-2">{i + 1}.</span>
                    {q.question}
                  </p>
                  <div className="space-y-1.5">
                    {q.options.map((o, oi) => {
                      const isCorrect = oi === q.answer;
                      const isPicked = pickedIdx === oi;
                      let cls = "border-gray-200 dark:border-gray-700 hover:border-cyan-300";
                      if (showAnswer && isCorrect) cls = "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 font-bold";
                      else if (isPicked && showAnswer && !isCorrect) cls = "border-red-400 bg-red-50 dark:bg-red-950/30";
                      else if (isPicked) cls = "border-cyan-400 bg-cyan-50/60 dark:bg-cyan-950/20";
                      return (
                        <button
                          key={oi}
                          type="button"
                          onClick={() => set(q.id, isPicked ? null : oi)}
                          className={`w-full text-left px-3 py-1.5 rounded border-2 text-[14px] transition-colors ${cls}`}
                        >
                          <span className="font-bold mr-2">{String.fromCharCode(97 + oi)}.</span>
                          {o}
                          {showAnswer && isCorrect && <span className="ml-2 text-cyan-600">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {matching && (
        <div className="space-y-3">
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            B. {matching.instruction}
          </p>
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <ol className="space-y-1 text-sm text-gray-800 dark:text-gray-100 mb-3">
              {matching.choices.map((c) => (
                <li key={c.letter}>
                  <span className="font-bold mr-2">{c.letter}.</span>
                  {c.text}
                </li>
              ))}
            </ol>
            <div className="space-y-2">
              {matching.items.map((it, i) => {
                const key = it.id;
                const val = typeof bucket[key] === "string" ? (bucket[key] as string) : "";
                const correct = val.trim().toLowerCase() === it.answer.trim().toLowerCase();
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="font-bold w-6 text-right">{i + 1}.</span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => set(key, e.target.value)}
                      className={`w-14 px-2 py-0.5 border-b-2 bg-transparent text-center font-bold outline-none ${
                        showAnswer
                          ? correct
                            ? "border-cyan-500 text-cyan-700"
                            : "border-red-400 text-red-600"
                          : "border-gray-400 focus:border-cyan-500 text-gray-800 dark:text-gray-100"
                      }`}
                      placeholder="_"
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-100">
                      "{it.statement}"
                    </span>
                    {showAnswer && !correct && (
                      <span className="text-xs text-red-500 ml-1">(정답: {it.answer})</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reading Skill (Concept Map) ────────────────────
function ReadingSkillView({ lesson, content, showAnswer }: Props) {
  const { bucket, set } = useAnswers("sgrClass_re_skill", lesson.id);
  const { readingSkill } = content;

  const grouped = useMemo(() => {
    const center = readingSkill.nodes.find((n) => n.kind === "center");
    const majors = readingSkill.nodes.filter((n) => n.kind === "major");
    const leavesFor = (parentId: string) =>
      readingSkill.nodes.filter((n) => n.kind === "leaf" && n.parentId === parentId);
    return { center, majors, leavesFor };
  }, [readingSkill.nodes]);

  return (
    <div className="max-w-[1100px] mx-auto p-6 lg:p-10 space-y-6">
      <SectionHeader label="READING SKILL" />
      <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
        <h2 className="text-lg font-bold text-cyan-800 dark:text-cyan-300 mb-1">
          {readingSkill.title}
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-200">{readingSkill.intro}</p>
      </div>

      {/* Center + branches */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        {grouped.center && (
          <div className="flex justify-center mb-6">
            <ConceptBubble node={grouped.center} bucket={bucket} onSet={set} showAnswer={showAnswer} tone="primary" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {grouped.majors.map((mj) => (
            <div key={mj.id} className="rounded-xl border-2 border-cyan-200 dark:border-cyan-800 p-4">
              <div className="flex justify-center mb-3">
                <ConceptBubble node={mj} bucket={bucket} onSet={set} showAnswer={showAnswer} tone="major" />
              </div>
              <div className="space-y-2">
                {grouped.leavesFor(mj.id).map((lf) => (
                  <ConceptLeaf key={lf.id} node={lf} bucket={bucket} onSet={set} showAnswer={showAnswer} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConceptBubble({
  node,
  bucket,
  onSet,
  showAnswer,
  tone,
}: {
  node: REConceptMapNode;
  bucket: Record<string, AnswerValue>;
  onSet: (k: string, v: AnswerValue) => void;
  showAnswer: boolean;
  tone: "primary" | "major";
}) {
  const bg = tone === "primary" ? "bg-purple-100 dark:bg-purple-900/40" : "bg-purple-50 dark:bg-purple-950/30";
  return (
    <div className={`inline-block px-6 py-2 rounded-full ${bg} border-2 border-purple-300 dark:border-purple-700 text-center min-w-[160px]`}>
      <ConceptText node={node} bucket={bucket} onSet={onSet} showAnswer={showAnswer} inputSize="sm" />
    </div>
  );
}

function ConceptLeaf({
  node,
  bucket,
  onSet,
  showAnswer,
}: {
  node: REConceptMapNode;
  bucket: Record<string, AnswerValue>;
  onSet: (k: string, v: AnswerValue) => void;
  showAnswer: boolean;
}) {
  return (
    <div className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-sm text-gray-800 dark:text-gray-100">
      <ConceptText node={node} bucket={bucket} onSet={onSet} showAnswer={showAnswer} inputSize="sm" />
    </div>
  );
}

function ConceptText({
  node,
  bucket,
  onSet,
  showAnswer,
  inputSize,
}: {
  node: REConceptMapNode;
  bucket: Record<string, AnswerValue>;
  onSet: (k: string, v: AnswerValue) => void;
  showAnswer: boolean;
  inputSize: "sm" | "md";
}) {
  const parts = node.text.split(/(?:___|_{2,})/);
  const answers = node.answers || [];
  const w = inputSize === "sm" ? "min-w-[70px] max-w-[120px]" : "min-w-[110px] max-w-[220px]";
  return (
    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
      {parts[0]}
      {parts.slice(1).map((p, i) => {
        const key = `${node.id}:${i}`;
        const val = typeof bucket[key] === "string" ? (bucket[key] as string) : "";
        const ans = answers[i] || "";
        const correct = isTextCorrect(val, ans);
        return (
          <span key={i}>
            <input
              type="text"
              value={val}
              onChange={(e) => onSet(key, e.target.value)}
              className={`inline-block ${w} mx-1 px-1 py-0.5 border-b-2 bg-transparent outline-none font-bold text-sm ${
                showAnswer
                  ? correct
                    ? "border-cyan-500 text-cyan-700"
                    : "border-red-400 text-red-600"
                  : "border-gray-400 focus:border-cyan-500 text-gray-800 dark:text-gray-100"
              }`}
              placeholder={showAnswer ? ans : ""}
            />
            {p}
          </span>
        );
      })}
    </span>
  );
}

// ─── Vocabulary Practice ────────────────────────────
function VocabPracticeView({ lesson, content, showAnswer }: Props) {
  const { bucket, set } = useAnswers("sgrClass_re_vp", lesson.id);
  const { completion, definitionMatch, wordForms } = content.vocabPractice;

  const textParts = completion.text.split(/(?:___|_{2,})/);

  return (
    <div className="max-w-[900px] mx-auto p-6 lg:p-10 space-y-6">
      <SectionHeader label="VOCABULARY PRACTICE" />

      {/* A. Completion */}
      <div>
        <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
          A. Complete the information using the words in the box.
        </p>
        <div className="p-3 mb-3 flex flex-wrap items-center gap-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
          {completion.bank.map((w) => (
            <span
              key={w}
              className="text-sm font-bold text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded bg-white dark:bg-gray-800 border border-rose-200 dark:border-rose-800"
            >
              {w}
            </span>
          ))}
        </div>
        <p className="text-[15px] leading-[1.9] text-gray-800 dark:text-gray-100">
          {textParts[0]}
          {textParts.slice(1).map((p, i) => {
            const key = `completion:${i}`;
            const val = typeof bucket[key] === "string" ? (bucket[key] as string) : "";
            const ans = completion.answers[i] || "";
            const correct = isTextCorrect(val, ans);
            return (
              <span key={i}>
                <sup className="text-xs font-bold text-rose-600 mr-0.5">{i + 1}</sup>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => set(key, e.target.value)}
                  className={`inline-block min-w-[100px] max-w-[160px] mx-1 px-2 py-0.5 border-b-2 bg-transparent outline-none font-bold ${
                    showAnswer
                      ? correct
                        ? "border-cyan-500 text-cyan-700"
                        : "border-red-400 text-red-600"
                      : "border-gray-400 focus:border-cyan-500"
                  }`}
                  placeholder={showAnswer ? ans : "___"}
                />
                {p}
              </span>
            );
          })}
        </p>
      </div>

      {/* B. Definition Match */}
      <div>
        <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
          B. Match the words with their definitions.
        </p>
        <div className="space-y-1.5">
          {definitionMatch.map((it) => {
            const key = `def:${it.id}`;
            const val = typeof bucket[key] === "string" ? (bucket[key] as string) : "";
            const correct = isTextCorrect(val, it.definition);
            return (
              <div key={it.id} className="flex items-center gap-3">
                <span className="w-32 shrink-0 font-bold text-rose-700 dark:text-rose-300">
                  {it.word}
                </span>
                <span className="text-gray-400">•</span>
                {showAnswer ? (
                  <span
                    className={`flex-1 text-sm ${
                      correct
                        ? "text-cyan-700 font-bold"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {it.definition}
                    {val && !correct && (
                      <span className="ml-2 text-xs text-red-500">
                        (당신의 답: {val})
                      </span>
                    )}
                  </span>
                ) : (
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => set(key, e.target.value)}
                    className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-sm outline-none focus:border-cyan-500"
                    placeholder="정의를 입력하세요"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* C. Word Forms */}
      <div>
        <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
          C. Word Forms
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 italic">
          {wordForms.explanation}
        </p>
        <div className="space-y-2">
          {wordForms.items.map((it, i) => {
            const key = `wf:${it.id}`;
            const raw = bucket[key];
            const pickedIdx = typeof raw === "number" ? raw : null;
            return (
              <div
                key={it.id}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start gap-2">
                  <span className="font-bold w-6 text-right">{i + 1}.</span>
                  <div className="flex-1">
                    <p className="text-[15px] text-gray-800 dark:text-gray-100">
                      {it.sentence}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {it.options.map((op, oi) => {
                        const isCorrect = oi === it.answer;
                        const isPicked = pickedIdx === oi;
                        let cls = "border-gray-200 dark:border-gray-700";
                        if (showAnswer && isCorrect) cls = "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 font-bold";
                        else if (isPicked && showAnswer && !isCorrect) cls = "border-red-400 bg-red-50";
                        else if (isPicked) cls = "border-cyan-400 bg-cyan-50/60";
                        return (
                          <button
                            key={oi}
                            type="button"
                            onClick={() => set(key, isPicked ? null : oi)}
                            className={`px-3 py-1 rounded border-2 text-sm italic ${cls}`}
                          >
                            {op}
                            {showAnswer && isCorrect && " ✓"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="inline-block px-3 py-1 bg-yellow-300 text-gray-900 rounded font-bold text-xs tracking-widest uppercase">
      {label}
    </div>
  );
}
