// SGR HSK API — Supabase 서버와 통신
// SGR Class 와 달리 저장은 항상 per-id upsert 로만 이루어지므로
// 다른 클라이언트가 갖고 있는 레슨을 실수로 삭제하지 않는다.

import { projectId, publicAnonKey } from "./supabase/info";
import type { HSKLesson } from "../components/SGRHSK/types";
import {
  registerServerUpserter,
  registerServerDeleter,
  registerServerLoader,
} from "../components/SGRHSK/types";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7db3bef3`;

// ===== Fetch helpers =====
const FETCH_TIMEOUT = 8000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);
      return response;
    } catch (error: any) {
      lastError = error;
      if (attempt < retries) {
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        console.log(`[SGR HSK API] Retry ${attempt + 1}/${retries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    Authorization: `Bearer ${publicAnonKey}`,
    ...extra,
  };
}

// ===== API =====

export async function fetchLessons(): Promise<HSKLesson[]> {
  try {
    const response = await fetchWithRetry(`${API_BASE}/sgr-hsk/lessons`, { headers: authHeaders() });
    if (!response.ok) {
      console.warn(`[SGR HSK API] fetchLessons returned ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.lessons || [];
  } catch (error: any) {
    console.warn("[SGR HSK API] fetchLessons failed:", error?.message || error);
    return [];
  }
}

/** 개별 upsert — 다른 클라이언트의 레슨을 건드리지 않는다. */
export async function upsertLesson(lesson: HSKLesson): Promise<void> {
  const response = await fetchWithRetry(`${API_BASE}/sgr-hsk/lessons/${encodeURIComponent(lesson.id)}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ lesson }),
  });
  if (!response.ok) {
    let msg = response.statusText;
    try { const j = await response.json(); msg = j.error || msg; } catch {}
    throw new Error(`Server returned ${response.status}: ${msg}`);
  }
}

/** 개별 삭제 */
export async function deleteLessonRemote(id: string): Promise<void> {
  const response = await fetchWithRetry(`${API_BASE}/sgr-hsk/lessons/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok && response.status !== 404) {
    let msg = response.statusText;
    try { const j = await response.json(); msg = j.error || msg; } catch {}
    throw new Error(`Server returned ${response.status}: ${msg}`);
  }
}

// ─── 서버 연동 함수 자동 등록 ───
registerServerUpserter(async (lesson: HSKLesson) => {
  await upsertLesson(lesson);
});
registerServerDeleter(async (id: string) => {
  await deleteLessonRemote(id);
});
registerServerLoader(async () => {
  return await fetchLessons();
});
