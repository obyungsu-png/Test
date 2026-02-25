# N Study Hub - 완전한 코드 통합 문서

## 프로젝트 개요
**N Study Hub** - 한국 교육 플랫폼  
Supabase 클라우드 데이터베이스 연동 완료 (프로젝트 ID: `rpxmiyieukfuyhldqdto`)

### 주요 기능
- ✅ 한국학교/국제학교 별도 메뉴 시스템 (schoolType prop)
- ✅ React Router 8개 페이지 구성
- ✅ LMS 관리 시스템 (콘텐츠/카테고리/인증시험)
- ✅ 7,500개 어휘 데이터 (TOEFL/SAT/IELTS/TOEIC/ACT)
- ✅ PDF/이미지/텍스트 뷰어 (확대/축소/회전)
- ✅ 객관식 문제 업로드 및 미니 시험
- ✅ Supabase API 10개 엔드포인트
- ✅ 페이지네이션 (20개씩 렌더링)

---

## 1. 엔트리 포인트

### `/index.tsx`
```tsx
export { default } from "./App";
```

### `/App.tsx`
```tsx
import { useState } from "react";
import LandingPage from "./LandingPage";
import MainApp from "./MainApp";
import LMSApp from "./LMSApp";
import CertificationTestsPage from "./CertificationTestsPage";
import InternationalSchoolPage from "./InternationalSchoolPage";
import KoreanSchoolPage from "./KoreanSchoolPage";
import Component3Page from "./Component3Page";
import Component4Page from "./Component4Page";
import { Button } from "./components/ui/button";

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'main' | 'lms' | 'certification' | 'international' | 'korean' | 'component3' | 'component4'>('landing');
  const [schoolType, setSchoolType] = useState<'korean' | 'international' | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);
  const [lmsSelectedMenu, setLmsSelectedMenu] = useState('dashboard');
  const [isCertificationMode, setIsCertificationMode] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(null);

  // Landing Page
  if (currentPage === 'landing') {
    return (
      <LandingPage 
        onSchoolTypeSelect={(type) => {
          setSchoolType(type);
          setIsCertificationMode(false);
          if (type === 'korean') {
            setCurrentPage('korean');
          } else {
            setCurrentPage('main');
          }
        }}
        onUserRoleSelect={(role) => {
          setUserRole(role);
        }}
        onCertificationTestsSelect={() => {
          setCurrentPage('certification');
        }}
        onInternationalSchoolSelect={() => {
          setCurrentPage('international');
        }}
      />
    );
  }

  // Certification Tests Page
  if (currentPage === 'certification') {
    return (
      <CertificationTestsPage
        onBack={() => setCurrentPage('landing')}
        onTestSelect={(test) => {
          setSchoolType('international');
          setUserRole('student');
          setIsCertificationMode(true);
          setSelectedCurriculum(test);
          setCurrentPage('main');
        }}
      />
    );
  }

  // International School Page
  if (currentPage === 'international') {
    return (
      <InternationalSchoolPage
        onBack={() => setCurrentPage('landing')}
        onSubjectSelect={(subject) => {
          setSchoolType('international');
          setUserRole('student');
          setIsCertificationMode(false);
          setSelectedCurriculum(subject);
          setCurrentPage('main');
        }}
        onKoreanSchoolClick={() => setCurrentPage('korean')}
        onCertificationClick={() => setCurrentPage('certification')}
      />
    );
  }

  // Korean School Page
  if (currentPage === 'korean') {
    return (
      <KoreanSchoolPage
        onBack={() => setCurrentPage('landing')}
        onSubjectSelect={(subject) => {
          setSchoolType('korean');
          setUserRole('student');
          setIsCertificationMode(false);
          setSelectedCurriculum(subject);
          setCurrentPage('main');
        }}
        onInternationalSchoolClick={() => setCurrentPage('international')}
        onCertificationClick={() => setCurrentPage('certification')}
      />
    );
  }

  // LMS App
  if (currentPage === 'lms') {
    return (
      <div>
        <div className="fixed top-3 right-40 sm:top-4 sm:right-48 z-50 space-x-2 flex">
          <Button
            onClick={() => {
              setCurrentPage('main');
              setLmsSelectedMenu('dashboard');
            }}
            variant="outline"
            className="bg-white shadow-lg text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-3 min-h-10 sm:min-h-12"
          >
            <span className="hidden sm:inline">서준 01 사이트</span>
            <span className="sm:hidden">서준01</span>
          </Button>
          <Button
            onClick={() => setCurrentPage('landing')}
            variant="outline"
            className="bg-purple-50 border-purple-200 text-purple-700 shadow-lg text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-3 min-h-10 sm:min-h-12"
          >
            <span className="hidden sm:inline">홈으로</span>
            <span className="sm:hidden">홈</span>
          </Button>
        </div>
        <LMSApp initialSelectedMenu={lmsSelectedMenu} />
      </div>
    );
  }

  // Component3 Page (TOEFL)
  if (currentPage === 'component3') {
    return <Component3Page onClose={() => setCurrentPage('main')} />;
  }

  // Component4 Page (SAT)
  if (currentPage === 'component4') {
    return <Component4Page onClose={() => setCurrentPage('main')} />;
  }

  // Main App
  const handleUploadClick = () => {
    setLmsSelectedMenu('upload');
    setCurrentPage('lms');
  };

  const handleComponent3Click = () => {
    setCurrentPage('component3');
  };

  const handleComponent4Click = () => {
    setCurrentPage('component4');
  };

  return (
    <div>
      <MainApp 
        onUploadClick={handleUploadClick}
        onBackToLanding={() => setCurrentPage('landing')}
        onLMSClick={() => {
          setLmsSelectedMenu('dashboard');
          setCurrentPage('lms');
        }}
        onComponent3Click={handleComponent3Click}
        onComponent4Click={handleComponent4Click}
        schoolType={schoolType}
        userRole={userRole}
        onUserRoleChange={setUserRole}
        isCertificationMode={isCertificationMode}
        initialSubject={selectedCurriculum}
      />
    </div>
  );
}
```

