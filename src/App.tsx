import { useState, useEffect } from "react";
import LandingPage from "./LandingPage";
import MainApp from "./MainApp";
import LMSApp from "./LMSApp";
import CertificationTestsPage from "./CertificationTestsPage";
import InternationalSchoolPage from "./InternationalSchoolPage";
import KoreanSchoolPage from "./KoreanSchoolPage";
import Component3Page from "./Component3Page";
import Component4Page from "./Component4Page";
import Component5Page from "./Component5Page";
import { Button } from "./components/ui/button";
import { MobileBottomNav } from "./components/MobileBottomNav";

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'main' | 'lms' | 'certification' | 'international' | 'korean' | 'component3' | 'component4' | 'component5'>('landing');
  const [schoolType, setSchoolType] = useState<'korean' | 'international' | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);
  const [lmsSelectedMenu, setLmsSelectedMenu] = useState('dashboard');
  const [isCertificationMode, setIsCertificationMode] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(null);

  // 브라우저 탭 제목 설정
  document.title = "AllMyExam";

  // 파비콘 설정 (번개 아이콘)
  useEffect(() => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00bcd4"/>
            <stop offset="100%" style="stop-color:#0097a7"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#bg)"/>
        <path d="M35 6L14 36h14l-4 22 22-30H32L35 6z" fill="white"/>
      </svg>
    `;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = url;

    return () => URL.revokeObjectURL(url);
  }, []);

  const handleMobileNavigate = (page: 'landing' | 'korean' | 'international' | 'certification') => {
    if (page === 'landing') {
      setCurrentPage('landing');
    } else if (page === 'korean') {
      setCurrentPage('korean');
    } else if (page === 'international') {
      setCurrentPage('international');
    } else if (page === 'certification') {
      setCurrentPage('certification');
    }
  };

  // Landing Page
  if (currentPage === 'landing') {
    return (
      <>
        <div className="pb-16 md:pb-0">
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
        </div>
        <MobileBottomNav currentPage={currentPage} onNavigate={handleMobileNavigate} />
      </>
    );
  }

  // Certification Tests Page
  if (currentPage === 'certification') {
    return (
      <>
        <div className="pb-16 md:pb-0">
          <CertificationTestsPage
            onBack={() => setCurrentPage('landing')}
            onTestSelect={(test) => {
              // Skip intermediate page and go directly to main app
              setSchoolType('international');
              setUserRole('student');
              setIsCertificationMode(true);
              setSelectedCurriculum(test);
              setCurrentPage('main');
            }}
          />
        </div>
        <MobileBottomNav currentPage={currentPage} onNavigate={handleMobileNavigate} />
      </>
    );
  }

  // International School Page
  if (currentPage === 'international') {
    return (
      <>
        <div className="pb-16 md:pb-0">
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
        </div>
        <MobileBottomNav currentPage={currentPage} onNavigate={handleMobileNavigate} />
      </>
    );
  }

  // Korean School Page
  if (currentPage === 'korean') {
    return (
      <>
        <div className="pb-16 md:pb-0">
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
        </div>
        <MobileBottomNav currentPage={currentPage} onNavigate={handleMobileNavigate} />
      </>
    );
  }

  // LMS App
  if (currentPage === 'lms') {
    return (
      <>
        <div className="pb-16 md:pb-0">
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
            <LMSApp 
              initialSelectedMenu={lmsSelectedMenu}
              onExitClick={() => setCurrentPage('main')}
            />
          </div>
        </div>
        <MobileBottomNav currentPage={currentPage} onNavigate={handleMobileNavigate} />
      </>
    );
  }

  // Component3 Page (TOEFL)
  if (currentPage === 'component3') {
    return (
      <>
        <div className="pb-16 md:pb-0">
          <Component3Page onClose={() => setCurrentPage('main')} />
        </div>
        <MobileBottomNav currentPage={currentPage} onNavigate={handleMobileNavigate} />
      </>
    );
  }

  // Component4 Page (SAT)
  if (currentPage === 'component4') {
    return (
      <>
        <div className="pb-16 md:pb-0">
          <Component4Page onClose={() => setCurrentPage('main')} />
        </div>
        <MobileBottomNav currentPage={currentPage} onNavigate={handleMobileNavigate} />
      </>
    );
  }

  // Component5 Page (Additional Site)
  if (currentPage === 'component5') {
    return (
      <>
        <div className="pb-16 md:pb-0">
          <Component5Page onClose={() => setCurrentPage('main')} />
        </div>
        <MobileBottomNav currentPage={currentPage} onNavigate={handleMobileNavigate} />
      </>
    );
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

  const handleComponent5Click = () => {
    setCurrentPage('component5');
  };

  return (
    <>
      <div className="pb-16 md:pb-0">
        <MainApp 
          onUploadClick={handleUploadClick}
          onBackToLanding={() => setCurrentPage('landing')}
          onLMSClick={() => {
            setLmsSelectedMenu('dashboard');
            setCurrentPage('lms');
          }}
          onComponent3Click={handleComponent3Click}
          onComponent4Click={handleComponent4Click}
          onComponent5Click={handleComponent5Click}
          schoolType={schoolType}
          userRole={userRole}
          onUserRoleChange={setUserRole}
          isCertificationMode={isCertificationMode}
          initialSubject={selectedCurriculum}
        />
      </div>
      <MobileBottomNav currentPage={currentPage} onNavigate={handleMobileNavigate} />
    </>
  );
}