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
  onCMSClick?: () => void;
  onComponent3Click?: () => void;
  onComponent4Click?: () => void;
  onComponent5Click?: () => void;
  schoolType: 'korean' | 'international' | null;
  userRole?: 'student' | 'teacher' | null;
  onUserRoleChange?: (role: 'student' | 'teacher') => void;
  isCertificationMode?: boolean;
  initialSubject?: string | null;
}

export default function MainApp({ onUploadClick, onBackToLanding, onLMSClick, onCMSClick, onComponent3Click, onComponent4Click, onComponent5Click, schoolType, userRole, onUserRoleChange, isCertificationMode, initialSubject }: MainAppProps) {
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
      setSelectedSubCategory(""); // Reset subcategory when subject changes
    }
  }, [selectedSubject, isCertificationMode]);

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubCategory("");
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Header 
        selectedSubject={selectedSubject}
        onSubjectChange={(subject) => {
          setSelectedSubject(subject);
          // 과목 변경 시 카테고리/서브카테고리 리셋 (이전 과목의 카테고리가 남아있으면 콘텐츠가 표시되지 않음)
          if (!isCertificationMode) {
            setSelectedCategory("");
            setSelectedSubCategory("");
          }
        }}
        onUploadClick={onUploadClick}
        onHomeClick={onBackToLanding}
        onLMSClick={onLMSClick}
        schoolType={schoolType}
        userRole={userRole}
        onUserRoleChange={onUserRoleChange}
        isCertificationMode={isCertificationMode}
      />
      
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-8 pb-16 md:pb-4">
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 lg:gap-6 max-w-none">
          <div className={`hidden lg:block lg:flex-shrink-0 lg:w-72`}>
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
              onCMSClick={onCMSClick}
              onComponent3Click={onComponent3Click}
              onComponent4Click={onComponent4Click}
              onComponent5Click={onComponent5Click}
            />
          </div>
        </div>
      </div>
      
      {/* Right Sidebar - Show on International School when viewing Key Notes, Exam Questions, Practice Test, or Past Papers */}
      {schoolType === 'international' && (activeTab === "Key Notes" || activeTab === "Exam Questions" || activeTab === "Practice Test" || activeTab === "Past Papers") && (
        <ContentRightSidebar />
      )}
      
      <Footer onLMSClick={onLMSClick} />
      <Toaster />
    </div>
  );
}