import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ArrowLeft, Layers, Globe, MessageSquare } from 'lucide-react';

interface KoreanSchoolPageProps {
  onBack: () => void;
  onSubjectSelect: (subject: string) => void;
  onInternationalSchoolClick?: () => void;
  onCertificationClick?: () => void;
}

const KoreanSchoolPage: React.FC<KoreanSchoolPageProps> = ({ onBack, onSubjectSelect, onInternationalSchoolClick, onCertificationClick }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const subjects = [
    {
      id: '국어',
      name: '내신',
      description: '교과 내신 성적 관리',
      icon: Layers,
      color: 'from-blue-50 to-indigo-50/50',
      hoverColor: 'hover:from-blue-100 hover:to-indigo-100/60',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      subtextColor: 'text-blue-600',
      iconColor: 'text-blue-600'
    },
    {
      id: '특례시험',
      name: '특례',
      description: '특례입학 전형 준비',
      icon: Globe,
      color: 'from-green-50 to-emerald-50/50',
      hoverColor: 'hover:from-green-100 hover:to-emerald-100/60',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      subtextColor: 'text-green-600',
      iconColor: 'text-green-600'
    },
    {
      id: '서류전형',
      name: '서류전형',
      description: '서류전형 대비',
      icon: MessageSquare,
      color: 'from-purple-50 to-violet-50/50',
      hoverColor: 'hover:from-purple-100 hover:to-violet-100/60',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      subtextColor: 'text-purple-600',
      iconColor: 'text-purple-600'
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">N</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Study Hub</span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={onInternationalSchoolClick}
                className="text-gray-500 hover:text-cyan-600 transition-colors"
              >
                국제학교
              </button>
              <span className="text-cyan-600 font-medium cursor-default">한국학교</span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Text content and image */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                한국 교육의 완벽한 지원!
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                내신부터 특례, 서류전형까지<br />
                한국 학생들을 위한 체계적인 학습 시스템
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
                    src="https://images.unsplash.com/photo-1722912010170-704c382ca530?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBoaWdoJTIwc2Nob29sJTIwc3R1ZGVudHMlMjBzdHVkeWluZyUyMHRvZ2V0aGVyfGVufDF8fHx8MTc1ODk5MDA3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                    alt="Korean high school students studying together" 
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
                    src="https://images.unsplash.com/photo-1660128357991-713518efae48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0dWRlbnRzJTIwY2xhc3Nyb29tJTIwbGVhcm5pbmclMjBib29rc3xlbnwxfHx8fDE3NTg5OTAwNzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                    alt="Asian students classroom learning books" 
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
                    src="https://images.unsplash.com/photo-1589872880544-76e896b0592c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB0ZWVuYWdlcnMlMjBob21ld29yayUyMHN0dWR5aW5nfGVufDF8fHx8MTc1ODk5MDA4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                    alt="Korean teenagers homework studying" 
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
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                전형 유형을 선택하세요
              </h2>
              <p className="text-gray-600">
                준비하고 있는 입시 전형을 선택해주세요
              </p>
            </motion.div>

            {/* Subject Grid - Card Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col gap-5 max-w-2xl mx-auto lg:mx-0"
            >
              {subjects.map((subject, index) => {
                const Icon = subject.icon;
                
                // Define background colors for icon boxes
                const iconBgColors = {
                  '내신': 'bg-blue-200',
                  '특례': 'bg-green-200', 
                  '서류전형': 'bg-purple-200'
                };
                
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
                    className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-5 text-left transition-all hover:border-gray-400"
                  >
                    {/* Icon Box */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgColors[subject.name as keyof typeof iconBgColors]}`}>
                      <Icon className="w-6 h-6 text-gray-900" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                        {subject.name}
                      </h3>
                      <p className="text-[15px] text-gray-600 leading-relaxed">
                        {subject.description}
                      </p>
                    </div>
                    
                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-3" />
                  </motion.button>
                );
              })}
            </motion.div>
            
            <div className="mt-6">
              <p className="text-sm text-gray-600 text-center lg:text-left">
                전형별 상세 정보가 필요하신가요?{" "}
                <button className="text-cyan-600 hover:text-cyan-700 hover:underline">
                  상담 신청하기
                </button>
                {" "}또는{" "}
                <button className="text-cyan-600 hover:text-cyan-700 hover:underline">
                  입시 가이드 보기
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-50 to-cyan-50/40 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="text-gray-900 font-bold">Study Hub</span>
              </div>
              <p className="text-gray-600 text-sm">
                한국 학생들의 성공적인 진학을 위한 완벽한 학습 지원 시스템.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">전형 안내</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-cyan-600 transition-colors">내신 관리</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">특례 전형</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">서류 전형</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">입시 일정</a></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">학습 지원</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-cyan-600 transition-colors">학습 자료</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">모의고사</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">진학 상담</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">고객 지원</a></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">커뮤니티</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-cyan-600 transition-colors">학습 그룹</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">입시 설명회</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">뉴스레터</a></li>
                <li><a href="#" className="hover:text-cyan-600 transition-colors">소셜 미디어</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default KoreanSchoolPage;