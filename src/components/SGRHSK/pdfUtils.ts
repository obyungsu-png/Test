// ===================== PDF Utilities for SGR HSK =====================
// 프린트-친화적 HTML 창을 열고 자동 인쇄(브라우저의 인쇄 → PDF 저장) 방식.

import type { HSKLesson } from "./types";
import { HSK_LEVEL_META, normalizeHSKLevel } from "./types";

function esc(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function downloadHSKPdf(lesson: HSKLesson, opts: { showAnswer?: boolean } = {}) {
  const showAnswer = !!opts.showAnswer;
  const meta = HSK_LEVEL_META[normalizeHSKLevel(lesson.hskLevel)];

  const html = `<!doctype html>
<html lang="zh-Hans">
<head>
<meta charset="utf-8" />
<title>${esc(lesson.title || "HSK Lesson")}</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { box-sizing: border-box; }
  body { font-family: "Noto Sans SC","Noto Sans CJK KR", "Malgun Gothic", "Nanum Gothic", sans-serif; color: #1f2937; margin: 0; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 16px; margin: 24px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #ef4444; color: #b91c1c; }
  .pinyin { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .kor { font-size: 12px; color: #b91c1c; margin-top: 4px; }
  .meta { color: #6b7280; font-size: 11px; margin-bottom: 6px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 10px; font-weight: bold; margin-right: 6px; }
  .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; break-inside: avoid; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #fef2f2; color: #b91c1c; font-size: 11px; }
  .hz { font-size: 14px; font-weight: bold; color: #991b1b; }
  .qbox { border-left: 4px solid #ef4444; background: #fff7ed; padding: 8px 12px; border-radius: 4px; margin-bottom: 8px; }
  .ans { color: #059669; font-weight: bold; }
  .chunk { border-bottom: 1px dashed #fca5a5; padding: 0 4px; margin-right: 4px; }
  .footer { margin-top: 24px; color: #9ca3af; font-size: 10px; text-align: center; }
</style>
</head>
<body>
  <div>
    <span class="badge">${esc(meta.label)}</span>
    <span class="meta">Unit ${esc(lesson.unitNumber)} · ${esc(lesson.category || "")}</span>
  </div>
  <h1>${esc(lesson.title)}</h1>
  ${lesson.titlePinyin ? `<div class="pinyin">${esc(lesson.titlePinyin)}</div>` : ""}
  ${lesson.titleKorean ? `<div class="kor">${esc(lesson.titleKorean)}</div>` : ""}

  ${lesson.previewQuestion ? `<h2>학습 목표</h2><div class="card">${esc(lesson.previewQuestion)}</div>` : ""}

  ${lesson.previewCards.length > 0 ? `
  <h2>Preview</h2>
  ${lesson.previewCards.map(c => `<div class="card">${esc(c.caption)}</div>`).join("")}` : ""}

  ${lesson.passageParagraphs.length > 0 ? `
  <h2>Passage · ${esc(lesson.passageTitle || lesson.title)}</h2>
  ${lesson.passageParagraphs.map((p, i) => `
    <div class="card">
      <div class="meta">단락 ${i + 1}</div>
      <div class="hz" style="font-size:14px; font-weight:normal; color:#111827;">${esc(p.hanzi)}</div>
      <div class="pinyin">${esc(p.pinyin)}</div>
      <div class="kor">${esc(p.korean)}</div>
    </div>`).join("")}` : ""}

  ${lesson.vocab.length > 0 ? `
  <h2>Vocabulary</h2>
  <table>
    <thead><tr><th>한자</th><th>병음</th><th>품사</th><th>뜻</th><th>예문</th></tr></thead>
    <tbody>
      ${lesson.vocab.map(v => `<tr>
        <td class="hz">${esc(v.hanzi)}</td>
        <td class="pinyin" style="color:#6b7280">${esc(v.pinyin)}</td>
        <td>${esc(v.partOfSpeech || "")}</td>
        <td>${esc(v.meaning)}</td>
        <td>${v.example ? `<div class="hz" style="font-size:12px; color:#991b1b;">${esc(v.example)}</div>${v.examplePinyin ? `<div class="pinyin">${esc(v.examplePinyin)}</div>` : ""}${v.exampleKorean ? `<div class="kor">${esc(v.exampleKorean)}</div>` : ""}` : ""}</td>
      </tr>`).join("")}
    </tbody>
  </table>` : ""}

  ${lesson.questions.length > 0 ? `
  <h2>Questions</h2>
  ${lesson.questions.map((q, i) => `
    <div class="qbox">
      <div class="meta"><b>Q${i + 1}</b> · ${esc(qLabel(q.type))}</div>
      <div>${esc(q.question)}</div>
      ${q.questionPinyin ? `<div class="pinyin">${esc(q.questionPinyin)}</div>` : ""}
      ${(q.type === "multiple_choice" || q.type === "tone_pick") && q.options ? `<ol type="A" style="margin:6px 0 0 20px; padding:0;">${q.options.map((op, oi) => `<li ${showAnswer && oi === Number(q.answer) ? 'style="font-weight:bold;color:#059669"' : ""}>${esc(op)}${showAnswer && oi === Number(q.answer) ? " ✓" : ""}</li>`).join("")}</ol>` : ""}
      ${showAnswer && (q.type === "fill_blank" || q.type === "translation_zh_ko" || q.type === "translation_ko_zh") ? `<div class="ans">정답: ${esc(String(q.answer))}</div>` : ""}
      ${showAnswer && q.explanation ? `<div class="meta" style="margin-top:4px;">💡 ${esc(q.explanation)}</div>` : ""}
    </div>`).join("")}` : ""}

  ${lesson.directReading.length > 0 ? `
  <h2>직독직해</h2>
  ${lesson.directReading.map((d, i) => {
    const chunks = d.chunks && d.chunks.length > 0 ? d.chunks : d.hanzi.split("/").map(s => s.trim());
    return `<div class="card">
      <div class="meta">문장 ${i + 1}</div>
      <div>${chunks.map(c => `<span class="chunk hz" style="font-weight:normal;color:#111827;">${esc(c)}</span>`).join("")}</div>
      <div class="pinyin">${esc(d.pinyin)}</div>
      <div class="kor">${esc(d.korean)}</div>
      ${d.grammarPoint ? `<div class="meta" style="margin-top:4px;background:#fefce8;padding:4px 6px;border-radius:4px;">💡 ${esc(d.grammarPoint)}</div>` : ""}
    </div>`;
  }).join("")}` : ""}

  <div class="footer">SGR HSK · ${esc(meta.label)} · Unit ${esc(lesson.unitNumber)}</div>
</body>
</html>`;

  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) {
    alert("팝업이 차단되어 PDF 를 열 수 없습니다. 팝업 허용 후 다시 시도해주세요.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  setTimeout(() => {
    try { w.focus(); w.print(); } catch {}
  }, 300);
}

function qLabel(t: string): string {
  switch (t) {
    case "multiple_choice": return "객관식";
    case "fill_blank":      return "빈칸";
    case "translation_zh_ko": return "중→한";
    case "translation_ko_zh": return "한→중";
    case "tone_pick":       return "성조";
    default: return t;
  }
}
