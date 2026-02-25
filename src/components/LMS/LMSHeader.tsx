import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Bell, Search, User, Settings, LogOut } from "lucide-react";

export default function LMSHeader() {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 h-16 sm:h-18 lg:h-20 px-3 sm:px-4 lg:px-6 flex items-center justify-between shadow-sm">
      {/* Logo and Title */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="flex items-center">
          <span className="text-blue-600 font-bold text-xl sm:text-2xl lg:text-3xl mr-1 sm:mr-2">서준</span>
          <div className="h-9 w-14 sm:h-12 sm:w-18 lg:h-14 lg:w-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm sm:text-base lg:text-lg">02</span>
          </div>
          <span className="ml-2 sm:ml-3 text-gray-600 text-base sm:text-lg lg:text-xl hidden sm:inline font-medium">LMS</span>
        </div>
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
    </header>
  );
}