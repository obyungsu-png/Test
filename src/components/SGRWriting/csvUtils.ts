// ===================== CSV Utilities for SGR Writing =====================
// CSV format (flat). One or more lessons per file.
// New lesson starts at each "META,title" row.
//
// section,key,value1,value2,value3,value4,value5,value6,value7
//
// META      → key = title|unitNumber|bookTitle|notice|quoteEn|quoteKr|subject|category|keyExpression|previewEn|previewKr
// WORD      → value1 = hint(첫글자), value2 = kr(뜻), value3 = ans(정답 단어)
// EXPRESSION → value1 = title, value2 = note, value3 = exampleKr, value4 = exampleEn,
//              value5 = challengeKr, value6 = challengeEn
// REVIEW    → value1 = kr(한글 문장), value2 = guide(어순 가이드), value3 = ans(영어 정답)

import type { SGRWritingLesson, WritingWord, WritingExpression, WritingReview } from "./types";
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

// ─── Parse CSV → one SGRWritingLesson ──────────────
export function parseCsvToWritingLesson(csv: string): SGRWritingLesson {
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) throw new Error("빈 CSV 파일입니다.");

  const first = parseCsvLine(lines[0]);
  const startIdx = first[0]?.toLowerCase() === "section" ? 1 : 0;

  const lesson: SGRWritingLesson = {
    id: uid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    unitNumber: "01",
    title: "Imported Writing Lesson",
    bookTitle: "",
    notice: "",
    quoteEn: "",
    quoteKr: "",
    words: [],
    keyExpression: "",
    previewEn: "",
    previewKr: "",
    expressions: [],
    reviews: [],
    subject: "영어",
    category: "",
  };

  for (let i = startIdx; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const [section, key, v1, v2, v3, v4, v5, v6] = cols;
    if (!section) continue;
    const s = section.trim().toUpperCase();

    if (s === "META") {
      const k = (key || "").trim();
      switch (k) {
        case "title": lesson.title = v1 || lesson.title; break;
        case "unitNumber": lesson.unitNumber = v1 || lesson.unitNumber; break;
        case "bookTitle": lesson.bookTitle = v1 || ""; break;
        case "notice": lesson.notice = v1 || ""; break;
        case "quoteEn": lesson.quoteEn = v1 || ""; break;
        case "quoteKr": lesson.quoteKr = v1 || ""; break;
        case "subject": lesson.subject = v1 || "영어"; break;
        case "category": lesson.category = v1 || ""; break;
        case "keyExpression": lesson.keyExpression = v1 || ""; break;
        case "previewEn": lesson.previewEn = v1 || ""; break;
        case "previewKr": lesson.previewKr = v1 || ""; break;
      }
    } else if (s === "WORD") {
      const w: WritingWord = {
        id: uid(),
        hint: key || v1 || "",
        kr: (key ? v1 : v2) || "",
        ans: (key ? v2 : v3) || "",
      };
      // key 칸이 비어있으면 v1/v2/v3 순서로 사용
      if (!key) { w.hint = v1 || ""; w.kr = v2 || ""; w.ans = v3 || ""; }
      if (w.hint || w.kr || w.ans) lesson.words.push(w);
    } else if (s === "EXPRESSION") {
      const e: WritingExpression = {
        id: uid(),
        title: v1 || "",
        note: v2 || "",
        exampleKr: v3 || "",
        exampleEn: v4 || "",
        challengeKr: v5 || "",
        challengeEn: v6 || "",
      };
      if (e.title || e.challengeKr) lesson.expressions.push(e);
    } else if (s === "REVIEW") {
      const r: WritingReview = {
        id: uid(),
        kr: v1 || "",
        guide: v2 || "",
        ans: v3 || "",
      };
      if (r.kr || r.ans) lesson.reviews.push(r);
    }
  }

  return lesson;
}

// ─── Parse CSV → multiple lessons (split by META,title) ─
export function parseCsvToWritingLessons(csv: string): SGRWritingLesson[] {
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
    return [parseCsvToWritingLesson(csv)];
  }

  const headerRow =
    parseCsvLine(lines[0])[0]?.toLowerCase() === "section" ? lines[0] : null;

  const lessons: SGRWritingLesson[] = [];
  for (let i = 0; i < lessonStarts.length; i++) {
    const start = lessonStarts[i];
    const end = i + 1 < lessonStarts.length ? lessonStarts[i + 1] : lines.length;
    const chunkLines = (headerRow ? [headerRow] : []).concat(lines.slice(start, end));
    const chunk = chunkLines.join("\n");
    try {
      lessons.push(parseCsvToWritingLesson(chunk));
    } catch (err) {
      console.error(`레슨 ${i + 1} 파싱 실패:`, err);
    }
  }
  return lessons;
}

