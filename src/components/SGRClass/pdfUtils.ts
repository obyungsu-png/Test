// ===================== PDF Utilities for SGR Class =====================
// Opens a print-friendly HTML window that can be saved as PDF (browser Print → PDF)

import type {
  SGRLesson,
  Question,
  McqQuestion,
  FillBlankQuestion,
  CompleteSentenceQuestion,
  OutlineQuestion,
  TrueFalseQuestion,
} from "./types";

function esc(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// **bold** and __underline__ → HTML
function renderInline(text: string): string {
  let t = esc(text);
  t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/__(.+?)__/g, "<u>$1</u>");
  t = t.replace(/___+/g, '<span class="blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>');
  return t;
}

// Render a question in question-only mode (blanks shown as ___)
function renderQuestionHtml(q: Question, index: number, showAnswer: boolean): string {
  const num = `<span class="qnum">${index + 1}</span>`;

  if (q.type === "main_idea" || q.type === "multiple_choice" || q.type === "vocabulary") {
    const opts = q.options
      .map((o, i) => {
        const letter = String.fromCharCode(97 + i);
        const isCorrect = showAnswer && i === q.answer;
        return `<div class="opt ${isCorrect ? "correct" : ""}">${letter}. ${esc(o)}</div>`;
      })
      .join("");
    const answerBlock = showAnswer
      ? `<div class="answer">▶ 정답: ${String.fromCharCode(97 + q.answer)}. ${esc(q.options[q.answer] || "")}${
          q.explanation ? `<br><span class="expl">해설: ${esc(q.explanation)}</span>` : ""
        }</div>`
      : "";
    return `
      <div class="question">
        <div class="qtext">${num} ${esc(q.question)}</div>
        <div class="opts">${opts}</div>
        ${answerBlock}
      </div>`;
  }

  if (q.type === "fill_blank") {
    const answerBlock = showAnswer
      ? `<div class="answer">▶ 정답: ${esc(q.answer)}</div>`
      : "";
    return `
      <div class="question">
        <div class="qtext">${num} ${renderInline(q.question)}</div>
        ${answerBlock}
      </div>`;
  }

  if (q.type === "complete_sentence") {
    const bank = q.wordBank && q.wordBank.length
      ? `<div class="wordbank">${q.wordBank.map(w => `<span>${esc(w)}</span>`).join("")}</div>`
      : "";
    const sentences = q.sentences
      .map((s, i) => {
        const filled = showAnswer
          ? esc(s.text).replace(/___+/g, `<span class="filled">${esc(s.answer)}</span>`)
          : renderInline(s.text);
        return `<div class="csent"><span class="clabel">${String.fromCharCode(97 + i)}.</span> ${filled}</div>`;
      })
      .join("");
    return `
      <div class="question">
        <div class="qtext">${num} Complete the sentences.</div>
        ${bank}
        ${sentences}
      </div>`;
  }

  if (q.type === "outline") {
    const renderCol = (title: string, items: OutlineQuestion["leftItems"]) => `
      <div class="outcol">
        <div class="outtitle">${esc(title)}</div>
        <ul>
          ${items
            .map(it => {
              const filled = showAnswer && it.answer
                ? esc(it.text).replace(/___+/g, `<span class="filled">${esc(it.answer)}</span>`)
                : renderInline(it.text);
              return `<li>${filled}</li>`;
            })
            .join("")}
        </ul>
      </div>`;
    return `
      <div class="question">
        <div class="qtext">${num} Complete the outline.</div>
        <div class="outrow">
          ${renderCol(q.leftTitle, q.leftItems)}
          ${renderCol(q.rightTitle, q.rightItems)}
        </div>
      </div>`;
  }

  if (q.type === "true_false") {
    const rows = q.statements
      .map((s, i) => {
        const tMark = showAnswer && s.answer ? "✔" : "";
        const fMark = showAnswer && !s.answer ? "✔" : "";
        return `
          <div class="tfrow">
            <span class="clabel">${i + 1}.</span>
            <span class="tftext">${esc(s.text)}</span>
            <span class="tfbox">T ${tMark}</span>
            <span class="tfbox">F ${fMark}</span>
          </div>`;
      })
      .join("");
    return `
      <div class="question">
        <div class="qtext">${num} Check T (True) or F (False).</div>
        ${rows}
      </div>`;
  }

  return "";
}

function renderVocabReviewHtml(lesson: SGRLesson, showAnswer: boolean): string {
  const { wordBank, items } = lesson.vocabReview;
  if (items.length === 0) return "";
  const bank = wordBank.length
    ? `<div class="wordbank">${wordBank.map(w => `<span>${esc(w)}</span>`).join("")}</div>`
    : "";
  const rows = items
    .map((it, i) => {
      const filled = showAnswer
        ? esc(it.sentence).replace(/___+/g, `<span class="filled">${esc(it.answer)}</span>`)
        : renderInline(it.sentence);
      return `<div class="csent"><span class="clabel">${i + 1}.</span> ${filled}</div>`;
    })
    .join("");
  return `
    <div class="section">
      <h2 class="section-title">● Vocabulary Review</h2>
      <p class="section-sub">Complete each sentence. Change the form if necessary.</p>
      ${bank}
      ${rows}
    </div>`;
}

