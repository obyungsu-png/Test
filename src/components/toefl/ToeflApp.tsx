import { useState } from "react";
import { ArrowLeft, BookOpen, FileText, Headphones, Mic, PenTool, BarChart3, Clock, Target, ChevronRight } from "lucide-react";

interface ToeflAppProps {
  onClose: () => void;
}

type ToeflPage = 'home' | 'reading' | 'listening' | 'speaking' | 'writing' | 'practice' | 'analytics';

export default function ToeflApp({ onClose }: ToeflAppProps) {
  const [currentPage, setCurrentPage] = useState<ToeflPage>('home');

  const sections = [
    { id: 'reading' as ToeflPage, title: 'Reading', subtitle: '독해 영역', icon: BookOpen, color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-700', count: 0 },
    { id: 'listening' as ToeflPage, title: 'Listening', subtitle: '듣기 영역', icon: Headphones, color: 'bg-purple-500', lightColor: 'bg-purple-50 text-purple-700', count: 0 },
    { id: 'speaking' as ToeflPage, title: 'Speaking', subtitle: '말하기 영역', icon: Mic, color: 'bg-green-500', lightColor: 'bg-green-50 text-green-700', count: 0 },
    { id: 'writing' as ToeflPage, title: 'Writing', subtitle: '쓰기 영역', icon: PenTool, color: 'bg-orange-500', lightColor: 'bg-orange-50 text-orange-700', count: 0 },
  ];

  const quickActions = [
    { title: 'Past Papers', subtitle: '기출문제 모음', icon: FileText, color: 'text-cyan-600' },
    { title: '1타 강사님들', subtitle: '인기 강사 목록', icon: Target, color: 'text-cyan-600' },
    { title: 'Practice Test', subtitle: '모의고사', icon: Clock, color: 'text-cyan-600' },
    { title: 'Score Analytics', subtitle: '성적 분석', icon: BarChart3, color: 'text-cyan-600' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={currentPage === 'home' ? onClose : () => setCurrentPage('home')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">TOEFL VIP 콘텐츠룸</h1>
            <p className="text-xs text-gray-500 font-extrabold tracking-tight">AllMyExam</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full font-medium">VIP</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {currentPage === 'home' && (
          <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">TOEFL iBT 완벽 대비</h2>
              <p className="text-cyan-100 text-sm sm:text-base">Reading, Listening, Speaking, Writing 4개 영역 통합 학습</p>
              <div className="flex gap-4 mt-4">
                <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold">120</div>
                  <div className="text-xs text-cyan-100">만점</div>
                </div>
                <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold">3h</div>
                  <div className="text-xs text-cyan-100">시험시간</div>
                </div>
                <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold">4</div>
                  <div className="text-xs text-cyan-100">영역</div>
                </div>
              </div>
            </div>

            {/* Section Cards */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">영역별 학습</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setCurrentPage(section.id)}
                    className="bg-white rounded-xl p-4 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all text-left flex items-center gap-4 group"
                  >
                    <div className={`w-12 h-12 ${section.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900">{section.title}</h4>
                        <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-medium">{section.count}</span>
                      </div>
                      <p className="text-sm text-gray-500">{section.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">빠른 메뉴</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    className="bg-white rounded-xl p-4 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all text-center space-y-2"
                  >
                    <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center mx-auto">
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{action.title}</p>
                      <p className="text-xs text-gray-500">{action.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Placeholder notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-sm text-yellow-700">
                TOEFL 콘텐츠가 통합되면 이 자리에 실제 학습 자료가 표시됩니다.
              </p>
            </div>
          </div>
        )}

        {/* Sub pages - placeholder for now */}
        {currentPage !== 'home' && (
          <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
              {(() => {
                const section = sections.find(s => s.id === currentPage);
                if (section) {
                  return (
                    <>
                      <div className={`w-16 h-16 ${section.color} rounded-2xl flex items-center justify-center mx-auto`}>
                        <section.icon className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                      <p className="text-gray-500">{section.subtitle} 콘텐츠가 여기에 표시됩니다</p>
                    </>
                  );
                }
                return (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">{currentPage}</h2>
                    <p className="text-gray-500">콘텐츠 준비 중입니다</p>
                  </>
                );
              })()}
              <button
                onClick={() => setCurrentPage('home')}
                className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}