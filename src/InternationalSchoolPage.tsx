import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ArrowLeft, Calculator, Award, Globe, GraduationCap, BookOpen, FileText, PenTool, BarChart3, Lightbulb, TrendingUp } from 'lucide-react';
import MobileAdBanner from './components/MobileAdBanner';
import { BrandLogo } from './components/BrandLogo';

interface InternationalSchoolPageProps {
  onBack: () => void;
  onSubjectSelect: (subject: string) => void;
  onKoreanSchoolClick?: () => void;
  onCertificationClick?: () => void;
}

const InternationalSchoolPage: React.FC<InternationalSchoolPageProps> = ({ onBack, onSubjectSelect, onKoreanSchoolClick, onCertificationClick }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const subjects = [
    {
      id: 'GPA',
      name: 'GPA',
      description: '학점',
      icon: Calculator,
      bgColor: 'bg-blue-200'
    },
    {
      id: 'AP',
      name: 'AP',
      description: 'AP과정',
      icon: Award,
      bgColor: 'bg-purple-200'
    },
    {
      id: 'IB',
      name: 'IB',
      description: 'IB과정',
      icon: Globe,
      bgColor: 'bg-cyan-200'
    },
    {
      id: 'A-level',
      name: 'A-level',
      description: 'A레벨',
      icon: GraduationCap,
      bgColor: 'bg-indigo-200'
    },
    {
      id: 'AS',
      name: 'AS',
      description: 'AS과정',
      icon: BookOpen,
      bgColor: 'bg-emerald-200'
    },
    {
      id: 'IGCSE',
      name: 'IGCSE',
      description: 'IGCSE',
      icon: FileText,
      bgColor: 'bg-orange-200'
    },
    {
      id: 'Writing',
      name: 'Writing',
      description: '작문',
      icon: PenTool,
      bgColor: 'bg-rose-200'
    }
  ];

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    onSubjectSelect(subjectId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-3 sm:mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <BrandLogo size="md" />
            </div>
            <nav className="hidden md:flex space-x-8">
              <span className="text-cyan-600 font-medium cursor-default">국제학교</span>
              <button 
                onClick={onKoreanSchoolClick}
                className="text-gray-500 hover:text-cyan-600 transition-colors"
              >
                한국학교
              </button>
              <button 
                onClick={onCertificationClick}
                className="text-gray-500 hover:text-cyan-600 transition-colors"
              >
                인증시험 (TOEFL, SAT, ACT등)
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-12 lg:py-20 pb-20 sm:pb-12">
        {/* Top Ad Banner */}
        <MobileAdBanner page="international" position="top" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left side - Text content and image */}
          <div className="hidden sm:block space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Excel in international education!
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8">
                국제학교 교육과정을 위한 완벽한 학습 자료<br />
                GPA 관리부터 IB, AP, A-level까지 체계적인 학습 지원
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
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-70"></div>
                <div className="absolute top-8 -right-8 w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rotate-45 opacity-70"></div>
                <div className="absolute -bottom-8 left-1/3 w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 opacity-70" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
                
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
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwc3R1ZGVudHMlMjBzdHVkeWluZ3xlbnwxfHx8fDE3NTg4NjU0Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                    alt="International students studying" 
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
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNsYXNzcm9vbSUyMGxlYXJuaW5nfGVufDF8fHx8MTc1ODk1NzA3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                    alt="Students in classroom" 
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
                    src="https://images.unsplash.com/photo-1758685848208-e108b6af94cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwZXhhbSUyMHRlc3QlMjBwcmVwYXJhdGlvbnxlbnwxfHx8fDE3NTg5NTcyMDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                    alt="Student preparation" 
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

          {/* Right side - Subject selection grid */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              {/* Mobile compact title */}
              <div className="sm:hidden mb-2">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">국제학교</h1>
                <p className="text-sm text-gray-500">GPA, AP, IB, A-level 맞춤 학습</p>
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 hidden sm:block">
                Choose your curriculum
              </h2>
              <p className="text-gray-600 hidden sm:block">
                Select the international program you're studying
              </p>
            </motion.div>

            {/* Subject Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            >
              {subjects.map((subject, index) => {
                const Icon = subject.icon;
                return (
                  <motion.button
                    key={subject.id}
                    onClick={() => handleSubjectSelect(subject.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    whileHover={{ 
                      scale: 1.03,
                      y: -6,
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-5 text-center sm:text-left transition-all hover:border-gray-400"
                  >
                    {/* Icon Box */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${subject.bgColor} border border-black/5`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 sm:pt-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 sm:mb-1.5">
                        {subject.name}
                      </h3>
                      <p className="text-xs sm:text-[15px] text-gray-600 leading-relaxed">
                        {subject.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
            
            <div className="mt-6 hidden sm:block">
              <p className="text-sm text-gray-600 text-center lg:text-left">
                Need guidance on curriculum selection?{" "}
                <button className="text-cyan-600 hover:text-cyan-700 hover:underline">
                  Contact our advisors
                </button>
                {" "}or{" "}
                <button className="text-cyan-600 hover:text-cyan-700 hover:underline">
                  compare programs
                </button>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Middle Ad Banner */}
        <MobileAdBanner page="international" position="middle" />

        {/* Mobile-only additional content */}
        <div className="sm:hidden mt-8 space-y-5">
          {/* Curriculum Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100"
          >
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-cyan-600" />
              <h3 className="font-bold text-gray-900 text-sm">Curriculum Overview</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "AP", desc: "38개 과목, College Board 인증", color: "bg-purple-500" },
                { label: "IB", desc: "HL/SL 구분, Extended Essay", color: "bg-cyan-500" },
                { label: "A-level", desc: "Cambridge 기반, 영국 대학 입시", color: "bg-indigo-500" },
                { label: "IGCSE", desc: "국제 중등교육 인증 과정", color: "bg-orange-500" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white/70 rounded-lg p-2.5">
                  <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-gray-800">{item.label}</span>
                    <span className="text-[10px] text-gray-500 ml-1.5">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Study Stats */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
              <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">4.0+</p>
              <p className="text-[10px] text-gray-500">평균 GPA</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
              <Award className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">200+</p>
              <p className="text-[10px] text-gray-500">학습 자료</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
              <Lightbulb className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">50+</p>
              <p className="text-[10px] text-gray-500">Key Notes</p>
            </div>
          </motion.div>

          {/* Quick Tip */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <h3 className="font-bold text-gray-900 text-sm mb-2">Study Tip</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Focus on understanding key concepts first. Use Key Notes for quick reviews 
              and practice with past exam questions to identify weak areas before the exam period.
            </p>
          </motion.div>
        </div>

        {/* Bottom Ad Banner */}
        <MobileAdBanner page="international" position="bottom" />
      </main>

      {/* Footer */}
      <footer className="hidden md:block bg-gradient-to-r from-gray-50 to-cyan-50/40 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <BrandLogo size="xs" />
              <p className="text-gray-600 text-sm">
                Empowering international students with comprehensive curriculum support.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Curriculum</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-cyan-600 transition-colors">IB Program</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">AP Courses</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">A-levels</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">IGCSE</a></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-cyan-600 transition-colors">Academic Advising</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">Study Resources</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Connect</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-cyan-600 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">Events</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">Newsletter</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">Social Media</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-300 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-600">
              © 2025 AllMyExam. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InternationalSchoolPage;