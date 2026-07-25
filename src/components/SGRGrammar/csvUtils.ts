// ===================== CSV Utilities for SGR Grammar =====================
// Supports upload/download of a GrammarUnit (Textbook · 문법 writing) via CSV
//
// CSV format (flat, one column per field). One CSV file = one unit.
// Rows are grouped by "section":
//   section, key, value1, value2, value3, value4, value5
//
// section values:
//   META            → key = unitNumber|unitTitle|subtitle
//   SECTION         → value1 = label(A,B,...), value2 = title, value3 = summary
//   EXAMPLE         → value1 = sectionLabel, value2 = korean, value3 = english(**bold**/__underline__), value4 = note
//   RULE            → value1 = sectionLabel, value2 = rule title, value3 = lines(|로 구분)
//   BRACKET_MCQ     → value1 = sentence("( A / B )" 형태), value2 = options(|), value3 = answer index(0-based), value4 = note
//   WORDBANK        → value1 = bank words(|로 구분) — 한 줄
//   WORDBANK_ITEM   → value1 = sentence(___), value2 = baseWord, value3 = answer(형태)
//   REARRANGE       → value1 = korean, value2 = starter, value3 = ending, value4 = words(|), value5 = answer
//   ERROR_CORRECTION → value1 = korean, value2 = wrong, value3 = answer
//   TRANSLATION     → value1 = korean, value2 = hints(|), value3 = answer
//   DIALOGUE_INTRO  → value1 = intro text
//   DIALOGUE_LINE   → value1 = speaker, value2 = text(___), value3 = answers(|)
//   DIALOGUE_HINT   → value1 = label, value2 = words(|)

