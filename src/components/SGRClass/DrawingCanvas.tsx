import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Undo2, Trash2, Eraser, PenLine } from "lucide-react";

const PEN_COLORS = [
  { name: "검정", value: "#1a1a1a" },
  { name: "빨강", value: "#e53935" },
  { name: "파랑", value: "#1e88e5" },
  { name: "흰색", value: "#ffffff" },
  { name: "황토색", value: "#cc7722" },
];

const MIN_SIZE = 1;
const MAX_SIZE = 24;
const DEFAULT_SIZE = 4;

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  size: number;
  mode: "pen" | "eraser"; // 펜 모드 / 지우개 모드
}

interface DrawingCanvasProps {
  active: boolean;
  onClose: () => void;
}

/**
 * 페이지 위에 오버레이되는 필기(낙서) 캔버스
 * - tools 팝오버의 필기 버튼 클릭 시 활성화
 * - 5가지 색상 (검정/빨강/파랑/흰색/살색)
 * - 두께 슬라이더 (1~24px)
 * - 펜 / 부분 지우개 모드 전환
 * - 되돌리기, 전체 지우기, 닫기 지원
 */
export function DrawingCanvas({ active, onClose }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [color, setColor] = useState(PEN_COLORS[0].value);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [mode, setMode] = useState<"pen" | "eraser">("pen");

  // 캔버스 크기를 전체 문서 크기에 맞춤
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = document.documentElement.scrollWidth;
    canvas.height = document.documentElement.scrollHeight;
    redrawAll(canvas, strokes);
  }, [active, strokes]);

  // 리사이즈 시 캔버스 재조정
  useEffect(() => {
    if (!active) return;
    const handleResize = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const imageData = canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = document.documentElement.scrollWidth;
      canvas.height = document.documentElement.scrollHeight;
      if (imageData) canvas.getContext("2d")?.putImageData(imageData, 0, 0);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [active]);

  const redrawAll = useCallback((canvas: HTMLCanvasElement, strokesToDraw: Stroke[]) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    strokesToDraw.forEach((s) => {
      if (s.points.length < 2) return;
      if (s.mode === "eraser") {
        // 부분 지우개: destination-out 으로 지움
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = s.color;
      }
      ctx.lineWidth = s.size;
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i].x, s.points[i].y);
      }
      ctx.stroke();
    });
    // 복구
    ctx.globalCompositeOperation = "source-over";
  }, []);

  const getPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX + window.scrollX,
      y: clientY + window.scrollY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const p = getPoint(e);
    setCurrentStroke([p]);
    // 즉시 점 찍기
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      if (mode === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
      }
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + 0.1, p.y + 0.1);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const p = getPoint(e);
    setCurrentStroke((prev) => [...prev, p]);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && currentStroke.length > 0) {
      const last = currentStroke[currentStroke.length - 1];
      if (mode === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
      }
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 1) {
      setStrokes((prev) => [...prev, { points: currentStroke, color, size, mode }]);
    }
    setCurrentStroke([]);
  };

  const undo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const clearAll = () => {
    setStrokes([]);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  if (!active) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="absolute top-0 left-0 z-[100]"
      style={{
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      }}
    >
      {/* 필기 캔버스 (투명 배경, 전체 문서 크기) */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
        style={{
          touchAction: "none",
          cursor: mode === "eraser" ? "cell" : "crosshair",
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      {/* 필기 툴 바 */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[101] flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-600">
        {/* 펜 / 지우개 모드 토글 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode("pen")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              mode === "pen"
                ? "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            title="펜"
          >
            <PenLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMode("eraser")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              mode === "eraser"
                ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            title="부분 지우개"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-600" />

        {/* 색상 선택 (펜 모드일 때만 활성) */}
        <div className={`flex items-center gap-1.5 ${mode === "eraser" ? "opacity-30 pointer-events-none" : ""}`}>
          {PEN_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setColor(c.value);
                setMode("pen");
              }}
              className={`w-7 h-7 rounded-full transition-transform hover:scale-110 border ${
                c.value === "#ffffff" ? "border-gray-300" : "border-transparent"
              } ${color === c.value && mode === "pen" ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : ""}`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-600" />

        {/* 두께 슬라이더 */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] text-gray-400 font-medium">두께</span>
          <input
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-20 h-1 accent-violet-500 cursor-pointer"
            title={`두께: ${size}px`}
          />
          <span className="text-[10px] text-gray-500 font-mono w-6 text-right">{size}</span>
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-600" />

        {/* 되돌리기 */}
        <button
          onClick={undo}
          disabled={strokes.length === 0}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
          title="되돌리기"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* 전체 지우기 */}
        <button
          onClick={clearAll}
          disabled={strokes.length === 0}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 transition-colors"
          title="전체 지우기"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-600" />

        {/* 닫기 */}
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="필기 닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}
