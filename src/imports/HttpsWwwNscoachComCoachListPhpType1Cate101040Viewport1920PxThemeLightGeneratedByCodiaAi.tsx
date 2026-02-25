import svgPaths from "./svg-vlzq6nziw7";
import imgRectangle from "figma:asset/5ec0ad51783f7d922cc7ed00747456b04e764c51.png";
import imgRectangle1 from "figma:asset/7fdcd38dc8fc12623bb87eda47c3f957d8a23210.png";
import imgRectangle2 from "figma:asset/591046dc38db451f7bc7e2298e1657adbe85e2ed.png";
import imgRectangle3 from "figma:asset/c3ea6e378709aad25dc0663f0c420e3f85b4d22d.png";
import imgRectangle4 from "figma:asset/4e911298528637b328e14e09d70f20ade8bc8f54.png";
import imgRectangle5 from "figma:asset/41377fcd25743885e722218bbe526e5e432b8a58.png";
import imgRectangle6 from "figma:asset/a75d31356212df2ff2ea5e9cd4ffd77bc55d8ca5.png";
import imgRectangle7 from "figma:asset/c17f792dfb562f3f1ceb7fe1a32996b70af025ce.png";
import imgRectangle8 from "figma:asset/f06e219f8e82f3e00e4ea8dc84754a43dfbaccff.png";
import imgRectangle9 from "figma:asset/fb55a08fd37dd174518db51afaac9f5839666a76.png";
import imgRectangle10 from "figma:asset/97e0b68ed147898447d011fa22aaf5a5dab556ff.png";
import imgRectangle11 from "figma:asset/e93a6452dfb2430a584a6fd8980d4ecd8656854c.png";

function Frame() {
  return (
    <div className="absolute h-3 left-0 top-0 w-[10.011px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 12">
        <g clipPath="url(#clip0_1_399)" id="Frame">
          <path d={svgPaths.p3e0abc00} fill="var(--fill-0, #40CE6E)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_399">
            <rect fill="white" height="12" width="10.011" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Svg() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3 left-[16.99px] overflow-clip top-3.5 w-[10.011px]" data-name="SVG">
      <Frame />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-10 left-0 overflow-clip top-0 w-[299px]" data-name="Container">
      <Svg />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-10 leading-[0] left-[60px] not-italic text-[#707370] text-[12.01px] top-0 tracking-[-0.5px] w-[239px]">
        <p className="leading-[40px]">[공지] 2025년 2학기 중간고사 콘텐츠 업로드 안내</p>
      </div>
    </div>
  );
}

function PseudoBeforeBackgroundColor() {
  return <div className="absolute bg-[#666666] h-[11px] left-[45.5px] top-0.5 w-px" data-name="Pseudo::before+BackgroundColor" />;
}

function ListItemLink() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[15px] left-[25px] top-[11.5px] w-[47px]" data-name="ListItem / Link">
      <PseudoBeforeBackgroundColor />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-5 leading-[0] left-0 not-italic text-[11.775px] text-white top-[-2.5px] tracking-[-0.5px] w-[31.5px]">
        <p className="leading-[20px]">로그인</p>
      </div>
    </div>
  );
}

function PseudoBeforeBackgroundColor1() {
  return <div className="absolute bg-[#666666] h-[11px] left-[71px] top-0.5 w-px" data-name="Pseudo::before+BackgroundColor" />;
}

function ListItemLink1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[15px] left-[71.5px] top-[11.5px] w-[72px]" data-name="ListItem / Link">
      <PseudoBeforeBackgroundColor1 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-5 leading-[0] left-[15px] not-italic text-[11.817px] text-white top-[-2.5px] tracking-[-0.5px] w-[42px]">
        <p className="leading-[20px]">회원가입</p>
      </div>
    </div>
  );
}

function ContainerUnorderedListBackgroundColor() {
  return (
    <div className="absolute bg-black h-10 left-[974.5px] rounded-bl-[20px] rounded-br-[20px] top-0 w-[226px]" data-name="Container / Unordered List+BackgroundColor">
      <ListItemLink />
      <ListItemLink1 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[21px] leading-[0] left-[143.5px] not-italic text-[13px] text-white top-[9.5px] tracking-[-0.5px] w-[57px]">
        <p className="leading-[20px]">고객센터</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-10 left-[360px] top-0 w-[1200px]" data-name="Container">
      <Container />
      <ContainerUnorderedListBackgroundColor />
    </div>
  );
}

function ContainerBackgroundColor() {
  return (
    <div className="absolute bg-[#f6f6f6] h-10 left-0 top-0 w-[1920px]" data-name="Container+BackgroundColor">
      <div className="h-10 overflow-clip relative w-[1920px]">
        <Container1 />
      </div>
      <div aria-hidden="true" className="absolute border-[#ebecee] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Heading1LinkImage() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 overflow-clip top-[17.5px] w-[195px]" data-name="Heading 1 / Link / Image">
      <div className="absolute bg-center bg-cover bg-no-repeat h-[55px] left-0 top-0 w-[195px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle}')` }} />
    </div>
  );
}

function PseudoBeforeBackgroundColor2() {
  return <div className="absolute bg-[#212121] left-0 rounded-[100px] size-[3px] top-[44.5px]" data-name="Pseudo::before+BackgroundColor" />;
}

function ListItemLink2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[92px] left-[136px] top-[-36px] w-[73px]" data-name="ListItem / Link">
      <PseudoBeforeBackgroundColor2 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[22px] leading-[0] left-5 not-italic text-[#212121] text-[18.205px] top-[35px] tracking-[-0.5px] w-[33px]">
        <p className="leading-[22px]">국어</p>
      </div>
    </div>
  );
}

function PseudoBeforeBackgroundColor3() {
  return <div className="absolute bg-[#212121] left-0 rounded-[100px] size-[3px] top-[44.5px]" data-name="Pseudo::before+BackgroundColor" />;
}

function ListItemLink3() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[92px] left-[209px] top-[-36px] w-[73px]" data-name="ListItem / Link">
      <PseudoBeforeBackgroundColor3 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[22px] leading-[0] left-5 not-italic text-[#212121] text-[18.205px] top-[35px] tracking-[-0.5px] w-[33px]">
        <p className="leading-[22px]">영어</p>
      </div>
    </div>
  );
}

function PseudoBeforeBackgroundColor4() {
  return <div className="absolute bg-[#212121] left-0 rounded-[100px] size-[3px] top-[44.5px]" data-name="Pseudo::before+BackgroundColor" />;
}

function ListItemLink4() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[92px] left-[282px] top-[-36px] w-[73px]" data-name="ListItem / Link">
      <PseudoBeforeBackgroundColor4 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[22px] leading-[0] left-5 not-italic text-[#212121] text-[18.205px] top-[35px] tracking-[-0.5px] w-[33px]">
        <p className="leading-[22px]">수학</p>
      </div>
    </div>
  );
}

function PseudoBeforeBackgroundColor5() {
  return <div className="absolute bg-[#212121] left-0 rounded-[100px] size-[3px] top-[44.5px]" data-name="Pseudo::before+BackgroundColor" />;
}

function ListItemLink5() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[92px] left-[355px] top-[-36px] w-[73px]" data-name="ListItem / Link">
      <PseudoBeforeBackgroundColor5 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[22px] leading-[0] left-5 not-italic text-[#212121] text-[18.205px] top-[35px] tracking-[-0.5px] w-[33px]">
        <p className="leading-[22px]">과학</p>
      </div>
    </div>
  );
}

function PseudoBeforeBackgroundColor6() {
  return <div className="absolute bg-[#212121] left-0 rounded-[100px] size-[3px] top-[44.5px]" data-name="Pseudo::before+BackgroundColor" />;
}

function ListItemLink6() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[92px] left-[428px] top-[-36px] w-[73px]" data-name="ListItem / Link">
      <PseudoBeforeBackgroundColor6 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[22px] leading-[0] left-5 not-italic text-[#212121] text-[18.205px] top-[35px] tracking-[-0.5px] w-[33px]">
        <p className="leading-[22px]">사회</p>
      </div>
    </div>
  );
}

