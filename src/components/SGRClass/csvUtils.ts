// ===================== CSV Utilities for SGR Class =====================
// Supports upload/download of lesson data via CSV
//
// CSV format (flat, one column per field). One CSV file = one lesson.
// Rows are grouped by "section":
//   section, key, value1, value2, value3, value4, value5, value6
//
// section values:
//   META          → key = title|unitNumber|subject|category|previewQuestion|passageTitle|vocabPreviewInstruction
//   PREVIEW_CARD  → value1 = caption
//   VOCAB_PREVIEW → value1 = word, value2 = meaning
//   PARAGRAPH     → value1 = content (use ** for bold), value2 = imageCaption (optional)
//   QUESTION_MC   → value1 = "main_idea"|"multiple_choice"|"vocabulary", value2 = question,
//                   value3 = option1|option2|option3(|option4), value4 = answer_index (0-based)
//   QUESTION_FILL → value1 = question (use ___ for blank), value2 = answer
//   QUESTION_COMPLETE → value1 = sentence (use ___), value2 = answer
//                       (multiple rows form one grouped question by same key)
//   QUESTION_OUTLINE  → value1 = "left"|"right", value2 = title(row1)|text, value3 = answer (optional)
//   QUESTION_TF   → value1 = statement, value2 = "T"|"F"
//   VOCAB_REVIEW_BANK → value1 = word (one per row)
//   VOCAB_REVIEW  → value1 = sentence (use ___), value2 = answer
//   DIRECT_READING → value1 = english, value2 = korean, value3 = chunks (| separated)

import type {
  SGRLesson,
  Question,
  McqQuestion,
  FillBlankQuestion,
  CompleteSentenceQuestion,
  OutlineQuestion,
  TrueFalseQuestion,
  PreviewCard,
  VocabPreviewItem,
  PassageParagraph,
  VocabReviewItem,
  DirectReadingItem,
} from "./types";
import { uid } from "./types";

// ─── Basic CSV parsing (handles quoted commas + escaped quotes) ─
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { result.push(current); current = ""; }
      else { current += ch; }
    }
  }
  result.push(current);
  return result.map(s => s.trim());
}

