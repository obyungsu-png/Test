// ===================== PDF Utilities for SGR Voca =====================
// Opens a print-friendly HTML window (browser Print → PDF)

import type { SGRVocaLesson } from "./types";

function esc(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// **bold**, __underline__ → HTML
function fmt(s: string): string {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#be123c;">$1</strong>')
    .replace(/__(.+?)__/g, "<u>$1</u>");
}

export function downloadSGRVocaPdf(lesson: SGRVocaLesson, mode: "question" | "answer") {
  const html = buildVocaHtml(lesson, mode === "answer");
  const win = window.open("", "_blank");
  if (!win) {
    alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

function buildVocaHtml(lesson: SGRVocaLesson, showAnswer: boolean): string {
  const wordRows = lesson.words
    .map(
      (w) => `
      <div class="word-row">
        <div class="word-img">${w.imageUrl ? `<img src="${esc(w.imageUrl)}" alt="">` : ""}</div>
        <div class="word-body">
          <div class="word-head">
            <span class="word-name">${esc(w.word)}</span>
            ${w.pronunciation ? `<span class="word-pron">[${esc(w.pronunciation)}]</span>` : ""}
          </div>
          <div class="word-def">${w.partOfSpeech ? `<em>${esc(w.partOfSpeech)}</em> ` : ""}${esc(w.definition)}</div>
          <div class="word-ex">${esc(w.example)}</div>
        </div>
      </div>`
    )
    .join("");

  const mcqSection = (badge: string, instruction: string, questions: SGRVocaLesson["definitionQuestions"]) => {
    if (questions.length === 0) return "";
    const rows = questions
      .map((q, qi) => {
        const opts = q.options
          .map((o, oi) => {
            const isAns = showAnswer && oi === q.answer;
            return `<span class="opt${isAns ? " ans" : ""}">${String.fromCharCode(97 + oi)}. ${esc(o)}${isAns ? " ✓" : ""}</span>`;
          })
          .join("");
        return `
        <div class="mcq">
          <span class="mcq-num">${qi + 1}.</span>
          <span class="mcq-prompt">${esc(q.prompt)}</span>
          <div class="mcq-opts">${opts}</div>
        </div>`;
      })
      .join("");
    return `
      <div class="ex-head"><span class="ex-badge">${badge}</span> ${esc(instruction)}</div>
      ${rows}`;
  };

  const cRows = lesson.fillBlanks
    .map((fb, i) => {
      return `
      <div class="c-row">
        <span class="mcq-num">${i + 1}.</span>
        <div>
          <div>${fmt(fb.sentence)}</div>
          <div class="c-hint">${showAnswer
            ? `<span class="filled">${esc(fb.answer)}</span>`
            : `<span class="hint-mono">${esc(fb.hint)}</span>`}</div>
        </div>
      </div>`;
    })
    .join("");

  const passageParas = lesson.passage.content
    .split(/\n+/)
    .filter(p => p.trim())
    .map(p => `<p class="passage-p">${fmt(p)}</p>`)
    .join("");

  const passageQs = lesson.passage.questions
    .map((q, qi) => {
      if (q.options.length > 0) {
        const opts = q.options
          .map((o, oi) => {
            const isAns = showAnswer && oi === q.answer;
            return `<div class="pq-opt${isAns ? " ans" : ""}">${String.fromCharCode(97 + oi)}. ${esc(o)}${isAns ? " ✓" : ""}</div>`;
          })
          .join("");
        return `
        <div class="pq">
          <div class="pq-q">${qi + 1}. ${esc(q.question)}</div>
          ${opts}
        </div>`;
      }
      return `
      <div class="pq">
        <div class="pq-q">${qi + 1}. ${esc(q.question)}</div>
        ${showAnswer
          ? `<div class="filled" style="margin-top:6px;">${esc(String(q.answer))}</div>`
          : '<div class="write-line"></div><div class="write-line"></div>'}
      </div>`;
    })
    .join("");

  const modeLabel = showAnswer ? "문제+해답편" : "문제편";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>Unit ${esc(lesson.unitNumber)}: ${esc(lesson.title)} — ${modeLabel}</title>
<style>
  @page { size: A4; margin: 18mm 15mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Times New Roman', serif; color: #1f2937; line-height: 1.55; font-size: 10.5pt; margin: 0; }
  .unit-hero { display: flex; align-items: center; gap: 14px; border-bottom: 3px solid #be123c; padding-bottom: 10px; margin-bottom: 18px; }
  .unit-badge { width: 52px; height: 52px; border-radius: 50%; background: #111827; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .unit-badge .u { font-size: 7pt; letter-spacing: 2px; }
  .unit-badge .n { font-size: 16pt; font-weight: 900; line-height: 1; }
  h1.big { font-size: 22pt; color: #be123c; margin: 0; font-weight: 900; letter-spacing: 1px; }
  .word-row { display: flex; gap: 10px; margin-bottom: 12px; page-break-inside: avoid; }
  .word-img { width: 64px; height: 64px; border-radius: 6px; background: #f3f4f6; overflow: hidden; flex-shrink: 0; }
  .word-img img { width: 100%; height: 100%; object-fit: cover; }
  .word-name { font-size: 12pt; font-weight: 800; color: #be123c; }
  .word-pron { color: #6b7280; font-size: 9pt; margin-left: 6px; }
  .word-def { color: #374151; }
  .word-def em { font-weight: 600; }
  .word-ex { color: #6b7280; font-style: italic; font-size: 9.5pt; }
  .ex-head { display: flex; align-items: center; gap: 8px; font-size: 12pt; font-weight: 800; margin: 18px 0 12px; page-break-after: avoid; }
  .ex-badge { width: 26px; height: 26px; border-radius: 5px; background: #be123c; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-weight: 900; }
  .mcq { margin-bottom: 12px; page-break-inside: avoid; }
  .mcq-num { font-weight: 800; color: #be123c; margin-right: 4px; }
  .mcq-prompt { font-weight: 700; background: #f3f4f6; padding: 1px 6px; border-radius: 4px; }
  .mcq-opts { margin: 6px 0 0 22px; }
  .opt { display: inline-block; margin-right: 22px; }
  .opt.ans, .pq-opt.ans { color: #047857; font-weight: 800; }
  .c-row { display: flex; gap: 6px; margin-bottom: 14px; page-break-inside: avoid; }
  .c-hint { margin-top: 4px; }
  .hint-mono { font-family: 'Consolas', monospace; letter-spacing: 4px; color: #9ca3af; font-size: 11pt; }
  .filled { color: #be123c; font-weight: 800; border-bottom: 2px solid #be123c; padding: 0 6px; }
  .passage-title { background: #be123c; color: #fff; font-size: 16pt; font-weight: 900; padding: 8px 16px; border-radius: 6px; display: inline-block; margin-bottom: 14px; }
  .passage-p { text-align: justify; text-indent: 2em; margin: 0 0 10px; }
  .rc-head { margin: 20px 0 12px; font-size: 13pt; font-weight: 900; border-bottom: 2px solid #111827; padding-bottom: 4px; }
  .pq { margin-bottom: 12px; page-break-inside: avoid; }
  .pq-q { font-weight: 700; margin-bottom: 4px; }
  .pq-opt { margin-left: 18px; }
  .write-line { border-bottom: 1px solid #9ca3af; height: 22px; margin-top: 6px; }
  .page-break { page-break-before: always; }
  @media print { .noprint { display: none; } }
  .noprint { position: fixed; bottom: 20px; right: 20px; z-index: 1000; }
  .noprint button { padding: 10px 20px; background: #be123c; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
</style>
</head>
<body>
  <div class="unit-hero">
    <div class="unit-badge"><span class="u">UNIT</span><span class="n">${esc(lesson.unitNumber)}</span></div>
    <h1 class="big">WORD LIST</h1>
  </div>
  ${wordRows}

  <div class="page-break"></div>
  <h1 class="big" style="font-size:18pt; margin-bottom:6px;">EXERCISES</h1>
  ${mcqSection("A", "Circle the word that best fits the given definition.", lesson.definitionQuestions)}
  ${mcqSection("B", "Circle the word that is opposite in meaning to the given word.", lesson.antonymQuestions)}

  <div class="page-break"></div>
  <div class="ex-head"><span class="ex-badge">C</span> Write a word that is similar in meaning to the underlined word(s).</div>
  ${cRows}

  <div class="page-break"></div>
  <div class="passage-title">${esc(lesson.passage.title || lesson.passageTitle)}</div>
  ${passageParas}

  <div class="rc-head">READING COMPREHENSION — Answer the questions.</div>
  ${passageQs}

  <div class="noprint">
    <button onclick="window.print()">🖨️ 인쇄 / PDF로 저장</button>
  </div>
  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 500); };
  </script>
</body>
</html>`;
}
