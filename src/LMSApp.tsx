import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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

export default function LMSApp() {
  const { menu } = useParams<{ menu: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedSubject, setSelectedSubject] = useState("국어");

  const legacySgrSection = menu?.startsWith("sgr-")
    ? ["class", "novel", "writing", "voca", "grammar", "hsk"].find((section) => menu === `sgr-${section}`)
    : undefined;
  useEffect(() => {
    if (legacySgrSection) {
      navigate(`/lms/sgr?section=${legacySgrSection}`, { replace: true });
    }
  }, [legacySgrSection, navigate]);

  // selectedMenu를 URL :menu 파라미터에서 파생 (없으면 dashboard)
  const selectedMenu = menu || "dashboard";
  const sgrSection = selectedMenu === "sgr" ? (searchParams.get("section") || "class") : (legacySgrSection || "class");

  // 메뉴 선택 → URL 갱신
  const handleMenuSelect = (newMenu: string) => {
    navigate(newMenu === "sgr" ? "/lms/sgr?section=class" : `/lms/${newMenu}`);
  };

  // LMS 나가기 → 직전 메인 URL로 복귀
  const handleExitClick = () => {
    const lastUrl = sessionStorage.getItem("lastMainUrl") || "/app/international/GPA";
    navigate(lastUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LMSHeader onExitClick={handleExitClick} />

      <div className="flex-1 flex">
        <LMSSidebar
          selectedMenu={selectedMenu}
          onMenuSelect={handleMenuSelect}
        />

        <div className="flex-1 flex flex-col">
          <LMSMainContent
            selectedMenu={selectedMenu}
            selectedSubject={selectedSubject}
            onSubjectSelect={setSelectedSubject}
            sgrSection={sgrSection}
            onSgrSectionSelect={(section) => navigate(`/lms/sgr?section=${section}`)}
          />
        </div>
      </div>

      <LMSFooter />
      <Toaster />
    </div>
  );
}
