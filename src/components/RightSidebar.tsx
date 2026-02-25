import newImage from "figma:asset/8bc36723adfdb73ad837d572835472d883e3694c.png";

export function RightSidebar() {
  return (
    <div className="w-72">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm relative">
        {/* 배경 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 z-10"></div>
        
        {/* 이미지 */}
        <img 
          src={newImage} 
          alt="학습하는 학생 - 헤드폰을 쓰고 노트북으로 공부하는 모습" 
          className="w-full h-36 object-cover relative z-20 mix-blend-multiply opacity-75"
        />
        
        {/* My Contents 텍스트 오버레이 */}
        <div className="absolute inset-0 z-30 flex flex-col justify-end p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-green-200">
            <h3 className="text-green-800 text-lg font-semibold">My Contents</h3>
            <p className="text-green-600 text-sm">나만의 학습 콘텐츠</p>
          </div>
        </div>
      </div>
    </div>
  );
}