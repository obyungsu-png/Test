// 통합 데이터 관리 시스템
import * as lmsApi from '../../utils/lmsApi';
import { generateSampleMaterials } from '../../utils/sampleDataGenerator';

// In-flight promise deduplication — prevents concurrent calls from hammering the server
let materialsInflight: Promise<UploadedMaterial[]> | null = null;
let categoriesInflight: Promise<CategoryData[]> | null = null;

export interface CategoryData {
  id: string;
  originalName: string;
  customName: string;
  schoolType: 'korean' | 'international' | 'certification';
  subject: string;
  level: string;
}

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

// 카테고리 이름 관리 - Supabase 통합
export const getCategoryCustomNames = async (): Promise<CategoryData[]> => {
  if (categoriesInflight) {
    return categoriesInflight;
  }
  
  categoriesInflight = new Promise(async (resolve, reject) => {
    try {
      const categories = await lmsApi.fetchCategories();
      resolve(categories);
    } catch (error) {
      console.error('Failed to fetch categories from server, using localStorage fallback:', error);
      const stored = localStorage.getItem('categoryCustomNames');
      resolve(stored ? JSON.parse(stored) : []);
    } finally {
      categoriesInflight = null;
    }
  });
  
  return categoriesInflight;
};

export const setCategoryCustomName = async (
  schoolType: 'korean' | 'international' | 'certification',
  subject: string,
  level: string,
  originalName: string,
  customName: string
) => {
  const categories = await getCategoryCustomNames();
  const id = `${schoolType}-${subject}-${level}-${originalName}`;
  
  const existingIndex = categories.findIndex(cat => cat.id === id);
  const categoryData: CategoryData = {
    id,
    originalName,
    customName,
    schoolType,
    subject,
    level
  };
  
  if (existingIndex >= 0) {
    categories[existingIndex] = categoryData;
  } else {
    categories.push(categoryData);
  }
  
  try {
    await lmsApi.saveCategories(categories);
    // 로컬에도 백업 저장
    localStorage.setItem('categoryCustomNames', JSON.stringify(categories));
  } catch (error) {
    console.error('Failed to save categories to server:', error);
    // 로컬에만 저장
    localStorage.setItem('categoryCustomNames', JSON.stringify(categories));
  }
};

export const getCategoryCustomName = async (
  schoolType: 'korean' | 'international' | 'certification',
  subject: string,
  level: string,
  originalName: string
): Promise<string> => {
  const categories = await getCategoryCustomNames();
  const id = `${schoolType}-${subject}-${level}-${originalName}`;
  const category = categories.find(cat => cat.id === id);
  return category?.customName || originalName;
};

// 업로드된 자료 관리 - Supabase 통합
export const getUploadedMaterials = async (): Promise<UploadedMaterial[]> => {
  if (materialsInflight) {
    return materialsInflight;
  }
  
  materialsInflight = new Promise(async (resolve, reject) => {
    try {
      const serverMaterials = await lmsApi.fetchMaterials();
      
      // 서버에 데이터가 없으면 샘플 데이터 자동 생성
      if (serverMaterials.length === 0) {
        console.log('📦 No materials found on server, generating sample data...');
        const sampleMaterials = generateSampleMaterials();
        await lmsApi.saveMaterials(sampleMaterials);
        console.log(`✅ Generated and saved ${sampleMaterials.length} sample materials`);
        
        // 로컬에도 백업 저장
        localStorage.setItem('uploads', JSON.stringify(sampleMaterials));
        
        return resolve(sampleMaterials);
      }
      
      // 로컬에도 백업 저장
      localStorage.setItem('uploads', JSON.stringify(serverMaterials));
      
      resolve(serverMaterials);
    } catch (error) {
      console.warn('[DataManager] Server fetch failed, using localStorage fallback:', (error as Error)?.message || error);
      const stored = localStorage.getItem('uploads');
      
      // localStorage도 비어있으면 샘플 생성
      if (!stored || JSON.parse(stored).length === 0) {
        const sampleMaterials = generateSampleMaterials();
        localStorage.setItem('uploads', JSON.stringify(sampleMaterials));
        return resolve(sampleMaterials);
      }
      
      resolve(stored ? JSON.parse(stored) : []);
    } finally {
      materialsInflight = null;
    }
  });
  
  return materialsInflight;
};

