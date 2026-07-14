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
