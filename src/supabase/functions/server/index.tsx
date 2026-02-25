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

Deno.serve(app.fetch);