function csvEscape(v: string): string {
  if (v == null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// ─── Parse CSV → SGRLesson ─────────────────────────
export function parseCsvToLesson(csv: string): SGRLesson {
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) throw new Error("빈 CSV 파일입니다.");

  // Skip header row if present
  const first = parseCsvLine(lines[0]);
  const startIdx = first[0]?.toLowerCase() === "section" ? 1 : 0;

  const lesson: SGRLesson = {
    id: uid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    unitNumber: "01",
    title: "Imported Lesson",
    subject: "영어",
    category: "",
    previewQuestion: "",
    previewCards: [],
    vocabularyPreview: [],
    vocabPreviewInstruction: "Write the correct word next to its meaning.",
    passageTitle: "",
    passageParagraphs: [],
    questions: [],
    vocabReview: { wordBank: [], items: [] },
    directReading: [],
  };

  // Buffers for grouped questions
  let currentComplete: CompleteSentenceQuestion | null = null;
  let currentOutline: OutlineQuestion | null = null;
  let currentTf: TrueFalseQuestion | null = null;

  for (let i = startIdx; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const [section, key, v1, v2, v3, v4] = cols;
    if (!section) continue;
    const s = section.trim().toUpperCase();

    // reset grouped buffers when section changes
    if (s !== "QUESTION_COMPLETE" && currentComplete) {
      lesson.questions.push(currentComplete); currentComplete = null;
    }
    if (s !== "QUESTION_OUTLINE" && currentOutline) {
      lesson.questions.push(currentOutline); currentOutline = null;
    }
    if (s !== "QUESTION_TF" && currentTf) {
      lesson.questions.push(currentTf); currentTf = null;
    }

    switch (s) {
      case "META": {
        const k = (key || "").trim();
        if (k === "title") lesson.title = v1 || lesson.title;
        else if (k === "unitNumber") lesson.unitNumber = v1 || lesson.unitNumber;
        else if (k === "subject") lesson.subject = v1 || lesson.subject;
        else if (k === "category") lesson.category = v1 || "";
        else if (k === "previewQuestion") lesson.previewQuestion = v1 || "";
        else if (k === "passageTitle") lesson.passageTitle = v1 || "";
        else if (k === "vocabPreviewInstruction") lesson.vocabPreviewInstruction = v1 || lesson.vocabPreviewInstruction;
        break;
      }
      case "PREVIEW_CARD": {
        const card: PreviewCard = { id: uid(), caption: v1 || "" };
        lesson.previewCards.push(card);
        break;
      }
      case "VOCAB_PREVIEW": {
        const item: VocabPreviewItem = { id: uid(), word: v1 || "", meaning: v2 || "" };
        lesson.vocabularyPreview.push(item);
        break;
      }
      case "PARAGRAPH": {
        const p: PassageParagraph = { id: uid(), content: v1 || "", imageCaption: v2 || undefined };
        lesson.passageParagraphs.push(p);
        break;
      }
      case "QUESTION_MC": {
        const type = (v1 || "multiple_choice") as McqQuestion["type"];
        const opts = (v3 || "").split("|").map(o => o.trim()).filter(Boolean);
        const answerIdx = parseInt(v4 || "0", 10) || 0;
        const q: McqQuestion = {
          id: uid(),
          type: ["main_idea", "multiple_choice", "vocabulary"].includes(type) ? type : "multiple_choice",
          question: v2 || "",
          options: opts.length ? opts : ["", "", ""],
          answer: answerIdx,
        };
        lesson.questions.push(q);
        break;
      }
      case "QUESTION_FILL": {
        const q: FillBlankQuestion = {
          id: uid(),
          type: "fill_blank",
          question: v1 || "",
          answer: v2 || "",
        };
        lesson.questions.push(q);
        break;
      }
      case "QUESTION_COMPLETE": {
        if (!currentComplete) {
          currentComplete = {
            id: uid(),
            type: "complete_sentence",
            wordBank: [],
            sentences: [],
          };
        }
        // First column may hold "wordBank" key to add bank words
        if ((key || "").toLowerCase() === "wordbank") {
          currentComplete.wordBank = (v1 || "").split("|").map(w => w.trim()).filter(Boolean);
        } else {
          currentComplete.sentences.push({ id: uid(), text: v1 || "", answer: v2 || "" });
        }
        break;
      }
      case "QUESTION_OUTLINE": {
        if (!currentOutline) {
          currentOutline = {
            id: uid(),
            type: "outline",
            leftTitle: "",
            rightTitle: "",
            leftItems: [],
            rightItems: [],
          };
        }
        const side = (v1 || "").toLowerCase();
        if ((key || "").toLowerCase() === "title") {
          if (side === "left") currentOutline.leftTitle = v2 || "";
          else if (side === "right") currentOutline.rightTitle = v2 || "";
        } else {
          const item = { id: uid(), text: v2 || "", answer: v3 || undefined };
          if (side === "left") currentOutline.leftItems.push(item);
          else if (side === "right") currentOutline.rightItems.push(item);
        }
        break;
      }
      case "QUESTION_TF": {
        if (!currentTf) {
          currentTf = { id: uid(), type: "true_false", statements: [] };
        }
        currentTf.statements.push({
          id: uid(),
          text: v1 || "",
          answer: (v2 || "").trim().toUpperCase() === "T",
        });
        break;
      }
      case "VOCAB_REVIEW_BANK": {
        if (v1) lesson.vocabReview.wordBank.push(v1);
        break;
      }
      case "VOCAB_REVIEW": {
        const item: VocabReviewItem = { id: uid(), sentence: v1 || "", answer: v2 || "" };
        lesson.vocabReview.items.push(item);
        break;
      }
      case "DIRECT_READING": {
        const item: DirectReadingItem = {
          id: uid(),
          english: v1 || "",
          korean: v2 || "",
          chunks: (v3 || "").split("|").map(c => c.trim()).filter(Boolean),
        };
        lesson.directReading.push(item);
        break;
      }
      default:
        // ignore unknown sections silently
        break;
    }
  }

  // flush any remaining buffers
  if (currentComplete) lesson.questions.push(currentComplete);
  if (currentOutline) lesson.questions.push(currentOutline);
  if (currentTf) lesson.questions.push(currentTf);

  return lesson;
}

// ─── Serialize SGRLesson → CSV ─────────────────────
export function lessonToCsv(lesson: SGRLesson): string {
  const rows: string[][] = [];
  rows.push(["section", "key", "value1", "value2", "value3", "value4"]);

  // META
  rows.push(["META", "title", lesson.title]);
  rows.push(["META", "unitNumber", lesson.unitNumber]);
  rows.push(["META", "subject", lesson.subject]);
  rows.push(["META", "category", lesson.category || ""]);
  rows.push(["META", "previewQuestion", lesson.previewQuestion]);
  rows.push(["META", "passageTitle", lesson.passageTitle]);
  rows.push(["META", "vocabPreviewInstruction", lesson.vocabPreviewInstruction]);

  // preview cards
  lesson.previewCards.forEach(c => rows.push(["PREVIEW_CARD", "", c.caption]));
  // vocab preview
  lesson.vocabularyPreview.forEach(v => rows.push(["VOCAB_PREVIEW", "", v.word, v.meaning]));
  // paragraphs
  lesson.passageParagraphs.forEach(p =>
    rows.push(["PARAGRAPH", "", p.content, p.imageCaption || ""])
  );

  // questions
  lesson.questions.forEach(q => {
    if (q.type === "main_idea" || q.type === "multiple_choice" || q.type === "vocabulary") {
      rows.push([
        "QUESTION_MC", "",
        q.type,
        q.question,
        q.options.join("|"),
        String(q.answer),
      ]);
    } else if (q.type === "fill_blank") {
      rows.push(["QUESTION_FILL", "", q.question, q.answer]);
    } else if (q.type === "complete_sentence") {
      if (q.wordBank && q.wordBank.length > 0) {
        rows.push(["QUESTION_COMPLETE", "wordBank", q.wordBank.join("|")]);
      }
      q.sentences.forEach(s => rows.push(["QUESTION_COMPLETE", "", s.text, s.answer]));
    } else if (q.type === "outline") {
      rows.push(["QUESTION_OUTLINE", "title", "left", q.leftTitle]);
      rows.push(["QUESTION_OUTLINE", "title", "right", q.rightTitle]);
      q.leftItems.forEach(it => rows.push(["QUESTION_OUTLINE", "", "left", it.text, it.answer || ""]));
      q.rightItems.forEach(it => rows.push(["QUESTION_OUTLINE", "", "right", it.text, it.answer || ""]));
    } else if (q.type === "true_false") {
      q.statements.forEach(st => rows.push(["QUESTION_TF", "", st.text, st.answer ? "T" : "F"]));
    }
  });

  // vocab review
  lesson.vocabReview.wordBank.forEach(w => rows.push(["VOCAB_REVIEW_BANK", "", w]));
  lesson.vocabReview.items.forEach(it => rows.push(["VOCAB_REVIEW", "", it.sentence, it.answer]));

  // direct reading
  lesson.directReading.forEach(d =>
    rows.push(["DIRECT_READING", "", d.english, d.korean, d.chunks.join("|")])
  );

  return rows.map(r => r.map(csvEscape).join(",")).join("\n");
}

// ─── CSV template for download ─────────────────────
export function getCsvTemplate(): string {
  return `section,key,value1,value2,value3,value4
META,title,The U.S. Geography,,,
META,unitNumber,01,,,
META,subject,영어,,,
META,category,중등영어1-1,,,
META,previewQuestion,What are some features of the different regions in the United States?,,,
META,passageTitle,The Regions of the United States,,,
META,vocabPreviewInstruction,Write the correct word next to its meaning.,,,
PREVIEW_CARD,,New York City is a large metropolitan area with millions of people.,,,
PREVIEW_CARD,,Farms cover huge amounts of land all throughout the American Midwest.,,,
PREVIEW_CARD,,The Rocky Mountains rise high above the land in the Mountain States.,,,
VOCAB_PREVIEW,,cash crop,a crop that is grown to be sold for money,,
VOCAB_PREVIEW,,prairie,a flat area covered with tall grasses and few trees,,
VOCAB_PREVIEW,,fertile,rich; productive,,
VOCAB_PREVIEW,,cropland,land suitable for farming,,
VOCAB_PREVIEW,,diverse,varied; having many different types or variations,,
PARAGRAPH,,"The United States can be divided into five geographic regions. Each region has its own **physical environment**, such as **landforms** and climate.",,,
PARAGRAPH,,"The Southeast includes 12 states. A warm climate helps farmers grow many **cash crops**.",cash crop,,
QUESTION_MC,,main_idea,What is the passage mainly about?,Option A|Option B|Option C,2
QUESTION_MC,,multiple_choice,Tobacco and cotton are cash crops in the ___.,Northeast|Southwest|Southeast,2
QUESTION_MC,,vocabulary,What does densely mean?,partially|heavily|actively,1
QUESTION_COMPLETE,wordBank,urban|Midwest|Hawaii,,,
QUESTION_COMPLETE,,There are many large ___ areas in the Northeast.,urban,,
QUESTION_COMPLETE,,Farmers in the ___ grow corn.,Midwest,,
QUESTION_OUTLINE,title,left,American Regions,,
QUESTION_OUTLINE,title,right,American Landforms,,
QUESTION_OUTLINE,,left,___ = has 11 states,Northeast,
QUESTION_OUTLINE,,right,Coastal areas = land next to water,,
QUESTION_TF,,There are two smaller regions in the Northeast.,T,,
QUESTION_TF,,The Grand Canyon is in the Mountain States.,F,,
VOCAB_REVIEW_BANK,,physical environment,,,
VOCAB_REVIEW_BANK,,arid,,,
VOCAB_REVIEW_BANK,,stretch,,,
VOCAB_REVIEW_BANK,,landform,,,
VOCAB_REVIEW_BANK,,dominate,,,
VOCAB_REVIEW,,The ___ of a region includes its landforms and climate.,physical environment,,
VOCAB_REVIEW,,Plains and prairies are major ___ in the Midwest.,landforms,,
DIRECT_READING,,The United States can be divided into five geographic regions.,미국은 다섯 개의 지리적 지역으로 나뉠 수 있다.,The United States|can be divided|into five geographic regions,
`;
}

// ─── 다중 레슨 CSV 파싱 (대량 업로드용) ───────────────
// META,title 행이 나타날 때마다 새 레슨으로 분할
export function parseCsvToLessons(csv: string): SGRLesson[] {
  const lines = csv.split(/\r?\n/);
  // META,title 행 인덱스 찾기
  const lessonStarts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (
      cols[0]?.trim().toUpperCase() === "META" &&
      cols[1]?.trim().toLowerCase() === "title"
    ) {
      lessonStarts.push(i);
    }
  }

  if (lessonStarts.length <= 1) {
    // 단일 레슨
    return [parseCsvToLesson(csv)];
  }

  // 헤더 행이 있으면 포함
  const headerRow =
    parseCsvLine(lines[0])[0]?.toLowerCase() === "section" ? lines[0] : null;

  const lessons: SGRLesson[] = [];
  for (let i = 0; i < lessonStarts.length; i++) {
    const start = lessonStarts[i];
    const end = i + 1 < lessonStarts.length ? lessonStarts[i + 1] : lines.length;
    const chunkLines = (headerRow ? [headerRow] : []).concat(lines.slice(start, end));
    const chunk = chunkLines.join("\n");
    try {
      lessons.push(parseCsvToLesson(chunk));
    } catch (e) {
      console.error("레슨 파싱 실패:", e);
    }
  }
  return lessons;
}

