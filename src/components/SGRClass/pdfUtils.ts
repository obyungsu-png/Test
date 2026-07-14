// ===================== PDF Utilities for SGR Class =====================
// Opens a print-friendly HTML window that auto-prints (browser Print → PDF)

import type {
  SGRLesson,
  Question,
  McqQuestion,
  FillBlankQuestion,
  CompleteSentenceQuestion,
  OutlineQuestion,
  TrueFalseQuestion,
  GrammarPoint,
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

// ─── 자동 생성 유틸리티 ───────────────────────────────

// passage 문장 단위 분할
function splitSentences(text: string): string[] {
  return text
    .replace(/\n/g, " ")
    .match(/[^.!?]+[.!?]+/g) || [text];
}

// 단어가 빈칸 후보인지 판별 (길이 4 이상, 관사/전치사 제외)
const SKIP_WORDS = new Set(["the", "this", "that", "these", "those", "with", "from", "into", "have", "been", "were", "they", "their", "there", "which", "would", "could", "should", "such", "also", "than", "when", "where", "while", "about"]);

function isBlankCandidate(word: string): boolean {
  const w = word.toLowerCase().replace(/[^a-z']/g, "");
  return w.length >= 4 && !SKIP_WORDS.has(w);
}

// 첫 글자 + 빈칸 생성 (예: "geography" → "g_________")
function firstLetterBlank(word: string): string {
  const clean = word.replace(/[^a-zA-Z']/g, "");
  if (clean.length < 2) return word;
  return clean[0] + "_".repeat(clean.length - 1);
}

// passage 전체 빈칸넣기 (문장당 1~2개 단어, 첫 글자 제공)
function generatePassageFillBlank(lesson: SGRLesson, showAnswer: boolean): string {
  if (lesson.passageParagraphs.length === 0) return "";
  const rows: string[] = [];
  let idx = 1;
  lesson.passageParagraphs.forEach((para, pi) => {
    const sentences = splitSentences(para.content);
    sentences.forEach(sent => {
      const words = sent.split(/\s+/);
      // 빈칸 후보 인덱스 찾기
      const candidates: number[] = [];
      words.forEach((w, i) => { if (isBlankCandidate(w)) candidates.push(i); });
      // 문장당 최대 1~2개
      const blankCount = Math.min(candidates.length, sent.length > 80 ? 2 : 1);
      const blankIndices = candidates.slice(0, blankCount);

      const processed = words.map((w, i) => {
        if (blankIndices.includes(i)) {
          if (showAnswer) {
            const clean = w.replace(/[^a-zA-Z']/g, "");
            return `<span class="filled">${esc(clean)}</span>` + (w.match(/[^a-zA-Z']*$/)?.[0] || "");
          }
          return `<span class="blank-word">${firstLetterBlank(w)}</span>` + (w.match(/[^a-zA-Z']*$/)?.[0] || "");
        }
        return esc(w);
      }).join(" ");
      rows.push(`<div class="pfill"><span class="clabel">(${idx})</span> ${processed}</div>`);
      idx++;
    });
  });
  return `
    <div class="section">
      <h2 class="section-title">● Passage Fill-in-the-Blanks</h2>
      <p class="section-sub">빈칸에 알맞은 단어를 쓰세요. (첫 글자가 주어집니다.)</p>
      ${rows.join("")}
    </div>`;
}

// 글의 흐름 (Organization) 빈칸넣기
function generateOrganizationBlank(lesson: SGRLesson, showAnswer: boolean): string {
  if (lesson.passageParagraphs.length === 0) return "";
  // 각 단락의 첫 문장을 주제 문장으로 사용, 빈칸 처리
  const rows: string[] = [];
  lesson.passageParagraphs.forEach((para, i) => {
    const sentences = splitSentences(para.content);
    const topicSent = sentences[0] || para.content;
    const words = topicSent.split(/\s+/);
    const candidates: number[] = [];
    words.forEach((w, j) => { if (isBlankCandidate(w)) candidates.push(j); });
    const blankIdx = candidates[0] !== undefined ? candidates[0] : -1;

    const processed = words.map((w, j) => {
      if (j === blankIdx) {
        if (showAnswer) {
          const clean = w.replace(/[^a-zA-Z']/g, "");
          return `<span class="filled">${esc(clean)}</span>` + (w.match(/[^a-zA-Z']*$/)?.[0] || "");
        }
        return `<span class="blank-word">${firstLetterBlank(w)}</span>` + (w.match(/[^a-zA-Z']*$/)?.[0] || "");
      }
      return esc(w);
    }).join(" ");
    rows.push(`
      <div class="org-row">
        <span class="org-num">단락 ${i + 1}</span>
        <span class="org-text">${processed}</span>
      </div>`);
  });
  return `
    <div class="section">
      <h2 class="section-title">● 글의 흐름 (Organization)</h2>
      <p class="section-sub">각 단락의 주제 문장에서 빈칸을 채우세요.</p>
      ${rows.join("")}
    </div>`;
}

// 주요 구문 (Key Phrases) — directReading의 grammarPoints에서 추출
function generateKeyPhrases(lesson: SGRLesson): string {
  const allGps: Array<{ gp: GrammarPoint; eng: string }> = [];
  lesson.directReading.forEach(d => {
    (d.grammarPoints || []).forEach(gp => {
      allGps.push({ gp, eng: d.english });
    });
  });
  if (allGps.length === 0) return "";
  const rows = allGps.map((item, i) => `
    <div class="kp-row">
      <span class="kp-num">${i + 1}</span>
      <div class="kp-content">
        <span class="kp-highlight">"${esc(item.gp.highlight)}"</span>
        <span class="kp-type">[${esc(item.gp.type)}] ${esc(item.gp.label)}</span>
        <p class="kp-desc">${esc(item.gp.description)}</p>
      </div>
    </div>`).join("");
  return `
    <div class="section">
      <h2 class="section-title">● 주요 구문 (Key Phrases)</h2>
      ${rows}
    </div>`;
}

// ─── 기존 렌더링 함수들 ───────────────────────────────

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
  // 새 섹션들
  const keyPhrasesHtml = generateKeyPhrases(lesson);
  const orgBlankHtml = generateOrganizationBlank(lesson, showAnswer);
  const passageBlankHtml = generatePassageFillBlank(lesson, showAnswer);

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
  .blank-word { border-bottom: 2px solid #333; display: inline-block; letter-spacing: 1px; font-weight: 600; color: #555; }
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
  /* 주요 구문 */
  .kp-row { display: flex; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
  .kp-num { width: 22px; height: 22px; background: #0891b2; color: white; border-radius: 50%; text-align: center; line-height: 22px; font-size: 11px; flex-shrink: 0; }
  .kp-content { flex: 1; }
  .kp-highlight { font-weight: 700; color: #0e7490; }
  .kp-type { font-size: 12px; color: #6366f1; margin-left: 6px; }
  .kp-desc { font-size: 12.5px; color: #555; margin: 2px 0 0 0; }
  /* Organization */
  .org-row { display: flex; align-items: flex-start; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
  .org-num { background: #e0f2fe; color: #0e7490; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .org-text { font-size: 13.5px; flex: 1; }
  /* Passage fill blank */
  .pfill { padding: 6px 0; font-size: 13.5px; line-height: 1.8; }
  @media print { .noprint { display: none; } body { font-size: 12px; } }
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
  ${keyPhrasesHtml}
  ${orgBlankHtml}
  ${passageBlankHtml}
  <div class="noprint">
    <button onclick="window.print()">🖨️ 인쇄 / PDF로 저장</button>
  </div>
  <script>
    // 자동 인쇄
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
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