---

## 2. 메인 앱 구조

### `/MainApp.tsx`
```tsx
import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent";
import { ContentRightSidebar } from "./components/ContentRightSidebar";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";

interface MainAppProps {
  onUploadClick?: () => void;
  onBackToLanding?: () => void;
  onLMSClick?: () => void;
  onComponent3Click?: () => void;
  onComponent4Click?: () => void;
  schoolType: 'korean' | 'international' | null;
  userRole?: 'student' | 'teacher' | null;
  onUserRoleChange?: (role: 'student' | 'teacher') => void;
  isCertificationMode?: boolean;
  initialSubject?: string | null;
}

export default function MainApp({ onUploadClick, onBackToLanding, onLMSClick, onComponent3Click, onComponent4Click, schoolType, userRole, onUserRoleChange, isCertificationMode, initialSubject }: MainAppProps) {
  const getDefaultSubject = () => {
    if (initialSubject) return initialSubject;
    if (isCertificationMode) return "TOEFL";
    if (schoolType === 'international') return "GPA";
    return "국어";
  };
  
  const [selectedSubject, setSelectedSubject] = useState(getDefaultSubject());
  const [selectedCategory, setSelectedCategory] = useState(
    isCertificationMode ? "Reading" : ""
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const initialTab = schoolType === 'korean' ? "국어" : (schoolType === 'international' ? "Subject" : "전체보기");
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update category when subject changes in certification mode
  useEffect(() => {
    if (isCertificationMode) {
      const categoryMap: { [key: string]: string } = {
        "TOEFL": "Reading",
        "SAT": "Math",
        "ACT": "English",
        "IELTS": "Listening",
        "TOEIC": "Listening"
      };
      setSelectedCategory(categoryMap[selectedSubject] || "Reading");
      setSelectedSubCategory("");
    }
  }, [selectedSubject, isCertificationMode]);

  useEffect(() => {
    setSelectedSubCategory("");
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Header 
        selectedSubject={selectedSubject}
        onSubjectChange={(subject) => {
          setSelectedSubject(subject);
        }}
        onUploadClick={onUploadClick}
        onHomeClick={onBackToLanding}
        onLMSClick={onLMSClick}
        schoolType={schoolType}
        userRole={userRole}
        onUserRoleChange={onUserRoleChange}
        isCertificationMode={isCertificationMode}
      />
      
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 max-w-none">
          <div className={`lg:flex-shrink-0 ${(activeTab === "Exam Questions" || activeTab === "Key Notes" || activeTab === "Practice Test" || activeTab === "Past Papers" || activeTab === "Subject" || activeTab === "전체보기" || activeTab === "1타 강사님들") && schoolType === 'international' ? 'lg:w-48' : isCertificationMode ? 'lg:w-72' : 'lg:w-72'}`}>
            <Sidebar 
              selectedSubject={selectedSubject}
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              onCategoryChange={setSelectedCategory}
              onSubCategoryChange={setSelectedSubCategory}
              schoolType={schoolType}
              isCertificationMode={isCertificationMode}
            />
          </div>
          <div className="flex-1 min-w-0">
            <MainContent 
              selectedSubject={selectedSubject}
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              schoolType={schoolType}
              isCertificationMode={isCertificationMode}
              onActiveTabChange={setActiveTab}
              onComponent3Click={onComponent3Click}
              onComponent4Click={onComponent4Click}
            />
          </div>
        </div>
      </div>
      
      {schoolType === 'international' && (activeTab === "Key Notes" || activeTab === "Exam Questions" || activeTab === "Practice Test" || activeTab === "Past Papers") && (
        <ContentRightSidebar />
      )}
      
      <Footer onLMSClick={onLMSClick} />
      <Toaster />
    </div>
  );
}
```

