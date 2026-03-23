import { useState } from "react";
import { motion } from "motion/react";
import { Search, ChevronRight, ArrowLeft, BookCheck, Languages, GraduationCap, Globe2, Target, Clock, BarChart2, Zap } from "lucide-react";
import { LoginModal } from "./components/auth/LoginModal";
import { SignupModal } from "./components/auth/SignupModal";
import MobileAdBanner from "./components/MobileAdBanner";
import { BrandLogo } from "./components/BrandLogo";

interface CertificationTestsPageProps {
  onBack: () => void;
  onTestSelect: (test: 'SAT' | 'ACT' | 'TOEFL' | 'IELTS') => void;
}

export default function CertificationTestsPage({ onBack, onTestSelect }: CertificationTestsPageProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<'login' | 'signup' | null>('signup');

  const handleTestSelect = (test: 'SAT' | 'ACT' | 'TOEFL' | 'IELTS') => {
    onTestSelect(test);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4 sm:space-x-8">
              <button 
                onClick={onBack}
                className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center space-x-1 text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  className="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Search certification tests"
                  type="search"
                />
              </div>
            </div>

            {/* Center - Logo */}
            <div className="flex items-center">
              <BrandLogo size="md" />
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center relative bg-gray-100 rounded-lg p-1">
                {/* Sliding background */}
                <motion.div
                  className="absolute bg-cyan-600 rounded-md h-8 top-1"
                  animate={{ 
                    x: hoveredButton === 'login' ? 2 : hoveredButton === 'signup' ? "calc(100% - 2px)" : "calc(100% - 2px)",
                    width: "calc(50% - 4px)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                
                <button 
                  onClick={() => setShowLoginModal(true)}
                  onMouseEnter={() => setHoveredButton('login')}
                  onMouseLeave={() => setHoveredButton('signup')}
                  className={`relative z-10 px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                    hoveredButton === 'login' ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  로그인
                </button>
                <button 
                  onClick={() => setShowSignupModal(true)}
                  onMouseEnter={() => setHoveredButton('signup')}
                  onMouseLeave={() => setHoveredButton('signup')}
                  className={`relative z-10 px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                    hoveredButton === 'signup' ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  회원가입
                </button>
              </div>
              
              {/* Mobile menu button */}
              <button className="md:hidden p-2">
                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                  <div className="w-full h-0.5 bg-gray-600"></div>
                  <div className="w-full h-0.5 bg-gray-600"></div>
                  <div className="w-full h-0.5 bg-gray-600"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-12 lg:py-20 pb-20 sm:pb-12">
        {/* Top Ad Banner */}
        <MobileAdBanner page="certification" position="top" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left side - Text content and image collage */}
          <div className="hidden sm:block space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Ace your certification tests!
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8">
                SAT, ACT, TOEFL, IELTS 인증시험을 위한 체계적인 학습 자료<br />
                전문적인 문제 분석과 효과적인 학습 전략으로 목표 점수 달성을 지원합니다
              </p>
            </motion.div>

            {/* Image collage section - hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative max-w-md mx-auto lg:mx-0 hidden sm:block"
            >
              <div className="relative">
                {/* Background decorative shapes */}
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-70"></div>
                <div className="absolute top-8 -right-8 w-6 h-6 bg-gradient-to-br from-green-400 to-teal-500 rotate-45 opacity-70"></div>
                <div className="absolute -bottom-8 left-1/3 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 opacity-70" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
                
                {/* Main circular image */}
                <motion.div 
                  className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ 
                    scale: 0.95,
                    x: [0, -2, 2, -2, 2, 0],
                    transition: { 
                      x: { duration: 0.3, ease: "easeInOut" },
                      scale: { duration: 0.1 }
                    }
                  }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1758685848208-e108b6af94cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwZXhhbSUyMHRlc3QlMjBwcmVwYXJhdGlvbnxlbnwxfHx8fDE3NTg5NTcyMDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                    alt="Student exam test preparation" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                
                {/* Top right rectangular image */}
                <motion.div 
                  className="absolute -top-4 left-24 w-40 h-28 rounded-lg overflow-hidden border-4 border-white shadow-lg transform rotate-6 cursor-pointer"
                  whileHover={{ scale: 1.05, rotate: 8 }}
                  whileTap={{ 
                    scale: 0.95,
                    rotate: 4,
                    y: [0, -1, 1, -1, 1, 0],
                    transition: { 
                      y: { duration: 0.25, ease: "easeInOut" },
                      scale: { duration: 0.1 },
                      rotate: { duration: 0.1 }
                    }
                  }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwc3R1ZGVudHMlMjBzdHVkeWluZ3xlbnwxfHx8fDE3NTg4NjU0Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                    alt="College students studying" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                
                {/* Bottom left circular image */}
                <motion.div 
                  className="absolute top-16 -left-8 w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ 
                    scale: 0.9,
                    x: [0, 1, -1, 1, -1, 0],
                    y: [0, -1, 1, -1, 1, 0],
                    transition: { 
                      x: { duration: 0.2, ease: "easeInOut" },
                      y: { duration: 0.2, ease: "easeInOut" },
                      scale: { duration: 0.1 }
                    }
                  }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNsYXNzcm9vbSUyMGxlYXJuaW5nfGVufDF8fHx8MTc1ODk1NzA3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                    alt="Students classroom learning" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                
                {/* Decorative line/squiggle */}
                <div className="absolute bottom-4 left-20 w-20 h-8">
                  <svg viewBox="0 0 80 32" className="w-full h-full text-gray-400">
                    <path d="M5 16 Q 20 5, 40 16 T 75 16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right side - Test selection section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              {/* Mobile compact title */}
              <div className="sm:hidden mb-2">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">인증시험</h1>
                <p className="text-sm text-gray-500">SAT, TOEFL, ACT, IELTS 준비</p>
              </div>

              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 hidden sm:block">
                Choose your certification test
              </h2>
              <p className="text-gray-600 hidden sm:block">
                Select the test you want to prepare for
              </p>
            </motion.div>
              
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4"
            >
              {/* SAT */}
              <motion.button
                onClick={() => handleTestSelect('SAT')}
                whileHover={{ 
                  scale: 1.03,
                  y: -6,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
                }}
                whileTap={{ scale: 0.97 }}
                className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-5 text-center sm:text-left transition-all hover:border-gray-400"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-200 border border-black/5">
                  <BookCheck className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                </div>
                <div className="flex-1 sm:pt-1">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 sm:mb-1.5">
                    SAT
                  </h3>
                  <p className="text-xs sm:text-[15px] text-gray-600 leading-relaxed">
                    미국 대학입학시험
                  </p>
                </div>
              </motion.button>

              {/* TOEFL */}
              <motion.button
                onClick={() => handleTestSelect('TOEFL')}
                whileHover={{ 
                  scale: 1.03,
                  y: -6,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
                }}
                whileTap={{ scale: 0.97 }}
                className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-5 text-center sm:text-left transition-all hover:border-gray-400"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-200 border border-black/5">
                  <Languages className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                </div>
                <div className="flex-1 sm:pt-1">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 sm:mb-1.5">
                    TOEFL
                  </h3>
                  <p className="text-xs sm:text-[15px] text-gray-600 leading-relaxed">
                    영어능력평가시험
                  </p>
                </div>
              </motion.button>

              {/* ACT - Coming Soon */}
              <motion.button
                onClick={() => {}}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-5 text-center sm:text-left transition-all opacity-60 cursor-not-allowed relative"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-200 border border-black/5">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                </div>
                <div className="flex-1 sm:pt-1">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 sm:mb-1.5">
                    ACT
                  </h3>
                  <p className="text-xs sm:text-[15px] text-gray-600 leading-relaxed">
                    미국 대학입학시험
                  </p>
                </div>
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-orange-100 text-orange-600 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                  Soon
                </div>
              </motion.button>

              {/* IELTS - Coming Soon */}
              <motion.button
                onClick={() => {}}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-5 text-center sm:text-left transition-all opacity-60 cursor-not-allowed relative"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-cyan-200 border border-black/5">
                  <Globe2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                </div>
                <div className="flex-1 sm:pt-1">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 sm:mb-1.5">
                    IELTS
                  </h3>
                  <p className="text-xs sm:text-[15px] text-gray-600 leading-relaxed">
                    국제 영어시험
                  </p>
                </div>
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-orange-100 text-orange-600 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                  Soon
                </div>
              </motion.button>
            </motion.div>
            
            <div className="mt-6 hidden sm:block">
              <p className="text-sm text-gray-600 text-center lg:text-left">
                Need help choosing the right test?{" "}
                <button className="text-cyan-600 hover:text-cyan-700 hover:underline">
                  Compare tests
                </button>
                {" "}or{" "}
                <button className="text-cyan-600 hover:text-cyan-700 hover:underline">
                  contact our advisors
                </button>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Middle Ad Banner */}
        <MobileAdBanner page="certification" position="middle" />

        {/* Bottom Ad Banner */}
        <MobileAdBanner page="certification" position="bottom" />
      </main>

      {/* Footer */}
      <footer className="hidden md:block bg-gradient-to-r from-gray-50 to-emerald-50/40 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <BrandLogo size="xs" />
              </div>
              <p className="text-gray-600 text-sm">
                Empowering test takers worldwide with comprehensive preparation.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Tests</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">SAT</a></li>
                <li><a href="#" className="hover:text-gray-900">ACT</a></li>
                <li><a href="#" className="hover:text-gray-900">TOEFL</a></li>
                <li><a href="#" className="hover:text-gray-900">IELTS</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Practice Tests</a></li>
                <li><a href="#" className="hover:text-gray-900">Study Guides</a></li>
                <li><a href="#" className="hover:text-gray-900">Test Strategies</a></li>
                <li><a href="#" className="hover:text-gray-900">Score Reports</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 AllMyExam. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

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
    </div>
  );
}