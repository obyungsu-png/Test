import { useState } from "react";
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

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'main' | 'lms' | 'certification' | 'international' | 'korean' | 'component3' | 'component4' | 'component5'>('landing');
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
          // Skip intermediate page and go directly to main app
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

  // Component5 Page (Additional Site)
  if (currentPage === 'component5') {
    return <Component5Page onClose={() => setCurrentPage('main')} />;
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
        onComponent5Click={handleComponent5Click}
        schoolType={schoolType}
        userRole={userRole}
        onUserRoleChange={setUserRole}
        isCertificationMode={isCertificationMode}
        initialSubject={selectedCurriculum}
      />
    </div>
  );
}