### `/LMSApp.tsx`
```tsx
import { useState, useEffect } from "react";
import LMSHeader from "./components/LMS/LMSHeader";
import LMSSidebar from "./components/LMS/LMSSidebar";
import LMSMainContent from "./components/LMS/LMSMainContent";
import LMSFooter from "./components/LMS/LMSFooter";
import { Toaster } from "./components/ui/sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  subscriptionPeriod: '1month' | '3months' | '6months' | '1year';
  subscriptionStart: string;
  subscriptionEnd: string;
  status: 'active' | 'inactive' | 'expired';
}

interface LMSAppProps {
  initialSelectedMenu?: string;
}

export default function LMSApp({ initialSelectedMenu = "dashboard" }: LMSAppProps) {
  const [selectedMenu, setSelectedMenu] = useState(initialSelectedMenu);
  const [selectedSubject, setSelectedSubject] = useState("국어");

  useEffect(() => {
    setSelectedMenu(initialSelectedMenu);
  }, [initialSelectedMenu]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LMSHeader />
      
      <div className="flex-1 flex">
        <LMSSidebar 
          selectedMenu={selectedMenu}
          onMenuSelect={setSelectedMenu}
        />
        
        <div className="flex-1 flex flex-col">
          <LMSMainContent 
            selectedMenu={selectedMenu}
            selectedSubject={selectedSubject}
            onSubjectSelect={setSelectedSubject}
            onMenuSelect={setSelectedMenu}
          />
        </div>
      </div>
      
      <LMSFooter />
      <Toaster />
    </div>
  );
}
```

---

## 3. Supabase 설정

