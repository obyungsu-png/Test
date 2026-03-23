import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-7db3bef3/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== Voca 단어 관리 API =====

// 모든 단어 조회
app.get("/make-server-7db3bef3/voca/words", async (c) => {
  try {
    const words = await kv.get("nstudy_voca_words");
    return c.json({ words: words || [] });
  } catch (error) {
    console.error("Error fetching voca words:", error);
    return c.json({ error: "Failed to fetch words", details: String(error) }, 500);
  }
});

// 단어 저장 (전체 교체)
app.post("/make-server-7db3bef3/voca/words", async (c) => {
  try {
    const body = await c.req.json();
    const { words } = body;
    
    if (!Array.isArray(words)) {
      return c.json({ error: "Words must be an array" }, 400);
    }
    
    await kv.set("nstudy_voca_words", words);
    return c.json({ success: true, count: words.length });
  } catch (error) {
    console.error("Error saving voca words:", error);
    return c.json({ error: "Failed to save words", details: String(error) }, 500);
  }
});

// Day 이름 매핑 조회
app.get("/make-server-7db3bef3/voca/day-names", async (c) => {
  try {
    const dayNames = await kv.get("nstudy_voca_day_names");
    return c.json({ dayNames: dayNames || {} });
  } catch (error) {
    console.error("Error fetching day names:", error);
    return c.json({ error: "Failed to fetch day names", details: String(error) }, 500);
  }
});

// Day 이름 매핑 저장
app.post("/make-server-7db3bef3/voca/day-names", async (c) => {
  try {
    const body = await c.req.json();
    const { dayNames } = body;
    
    await kv.set("nstudy_voca_day_names", dayNames);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving day names:", error);
    return c.json({ error: "Failed to save day names", details: String(error) }, 500);
  }
});

// 단어 일괄 추가 (기존 데이터에 추가)
app.post("/make-server-7db3bef3/voca/words/bulk-add", async (c) => {
  try {
    const body = await c.req.json();
    const { words: newWords } = body;
    
    if (!Array.isArray(newWords)) {
      return c.json({ error: "Words must be an array" }, 400);
    }
    
    const existingWords = await kv.get("nstudy_voca_words") || [];
    const updatedWords = [...existingWords, ...newWords];
    
    await kv.set("nstudy_voca_words", updatedWords);
    return c.json({ success: true, count: updatedWords.length, added: newWords.length });
  } catch (error) {
    console.error("Error bulk adding words:", error);
    return c.json({ error: "Failed to add words", details: String(error) }, 500);
  }
});

// 특정 단어 삭제
app.delete("/make-server-7db3bef3/voca/words/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const words = await kv.get("nstudy_voca_words") || [];
    const filteredWords = words.filter((w: any) => w.id !== id);
    
    await kv.set("nstudy_voca_words", filteredWords);
    return c.json({ success: true, count: filteredWords.length });
  } catch (error) {
    console.error("Error deleting word:", error);
    return c.json({ error: "Failed to delete word", details: String(error) }, 500);
  }
});

// 단어 수정
app.put("/make-server-7db3bef3/voca/words/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { word: updatedWord } = body;
    
    const words = await kv.get("nstudy_voca_words") || [];
    const updatedWords = words.map((w: any) => w.id === id ? { ...w, ...updatedWord } : w);
    
    await kv.set("nstudy_voca_words", updatedWords);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating word:", error);
    return c.json({ error: "Failed to update word", details: String(error) }, 500);
  }
});

// ===== LMS 콘텐츠 관리 API =====

// 모든 업로드 자료 조회
app.get("/make-server-7db3bef3/lms/materials", async (c) => {
  try {
    const materials = await kv.get("nstudy_lms_materials");
    return c.json({ materials: materials || [] });
  } catch (error) {
    console.error("Error fetching LMS materials:", error);
    return c.json({ error: "Failed to fetch materials", details: String(error) }, 500);
  }
});

// 자료 저장 (전체 교체)
app.post("/make-server-7db3bef3/lms/materials", async (c) => {
  try {
    const body = await c.req.json();
    const { materials } = body;
    
    if (!Array.isArray(materials)) {
      return c.json({ error: "Materials must be an array" }, 400);
    }
    
    await kv.set("nstudy_lms_materials", materials);
    return c.json({ success: true, count: materials.length });
  } catch (error) {
    console.error("Error saving LMS materials:", error);
    return c.json({ error: "Failed to save materials", details: String(error) }, 500);
  }
});

