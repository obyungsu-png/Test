import imgRectangle3 from "figma:asset/c3ea6e378709aad25dc0663f0c420e3f85b4d22d.png";

interface HeroBannerProps {
  schoolType?: 'korean' | 'international' | null;
  isCertificationMode?: boolean;
}

export function HeroBanner({ schoolType, isCertificationMode }: HeroBannerProps) {
  // 사이트 타입에 따른 배너 메시지 설정
  const getBannerContent = () => {
    if (isCertificationMode) {
      return {
        title: "Achieve Excellence Beyond Limits",
        subtitle: "Transform Your Test Preparation Journey"
      };
    } else if (schoolType === 'international') {
      return {
        title: "Empowering Global Education",
        subtitle: "Your Gateway to Academic Excellence"
      };
    } else if (schoolType === 'korean') {
      return {
        title: "학습의 새로운 시작",
        subtitle: "더 나은 교육을 향한 여정"
      };
    } else {
      return {
        title: "학습의 새로운 시작",
        subtitle: "교육의 혁신을 만나보세요"
      };
    }
  };

  const bannerContent = getBannerContent();
  return (
    <div 
      className="relative h-16 sm:h-19 lg:h-24 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url('${imgRectangle3}')` }}
    >
      {/* Banner Text - positioned left */}
      <div className="absolute left-4 sm:left-6 lg:left-8 top-0 bottom-0 flex items-center">
        <div className="text-white">
          <h1 className="text-base sm:text-lg lg:text-2xl font-bold drop-shadow-lg">
            {bannerContent.title}
          </h1>
          <p className="text-xs sm:text-sm lg:text-base opacity-90 drop-shadow-md mt-1">
            {bannerContent.subtitle}
          </p>
        </div>
      </div>

    </div>
  );
}