### `/utils/supabase/info.tsx`
```tsx
/* AUTOGENERATED FILE - DO NOT EDIT CONTENTS */

export const projectId = "rpxmiyieukfuyhldqdto"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJweG1peWlldWtmdXlobGRxZHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzkxMTksImV4cCI6MjA3MjYxNTExOX0.H3lyRcpK6d3z24Y_ZgOOCoZ5n6U3WiZF1qZY3LNlYjA"
```

### `/supabase/functions/server/index.tsx`
```tsx
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
```

---

## 4. API 클라이언트

### `/utils/vocaApi.ts`
```tsx
// Voca API - Supabase 서버와 통신
import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7db3bef3`;

interface VocaWord {
  id: string;
  exam: 'TOEFL' | 'SAT' | 'IELTS' | 'ACT' | 'TOEIC';
  day: number;
  english: string;
  korean: string;
  definition?: string;
  synonyms: string;
}

interface DayNameMapping {
  [exam: string]: {
    [day: number]: string;
  };
}

// 모든 단어 조회
export async function fetchVocaWords(): Promise<VocaWord[]> {
  try {
    const response = await fetch(`${API_BASE}/voca/words`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch words: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.words || [];
  } catch (error) {
    console.error('Error fetching voca words:', error);
    throw error;
  }
}

// 단어 저장 (전체 교체)
export async function saveVocaWords(words: VocaWord[]): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/voca/words`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ words }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to save words: ${errorData.error || response.statusText}`);
    }

    console.log('Successfully saved voca words to server');
  } catch (error) {
    console.error('Error saving voca words:', error);
    throw error;
  }
}

// 단어 일괄 추가
export async function bulkAddVocaWords(words: VocaWord[]): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/voca/words/bulk-add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ words }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to bulk add words: ${errorData.error || response.statusText}`);
    }

    console.log('Successfully bulk added words to server');
  } catch (error) {
    console.error('Error bulk adding words:', error);
    throw error;
  }
}

// 단어 삭제
export async function deleteVocaWord(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/voca/words/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to delete word: ${errorData.error || response.statusText}`);
    }

    console.log('Successfully deleted word from server');
  } catch (error) {
    console.error('Error deleting word:', error);
    throw error;
  }
}

// 단어 수정
export async function updateVocaWord(id: string, word: Partial<VocaWord>): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/voca/words/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ word }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update word: ${errorData.error || response.statusText}`);
    }

    console.log('Successfully updated word on server');
  } catch (error) {
    console.error('Error updating word:', error);
    throw error;
  }
}

// Day 이름 조회
export async function fetchDayNames(): Promise<DayNameMapping> {
  try {
    const response = await fetch(`${API_BASE}/voca/day-names`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch day names: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.dayNames || {};
  } catch (error) {
    console.error('Error fetching day names:', error);
    throw error;
  }
}

// Day 이름 저장
export async function saveDayNames(dayNames: DayNameMapping): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/voca/day-names`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ dayNames }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to save day names: ${errorData.error || response.statusText}`);
    }

    console.log('Successfully saved day names to server');
  } catch (error) {
    console.error('Error saving day names:', error);
    throw error;
  }
}
```

### `/utils/lmsApi.ts`
```tsx
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
```

---

## 5. 스타일 설정

### `/styles/globals.css`
```css
@custom-variant dark (&:is(.dark *));

:root {
  --font-size: 14px;
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --card: #ffffff;
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: #030213;
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.95 0.0058 264.53);
  --secondary-foreground: #030213;
  --muted: #ececf0;
  --muted-foreground: #717182;
  --accent: #e9ebef;
  --accent-foreground: #030213;
  --destructive: #d4183d;
  --destructive-foreground: #ffffff;
  --border: rgba(0, 0, 0, 0.1);
  --input: transparent;
  --input-background: #f3f3f5;
  --switch-background: #cbced4;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: #030213;
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-input-background: var(--input-background);
  --color-switch-background: var(--switch-background);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
  }
}

@layer base {
  :where(:not(:has([class*=" text-"]), :not(:has([class^="text-"])))) {
    h1 {
      font-size: var(--text-2xl);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    h2 {
      font-size: var(--text-xl);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    h3 {
      font-size: var(--text-lg);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    h4 {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    p {
      font-size: var(--text-base);
      font-weight: var(--font-weight-normal);
      line-height: 1.5;
    }

    label {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    button {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    input {
      font-size: var(--text-base);
      font-weight: var(--font-weight-normal);
      line-height: 1.5;
    }
  }
}

html {
  font-size: var(--font-size);
}
```