function PseudoBeforeBackgroundColor7() {
  return <div className="absolute bg-[#212121] left-0 rounded-[100px] size-[3px] top-[44.5px]" data-name="Pseudo::before+BackgroundColor" />;
}

function ListItemLink7() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[92px] left-[501px] top-[-36px] w-[73px]" data-name="ListItem / Link">
      <PseudoBeforeBackgroundColor7 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[22px] leading-[0] left-5 not-italic text-[#212121] text-[18.205px] top-[35px] tracking-[-0.5px] w-[33px]">
        <p className="leading-[22px]">기타</p>
      </div>
    </div>
  );
}

function ContainerUnorderedList() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[22px] left-[270.75px] top-[34px] w-[574px]" data-name="Container / Unordered List">
      <ListItemLink2 />
      <ListItemLink3 />
      <ListItemLink4 />
      <ListItemLink5 />
      <ListItemLink6 />
      <ListItemLink7 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-6 left-0 overflow-clip top-0 w-[117px]" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat h-6 left-0 top-0 w-[21.818px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle1}')` }} />
    </div>
  );
}

function LinkBackgroundImage() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-6 left-0 top-0 w-[117px]" data-name="Link+BackgroundImage">
      <Frame1 />
      <div className="absolute font-['Inter:Light',_'Noto_Sans_KR:Light',_sans-serif] font-light h-5 leading-[0] left-[30px] not-italic text-[#2f2f2f] text-[16px] top-[1.5px] tracking-[-0.5px] w-[87px]">
        <p className="leading-[20px]">무료기출문제</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-6 left-0 overflow-clip top-0 w-[103px]" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat h-6 left-0 top-0 w-[30.316px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle2}')` }} />
    </div>
  );
}

function LinkBackgroundImage1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-6 left-[147px] top-0 w-[103px]" data-name="Link+BackgroundImage">
      <Frame2 />
      <div className="absolute font-['Inter:Light',_'Noto_Sans_KR:Light',_sans-serif] font-light h-5 leading-[0] left-[30px] not-italic text-[#2f2f2f] text-[16px] top-[1.5px] tracking-[-0.5px] w-[72.5px]">
        <p className="leading-[20px]">이용권구매</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-6 left-[920.5px] top-[33px] w-[280px]" data-name="Container">
      <LinkBackgroundImage />
      <LinkBackgroundImage1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[90px] left-[360px] top-10 w-[1200px]" data-name="Container">
      <Heading1LinkImage />
      <ContainerUnorderedList />
      <Container2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[130px] left-0 top-0 w-[1920px]" data-name="Container">
      <ContainerBackgroundColor />
      <Container3 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[151px] left-0 overflow-clip top-0 w-[1920px]" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat h-[249.6px] left-0 top-[-49.3px] w-[1920px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle3}')` }} />
    </div>
  );
}

function Image() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[151px] left-0 overflow-clip top-0 w-[1920px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat h-[151px] left-0 top-0 w-[1920px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle4}')` }} />
    </div>
  );
}

function ContainerBackgroundImage() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[151px] left-0 overflow-clip top-[130px] w-[1920px]" data-name="Container /+BackgroundImage">
      <Frame3 />
      <Image />
    </div>
  );
}

function ContainerBackgroundColor1() {
  return <div className="absolute bg-neutral-100 h-[1386px] left-0 top-[281px] w-[1920px]" data-name="Container /+BackgroundColor" />;
}

function Dl() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] font-normal h-5 leading-[0] left-0 not-italic text-[#212121] text-[15px] top-0 tracking-[-0.5px] w-56" data-name="Dl">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] h-5 left-0 top-0 w-[54px]">
        <p className="leading-[20px]">상담문의</p>
      </div>
      <div className="absolute font-['Inter:Regular',_sans-serif] h-5 left-16 top-0 w-40">
        <p className="leading-[20px]">070-5001-1976, 1977</p>
      </div>
    </div>
  );
}

function Dl1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-5 leading-[0] left-[243.5px] not-italic text-[#878787] text-[15px] top-0 tracking-[-0.5px] w-[254px]" data-name="Dl">
      <div className="absolute h-5 left-0 top-0 w-[37px]">
        <p className="leading-[20px]">월~금</p>
      </div>
      <div className="absolute h-5 left-[46.5px] top-0 w-[207px]">
        <p className="leading-[20px]">11:00 ~ 18:00 (주말, 공휴일 휴무)</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-5 left-0 top-[17.5px] w-[517px]" data-name="Container">
      <Dl />
      <Dl1 />
    </div>
  );
}

function UnorderedList() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[21px] leading-[0] left-[864px] not-italic text-[15px] top-[17px] tracking-[-0.5px] w-[336px]" data-name="Unordered List">
      <div className="absolute h-[21px] left-0 text-[#212121] top-0 w-[94px]">
        <p className="leading-[20px]">이용약관</p>
      </div>
      <div className="absolute h-[21px] left-[94px] text-[#099474] top-0 w-[148px]">
        <p className="leading-[20px]">개인정보처리방침</p>
      </div>
      <div className="absolute h-[21px] left-[242px] text-[#212121] top-0 w-[94px]">
        <p className="leading-[20px]">고객센터</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[360px] top-px w-[1200px]" data-name="Container">
      <Container5 />
      <UnorderedList />
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[57px] left-0 top-0 w-[1920px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1px_0px] border-black border-solid inset-0 pointer-events-none" />
      <Container6 />
    </div>
  );
}

function Heading1Image() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-9 left-0 overflow-clip top-[5.5px] w-[122px]" data-name="Heading 1 / Image">
      <div className="absolute bg-center bg-cover bg-no-repeat h-9 left-0 top-0 w-[122px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle5}')` }} />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[47px] left-[360px] top-[90px] w-[1200px]" data-name="Container">
      <Heading1Image />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[22px] leading-[0] left-[200px] not-italic text-[#878787] text-[14px] top-0 tracking-[-0.5px] w-[1000px]">
        <p className="leading-[22px]">소프트에듀케이션 사업자등록번호 266-42-00328 대표 : 김태언 통신판매업신고번호 : 2018-부산해운대-0532 부산광역시 해운대구 해운대로 724 909호</p>
      </div>
      <div className="absolute font-['Inter:Regular',_'Noto_Sans:Regular',_sans-serif] font-normal h-[22px] leading-[0] left-[200px] not-italic text-[#cacaca] text-[14px] top-[25px] tracking-[-0.5px] w-[1000px]">
        <p className="leading-[22px]">Copytight ⓒ2023 nscoach.com all rights reserved.</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[170px] left-0 top-[1667px] w-[1920px]" data-name="Container">
      <Container7 />
      <Container8 />
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[1837px] left-0 top-0 w-[1920px]" data-name="Container">
      <Container4 />
      <ContainerBackgroundImage />
      <ContainerBackgroundColor1 />
      <Container9 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[22px] left-0 overflow-clip top-0 w-24" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat h-[22px] left-0 top-[3px] w-[26.4px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle6}')` }} />
    </div>
  );
}

function SpanBackgroundImage() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[22px] left-[650.75px] top-[73px] w-24" data-name="Span+BackgroundImage">
      <Frame4 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[22px] leading-[0] left-[30.05px] not-italic text-[#212121] text-[18.337px] top-0 tracking-[-0.5px] w-[66px]">
        <p className="leading-[22px]">콘텐츠룸</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-9 left-5 top-10 w-[250px]" data-name="Container">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-9 leading-[0] left-[5px] not-italic text-[#212121] text-[23.641px] top-0 tracking-[-0.5px] w-[43px]">
        <p className="leading-[36px]">국어</p>
      </div>
    </div>
  );
}