// 카테고리 커스텀 이름 조회
app.get("/make-server-7db3bef3/lms/categories", async (c) => {
  try {
    const categories = await kv.get("nstudy_lms_categories");
    return c.json({ categories: categories || [] });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ error: "Failed to fetch categories", details: String(error) }, 500);
  }
});

// 카테고리 커스텀 이름 저장
app.post("/make-server-7db3bef3/lms/categories", async (c) => {
  try {
    const body = await c.req.json();
    const { categories } = body;
    
    if (!Array.isArray(categories)) {
      return c.json({ error: "Categories must be an array" }, 400);
    }
    
    await kv.set("nstudy_lms_categories", categories);
    return c.json({ success: true, count: categories.length });
  } catch (error) {
    console.error("Error saving categories:", error);
    return c.json({ error: "Failed to save categories", details: String(error) }, 500);
  }
});

// ===== 모바일 광고 관리 API =====

// 광고 목록 조회 (없으면 샘플 데이터 자동 생성)
app.get("/make-server-7db3bef3/ads", async (c) => {
  try {
    let ads = await kv.get("nstudy_mobile_ads");
    if (!ads || (Array.isArray(ads) && ads.length === 0) || (Array.isArray(ads) && ads[0] && !ads[0].position)) {
      // 샘플 광고 데이터 시딩 (position 필드 없는 이전 데이터도 교체)
      ads = getSampleAds();
      await kv.set("nstudy_mobile_ads", ads);
      console.log("Sample ads seeded/updated with position field");
    }
    return c.json({ ads });
  } catch (error) {
    console.log("Error fetching ads:", error);
    return c.json({ error: "Failed to fetch ads", details: String(error) }, 500);
  }
});

// 특정 페이지 광고 조회 (없으면 샘플 데이터 자동 생성)
app.get("/make-server-7db3bef3/ads/page/:page", async (c) => {
  try {
    const page = c.req.param('page');
    const position = c.req.query('position'); // top, middle, bottom
    let ads = await kv.get("nstudy_mobile_ads");
    if (!ads || (Array.isArray(ads) && ads.length === 0) || (Array.isArray(ads) && ads[0] && !ads[0].position)) {
      ads = getSampleAds();
      await kv.set("nstudy_mobile_ads", ads);
      console.log("Sample ads seeded/updated for page request");
    }
    let filtered = ads.filter((ad: any) => ad.targetPage === page && ad.active);
    if (position) {
      filtered = filtered.filter((ad: any) => ad.position === position);
    }
    filtered.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    return c.json({ ads: filtered });
  } catch (error) {
    console.log("Error fetching page ads:", error);
    return c.json({ error: "Failed to fetch page ads", details: String(error) }, 500);
  }
});

// 광고 저장 (전체 교체)
app.post("/make-server-7db3bef3/ads", async (c) => {
  try {
    const body = await c.req.json();
    const { ads } = body;
    if (!Array.isArray(ads)) {
      return c.json({ error: "Ads must be an array" }, 400);
    }
    await kv.set("nstudy_mobile_ads", ads);
    return c.json({ success: true, count: ads.length });
  } catch (error) {
    console.log("Error saving ads:", error);
    return c.json({ error: "Failed to save ads", details: String(error) }, 500);
  }
});

