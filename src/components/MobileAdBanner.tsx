import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, Megaphone, X } from "lucide-react";
import { fetchPageAds, type AdItem, type AdPosition } from "../utils/adsApi";

interface MobileAdBannerProps {
  page: 'home' | 'korean' | 'international' | 'certification';
  position: AdPosition;
}

const POSITION_LABELS: Record<AdPosition, string> = {
  top: '추천 학원',
  middle: '학원 광고',
  bottom: '추천 학원',
};

// 세션 동안 닫은 광고 ID를 추적
const dismissedAds = new Set<string>();

export default function MobileAdBanner({ page, position }: MobileAdBannerProps) {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadAds = async () => {
      try {
        setLoading(true);
        setHasError(false);
        const data = await fetchPageAds(page, position);
        if (!cancelled) {
          setAds(data.filter(ad => !dismissedAds.has(ad.id)));
        }
      } catch (error) {
        console.error('Error loading ads:', error);
        if (!cancelled) {
          setHasError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    loadAds();
    return () => { cancelled = true; };
  }, [page, position]);

  const handleDismiss = useCallback((adId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dismissedAds.add(adId);
    setAds(prev => prev.filter(ad => ad.id !== adId));
  }, []);

  if (loading) {
    return null; // 로딩 중에는 아무것도 표시하지 않음 (깜빡임 방지)
  }

  if (hasError || ads.length === 0) return null;

  // Top position: compact horizontal banner style
  if (position === 'top') {
    return (
      <div className="sm:hidden mt-4 mb-2">
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <span className="text-[9px] text-gray-400 uppercase tracking-widest">AD</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <AnimatePresence mode="popLayout">
          {ads.map((ad, index) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 80, height: 0, marginBottom: 0, transition: { duration: 0.3 } }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              className="mb-3"
              layout
            >
              <TopAdCard ad={ad} onDismiss={handleDismiss} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // Middle position: medium card style
  if (position === 'middle') {
    return (
      <div className="sm:hidden mt-5 mb-3">
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-5 h-5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-md flex items-center justify-center">
            <Megaphone className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-bold text-gray-700">{POSITION_LABELS.middle}</span>
          <div className="flex-1 h-px bg-gray-100 ml-1" />
          <span className="text-[9px] text-gray-400">AD</span>
        </div>
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {ads.map((ad, index) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 80, height: 0, transition: { duration: 0.3 } }}
                transition={{ delay: 0.12 * index, duration: 0.45 }}
                layout
              >
                <MiddleAdCard ad={ad} onDismiss={handleDismiss} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    );
  }

  // Bottom position: full featured card style
  return (
    <div className="sm:hidden mt-8 pb-24">
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
          <Megaphone className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-bold text-gray-800">{POSITION_LABELS.bottom}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-2" />
        <span className="text-[10px] text-gray-400">AD</span>
      </div>
      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {ads.map((ad, index) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 80, height: 0, transition: { duration: 0.3 } }}
              transition={{ delay: 0.15 * index, duration: 0.5 }}
              layout
            >
              <BottomAdCard ad={ad} onDismiss={handleDismiss} />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}

// ===== 닫기 버튼 공통 =====
interface DismissButtonProps {
  adId: string;
  onDismiss: (id: string, e: React.MouseEvent) => void;
  size?: 'sm' | 'md';
  className?: string;
}

function DismissButton({ adId, onDismiss, size = 'md', className = '' }: DismissButtonProps) {
  const sizeClasses = size === 'sm' 
    ? 'w-5 h-5' 
    : 'w-6 h-6';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <button
      onClick={(e) => onDismiss(adId, e)}
      className={`${sizeClasses} bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center 
        hover:bg-black/60 active:bg-black/70 transition-colors z-10 ${className}`}
      aria-label="광고 닫기"
    >
      <X className={`${iconSize} text-white`} />
    </button>
  );
}

// ===== Top: 컴팩트 가로형 배너 =====
function TopAdCard({ ad, onDismiss }: { ad: AdItem; onDismiss: (id: string, e: React.MouseEvent) => void }) {
  const handleClick = () => {
    if (ad.linkUrl) window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative group">
      <div
        onClick={handleClick}
        className={`bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 shadow-sm overflow-hidden flex ${
          ad.linkUrl ? 'cursor-pointer active:scale-[0.98] transition-transform duration-150' : ''
        }`}
      >
        {ad.imageUrl && (
          <div className="w-28 flex-shrink-0 overflow-hidden bg-gray-100 relative">
            <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
            <div className="absolute top-1 left-1 bg-black/50 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full">AD</div>
          </div>
        )}
        <div className="flex-1 p-3 flex flex-col justify-center min-w-0 pr-8">
          {ad.title && (
            <h4 className="text-[13px] font-bold text-gray-900 leading-tight truncate">{ad.title}</h4>
          )}
          {ad.description && (
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-snug">{ad.description}</p>
          )}
          {ad.linkUrl && (
            <div className="mt-1.5 flex items-center gap-1">
              <span className="text-[10px] font-semibold text-cyan-600">자세히 보기</span>
              <ExternalLink className="w-2.5 h-2.5 text-cyan-500" />
            </div>
          )}
        </div>
      </div>
      {/* X 닫기 버튼 */}
      <DismissButton adId={ad.id} onDismiss={onDismiss} size="sm" className="absolute top-2 right-2" />
    </div>
  );
}

// ===== Middle: 중간 크기 카드 =====
function MiddleAdCard({ ad, onDismiss }: { ad: AdItem; onDismiss: (id: string, e: React.MouseEvent) => void }) {
  const handleClick = () => {
    if (ad.linkUrl) window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative">
      <div
        onClick={handleClick}
        className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${
          ad.linkUrl ? 'cursor-pointer active:scale-[0.98] transition-transform duration-150' : ''
        }`}
      >
        {ad.imageUrl && (
          <div className="relative w-full aspect-[5/2] overflow-hidden bg-gray-100">
            <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">AD</div>
          </div>
        )}
        {ad.videoUrl && !ad.imageUrl && (
          <div className="w-full aspect-video overflow-hidden bg-black relative">
            <iframe src={ad.videoUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={ad.title} />
            <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">AD</div>
          </div>
        )}
        {(ad.title || ad.description) && (
          <div className="p-3 pr-8">
            {ad.title && <h4 className="text-[13px] font-bold text-gray-900 leading-snug">{ad.title}</h4>}
            {ad.description && <p className="text-[11px] text-gray-600 mt-1 leading-relaxed line-clamp-2">{ad.description}</p>}
            {ad.linkUrl && (
              <div className="mt-2 flex items-center gap-1">
                <span className="text-[11px] font-semibold text-cyan-600">자세히 보기</span>
                <ExternalLink className="w-3 h-3 text-cyan-500" />
              </div>
            )}
          </div>
        )}
        {ad.videoUrl && ad.imageUrl && (
          <div className="w-full aspect-video overflow-hidden bg-black border-t border-gray-100">
            <iframe src={ad.videoUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={ad.title} />
          </div>
        )}
      </div>
      {/* X 닫기 버튼 - 이미지 있으면 이미지 위, 없으면 카드 우상단 */}
      <DismissButton 
        adId={ad.id} 
        onDismiss={onDismiss} 
        size="sm" 
        className={ad.imageUrl ? "absolute top-2 right-2" : "absolute top-2 right-2"}
      />
    </div>
  );
}

// ===== Bottom: 풀 사이즈 카드 =====
function BottomAdCard({ ad, onDismiss }: { ad: AdItem; onDismiss: (id: string, e: React.MouseEvent) => void }) {
  const handleClick = () => {
    if (ad.linkUrl) window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative">
      <div
        onClick={handleClick}
        className={`bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden ${
          ad.linkUrl ? 'cursor-pointer active:scale-[0.98] transition-transform duration-150' : ''
        }`}
      >
        {ad.imageUrl && (
          <div className="relative w-full aspect-[2/1] overflow-hidden bg-gray-100">
            <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute top-2.5 left-2.5 bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide">AD</div>
          </div>
        )}
        {ad.videoUrl && !ad.imageUrl && (
          <div className="w-full aspect-video overflow-hidden bg-black relative">
            <iframe src={ad.videoUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={ad.title} />
            <div className="absolute top-2.5 left-2.5 bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide">AD</div>
          </div>
        )}
        {(ad.title || ad.description) && (
          <div className="p-4 pr-10">
            {ad.title && <h4 className="text-[15px] font-bold text-gray-900 leading-snug">{ad.title}</h4>}
            {ad.description && <p className="text-[13px] text-gray-600 mt-1.5 leading-relaxed">{ad.description}</p>}
            {ad.linkUrl && (
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-xs font-semibold text-cyan-600">자세히 보기</span>
                <ExternalLink className="w-3 h-3 text-cyan-500" />
              </div>
            )}
          </div>
        )}
        {ad.videoUrl && ad.imageUrl && (
          <div className="w-full aspect-video overflow-hidden bg-black border-t border-gray-100">
            <iframe src={ad.videoUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={ad.title} />
          </div>
        )}
      </div>
      {/* X 닫기 버튼 */}
      <DismissButton 
        adId={ad.id} 
        onDismiss={onDismiss} 
        size="md" 
        className={ad.imageUrl ? "absolute top-2.5 right-2.5" : "absolute top-2.5 right-2.5"}
      />
    </div>
  );
}