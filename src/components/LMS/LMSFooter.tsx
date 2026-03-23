export default function LMSFooter() {
  return (
    <div className="bg-white border-t border-gray-200 py-6 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="flex items-center text-sm text-gray-500">
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 w-5 h-5 rounded flex items-center justify-center mr-1">
              <div className="text-white font-bold text-xs">⚡</div>
            </div>
            <span className="ml-1 text-gray-600">CMS</span>
          </div>
          <span>© 2024 서준 02 CMS. All rights reserved.</span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <a href="#" className="text-gray-600 hover:text-gray-900">도움말</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">문의하기</a>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500">v1.0.0</span>
        </div>
      </div>
    </div>
  );
}