import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent";
import { ContentRightSidebar } from "./components/ContentRightSidebar";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import { useSession } from "./session/SessionContext";
import { modeToSchoolType, slugToTab, tabToSlug } from "./utils/tabSlugs";

export default function MainApp() {
  const { mode = "korean", subject, tab } = useParams<{ mode: string; subject?: string; tab?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, setUserRole } = useSession();

  const { schoolType, isCertificationMode } = modeToSchoolType(mode);

  // subject 파생 — URL에 없으면 기본값
  const selectedSubject = subject
    ? decodeURIComponent(subject)
    : isCertificationMode
      ? "TOEFL"
      : schoolType === "international"
        ? "GPA"
        : "국어";

  // activeTab 파생 — URL :tab 슬러그에서 변환
  const activeTab = useMemo(() => slugToTab(mode, tab), [mode, tab]);

  const [selectedCategory, setSelectedCategory] = useState(isCertificationMode ? "Reading" : "");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  // 현재 URL을 sessionStorage에 저장 (LMS "서준 01 사이트" 복귀용)
  useEffect(() => {
    sessionStorage.setItem("lastMainUrl", location.pathname);
  }, [location.pathname]);

  // 인증시험 모드에서 과목별 카테고리 자동 설정
  useEffect(() => {
    if (isCertificationMode) {
      const categoryMap: { [key: string]: string } = {
        TOEFL: "Reading",
        SAT: "Math",
        ACT: "English",
        IELTS: "Listening",
        TOEIC: "Listening",
      };
      setSelectedCategory(categoryMap[selectedSubject] || "Reading");
      setSelectedSubCategory("");
    }
  }, [selectedSubject, isCertificationMode]);

  useEffect(() => {
    setSelectedSubCategory("");
  }, [selectedCategory]);

  // 과목 변경 → URL 업데이트 (기본 탭으로)
  const handleSubjectChange = (newSubject: string) => {
    if (!isCertificationMode) {
      setSelectedCategory("");
      setSelectedSubCategory("");
    }
    navigate(`/app/${mode}/${encodeURIComponent(newSubject)}`);
  };

  // 탭 선택 → URL 업데이트
  const handleTabSelect = (newTab: string) => {
    navigate(`/app/${mode}/${encodeURIComponent(selectedSubject)}/${tabToSlug(newTab)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Header
        selectedSubject={selectedSubject}
        onSubjectChange={handleSubjectChange}
        onUploadClick={() => navigate("/lms/upload")}
        onHomeClick={() => navigate("/")}
        onLMSClick={() => navigate("/lms/dashboard")}
        schoolType={schoolType}
        userRole={userRole}
        onUserRoleChange={setUserRole}
        isCertificationMode={isCertificationMode}
      />

      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-8 pb-16 md:pb-4">
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 lg:gap-6 max-w-none">
          <div className="hidden lg:block lg:flex-shrink-0 lg:w-72">
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
              activeTab={activeTab}
              onTabSelect={handleTabSelect}
              onCMSClick={() => navigate("/lms/voca")}
              onComponent3Click={() => navigate("/toefl")}
              onComponent4Click={() => navigate("/sat")}
              onComponent5Click={() => navigate("/site")}
            />
          </div>
        </div>
      </div>

      {schoolType === "international" &&
        (activeTab === "Key Notes" || activeTab === "Exam Questions" || activeTab === "Practice Test" || activeTab === "Past Papers") && (
          <ContentRightSidebar />
        )}

      <Footer onLMSClick={() => navigate("/lms/dashboard")} />
      <Toaster />
    </div>
  );
}