function ListItemLinkBackgroundColor() {
  return (
    <div className="absolute bg-[#099474] h-[22px] left-0 rounded-[3px] top-[89px] w-[77px]" data-name="ListItem / Link+BackgroundColor">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-5 leading-[0] left-[5px] not-italic text-[13.07px] text-white top-px tracking-[-0.5px] w-[66.5px]">
        <p className="leading-[20px]">중등국어2-2</p>
      </div>
    </div>
  );
}

function DdUnorderedList() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[170px] left-2.5 top-[57px] w-[230px]" data-name="Dd / Unordered List">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-5 leading-[0] left-0 not-italic text-[14px] text-neutral-500 top-0 tracking-[-0.5px] w-[230px]">
        <p className="leading-[20px]">중등국어1-1(개정)</p>
      </div>
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-5 leading-[0] left-0 not-italic text-[14px] text-neutral-500 top-[30px] tracking-[-0.5px] w-[230px]">
        <p className="leading-[20px]">중등국어1-2(개정)</p>
      </div>
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-5 leading-[0] left-0 not-italic text-[14px] text-neutral-500 top-[60px] tracking-[-0.5px] w-[230px]">
        <p className="leading-[20px]">중등국어2-1</p>
      </div>
      <ListItemLinkBackgroundColor />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-5 leading-[0] left-0 not-italic text-[14px] text-neutral-500 top-[120px] tracking-[-0.5px] w-[230px]">
        <p className="leading-[20px]">중등국어3-1</p>
      </div>
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-5 leading-[0] left-0 not-italic text-[14px] text-neutral-500 top-[150px] tracking-[-0.5px] w-[230px]">
        <p className="leading-[20px]">중등국어3-2</p>
      </div>
    </div>
  );
}

function Dl2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[257px] left-5 overflow-clip top-[81px] w-[250px]" data-name="Dl">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-5 leading-[0] left-0 not-italic text-[#141414] text-[19px] top-5 tracking-[-0.5px] w-[250px]">
        <p className="leading-[20px]">중등국어</p>
      </div>
      <DdUnorderedList />
    </div>
  );
}

function DdUnorderedList1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[140px] leading-[0] left-2.5 not-italic text-[14px] text-neutral-500 top-[58px] tracking-[-0.5px] w-[230px]" data-name="Dd / Unordered List">
      <div className="absolute h-5 left-0 top-0 w-[230px]">
        <p className="leading-[20px]">공통국어1(개정)</p>
      </div>
      <div className="absolute h-5 left-0 top-[30px] w-[230px]">
        <p className="leading-[20px]">공통국어2(개정)</p>
      </div>
      <div className="absolute h-5 left-0 top-[60px] w-[230px]">
        <p className="leading-[20px]">문학(출판사별)</p>
      </div>
      <div className="absolute h-5 left-0 top-[90px] w-[230px]">
        <p className="leading-[20px]">언어와매체</p>
      </div>
      <div className="absolute h-5 left-0 top-[120px] w-[230px]">
        <p className="leading-[20px]">문학(작품별감상)</p>
      </div>
    </div>
  );
}

function Dl3() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-52 left-5 top-[338px] w-[250px]" data-name="Dl">
      <div className="h-52 overflow-clip relative w-[250px]">
        <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-5 leading-[0] left-0 not-italic text-[#141414] text-[19px] top-[21px] tracking-[-0.5px] w-[250px]">
          <p className="leading-[20px]">고등국어</p>
        </div>
        <DdUnorderedList1 />
      </div>
      <div aria-hidden="true" className="absolute border-[#ececec] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function ContainerBackgroundColor2() {
  return (
    <div className="absolute bg-white h-[586px] left-0 rounded-[10px] top-0 w-[290px]" data-name="Container+BackgroundColor">
      <Container11 />
      <Dl2 />
      <Dl3 />
    </div>
  );
}

function ListItemBackgroundColor() {
  return (
    <div className="absolute bg-[#147e8e] h-[50px] left-[-1px] rounded-bl-[5px] rounded-tl-[5px] top-0 w-[168px]" data-name="ListItem+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#147e8e] border-solid inset-0 pointer-events-none rounded-bl-[5px] rounded-tl-[5px]" />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[50px] leading-[0] left-[84px] not-italic text-[16px] text-center text-white top-[0.5px] tracking-[-0.5px] translate-x-[-50%] w-[58px]">
        <p className="leading-[50px]">전체보기</p>
      </div>
    </div>
  );
}

function ListItemBackgroundColor1() {
  return (
    <div className="absolute bg-white h-[50px] left-[166px] top-0 w-[168px]" data-name="ListItem+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none" />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[50px] leading-[0] left-[84.05px] not-italic text-[#212121] text-[16px] text-center top-[0.5px] tracking-[-0.5px] translate-x-[-50%] w-[72.5px]">
        <p className="leading-[50px]">단원별학습</p>
      </div>
    </div>
  );
}

function ListItemBackgroundColor2() {
  return (
    <div className="absolute bg-white h-[50px] left-[333px] top-0 w-[168px]" data-name="ListItem+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none" />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[50px] leading-[0] left-[84.05px] not-italic text-[#212121] text-[16px] text-center top-[0.5px] tracking-[-0.5px] translate-x-[-50%] w-[68.5px]">
        <p className="leading-[50px]">3일의기적</p>
      </div>
    </div>
  );
}

function ListItemBackgroundColor3() {
  return (
    <div className="absolute bg-white h-[50px] left-[500px] rounded-br-[5px] rounded-tr-[5px] top-0 w-[168px]" data-name="ListItem+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-br-[5px] rounded-tr-[5px]" />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[50px] leading-[0] left-[84px] not-italic text-[#212121] text-[16px] text-center top-[0.5px] tracking-[-0.5px] translate-x-[-50%] w-[58px]">
        <p className="leading-[50px]">모의고사</p>
      </div>
    </div>
  );
}

function UnorderedList1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[50px] left-0 top-0 w-[840px]" data-name="Unordered List">
      <ListItemBackgroundColor />
      <ListItemBackgroundColor1 />
      <ListItemBackgroundColor2 />
      <ListItemBackgroundColor3 />
    </div>
  );
}

function LinkBackgroundColor() {
  return (
    <div className="absolute bg-[#f8f8f8] h-[50px] left-[667px] rounded-br-[5px] rounded-tr-[5px] top-0 w-[173px]" data-name="Link+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-br-[5px] rounded-tr-[5px]" />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[50px] leading-[0] left-[88.55px] not-italic text-[#212121] text-[15px] text-center top-px tracking-[-0.5px] translate-x-[-50%] w-[67.5px]">
        <p className="leading-[50px]">콘텐츠소개</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-20 left-5 top-10 w-[840px]" data-name="Container">
      <UnorderedList1 />
      <LinkBackgroundColor />
    </div>
  );
}

function LinkBackgroundColor1() {
  return (
    <div className="absolute bg-[#03ab9a] h-10 left-[720px] rounded-[5px] top-0 w-[120px]" data-name="Link+BackgroundColor">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-10 leading-[0] left-[62px] not-italic text-[14px] text-center text-white top-0 tracking-[-0.5px] translate-x-[-50%] w-[75px]">
        <p className="leading-[40px]">VIP 콘텐츠룸</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-10 left-0 top-0 w-[840px]" data-name="Container">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[35px] leading-[0] left-0 not-italic text-[34.648px] text-black top-[2.5px] tracking-[-0.5px] w-[126px]">
        <p className="leading-[35px]">전체보기</p>
      </div>
      <LinkBackgroundColor1 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-10 left-0 overflow-clip top-0 w-[120px]" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat h-[4.706px] left-0 top-0 w-2.5" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle7}')` }} />
    </div>
  );
}

function Frame7() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-10 left-0 overflow-clip top-0 w-[120px]" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat h-[4.706px] left-[97px] top-[17.65px] w-2.5" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle7}')` }} />
    </div>
  );
}

