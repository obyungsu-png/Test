import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Undo2, Trash2 } from "lucide-react";

const PEN_COLORS = [
  { name: "검정", value: "#1a1a1a" },
  { name: "빨강", value: "#e53935" },
  { name: "파랑", value: "#1e88e5" },
];

const PEN_SIZES = [
  { name: "가는", value: 2 },
  { name: "중간", value: 4 },
  { name: "굵은", value: 8 },
];

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  size: number;
}

interface DrawingCanvasProps {
  active: boolean;
  onClose: () => void;
}

/**
 * 페이지 위에 오버레이되는 필기(낙서) 캔버스
 * - tools 팝오버의 필기 버튼 클릭 시 활성화
 * - 3가지 색상 / 3가지 두께 선택 가능
 * - 되돌리기, 전체 지우기, 닫기 지원
 * - localStorage에 저장하지 않음 (세션 내 유지)
 */
export function DrawingCanvas({ active, onClose }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [color, setColor] = useState(PEN_COLORS[0].value);
  const [size, setSize] = useState(PEN_SIZES[1].value); // 기본: 중간

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
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.size;
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i].x, s.points[i].y);
      }
      ctx.stroke();
    });
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
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + 0.1, p.y + 0.1);
      ctx.stroke();
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
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 1) {
      setStrokes((prev) => [...prev, { points: currentStroke, color, size }]);
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
    <div ref={containerRef} className="fixed inset-0 z-[100]">
      {/* 필기 캔버스 (투명 배경, 전체 문서 크기) */}
      <canvas
        ref={canvasRef}
        className="absolute cursor-crosshair"
        style={{ touchAction: "none" }}
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
        {/* 색상 선택 */}
        <div className="flex items-center gap-1.5">
          {PEN_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                color === c.value ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : ""
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-600" />

        {/* 두께 선택 */}
        <div className="flex items-center gap-1">
          {PEN_SIZES.map((s) => (
            <button
              key={s.value}
              onClick={() => setSize(s.value)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                size === s.value
                  ? "bg-gray-200 dark:bg-gray-600"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              title={s.name}
            >
              <div
                className="rounded-full bg-gray-700 dark:bg-gray-300"
                style={{ width: s.value * 2, height: s.value * 2 }}
              />
            </button>
          ))}
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