// ─── 텍스트 형식 파싱 (간단한 대량 업로드용) ───────────
// 형식:
//   ===LESSON===
//   TITLE: 제목
//   UNIT: 01
//   SUBJECT: 영어
//   CATEGORY: 중등영어1-1
//   PASSAGE_TITLE: 지문 제목
//   PREVIEW_QUESTION: preview question
//
//   [VOCAB]
//   word : meaning
//   word2 : meaning2
//
//   [PASSAGE]
//   첫 번째 단락.
//
//   두 번째 단락.
//
//   [DICT]
//   English sentence | 한국어 해석
//
//   ===LESSON===
//   (다음 레슨...)
export function parseTextToLessons(text: string): SGRLesson[] {
  // ===LESSON=== 또는 --- 로 레슨 분할
  const chunks = text.split(/^===LESSON===|^---$/m).filter((c) => c.trim().length > 0);
  const lessons: SGRLesson[] = [];

  for (const chunk of chunks) {
    const lesson = parseTextChunkToLesson(chunk.trim());
    if (lesson) lessons.push(lesson);
  }

  if (lessons.length === 0) throw new Error("파싱할 레슨이 없습니다. ===LESSON=== 구분자를 확인하세요.");
  return lessons;
}

function parseTextChunkToLesson(chunk: string): SGRLesson | null {
  const lines = chunk.split(/\r?\n/);
  const lesson: SGRLesson = {
    id: uid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    unitNumber: "01",
    title: "Imported Lesson",
    subject: "영어",
    category: "",
    previewQuestion: "",
    previewCards: [],
    vocabularyPreview: [],
    vocabPreviewInstruction: "Write the correct word next to its meaning.",
    passageTitle: "",
    passageParagraphs: [],
    questions: [],
    vocabReview: { wordBank: [], items: [] },
    directReading: [],
  };

  let section: "meta" | "vocab" | "passage" | "dict" = "meta";
  let passageBuffer: string[] = [];

  const flushPassage = () => {
    // 빈 줄로 단락 분할
    const joined = passageBuffer.join("\n").trim();
    if (joined) {
      const paras = joined.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      paras.forEach((p) => {
        lesson.passageParagraphs.push({ id: uid(), content: p });
      });
    }
    passageBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    // 섹션 변경
    if (/^\[VOCAB\]/i.test(trimmed)) {
      flushPassage();
      section = "vocab";
      continue;
    }
    if (/^\[PASSAGE\]/i.test(trimmed)) {
      section = "passage";
      continue;
    }
    if (/^\[DICT\]/i.test(trimmed)) {
      flushPassage();
      section = "dict";
      continue;
    }

    if (section === "meta") {
      // KEY: value 형식
      const m = trimmed.match(/^([A-Z_]+)\s*:\s*(.*)$/);
      if (m) {
        const key = m[1].toUpperCase();
        const val = m[2];
        if (key === "TITLE") lesson.title = val;
        else if (key === "UNIT") lesson.unitNumber = val;
        else if (key === "SUBJECT") lesson.subject = val;
        else if (key === "CATEGORY") lesson.category = val;
        else if (key === "PASSAGE_TITLE") lesson.passageTitle = val;
        else if (key === "PREVIEW_QUESTION") lesson.previewQuestion = val;
        else if (key === "VOCAB_INSTRUCTION") lesson.vocabPreviewInstruction = val;
      }
      // 빈 줄이 나오면 passage 섹션으로 전환 (메타 다음에 바로 본문)
      else if (trimmed === "" && lesson.title !== "Imported Lesson") {
        // 다음 비어있지 않은 행이 [SECTION]이 아니면 passage로 간주
      }
    } else if (section === "vocab") {
      if (trimmed === "") continue;
      // word : meaning
      const parts = trimmed.split(/\s*:\s*/);
      if (parts.length >= 2) {
        const word = parts[0].trim();
        const meaning = parts.slice(1).join(":").trim();
        if (word) {
          lesson.vocabularyPreview.push({ id: uid(), word, meaning });
        }
      }
    } else if (section === "passage") {
      passageBuffer.push(line);
    } else if (section === "dict") {
      if (trimmed === "") continue;
      // english | korean
      const parts = trimmed.split(/\s*\|\s*/);
      if (parts.length >= 2) {
        const english = parts[0].trim();
        const korean = parts.slice(1).join("|").trim();
        if (english) {
          // 간단한 청크 분할
          const chunks = english
            .split(/(,\s+|\s+which\s+|\s+who\s+|\s+that\s+|\s+because\s+|\s+so\s+|\s+but\s+|\s+and\s+)/i)
            .reduce((acc: string[], p) => {
              const last = acc[acc.length - 1] || "";
              if (p.match(/,\s+|\s+(which|who|that|because|so|but|and)\s+/i)) {
                if (last) acc[acc.length - 1] = last + p;
                else acc.push(p);
              } else {
                acc.push(p);
              }
              return acc;
            }, [])
            .filter(Boolean);
          lesson.directReading.push({
            id: uid(),
            english,
            korean,
            chunks: chunks.length > 0 ? chunks : [english],
          });
        }
      }
    }
  }
  flushPassage();

  if (lesson.passageParagraphs.length === 0 && lesson.vocabularyPreview.length === 0 && lesson.title === "Imported Lesson") {
    return null;
  }
  return lesson;
}