function ContainerSelectBackgroundColorBackgroundImage() {
  return (
    <div className="absolute bg-white h-10 left-5 rounded-[5px] top-[15px] w-[120px]" data-name="Container / Select+BackgroundColor+BackgroundImage">
      <div aria-hidden="true" className="absolute border border-[#dfdfdf] border-solid inset-0 pointer-events-none rounded-[5px]" />
      {[...Array(2).keys()].map((_, i) => (
        <Frame5 key={i} />
      ))}
      {[...Array(2).keys()].map((_, i) => (
        <Frame7 key={i} />
      ))}
    </div>
  );
}

function InputBackgroundColor() {
  return (
    <div className="absolute bg-white h-10 left-0 rounded-[5px] top-0 w-60" data-name="Input+BackgroundColor">
      <div className="h-10 overflow-clip relative w-60">
        <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-10 leading-[0] left-4 not-italic text-[13.096px] text-[darkgrey] top-px tracking-[-0.5px] w-[125.5px]">
          <p className="leading-[40px]">검색어를 입력해 주세요.</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dfdfdf] border-solid inset-0 pointer-events-none rounded-[5px]" />
    </div>
  );
}

function ButtonBackgroundColor() {
  return (
    <div className="absolute bg-white h-10 left-[245.5px] rounded-[5px] top-0 w-[75px]" data-name="Button+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dfdfdf] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <div className="absolute flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 justify-center leading-[0] left-[37.5px] not-italic text-[#212121] text-[12.771px] text-center top-5 tracking-[-0.5px] translate-x-[-50%] translate-y-[-50%] w-[23px]">
        <p className="leading-[16px]">검색</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-10 left-[499.5px] top-[15px] w-[321px]" data-name="Container">
      <InputBackgroundColor />
      <ButtonBackgroundColor />
    </div>
  );
}

function FormBackgroundColor() {
  return (
    <div className="absolute bg-[#f7f7f7] h-[70px] left-0 rounded-[7px] top-[70px] w-[840px]" data-name="Form /+BackgroundColor">
      <ContainerSelectBackgroundColorBackgroundImage />
      <Container14 />
    </div>
  );
}

function Th() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[46px] left-0 top-0 w-[605px]" data-name="Th">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="absolute font-['Inter:Medium',_'Noto_Sans_KR:Medium',_sans-serif] font-medium h-[18px] leading-[0] left-[302.4px] not-italic text-[#141414] text-[13.857px] text-center top-[13px] tracking-[-0.5px] translate-x-[-50%] w-[25px]">
        <p className="leading-[18px]">제목</p>
      </div>
    </div>
  );
}

function Th1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[46px] left-[604.8px] top-0 w-[109px]" data-name="Th">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="absolute font-['Inter:Medium',_'Noto_Sans_KR:Medium',_sans-serif] font-medium h-[18px] leading-[0] left-[54.6px] not-italic text-[#141414] text-[13.99px] text-center top-[13px] tracking-[-0.5px] translate-x-[-50%] w-[50px]">
        <p className="leading-[18px]">받은자료</p>
      </div>
    </div>
  );
}

function Th2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[46px] left-[713.98px] top-0 w-[126px]" data-name="Th">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="absolute font-['Inter:Medium',_'Noto_Sans_KR:Medium',_sans-serif] font-medium h-[18px] leading-[0] left-[63.02px] not-italic text-[#141414] text-[13.99px] text-center top-[13px] tracking-[-0.5px] translate-x-[-50%] w-[50px]">
        <p className="leading-[18px]">자료받기</p>
      </div>
    </div>
  );
}

function TheadTr() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[46px] left-0 top-px w-[840px]" data-name="Thead / Tr">
      <Th />
      <Th1 />
      <Th2 />
    </div>
  );
}

function Image1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[375.5px] overflow-clip size-3 top-[2.28px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-3 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle8}')` }} />
    </div>
  );
}

function Link() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3.5 left-2.5 overflow-clip top-[19.86px] w-[585px]" data-name="Link">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 leading-[0] left-0 not-italic text-[#212121] text-[13.33px] top-[-0.96px] tracking-[-0.5px] w-[347.5px]">
        <p className="leading-[16px]">[적중문제] 중등국어2-2 천재박 4-2 매체 바르게 읽기 01 (14문제)</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium h-3.5 leading-[0] left-[352.5px] not-italic text-[#aaaaaa] text-[11.626px] top-px tracking-[-0.5px] w-[15px]">
        <p className="leading-[14px]">[5]</p>
      </div>
      <Image1 />
    </div>
  );
}

function Td() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[605px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Link />
    </div>
  );
}

function Td1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[604.8px] top-0 w-[109px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame9() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-0 overflow-clip top-0 w-16" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-[13px] top-[1.5px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle9}')` }} />
    </div>
  );
}

function SpanBackgroundImage1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-[23px] top-3 w-16" data-name="Span+BackgroundImage">
      <Frame9 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[38px] leading-[0] left-[41.02px] not-italic text-[#141414] text-[12.908px] text-center top-[-11px] tracking-[-0.5px] translate-x-[-50%] w-[46px]">
        <p className="leading-[38px]">자료받기</p>
      </div>
    </div>
  );
}

function ContainerBackgroundColor3() {
  return (
    <div className="absolute bg-white h-10 left-2.5 rounded-[5px] top-[7px] w-[110px]" data-name="Container+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <SpanBackgroundImage1 />
    </div>
  );
}

function Td2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[713.98px] top-0 w-[126px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <ContainerBackgroundColor3 />
    </div>
  );
}

function Tr() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[840px]" data-name="Tr">
      <Td />
      <Td1 />
      <Td2 />
    </div>
  );
}

function Image2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[447.5px] overflow-clip size-3 top-[2.28px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-3 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle8}')` }} />
    </div>
  );
}

function Link1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3.5 left-2.5 overflow-clip top-[19.86px] w-[585px]" data-name="Link">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 leading-[0] left-0 not-italic text-[#212121] text-[13.252px] top-[-0.96px] tracking-[-0.5px] w-[420.5px]">
        <p className="leading-[16px]">[적중문제] 중등국어2-2 천재박 4-1 매체 자료의 효과 판단하며 듣기 01 (13문제)</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[425.5px] not-italic size-3.5 text-[#aaaaaa] text-[10.707px] top-px tracking-[-0.5px]">
        <p className="leading-[14px]">[3]</p>
      </div>
      <Image2 />
    </div>
  );
}

function Td3() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[605px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Link1 />
    </div>
  );
}

function Td4() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[604.8px] top-0 w-[109px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame10() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-0 overflow-clip top-0 w-16" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-[13px] top-[1.5px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle9}')` }} />
    </div>
  );
}

function SpanBackgroundImage2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-[23px] top-3 w-16" data-name="Span+BackgroundImage">
      <Frame10 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[38px] leading-[0] left-[41.02px] not-italic text-[#141414] text-[12.908px] text-center top-[-11px] tracking-[-0.5px] translate-x-[-50%] w-[46px]">
        <p className="leading-[38px]">자료받기</p>
      </div>
    </div>
  );
}

function ContainerBackgroundColor4() {
  return (
    <div className="absolute bg-white h-10 left-2.5 rounded-[5px] top-[7px] w-[110px]" data-name="Container+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <SpanBackgroundImage2 />
    </div>
  );
}

function Td5() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[713.98px] top-0 w-[126px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <ContainerBackgroundColor4 />
    </div>
  );
}

function Tr1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-[55px] w-[840px]" data-name="Tr">
      <Td3 />
      <Td4 />
      <Td5 />
    </div>
  );
}

function Image3() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[375.5px] overflow-clip size-3 top-[2.28px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-3 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle8}')` }} />
    </div>
  );
}

function Link2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3.5 left-2.5 overflow-clip top-[19.86px] w-[585px]" data-name="Link">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 leading-[0] left-0 not-italic text-[#212121] text-[13.31px] top-[-0.96px] tracking-[-0.5px] w-[346.5px]">
        <p className="leading-[16px]">[적중문제] 중등국어2-2 천재박 3-2 설명하는 글 쓰기 01 (15문제)</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium h-3.5 leading-[0] left-[351.5px] not-italic text-[#aaaaaa] text-[12px] top-px tracking-[-0.5px] w-4">
        <p className="leading-[14px]">[4]</p>
      </div>
      <Image3 />
    </div>
  );
}