// ─── Export one lesson → CSV ───────────────────────
export function writingLessonToCsv(lesson: SGRWritingLesson): string {
  const rows: string[] = ["section,key,value1,value2,value3,value4,value5,value6"];

  const meta = (k: string, v: string) => rows.push(["META", k, csvEscape(v)].join(","));
  meta("title", lesson.title);
  meta("unitNumber", lesson.unitNumber);
  meta("bookTitle", lesson.bookTitle);
  meta("notice", lesson.notice);
  meta("quoteEn", lesson.quoteEn);
  meta("quoteKr", lesson.quoteKr);
  meta("keyExpression", lesson.keyExpression);
  meta("previewEn", lesson.previewEn);
  meta("previewKr", lesson.previewKr);
  meta("subject", lesson.subject);
  meta("category", lesson.category || "");

  lesson.words.forEach(w => {
    rows.push(["WORD", "", csvEscape(w.hint), csvEscape(w.kr), csvEscape(w.ans)].join(","));
  });
  lesson.expressions.forEach(e => {
    rows.push(["EXPRESSION", "", csvEscape(e.title), csvEscape(e.note), csvEscape(e.exampleKr), csvEscape(e.exampleEn), csvEscape(e.challengeKr), csvEscape(e.challengeEn)].join(","));
  });
  lesson.reviews.forEach(r => {
    rows.push(["REVIEW", "", csvEscape(r.kr), csvEscape(r.guide), csvEscape(r.ans)].join(","));
  });

  return rows.join("\n");
}

// ─── CSV template download ─────────────────────────
export function getWritingCsvTemplate(): string {
  return [
    "section,key,value1,value2,value3,value4,value5,value6",
    "META,title,CHAPTER 5 | EASY WRITING",
    "META,unitNumber,05",
    "META,bookTitle,Animal Farm",
    "META,notice,공지: 스노볼의 추방과 풍차 건설 계획의 찬탈",
    'META,quoteEn,"“Snowball was set upon by nine enormous dogs and was forced to flee for his life.”"',
    "META,quoteKr,(스노볼은 아홉 마리의 거대한 개들에게 기습을 당해 목숨을 건지기 위해 달아나야만 했습니다.)",
    "META,keyExpression,be forced to [동사원형] = 어쩔 수 없이 ~해야만 하다",
    "META,previewEn,Snowball was forced to flee for his life.",
    "META,previewKr,스노볼은 목숨을 건지기 위해 어쩔 수 없이 달아나야만 했습니다.",
    "META,subject,영어",
    "META,category,중등영어1-1",
    "WORD,,e,\"말을 잘하는, 웅변조의\",eloquent",
    "WORD,,c,\"설득력 있는, 강력한\",compelling",
    "WORD,,f,\"진영, 파벌, 분파\",faction",
    "WORD,,p,\"구실, 핑계, 빌미\",pretext",
    "WORD,,e,\"추방하다, 쫓아내다\",expel",
    'EXPRESSION,,"1. side with [명사] = ~의 편을 들다","NOTE: 논쟁이나 갈등 상황에서 특정 인물을 옹호할 때 사용","[연습] 의견 대립 중에 그는 그의 오랜 동료의 편을 들었습니다.","→ During the disagreement, he sided with his long-time colleague.","[도전] 일부 동물들은 풍차 건설에 대해 스노볼의 편을 들었습니다.","Some animals sided with Snowball on the windmill construction."',
    'EXPRESSION,,"2. carry out [명사] = 실행하다 / 수행하다","NOTE: 약속된 일이나 계획을 실제로 행동에 옮길 때 사용","[연습] 그들은 아묵운 불평 없이 우리의 지시를 실행했습니다.","→ They carried out our instructions without any complaints.","[도전] 나폴옹은 스노볼의 원래 풍차 계획을 실행하겠다고 전격 발표했습니다.","Napoleon suddenly announced that they would carry out Snowball\'s original windmill plan."',
    'EXPRESSION,,"3. come to an end = 끝나다 / 막을 내리다","NOTE: 일정 기간, 행사, 상태의 종결을 묘사","[연습] 수년간의 분쟁이 마침내 평화롭게 막을 날렀습니다.","→ Years of conflict finally came to an end peacefully.","[도전] 동물들의 자유롭고 민주적인 토론은 완전히 막을 날렀습니다.","The free and democratic debates of the animals came to an end completely."',
    'REVIEW,,"1. 우리는 그 비양심적인 계획을 어쩔 수 없이 실행해야만 했습니다.","(어순 가이드: 우리는 어쩔 수 없이 실행해야만 했습니다 / 그 비양심적인 계획을)","1. We were forced to carry out the unscrupulous plan."',
    'REVIEW,,"2. 그 관료주의적인 조직은 마침내 그들의 오랜 프로젝트를 끝냈습니다.","(어순 가이드: 그 관료주의적인 조직은 / 마침내 / 그들의 오랜 프로젝트를 끝냈습니다)","2. The bureaucratic organization finally brought their long project to an end."',
    'REVIEW,,"3. 그녀는 그 논쟁에서 아무의 편도 들지 않기로 결정했습니다.","(어순 가이드: 그녀는 결정했습니다 / 편을 들지 않기로 / 아무의 / 그 논쟁에서)","3. She decided not to side with anyone in the disagreement."',
  ].join("\n");
}
