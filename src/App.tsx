import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
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
import { supabase } from "./utils/supabase/client";
import { setCurrentUser, clearCurrentUser } from "./utils/subscriptionUtils";
import { useSession } from "./session/SessionContext";

const LMS_PASSWORD = "sw21qa00";

// ─── LMS 비밀번호 게이트 ───
function LMSGate() {
  const { lmsUnlocked, setLmsUnlocked } = useSession();
  const navigate = useNavigate();
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);

  if (lmsUnlocked) return <Outlet />;

  const handleSubmit = () => {
    if (pwInput === LMS_PASSWORD) {
      setLmsUnlocked(true);
      setPwError(false);
      setPwInput("");
    } else {
      setPwError(true);
      setPwInput("");
    }
  };

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
              value={pwInput}
              onChange={(e) => {
                setPwInput(e.target.value);
                setPwError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="비밀번호"
              autoFocus
              className={`w-full px-4 py-3 text-base border-2 rounded-xl outline-none transition-all ${
                pwError ? "border-red-400 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-purple-500"
              }`}
            />
            {pwError && <p className="text-red-500 text-sm mt-1.5 font-medium">❌ 비밀번호가 틀렸습니다.</p>}
          </div>
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-base font-bold rounded-xl transition-colors"
          >
            입력
          </button>
          <button
            onClick={() => {
              navigate("/");
              setPwInput("");
              setPwError(false);
            }}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-xl transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LMS 레이아웃 (상단 버튼 + LMSApp) ───
function LMSLayout() {
  const { setLmsUnlocked } = useSession();
  const navigate = useNavigate();

  return (
    <>
      <div className="fixed top-3 right-40 sm:top-4 sm:right-48 z-50 space-x-2 flex">
        <Button
          onClick={() => {
            const lastUrl = sessionStorage.getItem("lastMainUrl") || "/app/international/GPA";
            navigate(lastUrl);
          }}
          variant="outline"
          className="bg-white shadow-lg text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-3 min-h-10 sm:min-h-12"
        >
          <span className="hidden sm:inline">서준 01 사이트</span>
          <span className="sm:hidden">서준01</span>
        </Button>
        <Button
          onClick={() => {
            setLmsUnlocked(false);
            navigate("/");
          }}
          variant="outline"
          className="bg-purple-50 border-purple-200 text-purple-700 shadow-lg text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-3 min-h-10 sm:min-h-12"
        >
          <span className="hidden sm:inline">홈으로</span>
          <span className="sm:hidden">홈</span>
        </Button>
      </div>
      <LMSApp />
    </>
  );
}

// ─── Component3/4/5 라우트 래퍼 ───
function Component3Route() {
  const navigate = useNavigate();
  return <Component3Page onClose={() => navigate(sessionStorage.getItem("lastMainUrl") || "/")} />;
}
function Component4Route() {
  const navigate = useNavigate();
  return <Component4Page onClose={() => navigate(sessionStorage.getItem("lastMainUrl") || "/")} />;
}
function Component5Route() {
  const navigate = useNavigate();
  return <Component5Page onClose={() => navigate(sessionStorage.getItem("lastMainUrl") || "/")} />;
}

export default function App() {
  // ─── Supabase 인증 상태 관리 ───
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setCurrentUser(session.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setCurrentUser(session.user.email);
      } else {
        clearCurrentUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    link.href = url;

    return () => URL.revokeObjectURL(url);
  }, []);

  return (
    <>
      <div className="pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/korean" element={<KoreanSchoolPage />} />
          <Route path="/international" element={<InternationalSchoolPage />} />
          <Route path="/certification" element={<CertificationTestsPage />} />
          <Route path="/toefl" element={<Component3Route />} />
          <Route path="/sat" element={<Component4Route />} />
          <Route path="/site" element={<Component5Route />} />
          <Route path="/lms" element={<LMSGate />}>
            <Route index element={<Navigate to="/lms/dashboard" replace />} />
            <Route path=":menu" element={<LMSLayout />} />
          </Route>
          <Route path="/app/:mode/:subject/:tab?" element={<MainApp />} />
          <Route path="/app/:mode/:subject" element={<MainApp />} />
          <Route path="/app/:mode" element={<MainApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <MobileBottomNav />
    </>
  );
}