function Td6() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[605px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Link2 />
    </div>
  );
}

function Td7() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[604.8px] top-0 w-[109px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame11() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-0 overflow-clip top-0 w-16" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-[13px] top-[1.5px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle9}')` }} />
    </div>
  );
}

function SpanBackgroundImage3() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-[23px] top-3 w-16" data-name="Span+BackgroundImage">
      <Frame11 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[38px] leading-[0] left-[41.02px] not-italic text-[#141414] text-[12.908px] text-center top-[-11px] tracking-[-0.5px] translate-x-[-50%] w-[46px]">
        <p className="leading-[38px]">자료받기</p>
      </div>
    </div>
  );
}

function ContainerBackgroundColor5() {
  return (
    <div className="absolute bg-white h-10 left-2.5 rounded-[5px] top-[7px] w-[110px]" data-name="Container+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <SpanBackgroundImage3 />
    </div>
  );
}

function Td8() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[713.98px] top-0 w-[126px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <ContainerBackgroundColor5 />
    </div>
  );
}

function Tr2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-[110px] w-[840px]" data-name="Tr">
      <Td6 />
      <Td7 />
      <Td8 />
    </div>
  );
}

function Image4() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[408.5px] overflow-clip size-3 top-[2.28px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-3 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle8}')` }} />
    </div>
  );
}

function Link3() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3.5 left-2.5 overflow-clip top-[19.86px] w-[585px]" data-name="Link">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 leading-[0] left-0 not-italic text-[#212121] text-[13.232px] top-[-0.96px] tracking-[-0.5px] w-[381.5px]">
        <p className="leading-[16px]">[적중문제] 중등국어2-2 천재박 3-1 설명 방법 파악하며 읽기 01 (13문제)</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[386.5px] not-italic size-3.5 text-[#aaaaaa] text-[10.707px] top-px tracking-[-0.5px]">
        <p className="leading-[14px]">[3]</p>
      </div>
      <Image4 />
    </div>
  );
}

function Td9() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[605px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Link3 />
    </div>
  );
}

function Td10() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[604.8px] top-0 w-[109px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame12() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-0 overflow-clip top-0 w-16" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-[13px] top-[1.5px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle9}')` }} />
    </div>
  );
}

function SpanBackgroundImage4() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-[23px] top-3 w-16" data-name="Span+BackgroundImage">
      <Frame12 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[38px] leading-[0] left-[41.02px] not-italic text-[#141414] text-[12.908px] text-center top-[-11px] tracking-[-0.5px] translate-x-[-50%] w-[46px]">
        <p className="leading-[38px]">자료받기</p>
      </div>
    </div>
  );
}

function ContainerBackgroundColor6() {
  return (
    <div className="absolute bg-white h-10 left-2.5 rounded-[5px] top-[7px] w-[110px]" data-name="Container+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <SpanBackgroundImage4 />
    </div>
  );
}

function Td11() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[713.98px] top-0 w-[126px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <ContainerBackgroundColor6 />
    </div>
  );
}

function Tr3() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-[165px] w-[840px]" data-name="Tr">
      <Td9 />
      <Td10 />
      <Td11 />
    </div>
  );
}

function Image5() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[386px] overflow-clip size-3 top-[2.28px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-3 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle8}')` }} />
    </div>
  );
}

function Link4() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3.5 left-2.5 overflow-clip top-[19.86px] w-[585px]" data-name="Link">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 leading-[0] left-0 not-italic text-[#212121] text-[13.317px] top-[-0.96px] tracking-[-0.5px] w-[358px]">
        <p className="leading-[16px]">[적중문제] 중등국어2-2 천재박 2-2 정확한 발음과 표기 01 (15문제)</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium h-3.5 leading-[0] left-[363px] not-italic text-[#aaaaaa] text-[11.626px] top-px tracking-[-0.5px] w-[15px]">
        <p className="leading-[14px]">[5]</p>
      </div>
      <Image5 />
    </div>
  );
}

function Td12() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[605px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Link4 />
    </div>
  );
}

function Td13() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[604.8px] top-0 w-[109px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame13() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-0 overflow-clip top-0 w-16" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-[13px] top-[1.5px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle9}')` }} />
    </div>
  );
}

function SpanBackgroundImage5() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-[23px] top-3 w-16" data-name="Span+BackgroundImage">
      <Frame13 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[38px] leading-[0] left-[41.02px] not-italic text-[#141414] text-[12.908px] text-center top-[-11px] tracking-[-0.5px] translate-x-[-50%] w-[46px]">
        <p className="leading-[38px]">자료받기</p>
      </div>
    </div>
  );
}

function ContainerBackgroundColor7() {
  return (
    <div className="absolute bg-white h-10 left-2.5 rounded-[5px] top-[7px] w-[110px]" data-name="Container+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <SpanBackgroundImage5 />
    </div>
  );
}

function Td14() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[713.98px] top-0 w-[126px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <ContainerBackgroundColor7 />
    </div>
  );
}

function Tr4() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-[220px] w-[840px]" data-name="Tr">
      <Td12 />
      <Td13 />
      <Td14 />
    </div>
  );
}

function Image6() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[371.5px] overflow-clip size-3 top-[2.28px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-3 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle8}')` }} />
    </div>
  );
}

function Link5() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3.5 left-2.5 overflow-clip top-[19.86px] w-[585px]" data-name="Link">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 leading-[0] left-0 not-italic text-[#212121] text-[13.304px] top-[-0.96px] tracking-[-0.5px] w-[344.5px]">
        <p className="leading-[16px]">[적중문제] 중등국어2-2 천재박 2-1 한글의 창제 원리 01 (15문제)</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[349.5px] not-italic size-3.5 text-[#aaaaaa] text-[10.707px] top-px tracking-[-0.5px]">
        <p className="leading-[14px]">[3]</p>
      </div>
      <Image6 />
    </div>
  );
}

function Td15() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[605px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Link5 />
    </div>
  );
}

function Td16() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[604.8px] top-0 w-[109px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame14() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-0 overflow-clip top-0 w-16" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-[13px] top-[1.5px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle9}')` }} />
    </div>
  );
}

function SpanBackgroundImage6() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-[23px] top-3 w-16" data-name="Span+BackgroundImage">
      <Frame14 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[38px] leading-[0] left-[41.02px] not-italic text-[#141414] text-[12.908px] text-center top-[-11px] tracking-[-0.5px] translate-x-[-50%] w-[46px]">
        <p className="leading-[38px]">자료받기</p>
      </div>
    </div>
  );
}

function ContainerBackgroundColor8() {
  return (
    <div className="absolute bg-white h-10 left-2.5 rounded-[5px] top-[7px] w-[110px]" data-name="Container+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <SpanBackgroundImage6 />
    </div>
  );
}

function Td17() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[713.98px] top-0 w-[126px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <ContainerBackgroundColor8 />
    </div>
  );
}

function Tr5() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-[275px] w-[840px]" data-name="Tr">
      <Td15 />
      <Td16 />
      <Td17 />
    </div>
  );
}

function Image7() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[330px] overflow-clip size-3 top-[2.28px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-3 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle8}')` }} />
    </div>
  );
}

function Link6() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3.5 left-2.5 overflow-clip top-[19.86px] w-[585px]" data-name="Link">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 leading-[0] left-0 not-italic text-[#212121] text-[13.33px] top-[-0.96px] tracking-[-0.5px] w-[303px]">
        <p className="leading-[16px]">[적중문제] 중등국어2-2 천재박 1-2 모진소리 01 (15문제)</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[308px] not-italic size-3.5 text-[#aaaaaa] text-[10.707px] top-px tracking-[-0.5px]">
        <p className="leading-[14px]">[3]</p>
      </div>
      <Image7 />
    </div>
  );
}

