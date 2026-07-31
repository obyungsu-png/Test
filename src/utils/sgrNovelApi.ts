// SGR Novels API — Supabase 서버와 통신 (with timeout, retry, caching)
import { projectId, publicAnonKey } from "./supabase/info";
import type { SGRNovel } from "../components/SGRNovel/types";
import { registerNovelServerSaver, registerNovelServerLoader } from "../components/SGRNovel/types";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7db3bef3`;

// ===== Fetch Helper with Timeout & Retry =====

const FETCH_TIMEOUT = 8000; // 8 seconds
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
        console.log(`[SGR Novels API] Retry ${attempt + 1}/${retries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// ===== Auth Headers =====

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    Authorization: `Bearer ${publicAnonKey}`,
    ...extra,
  };
}

// ===== SGR Novels API =====

/**
 * Supabase에서 모든 SGR Novels 소설을 불러옵니다.
 * 실패 시 빈 배열을 반환합니다.
 */
export async function fetchNovels(): Promise<SGRNovel[]> {
  try {
    const response = await fetchWithRetry(`${API_BASE}/sgr-novel/novels`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      console.warn(`[SGR Novels API] fetchNovels returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.novels || [];
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.warn("[SGR Novels API] fetchNovels timed out after retries");
    } else {
      console.warn("[SGR Novels API] fetchNovels failed:", error.message || error);
    }
    return [];
  }
}

/**
 * 모든 SGR Novels 소설을 Supabase에 저장합니다. (전체 교체)
 */
export async function saveNovels(novels: SGRNovel[]): Promise<boolean> {
  try {
    const response = await fetchWithRetry(`${API_BASE}/sgr-novel/novels`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ novels }),
    });

    if (!response.ok) {
      let errorMsg = response.statusText;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch {}
      throw new Error(`Server returned ${response.status}: ${errorMsg}`);
    }

    console.log("[SGR Novels API] Successfully saved novels to Supabase");
    return true;
  } catch (error: any) {
    console.warn("[SGR Novels API] saveNovels failed:", error.message || error);
    throw error;
  }
}

// ─── 서버 연동 함수 자동 등록 ───
// types.ts의 saveNovels()가 호출될 때마다 Supabase에도 저장됨
registerNovelServerSaver(async (novels: SGRNovel[]) => {
  await saveNovels(novels);
});

registerNovelServerLoader(async () => {
  return await fetchNovels();
});