function getSampleAds() {
  return [
    {
      id: "sample_ad_1",
      title: "🏫 강남 SKY 학원 - 수학 전문",
      description: "서울대 출신 강사진이 직접 지도! 내신 1등급 달성률 92%. 중등·고등 수학 정규반 & 특강반 모집 중. 3월 개강 무료 레벨테스트 신청하세요.",
      imageUrl: "https://images.unsplash.com/photo-1758685848204-a170e78f1507?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoJTIwdHV0b3JpbmclMjBwcml2YXRlJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc3MjAzOTYxOXww&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "",
      linkUrl: "https://example.com/sky-academy",
      targetPage: "home",
      position: "top",
      active: true,
      order: 0,
      createdAt: "2026-02-25T00:00:00.000Z",
      updatedAt: "2026-02-25T00:00:00.000Z"
    },
    {
      id: "sample_ad_2",
      title: "📚 대치동 명문 국어학원",
      description: "국어 내신 & 수능 통합 커리큘럼. 비문학 독해력 + 문학 분석력을 한 번에! 소수 정예 8명 반 운영. 첫 달 20% 할인 이벤트 진행 중.",
      imageUrl: "https://images.unsplash.com/photo-1622016579436-14c1844c99ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3JlYW4lMjB0dXRvcmluZyUyMGFjYWRlbXklMjBjbGFzc3Jvb20lMjBzdHVkZW50c3xlbnwxfHx8fDE3NzIwMzk2MTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "",
      linkUrl: "https://example.com/korean-academy",
      targetPage: "korean",
      position: "top",
      active: true,
      order: 0,
      createdAt: "2026-02-25T00:00:00.000Z",
      updatedAt: "2026-02-25T00:00:00.000Z"
    },
    {
      id: "sample_ad_3",
      title: "🌍 IB/AP 전문 글로벌 아카데미",
      description: "IB Diploma 45점 만점자 배출! AP 5점 취득률 89%. 원어민 + 한국인 강사 듀얼 시스템. 국제학교 재학생 맞춤 프로그램.",
      imageUrl: "https://images.unsplash.com/photo-1705727210721-961cc64a6895?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwbGFiJTIwZWR1Y2F0aW9uJTIwYWNhZGVteXxlbnwxfHx8fDE3NzIwMzk2MTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "",
      linkUrl: "https://example.com/global-academy",
      targetPage: "international",
      position: "middle",
      active: true,
      order: 0,
      createdAt: "2026-02-25T00:00:00.000Z",
      updatedAt: "2026-02-25T00:00:00.000Z"
    },
    {
      id: "sample_ad_4",
      title: "🎯 SAT·TOEFL 1위 에듀프렙 학원",
      description: "SAT 1500+ 달성률 78%! TOEFL 100+ 보장반 운영. 실전 모의고사 매주 실시. 미국 명문대 합격생 다수 배출. 봄학기 등록 시 교재 무료!",
      imageUrl: "https://images.unsplash.com/photo-1552417559-f62e53cba705?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxFbmdsaXNoJTIwc3BlYWtpbmclMjBjbGFzcyUyMGNvbnZlcnNhdGlvbnxlbnwxfHx8fDE3NzIwMzk2MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "",
      linkUrl: "https://example.com/eduprep",
      targetPage: "certification",
      position: "top",
      active: true,
      order: 0,
      createdAt: "2026-02-25T00:00:00.000Z",
      updatedAt: "2026-02-25T00:00:00.000Z"
    },
    {
      id: "sample_ad_5",
      title: "✨ 목동 탑클래스 영어학원",
      description: "영어 회화부터 내신까지 원스톱! 원어민 회화 수업 + 내신 문법 완벽 대비. 중등·고등 레벨별 분반. 무료 체험수업 예약 가능.",
      imageUrl: "https://images.unsplash.com/photo-1622016579436-14c1844c99ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3JlYW4lMjB0dXRvcmluZyUyMGFjYWRlbXklMjBjbGFzc3Jvb20lMjBzdHVkZW50c3xlbnwxfHx8fDE3NzIwMzk2MTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "",
      linkUrl: "https://example.com/topclass-english",
      targetPage: "home",
      position: "middle",
      active: true,
      order: 0,
      createdAt: "2026-02-25T00:00:00.000Z",
      updatedAt: "2026-02-25T00:00:00.000Z"
    },
    {
      id: "sample_ad_6",
      title: "🔬 과학 올림피아드 전문 학원",
      description: "물리·화학·생물 올림피아드 대비 전문 학원. 국제 과학올림피아드 메달리스트 출신 강사진. 실험 중심 수업으로 과학적 사고력 향상!",
      imageUrl: "https://images.unsplash.com/photo-1705727210721-961cc64a6895?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwbGFiJTIwZWR1Y2F0aW9uJTIwYWNhZGVteXxlbnwxfHx8fDE3NzIwMzk2MTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "",
      linkUrl: "https://example.com/science-olympiad",
      targetPage: "international",
      position: "bottom",
      active: true,
      order: 0,
      createdAt: "2026-02-25T00:00:00.000Z",
      updatedAt: "2026-02-25T00:00:00.000Z"
    },
    {
      id: "sample_ad_7",
      title: "📐 수학의 정석 학원",
      description: "수능 수학 만점 전략! 개념부터 킬러문항까지 완벽 대비. 수학 상위 1% 달성 프로그램 운영.",
      imageUrl: "https://images.unsplash.com/photo-1758685848204-a170e78f1507?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoJTIwdHV0b3JpbmclMjBwcml2YXRlJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc3MjAzOTYxOXww&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "",
      linkUrl: "https://example.com/math-academy",
      targetPage: "korean",
      position: "bottom",
      active: true,
      order: 0,
      createdAt: "2026-02-25T00:00:00.000Z",
      updatedAt: "2026-02-25T00:00:00.000Z"
    },
    {
      id: "sample_ad_8",
      title: "🏆 ACT 전문 프렙 아카데미",
      description: "ACT 33+ 목표반 운영. 과목별 전문 강사 배치. 매월 실전 모의고사 + 1:1 오답 분석 제공.",
      imageUrl: "https://images.unsplash.com/photo-1552417559-f62e53cba705?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxFbmdsaXNoJTIwc3BlYWtpbmclMjBjbGFzcyUyMGNvbnZlcnNhdGlvbnxlbnwxfHx8fDE3NzIwMzk2MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "",
      linkUrl: "https://example.com/act-prep",
      targetPage: "certification",
      position: "bottom",
      active: true,
      order: 0,
      createdAt: "2026-02-25T00:00:00.000Z",
      updatedAt: "2026-02-25T00:00:00.000Z"
    },
    {
      id: "sample_ad_9",
      title: "💡 스마트 코딩 학원",
      description: "AI 시대 필수! 초중고 코딩 교육 전문. Python, Java, 알고리즘 대회 대비반. 무료 체험 수업 가능.",
      imageUrl: "https://images.unsplash.com/photo-1705727210721-961cc64a6895?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwbGFiJTIwZWR1Y2F0aW9uJTIwYWNhZGVteXxlbnwxfHx8fDE3NzIwMzk2MTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      videoUrl: "",
      linkUrl: "https://example.com/coding-academy",
      targetPage: "home",
      position: "bottom",
      active: true,
      order: 0,
      createdAt: "2026-02-25T00:00:00.000Z",
      updatedAt: "2026-02-25T00:00:00.000Z"
    }
  ];
}

