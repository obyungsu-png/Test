// 한국학교 정기고사 스타일 시험지 생성기
// 중간고사/기말고사 형태의 A4 시험지 + 답안지 자동 생성

import type { LessonData, ProblemItem, VocaItem, SentenceItem } from "../components/TextbookMastery/types";

interface ExamConfig {
  schoolName?: string;
  grade?: string;
  examType?: string; // 1학기 중간고사, 2학기 기말고사 등
  subject?: string;
  teacher?: string;
  date?: string;
  duration?: string; // 시험 시간 (예: 50분)
  includeVocaSection?: boolean;
  includeSentenceSection?: boolean;
}

// ─── 한국학교 시험지 HTML ───
function generateKoreanExamHTML(lesson: LessonData, config: ExamConfig = {}): string {
  const {
    schoolName = "All My Exam",
    grade = "",
    examType = "정기고사",
    subject = lesson.subject,
    teacher = "",
    date = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }),
    duration = "50분",
    includeVocaSection = true,
    includeSentenceSection = true,
  } = config;

  const problems = lesson.problems || [];
  const vocabulary = lesson.vocabulary || [];
  const sentences = lesson.sentences || [];

  // 문제 번호 매기기
  let qNum = 0;

  // ─── 배점 계산 ───
  const totalProblems = problems.length
    + (includeVocaSection && vocabulary.length > 0 ? 1 : 0)
    + (includeSentenceSection && sentences.length > 0 ? 1 : 0);

  const basePoints = totalProblems > 0 ? Math.floor(100 / totalProblems) : 0;
  const remainder = totalProblems > 0 ? 100 - (basePoints * totalProblems) : 0;

  function getPoints(idx: number) {
    return basePoints + (idx < remainder ? 1 : 0);
  }

  // ─── 객관식 문제 렌더링 ───
  function renderMultipleChoice(p: ProblemItem, num: number, points: number): string {
    const options = (p.options || []).map((opt, i) => {
      const circled = ["①", "②", "③", "④", "⑤"][i] || `(${i + 1})`;
      // Remove leading letter prefix like "A. ", "B. " etc.
      const cleanOpt = opt.replace(/^[A-E]\.\s*/, "");
      return `<span style="display:inline-block;margin-right:16px;margin-bottom:4px;">${circled} ${cleanOpt}</span>`;
    }).join("");

    return `
      <div style="margin-bottom:20px;">
        <div style="display:flex;gap:8px;align-items:flex-start;">
          <div style="font-weight:bold;font-size:11pt;min-width:28px;color:#1a1a1a;">${num}.</div>
          <div style="flex:1;">
            <div style="font-size:11pt;line-height:1.7;color:#1a1a1a;white-space:pre-line;margin-bottom:8px;">${p.question.replace(/^다음 중 |다음 /, "")}</div>
            <div style="padding-left:4px;font-size:10.5pt;line-height:2;color:#333;">
              ${options}
            </div>
          </div>
          <div style="font-size:8pt;color:#999;white-space:nowrap;margin-top:2px;">[${points}점]</div>
        </div>
      </div>`;
  }

  // ─── 서술형 문제 렌더링 ───
  function renderShortAnswer(p: ProblemItem, num: number, points: number): string {
    return `
      <div style="margin-bottom:24px;">
        <div style="display:flex;gap:8px;align-items:flex-start;">
          <div style="font-weight:bold;font-size:11pt;min-width:28px;color:#1a1a1a;">${num}.</div>
          <div style="flex:1;">
            <div style="font-size:11pt;line-height:1.7;color:#1a1a1a;white-space:pre-line;margin-bottom:12px;">${p.question}</div>
            <div style="border:1px solid #d1d5db;border-radius:6px;padding:12px 16px;min-height:50px;background:#fafafa;">
              <span style="font-size:9pt;color:#aaa;">답:</span>
            </div>
          </div>
          <div style="font-size:8pt;color:#999;white-space:nowrap;margin-top:2px;">[${points}점]</div>
        </div>
      </div>`;
  }

  // ─── 단어 섹션 (빈칸 채우기 형태) ───
  function renderVocaSection(vocab: VocaItem[], num: number, points: number): string {
    if (vocab.length === 0) return "";

    const halfCount = Math.ceil(vocab.length / 2);
    const leftWords = vocab.slice(0, halfCount);
    const rightWords = vocab.slice(halfCount);

    let leftRows = leftWords.map((v, i) => `
      <tr>
        <td style="padding:5px 8px;font-size:10pt;border-bottom:1px solid #e5e7eb;width:24px;text-align:right;color:#999;">${i + 1}</td>
        <td style="padding:5px 8px;font-size:10pt;border-bottom:1px solid #e5e7eb;font-weight:600;color:#1a1a1a;">${v.word}</td>
        <td style="padding:5px 8px;font-size:10pt;border-bottom:1px solid #e5e7eb;width:120px;border-bottom:1px dashed #ccc;"></td>
      </tr>`).join("");

    let rightRows = rightWords.map((v, i) => `
      <tr>
        <td style="padding:5px 8px;font-size:10pt;border-bottom:1px solid #e5e7eb;width:24px;text-align:right;color:#999;">${halfCount + i + 1}</td>
        <td style="padding:5px 8px;font-size:10pt;border-bottom:1px solid #e5e7eb;font-weight:600;color:#1a1a1a;">${v.word}</td>
        <td style="padding:5px 8px;font-size:10pt;border-bottom:1px solid #e5e7eb;width:120px;border-bottom:1px dashed #ccc;"></td>
      </tr>`).join("");

    return `
      <div style="margin-bottom:24px;">
        <div style="display:flex;gap:8px;align-items:flex-start;">
          <div style="font-weight:bold;font-size:11pt;min-width:28px;color:#1a1a1a;">${num}.</div>
          <div style="flex:1;">
            <div style="font-size:11pt;line-height:1.7;color:#1a1a1a;margin-bottom:10px;">
              다음 영어 단어의 뜻을 쓰시오. <span style="font-size:9pt;color:#666;">(각 ${vocab.length > 0 ? Math.round(points / vocab.length * 10) / 10 : 0}점)</span>
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="width:48%;vertical-align:top;">
                  <table style="width:100%;border-collapse:collapse;">${leftRows}</table>
                </td>
                <td style="width:4%;"></td>
                <td style="width:48%;vertical-align:top;">
                  <table style="width:100%;border-collapse:collapse;">${rightRows}</table>
                </td>
              </tr>
            </table>
          </div>
          <div style="font-size:8pt;color:#999;white-space:nowrap;margin-top:2px;">[${points}점]</div>
        </div>
      </div>`;
  }

  // ─── 문장 해석 섹션 ───
  function renderSentenceSection(sents: SentenceItem[], num: number, points: number): string {
    if (sents.length === 0) return "";
    const importantSents = sents.filter(s => s.importance === "high").slice(0, 5);
    if (importantSents.length === 0) return "";

    const rows = importantSents.map((s, i) => `
      <div style="margin-bottom:14px;">
        <div style="font-size:10pt;color:#1a1a1a;line-height:1.6;margin-bottom:4px;">(${i + 1}) ${s.english}</div>
        <div style="border-bottom:1px dashed #ccc;padding:8px 0;min-height:24px;font-size:10pt;color:#aaa;">해석:</div>
      </div>`).join("");

    return `
      <div style="margin-bottom:24px;">
        <div style="display:flex;gap:8px;align-items:flex-start;">
          <div style="font-weight:bold;font-size:11pt;min-width:28px;color:#1a1a1a;">${num}.</div>
          <div style="flex:1;">
            <div style="font-size:11pt;line-height:1.7;color:#1a1a1a;margin-bottom:12px;">
              다음 문장을 해석하시오. <span style="font-size:9pt;color:#666;">(각 ${importantSents.length > 0 ? Math.round(points / importantSents.length * 10) / 10 : 0}점)</span>
            </div>
            ${rows}
          </div>
          <div style="font-size:8pt;color:#999;white-space:nowrap;margin-top:2px;">[${points}점]</div>
        </div>
      </div>`;
  }

  // ─── 시험지 조립 ───
  let questionsHTML = "";
  let qIdx = 0;

  // 1) 객관식/기타 문제
  for (const p of problems) {
    qNum++;
    const pts = getPoints(qIdx++);
    if (p.type === "short_answer") {
      questionsHTML += renderShortAnswer(p, qNum, pts);
    } else {
      questionsHTML += renderMultipleChoice(p, qNum, pts);
    }
  }

  // 2) 단어 섹션
  if (includeVocaSection && vocabulary.length > 0) {
    qNum++;
    questionsHTML += renderVocaSection(vocabulary, qNum, getPoints(qIdx++));
  }

  // 3) 문장 해석 섹션
  if (includeSentenceSection && sentences.filter(s => s.importance === "high").length > 0) {
    qNum++;
    questionsHTML += renderSentenceSection(sentences, qNum, getPoints(qIdx++));
  }

  const gradeDisplay = grade || lesson.category || "";

  const examHTML = `
    <div style="padding:24px 32px;">
      <!-- ═══ 시험지 헤더 (한국학교 스타일) ═══ -->
      <table style="width:100%;border-collapse:collapse;border:2px solid #333;margin-bottom:20px;">
        <tr>
          <td rowspan="3" style="width:140px;padding:12px;text-align:center;border-right:2px solid #333;vertical-align:middle;">
            <div style="font-size:13pt;font-weight:900;color:#00838f;line-height:1.3;">${schoolName}</div>
          </td>
          <td style="padding:8px 16px;border-bottom:1px solid #ccc;border-right:1px solid #ccc;text-align:center;">
            <div style="font-size:18pt;font-weight:900;color:#1a1a1a;letter-spacing:2px;">${examType}</div>
          </td>
          <td rowspan="2" style="width:180px;padding:8px 12px;border-left:0;vertical-align:top;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="border:1px solid #aaa;padding:5px 10px;font-size:9pt;font-weight:bold;background:#f5f5f5;width:50px;">학년</td>
                <td style="border:1px solid #aaa;padding:5px 10px;font-size:9pt;">${gradeDisplay}</td>
              </tr>
              <tr>
                <td style="border:1px solid #aaa;padding:5px 10px;font-size:9pt;font-weight:bold;background:#f5f5f5;">반</td>
                <td style="border:1px solid #aaa;padding:5px 10px;font-size:9pt;"></td>
              </tr>
              <tr>
                <td style="border:1px solid #aaa;padding:5px 10px;font-size:9pt;font-weight:bold;background:#f5f5f5;">번호</td>
                <td style="border:1px solid #aaa;padding:5px 10px;font-size:9pt;"></td>
              </tr>
              <tr>
                <td style="border:1px solid #aaa;padding:5px 10px;font-size:9pt;font-weight:bold;background:#f5f5f5;">이름</td>
                <td style="border:1px solid #aaa;padding:5px 10px;font-size:9pt;"></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 16px;text-align:center;">
            <span style="font-size:11pt;font-weight:bold;color:#333;">${subject}</span>
            ${teacher ? `<span style="font-size:9pt;color:#888;margin-left:12px;">${teacher}</span>` : ""}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:6px 16px;border-top:1px solid #ccc;text-align:center;">
            <span style="font-size:9pt;color:#666;">${date}　｜　시험시간 ${duration}　｜　${lesson.title}</span>
          </td>
        </tr>
      </table>

      <!-- ═══ 유의사항 박스 ═══ -->
      <div style="border:1px solid #d1d5db;border-radius:6px;padding:10px 16px;margin-bottom:24px;background:#f8fafc;">
        <div style="font-size:9pt;font-weight:bold;color:#333;margin-bottom:4px;">※ 시험 유의사항</div>
        <div style="font-size:8.5pt;color:#666;line-height:1.6;">
          1. 답안은 반드시 검정색 볼펜으로 작성하시오.<br>
          2. 문항별 배점은 각 문항 옆에 표시되어 있습니다.<br>
          3. 총 ${qNum}문항, 100점 만점입니다.
        </div>
      </div>

      <!-- ═══ 문제 영역 ═══ -->
      ${questionsHTML}
    </div>`;

  return examHTML;
}

