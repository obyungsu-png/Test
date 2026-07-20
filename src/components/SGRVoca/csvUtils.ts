// ===================== CSV Utilities for SGR Voca =====================
// CSV format (flat). One or more lessons per file.
// New lesson starts at each "META,title" row.
//
// section,key,value1,value2,value3,value4,value5,value6
//
// META      → key = title|unitNumber|passageTitle|subject|category
// WORD      → value1 = word, value2 = pronunciation, value3 = partOfSpeech,
//             value4 = definition(영영), value5 = example, value6 = imageUrl(선택)
// DEF_Q     → value1 = prompt(정의), value2 = options (| 로 구분), value3 = answer_index (0-based)
// ANT_Q     → value1 = prompt(단어), value2 = options (| 로 구분), value3 = answer_index (0-based)
// FILL      → value1 = sentence (__밑줄__ 표시), value2 = hint(예: __r__t_), value3 = answer
// PASSAGE   → value1 = content (**bold** 지원, 문단은 \\n 으로 구분)
// PASSAGE_Q → value1 = question, value2 = options (| 구분, 비우면 단답형),
//             value3 = answer (MCQ: 인덱스 / 단답형: 텍스트)

import type {
  SGRVocaLesson, VocaWord, VocaMcq, VocaFillBlank, VocaPassageQuestion,
} from "./types";
import { uid } from "./types";

// ─── Basic CSV parsing ─────────────────────────────
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

// ─── Parse CSV → one SGRVocaLesson ─────────────────
export function parseCsvToVocaLesson(csv: string): SGRVocaLesson {
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) throw new Error("빈 CSV 파일입니다.");

  const first = parseCsvLine(lines[0]);
  const startIdx = first[0]?.toLowerCase() === "section" ? 1 : 0;

  const lesson: SGRVocaLesson = {
    id: uid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    unitNumber: "01",
    title: "Imported Voca Lesson",
    passageTitle: "",
    words: [],
    definitionQuestions: [],
    antonymQuestions: [],
    fillBlanks: [],
    passage: { title: "", content: "", questions: [] },
    subject: "영어",
    category: "",
  };

  for (let i = startIdx; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const [section, , v1, v2, v3, v4, v5, v6] = cols;
    if (!section) continue;
    const s = section.trim().toUpperCase();
    const key = (cols[1] || "").trim();

    if (s === "META") {
      switch (key) {
        case "title": lesson.title = v1 || lesson.title; break;
        case "unitNumber": lesson.unitNumber = v1 || lesson.unitNumber; break;
        case "passageTitle": lesson.passageTitle = v1 || ""; break;
        case "subject": lesson.subject = v1 || "영어"; break;
        case "category": lesson.category = v1 || ""; break;
      }
    } else if (s === "WORD") {
      const w: VocaWord = {
        id: uid(),
        word: v1 || "",
        pronunciation: v2 || "",
        partOfSpeech: v3 || "",
        definition: v4 || "",
        example: v5 || "",
        imageUrl: v6 || "",
      };
      if (w.word) lesson.words.push(w);
    } else if (s === "DEF_Q") {
      const q: VocaMcq = {
        id: uid(),
        prompt: v1 || "",
        options: (v2 || "").split("|").map(o => o.trim()).filter(Boolean),
        answer: Math.max(0, parseInt(v3 || "0", 10) || 0),
      };
      if (q.prompt && q.options.length > 0) lesson.definitionQuestions.push(q);
    } else if (s === "ANT_Q") {
      const q: VocaMcq = {
        id: uid(),
        prompt: v1 || "",
        options: (v2 || "").split("|").map(o => o.trim()).filter(Boolean),
        answer: Math.max(0, parseInt(v3 || "0", 10) || 0),
      };
      if (q.prompt && q.options.length > 0) lesson.antonymQuestions.push(q);
    } else if (s === "FILL") {
      const f: VocaFillBlank = {
        id: uid(),
        sentence: v1 || "",
        hint: v2 || "",
        answer: v3 || "",
      };
      if (f.sentence) lesson.fillBlanks.push(f);
    } else if (s === "PASSAGE") {
      lesson.passage.content = (v1 || "").replace(/\\n/g, "\n");
      if (!lesson.passage.title) lesson.passage.title = lesson.passageTitle;
    } else if (s === "PASSAGE_TITLE") {
      lesson.passage.title = v1 || "";
    } else if (s === "PASSAGE_Q") {
      const opts = (v2 || "").split("|").map(o => o.trim()).filter(Boolean);
      const q: VocaPassageQuestion = {
        id: uid(),
        question: v1 || "",
        options: opts,
        answer: opts.length > 0 ? (Math.max(0, parseInt(v3 || "0", 10) || 0)) : (v3 || ""),
      };
      if (q.question) lesson.passage.questions.push(q);
    }
  }

  if (!lesson.passage.title) lesson.passage.title = lesson.passageTitle;
  return lesson;
}

