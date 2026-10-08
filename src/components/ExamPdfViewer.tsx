import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { X, Hand, Pencil, Highlighter, Eraser, Undo2, Redo2, Trash2, ZoomIn, ZoomOut, Loader2, FileWarning } from "lucide-react";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

// ===================== 시험보기 PDF 뷰어 =====================
// "다운로드" 자료(uploadData)를 화면에서만 볼 수 있게 캔버스로 그린다.
// - 파일 URL/iframe 을 노출하지 않음 → 브라우저 PDF 뷰어의 다운로드·인쇄 버튼이 없음
// - 우클릭, Ctrl+S / Ctrl+P, 인쇄를 막음
// - 페이지 위에 펜 / 형광펜 / 지우개 필기 레이어, 필기는 이 기기(localStorage)에 자동 저장

type Tool = "hand" | "pen" | "highlighter" | "eraser";

interface Stroke {
  tool: "pen" | "highlighter";
  color: string;
  size: number;
  points: number[]; // [x0, y0, x1, y1, ...] — 페이지 기준 좌표(zoom 1)
}

type Annotations = Record<number, Stroke[]>;

const EMPTY_STROKES: Stroke[] = [];

interface RenderJob {
  promise: Promise<void>;
  cancel: () => void;
}

interface PageSpec {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, scale: number) => RenderJob;
}

// 사용자에게 그대로 보여줄 안내 문구
class ViewerMessage extends Error {}

interface ExamPdfViewerProps {
  material: any;
  onClose: () => void;
}

const PEN_COLORS = ["#111827", "#DC2626", "#2563EB", "#16A34A"];
const HIGHLIGHT_COLORS = ["#FFF176", "#B9F6CA", "#FFB3D9", "#B3E5FC"];
const PEN_SIZES = [1.5, 2.5, 4];
const HIGHLIGHT_SIZES = [10, 16, 24];
const ERASER_RADIUS_PX = 12;

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const MAX_CANVAS_PIXELS = 5_000_000;

const A4_W = 794;
const A4_H = 1123;
const FONT_STACK = `"Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "Nanum Gothic", sans-serif`;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function renderScaleFor(w: number, h: number, zoom: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  return Math.min(zoom * dpr, Math.sqrt(MAX_CANVAS_PIXELS / (w * h)));
}

// ---------- 파일 해석 ----------

type FileKind = "pdf" | "text" | "image" | "unsupported";

function detectKind(u: any): FileKind {
  const type = (u?.fileType || "").toLowerCase();
  const name = (u?.fileName || "").toLowerCase();
  const head = typeof u?.fileData === "string" ? u.fileData.slice(0, 40).toLowerCase() : "";
  if (type === "application/pdf" || name.endsWith(".pdf") || head.startsWith("data:application/pdf")) return "pdf";
  if (type.startsWith("text/") || name.endsWith(".txt") || head.startsWith("data:text/")) return "text";
  if (type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp)$/.test(name) || head.startsWith("data:image/")) return "image";
  return "unsupported";
}