function Td18() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[605px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Link6 />
    </div>
  );
}

function Td19() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[604.8px] top-0 w-[109px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame15() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-0 overflow-clip top-0 w-16" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-[13px] top-[1.5px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle9}')` }} />
    </div>
  );
}

function SpanBackgroundImage7() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-[23px] top-3 w-16" data-name="Span+BackgroundImage">
      <Frame15 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[38px] leading-[0] left-[41.02px] not-italic text-[#141414] text-[12.908px] text-center top-[-11px] tracking-[-0.5px] translate-x-[-50%] w-[46px]">
        <p className="leading-[38px]">자료받기</p>
      </div>
    </div>
  );
}

function ContainerBackgroundColor9() {
  return (
    <div className="absolute bg-white h-10 left-2.5 rounded-[5px] top-[7px] w-[110px]" data-name="Container+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <SpanBackgroundImage7 />
    </div>
  );
}

function Td20() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[713.98px] top-0 w-[126px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <ContainerBackgroundColor9 />
    </div>
  );
}

function Tr6() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-[330px] w-[840px]" data-name="Tr">
      <Td18 />
      <Td19 />
      <Td20 />
    </div>
  );
}

function Image8() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[352.5px] overflow-clip size-3 top-[2.28px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-3 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle8}')` }} />
    </div>
  );
}

function Link7() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3.5 left-2.5 overflow-clip top-[19.86px] w-[585px]" data-name="Link">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 leading-[0] left-0 not-italic text-[#212121] text-[13.239px] top-[-0.96px] tracking-[-0.5px] w-[324.5px]">
        <p className="leading-[16px]">[적중문제] 중등국어2-2 천재박 1-1 소나기 02 (13문제)--미주</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium h-3.5 leading-[0] left-[329.5px] not-italic text-[#aaaaaa] text-[11.682px] top-px tracking-[-0.5px] w-[15px]">
        <p className="leading-[14px]">[2]</p>
      </div>
      <Image8 />
    </div>
  );
}

function Td21() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[605px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Link7 />
    </div>
  );
}

function Td22() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[604.8px] top-0 w-[109px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame16() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-0 overflow-clip top-0 w-16" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-[13px] top-[1.5px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle9}')` }} />
    </div>
  );
}

function SpanBackgroundImage8() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-[23px] top-3 w-16" data-name="Span+BackgroundImage">
      <Frame16 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[38px] leading-[0] left-[41.02px] not-italic text-[#141414] text-[12.908px] text-center top-[-11px] tracking-[-0.5px] translate-x-[-50%] w-[46px]">
        <p className="leading-[38px]">자료받기</p>
      </div>
    </div>
  );
}

function ContainerBackgroundColor10() {
  return (
    <div className="absolute bg-white h-10 left-2.5 rounded-[5px] top-[7px] w-[110px]" data-name="Container+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <SpanBackgroundImage8 />
    </div>
  );
}

function Td23() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[713.98px] top-0 w-[126px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <ContainerBackgroundColor10 />
    </div>
  );
}

function Tr7() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-[385px] w-[840px]" data-name="Tr">
      <Td21 />
      <Td22 />
      <Td23 />
    </div>
  );
}

function Image9() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[318.5px] overflow-clip size-3 top-[2.28px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-3 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle8}')` }} />
    </div>
  );
}

function Link8() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3.5 left-2.5 overflow-clip top-[19.86px] w-[585px]" data-name="Link">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 leading-[0] left-0 not-italic text-[#212121] text-[13.317px] top-[-0.96px] tracking-[-0.5px] w-[289.5px]">
        <p className="leading-[16px]">[적중문제] 중등국어2-2 천재박 1-1 소나기 01 (15문제)</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium h-3.5 leading-[0] left-[294.5px] not-italic text-[#aaaaaa] text-[12px] top-px tracking-[-0.5px] w-4">
        <p className="leading-[14px]">[4]</p>
      </div>
      <Image9 />
    </div>
  );
}

function Td24() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[605px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Link8 />
    </div>
  );
}

function Td25() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[604.8px] top-0 w-[109px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame17() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-0 overflow-clip top-0 w-16" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-[13px] top-[1.5px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle9}')` }} />
    </div>
  );
}

function SpanBackgroundImage9() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-[23px] top-3 w-16" data-name="Span+BackgroundImage">
      <Frame17 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[38px] leading-[0] left-[41.02px] not-italic text-[#141414] text-[12.908px] text-center top-[-11px] tracking-[-0.5px] translate-x-[-50%] w-[46px]">
        <p className="leading-[38px]">자료받기</p>
      </div>
    </div>
  );
}

function ContainerBackgroundColor11() {
  return (
    <div className="absolute bg-white h-10 left-2.5 rounded-[5px] top-[7px] w-[110px]" data-name="Container+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <SpanBackgroundImage9 />
    </div>
  );
}

function Td26() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[713.98px] top-0 w-[126px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <ContainerBackgroundColor11 />
    </div>
  );
}

function Tr8() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-[440px] w-[840px]" data-name="Tr">
      <Td24 />
      <Td25 />
      <Td26 />
    </div>
  );
}

function Image10() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[309.5px] overflow-clip size-3 top-[2.28px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-3 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle8}')` }} />
    </div>
  );
}

function Link9() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3.5 left-2.5 overflow-clip top-[19.86px] w-[585px]" data-name="Link">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 leading-[0] left-0 not-italic text-[#212121] text-[13.369px] top-[-0.96px] tracking-[-0.5px] w-[282.5px]">
        <p className="leading-[16px]">[핵심체크] 중등국어2-2 천재박 4-2 매체 바르게 읽기</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[287.5px] not-italic size-3.5 text-[#aaaaaa] text-[10.707px] top-px tracking-[-0.5px]">
        <p className="leading-[14px]">[3]</p>
      </div>
      <Image10 />
    </div>
  );
}

function Td27() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[605px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Link9 />
    </div>
  );
}

function Td28() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[604.8px] top-0 w-[109px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame18() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-0 overflow-clip top-0 w-16" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-[13px] top-[1.5px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle9}')` }} />
    </div>
  );
}

function SpanBackgroundImage10() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-[23px] top-3 w-16" data-name="Span+BackgroundImage">
      <Frame18 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[38px] leading-[0] left-[41.02px] not-italic text-[#141414] text-[12.908px] text-center top-[-11px] tracking-[-0.5px] translate-x-[-50%] w-[46px]">
        <p className="leading-[38px]">자료받기</p>
      </div>
    </div>
  );
}

function ContainerBackgroundColor12() {
  return (
    <div className="absolute bg-white h-10 left-2.5 rounded-[5px] top-[7px] w-[110px]" data-name="Container+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <SpanBackgroundImage10 />
    </div>
  );
}

function Td29() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[713.98px] top-0 w-[126px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <ContainerBackgroundColor12 />
    </div>
  );
}

function Tr9() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-[495px] w-[840px]" data-name="Tr">
      <Td27 />
      <Td28 />
      <Td29 />
    </div>
  );
}

function Image11() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[384.5px] overflow-clip size-3 top-[2.28px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-3 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle8}')` }} />
    </div>
  );
}

function Link10() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3.5 left-2.5 overflow-clip top-[19.86px] w-[585px]" data-name="Link">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 leading-[0] left-0 not-italic text-[#212121] text-[13.304px] top-[-0.96px] tracking-[-0.5px] w-[356.5px]">
        <p className="leading-[16px]">[핵심체크] 중등국어2-2 천재박 4-1 매체 자료의 효과 판단하며 듣기</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium h-3.5 leading-[0] left-[361.5px] not-italic text-[#aaaaaa] text-[11.626px] top-px tracking-[-0.5px] w-[15px]">
        <p className="leading-[14px]">[5]</p>
      </div>
      <Image11 />
    </div>
  );
}