// ─── Parse CSV → multiple lessons ──────────────────
export function parseCsvToVocaLessons(csv: string): SGRVocaLesson[] {
  const lines = csv.split(/\r?\n/);
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
    return [parseCsvToVocaLesson(csv)];
  }

  const headerRow =
    parseCsvLine(lines[0])[0]?.toLowerCase() === "section" ? lines[0] : null;

  const lessons: SGRVocaLesson[] = [];
  for (let i = 0; i < lessonStarts.length; i++) {
    const start = lessonStarts[i];
    const end = i + 1 < lessonStarts.length ? lessonStarts[i + 1] : lines.length;
    const chunkLines = (headerRow ? [headerRow] : []).concat(lines.slice(start, end));
    const chunk = chunkLines.join("\n");
    try {
      lessons.push(parseCsvToVocaLesson(chunk));
    } catch (err) {
      console.error(`레슨 ${i + 1} 파싱 실패:`, err);
    }
  }
  return lessons;
}

// ─── Export one lesson → CSV ───────────────────────
export function vocaLessonToCsv(lesson: SGRVocaLesson): string {
  const rows: string[] = ["section,key,value1,value2,value3,value4,value5,value6"];

  const meta = (k: string, v: string) => rows.push(["META", k, csvEscape(v)].join(","));
  meta("title", lesson.title);
  meta("unitNumber", lesson.unitNumber);
  meta("passageTitle", lesson.passageTitle);
  meta("subject", lesson.subject);
  meta("category", lesson.category || "");

  lesson.words.forEach(w => {
    rows.push(["WORD", "", csvEscape(w.word), csvEscape(w.pronunciation), csvEscape(w.partOfSpeech), csvEscape(w.definition), csvEscape(w.example), csvEscape(w.imageUrl || "")].join(","));
  });
  lesson.definitionQuestions.forEach(q => {
    rows.push(["DEF_Q", "", csvEscape(q.prompt), csvEscape(q.options.join("|")), String(q.answer)].join(","));
  });
  lesson.antonymQuestions.forEach(q => {
    rows.push(["ANT_Q", "", csvEscape(q.prompt), csvEscape(q.options.join("|")), String(q.answer)].join(","));
  });
  lesson.fillBlanks.forEach(f => {
    rows.push(["FILL", "", csvEscape(f.sentence), csvEscape(f.hint), csvEscape(f.answer)].join(","));
  });

  if (lesson.passage.title) {
    rows.push(["PASSAGE_TITLE", "", csvEscape(lesson.passage.title)].join(","));
  }
  if (lesson.passage.content) {
    rows.push(["PASSAGE", "", csvEscape(lesson.passage.content)].join(","));
  }
  lesson.passage.questions.forEach(q => {
    rows.push(["PASSAGE_Q", "", csvEscape(q.question), csvEscape(q.options.join("|")), csvEscape(String(q.answer))].join(","));
  });

  return rows.join("\n");
}

// ─── CSV template ──────────────────────────────────
export function getVocaCsvTemplate(): string {
  return [
    "section,key,value1,value2,value3,value4,value5,value6",
    "META,title,Unit 18 Word List",
    "META,unitNumber,18",
    "META,passageTitle,Eat Healthy!",
    "META,subject,영어",
    "META,category,",
    "WORD,,always,ɔ:lwéiz,adv.,Always means that something happens all the time.,They always brush their teeth in the morning.,",
    "WORD,,water,wɔ́:tər,n.,Water is a clear liquid that people need to survive.,Drink eight cups of water every day.,",
    "WORD,,bread,bred,n.,Bread is a food made from flour and water.,You need two pieces of bread to make a sandwich.,",
    "WORD,,delicious,dilíʃəs,adj.,If a food is delicious it is tasty.,I loved the delicious fried chicken I ate for dinner!,",
    'DEF_Q,,a clear liquid,water|orange juice|coffee|milkshake,0',
    'DEF_Q,,a place to order food and eat it,museum|restaurant|clothing store|swimming pool,1',
    'ANT_Q,,disgusting,exciting|soft|delicious|simple,2',
    'ANT_Q,,never,always|sometimes|rarely|maybe,0',
    'FILL,,They grow __orange vegetables__ in their garden.,__r__t_,carrots',
    'FILL,,Do you like white or wheat __food made from flour and water__?,__e__,bread',
    'PASSAGE_TITLE,,Eat Healthy!',
    'PASSAGE,,"It is important to **eat** healthy **food**. There are five main healthy food groups.\\nMany different kinds of food are necessary for a balanced **diet**."',
    'PASSAGE_Q,,What are the five main healthy food groups mentioned in this story?,Candy fruit grains protein vegetables|Cake fruit grains protein vegetables|Chicken dairy fruit grains vegetables|Dairy fruit grains protein vegetables,3',
    'PASSAGE_Q,,Which fruit contains a lot of vitamin C?,Apples|Bananas|Cherries|Oranges,3',
    'PASSAGE_Q,,What are five healthy foods you can eat that are mentioned in the passage?,,grains fruits vegetables protein dairy',
  ].join("\n");
}
