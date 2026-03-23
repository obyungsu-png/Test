// 단어 시험지 다운로드 헬퍼 함수들

interface Word {
  english: string;
  korean: string;
  synonyms?: string;
  definition?: string;
}

interface TestInfo {
  testDate?: string;
  testName?: string;
  institutionName?: string;
}

type ExamDirection = 'engToKor' | 'korToEng' | 'engToDef';

// 시험지 HTML 생성 (이미지 5 형태 - 깔끔한 2단 레이아웃)
function generateTestSheetHTML(
  selectedWords: Word[],
  selectedExam: string,
  dayRange: string,
  direction: ExamDirection = 'engToKor',
  testInfo: TestInfo = {}
): string {
  const WORDS_PER_COLUMN = 30;
  const WORDS_PER_PAGE = WORDS_PER_COLUMN * 2;
  const totalPages = Math.ceil(selectedWords.length / WORDS_PER_PAGE);
  const date = testInfo.testDate 
    ? new Date(testInfo.testDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const totalCount = selectedWords.length;
  const displayTitle = testInfo.testName || `${selectedExam} ${dayRange}`;
  const institutionLine = testInfo.institutionName ? `<div style="font-size:10pt;color:#555;font-weight:500;">${testInfo.institutionName}</div>` : '';

  const directionText = direction === 'engToKor' 
    ? '왼쪽 영어 단어에 어울리는 한글 뜻을 작성해보세요.'
    : direction === 'korToEng'
    ? '왼쪽 한글 뜻에 해당하는 영어 단어를 작성해보세요.'
    : '왼쪽 영어 정의에 해당하는 영어 단어를 작성해보세요.';

  let pagesHTML = '';

  for (let page = 0; page < totalPages; page++) {
    const pageStart = page * WORDS_PER_PAGE;
    const pageWords = selectedWords.slice(pageStart, pageStart + WORDS_PER_PAGE);
    const halfCount = Math.ceil(pageWords.length / 2);
    const leftWords = pageWords.slice(0, halfCount);
    const rightWords = pageWords.slice(halfCount);

    let leftRows = '';
    leftWords.forEach((word, i) => {
      const num = pageStart + i + 1;
      const question = direction === 'engToKor' ? word.english 
        : direction === 'korToEng' ? word.korean 
        : (word.definition || word.english);
      leftRows += `
        <tr>
          <td style="padding:8px 12px;font-size:11pt;border-bottom:1px solid #e5e7eb;width:36px;text-align:right;color:#888;font-weight:500;">${num}</td>
          <td style="padding:8px 12px;font-size:11pt;border-bottom:1px solid #e5e7eb;font-weight:bold;color:#1a1a1a;">${question}</td>
          <td style="padding:8px 12px;font-size:11pt;border-bottom:1px solid #e5e7eb;width:160px;"></td>
        </tr>`;
    });

    let rightRows = '';
    rightWords.forEach((word, i) => {
      const num = pageStart + halfCount + i + 1;
      const question = direction === 'engToKor' ? word.english 
        : direction === 'korToEng' ? word.korean 
        : (word.definition || word.english);
      rightRows += `
        <tr>
          <td style="padding:8px 12px;font-size:11pt;border-bottom:1px solid #e5e7eb;width:36px;text-align:right;color:#888;font-weight:500;">${num}</td>
          <td style="padding:8px 12px;font-size:11pt;border-bottom:1px solid #e5e7eb;font-weight:bold;color:#1a1a1a;">${question}</td>
          <td style="padding:8px 12px;font-size:11pt;border-bottom:1px solid #e5e7eb;width:160px;"></td>
        </tr>`;
    });

    const pageBreak = page < totalPages - 1 ? 'page-break-after:always;' : '';

    pagesHTML += `
      <div style="padding:30px 40px;${pageBreak}">
        <!-- 헤더 -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
          <div>
            <div style="font-size:10pt;color:#888;">${date}</div>
            ${institutionLine}
          </div>
          <div style="background:#00bcd4;color:white;padding:4px 16px;border-radius:4px;font-size:10pt;font-weight:bold;letter-spacing:1px;">TEST</div>
        </div>

        <!-- 시험지 제목 -->
        ${testInfo.testName ? `<div style="text-align:center;margin-bottom:12px;font-size:14pt;font-weight:bold;color:#00838f;">${testInfo.testName}</div>` : ''}

        <!-- 이름/점수 -->
        <div style="margin-bottom:16px;">
          <table style="border-collapse:collapse;">
            <tr>
              <td style="border:1px solid #ccc;padding:6px 16px;font-size:10pt;width:60px;">이름</td>
              <td style="border:1px solid #ccc;padding:6px 16px;font-size:10pt;width:200px;"></td>
            </tr>
            <tr>
              <td style="border:1px solid #ccc;padding:6px 16px;font-size:10pt;">맞은 개수</td>
              <td style="border:1px solid #ccc;padding:6px 16px;font-size:10pt;">　　　　/ ${totalCount}</td>
            </tr>
          </table>
        </div>

        <!-- 지시문 바 -->
        <div style="display:flex;align-items:stretch;margin-bottom:20px;">
          <div style="width:5px;background:#00bcd4;border-radius:3px;"></div>
          <div style="flex:1;background:#f0fdf4;padding:10px 16px;font-size:11pt;color:#00838f;font-weight:500;border-radius:0 6px 6px 0;">
            (1~${totalCount}) ※ ${directionText}
          </div>
        </div>

        <!-- 2단 테이블 -->
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:48%;vertical-align:top;">
              <table style="width:100%;border-collapse:collapse;">
                ${leftRows}
              </table>
            </td>
            <td style="width:4%;"></td>
            <td style="width:48%;vertical-align:top;">
              <table style="width:100%;border-collapse:collapse;">
                ${rightRows}
              </table>
            </td>
          </tr>
        </table>
      </div>`;
  }

  return pagesHTML;
}

// 답안지 HTML 생성 (이미지 6 형태)
function generateAnswerSheetHTML(
  selectedWords: Word[],
  selectedExam: string,
  dayRange: string,
  direction: ExamDirection = 'engToKor'
): string {
  const WORDS_PER_COLUMN = 30;
  const WORDS_PER_PAGE = WORDS_PER_COLUMN * 2;
  const totalPages = Math.ceil(selectedWords.length / WORDS_PER_PAGE);
  const date = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const totalCount = selectedWords.length;

  let pagesHTML = '';

  for (let page = 0; page < totalPages; page++) {
    const pageStart = page * WORDS_PER_PAGE;
    const pageWords = selectedWords.slice(pageStart, pageStart + WORDS_PER_PAGE);
    const halfCount = Math.ceil(pageWords.length / 2);
    const leftWords = pageWords.slice(0, halfCount);
    const rightWords = pageWords.slice(halfCount);

    let leftRows = '';
    leftWords.forEach((word, i) => {
      const num = pageStart + i + 1;
      const question = direction === 'engToKor' ? word.english 
        : direction === 'korToEng' ? word.korean 
        : (word.definition || word.english);
      const answer = direction === 'engToKor' ? word.korean 
        : direction === 'korToEng' ? word.english 
        : word.english;
      leftRows += `
        <tr>
          <td style="padding:8px 12px;font-size:11pt;border-bottom:1px solid #fed7aa;width:36px;text-align:right;color:#888;font-weight:500;">${num}</td>
          <td style="padding:8px 12px;font-size:11pt;border-bottom:1px solid #fed7aa;font-weight:bold;color:#1a1a1a;">${question}</td>
          <td style="padding:8px 12px;font-size:11pt;border-bottom:1px solid #fed7aa;color:#ea580c;font-weight:500;">${answer}</td>
        </tr>`;
    });

    let rightRows = '';
    rightWords.forEach((word, i) => {
      const num = pageStart + halfCount + i + 1;
      const question = direction === 'engToKor' ? word.english 
        : direction === 'korToEng' ? word.korean 
        : (word.definition || word.english);
      const answer = direction === 'engToKor' ? word.korean 
        : direction === 'korToEng' ? word.english 
        : word.english;
      rightRows += `
        <tr>
          <td style="padding:8px 12px;font-size:11pt;border-bottom:1px solid #fed7aa;width:36px;text-align:right;color:#888;font-weight:500;">${num}</td>
          <td style="padding:8px 12px;font-size:11pt;border-bottom:1px solid #fed7aa;font-weight:bold;color:#1a1a1a;">${question}</td>
          <td style="padding:8px 12px;font-size:11pt;border-bottom:1px solid #fed7aa;color:#ea580c;font-weight:500;">${answer}</td>
        </tr>`;
    });

    // 첫 페이지는 항상 새 페이지에서 시작 (시험지와 답안지 분리)
    const pageBreakBefore = page === 0 ? 'page-break-before:always;' : '';
    const pageBreakAfter = page < totalPages - 1 ? 'page-break-after:always;' : '';

    pagesHTML += `
      <div style="padding:30px 40px;${pageBreakBefore}${pageBreakAfter}">
        <!-- 헤더 -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
          <div style="font-size:10pt;color:#888;">${date}</div>
          <div style="background:#ea580c;color:white;padding:4px 12px;border-radius:4px;font-size:9pt;font-weight:bold;letter-spacing:1px;">ANSWER KEY</div>
        </div>

        <!-- 지시문 바 -->
        <div style="display:flex;align-items:stretch;margin-bottom:20px;">
          <div style="flex:1;background:#fff7ed;padding:10px 16px;font-size:11pt;color:#ea580c;font-weight:500;text-align:center;border-radius:6px;border:1px solid #fed7aa;">
            (1~${totalCount}) ※ 답안지 — 정답 확인용
          </div>
        </div>

        <!-- 2단 테이블 -->
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:48%;vertical-align:top;">
              <table style="width:100%;border-collapse:collapse;">
                ${leftRows}
              </table>
            </td>
            <td style="width:4%;"></td>
            <td style="width:48%;vertical-align:top;">
              <table style="width:100%;border-collapse:collapse;">
                ${rightRows}
              </table>
            </td>
          </tr>
        </table>
      </div>`;
  }

  return pagesHTML;
}

// 전체 HTML 문서 래퍼
function wrapInHTMLDoc(bodyContent: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {
    size: A4;
    margin: 0;
  }
  body {
    font-family: 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif;
    margin: 0;
    padding: 0;
    color: #333;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  table { border-collapse: collapse; }
  td { vertical-align: top; }
</style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

// ===== PDF 다운로드 (시험지만) =====
export const downloadTestSheetPDF = (
  selectedWords: Word[],
  selectedExam: string,
  dayRange: string,
  direction: ExamDirection = 'engToKor',
  testInfo: TestInfo = {}
) => {
  const testSheet = generateTestSheetHTML(selectedWords, selectedExam, dayRange, direction, testInfo);
  const fullHTML = wrapInHTMLDoc(testSheet);
  openPrintWindow(fullHTML, `시험지_${selectedExam}_${dayRange}`);
};

// ===== PDF 다운로드 (답안지만) =====
export const downloadAnswerSheetPDF = (
  selectedWords: Word[],
  selectedExam: string,
  dayRange: string,
  direction: ExamDirection = 'engToKor'
) => {
  const answerSheet = generateAnswerSheetHTML(selectedWords, selectedExam, dayRange, direction);
  const fullHTML = wrapInHTMLDoc(answerSheet);
  openPrintWindow(fullHTML, `답안지_${selectedExam}_${dayRange}`);
};

// ===== PDF 다운로드 (시험지+답안지) =====
export const downloadHackersVocaPDF = (
  selectedWords: Word[],
  selectedExam: string,
  dayRange: string,
  direction: ExamDirection = 'engToKor',
  testInfo: TestInfo = {}
) => {
  const testSheet = generateTestSheetHTML(selectedWords, selectedExam, dayRange, direction, testInfo);
  const answerSheet = generateAnswerSheetHTML(selectedWords, selectedExam, dayRange, direction);
  const fullHTML = wrapInHTMLDoc(testSheet + answerSheet);
  openPrintWindow(fullHTML, `전체_${selectedExam}_${dayRange}`);
};

// ===== Word 파일 다운로드 (시험지만) =====
export const downloadTestSheetWord = (
  selectedWords: Word[],
  selectedExam: string,
  dayRange: string,
  direction: ExamDirection = 'engToKor',
  testInfo: TestInfo = {}
) => {
  const testSheet = generateTestSheetHTML(selectedWords, selectedExam, dayRange, direction, testInfo);
  downloadAsWord(testSheet, `시험지_${selectedExam}_${dayRange}`);
};

// ===== Word 파일 다운로드 (답안지만) =====
export const downloadAnswerSheetWord = (
  selectedWords: Word[],
  selectedExam: string,
  dayRange: string,
  direction: ExamDirection = 'engToKor'
) => {
  const answerSheet = generateAnswerSheetHTML(selectedWords, selectedExam, dayRange, direction);
  downloadAsWord(answerSheet, `답안지_${selectedExam}_${dayRange}`);
};

// ===== Word 파일 다운로드 (시험지+답안지) =====
export const downloadHackersVocaWord = (
  selectedWords: Word[],
  selectedExam: string,
  dayRange: string,
  direction: ExamDirection = 'engToKor',
  testInfo: TestInfo = {}
) => {
  const testSheet = generateTestSheetHTML(selectedWords, selectedExam, dayRange, direction, testInfo);
  const answerSheet = generateAnswerSheetHTML(selectedWords, selectedExam, dayRange, direction);
  downloadAsWord(testSheet + answerSheet, `전체_${selectedExam}_${dayRange}`);
};

// 인쇄 창 열기 헬퍼
function openPrintWindow(fullHTML: string, filename: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.html`;
    link.click();
    return;
  }

  printWindow.document.write(fullHTML);
  printWindow.document.close();
  
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };
}

// Word 다운로드 헬퍼
function downloadAsWord(bodyContent: string, filename: string) {
  const wordHTML = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<style>
  @page {
    size: A4;
    margin: 1.5cm 1.5cm 1.5cm 1.5cm;
  }
  body {
    font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
    margin: 0;
    padding: 0;
    color: #333;
  }
  table { border-collapse: collapse; }
  td { vertical-align: top; }
</style>
</head>
<body>
${bodyContent}
</body>
</html>`;

  const blob = new Blob(['\ufeff' + wordHTML], { type: 'application/msword;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.doc`;
  link.click();
}

// =====================================================================
//  교과서 뽀개기 — 한국학교 시험지 형식 다운로드
// =====================================================================

interface MasteryProblem {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'sentence_insert' | 'grammar_fix' | 'content_match';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  relatedSentenceId?: number;
}

interface MasterySentence {
  id: number;
  english: string;
  korean: string;
  chunks: string[];
  grammarPoint?: string;
  importance: string;
  paragraphId: number;
}

interface MasteryVocaItem {
  id: string;
  word: string;
  meaning: string;
  pos: string;
  example: string;
  exampleKo: string;
  synonym?: string;
  antonym?: string;
}

interface MasteryParagraph {
  id: number;
  topic: string;
  structure: string;
}

interface MasteryLesson {
  id: string;
  title: string;
  subject: string;
  category: string;
  vocabulary: MasteryVocaItem[];
  sentences: MasterySentence[];
  problems: MasteryProblem[];
  paragraphs?: MasteryParagraph[];
}

function generateKoreanExamHTML(lesson: MasteryLesson): string {
  const date = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const totalProblems = lesson.problems.length;
  const vocaCount = Math.min(lesson.vocabulary.length, 10);
  
  // Count blank fill sentences
  const blankSentences = lesson.sentences.filter(s => /[a-zA-Z]/.test(s.english));
  const blankCount = Math.min(blankSentences.length, 5); // max 5 blank fill questions
  
  const totalQuestions = totalProblems + vocaCount + blankCount;
  const pointPerQ = totalQuestions > 0 ? Math.floor(100 / totalQuestions) : 0;
  const remainder = totalQuestions > 0 ? 100 - pointPerQ * totalQuestions : 0;

  // ─── 어휘 문제 (2단) ───
  let vocaHTML = '';
  if (vocaCount > 0) {
    const vocaWords = lesson.vocabulary.slice(0, vocaCount);
    const half = Math.ceil(vocaCount / 2);
    vocaHTML = `
      <div style="margin-bottom:28px;">
        <div style="background:#e0f7fa;padding:10px 16px;border-radius:6px;margin-bottom:14px;font-size:11pt;font-weight:bold;color:#00695c;">
          [어휘] 다음 단어의 뜻을 쓰시오. (각 ${pointPerQ}점)
        </div>
        <table style="width:100%;border-collapse:collapse;"><tr>
          <td style="width:48%;vertical-align:top;"><table style="width:100%;border-collapse:collapse;">
            ${vocaWords.slice(0, half).map((v, i) => `<tr>
              <td style="padding:10px 8px;border-bottom:1px solid #e0e0e0;width:30px;text-align:right;color:#888;font-weight:600;font-size:10.5pt;">${i + 1}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #e0e0e0;font-weight:bold;font-size:11pt;color:#1a1a1a;">${v.word} <span style="color:#999;font-weight:normal;font-size:9pt;">(${v.pos})</span></td>
              <td style="padding:10px 8px;border-bottom:1px dashed #bbb;width:140px;"></td>
            </tr>`).join('')}
          </table></td>
          <td style="width:4%;"></td>
          <td style="width:48%;vertical-align:top;"><table style="width:100%;border-collapse:collapse;">
            ${vocaWords.slice(half).map((v, i) => `<tr>
              <td style="padding:10px 8px;border-bottom:1px solid #e0e0e0;width:30px;text-align:right;color:#888;font-weight:600;font-size:10.5pt;">${half + i + 1}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #e0e0e0;font-weight:bold;font-size:11pt;color:#1a1a1a;">${v.word} <span style="color:#999;font-weight:normal;font-size:9pt;">(${v.pos})</span></td>
              <td style="padding:10px 8px;border-bottom:1px dashed #bbb;width:140px;"></td>
            </tr>`).join('')}
          </table></td>
        </tr></table>
      </div>`;
  }

  // ─── 본문(지문) 박스 ───
  let passageHTML = '';
  if (lesson.sentences.length > 0) {
    const passageText = (lesson.paragraphs && lesson.paragraphs.length > 0)
      ? lesson.paragraphs.map(p => {
          const pSentences = lesson.sentences.filter(s => s.paragraphId === p.id);
          return pSentences.map(s => s.english).join(' ');
        }).join('<br><br>')
      : lesson.sentences.map(s => s.english).join(' ');

    passageHTML = `
      <div style="margin-bottom:20px;border:1.5px solid #b0bec5;border-radius:8px;overflow:hidden;page-break-inside:avoid;">
        <div style="background:#eceff1;padding:8px 14px;font-size:9.5pt;font-weight:bold;color:#455a64;border-bottom:1px solid #cfd8dc;">
          [지문] 다음 글을 읽고 물음에 답하시오.
        </div>
        <div style="padding:14px 18px;background:#fafafa;line-height:1.9;font-size:10.5pt;color:#212121;">
          ${passageText}
        </div>
      </div>`;
  }

  // ─── 본문 문제 ───
  let problemsHTML = '';
  if (totalProblems > 0) {
    const startNum = vocaCount + 1;
    problemsHTML = lesson.problems.map((p, i) => {
      const qNum = startNum + i;
      const pts = i === 0 ? pointPerQ + remainder : pointPerQ;
      const typeLabel = p.type === 'multiple_choice' ? '객관식' : p.type === 'short_answer' ? '서술형' : p.type === 'grammar_fix' ? '어법' : p.type === 'sentence_insert' ? '문장삽입' : '내용일치';
      const typeColor = p.type === 'short_answer' ? '#e65100' : '#1565c0';
      let optionsHTML = '';
      if (p.options && p.options.length > 0) {
        optionsHTML = `<div style="margin-top:8px;margin-left:24px;">${p.options.map(opt => `<div style="padding:4px 0;font-size:10.5pt;color:#333;">${opt}</div>`).join('')}</div>`;
      } else {
        optionsHTML = `<div style="margin-top:10px;margin-left:24px;border:1px solid #ccc;border-radius:4px;padding:20px;min-height:40px;background:#fafafa;"><span style="color:#bbb;font-size:9pt;">답:</span></div>`;
      }
      return `<div style="margin-bottom:22px;page-break-inside:avoid;">
        <div style="display:flex;align-items:flex-start;gap:6px;">
          <span style="font-weight:bold;font-size:11pt;color:#333;min-width:24px;">${qNum}.</span>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="font-size:8pt;background:${typeColor};color:white;padding:2px 8px;border-radius:3px;font-weight:bold;">${typeLabel}</span>
              <span style="font-size:8.5pt;color:#999;">[${pts}점]</span>
            </div>
            <div style="font-size:11pt;color:#1a1a1a;line-height:1.7;white-space:pre-line;">${p.question}</div>
            ${optionsHTML}
          </div>
        </div>
      </div>`;
    }).join('');
  }

  // ─── 빈칸 채우기 문제 ───
  let blankFillHTML = '';
  if (blankCount > 0) {
    const startNum = vocaCount + totalProblems + 1;
    blankFillHTML = blankSentences.slice(0, blankCount).map((s, i) => {
      const qNum = startNum + i;
      const pts = pointPerQ;
      const typeLabel = '빈칸 채우기';
      const typeColor = '#6366f1';
      const words = s.english.split(' ');
      const { blanks } = getBlankWordsByTypeForDownload(s.english, 'grammar');
      if (blanks.length === 0) return '';
      const displayWords = words.map((w, index) => {
        const blank = blanks.find(b => b.index === index);
        if (blank) {
          const underline = '_'.repeat(Math.max(w.replace(/[^a-zA-Z]/g, '').length * 2, 6));
          return `<span style="border-bottom:2px solid #333;padding:0 4px;color:transparent;position:relative;"><span style="position:absolute;left:0;right:0;text-align:center;color:#ccc;font-size:8pt;">(${qNum}-${blanks.indexOf(blank) + 1})</span>${underline}</span>`;
        }
        return w;
      }).join(' ');
      return `<div style="margin-bottom:22px;page-break-inside:avoid;">
        <div style="display:flex;align-items:flex-start;gap:6px;">
          <span style="font-weight:bold;font-size:11pt;color:#333;min-width:24px;">${qNum}.</span>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="font-size:8pt;background:${typeColor};color:white;padding:2px 8px;border-radius:3px;font-weight:bold;">${typeLabel}</span>
              <span style="font-size:8.5pt;color:#999;">[${pts}점]</span>
            </div>
            <div style="font-size:11pt;color:#1a1a1a;line-height:1.7;white-space:pre-line;">${displayWords}</div>
            <div style="font-size:9pt;color:#999;margin-top:4px;">${s.korean}</div>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  // ─── 시험지 전체 ───
  return `
    <div style="padding:28px 36px;">
      <table style="width:100%;border-collapse:collapse;border:2px solid #333;margin-bottom:0;">
        <tr>
          <td rowspan="3" style="width:140px;text-align:center;vertical-align:middle;border-right:2px solid #333;border-bottom:2px solid #333;padding:12px;">
            <div style="font-size:10pt;color:#666;font-weight:bold;">All My Exam</div>
            <div style="font-size:7pt;color:#999;margin-top:2px;">${date}</div>
          </td>
          <td colspan="4" style="text-align:center;padding:10px;border-bottom:1px solid #999;font-size:16pt;font-weight:bold;letter-spacing:3px;color:#00838f;">
            ${lesson.category || lesson.subject} 시험지
          </td>
          <td rowspan="3" style="width:100px;text-align:center;vertical-align:middle;border-left:2px solid #333;border-bottom:2px solid #333;padding:8px;">
            <div style="font-size:8pt;color:#888;">배점</div>
            <div style="font-size:18pt;font-weight:bold;color:#00838f;">100</div>
          </td>
        </tr>
        <tr>
          <td colspan="4" style="text-align:center;padding:6px;border-bottom:1px solid #999;font-size:12pt;font-weight:bold;color:#333;">${lesson.title}</td>
        </tr>
        <tr>
          <td style="border-bottom:2px solid #333;padding:8px 12px;font-size:10pt;border-right:1px solid #ccc;"><span style="color:#888;">학년</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
          <td style="border-bottom:2px solid #333;padding:8px 12px;font-size:10pt;border-right:1px solid #ccc;"><span style="color:#888;">반</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
          <td style="border-bottom:2px solid #333;padding:8px 12px;font-size:10pt;border-right:1px solid #ccc;"><span style="color:#888;">번호</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
          <td style="border-bottom:2px solid #333;padding:8px 12px;font-size:10pt;"><span style="color:#888;">이름</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
        </tr>
      </table>
      <div style="background:#f5f5f5;border:1px solid #ddd;border-top:none;padding:10px 16px;margin-bottom:24px;font-size:9pt;color:#555;line-height:1.6;">
        ※ 문제지와 답안의 해당란에 필 내용을 정확히 기입(표기)하시오.<br>
        ※ 총 ${totalQuestions}문항 (어휘 ${vocaCount}문항, 독해/문법 ${totalProblems}문항, 빈칸 채우기 ${blankCount}문항) | 각 문항 배점은 문제 옆에 표기되어 있습니다.
      </div>
      ${vocaHTML}
      ${passageHTML}
      ${totalProblems > 0 ? `
        <div style="background:#e3f2fd;padding:10px 16px;border-radius:6px;margin-bottom:14px;font-size:11pt;font-weight:bold;color:#0d47a1;">
          [독해 · 문법] 위 글을 읽고 물음에 답하시오.
        </div>
        ${problemsHTML}
      ` : ''}
      ${blankFillHTML}
    </div>`;
}

function generateKoreanAnswerKeyHTML(lesson: MasteryLesson): string {
  const vocaCount = Math.min(lesson.vocabulary.length, 10);
  const vocaWords = lesson.vocabulary.slice(0, vocaCount);

  let rows = '';
  vocaWords.forEach((v, i) => {
    rows += `<tr>
      <td style="padding:8px 12px;border:1px solid #ddd;text-align:center;font-weight:bold;font-size:10.5pt;width:40px;color:#555;">${i + 1}</td>
      <td style="padding:8px 12px;border:1px solid #ddd;font-size:10.5pt;color:#333;">${v.word}</td>
      <td style="padding:8px 12px;border:1px solid #ddd;font-size:10.5pt;color:#e65100;font-weight:bold;">${v.meaning}</td>
      <td style="padding:8px 12px;border:1px solid #ddd;font-size:9pt;color:#888;">어휘</td>
    </tr>`;
  });
  lesson.problems.forEach((p, i) => {
    const typeLabel = p.type === 'multiple_choice' ? '객관식' : p.type === 'short_answer' ? '서술형' : p.type === 'grammar_fix' ? '어법' : p.type === 'sentence_insert' ? '문장삽입' : '내용일치';
    rows += `<tr>
      <td style="padding:8px 12px;border:1px solid #ddd;text-align:center;font-weight:bold;font-size:10.5pt;width:40px;color:#555;">${vocaCount + i + 1}</td>
      <td style="padding:8px 12px;border:1px solid #ddd;font-size:10.5pt;color:#333;">${p.question.slice(0, 60)}${p.question.length > 60 ? '...' : ''}</td>
      <td style="padding:8px 12px;border:1px solid #ddd;font-size:10.5pt;color:#e65100;font-weight:bold;">${p.answer}</td>
      <td style="padding:8px 12px;border:1px solid #ddd;font-size:9pt;color:#888;">${typeLabel}</td>
    </tr>`;
  });

  // Add blank fill answers
  const blankSentences = lesson.sentences.filter(s => /[a-zA-Z]/.test(s.english));
  const blankCount = Math.min(blankSentences.length, 5); // max 5 blank fill questions
  if (blankCount > 0) {
    const startNum = vocaCount + lesson.problems.length + 1;
    blankSentences.slice(0, blankCount).forEach((s, i) => {
      const qNum = startNum + i;
      const { blanks } = getBlankWordsByTypeForDownload(s.english, 'grammar');
      if (blanks.length === 0) return;
      const answers = blanks.map((b, bi) => `(${qNum}-${bi + 1}) ${b.word.replace(/[.,!?"]/g, '')}`).join('&nbsp;&nbsp;&nbsp;');
      rows += `<tr>
        <td style="padding:8px 12px;border:1px solid #ddd;text-align:center;font-weight:bold;font-size:10.5pt;width:40px;color:#555;">${qNum}</td>
        <td style="padding:8px 12px;border:1px solid #ddd;font-size:10.5pt;color:#333;">${s.english.slice(0, 60)}${s.english.length > 60 ? '...' : ''}</td>
        <td style="padding:8px 12px;border:1px solid #ddd;font-size:10.5pt;color:#e65100;font-weight:bold;">${answers}</td>
        <td style="padding:8px 12px;border:1px solid #ddd;font-size:9pt;color:#888;">빈칸 채우기</td>
      </tr>`;
    });
  }

  return `
    <div style="padding:28px 36px;page-break-before:always;">
      <div style="text-align:center;margin-bottom:20px;">
        <div style="display:inline-block;background:#e65100;color:white;padding:6px 24px;border-radius:6px;font-size:12pt;font-weight:bold;letter-spacing:2px;">정 답 지</div>
        <div style="margin-top:8px;font-size:11pt;font-weight:bold;color:#333;">${lesson.title}</div>
        <div style="font-size:9pt;color:#888;margin-top:2px;">${lesson.category || lesson.subject}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;border:2px solid #ccc;">
        <thead><tr style="background:#fff3e0;">
          <th style="padding:10px 12px;border:1px solid #ddd;font-size:10pt;color:#e65100;width:40px;">번호</th>
          <th style="padding:10px 12px;border:1px solid #ddd;font-size:10pt;color:#e65100;text-align:left;">문제</th>
          <th style="padding:10px 12px;border:1px solid #ddd;font-size:10pt;color:#e65100;width:120px;">정답</th>
          <th style="padding:10px 12px;border:1px solid #ddd;font-size:10pt;color:#e65100;width:60px;">유형</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:24px;">
        <div style="font-size:11pt;font-weight:bold;color:#333;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid #e65100;">해설</div>
        ${lesson.problems.map((p, i) => `
          <div style="margin-bottom:10px;padding:8px 12px;background:#fafafa;border-radius:6px;border-left:3px solid #e65100;">
            <span style="font-weight:bold;font-size:10pt;color:#555;">${vocaCount + i + 1}번.</span>
            <span style="font-size:10pt;color:#333;margin-left:6px;">${p.explanation}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ===== 교과서 뽀개기 시험지 PDF 다운로드 =====
export const downloadMasteryExamPDF = (lesson: MasteryLesson) => {
  const examSheet = generateKoreanExamHTML(lesson);
  const answerKey = generateKoreanAnswerKeyHTML(lesson);
  const fullHTML = wrapInHTMLDoc(examSheet + answerKey);
  openPrintWindow(fullHTML, `시험지_${lesson.title}`);
};

// ===== 교과서 뽀개기 시험지 Word 다운로드 =====
export const downloadMasteryExamWord = (lesson: MasteryLesson) => {
  const examSheet = generateKoreanExamHTML(lesson);
  const answerKey = generateKoreanAnswerKeyHTML(lesson);
  downloadAsWord(examSheet + answerKey, `시험지_${lesson.title}`);
};

// ===== 교과서 뽀개기 단어시험지 PDF =====
export const downloadMasteryVocaPDF = (lesson: MasteryLesson) => {
  const words: Word[] = lesson.vocabulary.map(v => ({ english: v.word, korean: v.meaning }));
  const testSheet = generateTestSheetHTML(words, lesson.category || lesson.subject, lesson.title, 'engToKor', {
    testName: `${lesson.title} — 단어 시험`,
    institutionName: 'All My Exam',
  });
  const answerSheet = generateAnswerSheetHTML(words, lesson.category || lesson.subject, lesson.title, 'engToKor');
  const fullHTML = wrapInHTMLDoc(testSheet + answerSheet);
  openPrintWindow(fullHTML, `단어시험지_${lesson.title}`);
};

// ===== 교과서 뽀개기 빈칸채우기 시험지 PDF =====
type BlankType = 'grammar' | 'keyword' | 'connector';

function getBlankWordsByTypeForDownload(sentence: string, type: BlankType): { blanks: { word: string; index: number }[] } {
  const words = sentence.split(' ');
  const blanks: { word: string; index: number }[] = [];

  const grammarWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'from', 'with', 'about', 'of', 'by', 'as', 'into', 'through', 'during', 'before', 'after', 'between', 'under', 'over', 'is', 'am', 'are', 'was', 'were', 'been', 'being', 'has', 'have', 'had', 'do', 'does', 'did', 'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'who', 'whom', 'whose', 'which', 'that', 'what', 'where', 'when']);
  const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'from', 'with', 'about', 'of', 'by', 'as', 'is', 'am', 'are', 'was', 'were', 'been', 'being', 'i', 'my', 'me', 'you', 'your', 'he', 'she', 'it', 'his', 'her', 'its', 'we', 'our', 'they', 'their', 'them', 'and', 'but', 'or', 'not', 'so', 'if', 'that', 'this', 'be', 'do', 'does', 'did', 'has', 'have', 'had', 'will', 'can', 'could', 'would', 'should', 'may', 'might', 'must', 'very', 'also', 'too']);
  const connectors = new Set(['although', 'though', 'however', 'but', 'and', 'or', 'so', 'because', 'since', 'therefore', 'moreover', 'furthermore', 'besides', 'nevertheless', 'nonetheless', 'meanwhile', 'instead', 'otherwise', 'thus', 'hence', 'consequently', 'especially', 'finally', 'then', 'next', 'also', 'yet', 'nor', 'while', 'whereas', 'unless', 'until', 'whether']);

  words.forEach((word, index) => {
    const clean = word.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
    if (!clean) return;
    if (type === 'grammar' && grammarWords.has(clean)) blanks.push({ word, index });
    else if (type === 'keyword' && !stopWords.has(clean) && clean.length >= 4) blanks.push({ word, index });
    else if (type === 'connector' && connectors.has(clean)) blanks.push({ word, index });
  });

  return { blanks };
}

function generateBlankWorksheetHTML(lesson: MasteryLesson): string {
  const date = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const types: { key: BlankType; label: string; icon: string }[] = [
    { key: 'grammar', label: '어법 (관사/전치사/be동사/조동사)', icon: '⚡' },
    { key: 'keyword', label: '키워드 (핵심 내용어)', icon: '◎' },
    { key: 'connector', label: '연결어 (접속사/전환어)', icon: '→' },
  ];

  let sections = '';
  for (const t of types) {
    let sentenceRows = '';
    let answerRows = '';
    let qNum = 0;

    const sentences = lesson.sentences.filter(s => {
      // Only include English sentences
      return /[a-zA-Z]/.test(s.english);
    });

    sentences.forEach((s, idx) => {
      const words = s.english.split(' ');
      const { blanks } = getBlankWordsByTypeForDownload(s.english, t.key);
      if (blanks.length === 0) return;
      qNum++;

      const displayWords = words.map((w, i) => {
        const blank = blanks.find(b => b.index === i);
        if (blank) {
          const underline = '_'.repeat(Math.max(w.replace(/[^a-zA-Z]/g, '').length * 2, 6));
          return `<span style="border-bottom:2px solid #333;padding:0 4px;color:transparent;position:relative;"><span style="position:absolute;left:0;right:0;text-align:center;color:#ccc;font-size:8pt;">(${qNum}-${blanks.indexOf(blank) + 1})</span>${underline}</span>`;
        }
        return w;
      }).join(' ');

      sentenceRows += `
        <div style="margin-bottom:14px;padding:10px 14px;background:#fafafa;border-radius:6px;border-left:3px solid ${t.key === 'grammar' ? '#6366f1' : t.key === 'keyword' ? '#0891b2' : '#d97706'};page-break-inside:avoid;">
          <div style="font-size:9pt;color:#888;margin-bottom:4px;">문장 ${idx + 1}</div>
          <div style="font-size:10.5pt;line-height:2;color:#333;">${displayWords}</div>
          <div style="font-size:9pt;color:#999;margin-top:4px;">${s.korean}</div>
        </div>`;

      const answers = blanks.map((b, bi) => `(${qNum}-${bi + 1}) ${b.word.replace(/[.,!?"]/g, '')}`).join('&nbsp;&nbsp;&nbsp;');
      answerRows += `<div style="font-size:9.5pt;color:#333;padding:3px 0;">${answers}</div>`;
    });

    if (qNum === 0) continue;

    sections += `
      <div style="page-break-before:${sections ? 'always' : 'auto'};padding:28px 36px;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:14pt;font-weight:bold;color:#333;">${t.icon} 빈칸 채우기 — ${t.label}</div>
          <div style="font-size:10pt;color:#888;margin-top:4px;">${lesson.title} | ${lesson.category || lesson.subject} | ${date}</div>
        </div>
        <div style="background:#f0f4ff;padding:10px 16px;border-radius:6px;margin-bottom:16px;font-size:9.5pt;color:#555;">
          ※ 빈칸에 알맞은 단어를 작성하시오. 빈칸 번호를 참고하세요.
        </div>
        ${sentenceRows}
      </div>
      <div style="page-break-before:always;padding:28px 36px;">
        <div style="text-align:center;margin-bottom:16px;">
          <div style="display:inline-block;background:#e65100;color:white;padding:4px 16px;border-radius:4px;font-size:10pt;font-weight:bold;">${t.icon} 빈칸 채우기 정답 — ${t.label}</div>
        </div>
        ${answerRows}
      </div>`;
  }

  return sections;
}

export const downloadMasteryBlankPDF = (lesson: MasteryLesson) => {
  const blankSheet = generateBlankWorksheetHTML(lesson);
  const fullHTML = wrapInHTMLDoc(blankSheet);
  openPrintWindow(fullHTML, `빈칸채우기_${lesson.title}`);
};