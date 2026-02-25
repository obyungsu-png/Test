import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner@2.0.3";
import { Menu, Calculator, TestTube, Atom, Globe, Users, DollarSign, Leaf, Brain, BookOpen, Languages, ChevronRight, X } from "lucide-react";

import { InteractivePracticeTest } from "./InteractivePracticeTest";
import { ExamQuestionsViewer } from "./ExamQuestionsViewer";
import { KeyNotesViewer } from "./KeyNotesViewer";
import { PracticeTestViewer } from "./PracticeTestViewer";
import { MyContentRoom } from "./MyContentRoom";
import { VocaPage } from "./VocaPage";
import { getFilteredMaterials } from "./utils/materialHelpers";
import { getCategoryCustomName, updateUploadedMaterial } from "./utils/dataManager";
import { DEFAULT_TABS, KOREAN_SCHOOL_TABS, INTERNATIONAL_SCHOOL_TABS, CERTIFICATION_TABS, CERTIFICATION_CONTENT_BY_TAB, CERTIFICATION_CONTENT_BY_SUBJECT_AND_CATEGORY } from "./constants/defaultContent";
import { downloadFile, downloadDefaultFile, downloadAsWord } from "./utils/fileDownloader";
import { PasswordModal } from "./PasswordModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import imgRectangle8 from "figma:asset/f06e219f8e82f3e00e4ea8dc84754a43dfbaccff.png";
import imgRectangle9 from "figma:asset/fb55a08fd37dd174518db51afaac9f5839666a76.png";
import imgRectangle10 from "figma:asset/97e0b68ed147898447d011fa22aaf5a5dab556ff.png";
import authModalImg from "figma:asset/fbd4d05914babb85fcf6288863c6635471a8b4f7.png";

interface MainContentProps {
  selectedSubject: string;
  selectedCategory: string;
  selectedSubCategory?: string;
  schoolType: 'korean' | 'international' | null;
  isCertificationMode?: boolean;
  onActiveTabChange?: (tab: string) => void;
  onComponent3Click?: () => void;
  onComponent4Click?: () => void;
  onComponent5Click?: () => void;
}

// CategoryCard Component with hover effect
function CategoryCard({ category, index, onClick }: { category: any; index: number; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = category.icon;
  
  const iconColor = category.color === "#B3E5FC" ? "#0288D1" : category.color === "#FFE0B2" ? "#FF9800" : "#5E35B1";
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 group"
      style={{
        backgroundColor: isHovered ? category.color : '#F5F5F5',
        boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.08)'
      }}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div 
        className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
        style={{
          backgroundColor: 'white'
        }}
      >
        <Icon 
          className="w-7 h-7" 
          style={{ color: iconColor }} 
        />
      </motion.div>
      <h3 
        className="mb-1.5"
        style={{ color: '#000', fontWeight: 700 }}
      >
        {category.name}
      </h3>
      <p 
        className="text-xs transition-colors duration-300" 
        style={{ 
          color: isHovered ? iconColor : '#666',
          fontWeight: 700
        }}
      >
        {category.description}
      </p>
    </motion.button>
  );
}

