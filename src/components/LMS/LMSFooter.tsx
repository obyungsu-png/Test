export default function LMSFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-4 lg:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="text-purple-600 font-bold mr-1">서준</span>
            <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">02</span>
            </div>
            <span className="ml-1 text-gray-600">LMS</span>
          </div>
          <span>© 2024 서준 02 LMS. All rights reserved.</span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <a href="#" className="text-gray-600 hover:text-gray-900">도움말</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">문의하기</a>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}