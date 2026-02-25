import imgRectangle5 from "figma:asset/41377fcd25743885e722218bbe526e5e432b8a58.png";

interface FooterProps {
  onLMSClick?: () => void;
}

export function Footer({ onLMSClick }: FooterProps) {
  return (
    <div className="bg-white border-t border-gray-200">
      {/* Contact info */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-black flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-8">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
            <span className="text-gray-800">상담문의</span>
            <span className="text-gray-800">18805456163</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-gray-500">
            <span>월~금</span>
            <span className="text-sm">11:00 ~ 18:00 (주말, 공휴일 휴무)</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 lg:space-x-8">
          <a href="#" className="text-gray-800 hover:text-gray-600">이용약관</a>
          <a href="#" className="text-cyan-600 hover:text-cyan-800">개인정보처리방침</a>
          <a href="#" className="text-gray-800 hover:text-gray-600">고객센터</a>
        </div>
      </div>
      
      {/* Company info */}
      <div className="px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-20">
        <div className="flex items-center">
          <span className="text-cyan-600 font-bold text-lg mr-2">N</span>
          <button 
            onClick={onLMSClick}
            className="w-32 h-9 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <span className="text-white font-bold text-sm">N Study Hub</span>
          </button>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-gray-500">
            N Study Hub 교육 대표:김학습
          </p>
          <p className="text-gray-300">
            Copyright ⓒ2025 N Study Hub.com all rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}