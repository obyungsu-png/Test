import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  FileText, 
  BarChart3, 
  Calendar,
  Globe,
  Upload,
  Download,
  Tags
} from "lucide-react";

interface LMSSidebarProps {
  selectedMenu: string;
  onMenuSelect: (menu: string) => void;
}

export default function LMSSidebar({ selectedMenu, onMenuSelect }: LMSSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
    { id: "users", label: "회원 관리", icon: Users },
    { id: "content", label: "콘텐츠 관리", icon: BookOpen },
    { id: "categories", label: "카테고리 관리", icon: Tags },
    { id: "site-management", label: "사이트 관리", icon: Globe },
    { id: "upload", label: "자료 업로드", icon: Upload },
    { id: "downloads", label: "다운로드 관리", icon: Download },
    { id: "reports", label: "리포트", icon: BarChart3 },
    { id: "schedule", label: "일정 관리", icon: Calendar },
    { id: "notices", label: "공지사항", icon: FileText },
    { id: "settings", label: "시스템 설정", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4">
        <h2 className="text-lg text-gray-800 mb-6">학습 관리 시스템</h2>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onMenuSelect(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedMenu === item.id
                    ? "bg-cyan-50 text-cyan-700 border-r-2 border-cyan-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-sm text-gray-600 mb-2">빠른 통계</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">총 회원:</span>
              <span className="text-gray-800 font-medium">1,234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">활성 회원:</span>
              <span className="text-green-600 font-medium">987</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">총 자료:</span>
              <span className="text-blue-600 font-medium">456</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}