// ─── 답안지(정답표) HTML ───
function generateKoreanAnswerHTML(lesson: LessonData, config: ExamConfig = {}): string {
  const {
    schoolName = "All My Exam",
    examType = "정기고사",
    subject = lesson.subject,
  } = config;

  const problems = lesson.problems || [];
  const vocabulary = lesson.vocabulary || [];
  const sentences = lesson.sentences || [];
  const date = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  let rows = "";
  let num = 0;

  // 문제 정답
  for (const p of problems) {
    num++;
    const answerDisplay = p.type === "short_answer"
      ? p.answer
      : p.answer.replace(/^([A-E])$/, (_, l: string) => {
          const idx = l.charCodeAt(0) - 65;
          return ["①", "②", "③", "④", "⑤"][idx] || l;
        });

    rows += `
      <tr>
        <td style="padding:6px 12px;font-size:10pt;border:1px solid #fed7aa;width:40px;text-align:center;font-weight:bold;color:#333;">${num}</td>
        <td style="padding:6px 12px;font-size:10pt;border:1px solid #fed7aa;color:#ea580c;font-weight:bold;">${answerDisplay}</td>
        <td style="padding:6px 12px;font-size:9pt;border:1px solid #fed7aa;color:#666;line-height:1.5;">${p.explanation}</td>
      </tr>`;
  }

  // 단어 정답
  if (vocabulary.length > 0) {
    num++;
    const vocaAnswers = vocabulary.map((v, i) => `(${i + 1}) ${v.meaning}`).join("　");
    rows += `
      <tr>
        <td style="padding:6px 12px;font-size:10pt;border:1px solid #fed7aa;text-align:center;font-weight:bold;color:#333;">${num}</td>
        <td colspan="2" style="padding:6px 12px;font-size:9pt;border:1px solid #fed7aa;color:#ea580c;font-weight:500;line-height:1.8;">${vocaAnswers}</td>
      </tr>`;
  }

  // 문장 해석 정답
  const importantSents = sentences.filter(s => s.importance === "high").slice(0, 5);
  if (importantSents.length > 0) {
    num++;
    const sentAnswers = importantSents.map((s, i) => `(${i + 1}) ${s.korean}`).join("<br>");
    rows += `
      <tr>
        <td style="padding:6px 12px;font-size:10pt;border:1px solid #fed7aa;text-align:center;font-weight:bold;color:#333;">${num}</td>
        <td colspan="2" style="padding:6px 12px;font-size:9pt;border:1px solid #fed7aa;color:#ea580c;font-weight:500;line-height:1.8;">${sentAnswers}</td>
      </tr>`;
  }

  return `
    <div style="padding:24px 32px;page-break-before:always;">
      <!-- 답안지 헤더 -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div>
          <div style="font-size:14pt;font-weight:900;color:#ea580c;">${examType} 정답 및 해설</div>
          <div style="font-size:10pt;color:#888;margin-top:2px;">${schoolName} · ${subject} · ${lesson.title}</div>
        </div>
        <div style="background:#ea580c;color:white;padding:6px 16px;border-radius:4px;font-size:10pt;font-weight:bold;letter-spacing:1px;">ANSWER KEY</div>
      </div>
      <div style="font-size:9pt;color:#999;margin-bottom:16px;">${date}</div>

      <!-- 정답 테이블 -->
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#fff7ed;">
            <th style="padding:8px 12px;font-size:9pt;border:1px solid #fed7aa;width:40px;text-align:center;color:#ea580c;">번호</th>
            <th style="padding:8px 12px;font-size:9pt;border:1px solid #fed7aa;width:100px;color:#ea580c;">정답</th>
            <th style="padding:8px 12px;font-size:9pt;border:1px solid #fed7aa;color:#ea580c;">해설</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
}

// ─── 전체 HTML 문서 래퍼 ───
function wrapExamHTML(bodyContent: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>시험지</title>
<style>
  @page {
    size: A4;
    margin: 0;
  }
  body {
    font-family: 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
    margin: 0;
    padding: 0;
    color: #333;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    line-height: 1.5;
  }
  table { border-collapse: collapse; }
  td, th { vertical-align: top; }
</style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

// ═══════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════

/** 시험지+답안지 PDF(인쇄) — 즉시 실행 */
export function downloadExamPDF(lesson: LessonData, config: ExamConfig = {}) {
  const exam = generateKoreanExamHTML(lesson, config);
  const answer = generateKoreanAnswerHTML(lesson, config);
  const fullHTML = wrapExamHTML(exam + answer);

  const printWin = window.open("", "_blank");
  if (!printWin) {
    // 팝업 차단 시 HTML 파일로 다운로드
    const blob = new Blob([fullHTML], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `시험지_${lesson.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
    return;
  }
  printWin.document.write(fullHTML);
  printWin.document.close();
  printWin.onload = () => setTimeout(() => printWin.print(), 300);
}