function Td30() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[605px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Link10 />
    </div>
  );
}

function Td31() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[604.8px] top-0 w-[109px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame19() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-0 overflow-clip top-0 w-16" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-[13px] top-[1.5px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle9}')` }} />
    </div>
  );
}

function SpanBackgroundImage11() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-[23px] top-3 w-16" data-name="Span+BackgroundImage">
      <Frame19 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[38px] leading-[0] left-[41.02px] not-italic text-[#141414] text-[12.908px] text-center top-[-11px] tracking-[-0.5px] translate-x-[-50%] w-[46px]">
        <p className="leading-[38px]">자료받기</p>
      </div>
    </div>
  );
}

function ContainerBackgroundColor13() {
  return (
    <div className="absolute bg-white h-10 left-2.5 rounded-[5px] top-[7px] w-[110px]" data-name="Container+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <SpanBackgroundImage11 />
    </div>
  );
}

function Td32() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[713.98px] top-0 w-[126px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <ContainerBackgroundColor13 />
    </div>
  );
}

function Tr10() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-[550px] w-[840px]" data-name="Tr">
      <Td30 />
      <Td31 />
      <Td32 />
    </div>
  );
}

function Image12() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[310.5px] overflow-clip size-3 top-[2.28px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-3 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle8}')` }} />
    </div>
  );
}

function Link11() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3.5 left-2.5 overflow-clip top-[19.86px] w-[585px]" data-name="Link">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 leading-[0] left-0 not-italic text-[#212121] text-[13.33px] top-[-0.96px] tracking-[-0.5px] w-[281.5px]">
        <p className="leading-[16px]">[핵심체크] 중등국어2-2 천재박 3-2 설명하는 글 쓰기</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium h-3.5 leading-[0] left-[286.5px] not-italic text-[#aaaaaa] text-[12px] top-px tracking-[-0.5px] w-4">
        <p className="leading-[14px]">[4]</p>
      </div>
      <Image12 />
    </div>
  );
}

function Td33() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[605px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Link11 />
    </div>
  );
}

function Td34() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[604.8px] top-0 w-[109px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame20() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-0 overflow-clip top-0 w-16" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-[13px] top-[1.5px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle9}')` }} />
    </div>
  );
}

function SpanBackgroundImage12() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-[23px] top-3 w-16" data-name="Span+BackgroundImage">
      <Frame20 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[38px] leading-[0] left-[41.02px] not-italic text-[#141414] text-[12.908px] text-center top-[-11px] tracking-[-0.5px] translate-x-[-50%] w-[46px]">
        <p className="leading-[38px]">자료받기</p>
      </div>
    </div>
  );
}

function ContainerBackgroundColor14() {
  return (
    <div className="absolute bg-white h-10 left-2.5 rounded-[5px] top-[7px] w-[110px]" data-name="Container+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <SpanBackgroundImage12 />
    </div>
  );
}

function Td35() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[713.98px] top-0 w-[126px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <ContainerBackgroundColor14 />
    </div>
  );
}

function Tr11() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-[605px] w-[840px]" data-name="Tr">
      <Td33 />
      <Td34 />
      <Td35 />
    </div>
  );
}

function Image13() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[342.5px] overflow-clip size-3 top-[2.28px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-3 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle8}')` }} />
    </div>
  );
}

function Link12() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3.5 left-2.5 overflow-clip top-[19.86px] w-[585px]" data-name="Link">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 leading-[0] left-0 not-italic text-[#212121] text-[13.284px] top-[-0.96px] tracking-[-0.5px] w-[317.5px]">
        <p className="leading-[16px]">[핵심체크] 중등국어2-2 천재박 3-1 설명 방법 파악하며 읽기</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium h-3.5 leading-[0] left-[322.5px] not-italic text-[#aaaaaa] text-[10.579px] top-px tracking-[-0.5px] w-3">
        <p className="leading-[14px]">[1]</p>
      </div>
      <Image13 />
    </div>
  );
}

function Td36() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[605px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Link12 />
    </div>
  );
}

function Td37() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[604.8px] top-0 w-[109px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame21() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-0 overflow-clip top-0 w-16" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-[13px] top-[1.5px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle9}')` }} />
    </div>
  );
}

function SpanBackgroundImage13() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-[23px] top-3 w-16" data-name="Span+BackgroundImage">
      <Frame21 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[38px] leading-[0] left-[41.02px] not-italic text-[#141414] text-[12.908px] text-center top-[-11px] tracking-[-0.5px] translate-x-[-50%] w-[46px]">
        <p className="leading-[38px]">자료받기</p>
      </div>
    </div>
  );
}

function ContainerBackgroundColor15() {
  return (
    <div className="absolute bg-white h-10 left-2.5 rounded-[5px] top-[7px] w-[110px]" data-name="Container+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <SpanBackgroundImage13 />
    </div>
  );
}

function Td38() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[713.98px] top-0 w-[126px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <ContainerBackgroundColor15 />
    </div>
  );
}

function Tr12() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-[660px] w-[840px]" data-name="Tr">
      <Td36 />
      <Td37 />
      <Td38 />
    </div>
  );
}

function Image14() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-80 overflow-clip size-3 top-[2.28px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-3 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle8}')` }} />
    </div>
  );
}

function Link13() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3.5 left-2.5 overflow-clip top-[19.86px] w-[585px]" data-name="Link">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 leading-[0] left-0 not-italic text-[#212121] text-[13.336px] top-[-0.96px] tracking-[-0.5px] w-[293px]">
        <p className="leading-[16px]">[핵심체크] 중등국어2-2 천재박 2-2 정확한 발음과 표기</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[298px] not-italic size-3.5 text-[#aaaaaa] text-[10.707px] top-px tracking-[-0.5px]">
        <p className="leading-[14px]">[3]</p>
      </div>
      <Image14 />
    </div>
  );
}

function Td39() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[605px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Link13 />
    </div>
  );
}

function Td40() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[604.8px] top-0 w-[109px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame22() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-0 overflow-clip top-0 w-16" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-[13px] top-[1.5px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle9}')` }} />
    </div>
  );
}

function SpanBackgroundImage14() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-[23px] top-3 w-16" data-name="Span+BackgroundImage">
      <Frame22 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[38px] leading-[0] left-[41.02px] not-italic text-[#141414] text-[12.908px] text-center top-[-11px] tracking-[-0.5px] translate-x-[-50%] w-[46px]">
        <p className="leading-[38px]">자료받기</p>
      </div>
    </div>
  );
}

function ContainerBackgroundColor16() {
  return (
    <div className="absolute bg-white h-10 left-2.5 rounded-[5px] top-[7px] w-[110px]" data-name="Container+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <SpanBackgroundImage14 />
    </div>
  );
}

function Td41() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[713.98px] top-0 w-[126px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <ContainerBackgroundColor16 />
    </div>
  );
}

function Tr13() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-[715px] w-[840px]" data-name="Tr">
      <Td39 />
      <Td40 />
      <Td41 />
    </div>
  );
}

function Image15() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[307.5px] overflow-clip size-3 top-[2.28px]" data-name="Image">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-3 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle8}')` }} />
    </div>
  );
}

function Link14() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-3.5 left-2.5 overflow-clip top-[19.86px] w-[585px]" data-name="Link">
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-4 leading-[0] left-0 not-italic text-[#212121] text-[13.323px] top-[-0.96px] tracking-[-0.5px] w-[279.5px]">
        <p className="leading-[16px]">[핵심체크] 중등국어2-2 천재박 2-1 한글의 창제 원리</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium h-3.5 leading-[0] left-[284.5px] not-italic text-[#aaaaaa] text-[11.682px] top-px tracking-[-0.5px] w-[15px]">
        <p className="leading-[14px]">[2]</p>
      </div>
      <Image15 />
    </div>
  );
}

function Td42() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-0 w-[605px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Link14 />
    </div>
  );
}