// ===== AI 문단 요약 & 채점 API (OpenRouter) =====

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

async function callOpenRouter(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

  const res = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://allmyexam.com", // Optional: for OpenRouter analytics
      "X-Title": "All My Exam", // Optional: for OpenRouter analytics
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat", // OpenRouter의 DeepSeek 모델
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// AI 자동 요약
app.post("/make-server-7db3bef3/ai/summarize", async (c) => {
  try {
    const { lessonTitle, paragraphs } = await c.req.json();

    const systemPrompt = `You are an expert English/Korean educational content summarizer. For each paragraph provided, generate:
1. topicKo: A concise Korean topic sentence (1 line)
2. keywords: 3-5 key vocabulary words from the paragraph
3. summaryEn: A 1-2 sentence English summary

Return ONLY valid JSON array with objects: { paragraphId, topicKo, keywords, summaryEn }. No markdown, no explanation.`;

    const userPrompt = `Lesson: "${lessonTitle}"

Paragraphs:
${paragraphs.map((p: any) => `
[Paragraph ${p.id}] Topic: ${p.topic} | Structure: ${p.structure}
Sentences:
${p.sentences.map((s: any) => `- EN: ${s.english}\n  KO: ${s.korean}`).join("\n")}
`).join("\n")}

Generate JSON summaries for each paragraph.`;

    const raw = await callOpenRouter(systemPrompt, userPrompt);

    // Parse JSON from response (handle potential markdown wrapping)
    let summaries;
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      summaries = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
    } catch {
      console.log("OpenRouter raw response:", raw);
      throw new Error("Failed to parse AI response as JSON");
    }

    return c.json({ summaries });
  } catch (error) {
    console.log("AI summarize error:", error);
    return c.json({ error: "AI summarize failed", details: String(error) }, 500);
  }
});

// AI 학생 요약 채점
app.post("/make-server-7db3bef3/ai/grade-summary", async (c) => {
  try {
    const { studentSummary, paragraphTopic, sentences } = await c.req.json();

    const systemPrompt = `You are a strict but encouraging Korean English teacher grading a student's paragraph summary.
Evaluate on 3 criteria (each 0-100):
- accuracy: Does the summary capture the main idea correctly?
- completeness: Does it cover key points without missing important details?
- language: Grammar, vocabulary usage, and naturalness

Return ONLY valid JSON: { score (0-100 overall), grade (A+/A/B+/B/C+/C/D/F), accuracy: { score, comment }, completeness: { score, comment }, language: { score, comment }, overallComment (2-3 sentences in Korean), improvedVersion (model answer in the same language as student's input) }. No markdown.`;

    const originalText = sentences.map((s: any) => `EN: ${s.english} / KO: ${s.korean}`).join("\n");

    const userPrompt = `Paragraph topic: ${paragraphTopic}

Original text:
${originalText}

Student's summary:
"${studentSummary}"

Grade this summary.`;

    const raw = await callOpenRouter(systemPrompt, userPrompt);

    let result;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
    } catch {
      console.log("OpenRouter grading raw:", raw);
      throw new Error("Failed to parse grading response");
    }

    return c.json(result);
  } catch (error) {
    console.log("AI grade-summary error:", error);
    return c.json({ error: "AI grading failed", details: String(error) }, 500);
  }
});

