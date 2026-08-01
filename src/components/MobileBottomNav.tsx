import { Home, BookOpen, Globe, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { id: "landing", label: "Home", icon: Home, path: "/" },
  { id: "korean", label: "한국학교", icon: BookOpen, path: "/korean" },
  { id: "international", label: "국제학교", icon: Globe, path: "/international" },
  { id: "certification", label: "인증시험", icon: Award, path: "/certification" },
] as const;

function getActiveNav(pathname: string): string {
  if (pathname === "/") return "landing";
  if (pathname.startsWith("/korean") || pathname.startsWith("/app/korean")) return "korean";
  if (pathname.startsWith("/international") || pathname.startsWith("/app/international")) return "international";
  if (pathname.startsWith("/certification") || pathname.startsWith("/app/cert")) return "certification";
  return "landing";
}

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVocaTestActive, setIsVocaTestActive] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  useEffect(() => {
    const handleVocaTestStart = () => setIsVocaTestActive(true);
    const handleVocaTestEnd = () => setIsVocaTestActive(false);
    const handleAiChatOpen = () => setIsAiChatOpen(true);
    const handleAiChatClose = () => setIsAiChatOpen(false);

    window.addEventListener("vocaTestStart", handleVocaTestStart);
    window.addEventListener("vocaTestEnd", handleVocaTestEnd);
    window.addEventListener("aiChatOpen", handleAiChatOpen);
    window.addEventListener("aiChatClose", handleAiChatClose);

    return () => {
      window.removeEventListener("vocaTestStart", handleVocaTestStart);
      window.removeEventListener("vocaTestEnd", handleVocaTestEnd);
      window.removeEventListener("aiChatOpen", handleAiChatOpen);
      window.removeEventListener("aiChatClose", handleAiChatClose);
    };
  }, []);

  // 라우트별 숨김: /lms, /toefl, /sat, /site
  const hideRoutes = ["/lms", "/toefl", "/sat", "/site"];
  if (hideRoutes.some((r) => location.pathname.startsWith(r)) || isVocaTestActive || isAiChatOpen) {
    return null;
  }

  const activeId = getActiveNav(location.pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] md:hidden">
      <div className="flex items-center justify-around h-16 px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                isActive ? "text-cyan-600" : "text-gray-400"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
              <span className={`text-[10px] leading-tight ${isActive ? "font-bold" : "font-medium"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
