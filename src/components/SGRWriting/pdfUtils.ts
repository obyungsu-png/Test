// ===================== PDF Utilities for SGR Writing =====================
// Opens a print-friendly HTML window that auto-prints (browser Print → PDF)

import type { SGRWritingLesson } from "./types";

function esc(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function downloadSGRWritingPdf(lesson: SGRWritingLesson, mode: "question" | "answer") {
  const html = buildWritingHtml(lesson, mode === "answer");
  const win = window.open("", "_blank");
  if (!win) {
    alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

function buildWritingHtml(lesson: SGRWritingLesson, showAnswer: boolean): string {
  const wordRows = lesson.words
    .map(
      (w) => `
      <div class="word-row">
        <div class="word-hint">${esc(w.hint)}</div>
        <div class="word-kr">${esc(w.kr)}</div>
      </div>`
    )
    .join("");

  const wordAnswers = lesson.words.map((w) => w.ans).join(" / ");

  const exprRows = lesson.expressions
    .map(
      (e) => `
      <div class="expr-block">
        <div class="expr-title">${esc(e.title)}</div>
        <div class="expr-note">${esc(e.note)}</div>
        <div class="expr-practice">${esc(e.exampleKr)}<br>
          <span class="expr-en">${esc(e.exampleEn)}</span>
        </div>
        <div class="expr-practice" style="margin-top: 12px;">${esc(e.challengeKr)}<br>
          ${showAnswer
            ? `<span class="filled">${esc(e.challengeEn)}</span>`
            : `<span class="underline">__________________________________________________________________________</span>`}
        </div>
      </div>`
    )
    .join("");

  const reviewRows = lesson.reviews
    .map(
      (r) => `
      <div style="margin-bottom: 25px;">
        <strong>${esc(r.kr)}</strong><br>
        <div class="guide-text">${esc(r.guide)}</div>
        ${showAnswer
          ? `<span class="filled">${esc(r.ans)}</span>`
          : `<span class="underline">__________________________________________________________________________</span>`}
      </div>`
    )
    .join("");

  const answerSection = showAnswer
    ? `
      <div class="ans-box">
        <div class="ans-title">모범 답안</div>
        <strong>주요표현 도전:</strong><br>
        ${lesson.expressions.map((e, i) => `${i + 1}. ${esc(e.challengeEn)}`).join("<br>")}
        <br><br>
        <strong>복습 응용 영작:</strong><br>
        ${lesson.reviews.map((r) => esc(r.ans)).join("<br>")}
      </div>`
    : "";

  const modeLabel = showAnswer ? "문제+해답편" : "문제편";
  const title = `Unit ${lesson.unitNumber}: ${lesson.title} — ${modeLabel}`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @page { size: A4; margin: 20mm 15mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Times New Roman', serif; color: #2d3748; line-height: 1.6; font-size: 10.5pt; margin: 0; padding: 0; }
  .header { border-bottom: 2px solid #2b6cb0; padding-bottom: 10px; margin-bottom: 20px; }
  .header h1 { font-size: 16pt; color: #1a365d; margin: 0; font-weight: bold; }
  .header .meta { font-size: 10pt; color: #4a5568; margin-top: 5px; }
  .notice-box { background-color: #ebf8ff; border-left: 4px solid #3182ce; padding: 12px; font-weight: bold; margin-bottom: 20px; }
  .quote-box { font-style: italic; background-color: #f7fafc; border: 1px solid #e2e8f0; padding: 12px; margin-bottom: 20px; font-family: 'Times New Roman', serif; }
  .section-title { font-size: 12pt; color: #2b6cb0; font-weight: bold; margin-top: 25px; margin-bottom: 12px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px; page-break-after: avoid; }
  .word-row { margin-bottom: 12px; display: table; width: 100%; }
  .word-hint { display: table-cell; width: 40px; font-weight: bold; color: #2b6cb0; font-size: 12pt; }
  .word-kr { display: table-cell; vertical-align: middle; color: #4a5568; }
  .expr-block { margin-bottom: 25px; page-break-inside: avoid; }
  .expr-title { font-weight: bold; color: #2d3748; margin-bottom: 4px; }
  .expr-note { font-size: 9.5pt; color: #718096; margin-bottom: 8px; background-color: #f7fafc; padding: 6px; border-left: 2px solid #cbd5e0; }
  .expr-practice { margin-left: 10px; margin-bottom: 4px; }
  .expr-en { font-family: 'Times New Roman', serif; color: #4a5568; }
  .page-break { page-break-before: always; }
  .guide-text { font-size: 9.5pt; color: #4a5568; font-style: italic; margin-left: 10px; }
  .ans-box { background-color: #f7fafc; border: 1px solid #e2e8f0; padding: 12px; margin-top: 30px; font-size: 10pt; }
  .ans-title { font-weight: bold; color: #1a365d; margin-bottom: 8px; }
  .underline { color: #cbd5e0; font-size: 8pt; }
  .filled { color: #2b6cb0; font-weight: bold; border-bottom: 1px solid #2b6cb0; padding: 0 4px; }
  @media print { .noprint { display: none; } }
  .noprint { position: fixed; bottom: 20px; right: 20px; z-index: 1000; }
  .noprint button { padding: 10px 20px; background: #2b6cb0; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
</style>
</head>
<body>
  <div class="header">
    <h1>${esc(lesson.title)}</h1>
    <div class="meta">${esc(lesson.bookTitle)} · ${modeLabel}</div>
  </div>

  <div class="notice-box">${esc(lesson.notice)}</div>

  <div class="quote-box">
    ${esc(lesson.quoteEn)}<br>
    <span style="font-family: sans-serif; font-style: normal; font-size: 10pt; color: #4a5568;">${esc(lesson.quoteKr)}</span>
  </div>

  <div class="section-title">핵심 단어 살펴�보기</div>
  <p style="font-size: 9.5pt; color: #718096; margin-bottom: 15px;">주어진 철자로 시작하는 알맞은 단어를 떠올려 보세요.</p>
  ${wordRows}
  ${showAnswer ? `<div style="margin-top: 20px; font-size: 9.5pt; color: #a0aec0;">(정답: ${esc(wordAnswers)})</div>` : ""}

  <div class="section-title">오늘의 핵심 표현</div>
  <p><strong>${esc(lesson.keyExpression)}</strong></p>
  <div style="margin-top: 15px; background-color: #f7fafc; padding: 12px; border: 1px solid #e2e8f0;">
    <span style="font-weight: bold; color: #2b6cb0;">핵심 문장 미리 보기</span><br><br>
    ${esc(lesson.previewKr)}<br>
    <span style="font-family: 'Times New Roman', serif; font-weight: bold; font-size: 11pt; color: #1a365d;">→ ${esc(lesson.previewEn)}</span>
  </div>

  <div class="page-break"></div>
  <div class="header">
    <h1>${esc(lesson.title)}</h1>
    <div class="meta">주요 표현 학습</div>
  </div>
  ${exprRows}

  <div class="page-break"></div>
  <div class="header">
    <h1>${esc(lesson.title)}</h1>
    <div class="meta">복습 응용 영작 및 모범 답안</div>
  </div>

  <div class="section-title">복습 응용 영작</div>
  ${reviewRows}
  ${answerSection}

  <div class="noprint">
    <button onclick="window.print()">🖨️ 인쇄 / PDF로 저장</button>
  </div>
  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 500); };
  </script>
</body>
</html>`;
}
