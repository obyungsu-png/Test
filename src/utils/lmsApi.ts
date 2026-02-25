// LMS API - Supabase 서버와 통신
import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7db3bef3`;

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

// ===== LMS 자료 관리 =====

export async function fetchMaterials(): Promise<UploadedMaterial[]> {
  try {
    const response = await fetch(`${API_BASE}/lms/materials`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch materials: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.materials || [];
  } catch (error) {
    console.error('Error fetching LMS materials:', error);
    throw error;
  }
}

export async function saveMaterials(materials: UploadedMaterial[]): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/lms/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ materials }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to save materials: ${errorData.error || response.statusText}`);
    }

    console.log('Successfully saved LMS materials to server');
  } catch (error) {
    console.error('Error saving LMS materials:', error);
    throw error;
  }
}

// ===== 카테고리 관리 =====

export async function fetchCategories(): Promise<CategoryData[]> {
  try {
    const response = await fetch(`${API_BASE}/lms/categories`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch categories: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function saveCategories(categories: CategoryData[]): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/lms/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ categories }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to save categories: ${errorData.error || response.statusText}`);
    }

    console.log('Successfully saved categories to server');
  } catch (error) {
    console.error('Error saving categories:', error);
    throw error;
  }
}