// AI 텍스트 분석 및 레슨 생성
app.post("/make-server-7db3bef3/ai/analyze-text", async (c) => {
  try {
    console.log("=== AI Analyze Text Request ===");
    
    const { text } = await c.req.json();
    console.log("Received text length:", text?.length || 0);

    if (!text || text.trim().length < 10) {
      console.warn("Text too short:", text?.length);
      return c.json({ error: "Text is too short (minimum 10 characters)" }, 400);
    }

    // Check API key
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is not configured");
      return c.json({ 
        error: "OpenRouter API 키가 설정되지 않았습니다.", 
        hint: "Figma Make 환경 변수에서 OPENROUTER_API_KEY를 설정해주세요.",
        details: "https://openrouter.ai 에서 API 키를 발급받을 수 있습니다."
      }, 500);
    }

    console.log("API key found, length:", apiKey.length);
    console.log("API key prefix:", apiKey.substring(0, 8) + "...");

    const systemPrompt = `You are an expert English educational content analyzer for Korean middle/high school students. Analyze the provided English text and generate comprehensive learning materials optimized for "교과서 뽀개기" (Textbook Mastery) system.

Generate the following in JSON format:
{
  "vocabulary": [
    {
      "word": "string",
      "meaning": "Korean meaning",
      "pos": "명사|동사|형용사|부사|전치사|접속사|...",
      "example": "Example sentence from text or create one",
      "exampleKo": "Korean translation of example",
      "synonym": "synonyms (optional)",
      "antonym": "antonyms (optional)"
    }
  ],
  "sentences": [
    {
      "english": "Original sentence",
      "korean": "Accurate Korean translation",
      "chunks": ["phrase1", "phrase2", "phrase3"],
      "grammarPoint": "Key grammar point (Korean explanation)",
      "svoHighlight": {
        "subject": "subject phrase",
        "verb": "verb phrase",
        "object": "object phrase (optional)",
        "complement": "complement phrase (optional)"
      },
      "importance": "high|mid|low",
      "paragraphId": 1
    }
  ],
  "paragraphs": [
    {
      "id": 1,
      "topic": "Main topic in Korean",
      "structure": "Paragraph structure description in Korean (예: 도입/전개/결론)"
    }
  ],
  "problems": [
    {
      "type": "multiple_choice|short_answer|sentence_insert|grammar_fix|content_match",
      "question": "Question text in Korean (clear and concise)",
      "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
      "answer": "A",
      "explanation": "Detailed explanation in Korean",
      "relatedSentenceId": 1
    }
  ]
}

CRITICAL GUIDELINES FOR EDUCATIONAL OPTIMIZATION:

1. **Vocabulary (10-30 words)**:
   - Focus on key academic and useful words
   - Include accurate Korean meanings
   - Provide contextual examples
   - **synonym**: MUST provide exactly 3 synonyms comma-separated for content words: 2 similar-difficulty synonyms + 1 harder/advanced synonym. Example: "happy" → "glad, cheerful, elated". Format: "easy1, easy2, hard1"
   - Include antonyms where helpful

2. **Sentences (MUST include proper analysis)**:
   - **chunks**: Break sentence into 3-5 meaningful phrases for "끊어읽기" (chunked reading)
     Example: "Today is my first day at a new school" → ["Today", "is my first day", "at a new school"]
   - **svoHighlight**: ALWAYS identify Subject, Verb, Object/Complement for S/V/O analysis
     Example: { "subject": "I", "verb": "am studying", "object": "English" }
   - **grammarPoint**: Identify key grammar (예: be동사, 현재완료, to부정사, 관계대명사 등)
   - **importance**: Mark "high" for key sentences, "mid" for supporting, "low" for minor details
   - **korean**: Provide natural, accurate Korean translation

3. **Paragraphs (Logical grouping)**:
   - Group related sentences into paragraphs
   - Identify main topic for each paragraph
   - Describe structure (도입, 사건전개, 결론, 대조, 인과관계 등)

4. **Problems (5-10 questions, well-distributed)**:
   - **multiple_choice**: Comprehension, vocabulary, or content questions with 4 options
   - **grammar_fix**: Grammar or usage questions
   - **sentence_insert**: Where does this sentence belong?
   - **content_match**: Main idea, theme, or inference questions
   - **short_answer**: Fill-in-the-blank or short response
   - Ensure questions test various skills (comprehension, grammar, vocabulary, inference)
   - Link questions to specific sentences when possible

5. **Korean Language**:
   - All Korean text must be natural and accurate
   - Use proper academic Korean for explanations

6. **JSON Format**:
   - Return ONLY valid JSON
   - No markdown code blocks
   - Ensure all strings are properly escaped`;

    const userPrompt = `Analyze this English text and generate comprehensive learning materials:

${text}

Generate complete vocabulary, sentences, paragraphs, and problems in JSON format.`;

    console.log("Calling OpenRouter API for text analysis...");
    console.log("Text length:", text.length);
    
    let raw;
    try {
      raw = await callOpenRouter(systemPrompt, userPrompt);
      console.log("OpenRouter response received, length:", raw?.length || 0);
    } catch (apiError) {
      console.error("OpenRouter API call failed:", apiError);
      return c.json({ 
        error: "AI API call failed", 
        details: String(apiError),
        hint: "Please check if OPENROUTER_API_KEY is valid"
      }, 500);
    }

    if (!raw || raw.trim().length === 0) {
      console.error("Empty response from OpenRouter");
      return c.json({ error: "AI returned empty response" }, 500);
    }

    // Parse JSON from response
    let result;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("OpenRouter raw response:", raw.substring(0, 500)); // Log first 500 chars
      return c.json({ 
        error: "Failed to parse AI response", 
        details: String(parseError),
        preview: raw.substring(0, 200)
      }, 500);
    }

    // Validate structure
    if (!result.vocabulary || !result.sentences || !result.paragraphs || !result.problems) {
      console.error("Missing required fields in AI response:", Object.keys(result));
      return c.json({ 
        error: "AI response missing required fields",
        found: Object.keys(result),
        required: ["vocabulary", "sentences", "paragraphs", "problems"]
      }, 500);
    }

    // Add IDs if missing
    result.vocabulary = result.vocabulary.map((v: any, idx: number) => ({
      id: `${Date.now()}-${idx}`,
      ...v
    }));

    result.sentences = result.sentences.map((s: any, idx: number) => ({
      id: Date.now() + idx,
      ...s
    }));

    result.problems = result.problems.map((p: any, idx: number) => ({
      id: `${Date.now()}-prob-${idx}`,
      ...p
    }));

    console.log("Analysis complete:", {
      vocabCount: result.vocabulary.length,
      sentenceCount: result.sentences.length,
      paragraphCount: result.paragraphs.length,
      problemCount: result.problems.length
    });

    return c.json(result);
  } catch (error) {
    console.error("AI analyze-text error:", error);
    return c.json({ 
      error: "AI text analysis failed", 
      details: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 500);
  }
});

