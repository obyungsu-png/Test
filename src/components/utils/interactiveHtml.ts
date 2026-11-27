// 인터랙티브 HTML 보조자료 — 판별 · 로딩 · 전체화면 유틸
//
// 보조자료 탭에 올리는 .html 자료는 다운로드/PDF 뷰어가 아니라
// 사이트 안 전체화면 플레이어(InteractiveHtmlPlayer)에서 그대로 실행된다.

import { upgradeHtmlTools } from "./htmlPenTools";

/** START 버튼만 보여 줄 탭 (원래 탭 이름 기준) */
export const START_ONLY_TAB = "보조자료";
/** HTML(CSS·JS 포함) 자료 전용 탭 — 한국학교·국제학교 공통, 항상 START 로 실행 */
export const INTERACTIVE_TAB = "인터랙티브";
/** 보조자료 탭을 START 전용으로 바꾼 과목 (한국학교) — 넓히려면 여기에 과목을 추가 */
export const START_ONLY_SUBJECTS = ["영어"];
/** CMS 업로드 허용 크기 — 자료 목록이 한 덩어리로 저장되므로 너무 큰 파일은 막는다 */
export const MAX_HTML_BYTES = 4 * 1024 * 1024;

type FileLike = { fileName?: string; fileType?: string; fileData?: string } | null | undefined;

export function isHtmlFile(file: FileLike): boolean {
  if (!file) return false;
  return /^text\/html\b/i.test(file.fileType || "") || /\.html?$/i.test(file.fileName || "");
}

/** 실행 가능한 HTML 파일이 붙은 자료인지 */
export function isInteractiveMaterial(material: any): boolean {
  return !!material?.uploadData?.fileData && isHtmlFile(material.uploadData);
}

/** 저장된 fileData(data URL 또는 일반 URL) → 실행용 HTML Blob */
export async function loadHtmlBlob(fileData: string): Promise<Blob> {
  const res = await fetch(fileData);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.blob();
  // 저장 시 MIME 이 비어 있거나 달라도 항상 UTF-8 HTML 로 실행
  return new Blob([raw], { type: "text/html;charset=utf-8" });
}

/**
 * START 플레이어용 HTML — 자료 속 필기 도구(펜 툴바 크기·붙여넣기 글상자)를 개선판으로 바꿔 실행한다.
 * 저장된 파일은 그대로 두고, 해당 도구가 없거나 다른 버전이면 원본 그대로 실행.
 */
export async function loadHtmlForPlayer(fileData: string): Promise<Blob> {
  const blob = await loadHtmlBlob(fileData);
  const html = await blob.text();
  const upgraded = upgradeHtmlTools(html);
  return upgraded === html ? blob : new Blob([upgraded], { type: "text/html;charset=utf-8" });
}

/** HTML 문자열에서 <title> 추출 (CMS 제목 자동 채우기용) */
export function extractHtmlTitle(html: string): string {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!m) return "";
  const el = document.createElement("textarea");
  el.innerHTML = m[1];
  return el.value.replace(/\s+/g, " ").trim();
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// ── 전체화면 (Safari 접두사 포함) ─────────────────────────────────
// 버튼 클릭 핸들러 안에서 바로 호출해야 브라우저가 허용한다.

export function getFullscreenElement(): Element | null {
  const d = document as any;
  return document.fullscreenElement ?? d.webkitFullscreenElement ?? null;
}

export function canFullscreen(): boolean {
  const el = document.documentElement as any;
  return !!(el.requestFullscreen || el.webkitRequestFullscreen);
}

export function enterFullscreen(): void {
  if (getFullscreenElement()) return;
  const el = document.documentElement as any;
  const request = el.requestFullscreen ?? el.webkitRequestFullscreen;
  try {
    request?.call(el)?.catch?.(() => {});
  } catch {
    /* iPhone Safari 등 미지원 — 화면 전체 오버레이로 대신한다 */
  }
}

export function exitFullscreen(): void {
  if (!getFullscreenElement()) return;
  const d = document as any;
  const exit = d.exitFullscreen ?? d.webkitExitFullscreen;
  try {
    exit?.call(d)?.catch?.(() => {});
  } catch {
    /* noop */
  }
}