---

## 6. API 엔드포인트 목록

### Supabase Edge Functions (10개)

#### Voca 관리 (6개)
1. **GET** `/make-server-7db3bef3/voca/words` - 모든 단어 조회
2. **POST** `/make-server-7db3bef3/voca/words` - 단어 저장 (전체 교체)
3. **GET** `/make-server-7db3bef3/voca/day-names` - Day 이름 매핑 조회
4. **POST** `/make-server-7db3bef3/voca/day-names` - Day 이름 매핑 저장
5. **POST** `/make-server-7db3bef3/voca/words/bulk-add` - 단어 일괄 추가
6. **DELETE** `/make-server-7db3bef3/voca/words/:id` - 특정 단어 삭제
7. **PUT** `/make-server-7db3bef3/voca/words/:id` - 단어 수정

#### LMS 관리 (4개)
8. **GET** `/make-server-7db3bef3/lms/materials` - 모든 업로드 자료 조회
9. **POST** `/make-server-7db3bef3/lms/materials` - 자료 저장
10. **GET** `/make-server-7db3bef3/lms/categories` - 카테고리 커스텀 이름 조회
11. **POST** `/make-server-7db3bef3/lms/categories` - 카테고리 커스텀 이름 저장

---

## 7. 프로젝트 구조

```
/
├── App.tsx                      # 메인 라우팅
├── index.tsx                    # 엔트리 포인트
├── MainApp.tsx                  # 학생용 메인 앱
├── LMSApp.tsx                   # LMS 관리 시스템
├── LandingPage.tsx              # 랜딩 페이지
├── KoreanSchoolPage.tsx         # 한국학교 선택 페이지
├── InternationalSchoolPage.tsx  # 국제학교 선택 페이지
├── CertificationTestsPage.tsx   # 인증시험 선택 페이지
├── Component3Page.tsx           # TOEFL 페이지
├── Component4Page.tsx           # SAT 페이지
│
├── styles/
│   └── globals.css              # 전역 스타일
│
├── components/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── MainContent.tsx
│   ├── Footer.tsx
│   ├── VocaPage.tsx            # 어휘 시험
│   ├── VocaManagement.tsx      # 단어 관리
│   ├── WordTest.tsx            # 단어 테스트
│   ├── vocaWordSets.ts         # 7,500개 단어 데이터
│   │
│   ├── LMS/
│   │   ├── LMSHeader.tsx
│   │   ├── LMSSidebar.tsx
│   │   ├── LMSMainContent.tsx
│   │   ├── LMSDashboard.tsx
│   │   ├── LMSContentManagement.tsx
│   │   ├── LMSCategoryManagement.tsx
│   │   ├── LMSUpload.tsx
│   │   └── ...
│   │
│   └── ui/                     # Shadcn UI 컴포넌트
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...
│
├── utils/
│   ├── supabase/
│   │   └── info.tsx            # Supabase 프로젝트 정보
│   ├── vocaApi.ts              # Voca API 클라이언트
│   └── lmsApi.ts               # LMS API 클라이언트
│
└── supabase/
    └── functions/
        └── server/
            ├── index.tsx        # Hono 서버 (10개 API)
            └── kv_store.tsx     # KV Store 유틸리티
```

---

## 8. 데이터베이스 구조

### KV Store 키 목록