export const addUploadedMaterial = async (material: UploadedMaterial) => {
  const materials = await getUploadedMaterials();
  materials.push(material);
  
  try {
    await lmsApi.saveMaterials(materials);
    // 로컬에도 백업 저장
    localStorage.setItem('uploads', JSON.stringify(materials));
  } catch (error) {
    console.error('Failed to save materials to server:', error);
    // 로컬에만 저장
    localStorage.setItem('uploads', JSON.stringify(materials));
  }
  
  // Trigger storage event for real-time updates across components
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('materialsUpdated'));
};

export const updateUploadedMaterial = async (id: string, updates: Partial<UploadedMaterial>) => {
  const materials = await getUploadedMaterials();
  const index = materials.findIndex(m => m.id === id);
  if (index >= 0) {
    materials[index] = { ...materials[index], ...updates };
    
    try {
      await lmsApi.saveMaterials(materials);
      // 로컬에도 백업 저장
      localStorage.setItem('uploads', JSON.stringify(materials));
    } catch (error) {
      console.error('Failed to save materials to server:', error);
      // 로컬에만 저장
      localStorage.setItem('uploads', JSON.stringify(materials));
    }
    
    // Trigger storage event for real-time updates across components
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('materialsUpdated'));
  }
};

export const deleteUploadedMaterial = async (id: string) => {
  const materials = await getUploadedMaterials();
  const filtered = materials.filter(m => m.id !== id);
  
  try {
    await lmsApi.saveMaterials(filtered);
    // 로컬에도 백업 저장
    localStorage.setItem('uploads', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to save materials to server:', error);
    // 로컬에만 저장
    localStorage.setItem('uploads', JSON.stringify(filtered));
  }
  
  // Trigger storage event for real-time updates across components
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('materialsUpdated'));
};

