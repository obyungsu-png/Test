import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Bell, Search, User, Settings, LogOut, Zap, ArrowLeft } from "lucide-react";

interface LMSHeaderProps {
  onExitClick?: () => void;
}

export default function LMSHeader({ onExitClick }: LMSHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 py-3 sm:py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-2xl flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
          </div>
          <span className="text-gray-600 text-base sm:text-lg lg:text-xl font-medium">All My Exam</span>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="검색어를 입력하세요..."
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Exit Button - 나가기 */}
          {onExitClick && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExitClick}
              className="flex items-center gap-1.5 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">나가기</span>
            </Button>
          )}

          {/* Mobile Search Button */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Search className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center min-w-6 min-h-6 border-2 border-white shadow-sm">
              3
            </span>
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span className="hidden sm:inline text-sm text-gray-700">관리자</span>
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User className="w-4 h-4 mr-2" />
                  프로필
                </a>
                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Settings className="w-4 h-4 mr-2" />
                  설정
                </a>
                <hr className="my-1" />
                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}