// SGR HSK CSV Utilities
// 대량 업로드/다운로드용 섹션 기반 CSV 포맷
//
// 컬럼: section, key, value1, value2, value3, value4
//
// 지원 섹션:
//   META             — key: hskLevel|unitNumber|title|titlePinyin|titleKorean|category|previewQuestion|passageTitle|passageTitlePinyin|passageTitleKorean
//   PREVIEW_CARD     — value1: caption
//   VOCAB            — value1: hanzi, value2: pinyin, value3: meaning(한국어), value4: partOfSpeech
//   VOCAB_EXAMPLE    — key: 해당 VOCAB의 hanzi 또는 index(0-based)
//                       value1: 예문(한자), value2: 예문 병음, value3: 예문 한국어
//   PASSAGE          — value1: hanzi, value2: pinyin, value3: korean
//   QUESTION_MCQ     — key: 문제 텍스트, value1..value4: 보기 4개 (정답은 아래 QUESTION_ANSWER 로)
//   QUESTION_FILL    — key: 문제 텍스트, value1: 정답
//   QUESTION_TRANSZK — key: 중국어 문장,  value1: 한국어 정답
//   QUESTION_TRANSKZ — key: 한국어 문장,  value1: 중국어 정답
//   QUESTION_TONE    — key: 문제 텍스트, value1..value4: 성조 옵션, 정답은 QUESTION_ANSWER
//   QUESTION_ANSWER  — key: 마지막 QUESTION 의 answer index(0..) or 문자열
//   QUESTION_EXPLAIN — key: 해설(한국어), 마지막 QUESTION 에 부착
//   DIRECT_READING   — value1: hanzi(청크는 "/"로 구분), value2: pinyin, value3: korean, value4: 문법포인트
//
// 여러 레슨을 한 파일에 넣으려면 각 레슨 시작 지점에 「LESSON_BREAK」 행을 넣는다.
//   LESSON_BREAK,,,,,
//   META,unitNumber,02,,,
//   ...

import { HSKLesson, HSKQuestion, HSKQuestionType, HSKVocabItem, uid, normalizeHSKLevel, emptyLesson } from "./types";

// ─── CSV parsing helpers ─────────────────────────
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuote = false;
      } else cur += ch;
    } else {
      if (ch === ',') { cells.push(cur); cur = ""; }
      else if (ch === '"') inQuote = true;
      else cur += ch;
    }
  }
  cells.push(cur);
  return cells;
}