// OpenRouter API 키 테스트 엔드포인트
app.get("/make-server-7db3bef3/ai/test-key", async (c) => {
  try {
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    
    if (!apiKey) {
      return c.json({ 
        valid: false, 
        error: "OPENROUTER_API_KEY not configured",
        message: "API 키가 설정되지 않았습니다."
      });
    }

    // Test with a simple request
    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://allmyexam.com", // Optional: for OpenRouter analytics
        "X-Title": "All My Exam", // Optional: for OpenRouter analytics
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat", // OpenRouter의 DeepSeek 모델
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Say 'OK' if you can read this." },
        ],
        temperature: 0.3,
        max_tokens: 10,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenRouter API key test failed:", res.status, errText);
      return c.json({ 
        valid: false, 
        error: `API error ${res.status}`,
        details: errText,
        message: "API 키가 유효하지 않거나 만료되었습니다."
      });
    }

    const data = await res.json();
    const response = data.choices?.[0]?.message?.content || "";
    
    console.log("OpenRouter API key test successful, response:", response);
    
    return c.json({ 
      valid: true, 
      message: "OpenRouter API 키가 정상적으로 작동합니다!",
      testResponse: response,
      model: data.model,
      usage: data.usage
    });
  } catch (error) {
    console.error("OpenRouter API key test error:", error);
    return c.json({ 
      valid: false, 
      error: String(error),
      message: "API 키 테스트 중 오류가 발생했습니다."
    }, 500);
  }
});

Deno.serve(app.fetch);