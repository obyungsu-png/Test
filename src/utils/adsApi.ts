// Ads API - Supabase 서버와 통신
import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7db3bef3`;

export type AdPosition = 'top' | 'middle' | 'bottom';

export interface AdItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  linkUrl: string;
  targetPage: 'home' | 'korean' | 'international' | 'certification';
  position: AdPosition;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// 재시도 로직이 포함된 fetch wrapper
async function fetchWithRetry(url: string, options: RequestInit, retries = 2, delay = 1000): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      console.log(`Fetch attempt ${attempt + 1}/${retries + 1} failed for ${url}:`, error);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      } else {
        throw error;
      }
    }
  }
  throw new Error('All fetch attempts failed');
}

// 모든 광고 조회
export async function fetchAllAds(): Promise<AdItem[]> {
  try {
    const response = await fetchWithRetry(`${API_BASE}/ads`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server responded with ${response.status}: ${errorText}`);
      return [];
    }
    const data = await response.json();
    return data.ads || [];
  } catch (error) {
    console.error('Error fetching ads after retries:', error);
    return []; // 빈 배열 반환으로 graceful fallback
  }
}

// 특정 페이지 + 위치별 광고 조회 (활성화된 것만)
export async function fetchPageAds(page: string, position?: AdPosition): Promise<AdItem[]> {
  try {
    const url = position
      ? `${API_BASE}/ads/page/${page}?position=${position}`
      : `${API_BASE}/ads/page/${page}`;
    const response = await fetchWithRetry(url, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server responded with ${response.status}: ${errorText}`);
      return [];
    }
    const data = await response.json();
    return data.ads || [];
  } catch (error) {
    console.error('Error fetching page ads after retries:', error);
    return []; // 빈 배열 반환으로 graceful fallback
  }
}

// 광고 전체 저장
export async function saveAds(ads: AdItem[]): Promise<void> {
  try {
    const response = await fetchWithRetry(`${API_BASE}/ads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ ads }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save ads: ${errorText}`);
    }
    console.log('Successfully saved ads to server');
  } catch (error) {
    console.error('Error saving ads:', error);
    throw error;
  }
}