export function MainContent({ selectedSubject, selectedCategory, selectedSubCategory, schoolType, isCertificationMode, onActiveTabChange, onComponent3Click, onComponent4Click, onComponent5Click }: MainContentProps) {
  const defaultTabs = isCertificationMode ? CERTIFICATION_TABS : 
                    (schoolType === 'international' ? INTERNATIONAL_SCHOOL_TABS : KOREAN_SCHOOL_TABS);
  const initialTab = schoolType === 'korean' ? "국어" : (schoolType === 'international' ? "Subject" : "전체보기");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20; // 한 페이지당 20개만 표시

  // Notify parent of active tab changes
  useEffect(() => {
    if (onActiveTabChange) {
      onActiveTabChange(activeTab);
    }
  }, [activeTab, onActiveTabChange]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPracticeTest, setShowPracticeTest] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [pendingDownloadMaterial, setPendingDownloadMaterial] = useState<any>(null);
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showMyContentRoom, setShowMyContentRoom] = useState(false);

  const [uploadedMaterials, setUploadedMaterials] = useState<any[]>([]);
  const [tabs, setTabs] = useState(defaultTabs);
  const [materials, setMaterials] = useState<any[]>([]);
  const [tabCounts, setTabCounts] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // 페이지별 materials 계산
  const totalPages = Math.ceil(materials.length / ITEMS_PER_PAGE);
  const paginatedMaterials = materials.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedSubject, selectedCategory]);

  // Load uploaded materials and custom tab names from localStorage
  useEffect(() => {
    // Use empty array since we're now using the new data management system
    setUploadedMaterials([]);
    
    const customTabs = JSON.parse(localStorage.getItem('customTabNames') || 'null');
    if (customTabs) {
      setTabs(customTabs);
    } else {
      setTabs(defaultTabs);
    }
  }, [schoolType]);

  // Load materials and tab counts together (optimized)
  useEffect(() => {
    let isMounted = true;
    
    const loadAllData = async () => {
      if (isLoading) return; // Prevent duplicate calls
      
      setIsLoading(true);
      
      try {
        // Load materials for active tab
        const loadedMaterials = await getFilteredMaterials(
          activeTab, 
          tabs, 
          uploadedMaterials, 
          selectedSubject, 
          selectedCategory, 
          schoolType, 
          isCertificationMode, 
          selectedSubCategory
        );
        
        if (isMounted) {
          setMaterials(loadedMaterials);
          
          // Calculate tab counts from loaded materials without additional API calls
          const counts: {[key: string]: number} = {};
          counts[activeTab] = loadedMaterials.length;
          
          // For other tabs, just set to 0 to avoid memory issues
          // They will be updated when user clicks on them
          tabs.forEach(tab => {
            if (tab !== activeTab && !counts[tab]) {
              counts[tab] = 0;
            }
          });
          
          setTabCounts(counts);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadAllData();
    
    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedSubject, selectedCategory, schoolType, isCertificationMode, selectedSubCategory]);

  // Update when new materials are uploaded or tab names are changed
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-render by setting a timestamp
      setUploadedMaterials([]);
      
      const customTabs = JSON.parse(localStorage.getItem('customTabNames') || 'null');
      if (customTabs) {
        setTabs(customTabs);
      } else {
        setTabs(defaultTabs);
      }
    };

    const handleMaterialsUpdated = () => {
      // Force re-render when materials are updated
      setUploadedMaterials([]);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('materialsUpdated', handleMaterialsUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('materialsUpdated', handleMaterialsUpdated);
    };
  }, []);

  const handleAuthSubmit = () => {
    if (password === "123456") {
      setShowAuthModal(false);
      setPassword("");
      toast.success("인증 성공! VIP 콘텐츠룸에 접근합니다.");
    } else {
      toast.error("비밀번호가 틀렸습니다.");
    }
  };

  const handleDownloadClick = (material: any) => {
    if (material.isUploaded) {
      // For uploaded materials, require password
      setPendingDownloadMaterial(material);
      setShowPasswordModal(true);
    } else {
      // For default materials, download info file directly
      const success = downloadDefaultFile(material.title);
      if (success) {
        toast.success(`"${material.title}" 자료를 다운로드합니다.`);
      } else {
        toast.error("다운로드 중 오류가 발생했습니다.");
      }
    }
  };

  const handlePasswordSubmit = async (inputPassword: string) => {
    if (!pendingDownloadMaterial) return;

    if (inputPassword === pendingDownloadMaterial.password) {
      // Password correct, download as Word file
      const uploadData = pendingDownloadMaterial.uploadData;
      
      if (uploadData && uploadData.fileData) {
        let success = false;
        
        // Check if it's a TXT file - convert to Word
        if (uploadData.fileType === 'text/plain' || uploadData.fileName?.toLowerCase().endsWith('.txt')) {
          try {
            // Decode the text content
            const base64Data = uploadData.fileData.split(',')[1];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const decoder = new TextDecoder('utf-8');
            const textContent = decoder.decode(bytes);
            
            // Download as Word document
            success = await downloadAsWord(textContent, pendingDownloadMaterial.title);
          } catch (error) {
            console.error('Error converting to Word:', error);
            success = false;
          }
        } else {
          // For other file types, download directly
          success = downloadFile(
            uploadData.fileData,
            uploadData.fileName,
            uploadData.fileType || 'application/octet-stream'
          );
        }
        
        if (success) {
          // Update download count
          updateUploadedMaterial(pendingDownloadMaterial.id, {
            downloadCount: (pendingDownloadMaterial.downloadCount || 0) + 1
          });
          
          // Save download record to localStorage
          const downloadRecord = {
            id: `download-${Date.now()}`,
            materialTitle: pendingDownloadMaterial.title,
            subject: selectedSubject,
            category: selectedCategory || activeTab,
            date: new Date().toISOString(),
            fileName: uploadData.fileName,
            fileType: uploadData.fileType,
            fileData: uploadData.fileData,
            type: 'download'
          };
          
          const existingRecords = JSON.parse(localStorage.getItem('myContentRecords') || '[]');
          existingRecords.unshift(downloadRecord);
          localStorage.setItem('myContentRecords', JSON.stringify(existingRecords));
          window.dispatchEvent(new Event('contentRecordsUpdated'));
          
          toast.success(`\"${pendingDownloadMaterial.title}\" 자료를 Word 파일로 다운로드합니다.`);
        } else {
          toast.error("파일 다운로드 중 오류가 발생했습니다.");
        }
      } else {
        toast.error("파일 데이터를 찾을 수 없습니다.");
      }
      
      setShowPasswordModal(false);
      setPendingDownloadMaterial(null);
    } else {
      toast.error("비밀번호가 올바르지 않습니다.");
    }
  };

  const handlePreviewClick = (material: any) => {
    console.log('Preview clicked for material:', material);
    console.log('Has previewFileData:', !!material.previewFileData);
    console.log('Is uploaded TXT:', material.isUploaded && material.uploadData?.fileName?.toLowerCase().endsWith('.txt'));
    
    setSelectedMaterial(material);
    // Always use InteractivePracticeTest - it will handle both uploaded and sample questions
    setShowPracticeTest(true);
  };
  
  const handleGlimpseClick = (material: any) => {
    console.log('Glimpse clicked for material:', material);
    console.log('Has uploadData:', !!material.uploadData);
    
    // Check if there's a PDF file in uploadData
    if (material.uploadData?.fileData && material.uploadData?.fileType === 'application/pdf') {
      setSelectedMaterial(material);
      setShowPdfViewer(true);
      
      // Save glimpse record to localStorage
      const glimpseRecord = {
        id: `glimpse-${Date.now()}`,
        materialTitle: material.title,
        subject: selectedSubject,
        category: selectedCategory || activeTab,
        date: new Date().toISOString(),
        fileData: material.uploadData.fileData,
        fileName: material.uploadData.fileName,
        fileType: material.uploadData.fileType,
        type: 'glimpse'
      };
      
      const existingRecords = JSON.parse(localStorage.getItem('myContentRecords') || '[]');
      existingRecords.unshift(glimpseRecord);
      localStorage.setItem('myContentRecords', JSON.stringify(existingRecords));
      window.dispatchEvent(new Event('contentRecordsUpdated'));
    } else {
      toast.error("PDF 파일이 없습니다. 자료 받기용 PDF를 먼저 업로드해주세요.");
    }
  };
  
  // Check if we should show Exam Questions Viewer, Key Notes Viewer, or Practice Test Viewer
  const showExamQuestionsViewer = false; // Disabled - use normal content layout instead
  const showKeyNotesViewer = false; // Disabled - use normal content layout instead
  const showPracticeTestViewer = false; // Disabled - use normal content layout instead
  
  // Check if we should show Voca Page
  const showVocaPage = isCertificationMode && selectedSubject === 'Voca';
  
  // Check if we should show grid layout for Subject or 1타 강사님들
  const showGridLayout = (activeTab === "Subject" || activeTab === "1타 강사님들") && schoolType === 'international' && selectedSubject === 'AP';
  
  // AP Subject data with icons
  const apSubjects = [
    { 
      icon: Calculator, 
      name: "Mathematics",
      category: "STEM",
      color: "#0288D1",
      description: "Complete resources for Analysis & Approaches and Applications & Interpretation",
      levels: ["SL", "HL"]
    },
    { 
      icon: TestTube, 
      name: "Biology",
      category: "STEM",
      color: "#4CAF50",
      description: "Comprehensive study materials for molecular biology to ecology",
      levels: ["SL", "HL"]
    },
    { 
      icon: Atom, 
      name: "Chemistry",
      category: "STEM",
      color: "#9C27B0",
      description: "From atomic structure to organic chemistry concepts",
      levels: ["SL", "HL"]
    },
    { 
      icon: Globe, 
      name: "Physics",
      category: "STEM",
      color: "#FF5722",
      description: "Mechanics, waves, electricity and modern physics",
      levels: ["SL", "HL"]
    },
    { 
      icon: Globe, 
      name: "Environmental Science",
      category: "STEM",
      color: "#2E8B57",
      description: "Environmental science integrated with social perspectives",
      levels: ["SL"]
    },
    { 
      icon: Users, 
      name: "Business Management",
      category: "Humanities",
      color: "#FF9800",
      description: "Business organization, finance, marketing and operations",
      levels: ["SL", "HL"]
    },
    { 
      icon: DollarSign, 
      name: "Economics",
      category: "Humanities",
      color: "#F44336",
      description: "Microeconomics, macroeconomics and global economy",
      levels: ["SL", "HL"]
    },
    { 
      icon: Leaf, 
      name: "Biology",
      category: "Humanities",
      color: "#4CAF50",
      description: "Biological, cognitive and sociocultural approaches to behavior",
      levels: ["SL", "HL"]
    },
    { 
      icon: Brain, 
      name: "Psychology",
      category: "Humanities",
      color: "#E91E63",
      description: "Biological, cognitive and sociocultural approaches to behavior",
      levels: ["SL", "HL"]
    },
    { 
      icon: BookOpen, 
      name: "English",
      category: "Languages",
      color: "#3F51B5",
      description: "Language and literature analysis",
      levels: ["SL", "HL"]
    },
    { 
      icon: Languages, 
      name: "Spanish B",
      category: "Languages",
      color: "#FFC107",
      description: "Language acquisition and cultural studies",
      levels: ["SL", "HL"]
    },
    { 
      icon: Languages, 
      name: "French B",
      category: "Languages",
      color: "#00BCD4",
      description: "Language acquisition and cultural studies",
      levels: ["SL", "HL"]
    },
    { 
      icon: BookOpen, 
      name: "English B",
      category: "Languages",
      color: "#607D8B",
      description: "Language acquisition for non-native speakers",
      levels: ["SL", "HL"]
    },
  ];

  // Category data
  const apCategories = [
    { 
      name: "STEM", 
      color: "#B3E5FC", 
      icon: Calculator,
      description: "Science, Technology, Engineering, Mathematics"
    },
    { 
      name: "Humanities", 
      color: "#FFE0B2", 
      icon: Users,
      description: "Business, Economics, Psychology"
    },
    { 
      name: "Languages", 
      color: "#D1C4E9", 
      icon: Languages,
      description: "English, Spanish, French"
    }
  ];
  
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<string>('Mathematics');

  // Update activeSubject when selectedCategory changes (from sidebar)
  useEffect(() => {
    if (showGridLayout && selectedCategory) {
      // Check if selectedCategory is a subject name
      const subject = apSubjects.find(s => s.name === selectedCategory);
      if (subject) {
        setActiveSubject(subject.name);
        setActiveCategory(subject.category);
      }
    }
  }, [selectedCategory, showGridLayout]);

  return (
    <>
      <div className="bg-white rounded-lg flex-1 max-w-none flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {/* Tabs - Fixed at top - Hide for Voca */}
        {!showVocaPage && (
          <div className="flex mb-0 border-b border-gray-200 relative overflow-x-auto p-4 sm:p-5 lg:p-6 pb-0">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab}
                onClick={() => {
                  if (tab === "실전문제" && schoolType === 'international') {
                    window.open("https://neon-sadly-99060853.figma.site", "_blank");
                  } else {
                    setActiveTab(tab);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 lg:py-4 text-sm sm:text-base lg:text-lg border-b-2 transition-all duration-200 relative whitespace-nowrap font-medium mr-2 flex items-center gap-2 ${ // 여백 추가
                  activeTab === tab
                    ? "border-cyan-600 text-cyan-600 bg-cyan-50"
                    : "border-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab === "국어" || tab === "Subject" ? (
                  <>
                    <Menu className="w-5 h-5" style={{ color: '#00C853' }} />
                    <span>{selectedSubject}</span>
                  </>
                ) : (
                  tab
                )}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    initial={false}
                    className="absolute inset-0 bg-cyan-50 rounded-t-md"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <motion.span
                  key={`badge-${tab}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 text-red-500 text-xs sm:text-sm font-semibold"
                >
                  {tabCounts[tab] || 0}
                </motion.span>
              </motion.button>
            ))}
          </div>
        )}
        
        {/* Scrollable content area */}
        <div id="scrollable-content" className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 pt-4">
          {/* Show Exam Questions Viewer, Key Notes Viewer, or Practice Test Viewer if conditions are met */}
          {showExamQuestionsViewer ? (
            <ExamQuestionsViewer 
              subject={selectedSubject} 
              category={selectedCategory} 
            />
          ) : showKeyNotesViewer ? (
            <KeyNotesViewer 
              subject={selectedSubject} 
              category={selectedCategory} 
            />
          ) : showPracticeTestViewer ? (
            <PracticeTestViewer 
              subject={selectedSubject} 
              category={selectedCategory} 
            />
          ) : showVocaPage ? (
            <VocaPage />
          ) : (
            <>
            {/* Header with title and button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-5 lg:mb-6 space-y-3 sm:space-y-0">
              <div className="flex items-center flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-800 font-medium">{activeTab}</h1>
                {!showGridLayout && (
                  <motion.span 
                    key={`count-${activeTab}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="ml-3 lg:ml-4 bg-cyan-100 text-cyan-700 px-3 py-1.5 text-sm sm:text-base rounded-full font-medium"
                  >
                    총 {materials.length}개
                  </motion.span>
                )}
              </div>
              <button 
                onClick={() => {
                  if (schoolType === 'korean') {
                    // 한국학교에서는 VIP 콘텐츠룸 모달 열기
                    setShowMyContentRoom(true);
                  } else if (isCertificationMode) {
                    // 인증시험 모드에서는 Component3 (TOEFL) 또는 Component4 (SAT) 페이지로 이동
                    if (selectedSubject === 'TOEFL' && onComponent3Click) {
                      onComponent3Click();
                    } else if (selectedSubject === 'SAT' && onComponent4Click) {
                      onComponent4Click();
                    } else {
                      // 다른 시험의 경우 외부 링크
                      window.open('https://tux-stood-50280581.figma.site', '_blank');
                    }
                  } else if (schoolType === 'international') {
                    // 국제학교 모드에서 AP, IB, A-level, AS, IGCSE는 Component5 (gong-notch) 연결
                    const vipSubjects = ['AP', 'IB', 'A-level', 'AS', 'IGCSE'];
                    if (vipSubjects.includes(selectedSubject) && onComponent5Click) {
                      onComponent5Click();
                    } else {
                      // GPA, Writing 등 기타 과목은 외부 링크
                      window.open('https://neon-sadly-99060853.figma.site/', '_blank');
                    }
                  } else {
                    window.open('https://neon-sadly-99060853.figma.site/', '_blank');
                  }
                }}
                className="bg-cyan-600 text-white px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg rounded-lg hover:bg-cyan-700 transition-colors self-start sm:self-auto min-h-10 sm:min-h-12"
              >
                VIP 콘텐츠룸
              </button>
            </div>
            
            {/* Grid Layout for Subject and 1타 강사님들 */}
            {showGridLayout ? (
              <>
                {/* Show categories if no category is selected */}
                {!activeCategory ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-w-5xl">
                    {apCategories.map((category, index) => {
                      return (
                        <CategoryCard
                          key={category.name}
                          category={category}
                          index={index}
                          onClick={() => setActiveCategory(category.name)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <>
                    {/* Back button and category title */}
                    <div className="mb-6 flex items-center gap-4">
                      <motion.button
                        onClick={() => {
                          setActiveCategory(null);
                          setActiveSubject('');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                        <span>Back to Categories</span>
                      </motion.button>
                      <h2 className="text-2xl font-bold" style={{ color: apCategories.find(c => c.name === activeCategory)?.color }}>
                        {activeCategory}
                      </h2>
                    </div>

                    {/* Subject Grid - Filtered by category */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3 mb-6">
                      {apSubjects.filter(s => s.category === activeCategory).map((subject, index) => {
                        const Icon = subject.icon;
                        const isSelected = activeSubject === subject.name;
                        return (
                          <motion.button
                            key={subject.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setActiveSubject(subject.name)}
                            className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl transition-all group"
                            style={{
                              backgroundColor: isSelected ? subject.color : '#f8f9fa',
                              boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <motion.div 
                              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center mb-1.5 sm:mb-2"
                              style={{
                                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'white'
                              }}
                            >
                              <Icon 
                                className="w-5 h-5 sm:w-6 sm:h-6" 
                                style={{ color: isSelected ? 'white' : subject.color }} 
                              />
                            </motion.div>
                            <span 
                              className="text-[10px] sm:text-xs text-center font-medium leading-tight px-1"
                              style={{
                                color: isSelected ? 'white' : '#2e4871'
                              }}
                            >
                              {subject.name}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Selected Subject Details - Expanded - Only show when subject is selected */}
                {activeSubject && activeCategory && (
                  <motion.div 
                    key={activeSubject}
                    className="mt-6 p-10 bg-white rounded-2xl border border-gray-200 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    {(() => {
                      const currentSubject = apSubjects.find(s => s.name === activeSubject);
                      if (!currentSubject) return null;

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <motion.div
                          className="lg:col-span-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <motion.h3 
                            className="font-extrabold text-3xl mb-6"
                            animate={{ color: currentSubject.color }}
                          >
                            AP {currentSubject.name}
                          </motion.h3>
                          
                          <div className="space-y-4 mb-8">
                            <p className="text-[#2e4871] leading-relaxed text-base">
                              {currentSubject.description}
                            </p>
                            
                            {/* Additional description space for longer content */}
                            <p className="text-[#2e4871] leading-relaxed text-base">
                              Our comprehensive {currentSubject.name} program provides in-depth coverage of all essential topics, 
                              combining theoretical knowledge with practical applications to ensure complete mastery of the subject.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-[#032254] font-bold">Available Levels:</h4>
                            <div className="flex space-x-4">
                              {currentSubject.levels.map((level, index) => (
                                <motion.div 
                                  key={level}
                                  className="px-4 py-2 rounded-lg border cursor-pointer"
                                  style={{ borderColor: currentSubject.color }}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.3 + index * 0.1 }}
                                  whileHover={{ 
                                    backgroundColor: currentSubject.color,
                                    color: "#ffffff",
                                    scale: 1.05 
                                  }}
                                >
                                  <span className="font-bold text-sm">{level}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {currentSubject.name === "Mathematics" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                              <div>
                                <h4 className="font-medium text-gray-800 mb-3">Analysis & Approaches</h4>
                                <div className="space-y-2">
                                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-between" style={{ color: currentSubject.color }}>
                                    SL
                                    <span className="text-gray-400">→</span>
                                  </button>
                                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-between" style={{ color: currentSubject.color }}>
                                    HL
                                    <span className="text-gray-400">→</span>
                                  </button>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800 mb-3">Applications & Interpretation</h4>
                                <div className="space-y-2">
                                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-between" style={{ color: currentSubject.color }}>
                                    SL
                                    <span className="text-gray-400">→</span>
                                  </button>
                                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-between" style={{ color: currentSubject.color }}>
                                    HL
                                    <span className="text-gray-400">→</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>

                        <motion.div 
                          className="flex justify-center items-start pt-8"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <motion.div 
                            className="w-full max-w-sm h-64 rounded-2xl flex items-center justify-center relative overflow-hidden"
                            animate={{ 
                              background: `linear-gradient(135deg, ${currentSubject.color}20, ${currentSubject.color}40)`,
                              borderColor: currentSubject.color 
                            }}
                            style={{ border: `2px solid ${currentSubject.color}20` }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 opacity-10"
                              style={{ background: `conic-gradient(from 0deg, transparent, ${currentSubject.color}, transparent)` }}
                            />
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            >
                              <currentSubject.icon 
                                className="w-28 h-28 relative z-10" 
                                style={{ color: currentSubject.color }} 
                              />
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </div>
                    );
                  })()}
                  </motion.div>
                )}
              </>
            ) : (
              <>
            {/* Search bar */}
        <motion.div
          key={`search-${activeTab}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-50 p-4 sm:p-5 lg:p-6 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-5 lg:mb-6"
        >
          <select className="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-3 text-sm sm:text-base focus:border-cyan-500 focus:outline-none transition-colors min-h-10 sm:min-h-12">
            <option>전체</option>
            <option>적문제</option>
            <option>핵심체크</option>
            <option>단원별</option>
            <option>모의고사</option>
          </select>
          <div className="flex flex-1 lg:max-w-96">
            <input
              type="text"
              placeholder={`${activeTab} 검색어를 입력해 주세요.`}
              className="flex-1 bg-white border border-gray-300 rounded-l-lg px-3 sm:px-4 py-3 text-sm sm:text-base focus:border-cyan-500 focus:outline-none transition-colors min-h-10 sm:min-h-12"
            />
            <button className="bg-white border border-l-0 border-gray-300 rounded-r-lg px-4 sm:px-5 py-3 text-sm sm:text-base text-gray-600 hover:bg-gray-50 hover:text-cyan-600 transition-colors min-h-10 sm:min-h-12">
              검색
            </button>
          </div>
        </motion.div>
        
        {/* Materials table with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden rounded-lg border border-gray-200"
          >
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4 text-sm text-gray-700 font-medium">제목</th>
                  <th className="text-center py-2 px-4 text-sm text-gray-700 font-medium w-48">자료관리</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMaterials.map((material, index) => (
                  <motion.tr
                    key={`${activeTab}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${material.isUploaded ? 'bg-blue-50' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center overflow-hidden">
                        <a 
                          href="#" 
                          className="text-gray-800 hover:text-cyan-600 text-sm transition-colors flex-1 truncate min-w-0"
                          title={material.title}
                        >
                          {material.isUploaded && (
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          )}
                          {material.title}
                        </a>
                        <span className="text-gray-400 text-xs ml-3 whitespace-nowrap flex-shrink-0">
                          [{material.count}]
                        </span>
                        {material.isNew && (
                          <motion.img 
                            src={imgRectangle8} 
                            alt="New" 
                            className="w-3 h-3 ml-2 flex-shrink-0"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 + index * 0.05, type: "spring" }}
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePreviewClick(material)}
                          className="bg-white border border-gray-300 rounded px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50 hover:border-blue-300 transition-all whitespace-nowrap"
                        >
                          시험보기
                        </button>
                        <button
                          onClick={() => handleGlimpseClick(material)}
                          className="bg-white border border-cyan-300 rounded px-4 py-1.5 text-xs text-cyan-600 hover:bg-cyan-50 hover:border-cyan-400 transition-all whitespace-nowrap"
                        >
                          미리보기
                        </button>
                        <button
                          onClick={() => handleDownloadClick(material)}
                          className="flex items-center justify-center bg-white border border-gray-300 rounded px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50 hover:border-cyan-300 transition-all whitespace-nowrap"
                        >
                          <img src={imgRectangle9} alt="" className="w-3 h-3 mr-1" />
                          다운로드
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </AnimatePresence>
        
        {/* Pagination */}
        <div className="flex justify-center mt-6 sm:mt-8 lg:mt-10">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Previous button */}
            {currentPage > 1 && (
              <button 
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <img src={imgRectangle10} alt="Prev" className="w-5 h-5 sm:w-6 sm:h-6 rotate-180" />
              </button>
            )}
            
            {/* Page numbers - show only relevant pages */}
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full text-sm sm:text-base lg:text-lg transition-colors flex items-center justify-center font-medium ${
                  currentPage === page 
                    ? "bg-gray-600 text-white shadow-md" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            
            {/* Next button */}
            {currentPage < totalPages && (
              <button 
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                <img src={imgRectangle10} alt="Next" className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>
        </div>
              </>
            )}
            </>
          )}
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-8 w-full max-w-md"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <img 
                  src={authModalImg} 
                  alt="N Study Hub 로고" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">아이디</label>
                <Input
                  type="text"
                  placeholder="아디를 입력해주세요"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">비밀번호</label>
                <Input
                  type="password"
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <Button
                onClick={handleAuthSubmit}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                로그인
              </Button>
              <Button
                variant="outline"
                className="w-full"
              >
                회원가입
              </Button>
            </div>
            
            <div className="mt-4 text-center">
              <button className="text-sm text-gray-500 hover:text-gray-700">
                아이디 찾기 비밀번호 찾기
              </button>
            </div>
            
            <button
              onClick={() => {
                setShowAuthModal(false);
                setPassword("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </motion.div>
        </div>
      )}




      {/* Interactive Practice Test */}
      {showPracticeTest && selectedMaterial && (
        <InteractivePracticeTest
          materialTitle={selectedMaterial.title}
          material={selectedMaterial}
          onExit={() => {
            setShowPracticeTest(false);
            setSelectedMaterial(null);
          }}
        />
      )}

      {/* Password Modal for Downloads */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingDownloadMaterial(null);
        }}
        onSubmit={handlePasswordSubmit}
        materialTitle={pendingDownloadMaterial?.title || ""}
      />

      {/* PDF Viewer Modal for Glimpse */}
      {showPdfViewer && selectedMaterial?.uploadData?.fileData && (
        <div className="fixed inset-0 z-[100] bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-white border-b flex items-center justify-between px-4 z-10">
            <h2 className="font-medium text-gray-800">
              힐끗보기 - {selectedMaterial?.title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPdfViewer(false)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* PDF Content - Full Screen */}
          <div className="absolute top-12 left-0 right-0 bottom-0">
            <iframe
              src={selectedMaterial.uploadData.fileData}
              className="w-full h-full border-0"
              title="PDF Viewer"
            />
          </div>
        </div>
      )}

      {/* My Content Room Modal */}
      {showMyContentRoom && (
        <MyContentRoom onClose={() => setShowMyContentRoom(false)} />
      )}
    </>
  );
}