function csvEscape(v: string): string {
  if (v == null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes("\n") || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// ─── Bulk parse: 하나 이상의 레슨 반환 ──────────────
export function parseBulkCsv(text: string): HSKLesson[] {
  // 개행 정규화
  const lines = text.replace(/\r\n?/g, "\n").split("\n").filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = parseCsvLine(lines[0]).map(s => s.trim().toLowerCase());
  const hasHeader = header[0] === "section";
  const start = hasHeader ? 1 : 0;

  const blocks: string[][][] = [];
  let cur: string[][] = [];
  for (let i = start; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const section = (cells[0] || "").trim().toUpperCase();
    if (section === "LESSON_BREAK") {
      if (cur.length) { blocks.push(cur); cur = []; }
      continue;
    }
    cur.push(cells);
  }
  if (cur.length) blocks.push(cur);

  return blocks.map(rows => rowsToLesson(rows));
}

function rowsToLesson(rows: string[][]): HSKLesson {
  const l: HSKLesson = emptyLesson();
  l.passageParagraphs = []; // reset default para
  l.vocab = [];
  l.questions = [];
  l.directReading = [];
  l.previewCards = [];
  l.updatedAt = Date.now();

  let lastQuestion: HSKQuestion | null = null;

  for (const cells of rows) {
    const section = (cells[0] || "").trim().toUpperCase();
    const key = (cells[1] || "").trim();
    const v1 = (cells[2] || "").trim();
    const v2 = (cells[3] || "").trim();
    const v3 = (cells[4] || "").trim();
    const v4 = (cells[5] || "").trim();

    switch (section) {
      case "META": {
        switch (key) {
          case "hskLevel":        l.hskLevel = normalizeHSKLevel(v1); break;
          case "unitNumber":      l.unitNumber = v1; break;
          case "title":           l.title = v1; break;
          case "titlePinyin":     l.titlePinyin = v1; break;
          case "titleKorean":     l.titleKorean = v1; break;
          case "category":        l.category = v1; break;
          case "previewQuestion": l.previewQuestion = v1; break;
          case "passageTitle":    l.passageTitle = v1; break;
          case "passageTitlePinyin": l.passageTitlePinyin = v1; break;
          case "passageTitleKorean": l.passageTitleKorean = v1; break;
        }
        break;
      }
      case "PREVIEW_CARD": {
        if (v1) l.previewCards.push({ id: uid(), caption: v1 });
        break;
      }
      case "VOCAB": {
        const item: HSKVocabItem = {
          id: uid(),
          hanzi: v1,
          pinyin: v2,
          meaning: v3,
          partOfSpeech: v4 || undefined,
        };
        l.vocab.push(item);
        break;
      }
      case "VOCAB_EXAMPLE": {
        // key: 해당 vocab의 hanzi 또는 index
        let target: HSKVocabItem | undefined;
        if (/^\d+$/.test(key)) {
          target = l.vocab[Number(key)];
        } else {
          target = l.vocab.find(v => v.hanzi === key);
        }
        if (target) {
          target.example = v1;
          target.examplePinyin = v2;
          target.exampleKorean = v3;
        }
        break;
      }
      case "PASSAGE": {
        l.passageParagraphs.push({ id: uid(), hanzi: v1, pinyin: v2, korean: v3 });
        break;
      }
      case "QUESTION_MCQ": {
        lastQuestion = {
          id: uid(),
          type: "multiple_choice",
          question: key,
          options: [v1, v2, v3, v4].filter(x => x.length > 0),
          answer: 0,
        };
        l.questions.push(lastQuestion);
        break;
      }
      case "QUESTION_FILL": {
        lastQuestion = {
          id: uid(),
          type: "fill_blank",
          question: key,
          answer: v1,
        };
        l.questions.push(lastQuestion);
        break;
      }
      case "QUESTION_TRANSZK": {
        lastQuestion = {
          id: uid(),
          type: "translation_zh_ko",
          question: key,
          answer: v1,
        };
        l.questions.push(lastQuestion);
        break;
      }
      case "QUESTION_TRANSKZ": {
        lastQuestion = {
          id: uid(),
          type: "translation_ko_zh",
          question: key,
          answer: v1,
        };
        l.questions.push(lastQuestion);
        break;
      }
      case "QUESTION_TONE": {
        lastQuestion = {
          id: uid(),
          type: "tone_pick",
          question: key,
          options: [v1, v2, v3, v4].filter(x => x.length > 0),
          answer: 0,
        };
        l.questions.push(lastQuestion);
        break;
      }
      case "QUESTION_ANSWER": {
        if (lastQuestion) {
          if (lastQuestion.type === "multiple_choice" || lastQuestion.type === "tone_pick") {
            const n = Number(key);
            lastQuestion.answer = Number.isFinite(n) ? n : 0;
          } else {
            lastQuestion.answer = key;
          }
        }
        break;
      }
      case "QUESTION_EXPLAIN": {
        if (lastQuestion) lastQuestion.explanation = key;
        break;
      }
      case "DIRECT_READING": {
        const hanzi = v1;
        const pinyin = v2;
        const korean = v3;
        const gp = v4;
        const chunks = hanzi.split("/").map(s => s.trim()).filter(Boolean);
        l.directReading.push({
          id: uid(),
          hanzi,
          pinyin,
          korean,
          chunks: chunks.length > 1 ? chunks : undefined,
          grammarPoint: gp || undefined,
        });
        break;
      }
    }
  }

  // fallback: id 확정
  if (!l.id) l.id = uid();
  return l;
}

// ─── 파일 하나에 여러 CSV 가 있을 수 있으므로 편의 함수 제공 ─
export function parseCsvToLesson(text: string): HSKLesson | null {
  const arr = parseBulkCsv(text);
  return arr[0] || null;
}

// ─── 레슨 → CSV ────────────────────────────────────
export function lessonToCsv(l: HSKLesson): string {
  const rows: string[][] = [];
  rows.push(["section", "key", "value1", "value2", "value3", "value4"]);
  rows.push(["META", "hskLevel", l.hskLevel, "", "", ""]);
  rows.push(["META", "unitNumber", l.unitNumber, "", "", ""]);
  rows.push(["META", "title", l.title, "", "", ""]);
  if (l.titlePinyin) rows.push(["META", "titlePinyin", l.titlePinyin, "", "", ""]);
  if (l.titleKorean) rows.push(["META", "titleKorean", l.titleKorean, "", "", ""]);
  if (l.category) rows.push(["META", "category", l.category, "", "", ""]);
  if (l.previewQuestion) rows.push(["META", "previewQuestion", l.previewQuestion, "", "", ""]);
  if (l.passageTitle) rows.push(["META", "passageTitle", l.passageTitle, "", "", ""]);
  if (l.passageTitlePinyin) rows.push(["META", "passageTitlePinyin", l.passageTitlePinyin, "", "", ""]);
  if (l.passageTitleKorean) rows.push(["META", "passageTitleKorean", l.passageTitleKorean, "", "", ""]);

  for (const c of l.previewCards) rows.push(["PREVIEW_CARD", "", c.caption, "", "", ""]);

  for (const v of l.vocab) {
    rows.push(["VOCAB", "", v.hanzi, v.pinyin, v.meaning, v.partOfSpeech || ""]);
    if (v.example) rows.push(["VOCAB_EXAMPLE", v.hanzi, v.example, v.examplePinyin || "", v.exampleKorean || "", ""]);
  }

  for (const p of l.passageParagraphs) rows.push(["PASSAGE", "", p.hanzi, p.pinyin, p.korean, ""]);

  for (const q of l.questions) {
    if (q.type === "multiple_choice" || q.type === "tone_pick") {
      const sec = q.type === "multiple_choice" ? "QUESTION_MCQ" : "QUESTION_TONE";
      const [a, b, c, d] = [q.options?.[0] || "", q.options?.[1] || "", q.options?.[2] || "", q.options?.[3] || ""];
      rows.push([sec, q.question, a, b, c, d]);
      rows.push(["QUESTION_ANSWER", String(q.answer), "", "", "", ""]);
    } else if (q.type === "fill_blank") {
      rows.push(["QUESTION_FILL", q.question, String(q.answer), "", "", ""]);
    } else if (q.type === "translation_zh_ko") {
      rows.push(["QUESTION_TRANSZK", q.question, String(q.answer), "", "", ""]);
    } else if (q.type === "translation_ko_zh") {
      rows.push(["QUESTION_TRANSKZ", q.question, String(q.answer), "", "", ""]);
    }
    if (q.explanation) rows.push(["QUESTION_EXPLAIN", q.explanation, "", "", "", ""]);
  }

  for (const d of l.directReading) {
    rows.push(["DIRECT_READING", "", d.hanzi, d.pinyin, d.korean, d.grammarPoint || ""]);
  }

  return rows.map(r => r.map(csvEscape).join(",")).join("\n");
}

export function lessonsToCsv(lessons: HSKLesson[]): string {
  const parts: string[] = [];
  parts.push("section,key,value1,value2,value3,value4");
  lessons.forEach((l, i) => {
    if (i > 0) parts.push("LESSON_BREAK,,,,,");
    // 개별 CSV의 헤더는 제거
    const body = lessonToCsv(l).split("\n").slice(1).join("\n");
    parts.push(body);
  });
  return parts.join("\n");
}