function decodeDataUrl(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(",");
  const meta = dataUrl.slice(5, comma);
  const payload = dataUrl.slice(comma + 1);
  if (/;base64/i.test(meta)) {
    const bin = atob(payload);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  return new TextEncoder().encode(decodeURIComponent(payload));
}

const doneJob = (): RenderJob => ({ promise: Promise.resolve(), cancel: () => {} });

async function loadPdfPages(fileData: string, signal: AbortSignal): Promise<PageSpec[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (signal.aborted) return [];
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  const cdn = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}`;
  const source = fileData.startsWith("data:") ? { data: decodeDataUrl(fileData) } : { url: fileData };
  const task = pdfjs.getDocument({
    ...source,
    cMapUrl: `${cdn}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${cdn}/standard_fonts/`,
    isEvalSupported: false,
  });
  signal.addEventListener("abort", () => { task.destroy(); });
  const doc = await task.promise;

  const pages: PageSpec[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const base = page.getViewport({ scale: 1 });
    pages.push({
      width: base.width,
      height: base.height,
      draw: (ctx, scale) => {
        const task = page.render({ canvasContext: ctx, viewport: page.getViewport({ scale }) });
        return { promise: task.promise, cancel: () => task.cancel() };
      },
    });
  }
  return pages;
}

function wrapLine(ctx: CanvasRenderingContext2D, line: string, maxW: number): string[] {
  if (!line.trim()) return [""];
  const out: string[] = [];
  let cur = "";
  for (const tok of line.match(/\S+\s*|\s+/g) || [line]) {
    if (ctx.measureText(cur + tok).width <= maxW) { cur += tok; continue; }
    if (cur.trim()) { out.push(cur.trimEnd()); cur = ""; }
    if (ctx.measureText(tok).width <= maxW) { cur = tok; continue; }
    for (const ch of Array.from(tok)) {
      if (cur && ctx.measureText(cur + ch).width > maxW) { out.push(cur); cur = ""; }
      cur += ch;
    }
  }
  if (cur.trim() || !out.length) out.push(cur.trimEnd());
  return out;
}

// 텍스트 파일 → A4 페이지로 조판
async function buildTextPages(title: string, text: string): Promise<PageSpec[]> {
  try { await (document as any).fonts?.ready; } catch { /* 폰트 로딩 실패 시 기본 폰트 사용 */ }
  const MARGIN_X = 72, MARGIN_TOP = 84, MARGIN_BOTTOM = 96;
  const maxW = A4_W - MARGIN_X * 2;
  const bodyFont = `15px ${FONT_STACK}`, titleFont = `bold 22px ${FONT_STACK}`;
  const measure = document.createElement("canvas").getContext("2d")!;

  type Row = { text: string; font: string; height: number; color: string; rule?: boolean };
  const rows: Row[] = [];
  measure.font = titleFont;
  for (const t of wrapLine(measure, title, maxW)) rows.push({ text: t, font: titleFont, height: 34, color: "#111827" });
  rows.push({ text: "", font: bodyFont, height: 24, color: "#111827", rule: true });
  measure.font = bodyFont;
  for (const raw of text.replace(/\r/g, "").replace(/\t/g, "    ").split("\n")) {
    for (const t of wrapLine(measure, raw, maxW)) rows.push({ text: t, font: bodyFont, height: 27, color: "#1f2937" });
  }

  const pageRows: { row: Row; y: number }[][] = [[]];
  let y = MARGIN_TOP;
  for (const row of rows) {
    if (y + row.height > A4_H - MARGIN_BOTTOM && pageRows[pageRows.length - 1].length) {
      pageRows.push([]);
      y = MARGIN_TOP;
    }
    pageRows[pageRows.length - 1].push({ row, y });
    y += row.height;
  }

  return pageRows.map((items, pi) => ({
    width: A4_W,
    height: A4_H,
    draw: (ctx, scale) => {
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, A4_W, A4_H);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      for (const { row, y } of items) {
        if (row.rule) {
          ctx.fillStyle = "#0e7490";
          ctx.fillRect(MARGIN_X, y + row.height / 2 - 1, maxW, 2);
          continue;
        }
        ctx.font = row.font;
        ctx.fillStyle = row.color;
        ctx.fillText(row.text, MARGIN_X, y + row.height * 0.72);
      }
      ctx.font = `12px ${FONT_STACK}`;
      ctx.fillStyle = "#9ca3af";
      ctx.textAlign = "center";
      ctx.fillText(`- ${pi + 1} -`, A4_W / 2, A4_H - 44);
      return doneJob();
    },
  }));
}

async function buildImagePage(src: string): Promise<PageSpec[]> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = src;
  });
  const height = (A4_W * img.naturalHeight) / img.naturalWidth;
  return [{
    width: A4_W,
    height,
    draw: (ctx, scale) => {
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, A4_W, height);
      ctx.drawImage(img, 0, 0, A4_W, height);
      return doneJob();
    },
  }];
}

// ---------- 필기 그리기 ----------

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  const p = s.points;
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineWidth = s.size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (p.length <= 2) {
    ctx.beginPath();
    ctx.arc(p[0], p[1], s.size / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length - 2; i += 2) {
    ctx.quadraticCurveTo(p[i], p[i + 1], (p[i] + p[i + 2]) / 2, (p[i + 1] + p[i + 3]) / 2);
  }
  ctx.lineTo(p[p.length - 2], p[p.length - 1]);
  ctx.stroke();
}

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 ? clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function strokeHit(s: Stroke, x: number, y: number, r: number) {
  const p = s.points;
  const reach = r + s.size / 2;
  if (p.length <= 2) return Math.hypot(x - p[0], y - p[1]) <= reach;
  for (let i = 0; i < p.length - 2; i += 2) {
    if (distToSegment(x, y, p[i], p[i + 1], p[i + 2], p[i + 3]) <= reach) return true;
  }
  return false;
}

// ---------- 페이지 ----------

interface PageViewProps {
  index: number;
  spec: PageSpec;
  zoom: number;
  tool: Tool;
  color: string;
  size: number;
  strokes: Stroke[];
  scrollRoot: HTMLElement | null;
  onAddStroke: (page: number, stroke: Stroke) => void;
  onEraseStrokes: (page: number, indices: number[]) => void;
  registerEl: (page: number, el: HTMLDivElement | null) => void;
}

function PageView({ index, spec, zoom, tool, color, size, strokes, scrollRoot, onAddStroke, onEraseStrokes, registerEl }: PageViewProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  const live = useRef<Stroke | null>(null);
  const erased = useRef<Set<number> | null>(null);
  const pointerId = useRef<number | null>(null);
  const rect = useRef<DOMRect | null>(null);
  const raf = useRef(0);

  const cssW = spec.width * zoom;
  const cssH = spec.height * zoom;

  useEffect(() => {
    registerEl(index, wrapRef.current);
    return () => registerEl(index, null);
  }, [index, registerEl]);

  // 화면 근처에 있을 때만 캔버스를 유지(메모리 절약)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !scrollRoot) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { root: scrollRoot, rootMargin: "800px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [scrollRoot]);

  useEffect(() => {
    const canvas = contentRef.current;
    if (!canvas) return;
    if (!visible) { canvas.width = 0; canvas.height = 0; return; }
    const scale = renderScaleFor(spec.width, spec.height, zoom);
    canvas.width = Math.floor(spec.width * scale);
    canvas.height = Math.floor(spec.height * scale);
    const job = spec.draw(canvas.getContext("2d")!, scale);
    job.promise.catch((err) => {
      if (err?.name !== "RenderingCancelledException") console.error("[ExamPdfViewer] page render failed:", err);
    });
    return () => job.cancel();
  }, [visible, zoom, spec]);

  const drawOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    if (!visible) { canvas.width = 0; canvas.height = 0; return; }
    const scale = renderScaleFor(spec.width, spec.height, zoom);
    const w = Math.floor(spec.width * scale), h = Math.floor(spec.height * scale);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const shown = strokes.filter((_, i) => !erased.current?.has(i));
    if (live.current) shown.push(live.current);
    // 형광펜을 먼저, 펜을 위에 그려서 형광펜이 글씨를 덮지 않게 한다
    for (const s of shown) if (s.tool === "highlighter") drawStroke(ctx, s);
    for (const s of shown) if (s.tool === "pen") drawStroke(ctx, s);
  }, [visible, zoom, spec, strokes]);

  useEffect(() => { drawOverlay(); }, [drawOverlay]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const scheduleDraw = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(drawOverlay);
  };

  const toPage = (e: { clientX: number; clientY: number }) => {
    const r = rect.current!;
    return { x: Math.round(((e.clientX - r.left) / zoom) * 10) / 10, y: Math.round(((e.clientY - r.top) / zoom) * 10) / 10 };
  };

  const eraseAt = (x: number, y: number) => {
    const r = ERASER_RADIUS_PX / zoom;
    strokes.forEach((s, i) => {
      if (!erased.current!.has(i) && strokeHit(s, x, y, r)) erased.current!.add(i);
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === "hand" || pointerId.current !== null) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerId.current = e.pointerId;
    rect.current = e.currentTarget.getBoundingClientRect();
    const { x, y } = toPage(e);
    if (tool === "eraser") {
      erased.current = new Set();
      eraseAt(x, y);
    } else {
      live.current = { tool, color, size, points: [x, y] };
    }
    scheduleDraw();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointerId.current !== e.pointerId) return;
    const coalesced = e.nativeEvent.getCoalescedEvents?.();
    for (const ev of coalesced?.length ? coalesced : [e.nativeEvent]) {
      const { x, y } = toPage(ev);
      if (erased.current) {
        eraseAt(x, y);
      } else if (live.current) {
        const p = live.current.points;
        if (Math.hypot(x - p[p.length - 2], y - p[p.length - 1]) >= 0.5) p.push(x, y);
      }
    }
    scheduleDraw();
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;
    cancelAnimationFrame(raf.current);
    if (live.current) {
      const stroke = live.current;
      live.current = null;
      onAddStroke(index, stroke);
    } else if (erased.current) {
      const indices = Array.from(erased.current);
      erased.current = null;
      if (indices.length) onEraseStrokes(index, indices);
    }
  };

  const cursor = tool === "hand" ? "default" : tool === "eraser" ? "cell" : "crosshair";

  return (
    <div
      ref={wrapRef}
      className="relative bg-white shadow-md mx-auto"
      style={{ width: cssW, height: cssH }}
    >
      <canvas ref={contentRef} className="absolute inset-0 block" style={{ width: cssW, height: cssH }} />
      <canvas
        ref={overlayRef}
        className="absolute inset-0 block"
        style={{
          width: cssW,
          height: cssH,
          mixBlendMode: "multiply",
          cursor,
          touchAction: tool === "hand" ? "auto" : "none",
          pointerEvents: tool === "hand" ? "none" : "auto",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      />
    </div>
  );
}

// ---------- 뷰어 ----------

function storageKeyFor(material: any) {
  const u = material?.uploadData || {};
  return `examAnnotations:v1:${material?.id ?? material?.title}:${u.fileName ?? ""}:${u.fileSize ?? ""}`;
}

function loadAnnotations(key: string): Annotations {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}") || {};
  } catch {
    return {};
  }
}

export function ExamPdfViewer({ material, onClose }: ExamPdfViewerProps) {
  const storageKey = useMemo(() => storageKeyFor(material), [material]);
  const [pages, setPages] = useState<PageSpec[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [tool, setTool] = useState<Tool>(() => (window.matchMedia?.("(pointer: fine)")?.matches ? "pen" : "hand"));
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const [hlColor, setHlColor] = useState(HIGHLIGHT_COLORS[0]);
  const [penSize, setPenSize] = useState(PEN_SIZES[1]);
  const [hlSize, setHlSize] = useState(HIGHLIGHT_SIZES[1]);

  const [history, setHistory] = useState(() => ({ past: [] as Annotations[], present: loadAnnotations(storageKey), future: [] as Annotations[] }));
  const annotations = history.present;

  const [zoom, setZoom] = useState(1);
  const autoFit = useRef(true);
  const zoomAnchor = useRef<number | null>(null);
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const pageEls = useRef<(HTMLDivElement | null)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // 파일 불러오기
  useEffect(() => {
    const abort = new AbortController();
    const u = material?.uploadData;
    const fileData: string | undefined = u?.fileData;

    (async () => {
      if (!fileData) throw new ViewerMessage("등록된 시험지 파일이 없습니다.");
      const kind = detectKind(u);
      if (kind === "pdf") return loadPdfPages(fileData, abort.signal);
      if (kind === "text") {
        const text = fileData.startsWith("data:")
          ? new TextDecoder("utf-8").decode(decodeDataUrl(fileData))
          : await (await fetch(fileData)).text();
        return buildTextPages(material.title || "", text);
      }
      if (kind === "image") return buildImagePage(fileData);
      const ext = (u.fileName || "").split(".").pop();
      throw new ViewerMessage(`${ext ? `.${ext} 파일은` : "이 파일은"} 시험보기로 열 수 없습니다. (PDF·이미지·텍스트 파일만 지원)`);
    })()
      .then((result) => { if (!abort.signal.aborted) setPages(result); })
      .catch((err) => {
        if (abort.signal.aborted) return;
        if (err instanceof ViewerMessage) {
          setError(err.message);
        } else {
          console.error("[ExamPdfViewer] load failed:", err);
          setError("시험지를 불러오지 못했습니다.");
        }
      });

    return () => abort.abort();
  }, [material]);

  // 필기 자동 저장
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const hasAny = Object.values(annotations).some((list) => list.length);
        if (hasAny) localStorage.setItem(storageKey, JSON.stringify(annotations));
        else localStorage.removeItem(storageKey);
      } catch (e) {
        console.warn("[ExamPdfViewer] failed to save annotations:", e);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [annotations, storageKey]);

  // 본문 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const commit = useCallback((update: (prev: Annotations) => Annotations) => {
    setHistory((h) => ({ past: [...h.past.slice(-99), h.present], present: update(h.present), future: [] }));
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => (h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h));
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => (h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h));
  }, []);

  const handleAddStroke = useCallback((page: number, stroke: Stroke) => {
    commit((prev) => ({ ...prev, [page]: [...(prev[page] || []), stroke] }));
  }, [commit]);

  const handleEraseStrokes = useCallback((page: number, indices: number[]) => {
    const drop = new Set(indices);
    commit((prev) => ({ ...prev, [page]: (prev[page] || []).filter((_, i) => !drop.has(i)) }));
  }, [commit]);

  const handleClearAll = () => {
    if (!Object.values(annotations).some((list) => list.length)) return;
    if (window.confirm("모든 페이지의 필기를 지울까요? (되돌리기로 복구할 수 있어요)")) commit(() => ({}));
  };

  // 다운로드 / 인쇄 / 저장 단축키 차단 + 되돌리기 단축키
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "s" || k === "p") {
        e.preventDefault();
        toast.error("이 자료는 다운로드·인쇄할 수 없습니다.");
      } else if (k === "z") {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if (k === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [undo, redo]);

  // 폭 맞춤 배율
  const fitZoom = useCallback(() => {
    if (!scrollRoot || !pages?.length) return 1;
    const maxW = Math.max(...pages.map((p) => p.width));
    return clamp((scrollRoot.clientWidth - 32) / maxW, MIN_ZOOM, 1.5);
  }, [scrollRoot, pages]);

  useEffect(() => {
    if (!pages || !scrollRoot) return;
    if (autoFit.current) setZoom(fitZoom());
    const onResize = () => { if (autoFit.current) setZoom(fitZoom()); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [pages, scrollRoot, fitZoom]);

  const changeZoom = (target: number, fromUser = true) => {
    if (fromUser) autoFit.current = false;
    const next = clamp(Math.round(target * 100) / 100, MIN_ZOOM, MAX_ZOOM);
    if (next === zoom) return;
    if (scrollRoot) zoomAnchor.current = (scrollRoot.scrollTop + scrollRoot.clientHeight / 2) / scrollRoot.scrollHeight;
    setZoom(next);
  };

  // 배율 변경 후 보던 위치 유지
  useLayoutEffect(() => {
    if (zoomAnchor.current === null || !scrollRoot) return;
    scrollRoot.scrollTop = zoomAnchor.current * scrollRoot.scrollHeight - scrollRoot.clientHeight / 2;
    zoomAnchor.current = null;
  }, [zoom, scrollRoot]);

  const registerEl = useCallback((page: number, el: HTMLDivElement | null) => {
    pageEls.current[page] = el;
  }, []);

  const handleScroll = () => {
    if (!scrollRoot) return;
    const mark = scrollRoot.scrollTop + scrollRoot.clientHeight / 3;
    let current = 1;
    pageEls.current.forEach((el, i) => { if (el && el.offsetTop <= mark) current = i + 1; });
    setCurrentPage(current);
  };

  const activeColor = tool === "highlighter" ? hlColor : penColor;
  const activeSize = tool === "highlighter" ? hlSize : penSize;
  const colors = tool === "pen" ? PEN_COLORS : tool === "highlighter" ? HIGHLIGHT_COLORS : [];
  const sizes = tool === "pen" ? PEN_SIZES : tool === "highlighter" ? HIGHLIGHT_SIZES : [];

  const toolButtons: { id: Tool; label: string; Icon: typeof Hand }[] = [
    { id: "hand", label: "이동", Icon: Hand },
    { id: "pen", label: "펜", Icon: Pencil },
    { id: "highlighter", label: "형광펜", Icon: Highlighter },
    { id: "eraser", label: "지우개", Icon: Eraser },
  ];

  const iconBtn = "shrink-0 h-9 w-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors";

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col bg-slate-200 select-none"
      style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" } as React.CSSProperties}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <style>{"@media print { body { display: none !important; } }"}</style>

      {/* 헤더 */}
      <div className="h-12 shrink-0 bg-white border-b border-gray-200 flex items-center gap-3 px-3 sm:px-4">
        <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-600 text-white">시험보기</span>
        <h2 className="flex-1 min-w-0 truncate text-sm font-semibold text-gray-800" title={material?.title}>{material?.title}</h2>
        {pages && <span className="shrink-0 text-xs text-gray-500 tabular-nums">{currentPage} / {pages.length}</span>}
        <button onClick={onClose} className={iconBtn} aria-label="닫기">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 도구 모음 */}
      <div className="shrink-0 bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex items-center gap-1 px-2 sm:px-3 py-1.5 w-max min-w-full">
          {toolButtons.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`shrink-0 h-9 px-2.5 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-colors ${tool === id ? "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-300" : "text-gray-600 hover:bg-gray-100"}`}
              aria-pressed={tool === id}
              title={label}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}

          {colors.length > 0 && (
            <>
              <div className="shrink-0 w-px h-6 bg-gray-200 mx-1.5" />
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => (tool === "highlighter" ? setHlColor(c) : setPenColor(c))}
                  className={`shrink-0 w-7 h-7 rounded-full border-2 transition-transform ${activeColor === c ? "border-cyan-500 scale-110" : "border-gray-200"}`}
                  style={{ backgroundColor: c }}
                  aria-label={`색상 ${c}`}
                />
              ))}
              <div className="shrink-0 w-px h-6 bg-gray-200 mx-1.5" />
              {sizes.map((s, i) => (
                <button
                  key={s}
                  onClick={() => (tool === "highlighter" ? setHlSize(s) : setPenSize(s))}
                  className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${activeSize === s ? "bg-gray-100 ring-1 ring-gray-300" : "hover:bg-gray-50"}`}
                  aria-label={`굵기 ${i + 1}`}
                >
                  <span className="rounded-full bg-gray-700" style={{ width: 4 + i * 4, height: 4 + i * 4 }} />
                </button>
              ))}
            </>
          )}

          <div className="shrink-0 w-px h-6 bg-gray-200 mx-1.5" />
          <button onClick={undo} disabled={!history.past.length} className={iconBtn} title="되돌리기 (Ctrl+Z)" aria-label="되돌리기">
            <Undo2 className="w-4 h-4" />
          </button>
          <button onClick={redo} disabled={!history.future.length} className={iconBtn} title="다시 실행 (Ctrl+Shift+Z)" aria-label="다시 실행">
            <Redo2 className="w-4 h-4" />
          </button>
          <button onClick={handleClearAll} className={iconBtn} title="필기 모두 지우기" aria-label="필기 모두 지우기">
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="shrink-0 w-px h-6 bg-gray-200 mx-1.5" />
          <button onClick={() => changeZoom(zoom / 1.2)} disabled={zoom <= MIN_ZOOM} className={iconBtn} aria-label="축소">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => { autoFit.current = true; changeZoom(fitZoom(), false); }}
            className="shrink-0 h-9 min-w-[3.25rem] px-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 tabular-nums"
            title="폭에 맞추기"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={() => changeZoom(zoom * 1.2)} disabled={zoom >= MAX_ZOOM} className={iconBtn} aria-label="확대">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 페이지 */}
      <div ref={setScrollRoot} onScroll={handleScroll} className="relative flex-1 overflow-auto">
        {error ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 px-6 text-center">
            <FileWarning className="w-10 h-10 text-gray-400" />
            <p className="text-sm text-gray-600">{error}</p>
            <button onClick={onClose} className="mt-2 px-4 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">닫기</button>
          </div>
        ) : !pages ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">시험지를 불러오는 중...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4 px-4 w-max min-w-full">
            {pages.map((spec, i) => (
              <PageView
                key={i}
                index={i}
                spec={spec}
                zoom={zoom}
                tool={tool}
                color={activeColor}
                size={activeSize}
                strokes={annotations[i] || EMPTY_STROKES}
                scrollRoot={scrollRoot}
                onAddStroke={handleAddStroke}
                onEraseStrokes={handleEraseStrokes}
                registerEl={registerEl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