function Td43() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[604.8px] top-0 w-[109px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame23() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-0 overflow-clip top-0 w-16" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-[13px] top-[1.5px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle9}')` }} />
    </div>
  );
}

function SpanBackgroundImage15() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-4 left-[23px] top-3 w-16" data-name="Span+BackgroundImage">
      <Frame23 />
      <div className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-[38px] leading-[0] left-[41.02px] not-italic text-[#141414] text-[12.908px] text-center top-[-11px] tracking-[-0.5px] translate-x-[-50%] w-[46px]">
        <p className="leading-[38px]">자료받기</p>
      </div>
    </div>
  );
}

function ContainerBackgroundColor17() {
  return (
    <div className="absolute bg-white h-10 left-2.5 rounded-[5px] top-[7px] w-[110px]" data-name="Container+BackgroundColor">
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <SpanBackgroundImage15 />
    </div>
  );
}

function Td44() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-[713.98px] top-0 w-[126px]" data-name="Td">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <ContainerBackgroundColor17 />
    </div>
  );
}

function Tr14() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[55px] left-0 top-[770px] w-[840px]" data-name="Tr">
      <Td42 />
      <Td43 />
      <Td44 />
    </div>
  );
}

function Tbody() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[825px] left-0 top-[47px] w-[840px]" data-name="Tbody">
      <Tr />
      <Tr1 />
      <Tr2 />
      <Tr3 />
      <Tr4 />
      <Tr5 />
      <Tr6 />
      <Tr7 />
      <Tr8 />
      <Tr9 />
      <Tr10 />
      <Tr11 />
      <Tr12 />
      <Tr13 />
      <Tr14 />
    </div>
  );
}

function Table() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[872px] left-0 top-[150px] w-[840px]" data-name="Table">
      <div aria-hidden="true" className="absolute border-[#141414] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <TheadTr />
      <Tbody />
    </div>
  );
}

function LinkBackgroundColor2() {
  return (
    <div className="absolute bg-[#767676] left-[5px] rounded-[100px] size-6 top-0" data-name="Link+BackgroundColor">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal h-6 leading-[0] left-[12.05px] not-italic text-[13px] text-center text-white top-[-0.5px] tracking-[-0.5px] translate-x-[-50%] w-[5.5px]">
        <p className="leading-[24px]">1</p>
      </div>
    </div>
  );
}

function Link15() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[39px] rounded-[100px] size-6 top-0" data-name="Link">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal h-6 leading-[0] left-[12.05px] not-italic text-[#555555] text-[13px] text-center top-[-0.5px] tracking-[-0.5px] translate-x-[-50%] w-[7.5px]">
        <p className="leading-[24px]">2</p>
      </div>
    </div>
  );
}

function Link16() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[73px] rounded-[100px] size-6 top-0" data-name="Link">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal h-6 leading-[0] left-[12.05px] not-italic text-[#555555] text-[13px] text-center top-[-0.5px] tracking-[-0.5px] translate-x-[-50%] w-[7.5px]">
        <p className="leading-[24px]">3</p>
      </div>
    </div>
  );
}

function Link17() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[107px] rounded-[100px] size-6 top-0" data-name="Link">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal h-6 leading-[0] left-[12.05px] not-italic text-[#555555] text-[13px] text-center top-[-0.5px] tracking-[-0.5px] translate-x-[-50%] w-[8.5px]">
        <p className="leading-[24px]">4</p>
      </div>
    </div>
  );
}

function Link18() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[141px] rounded-[100px] size-6 top-0" data-name="Link">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal h-6 leading-[0] left-[12.05px] not-italic text-[#555555] text-[13px] text-center top-[-0.5px] tracking-[-0.5px] translate-x-[-50%] w-[7.5px]">
        <p className="leading-[24px]">5</p>
      </div>
    </div>
  );
}

function Link19() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[175px] rounded-[100px] size-6 top-0" data-name="Link">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal h-6 leading-[0] left-[12.05px] not-italic text-[#555555] text-[13px] text-center top-[-0.5px] tracking-[-0.5px] translate-x-[-50%] w-[7.5px]">
        <p className="leading-[24px]">6</p>
      </div>
    </div>
  );
}

function Link20() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[209px] rounded-[100px] size-6 top-0" data-name="Link">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal h-6 leading-[0] left-[12.05px] not-italic text-[#555555] text-[13px] text-center top-[-0.5px] tracking-[-0.5px] translate-x-[-50%] w-[7.5px]">
        <p className="leading-[24px]">7</p>
      </div>
    </div>
  );
}

function Link21() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[243px] rounded-[100px] size-6 top-0" data-name="Link">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal h-6 leading-[0] left-[12.05px] not-italic text-[#555555] text-[13px] text-center top-[-0.5px] tracking-[-0.5px] translate-x-[-50%] w-[7.5px]">
        <p className="leading-[24px]">8</p>
      </div>
    </div>
  );
}

function Link22() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[277px] rounded-[100px] size-6 top-0" data-name="Link">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal h-6 leading-[0] left-[12.05px] not-italic text-[#555555] text-[13px] text-center top-[-0.5px] tracking-[-0.5px] translate-x-[-50%] w-[7.5px]">
        <p className="leading-[24px]">9</p>
      </div>
    </div>
  );
}

function Link23() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-[311px] rounded-[100px] size-6 top-0" data-name="Link">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal h-6 leading-[0] left-3 not-italic text-[#555555] text-[12.384px] text-center top-[-0.5px] tracking-[-0.5px] translate-x-[-50%] w-[13px]">
        <p className="leading-[24px]">10</p>
      </div>
    </div>
  );
}

function Frame24() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-0 overflow-clip size-6 top-0" data-name="Frame">
      <div className="absolute bg-center bg-cover bg-no-repeat left-0 size-6 top-0" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle10}')` }} />
    </div>
  );
}

function ButtonBackgroundColorBackgroundImage() {
  return (
    <div className="absolute bg-[#efefef] left-[340px] rounded-[100px] size-6 top-0" data-name="Button+BackgroundColor+BackgroundImage">
      <Frame24 />
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-6 left-[238px] top-[1052px] w-[364px]" data-name="Container">
      <LinkBackgroundColor2 />
      <Link15 />
      <Link16 />
      <Link17 />
      <Link18 />
      <Link19 />
      <Link20 />
      <Link21 />
      <Link22 />
      <Link23 />
      <ButtonBackgroundColorBackgroundImage />
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[1076px] left-5 top-[140px] w-[840px]" data-name="Container">
      <Container13 />
      <FormBackgroundColor />
      <Table />
      <Container15 />
    </div>
  );
}

function ContainerBackgroundColor18() {
  return (
    <div className="absolute bg-white h-[1286px] left-80 rounded-[10px] top-0 w-[880px]" data-name="Container+BackgroundColor">
      <Container12 />
      <Container16 />
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[1286px] left-[422px] top-[304px] w-[1200px]" data-name="Container">
      <ContainerBackgroundColor2 />
      <ContainerBackgroundColor18 />
    </div>
  );
}

function ContainerImage() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[140px] left-[1590px] overflow-clip top-[331px] w-[290px]" data-name="Container / Image">
      <div className="absolute bg-center bg-cover bg-no-repeat h-[140px] left-0 top-0 w-[290px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle11}')` }} />
    </div>
  );
}

function BodyBackgroundColor() {
  return (
    <div className="absolute bg-white h-[1837px] left-0 top-0 w-[1920px]" data-name="Body+BackgroundColor">
      <Container10 />
      <SpanBackgroundImage />
      <Container17 />
      <ContainerImage />
    </div>
  );
}

export default function HttpsWwwNscoachComCoachListPhpType1Cate101040Viewport1920PxThemeLightGeneratedByCodiaAi() {
  return (
    <div className="bg-[rgba(0,0,0,0)] relative size-full" data-name="https://www.nscoach.com/coach/list.php?type=1&cate=101040 [Viewport=1920px, Theme=Light] - Generated by Codia AI">
      <BodyBackgroundColor />
    </div>
  );
}