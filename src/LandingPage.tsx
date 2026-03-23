import { useState } from "react";
import { motion } from "motion/react";
import { Search, ChevronRight, BookOpen, Globe, Award, Users, TrendingUp, Star, Sparkles, CheckCircle } from "lucide-react";
import { BrandLogo, BrandIcon } from "./components/BrandLogo";
import { LoginModal } from "./components/auth/LoginModal";
import { SignupModal } from "./components/auth/SignupModal";
import MobileAdBanner from "./components/MobileAdBanner";

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
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4 sm:space-x-8">
              <button className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center space-x-1 text-sm sm:text-base">
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
              
              {/* Mobile auth buttons */}
              <div className="flex md:hidden items-center space-x-2">
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="text-xs px-3 py-1.5 rounded-md font-medium text-gray-600 bg-gray-100"
                >
                  로그인
                </button>
                <button 
                  onClick={() => setShowSignupModal(true)}
                  className="text-xs px-3 py-1.5 rounded-md font-medium text-white bg-cyan-600"
                >
                  가입
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-12 lg:py-20 pb-20 sm:pb-12">
        {/* Top Ad Banner */}
        <MobileAdBanner page="home" position="top" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left side - Text content and image collage - hidden on mobile */}
          <div className="hidden sm:block space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Smarter Prep.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-400">Better Scores.</span>
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8">
                한국학교와 국제학교 학생들을 위한 맞춤형 교육 플랫폼<br />
                체계적인 학습 자료와 효율적인 관리 시스템으로 성공적인 학습을 지원합니다
              </p>
            </motion.div>

            {/* Image collage section - hidden on mobile for cleaner look */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative w-full hidden sm:block mt-4"
            >
              <div className="relative h-56 lg:h-64">
                {/* Background decorative shapes */}
                <div className="absolute -top-5 -left-4 w-20 h-20 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-full opacity-60"></div>
                <div className="absolute top-10 right-[15%] w-7 h-7 bg-gradient-to-br from-cyan-400 to-teal-500 rotate-45 opacity-60"></div>
                <div className="absolute bottom-2 left-[45%] w-9 h-9 bg-gradient-to-br from-cyan-400 to-teal-400 opacity-60" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
                <div className="absolute top-2 right-[5%] w-5 h-5 bg-cyan-300 rounded-full opacity-40"></div>
                
                {/* Main circular image - left */}
                <motion.div 
                  className="absolute top-2 left-2 w-36 h-36 lg:w-44 lg:h-44 rounded-full overflow-hidden border-4 border-white shadow-xl cursor-pointer z-10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1758685733633-a12889098460?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHN0dWR5aW5nJTIwYnJpZ2h0JTIwY2xhc3Nyb29tfGVufDF8fHx8MTc3MjExOTMxOHww&ixlib=rb-4.1.0&q=80&w=500" 
                    alt="Children studying in bright classroom" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                
                {/* Large rectangular image - center right, tilted */}
                <motion.div 
                  className="absolute -top-2 left-32 lg:left-40 w-56 h-40 lg:w-72 lg:h-48 rounded-2xl overflow-hidden border-4 border-white shadow-xl transform rotate-3 cursor-pointer z-20"
                  whileHover={{ scale: 1.04, rotate: 5 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1574130303188-31a915382726?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBzdHVkZW50cyUyMG5vdGVib29rJTIwcGVuJTIwY2xhc3Nyb29tJTIwY2hlZXJmdWx8ZW58MXx8fHwxNzcyMTIyNDkwfDA&ixlib=rb-4.1.0&q=80&w=700" 
                    alt="Female students studying cheerfully in classroom" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                
                {/* Bottom circular image */}
                <motion.div 
                  className="absolute top-28 lg:top-32 left-20 lg:left-24 w-28 h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl cursor-pointer z-30"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1646495785840-7ff6be438d63?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWVuYWdlcnMlMjByZWFkaW5nJTIwZW5nbGlzaCUyMHRleHRib29rJTIwc2Nob29sfGVufDF8fHx8MTc3MjExOTMyM3ww&ixlib=rb-4.1.0&q=80&w=300" 
                    alt="Teenagers reading English textbook" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
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
              {/* Mobile compact title */}
              <div className="sm:hidden mb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">AllMyExam</h1>
                <p className="text-sm text-gray-500">맞춤형 교육 플랫폼으로 목표 점수를 달성하세요</p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6 hidden sm:block">
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
              
              <div className="mt-6 hidden sm:block">
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

        {/* Middle Ad Banner */}
        <MobileAdBanner page="home" position="middle" />

        {/* Mobile-only additional content to fill screen */}
        <div className="sm:hidden mt-8 space-y-5">
          {/* Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
              <div className="flex justify-center mb-1.5">
                <Users className="w-5 h-5 text-cyan-500" />
              </div>
              <p className="text-lg font-bold text-gray-900">2,500+</p>
              <p className="text-[11px] text-gray-500">수강생</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
              <div className="flex justify-center mb-1.5">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-gray-900">95%</p>
              <p className="text-[11px] text-gray-500">성적 향상</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
              <div className="flex justify-center mb-1.5">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-lg font-bold text-gray-900">4.9</p>
              <p className="text-[11px] text-gray-500">만족도</p>
            </div>
          </motion.div>

          {/* Why AllMyExam */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <h3 className="font-bold text-gray-900 text-sm">왜 AllMyExam인가요?</h3>
            </div>
            <div className="space-y-2.5">
              {[
                "과목별 맞춤 학습 자료 제공",
                "실전 모의고사 & 기출문제 분석",
                "1:1 학습 관리 및 상담 지원",
                "내신 + 입시 통합 관리 시스템"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Notice */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <h3 className="font-bold text-gray-900 text-sm mb-2">공지사항</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700 truncate flex-1">2025년 2학기 중간고사 자료 업데이트</span>
                <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">NEW</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700 truncate flex-1">SAT/TOEFL 최신 기출문제 추가</span>
                <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">NEW</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700 truncate flex-1">AP 과목별 핵심 정리 노트 업데이트</span>
                <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">02.20</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Ad Banner */}
        <MobileAdBanner page="home" position="bottom" />
      </main>

      {/* Footer */}
      <footer className="hidden md:block bg-gradient-to-r from-gray-50 to-emerald-50/40 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <BrandLogo size="sm" />
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