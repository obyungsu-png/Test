import { useState } from "react";
import { ArrowLeft, Search, ChevronDown } from "lucide-react";

interface ToeflAppProps {
  onBack: () => void;
}

// 탭 목록
const tabs = [
  { id: "all", label: "전체보기", count: 0 },
  { id: "practice", label: "Practice Tests", count: 0 },
  { id: "mock", label: "Mock Exams", count: 0 },
  { id: "past", label: "Past Papers", count: 0 },
  { id: "instructors", label: "1타 강사님들", count: 0 },
];

export default function ToeflApp({ onBack }: ToeflAppProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("전체");

  return (
    <div className="min-h-screen bg-white">
      {/* Back button */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-gray-600 hover:text-cyan-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>돌아가기</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "text-gray-900 border-b-2 border-cyan-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-red-500 font-semibold align-super">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subject Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Subject header with VIP button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Subject</h2>
            <span className="bg-cyan-100 text-cyan-700 px-3 py-1 text-sm rounded-full font-medium">
              총 0개
            </span>
          </div>
          <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm">
            VIP 콘텐츠룸
          </button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option>전체</option>
              <option>Reading</option>
              <option>Listening</option>
              <option>Speaking</option>
              <option>Writing</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="Subject 검색어를 입력해 주세요."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
            />
            <button className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 border-l border-gray-300 font-medium transition-colors">
              검색
            </button>
          </div>
        </div>

        {/* Table header */}
        <div className="border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
            <span className="text-sm font-medium text-gray-700">제목</span>
            <span className="text-sm font-medium text-gray-700">자료관리</span>
          </div>

          {/* Empty state */}
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            등록된 콘텐츠가 없습니다.
          </div>
        </div>
      </div>
    </div>
  );
}