import type {
  GrammarUnit,
  ExplanationSection,
  GrammarExample,
  RuleBox,
  BracketMcqItem,
  WordBankFillItem,
  RearrangeItem,
  ErrorCorrectionItem,
  TranslationItem,
  DialogueBlock,
  GrammarWritingContent,
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

function csvEscape(v: string | undefined | null): string {
  if (v == null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function emptyGrammarWritingContent(): GrammarWritingContent {
  return {
    typeId: "grammar_writing",
    sections: [],
    bracketMcq: [],
    wordBankFill: { bank: [], items: [] },
    rearrange: [],
    errorCorrection: [],
    translation: [],
  };
}

// ─── Parse CSV → GrammarUnit ────────────────────────
export function parseCsvToGrammarUnit(csv: string): GrammarUnit {
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) throw new Error("빈 CSV 파일입니다.");

  // Skip header row if present
  const first = parseCsvLine(lines[0]);
  const startIdx = first[0]?.toLowerCase() === "section" ? 1 : 0;

  const content = emptyGrammarWritingContent();
  const sectionsByLabel = new Map<string, ExplanationSection>();

  let unitNumber = "01";
  let unitTitle = "Imported Unit";
  let subtitle: string | undefined;

  let dialogue: DialogueBlock | undefined;

  for (let i = startIdx; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const [section, key, v1, v2, v3, v4, v5] = cols;
    if (!section) continue;
    const s = section.trim().toUpperCase();

    switch (s) {
      case "META": {
        const k = (key || "").trim();
        if (k === "unitNumber") unitNumber = v1 || unitNumber;
        else if (k === "unitTitle") unitTitle = v1 || unitTitle;
        else if (k === "subtitle") subtitle = v1 || "";
        break;
      }
      case "SECTION": {
        const label = v1 || String.fromCharCode(65 + sectionsByLabel.size);
        const sec: ExplanationSection = {
          id: uid(),
          label,
          title: v2 || "",
          summary: v3 || "",
          examples: [],
          rules: [],
        };
        sectionsByLabel.set(label, sec);
        content.sections.push(sec);
        break;
      }
      case "EXAMPLE": {
        const label = v1 || "";
        const sec = sectionsByLabel.get(label);
        const ex: GrammarExample = {
          id: uid(),
          korean: v2 || "",
          english: v3 || "",
          note: v4 || undefined,
        };
        if (sec) sec.examples.push(ex);
        break;
      }
      case "RULE": {
        const label = v1 || "";
        const sec = sectionsByLabel.get(label);
        const rule: RuleBox = {
          id: uid(),
          title: v2 || undefined,
          lines: (v3 || "").split("|").map(l => l.trim()).filter(Boolean),
        };
        if (sec) sec.rules.push(rule);
        break;
      }
      case "BRACKET_MCQ": {
        const item: BracketMcqItem = {
          id: uid(),
          sentence: v1 || "",
          options: (v2 || "").split("|").map(o => o.trim()).filter(Boolean),
          answer: parseInt(v3 || "0", 10) || 0,
          note: v4 || undefined,
        };
        content.bracketMcq.push(item);
        break;
      }
      case "WORDBANK": {
        content.wordBankFill.bank = (v1 || "").split("|").map(w => w.trim()).filter(Boolean);
        break;
      }
      case "WORDBANK_ITEM": {
        const item: WordBankFillItem = {
          id: uid(),
          sentence: v1 || "",
          baseWord: v2 || "",
          answer: v3 || "",
        };
        content.wordBankFill.items.push(item);
        break;
      }
      case "REARRANGE": {
        const item: RearrangeItem = {
          id: uid(),
          korean: v1 || "",
          starter: v2 || undefined,
          ending: v3 || undefined,
          words: (v4 || "").split("|").map(w => w.trim()).filter(Boolean),
          answer: v5 || "",
        };
        content.rearrange.push(item);
        break;
      }
      case "ERROR_CORRECTION": {
        const item: ErrorCorrectionItem = {
          id: uid(),
          korean: v1 || "",
          wrong: v2 || "",
          answer: v3 || "",
        };
        content.errorCorrection.push(item);
        break;
      }
      case "TRANSLATION": {
        const item: TranslationItem = {
          id: uid(),
          korean: v1 || "",
          hints: (v2 || "").split("|").map(h => h.trim()).filter(Boolean),
          answer: v3 || "",
        };
        content.translation.push(item);
        break;
      }
      case "DIALOGUE_INTRO": {
        if (!dialogue) dialogue = { id: uid(), lines: [] };
        dialogue.intro = v1 || "";
        break;
      }
      case "DIALOGUE_LINE": {
        if (!dialogue) dialogue = { id: uid(), lines: [] };
        dialogue.lines.push({
          id: uid(),
          speaker: v1 || "",
          text: v2 || "",
          answers: (v3 || "").split("|").map(a => a.trim()).filter(Boolean),
        });
        break;
      }
      case "DIALOGUE_HINT": {
        if (!dialogue) dialogue = { id: uid(), lines: [] };
        if (!dialogue.hintGroups) dialogue.hintGroups = [];
        dialogue.hintGroups.push({
          label: v1 || "",
          words: (v2 || "").split("|").map(w => w.trim()).filter(Boolean),
        });
        break;
      }
      default:
        // ignore unknown sections silently
        break;
    }
  }

  if (dialogue) content.dialogue = dialogue;

  const unit: GrammarUnit = {
    id: uid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    unitNumber,
    unitTitle,
    subtitle,
    textbook: {
      types: [
        { id: "grammar_writing", label: "문법 writing", content },
      ],
    },
    workbook: {
      types: [
        {
          id: "grammar_writing_workbook",
          label: "문법 writing workbook",
          content: {
            typeId: "grammar_writing_workbook",
            notes: "Workbook 유형 상세 포맷은 추후 정의됩니다.",
          },
        },
      ],
    },
  };

  return unit;
}

// ─── Serialize GrammarUnit → CSV ────────────────────
export function grammarUnitToCsv(unit: GrammarUnit): string {
  const rows: string[][] = [];
  rows.push(["section", "key", "value1", "value2", "value3", "value4", "value5"]);

  rows.push(["META", "unitNumber", unit.unitNumber]);
  rows.push(["META", "unitTitle", unit.unitTitle]);
  if (unit.subtitle) rows.push(["META", "subtitle", unit.subtitle]);

  const writing = unit.textbook.types.find(t => t.id === "grammar_writing")
    ?.content as GrammarWritingContent | undefined;
  if (!writing) {
    return rows.map(r => r.map(csvEscape).join(",")).join("\n");
  }

  writing.sections.forEach(sec => {
    rows.push(["SECTION", "", sec.label, sec.title, sec.summary]);
    sec.examples.forEach(ex =>
      rows.push(["EXAMPLE", "", sec.label, ex.korean, ex.english, ex.note || ""])
    );
    sec.rules.forEach(rule =>
      rows.push(["RULE", "", sec.label, rule.title || "", rule.lines.join("|")])
    );
  });

  writing.bracketMcq.forEach(item =>
    rows.push(["BRACKET_MCQ", "", item.sentence, item.options.join("|"), String(item.answer), item.note || ""])
  );

  if (writing.wordBankFill.bank.length > 0) {
    rows.push(["WORDBANK", "", writing.wordBankFill.bank.join("|")]);
  }
  writing.wordBankFill.items.forEach(item =>
    rows.push(["WORDBANK_ITEM", "", item.sentence, item.baseWord, item.answer])
  );

  writing.rearrange.forEach(item =>
    rows.push(["REARRANGE", "", item.korean, item.starter || "", item.ending || "", item.words.join("|"), item.answer])
  );

  writing.errorCorrection.forEach(item =>
    rows.push(["ERROR_CORRECTION", "", item.korean, item.wrong, item.answer])
  );

  writing.translation.forEach(item =>
    rows.push(["TRANSLATION", "", item.korean, item.hints.join("|"), item.answer])
  );

  if (writing.dialogue) {
    if (writing.dialogue.intro) {
      rows.push(["DIALOGUE_INTRO", "", writing.dialogue.intro]);
    }
    writing.dialogue.lines.forEach(line =>
      rows.push(["DIALOGUE_LINE", "", line.speaker, line.text, line.answers.join("|")])
    );
    (writing.dialogue.hintGroups || []).forEach(g =>
      rows.push(["DIALOGUE_HINT", "", g.label, g.words.join("|")])
    );
  }

  return rows.map(r => r.map(csvEscape).join(",")).join("\n");
}

// ─── CSV template for download ──────────────────────
export function getGrammarCsvTemplate(): string {
  return `section,key,value1,value2,value3,value4,value5
META,unitNumber,01,,,,
META,unitTitle,Sample 문법,,,,
META,subtitle,구조 확인용 샘플 단원,,,,
SECTION,,A,핵심 문법의 기능,샘플 설명 — 실제 컨텐츠는 여기에 문법 규칙과 사용 상황에 대한 요약을 작성합니다.,,
EXAMPLE,,A,예문 한글 해석을 여기에 입력하세요.,"This is a __sample__ English sentence with an **underlined** phrase.",샘플 라벨,
RULE,,A,규칙 요약,규칙 1 — 사용 상황을 간단히 서술|규칙 2 — 예외 사항을 표시,
BRACKET_MCQ,,( Sample / Samples ) is only a placeholder.,Sample|Samples,0,
WORDBANK,,study|write|read,,,,
WORDBANK_ITEM,,My plan is ___ hard this year.,study,studying,
REARRANGE,,샘플 배열 문제입니다.,The topic,,is|reading|books,The topic is reading books.
ERROR_CORRECTION,,샘플 오류 수정 문제입니다.,Make a choice of career is difficult.,Making a choice of career is difficult.,
TRANSLATION,,샘플 통문장 쓰기 문제입니다.,the topic|save|energy,The topic is saving energy.,
DIALOGUE_INTRO,,대화를 읽고 빈칸을 완성하세요.,,,,
DIALOGUE_LINE,,A,My plan is ___ hard this year. (study),study,
DIALOGUE_LINE,,B,Sounds good! I'm planning on ___ too. (join),join,
DIALOGUE_HINT,,공통 힌트,study|join|read,,,
`;
}

// ─── 다중 단원 CSV 파싱 (대량 업로드용) ───────────────
// META,unitNumber 행이 나타날 때마다 새 단원으로 분할
export function parseCsvToGrammarUnits(csv: string): GrammarUnit[] {
  const lines = csv.split(/\r?\n/);
  const unitStarts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (
      cols[0]?.trim().toUpperCase() === "META" &&
      cols[1]?.trim().toLowerCase() === "unitnumber"
    ) {
      unitStarts.push(i);
    }
  }

  if (unitStarts.length <= 1) {
    return [parseCsvToGrammarUnit(csv)];
  }

  const headerRow =
    parseCsvLine(lines[0])[0]?.toLowerCase() === "section" ? lines[0] : null;

  const units: GrammarUnit[] = [];
  for (let i = 0; i < unitStarts.length; i++) {
    const start = unitStarts[i];
    const end = i + 1 < unitStarts.length ? unitStarts[i + 1] : lines.length;
    const chunkLines = (headerRow ? [headerRow] : []).concat(lines.slice(start, end));
    const chunk = chunkLines.join("\n");
    try {
      units.push(parseCsvToGrammarUnit(chunk));
    } catch (e) {
      console.error("단원 파싱 실패:", e);
    }
  }
  return units;
}