1. **`nstudy_voca_words`** - 7,500개 어휘 데이터
   ```typescript
   {
     id: string;
     exam: 'TOEFL' | 'SAT' | 'IELTS' | 'ACT' | 'TOEIC';
     day: number;
     english: string;
     korean: string;
     definition?: string;
     synonyms: string;
   }[]
   ```

2. **`nstudy_voca_day_names`** - Day 커스텀 이름 매핑
   ```typescript
   {
     [exam: string]: {
       [day: number]: string;
     };
   }
   ```

3. **`nstudy_lms_materials`** - LMS 업로드 자료
   ```typescript
   {
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
     previewFileData?: { ... };
     source: 'content-management' | 'upload-page';
   }[]
   ```

4. **`nstudy_lms_categories`** - 카테고리 커스텀 이름
   ```typescript
   {
     id: string;
     originalName: string;
     customName: string;
     schoolType: 'korean' | 'international' | 'certification';
     subject: string;
     level: string;
   }[]
   ```

---

## 9. 주요 기능 상세

### 9.1 어휘 시스템
- 5개 시험 지원: TOEFL, SAT, IELTS, TOEIC, ACT
- Fisher-Yates 셔플 알고리즘으로 무작위 배열
- 각 시험별 DAY 1-30 (250개씩)
- 실시간 Supabase 동기화
- Day 커스텀 이름 설정 가능

### 9.2 LMS 시스템
- 콘텐츠 관리 (업로드/수정/삭제)
- 카테고리 관리 (커스텀 이름)
- 인증시험 섹션 (SAT, TOEFL, ACT, IELTS)
- 파일 뷰어 (PDF/이미지/텍스트)
- 비밀번호 보안
- 다운로드 카운트 추적

### 9.3 시험 기능
- 객관식 문제 업로드
- 미니 시험 생성
- QuestionPreviewModal
- 자동 채점
- 결과 리포트

### 9.4 성능 최적화
- React.lazy() + Suspense
- 페이지네이션 (20개/페이지)
- Supabase 클라우드 저장소
- 메모리 효율적 렌더링

---

## 10. 설치 및 실행

### 필수 패키지
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "latest",
    "sonner": "^2.0.3",
    "@hono/hono": "latest"
  }
}
```

### 환경 변수
```
SUPABASE_URL=https://rpxmiyieukfuyhldqdto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=[보안 키]
SUPABASE_DB_URL=[데이터베이스 URL]
```

### 실행
```bash
npm install
npm run dev
```

---

## 11. 주요 변경 이력

### v1.0 - 초기 구현
- Figma 디자인 → React 변환
- 한국학교/국제학교 메뉴 시스템
- 밝은 청록색 테마 (#00bcd4)

### v2.0 - LMS 시스템
- 콘텐츠/카테고리 관리
- 인증시험 섹션 추가
- localStorage 기반 데이터 관리

### v3.0 - 어휘 시스템
- 7,500개 단어 데이터
- Fisher-Yates 셔플
- 어휘 시험 출제 기능

### v4.0 - Supabase 마이그레이션
- localStorage → Supabase 클라우드
- 10개 API 엔드포인트 구현
- 실시간 동기화

### v4.1 - 최적화
- "마이콘텐츠룸" → "VIP 콘텐츠룸"
- 페이지네이션 구현 (20개/페이지)
- 메모리 부족 에러 해결

---

## 12. 문의 및 지원

프로젝트 ID: **rpxmiyieukfuyhldqdto**  
Supabase Dashboard: https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto

**Supabase Free 플랜 제한사항:**
- 500MB 데이터베이스 저장 공간
- 1주일 비활성 시 프로젝트 일시 중지
- API 요청 월간 제한

---

## 완료! ✅

이 문서는 N Study Hub 프로젝트의 모든 핵심 코드를 포함하고 있습니다.  
다른 곳에 복사하여 사용하실 수 있습니다!