// ─── 텍스트 형식 템플릿 ─────────────────────────────
export function getTextTemplate(): string {
  return `===LESSON===
TITLE: The U.S. Geography
UNIT: 01
SUBJECT: 영어
CATEGORY: 중등영어1-1
PASSAGE_TITLE: The Regions of the United States
PREVIEW_QUESTION: What are some features of the different regions in the United States?

[VOCAB]
cash crop : a crop that is grown to be sold for money
prairie : a flat area covered with tall grasses and few trees
fertile : rich; productive
cropland : land suitable for farming
diverse : varied; having many different types or variations

[PASSAGE]
The United States can be divided into five geographic regions. Each region has its own **physical environment**, such as **landforms** and climate. These features set each region apart from the other ones.

The Northeast region includes 11 states and the nation's capital, Washington, D.C. The Northeast is often divided into two subregions: New England and the Middle Atlantic States.

The Southeast includes 12 states. A warm climate and a long growing season in the Southeast help farmers grow many different kinds of **cash crops**.

[DICT]
The United States can be divided into five geographic regions. | 미국은 다섯 개의 지리적 지역으로 나뉠 수 있다.
The Northeast region includes 11 states and the nation's capital. | 북동부 지역은 11개 주와 국가 수도를 포함한다.

===LESSON===
TITLE: Sample Lesson 2
UNIT: 02
SUBJECT: 영어
CATEGORY: 중등영어1-1
PASSAGE_TITLE: Sample Passage

[PASSAGE]
This is a second lesson. You can add multiple lessons in one text file.
`;
}
