import { useState } from "react";
import { motion } from "motion/react";
import { Search, ChevronRight, BookOpen, Globe, Award } from "lucide-react";
// 이미지는 직접 src에서 사용
import { LoginModal } from "./components/auth/LoginModal";
import { SignupModal } from "./components/auth/SignupModal";

interface LandingPageProps {
  onSchoolTypeSelect: (schoolType: 'korean' | 'international') => void;
  onUserRoleSelect: (userRole: 'student' | 'teacher') => void;
  onCertificationTestsSelect: () => void;
  onInternationalSchoolSelect: () => void;
}

export default function LandingPage({ onSchoolTypeSelect, onUserRoleSelect, onCertificationTestsSelect, onInternationalSchoolSelect }: LandingPageProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<'login' | 'signup' | null>('signup');

  const handleUserTypeSelect = (userType: 'learner' | 'teacher' | 'student' | 'certification') => {
    if (userType === 'teacher') {
      // Teachers go to international school system
      onUserRoleSelect('teacher');
      onSchoolTypeSelect('international');
    } else if (userType === 'certification') {
      // Certification tests go to special page
      onCertificationTestsSelect();
    } else {
      // Learners and students go to korean school system
      onUserRoleSelect('student');
      onSchoolTypeSelect('korean');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-8">
              <button className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center space-x-1">
                <span>Explore</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  className="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Search"
                  type="search"
                />
              </div>
            </div>

            {/* Center - Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">Study Hub</span>
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
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Text content and image collage */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                N Study Hub boosts scores!
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                한국학교와 국제학교 학생들을 위한 맞춤형 교육 플랫폼<br />
                체계적인 학습 자료와 효율적인 관리 시스템으로 성공적인 학습을 지원합니다
              </p>
            </motion.div>

            {/* Image collage section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative max-w-md mx-auto lg:mx-0"
            >
              <div className="relative">
                {/* Background decorative shapes */}
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full opacity-70"></div>
                <div className="absolute top-8 -right-8 w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rotate-45 opacity-70"></div>
                <div className="absolute -bottom-8 left-1/3 w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 opacity-70" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
                
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
                  onClick={() => {}}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1692269725887-51e67bf1bed0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHNtaWxpbmclMjBjaGlsZHJlbiUyMHN0dWRlbnRzfGVufDF8fHx8MTc1ODYxMTg0NXww&ixlib=rb-4.1.0&q=80&w=200" 
                    alt="Happy smiling children students" 
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
                  onClick={() => {}}
                >
                  <img 
                    src="https://images.unsplash.com/flagged/photo-1574097656146-0b43b7660cb6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGtpZHMlMjBsZWFybmluZyUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NTg2MTE3NTJ8MA&ixlib=rb-4.1.0&q=80&w=300" 
                    alt="Young kids learning in classroom" 
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
                  onClick={() => {}}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1541802802036-1d572ba70147?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=150&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmltYXJ5JTIwc2Nob29sJTIwc3R1ZGVudHMlMjByZWFkaW5nfGVufDF8fHx8MTc1ODYxMTc1Mnww&ixlib=rb-4.1.0&q=80&w=150" 
                    alt="Primary school students reading" 
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

          {/* Right side - Sign up section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Start learning today by signing up!
              </h2>
              
              <div className="flex flex-col gap-5 max-w-2xl mx-auto lg:mx-0">
                {/* 한국학교 */}
                <motion.button
                  onClick={() => handleUserTypeSelect('learner')}
                  whileHover={{ 
                    scale: 1.06,
                    y: -10,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.96 }}
                  className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-5 text-left transition-all hover:border-gray-300"
                >
                  {/* Icon Box - Salmon/Orange */}
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-orange-200 border border-black/5">
                    <BookOpen className="w-6 h-6 text-gray-900" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                      한국학교
                    </h3>
                    <p className="text-[15px] text-gray-600 leading-relaxed">
                      내신, 특례, 서류전형
                    </p>
                  </div>
                </motion.button>
                
                {/* 국제학교 */}
                <motion.button
                  onClick={() => onInternationalSchoolSelect()}
                  whileHover={{ 
                    scale: 1.06,
                    y: -10,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.96 }}
                  className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-5 text-left transition-all hover:border-gray-300"
                >
                  {/* Icon Box - Lavender/Purple */}
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-200 border border-black/5">
                    <Globe className="w-6 h-6 text-gray-900" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                      국제학교
                    </h3>
                    <p className="text-[15px] text-gray-600 leading-relaxed">
                      AP, IB, A-level, IGCSE
                    </p>
                  </div>
                </motion.button>
                
                {/* 인증시험 */}
                <motion.button
                  onClick={() => handleUserTypeSelect('certification')}
                  whileHover={{ 
                    scale: 1.06,
                    y: -10,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.96 }}
                  className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-5 text-left transition-all hover:border-gray-300"
                >
                  {/* Icon Box - Green */}
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-200 border border-black/5">
                    <Award className="w-6 h-6 text-gray-900" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                      인증시험
                    </h3>
                    <p className="text-[15px] text-gray-600 leading-relaxed">
                      TOEFL, SAT, ACT, Voca등
                    </p>
                  </div>
                </motion.button>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-gray-600">
                  Are you a district admin? Learn more of our offerings on{" "}
                  <button 
                    onClick={() => onSchoolTypeSelect('international')}
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    our district page
                  </button>
                  .
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-50 to-emerald-50/40 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white font-bold">N</span>
                </div>
                <span className="text-gray-900 font-bold text-lg">Study Hub</span>
              </div>
              <p className="text-gray-600">
                Empowering learners worldwide with personalized education.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Courses</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Math</a></li>
                <li><a href="#" className="hover:text-gray-900">Science</a></li>
                <li><a href="#" className="hover:text-gray-900">English</a></li>
                <li><a href="#" className="hover:text-gray-900">Korean</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Careers</a></li>
                <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
              </ul>
            </div>
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