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

  // LMS 비밀번호 상태
  const [lmsUnlocked, setLmsUnlocked] = useState(false);
  const [lmsPwInput, setLmsPwInput] = useState('');
  const [lmsPwError, setLmsPwError] = useState(false);
  const LMS_PASSWORD = 'sw21qa00';

  const handleLmsPwSubmit = () => {
    if (lmsPwInput === LMS_PASSWORD) {
      setLmsUnlocked(true);
      setLmsPwError(false);
      setLmsPwInput('');
    } else {
      setLmsPwError(true);
      setLmsPwInput('');
    }
  };

  // LMS App
  if (currentPage === 'lms') {
    // 비밀번호 미입력 시 잠금 화면
    if (!lmsUnlocked) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">학습 관리 시스템</h2>
              <p className="text-sm text-gray-500 mt-1">관리자 전용 — 비밀번호를 입력하세요</p>
            </div>
            <div className="space-y-4">
              <div>
                <input
                  type="password"
                  value={lmsPwInput}
                  onChange={e => { setLmsPwInput(e.target.value); setLmsPwError(false); }}
                  onKeyDown={e => e.key === 'Enter' && handleLmsPwSubmit()}
                  placeholder="비밀번호"
                  autoFocus
                  className={`w-full px-4 py-3 text-base border-2 rounded-xl outline-none transition-all ${
                    lmsPwError
                      ? 'border-red-400 bg-red-50 focus:border-red-500'
                      : 'border-gray-200 focus:border-purple-500'
                  }`}
                />
                {lmsPwError && (
                  <p className="text-red-500 text-sm mt-1.5 font-medium">❌ 비밀번호가 틀렸습니다.</p>
                )}
              </div>
              <button
                onClick={handleLmsPwSubmit}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-base font-bold rounded-xl transition-colors"
              >
                입력
              </button>
              <button
                onClick={() => { setCurrentPage('landing'); setLmsPwInput(''); setLmsPwError(false); }}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-xl transition-colors"
              >
                돌아가기
              </button>
            </div>
          </div>
        </div>
      );
    }

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
                onClick={() => { setCurrentPage('landing'); setLmsUnlocked(false); }}
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
          onCMSClick={() => {
            setLmsSelectedMenu('voca');
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