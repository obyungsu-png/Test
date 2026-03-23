import { BrandLogo } from "./BrandLogo";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Menu, X, Home } from "lucide-react";
import svgPaths from "../imports/svg-vlzq6nziw7";
import imgRectangle from "figma:asset/5ec0ad51783f7d922cc7ed00747456b04e764c51.png";
import imgRectangle1 from "figma:asset/7fdcd38dc8fc12623bb87eda47c3f957d8a23210.png";
import imgRectangle2 from "figma:asset/591046dc38db451f7bc7e2298e1657adbe85e2ed.png";
import imgRectangle3 from "figma:asset/c3ea6e378709aad25dc0663f0c420e3f85b4d22d.png";
import { LoginModal } from "./auth/LoginModal";
import { SignupModal } from "./auth/SignupModal";
import { CustomerSupportModal } from "./support/CustomerSupportModal";

interface HeaderProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  onUploadClick?: () => void;
  onHomeClick?: () => void;
  onLMSClick?: () => void;
  schoolType: 'korean' | 'international' | null;
  userRole?: 'student' | 'teacher' | null;
  onUserRoleChange?: (role: 'student' | 'teacher') => void;
  isCertificationMode?: boolean;
}

export function Header({ selectedSubject, onSubjectChange, onUploadClick, onHomeClick, onLMSClick, schoolType, userRole, onUserRoleChange, isCertificationMode }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentNotice, setCurrentNotice] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Load current notice from localStorage
  useEffect(() => {
    const notices = JSON.parse(localStorage.getItem('notices') || '[]');
    const latestNotice = notices.length > 0 ? notices[notices.length - 1] : null;
    if (latestNotice) {
      setCurrentNotice(latestNotice.title);
    } else {
      setCurrentNotice("2025년 2학기 중간고사 학습자료 업데이트 완료");
    }
  }, []);

  // Listen for notice updates
  useEffect(() => {
    const handleStorageChange = () => {
      const notices = JSON.parse(localStorage.getItem('notices') || '[]');
      const latestNotice = notices.length > 0 ? notices[notices.length - 1] : null;
      if (latestNotice) {
        setCurrentNotice(latestNotice.title);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleNavClick = (subject: string) => {
    onSubjectChange(subject);
    setMobileMenuOpen(false);
  };

  const koreanSubjects = ["국어", "영어", "수학", "과학", "사회", "서류전형", "특례시험"];
  const internationalSubjects = ["GPA", "AP", "IB", "A-level", "AS", "IGCSE", "Writing"];
  const certificationSubjects = ["TOEFL", "SAT", "ACT", "IELTS", "TOEIC", "Voca"];
  
  const subjects = isCertificationMode ? certificationSubjects : 
                  (schoolType === 'international' ? internationalSubjects : koreanSubjects);

  // Get banner content based on mode/type
  const getBannerContent = () => {
    if (isCertificationMode) {
      return {
        title: "Achieve Excellence Beyond Limits",
        subtitle: "Transform Your Test Preparation Journey"
      };
    } else if (schoolType === 'international') {
      return {
        title: "Empowering Global Education",
        subtitle: "Your Gateway to Academic Excellence"
      };
    } else if (schoolType === 'korean') {
      return {
        title: "학습의 새로운 시작",
        subtitle: "더 나은 교육을 향한 여정"
      };
    } else {
      return {
        title: "학습의 새로운 시작",
        subtitle: "교육의 혁신을 만나보세요"
      };
    }
  };

  const bannerContent = getBannerContent();

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Main header */}
      <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <BrandLogo size="lg" />
          {userRole && (
            <span className="ml-2 px-2 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 text-xs rounded-full font-medium">
              {userRole === 'student' ? '학생' : '선생님'}
            </span>
          )}
        </div>
        
        {/* Mobile: current subject badge + menu button */}
        <div className="md:hidden flex items-center gap-2">
          <span className="px-3 py-1.5 bg-cyan-50 text-cyan-700 text-base font-bold rounded-full border border-cyan-200">
            {selectedSubject}
          </span>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-10 min-h-10 flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-3 lg:space-x-5 xl:space-x-7 flex-1 justify-center">
          {subjects.map((subject) => (
            <motion.button
              key={subject}
              onClick={() => handleNavClick(subject)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-full font-bold transition-all duration-200 text-sm lg:text-base xl:text-lg ${
                selectedSubject === subject 
                  ? schoolType === 'international' 
                    ? "bg-cyan-500 text-white shadow-lg" 
                    : "bg-cyan-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              <span className="relative z-10">{subject}</span>
              {selectedSubject === subject && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-cyan-500 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </nav>
        
        {/* Desktop Right side actions - Home Icon */}
        <div className="hidden md:flex items-center space-x-3 lg:space-x-6">
          <button 
            onClick={onHomeClick}
            className="flex items-center space-x-2 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 px-3 py-2 rounded-lg transition-all duration-200 group"
            title="홈으로 이동"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">home</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-gray-200"
        >
          <div className="px-4 py-5 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleNavClick(subject)}
                  className={`p-4 rounded-lg text-center transition-colors text-base min-h-12 font-bold ${
                    selectedSubject === subject 
                      ? "bg-cyan-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
              <button 
                onClick={onHomeClick}
                className="flex items-center text-gray-700 hover:text-cyan-600 p-3 rounded-lg hover:bg-cyan-50 transition-colors"
              >
                <Home className="w-5 h-5 mr-3" />
                <span className="text-base">home</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Banner Section */}
      <div 
        className="relative hidden sm:block h-16 sm:h-19 lg:h-24 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url('${imgRectangle3}')` }}
      >
        {/* Banner Text - positioned left */}
        <div className="absolute left-4 sm:left-6 lg:left-8 top-0 bottom-0 flex items-center">
          <div className="text-white">
            <h1 className="text-base sm:text-lg lg:text-2xl font-bold drop-shadow-lg">
              {bannerContent.title}
            </h1>
            <p className="text-xs sm:text-sm lg:text-base opacity-90 drop-shadow-md mt-1">
              {bannerContent.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      
      <SignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
      
      <CustomerSupportModal 
        isOpen={showSupportModal} 
        onClose={() => setShowSupportModal(false)}
        onLMSClick={onLMSClick}
      />
    </div>
  );
}