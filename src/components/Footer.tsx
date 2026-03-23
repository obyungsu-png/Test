import { useState, useEffect } from "react";
import imgRectangle5 from "figma:asset/41377fcd25743885e722218bbe526e5e432b8a58.png";
import { BrandLogo, BrandIcon } from "./BrandLogo";
import { MessageCircle, Send, Zap } from "lucide-react";

interface FooterProps {
  onLMSClick?: () => void;
}

export function Footer({ onLMSClick }: FooterProps) {
  const [showQRModal, setShowQRModal] = useState<'wechat' | 'telegram' | null>(null);
  const [qrImages, setQrImages] = useState<{ wechat: string; telegram: string }>({ wechat: '', telegram: '' });

  useEffect(() => {
    const saved = localStorage.getItem('contact_qr_images');
    if (saved) {
      setQrImages(JSON.parse(saved));
    }
    const handleUpdate = () => {
      const updated = localStorage.getItem('contact_qr_images');
      if (updated) setQrImages(JSON.parse(updated));
    };
    window.addEventListener('qrImagesUpdated', handleUpdate);
    return () => window.removeEventListener('qrImagesUpdated', handleUpdate);
  }, []);

  return (
    <div className="hidden md:block bg-white border-t border-gray-200">
      {/* Contact info */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-black flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-8">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
            <span className="text-gray-800">상담문의</span>
            <span className="text-gray-800">18805456163</span>
            {/* WeChat & Telegram QR Buttons */}
            <div className="flex items-center gap-2 ml-0 sm:ml-2">
              <button
                onClick={() => setShowQRModal('wechat')}
                className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium hover:bg-green-100 transition-colors border border-green-200"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WeChat
              </button>
              <button
                onClick={() => setShowQRModal('telegram')}
                className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <Send className="w-3.5 h-3.5" />
                Telegram
              </button>
            </div>
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
      <div className="px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-16">
        <div className="flex items-center">
          <button 
            onClick={onLMSClick}
            className="group relative h-11 px-6 bg-white hover:bg-gray-50 rounded-xl flex items-center gap-2.5 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-gray-200"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 via-transparent to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-sm shadow-cyan-500/30">
                <Zap className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-gray-900 text-sm font-bold tracking-tight">All</span>
                <span className="text-cyan-500 text-sm font-bold tracking-tight">My</span>
                <span className="text-teal-500 text-sm font-bold tracking-tight">Exam</span>
              </div>
            </div>
          </button>
        </div>
        <div className="space-y-1.5 text-sm">
          <p className="text-gray-500 font-medium">
            AllMyExam 교육 대표:김학습
          </p>
          <p className="text-gray-300 text-xs">
            Copyright ⓒ2025 AllMyExam.com all rights reserved.
          </p>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowQRModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${
                showQRModal === 'wechat' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-600'
              }`}>
                {showQRModal === 'wechat' ? <MessageCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {showQRModal === 'wechat' ? 'WeChat (微信)' : 'Telegram'}
              </div>
              <div className="w-56 h-56 mx-auto bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {qrImages[showQRModal] ? (
                  <img src={qrImages[showQRModal]} alt={`${showQRModal} QR`} className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center px-4">
                    <div className="text-gray-400 text-3xl mb-2">📱</div>
                    <p className="text-xs text-gray-400">QR 코드가 아직 등록되지 않았습니다</p>
                    <p className="text-[10px] text-gray-300 mt-1">LMS에서 등록해주세요</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {showQRModal === 'wechat' ? 'WeChat 앱에서 스캔하세요' : 'Telegram 앱에서 스캔하세요'}
              </p>
              <button
                onClick={() => setShowQRModal(null)}
                className="mt-4 px-6 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}