import { useEffect, useRef, useState } from "react";
import { Loader2, Maximize2, Minimize2, X } from "lucide-react";
import { canFullscreen, enterFullscreen, exitFullscreen, getFullscreenElement, loadHtmlForPlayer } from "./utils/interactiveHtml";

interface InteractiveHtmlPlayerProps {
  material: any;
  onClose: () => void;
}

// 업로드한 HTML 이 하는 일(채점·필기·학습 기록 저장·PDF 인쇄)은 그대로 허용하고,
// 사이트 자체를 다른 주소로 이동시키는 것만 막는다 (allow-top-navigation 없음).
const SANDBOX = [
  "allow-scripts",
  "allow-same-origin", // 학습 기록(localStorage) 유지
  "allow-forms",
  "allow-modals", // alert / confirm / 인쇄(PDF 저장)
  "allow-popups",
  "allow-popups-to-escape-sandbox",
  "allow-downloads",
].join(" ");

/**
 * 보조자료 HTML 전체화면 플레이어.
 * 파일을 내려받거나 뷰어로 보여 주지 않고, 사이트 안에서 바로 실행한다.
 */
export function InteractiveHtmlPlayer({ material, onClose }: InteractiveHtmlPlayerProps) {
  const fileData: string | undefined = material?.uploadData?.fileData;
  const title: string = material?.title || "보조자료";

  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(() => !!getFullscreenElement());
  // 문제 이동형 자료는 마지막 문제에서만 '닫기'를 보여 준다 (자료가 allmyexam:close 로 알려 줌).
  // 알려 주지 않는 자료는 항상 보임.
  const [closeVisible, setCloseVisible] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // HTML 불러오기 → Blob URL 로 실행 (닫을 때 해제)
  useEffect(() => {
    if (!fileData) {
      setFailed(true);
      return;
    }
    let alive = true;
    let url: string | null = null;
    setSrc(null);
    setLoaded(false);
    setFailed(false);
    setCloseVisible(true);
    loadHtmlForPlayer(fileData)
      .then((blob) => {
        if (!alive) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .catch((err) => {
        console.error("[InteractiveHtmlPlayer] load failed:", err);
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileData]);

  // 자료가 보내는 '닫기 보이기' 알림 — 이 플레이어의 iframe 에서 온 것만 받는다
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return;
      const d = e.data;
      if (d && d.type === "allmyexam:close" && typeof d.visible === "boolean") setCloseVisible(d.visible);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // 전체화면 상태 추적 (Esc 로 해제해도 버튼이 맞게 바뀌도록)
  useEffect(() => {
    const sync = () => setIsFullscreen(!!getFullscreenElement());
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  // 열려 있는 동안 뒤 페이지 스크롤 잠금, 닫히면 전체화면 해제
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      exitFullscreen();
    };
  }, []);

  // 휴대폰 '뒤로 가기' = 플레이어 닫기 (사이트 이전 화면으로 넘어가지 않도록)
  useEffect(() => {
    let closedByBack = false;
    const onPop = () => {
      closedByBack = true;
      onCloseRef.current();
    };
    window.history.pushState(window.history.state, "");
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (!closedByBack) window.history.back();
    };
  }, []);

  const toggleFullscreen = () => (getFullscreenElement() ? exitFullscreen() : enterFullscreen());

  const iconBtn =
    "shrink-0 h-9 px-2.5 flex items-center gap-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors";

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col bg-white" role="dialog" aria-modal="true" aria-label={title}>
      {/* 헤더 */}
      <div className="h-12 shrink-0 bg-white border-b border-gray-200 flex items-center gap-2 sm:gap-3 px-3 sm:px-4">
        <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-600 text-white">보조자료</span>
        <h2 className="flex-1 min-w-0 truncate text-sm font-semibold text-gray-800" title={title}>
          {title}
        </h2>
        {canFullscreen() && (
          <button
            onClick={toggleFullscreen}
            className={iconBtn}
            aria-label={isFullscreen ? "전체화면 해제" : "전체화면"}
            title={isFullscreen ? "전체화면 해제 (Esc)" : "전체화면"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? "전체화면 해제" : "전체화면"}</span>
          </button>
        )}
        {(closeVisible || failed) && (
          <button onClick={onClose} className={iconBtn} aria-label="닫기" title="닫기">
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">닫기</span>
          </button>
        )}
      </div>

      {/* 실행 영역 */}
      <div className="relative flex-1 min-h-0">
        {src && (
          <iframe
            ref={iframeRef}
            src={src}
            title={title}
            sandbox={SANDBOX}
            allow="fullscreen; clipboard-read; clipboard-write; autoplay"
            className="absolute inset-0 w-full h-full border-0"
            onLoad={() => {
              setLoaded(true);
              // 키보드(←/→ 등)가 바로 자료에 전달되도록
              iframeRef.current?.contentWindow?.focus();
            }}
          />
        )}

        {!loaded && !failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white text-gray-500">
            <Loader2 className="w-7 h-7 animate-spin text-cyan-600" />
            <p className="text-sm">자료를 불러오는 중…</p>
          </div>
        )}

        {failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white px-6 text-center">
            <p className="text-sm text-gray-600">자료를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition-colors"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