function renderVocabPreviewHtml(lesson: SGRLesson, showAnswer: boolean): string {
  if (lesson.vocabularyPreview.length === 0) return "";
  const words = lesson.vocabularyPreview.map(v => v.word).join("&nbsp;&nbsp;&nbsp;");
  const rows = lesson.vocabularyPreview
    .map((v, i) => {
      const shown = showAnswer
        ? `<span class="filled">${esc(v.word)}</span>`
        : `<span class="blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`;
      return `<div class="csent"><span class="clabel">${i + 1}.</span> ${shown} : ${esc(v.meaning)}</div>`;
    })
    .join("");
  return `
    <div class="section">
      <h2 class="section-title">● Vocabulary Preview</h2>
      <p class="section-sub">${esc(lesson.vocabPreviewInstruction)}</p>
      <div class="wordbank">${lesson.vocabularyPreview.map(v => `<span>${esc(v.word)}</span>`).join("")}</div>
      ${rows}
    </div>`;
}

function renderPassageHtml(lesson: SGRLesson): string {
  if (lesson.passageParagraphs.length === 0) return "";
  const paras = lesson.passageParagraphs
    .map(p => `<p>${renderInline(p.content)}</p>`)
    .join("");
  return `
    <div class="section">
      <h2 class="section-title">${esc(lesson.passageTitle || "Reading Passage")}</h2>
      ${paras}
    </div>`;
}

function buildHtml(lesson: SGRLesson, showAnswer: boolean): string {
  const previewHtml = renderVocabPreviewHtml(lesson, showAnswer);
  const passageHtml = renderPassageHtml(lesson);
  const questionsHtml = lesson.questions
    .map((q, i) => renderQuestionHtml(q, i, showAnswer))
    .join("");
  const vocabReviewHtml = renderVocabReviewHtml(lesson, showAnswer);

  const modeLabel = showAnswer ? "문제+해답편" : "문제편";
  const title = `Unit ${esc(lesson.unitNumber)}: ${esc(lesson.title)} — ${modeLabel}`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @page { size: A4; margin: 20mm 15mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; color: #222; line-height: 1.55; }
  .header { border-bottom: 2px solid #0891b2; padding-bottom: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
  .header h1 { margin: 0; font-size: 20px; color: #0891b2; }
  .header .meta { font-size: 12px; color: #666; }
  .section { margin-top: 22px; page-break-inside: avoid; }
  .section-title { font-size: 15px; color: #0e7490; border-left: 4px solid #0891b2; padding-left: 8px; margin: 0 0 6px 0; }
  .section-sub { color: #555; margin: 0 0 10px 0; font-size: 13px; }
  p { margin: 8px 0; font-size: 13.5px; text-align: justify; }
  strong { color: #0e7490; }
  .question { margin: 14px 0; page-break-inside: avoid; }
  .qnum { display: inline-block; background: #0891b2; color: white; width: 22px; height: 22px; border-radius: 50%; text-align: center; line-height: 22px; font-size: 12px; margin-right: 6px; }
  .qtext { font-weight: 600; margin-bottom: 6px; font-size: 14px; }
  .opts { margin-left: 26px; }
  .opt { padding: 3px 0; font-size: 13.5px; }
  .opt.correct { color: #0891b2; font-weight: 700; }
  .opt.correct::before { content: "▶ "; }
  .answer { margin-top: 6px; margin-left: 26px; padding: 6px 10px; background: #ecfeff; border-left: 3px solid #0891b2; font-size: 13px; color: #0e7490; }
  .expl { color: #555; font-size: 12.5px; }
  .blank { border-bottom: 1px solid #333; display: inline-block; min-width: 60px; }
  .filled { color: #0891b2; font-weight: 700; border-bottom: 1px solid #0891b2; padding: 0 4px; }
  .wordbank { background: #f1f5f9; border-radius: 20px; padding: 8px 16px; margin: 8px 0; font-size: 13px; }
  .wordbank span { display: inline-block; margin: 0 10px; color: #334155; }
  .csent { padding: 6px 0; font-size: 13.5px; }
  .clabel { font-weight: 700; color: #0891b2; margin-right: 6px; }
  .outrow { display: flex; gap: 16px; margin-top: 8px; }
  .outcol { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; }
  .outtitle { font-weight: 700; color: #0e7490; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; margin-bottom: 8px; text-align: center; }
  .outcol ul { margin: 0; padding-left: 18px; }
  .outcol li { font-size: 13px; padding: 3px 0; }
  .tfrow { display: flex; align-items: center; padding: 4px 0; font-size: 13.5px; }
  .tftext { flex: 1; margin: 0 6px; }
  .tfbox { border: 1px solid #666; padding: 2px 8px; margin-left: 6px; font-size: 12px; font-weight: 700; }
  @media print { .noprint { display: none; } }
  .noprint { position: fixed; bottom: 20px; right: 20px; z-index: 1000; }
  .noprint button { padding: 10px 20px; background: #0891b2; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
</style>
</head>
<body>
  <div class="header">
    <h1>Unit ${esc(lesson.unitNumber)} · ${esc(lesson.title)}</h1>
    <div class="meta">${esc(lesson.subject)} ${lesson.category ? "· " + esc(lesson.category) : ""} · <strong>${modeLabel}</strong></div>
  </div>
  ${previewHtml}
  ${passageHtml}
  ${lesson.questions.length ? `<div class="section"><h2 class="section-title">● Main Idea and Details</h2>${questionsHtml}</div>` : ""}
  ${vocabReviewHtml}
  <div class="noprint">
    <button onclick="window.print()">🖨️ 인쇄 / PDF로 저장</button>
  </div>
</body>
</html>`;
}

export function downloadSGRPdf(lesson: SGRLesson, mode: "question" | "answer") {
  const html = buildHtml(lesson, mode === "answer");
  const win = window.open("", "_blank");
  if (!win) {
    alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
