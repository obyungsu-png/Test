import { Home, BookOpen, Globe, Award } from "lucide-react";
import { useState, useEffect } from "react";

type PageType = 'landing' | 'korean' | 'international' | 'certification' | 'main' | 'lms' | 'component3' | 'component4' | 'component5';

interface MobileBottomNavProps {
  currentPage: PageType;
  onNavigate: (page: 'landing' | 'korean' | 'international' | 'certification') => void;
}

const navItems = [
  { id: 'landing' as const, label: 'Home', icon: Home, activePages: ['landing'] as PageType[] },
  { id: 'korean' as const, label: '한국학교', icon: BookOpen, activePages: ['korean'] as PageType[] },
  { id: 'international' as const, label: '국제학교', icon: Globe, activePages: ['international', 'component5'] as PageType[] },
  { id: 'certification' as const, label: '인증시험', icon: Award, activePages: ['certification', 'component3', 'component4'] as PageType[] },
];

export function MobileBottomNav({ currentPage, onNavigate }: MobileBottomNavProps) {
  const [isVocaTestActive, setIsVocaTestActive] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  useEffect(() => {
    const handleVocaTestStart = () => setIsVocaTestActive(true);
    const handleVocaTestEnd = () => setIsVocaTestActive(false);
    const handleAiChatOpen = () => setIsAiChatOpen(true);
    const handleAiChatClose = () => setIsAiChatOpen(false);

    window.addEventListener('vocaTestStart', handleVocaTestStart);
    window.addEventListener('vocaTestEnd', handleVocaTestEnd);
    window.addEventListener('aiChatOpen', handleAiChatOpen);
    window.addEventListener('aiChatClose', handleAiChatClose);

    return () => {
      window.removeEventListener('vocaTestStart', handleVocaTestStart);
      window.removeEventListener('vocaTestEnd', handleVocaTestEnd);
      window.removeEventListener('aiChatOpen', handleAiChatOpen);
      window.removeEventListener('aiChatClose', handleAiChatClose);
    };
  }, []);

  // Voca 테스트 or AI 채팅 열릴 때 탭바 숨김
  if (isVocaTestActive || isAiChatOpen) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] md:hidden">
      <div className="flex items-center justify-around h-16 px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.activePages.includes(currentPage) || 
            (item.id === 'landing' && currentPage === 'main') ||
            (item.id === 'landing' && currentPage === 'lms');
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                isActive 
                  ? 'text-cyan-600' 
                  : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}