/** 시험지만 PDF(인쇄) */
export function downloadExamOnlyPDF(lesson: LessonData, config: ExamConfig = {}) {
  const exam = generateKoreanExamHTML(lesson, config);
  const fullHTML = wrapExamHTML(exam);

  const printWin = window.open("", "_blank");
  if (!printWin) {
    const blob = new Blob([fullHTML], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `시험지_${lesson.title.replace(/\s+/g, "_")}.html`;
    a.click();
    return;
  }
  printWin.document.write(fullHTML);
  printWin.document.close();
  printWin.onload = () => setTimeout(() => printWin.print(), 300);
}

/** 답안지만 PDF(인쇄) */
export function downloadAnswerOnlyPDF(lesson: LessonData, config: ExamConfig = {}) {
  const answer = generateKoreanAnswerHTML(lesson, config);
  const fullHTML = wrapExamHTML(answer);

  const printWin = window.open("", "_blank");
  if (!printWin) {
    const blob = new Blob([fullHTML], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `답안지_${lesson.title.replace(/\s+/g, "_")}.html`;
    a.click();
    return;
  }
  printWin.document.write(fullHTML);
  printWin.document.close();
  printWin.onload = () => setTimeout(() => printWin.print(), 300);
}

/** Word 파일 다운로드 (시험지+답안지) */
export function downloadExamWord(lesson: LessonData, config: ExamConfig = {}) {
  const exam = generateKoreanExamHTML(lesson, config);
  const answer = generateKoreanAnswerHTML(lesson, config);

  const wordHTML = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 1.5cm; }
  body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; margin:0; padding:0; color:#333; }
  table { border-collapse: collapse; }
  td, th { vertical-align: top; }
</style>
</head>
<body>
${exam}
${answer}
</body>
</html>`;

  const blob = new Blob(["\ufeff" + wordHTML], { type: "application/msword;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `시험지_${lesson.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.doc`;
  a.click();
  URL.revokeObjectURL(a.href);
}
