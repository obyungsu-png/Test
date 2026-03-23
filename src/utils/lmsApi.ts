// LMS API - Supabase 서버와 통신 (with timeout, retry, caching)
import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7db3bef3`;

// ===== Fetch Helper with Timeout & Retry =====

const FETCH_TIMEOUT = 8000; // 8 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second base delay

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
        const delay = RETRY_DELAY * Math.pow(2, attempt); // exponential backoff
        console.log(`[LMS API] Retry ${attempt + 1}/${retries} for ${url} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// ===== In-Memory Cache =====

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 30_000; // 30 seconds
const cache: Record<string, CacheEntry<any>> = {};

function getCached<T>(key: string): T | null {
  const entry = cache[key];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache[key] = { data, timestamp: Date.now() };
}

export function invalidateCache(key?: string): void {
  if (key) {
    delete cache[key];
  } else {
    Object.keys(cache).forEach(k => delete cache[k]);
  }
}

// ===== Interfaces =====

export interface UploadedMaterial {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  category: string;
  schoolType: 'korean' | 'international' | 'certification';
  contentType: string;
  uploadDate: string;
  password: string;
  downloadCount: number;
  fileSize: string;
  isUploaded: boolean;
  uploadData: any;
  previewFileData?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    fileData: string;
  };
  source: 'content-management' | 'upload-page';
}

export interface CategoryData {
  id: string;
  originalName: string;
  customName: string;
  schoolType: 'korean' | 'international' | 'certification';
  subject: string;
  level: string;
}

// ===== Auth Headers =====

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    'Authorization': `Bearer ${publicAnonKey}`,
    ...extra,
  };
}

// ===== LMS Materials =====

export async function fetchMaterials(): Promise<UploadedMaterial[]> {
  // Check cache first
  const cached = getCached<UploadedMaterial[]>('materials');
  if (cached) return cached;

  try {
    const response = await fetchWithRetry(`${API_BASE}/lms/materials`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      let errorMsg = response.statusText;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch {}
      throw new Error(`Server returned ${response.status}: ${errorMsg}`);
    }

    const data = await response.json();
    const materials = data.materials || [];
    setCache('materials', materials);
    return materials;
  } catch (error: any) {
    // Distinguish between abort (timeout) and network errors for clearer logs
    if (error.name === 'AbortError') {
      console.warn('[LMS API] fetchMaterials timed out after retries');
    } else {
      console.warn('[LMS API] fetchMaterials failed:', error.message || error);
    }
    throw error;
  }
}

export async function saveMaterials(materials: UploadedMaterial[]): Promise<void> {
  try {
    const response = await fetchWithRetry(`${API_BASE}/lms/materials`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ materials }),
    });

    if (!response.ok) {
      let errorMsg = response.statusText;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch {}
      throw new Error(`Server returned ${response.status}: ${errorMsg}`);
    }

    // Update cache after successful save
    setCache('materials', materials);
    console.log('[LMS API] Successfully saved materials to server');
  } catch (error: any) {
    console.warn('[LMS API] saveMaterials failed:', error.message || error);
    throw error;
  }
}

// ===== Categories =====

export async function fetchCategories(): Promise<CategoryData[]> {
  const cached = getCached<CategoryData[]>('categories');
  if (cached) return cached;

  try {
    const response = await fetchWithRetry(`${API_BASE}/lms/categories`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      let errorMsg = response.statusText;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch {}
      throw new Error(`Server returned ${response.status}: ${errorMsg}`);
    }

    const data = await response.json();
    const categories = data.categories || [];
    setCache('categories', categories);
    return categories;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('[LMS API] fetchCategories timed out after retries');
    } else {
      console.warn('[LMS API] fetchCategories failed:', error.message || error);
    }
    throw error;
  }
}

export async function saveCategories(categories: CategoryData[]): Promise<void> {
  try {
    const response = await fetchWithRetry(`${API_BASE}/lms/categories`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ categories }),
    });

    if (!response.ok) {
      let errorMsg = response.statusText;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch {}
      throw new Error(`Server returned ${response.status}: ${errorMsg}`);
    }

    setCache('categories', categories);
    console.log('[LMS API] Successfully saved categories to server');
  } catch (error: any) {
    console.warn('[LMS API] saveCategories failed:', error.message || error);
    throw error;
  }
}
