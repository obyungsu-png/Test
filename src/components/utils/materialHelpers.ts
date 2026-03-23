import { DEFAULT_CONTENT_BY_TAB, DEFAULT_TABS, CONTENT_BY_SUBJECT_AND_CATEGORY, INTERNATIONAL_CONTENT_BY_TAB, INTERNATIONAL_CONTENT_BY_SUBJECT_AND_CATEGORY, KOREAN_SCHOOL_TABS, INTERNATIONAL_SCHOOL_TABS, CERTIFICATION_TABS, CERTIFICATION_CONTENT_BY_TAB, CERTIFICATION_CONTENT_BY_SUBJECT_AND_CATEGORY } from "../constants/defaultContent";
import { getFilteredUploadedMaterials, getCategoryCustomName } from "./dataManager";

export const getDefaultContentByTab = (tabName: string, tabs: string[], schoolType?: 'korean' | 'international' | null, isCertificationMode?: boolean, selectedSubject?: string) => {
  const currentIndex = tabs.indexOf(tabName);
  
  if (isCertificationMode) {
    const originalTabName = CERTIFICATION_TABS[currentIndex] || tabName;
    const allContent = CERTIFICATION_CONTENT_BY_TAB[originalTabName] || [];
    
    // Filter content by selected subject
    if (selectedSubject) {
      return allContent.filter(item => item.title.includes(`[${selectedSubject}]`) || item.title.includes('[All Skills]'));
    }
    
    return allContent;
  } else if (schoolType === 'international') {
    const originalTabName = INTERNATIONAL_SCHOOL_TABS[currentIndex] || tabName;
    return INTERNATIONAL_CONTENT_BY_TAB[originalTabName] || [];
  } else {
    const originalTabName = KOREAN_SCHOOL_TABS[currentIndex] || tabName;
    return DEFAULT_CONTENT_BY_TAB[originalTabName] || [];
  }
};

export const getContentBySubjectAndCategory = (
  selectedSubject: string,
  selectedCategory: string,
  tabName: string,
  isCertificationMode?: boolean,
  selectedSubCategory?: string,
  schoolType?: 'korean' | 'international' | null
) => {
  // 인증시험 모드인 경우 인증시험 콘텐츠 사용
  if (isCertificationMode) {
    const subjectContent = CERTIFICATION_CONTENT_BY_SUBJECT_AND_CATEGORY[selectedSubject];
    if (!subjectContent) return [];
    
    const categoryContent = subjectContent[selectedCategory];
    if (!categoryContent) return [];
    
    // 세부 카테고리가 선택된 경우
    if (selectedSubCategory && categoryContent[selectedSubCategory]) {
      const subCategoryContent = categoryContent[selectedSubCategory];
      return subCategoryContent[tabName] || [];
    }
    
    return categoryContent[tabName] || [];
  }
  
  // 국제학교 모드인 경우 국제학교 콘텐츠 사용
  if (schoolType === 'international') {
    const subjectContent = INTERNATIONAL_CONTENT_BY_SUBJECT_AND_CATEGORY[selectedSubject];
    if (!subjectContent) return [];
    
    const categoryContent = subjectContent[selectedCategory];
    if (!categoryContent) return [];
    
    return categoryContent[tabName] || [];
  }
  
  // 한국학교 모드인 경우 기존 콘텐츠 사용
  const subjectContent = CONTENT_BY_SUBJECT_AND_CATEGORY[selectedSubject];
  if (!subjectContent) return [];
  
  const categoryContent = subjectContent[selectedCategory];
  if (!categoryContent) return [];
  
  return categoryContent[tabName] || [];
};

export const getFilteredMaterials = async (
  activeTab: string,
  tabs: string[],
  uploadedMaterials: any[],
  selectedSubject: string,
  selectedCategory: string,
  schoolType?: 'korean' | 'international' | null,
  isCertificationMode?: boolean,
  selectedSubCategory?: string
) => {
  let defaultMaterials = [];
  
  // 카테고리가 선택된 경우 해당 카테고리의 콘텐츠 사용
  if (selectedCategory) {
    defaultMaterials = getContentBySubjectAndCategory(selectedSubject, selectedCategory, activeTab, isCertificationMode, selectedSubCategory, schoolType);
  } else {
    // 카테고리가 선택되지 않은 경우 기본 콘텐츠 사용
    defaultMaterials = getDefaultContentByTab(activeTab, tabs, schoolType, isCertificationMode, selectedSubject);
  }
  
  // Get original tab name for filtering uploaded materials
  const currentIndex = tabs.indexOf(activeTab);
  let baseTabs;
  if (isCertificationMode) {
    baseTabs = CERTIFICATION_TABS;
  } else {
    baseTabs = schoolType === 'international' ? INTERNATIONAL_SCHOOL_TABS : KOREAN_SCHOOL_TABS;
  }
  const originalTabName = baseTabs[currentIndex] || activeTab;
  
  // Use new data management system to get uploaded materials
  if (schoolType || isCertificationMode) {
    const uploadedMaterials = await getFilteredUploadedMaterials(schoolType || 'international', selectedSubject, selectedCategory);
    
    // Filter by content type (tab)
    const filteredUploads = uploadedMaterials.filter(upload => {
      return upload.contentType === originalTabName || originalTabName === "교과서 뽀개기" || originalTabName === "전체보기" || originalTabName === "국어" || originalTabName === "Subject";
    });

    // Convert uploaded materials to display format
    const uploadedForDisplay = filteredUploads.map(upload => ({
      title: upload.title,
      count: `[${upload.downloadCount || 0}]`,
      isNew: true,
      isUploaded: true,
      id: upload.id,
      password: upload.password,
      downloadCount: upload.downloadCount,
      uploadData: upload.uploadData,
      previewFileData: upload.previewFileData // ✨ 중요: previewFileData를 포함시킴
    }));

    return [...uploadedForDisplay, ...defaultMaterials];
  }

  return defaultMaterials;
};