// 학교 타입별 과목 구조 가져오기
export const getSubjectStructure = (schoolType: 'korean' | 'international' | 'certification') => {
  const koreanSubjects = {
    "국어": {
      "초등국어": ["초등국어1-1", "초등국어1-2", "초등국어2-1", "초등국어2-2", "초등국어3-1", "초등국어3-2", "초등국어4-1", "초등국어4-2", "초등국어5-1", "초등국어5-2", "초등국어6-1", "초등국어6-2"],
      "중등국어": ["중등국어1-1(개정)", "중등국어1-2(개정)", "중등국어2-1", "중등국어2-2", "중등국어3-1", "중등국어3-2"],
      "고등국어": ["공통국어1(개정)", "공통국어2(개정)", "문학(출판사별)", "언어와매체", "문학(작품별감상)"]
    },
    "영어": {
      "초등영어": ["초등영어1-1", "초등영어1-2", "초등영어2-1", "초등영어2-2", "초등영어3-1", "초등영어3-2", "초등영어4-1", "초등영어4-2", "초등영어5-1", "초등영어5-2", "초등영어6-1", "초등영어6-2"],
      "중등영어": ["중등영어1-1", "중등영어1-2", "중등영어2-1", "중등영어2-2", "중등영어3-1", "중등영어3-2"],
      "고등영어": ["고등영어1-1", "고등영어1-2", "고등영어2-1", "고등영어2-2", "고등영어3-1", "고등영어3-2"]
    },
    "수학": {
      "초등수학": ["초등수학1-1", "초등수학1-2", "초등수학2-1", "초등수학2-2", "초등수학3-1", "초등수학3-2", "초등수학4-1", "초등수학4-2", "초등수학5-1", "초등수학5-2", "초등수학6-1", "초등수학6-2"],
      "중등수학": ["중등수학1-1", "중등수학1-2", "중등수학2-1", "중등수학2-2", "중등수학3-1", "중등수학3-2"],
      "고등수학": ["수학", "수학I", "수학II", "미적분", "확률과통계", "기하"]
    },
    "과학": {
      "초등과학": ["초등과학1-1", "초등과학1-2", "초등과학2-1", "초등과학2-2", "초등과학3-1", "초등과학3-2", "초등과학4-1", "초등과학4-2", "초등과학5-1", "초등과학5-2", "초등과학6-1", "초등과학6-2"],
      "중등과학": ["중등과학1", "중등과학2", "중등과학3", "통합과학"],
      "고등과학": ["물리학I", "물리학II", "화학I", "화학II", "생명과학I", "생명과학II", "지구과학I", "지구과학II"]
    },
    "사회": {
      "초등사회": ["초등사회1-1", "초등사회1-2", "초등사회2-1", "초등사회2-2", "초등사회3-1", "초등사회3-2", "초등사회4-1", "초등사회4-2", "초등사회5-1", "초등사회5-2", "초등사회6-1", "초등사회6-2"],
      "중등사회": ["중등사회1", "중등사회2", "중등역사1", "중등역사2"],
      "고등사회": ["한국지리", "세계지리", "한국사", "세계사", "정치와법", "경제", "사회문화"]
    },
    "서류전": {
      "대학별 전형": ["학생부종합전형", "학생부교과전형", "논술전형", "실기전형"],
      "준비서류": ["자기소개서", "추천서", "포트폴리오", "활동보고서"],
      "면접준비": ["면접기출문제", "모의면접", "발표준비", "토론준비"]
    },
    "특례시험": {
      "해외고 특례": ["해외고 특례시험", "귀국자 특례", "외국인 특례"],
      "국제학교 특례": ["국제학교 특례시험", "IB Diploma", "AP Portfolio"],
      "어학시험": ["TOEFL", "IELTS", "TEPS", "TOEIC"]
    }
  };

  const internationalSubjects = {
    "GPA": {
      "Grade 9": ["English 9", "Math 9", "Science 9", "Social Studies 9", "World Language 9"],
      "Grade 10": ["English 10", "Geometry", "Biology", "World History", "World Language 10"],
      "Grade 11": ["English 11", "Algebra II", "Chemistry", "US History", "World Language 11"],
      "Grade 12": ["English 12", "Pre-Calculus", "Physics", "Government", "World Language 12"]
    },
    "AP": {
      "STEM": ["Mathematics", "Biology", "Chemistry", "Physics", "Environmental Science"],
      "Humanities": ["Business Management", "Economics", "Psychology"],
      "Languages": ["English", "Spanish B", "French B", "English B"]
    },
    "IB": {
      "Group 1": ["IB English A", "IB Literature", "IB Language A"],
      "Group 2": ["IB Spanish B", "IB French B", "IB Mandarin B"],
      "Group 3": ["IB History", "IB Economics", "IB Psychology", "IB Geography"],
      "Group 4": ["IB Physics", "IB Chemistry", "IB Biology", "IB Environmental Science"],
      "Group 5": ["IB Mathematics AA", "IB Mathematics AI"],
      "Group 6": ["IB Visual Arts", "IB Music", "IB Theatre"]
    },
    "A-level": {
      "Mathematics": ["Pure Mathematics 1", "Pure Mathematics 2", "Statistics 1", "Mechanics 1"],
      "Sciences": ["Physics A-level", "Chemistry A-level", "Biology A-level"],
      "Humanities": ["History A-level", "Geography A-level", "Economics A-level", "Psychology A-level"],
      "Languages": ["English Literature A-level", "French A-level", "Spanish A-level", "German A-level"],
      "Arts": ["Art & Design A-level", "Music A-level", "Drama & Theatre A-level"]
    },
    "AS": {
      "Mathematics": ["AS Pure Mathematics", "AS Statistics", "AS Mechanics"],
      "Sciences": ["AS Physics", "AS Chemistry", "AS Biology"],
      "Humanities": ["AS History", "AS Geography", "AS Economics", "AS Psychology"],
      "Languages": ["AS English Literature", "AS French", "AS Spanish", "AS German"],
      "Arts": ["AS Art & Design", "AS Music", "AS Drama & Theatre"]
    },
    "IGCSE": {
      "Core Subjects": ["IGCSE English Language", "IGCSE Mathematics", "IGCSE Sciences"],
      "Languages": ["IGCSE English Literature", "IGCSE French", "IGCSE Spanish", "IGCSE Mandarin"],
      "Humanities": ["IGCSE History", "IGCSE Geography", "IGCSE Business Studies", "IGCSE Economics"],
      "Arts & Technology": ["IGCSE Art & Design", "IGCSE Music", "IGCSE Drama", "IGCSE Computer Science"]
    },
    "Writing": {
      "Writing with Speaking (basic)": ["Essay Structure", "Research Papers", "Citations & References", "Academic Style"],
      "Writing with Grammar (middle)": ["Fiction Writing", "Poetry", "Short Stories", "Character Development"],
      "Writing with Reading (high intermediate)": ["Formal Letters", "Reports", "Proposals", "Email Communication"],
      "Homework Teacher (all)": ["Instructions", "Manuals", "Documentation", "Scientific Writing"]
    }
  };

  const certificationSubjects = {
    "SAT": {
      "Reading & Writing": ["Reading Comprehension", "Grammar & Usage", "Vocabulary in Context", "Rhetoric & Analysis"],
      "Math": ["Algebra", "Advanced Math", "Problem Solving", "Data Analysis", "Geometry & Trigonometry"],
      "Essay": ["Essay Structure", "Evidence & Analysis", "Argument Development", "Writing Practice"]
    },
    "ACT": {
      "English": ["Grammar & Usage", "Sentence Structure", "Punctuation", "Rhetorical Skills"],
      "Math": ["Pre-Algebra", "Elementary Algebra", "Intermediate Algebra", "Coordinate Geometry", "Plane Geometry", "Trigonometry"],
      "Reading": ["Key Ideas", "Craft & Structure", "Integration of Knowledge", "Reading Strategies"],
      "Science": ["Data Representation", "Research Summaries", "Conflicting Viewpoints"],
      "Writing (Optional)": ["Essay Planning", "Argument Development", "Writing Practice"]
    },
    "TOEFL": {
      "Reading": ["Academic Passages", "Vocabulary", "Inference Questions", "Main Ideas", "Details"],
      "Listening": ["Lectures", "Conversations", "Note-taking Skills", "Academic Listening"],
      "Speaking": ["Independent Tasks", "Integrated Tasks", "Response Organization", "Pronunciation"],
      "Writing": ["Integrated Writing", "Independent Writing", "Essay Structure", "Grammar & Vocabulary"]
    },
    "IELTS": {
      "Listening": ["Section 1 - Social", "Section 2 - Monologue", "Section 3 - Academic", "Section 4 - Lecture"],
      "Reading": ["Academic Reading", "General Training", "Matching Headings", "True/False/Not Given", "Summary Completion"],
      "Writing": ["Task 1 - Graphs/Charts", "Task 1 - Letters", "Task 2 - Essays", "Writing Practice"],
      "Speaking": ["Part 1 - Introduction", "Part 2 - Long Turn", "Part 3 - Discussion", "Fluency & Coherence"]
    }
  };

  if (schoolType === 'certification') {
    return certificationSubjects;
  }
  return schoolType === 'international' ? internationalSubjects : koreanSubjects;
};

// 특정 학교 타입과 과목에 해당하는 업로드된 자료 필터링
export const getFilteredUploadedMaterials = async (
  schoolType: 'korean' | 'international' | 'certification',
  subject: string,
  category?: string
): Promise<UploadedMaterial[]> => {
  const materials = await getUploadedMaterials();
  
  // materials가 배열인지 확인
  if (!Array.isArray(materials)) {
    console.error('Materials is not an array:', materials);
    return [];
  }
  
  return materials.filter(material => {
    const matchesSchoolType = material.schoolType === schoolType;
    const matchesSubject = material.subject === subject;
    const matchesCategory = !category || material.category === category;
    // Only show materials from content management (not from upload page)
    const isFromContentManagement = material.source === 'content-management';
    
    return matchesSchoolType && matchesSubject && matchesCategory && isFromContentManagement;
  });
};