// 업로드한 HTML 자료 속 필기 도구(펜 툴바 · 붙여넣기 글상자) 개선
//
// 영어·화학 HTML 자료 여러 개에 같은 필기 도구가 들어 있다. 저장된 파일은 그대로 두고,
// START 플레이어가 실행할 때만 아래 두 가지를 적용한다 (upgradeHtmlTools).
//
// 1) 펜 툴바·펜 설정 창 작게 — 펜 툴바(#pbar.pbar2)가 있는 모든 자료 (사이트 전체 통일)
// 2) 붙여넣기 글상자 도구 교체 — 알고 있는 예전 버전일 때만 (다른 버전이거나 손본 파일은 그대로)
// 3) 펜 모드 두 손가락 스크롤 — 손가락을 그대로 따라가고 손을 떼면 살짝 미끄러지게
// 4) 문제가 여러 개인 자료(문제 이동 버튼이 있는 TOEIC·독해형): 펜·붙여넣기를 문제마다 따로 저장,
//    마지막 문제에서만 플레이어의 '닫기' 버튼이 보이도록 플레이어에 알림
//    예전 버전은 글상자 크기·줄 길이를 바꿀 수 없고, 설정 창이 글상자를 덮고,
//    사이트에서는 저장 키가 열 때마다 바뀌어 다시 열면 붙여 넣은 글이 사라졌다.
//
// 파일 자체를 고칠 때 쓰는 안내: docs/HTML-필기도구-변경.md (이 파일의 코드와 같은 내용)

/** START 플레이어용: 필기 도구 개선을 적용한 HTML (해당 도구가 없으면 그대로) */
export function upgradeHtmlTools(html: string): string {
  return addPageScript(addPenScrollFix(addPenToolbarStyle(upgradePasteNoteTool(html))));
}

// ── 1) 펜 툴바·펜 설정 창 작게 ─────────────────────────────────────────────
export const PEN_TOOLBAR_STYLE_ID = "pentool-compact";
export const PEN_TOOLBAR_CSS = [
  "#pbar.pbar2{gap:1px;padding:4px;border-radius:11px}",
  "#pbar.pbar2 .pt{width:32px;height:32px;border-radius:8px}",
  "#pbar.pbar2 .pt svg{width:17px;height:17px}",
  "#pbar.pbar2 .pt.opt::after{right:2px;bottom:2px;border-width:2px}",
  "#pbar.pbar2 .psep{margin:2px 4px}",
  "#pbar.pbar2 .pdot{width:15px;height:15px}",
  "/* 그리기·형광펜·지우개 설정 창 (붙여넣기 글상자 설정 창과 같은 크기) */",
  ".ppop:not(.npop){box-sizing:border-box;width:236px;padding:10px 12px;gap:5px;border-radius:14px;font-size:.78rem}",
  ".ppop:not(.npop) .pph{font-size:.72rem;font-weight:600;color:#aeb3bd}",
  ".ppop:not(.npop) .ppr{gap:3px}",
  ".ppop:not(.npop) .ppb{width:36px;height:30px;border-radius:8px}",
  ".ppop:not(.npop) .ppb svg{width:18px;height:18px}",
  ".ppop:not(.npop) .ppb .sw{width:17px;height:17px}",
  ".ppop:not(.npop) .ppb i{width:20px}",
  ".ppop:not(.npop) .pphint{font-size:.7rem;line-height:1.4}",
  ".ppop:not(.npop) .ppbtn{padding:6px 8px;font-size:.78rem}",
].join("\n");

/** 펜 툴바가 있는 자료에 작은 툴바 스타일을 넣는다 (이미 들어 있으면 그대로) */
export function addPenToolbarStyle(html: string): string {
  if (!html.includes('class="pbar2"') || html.includes(`id="${PEN_TOOLBAR_STYLE_ID}"`)) return html;
  const tag = `<style id="${PEN_TOOLBAR_STYLE_ID}">\n${PEN_TOOLBAR_CSS}\n</style>\n`;
  const at = html.search(/<\/head>/i);
  if (at >= 0) return html.slice(0, at) + tag + html.slice(at);
  const end = html.search(/<\/body>/i);
  return end >= 0 ? html.slice(0, end) + tag + html.slice(end) : html + tag;
}

// ── 3) 펜 모드 두 손가락 스크롤 ─────────────────────────────────────────────
// 자료의 펜 코드는 두 손가락이면 포인터 이벤트로 window.scrollBy 를 부르는데,
//  - 자료에 걸린 scroll-behavior:smooth 때문에 움직일 때마다 앞 동작이 끊겨 거의 움직이지 않았고
//    (Chromium 시험에서 손가락 이동의 40% 정도, 휴대폰에서는 사실상 안 움직임)
//  - 휴대폰 브라우저에서는 손가락 두 개의 포인터 이벤트가 고르게 오지 않는다.
// → 두 손가락은 터치 이벤트로 직접 처리, 스크롤 동안만 부드러운 스크롤을 끄고, 손을 떼면 살짝 미끄러지게.
export const PEN_SCROLL_SCRIPT_ID = "pentool-scroll";
export const PEN_SCROLL_PATCHES: [string, string][] = [
  ["if(lastY!==null) window.scrollBy(0,lastY-a); lastY=a;", "if(lastY!==null) __pnScroll(lastY-a); lastY=a;"],
  ["if(Object.keys(touches).length<2) lastY=null;", "if(Object.keys(touches).length<2){ if(lastY!==null) __pnFling(); lastY=null; }"],
];
export const PEN_SCROLL_SCRIPT = String.raw`(function(){
/* 펜 모드 두 손가락 스크롤 — 손가락을 그대로 따라가고, 손을 떼면 살짝 미끄러짐.
   모바일(특히 iPhone·iPad)은 터치 이벤트로 처리하고, 터치 이벤트가 없는 기기만 펜 코드(포인터)로 처리 */
var root=document.documentElement, saved=null, raf=0, hist=[], total=0, tY=null, tLast=0;
function instant(){ if(saved===null){ saved=root.style.scrollBehavior; root.style.scrollBehavior="auto"; } }
function restore(){ if(saved!==null){ root.style.scrollBehavior=saved; saved=null; } }
function move(d){
  cancelAnimationFrame(raf); instant();
  var now=performance.now(); total+=d; hist.push([now,total]);
  while(hist.length>2 && now-hist[0][0]>120) hist.shift();
  window.scrollBy(0,d);
}
function fling(){
  var now=performance.now(), a=hist[0], b=hist[hist.length-1]; hist=[]; total=0;
  if(!a||!b||now-b[0]>80||b[0]-a[0]<16){ restore(); return; }
  var v=Math.max(-3,Math.min(3,(b[1]-a[1])/(b[0]-a[0]))), last=now;
  cancelAnimationFrame(raf);
  function step(t){
    var dt=Math.min(32,Math.max(0,t-last)); last=t;
    v*=Math.pow(0.92,dt/16);
    if(Math.abs(v)<0.03){ restore(); return; }
    window.scrollBy(0,v*dt); raf=requestAnimationFrame(step);
  }
  raf=requestAnimationFrame(step);
}
function avgY(ts){ var s=0; for(var i=0;i<ts.length;i++) s+=ts[i].clientY; return s/ts.length; }
function drawing(){ return document.body.classList.contains("pendraw"); }
var opt={capture:true,passive:true};
document.addEventListener("touchstart",function(e){
  cancelAnimationFrame(raf); /* 미끄러지는 중에 다시 닿으면 멈춤 */
  if(e.touches.length>=2 && (tY!==null || drawing())){ instant(); tY=avgY(e.touches); tLast=performance.now(); }
  else if(tY===null) restore();
},opt);
document.addEventListener("touchmove",function(e){
  if(tY===null || e.touches.length<2) return;
  var y=avgY(e.touches); move(tY-y); tY=y; tLast=performance.now();
},opt);
function tEnd(e){
  if(tY===null) return;
  tLast=performance.now();
  if(e.touches.length>=2){ tY=avgY(e.touches); return; }
  tY=null; fling();
}
document.addEventListener("touchend",tEnd,opt);
document.addEventListener("touchcancel",tEnd,opt);
/* 두 손가락으로 움직이는 동안에는 필기 선이 그어지지 않게 */
window.addEventListener("pointermove",function(e){ if(tY!==null && e.pointerType==="touch") e.stopImmediatePropagation(); },true);
/* 펜 코드(포인터 이벤트)가 부르는 함수 — 터치 이벤트로 처리 중이면 건너뜀(두 번 움직이지 않게) */
function byTouch(){ return tY!==null || performance.now()-tLast<500; }
window.__pnScroll=function(d){ if(!byTouch()) move(d); };
window.__pnFling=function(){ if(!byTouch()) fling(); };
})();`;

/** 펜 코드의 두 손가락 스크롤을 고친다 (펜 코드가 알고 있는 모양일 때만, 이미 고쳤으면 그대로) */
export function addPenScrollFix(html: string): string {
  if (html.includes("__pnScroll")) return html;
  if (!PEN_SCROLL_PATCHES.every(([from]) => html.split(from).length === 2)) return html;
  let out = html;
  for (const [from, to] of PEN_SCROLL_PATCHES) out = out.replace(from, () => to);
  const tag = `<script id="${PEN_SCROLL_SCRIPT_ID}">\n${PEN_SCROLL_SCRIPT}\n</script>\n`;
  const at = out.search(/<\/head>/i);
  if (at >= 0) return out.slice(0, at) + tag + out.slice(at);
  const end = out.search(/<\/body>/i);
  return end >= 0 ? out.slice(0, end) + tag + out.slice(end) : out + tag;
}

// ── 4) 문제별 필기 + 마지막 문제에서만 '닫기' ────────────────────────────────
// 문제 이동형 자료(QS·Q·strokes 가 있는 TOEIC·독해형 틀)는 펜 선이 화면 하나에 계속 남아
// 다른 문제로 가면 앞 문제의 필기가 섞이거나 사라진 것처럼 보였다.
// → 문제 번호마다 펜 선을 따로 저장·복원(다시 열어도 유지), 붙여넣기 글상자도 그 문제에서만 보이게(pn:page 알림).
// → 마지막 문제일 때만 플레이어 '닫기'를 보이도록 부모 창에 알림(allmyexam:close).
export const PAGE_SCRIPT_ID = "pentool-pages";
export const PAGE_SCRIPT = String.raw`(function(){
/* pnpage v1 — 문제별 필기 · 마지막 문제에서만 닫기 (AllMyExam) */
function quiz(){ try{ return typeof QS!=="undefined" && Array.isArray(QS) && QS.length>0 && typeof Q==="number" && !!QS[Q]; }catch(e){ return false; } }
function ink(){ try{ return typeof strokes!=="undefined" && Array.isArray(strokes) && typeof draw==="function"; }catch(e){ return false; } }
function pageKey(){ try{ return quiz() ? "q"+(QS[Q].n!=null ? QS[Q].n : Q) : ""; }catch(e){ return ""; } }
window.__pnPage=pageKey;
var KEY="pnink:"+(/^(blob|about|data):$/.test(location.protocol)?"":location.pathname.split("/").pop())+":"+document.title;
var store={}; try{ store=JSON.parse(localStorage.getItem(KEY)||"{}")||{}; }catch(e){ store={}; }
var cur=null, saveT=0, lastClose=null, mem={};
function persist(){ clearTimeout(saveT); saveT=setTimeout(function(){ try{ localStorage.setItem(KEY,JSON.stringify(store)); }catch(e){} },300); }
function r1(v){ return Math.round(v*10)/10; }
function keep(){
  if(cur===null || !ink()) return;
  try{
    if(strokes.length) store[cur]=strokes.map(function(s){ return {c:s.c,w:s.w,m:s.m,pts:s.pts.map(function(p){ return [r1(p[0]),r1(p[1])]; })}; });
    else delete store[cur];
    persist();
  }catch(e){}
}
/* 지금 문제의 펜 선·되돌리기 기록을 기억해 두고(메모리), 다른 문제 것을 꺼냄 */
function stash(){ if(cur===null || !ink()) return; try{ mem[cur]={s:strokes,u:undoS,r:redoS}; }catch(e){} }
function load(k){
  if(!ink()) return;
  try{
    var m=mem[k];
    strokes=m ? m.s : (store[k]||[]).map(function(s){ return {c:s.c,w:s.w,m:s.m,pts:s.pts.slice()}; });
    undoS=m ? m.u : []; redoS=m ? m.r : [];
    curS=null; draw();
    if(typeof pbUI==="function") pbUI();
  }catch(e){}
}
function tellClose(){
  var v=!quiz() || Q===QS.length-1;
  if(v===lastClose) return; lastClose=v;
  try{ if(window.parent && window.parent!==window) window.parent.postMessage({type:"allmyexam:close",visible:v},"*"); }catch(e){}
}
function check(){
  var k=pageKey();
  if(k!==cur){
    if(cur!==null){ keep(); stash(); }
    cur=k; if(quiz()) load(k);
    try{ document.dispatchEvent(new CustomEvent("pn:page",{detail:k})); }catch(e){}
  }
  tellClose();
}
check(); setInterval(check,250);
/* 필기가 바뀔 때마다 저장: 선 긋기·지우기(손 뗄 때), 되돌리기·모두 지우기(툴바) */
document.addEventListener("pointerup",function(){ setTimeout(keep,0); },true);
document.addEventListener("click",function(e){ if(e.target.closest && e.target.closest("#pbar")) setTimeout(keep,0); },true);
document.addEventListener("keydown",function(){ setTimeout(keep,0); },true);
window.addEventListener("pagehide",keep);
})();`;

/** 문제 이동형 자료에 문제별 필기 스크립트를 넣는다 (이미 있으면 그대로) */
export function addPageScript(html: string): string {
  if (html.includes("pnpage v1")) return html;
  // 문제 이동형 틀: 문제 목록(QS)·현재 문제(Q)·문제 이동(go)·펜 선(strokes)이 모두 있어야 함
  if (![/\blet strokes\s*=\s*\[\]/, /\bconst QS\s*=\s*\[/, /\blet Q\s*=/, /\bfunction go\(/].every((re) => re.test(html))) return html;
  const tag = `<script id="${PAGE_SCRIPT_ID}">\n${PAGE_SCRIPT}\n</script>\n`;
  const end = html.toLowerCase().lastIndexOf("</body>");
  return end >= 0 ? html.slice(0, end) + tag + html.slice(end) : html + tag;
}

// ── 2) 붙여넣기 글상자 도구 교체 ──────────────────────────────────────────
/** 붙여넣기 도구 스크립트의 표식 */
const TOOL_MARKER = 'const KEY="pnotes:"';
/**
 * 바꿔 끼울 예전 버전들 — 스크립트 본문 `(function(){ … })();` 의 FNV-1a 해시
 *  v1: 처음 자료에 들어 있던 버전 / v2: 2026-11-27 안내 문서(손잡이·작은 설정 창) 버전
 *  v3: 2026-11-28 안내 문서(긴 글 접기·펼치기) 버전
 */
const OLD_TOOL_HASHES = [0x1350815c, 0xede57128, 0xfe242bb1];

export function fnv1a(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** 예전 붙여넣기 도구가 들어 있으면 새 버전으로 바꾼 HTML, 아니면 그대로 */
export function upgradePasteNoteTool(html: string): string {
  const marker = html.indexOf(TOOL_MARKER);
  if (marker < 0) return html;
  const start = html.lastIndexOf("(function(){", marker);
  const endTag = html.indexOf("})();", marker);
  if (start < 0 || endTag < 0) return html;
  const end = endTag + "})();".length;
  if (!OLD_TOOL_HASHES.includes(fnv1a(html.slice(start, end).replace(/\r\n/g, "\n")))) return html;
  return html.slice(0, start) + PASTE_NOTE_TOOL + html.slice(end);
}

// ─────────────────────────────────────────────────────────────────────────
// 새 도구 (HTML 안의 <script> 에 그대로 들어가는 코드 — 백틱·${ 를 쓰지 말 것)
//  - 글상자를 누르면 손잡이 2개: 오른쪽 아래 ⤡ = 크기, 오른쪽 가운데 ↔ = 줄 길이(폭)
//  - 설정 창은 작게, 글상자와 겹치지 않는 자리(아래 → 위 → 오른쪽 → 왼쪽 → 화면 구석)에
//  - 옮기거나 크기를 바꾸는 동안에는 설정 창을 잠시 숨김, 글상자를 한 번 더 누르면 창 닫힘
//  - 붙여 넣은 글의 앞뒤 빈 줄·공백 정리
//  - 사이트(blob 주소)에서도 다시 열면 붙여 넣은 글이 남아 있도록 제목 기준으로 저장
//  - 긴 글(3줄 이상 또는 60자 넘음)은 접혀서 첫 줄만: ▸ 누르면 펼침, ▾ 누르면 다시 접힘
//  - 문제 이동형 자료에서는 글상자를 만든 문제에서만 보임 (문제별 필기 스크립트의 pn:page 알림)
export const PASTE_NOTE_TOOL = String.raw`(function(){
"use strict";
/* pnote v4 — 붙여넣기 글상자 (AllMyExam START 플레이어가 예전 버전을 이 코드로 바꿔 실행) */
const bar=document.getElementById("pbar"), main=document.querySelector("main");
if(!bar||!main) return;
const FONTS=[["'Nanum Pen Script',cursive","펜글씨",1.25],["'Gaegu',cursive","개구",1],["'Gamja Flower',cursive","감자꽃",1],["'Hi Melody',cursive","멜로디",1.1],["'Nanum Brush Script',cursive","붓글씨",1.25],["'Caveat','Nanum Pen Script',cursive","Caveat",1.15]];
const SIZES=[[12,"가장 작게"],[15,"아주 작게"],[18,"작게"],[24,"보통"],[32,"크게"],[44,"아주 크게"]];
const WEIGHTS=[[1,"보통"],[2,"굵게"],[3,"아주 굵게"]];
const COLS=[["#111111","검정"],["#1565C0","파랑"],["#D32F2F","빨강"],["#2E7D32","초록"],["#F9A825","노랑"]];
const MIN_S=10, MAX_S=120, MIN_W=40;
/* 이만큼 길면 접어서 첫 줄만 보여 줌 */
const FOLD_LINES=3, FOLD_CHARS=60;
/* 사이트 미리보기(blob 주소)는 열 때마다 주소가 바뀌므로 제목으로만 저장 */
const KEY="pnotes:"+(/^(blob|about|data):$/.test(location.protocol)?"":location.pathname.split("/").pop())+":"+document.title;
let style={f:0,s:24,w:1,c:"#D32F2F"}, notes=[], selId=null, editId=null, popOpen=false, last=null;
/* 문제가 여러 개인 자료: 글상자는 만든 문제에서만 보임 (예전 글상자처럼 pg 가 없으면 모든 문제에서 보임) */
let pg=window.__pnPage?String(window.__pnPage()||""):"";
const onPage=n=>!("pg" in n)||n.pg===pg;
const here=()=>notes.filter(onPage);

/* ---- 추가 스타일 (기존 pnote-css 뒤에 덮어씀) ---- */
const css=document.createElement("style"); css.id="pnote-css2";
css.textContent=[
".pnote{box-sizing:border-box}",
".pnote .pnfold{display:inline-block;margin-left:6px;padding:0 7px;border-radius:9px;background:rgb(26 115 232/.1);color:#1a73e8;font:600 12px/19px system-ui,-apple-system,'Malgun Gothic',sans-serif;-webkit-text-stroke:0;vertical-align:middle;white-space:nowrap;cursor:pointer}",
".pnote.fold{display:flex;align-items:center;white-space:nowrap;background:rgb(255 255 255/.85);box-shadow:0 0 0 1px rgb(0 0 0/.08)}",
".pnote.fold .pnt{overflow:hidden;text-overflow:ellipsis;min-width:0}",
".pnote.fold .pnfold{flex:none}",
".pnote.edit .pnfold{display:none}",
".pnframe{position:absolute;z-index:7;pointer-events:none}",
".pnframe[hidden]{display:none}",
".pnh{position:absolute;pointer-events:auto;touch-action:none;box-sizing:border-box;background:#fff;border:2px solid #1a73e8;box-shadow:0 1px 4px rgb(0 0 0/.3)}",
".pnh::after{content:'';position:absolute;inset:-9px}",
".pnh-w{right:-14px;top:50%;width:11px;height:28px;margin-top:-14px;border-radius:6px;cursor:ew-resize}",
".pnh-s{right:-16px;bottom:-16px;width:20px;height:20px;border-radius:50%;cursor:nwse-resize}",
".pnh-s::before{content:'';position:absolute;right:4px;bottom:4px;width:6px;height:6px;border-right:2px solid #1a73e8;border-bottom:2px solid #1a73e8}",
"body.pendraw .pnframe{display:none}",
".ppop.npop{width:264px;padding:10px 12px;gap:5px;border-radius:14px}",
".ppop.npop .pph{display:flex;justify-content:space-between;font-size:.72rem;font-weight:600;color:#aeb3bd}",
".ppop.npop .ppr{gap:3px}",
".ppop.npop .ppb{width:38px;height:30px;border-radius:8px}",
".ppop.npop .nfont{flex:1 1 30%;width:auto;min-width:0;padding:0 2px;height:32px;font-size:17px;color:#e9ebef}",
".ppop.npop .nsz{width:36px}",
".ppop.npop .nw,.ppop.npop .ncol{width:25px}",
".ppop.npop .nw b{font-size:15px;color:#e9ebef}",
".ppop.npop .ppb .sw{width:17px;height:17px}",
".ppop.npop .nsep{width:1px;align-self:stretch;margin:4px 3px;background:rgb(255 255 255/.16)}",
".ppop.npop .nrow2{display:flex;gap:5px;margin-top:3px}",
".ppop.npop .nrow2 .ppbtn{flex:1;padding:6px 4px;font-size:.78rem}",
".ppop.npop .pphint{font-size:.7rem;line-height:1.4}",
".ppop.npop .nlinks{display:flex;justify-content:center;gap:14px}",
".ppop.npop .nclear{background:none;padding:2px;font-size:.72rem;font-weight:500;color:#aeb3bd;text-decoration:underline}",
"@media print{.pnframe{display:none!important}}"
].join("\n");
document.body.append(css);

/* ---- 저장/불러오기 ---- */
function save(){ try{ localStorage.setItem(KEY,JSON.stringify({style,notes})); }catch(e){} }
try{ const d=JSON.parse(localStorage.getItem(KEY)||"null"); if(d){ notes=d.notes||[]; Object.assign(style,d.style||{}); } }catch(e){}

/* ---- 좌표: 본문(main) 왼쪽 기준이라 창 크기가 바뀌어도 따라감 ---- */
const mLeft=()=>main.getBoundingClientRect().left+window.scrollX;
const mRight=()=>main.getBoundingClientRect().right+window.scrollX;
const pageRight=()=>Math.max(document.documentElement.scrollWidth,window.innerWidth+window.scrollX)-6;
const elOf=id=>document.querySelector('.pnote[data-id="'+id+'"]');
const noteOf=id=>notes.find(n=>n.id===id);
const clamp=(v,a,b)=>Math.min(Math.max(v,a),Math.max(a,b));
/* 붙여 넣은 글 다듬기: 앞뒤 빈 줄·공백 제거, 빈 줄 여러 개는 하나로 */
const tidy=t=>String(t||"").replace(/\r\n?/g,"\n").replace(/[ \t ]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim();

/* ---- 선택한 글상자의 손잡이: 오른쪽 가운데 = 줄 길이, 오른쪽 아래 = 크기 ---- */
const frame=document.createElement("div"); frame.className="pnframe"; frame.hidden=true;
frame.innerHTML='<span class="pnh pnh-w" data-h="w" title="좌우로 끌어서 줄 길이 조절"></span><span class="pnh pnh-s" data-h="s" title="끌어서 크기 조절"></span>';
document.body.append(frame);
function syncFrame(){
  const el=selId&&!editId&&elOf(selId);
  if(!el){ frame.hidden=true; return; }
  const h=el.offsetHeight, fh=Math.max(h,52);
  frame.hidden=false;
  frame.style.left=(parseFloat(el.style.left)||0)+"px";
  frame.style.top=((parseFloat(el.style.top)||0)-(fh-h)/2)+"px";
  frame.style.width=el.offsetWidth+"px"; frame.style.height=fh+"px";
}
const ro=window.ResizeObserver?new ResizeObserver(()=>{ syncFrame(); if(popOpen) place(); }):null;

/* ---- 접기·펼치기: 긴 글은 첫 줄 + ▸ 버튼, 펼치면 끝에 ▾ 접기 ---- */
const foldable=n=>n.t.split("\n").length>=FOLD_LINES || n.t.length>FOLD_CHARS;
const folded=n=>!!n.fold && editId!==n.id && foldable(n);
function render(n,el){
  el=el||elOf(n.id); if(!el||editId===n.id) return;
  el.textContent="";
  const f=folded(n); el.classList.toggle("fold",f);
  const chip=document.createElement("span"); chip.className="pnfold";
  if(f){
    const L=n.t.split("\n"), rest=L.length-1;
    const s=document.createElement("span"); s.className="pnt"; s.textContent=L[0];
    chip.textContent="▸ "+(rest>0?"+"+rest+"줄":"더보기"); chip.title="펼치기";
    el.append(s,chip);
  } else {
    el.append(document.createTextNode(n.t));
    if(foldable(n)){ chip.textContent="▾ 접기"; chip.title="접기"; el.append(chip); }
  }
}
function setFold(n,v){ n.fold=v; render(n); paint(n); save(); refreshPop(); }

function paint(n,el){
  el=el||elOf(n.id); if(!el) return;
  const F=FONTS[n.f]||FONTS[0], left=mLeft()+n.x, px=Math.round(n.s*F[2]);
  el.style.left=left+"px"; el.style.top=n.y+"px";
  el.style.fontFamily=F[0]; el.style.fontSize=px+"px"; el.style.color=n.c;
  el.style.fontWeight=n.w>1?"700":"400";
  el.style.webkitTextStroke=n.w>2?"0.7px "+n.c:"0";
  const maxW=Math.max(160,mRight()-left-4);
  if(n.wd){ el.style.width=n.wd+"px"; el.style.maxWidth="none"; }
  else { el.style.width=""; el.style.maxWidth=(folded(n)?Math.min(maxW,px*16):maxW)+"px"; }
  if(n.id===selId) syncFrame();
}
function build(n){
  const el=document.createElement("div"); el.className="pnote"; el.dataset.id=n.id;
  document.body.append(el); render(n,el); paint(n,el); el.style.display=onPage(n)?"":"none"; return el;
}
function relayout(){ notes.forEach(n=>paint(n)); syncFrame(); if(popOpen) place(); }
notes.forEach(build);
function applyPage(){
  notes.forEach(n=>{ const el=elOf(n.id); if(el) el.style.display=onPage(n)?"":"none"; });
  const s=selId&&noteOf(selId); if(s&&!onPage(s)){ select(null); closePop(); }
}
document.addEventListener("pn:page",e=>{ if(editId) endEdit(); pg=String(e.detail||""); applyPage(); });
window.addEventListener("resize",relayout);
if(window.visualViewport) window.visualViewport.addEventListener("resize",relayout);
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>{ syncFrame(); if(popOpen) place(); });

/* 붙여 넣은 뒤 바로 옮기고 크기를 바꿀 수 있게 그리기·지우개 모드를 끔 (툴바의 '선택') */
function stopDrawing(){
  if(!document.body.classList.contains("pendraw")) return;
  const b=bar.querySelector('[data-tool="none"]'); if(b) b.click();
}
function add(text,px,py,edit){
  text=tidy(text);
  stopDrawing();
  const n={id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),t:text,x:px-mLeft(),y:py,f:style.f,s:style.s,w:style.w,c:style.c,pg:pg};
  if(text) n.fold=foldable(n);
  notes.push(n); build(n); select(n.id);
  if(edit||!text) startEdit(n.id); else save();
  return n;
}
function remove(id){
  const el=elOf(id); if(el) el.remove();
  notes=notes.filter(n=>n.id!==id);
  if(selId===id) selId=null; if(editId===id) editId=null;
  syncFrame(); save();
  if(!selId) closePop(); else refreshPop();
}
function select(id){
  if(editId&&editId!==id) endEdit();
  document.querySelectorAll(".pnote.sel").forEach(e=>e.classList.remove("sel"));
  selId=id; const el=id&&elOf(id); if(el) el.classList.add("sel");
  if(id){ const n=noteOf(id); if(n) style={f:n.f,s:n.s,w:n.w,c:n.c}; }
  if(ro){ ro.disconnect(); if(el) ro.observe(el); }
  syncFrame(); refreshPop();
}
function startEdit(id){
  const el=elOf(id), n=noteOf(id); if(!el||!n) return; editId=id;
  el.classList.remove("fold"); el.textContent=n.t; paint(n,el);
  el.classList.add("edit"); el.contentEditable="true"; el.focus();
  const r=document.createRange(); r.selectNodeContents(el); r.collapse(false); const s=getSelection(); s.removeAllRanges(); s.addRange(r);
  syncFrame();
}
function endEdit(){
  const id=editId; if(!id) return; editId=null;
  const el=elOf(id), n=noteOf(id); if(!el||!n) return;
  el.contentEditable="false"; el.classList.remove("edit");
  n.t=el.innerText.replace(/\n$/,"");
  if(!n.t.trim()){ remove(id); return; }
  if(n.fold===undefined) n.fold=foldable(n);
  render(n,el); paint(n,el); save(); syncFrame();
}

/* ---- 툴바 버튼 (형광펜 다음 칸) ---- */
const btn=document.createElement("button");
btn.className="pt"; btn.type="button"; btn.title="복사한 글 붙여넣기 (PC는 화면에서 Ctrl+V)"; btn.setAttribute("aria-label","복사한 글 붙여넣기");
btn.innerHTML='<svg viewBox="0 0 24 24"><path d="M5 6V4h14v2"/><path d="M12 4v16"/><path d="M9 20h6"/></svg>';
const hlBtn=bar.querySelector('[data-tool="hl"]'); (hlBtn||bar.firstChild).after(btn);
const pop=document.createElement("div"); pop.className="ppop npop"; pop.hidden=true; document.body.append(pop);
btn.addEventListener("click",e=>{ e.stopPropagation(); pasteBtn(); });

/* ---- 설정 창: 글상자(+손잡이)와 겹치지 않는 자리 — 아래 → 위 → 오른쪽 → 왼쪽 → 화면 구석 ---- */
function place(){
  const el=selId&&elOf(selId); if(!el||pop.hidden) return;
  const r=el.getBoundingClientRect(), pw=pop.offsetWidth, ph=pop.offsetHeight, W=innerWidth, H=innerHeight, m=8, g=24;
  const L=r.left-g, T=r.top-g, R=r.right+g, B=r.bottom+g;
  const cands=[[r.left,B],[r.left,T-ph],[R,r.top],[L-pw,r.top],[W-pw-m,H-ph-m],[m,H-ph-m],[W-pw-m,m],[m,m]];
  let best=null, cost=Infinity;
  cands.forEach((c,i)=>{
    const x=clamp(c[0],m,W-pw-m), y=clamp(c[1],m,H-ph-m);
    const ox=Math.max(0,Math.min(x+pw,R)-Math.max(x,L)), oy=Math.max(0,Math.min(y+ph,B)-Math.max(y,T));
    const k=ox*oy*100+i;
    if(k<cost){ cost=k; best=[x,y]; }
  });
  pop.style.left=best[0]+"px"; pop.style.top=best[1]+"px";
}
function openPop(){ popOpen=true; pop.hidden=false; refreshPop(); }
function closePop(){ popOpen=false; pop.hidden=true; }
window.addEventListener("scroll",()=>{ if(popOpen) place(); },{passive:true});
function refreshPop(){
  if(!popOpen) return;
  const cur=selId&&noteOf(selId), long=here().filter(foldable), allFolded=long.length>0&&long.every(x=>x.fold);
  pop.innerHTML=
    '<div class="pph">글씨체</div><div class="ppr">'+FONTS.map((F,i)=>'<button class="ppb nfont '+(style.f===i?"on":"")+'" type="button" data-nf="'+i+'" style="font-family:'+F[0].replace(/"/g,"")+'" title="'+F[1]+'">'+(i===5?"Abc":"가나다")+'</button>').join("")+'</div>'+
    '<div class="pph"><span>크기</span><span>'+style.s+'</span></div><div class="ppr">'+SIZES.map(([s,nm])=>'<button class="ppb nsz '+(style.s===s?"on":"")+'" type="button" data-ns="'+s+'" title="'+nm+'" aria-label="'+nm+'"><b style="font-size:'+(9+s/3)+'px;color:#e9ebef">가</b></button>').join("")+'</div>'+
    '<div class="pph">두께 · 색상</div><div class="ppr">'+WEIGHTS.map(([w,nm])=>'<button class="ppb nw '+(style.w===w?"on":"")+'" type="button" data-nw="'+w+'" title="'+nm+'" aria-label="'+nm+'"><b style="font-weight:'+(w>1?700:400)+';-webkit-text-stroke:'+(w>2?".8px #e9ebef":"0")+'">가</b></button>').join("")+'<span class="nsep"></span>'+COLS.map(([c,nm])=>'<button class="ppb ncol '+(style.c===c?"on":"")+'" type="button" data-nc="'+c+'" title="'+nm+'" aria-label="'+nm+'"><span class="sw" style="background:'+c+'"></span></button>').join("")+'</div>'+
    '<div class="nrow2"><button class="ppbtn" type="button" data-na="edit">✏️ 고치기</button>'+(cur&&foldable(cur)?'<button class="ppbtn" type="button" data-na="fold">'+(cur.fold?"▸ 펼치기":"▾ 접기")+'</button>':'')+'<button class="ppbtn" type="button" data-na="del">🗑 삭제</button></div>'+
    '<p class="pphint">⤡ 모서리: 크기 · ↔ 옆: 줄 길이<br>끌어서 옮기기 · 두 번 누르면 글 고치기</p>'+
    '<div class="nlinks">'+(long.length?'<button class="ppbtn nclear" type="button" data-na="foldall">'+(allFolded?"모두 펼치기":"긴 글 모두 접기")+'</button>':'')+'<button class="ppbtn nclear" type="button" data-na="clear">모두 지우기</button></div>';
  place();
}
pop.addEventListener("click",e=>{
  e.stopPropagation();
  const b=e.target.closest("button"); if(!b) return;
  const d=b.dataset, n=selId&&noteOf(selId);
  if(d.nf!==undefined) style.f=+d.nf;
  else if(d.ns){ if(n&&n.wd) n.wd=Math.max(MIN_W,Math.round(n.wd*(+d.ns)/n.s)); style.s=+d.ns; }
  else if(d.nw) style.w=+d.nw;
  else if(d.nc) style.c=d.nc;
  else if(d.na==="edit"){ const id=selId; closePop(); if(id) startEdit(id); return; }
  else if(d.na==="fold"){ if(n) setFold(n,!n.fold); return; }
  else if(d.na==="foldall"){ const long=here().filter(foldable), v=!(long.length&&long.every(x=>x.fold)); long.forEach(x=>{ x.fold=v; render(x); paint(x); }); save(); refreshPop(); return; }
  else if(d.na==="del"){ if(selId) remove(selId); closePop(); return; }
  else if(d.na==="clear"){ const hs=here(); if(hs.length && confirm("이 화면에 붙여 넣은 글을 모두 지울까요?")){ hs.forEach(x=>{ const el=elOf(x.id); if(el) el.remove(); }); notes=notes.filter(x=>!hs.includes(x)); selId=editId=null; syncFrame(); save(); } closePop(); return; }
  else return;
  if(n){ Object.assign(n,{f:style.f,s:style.s,w:style.w,c:style.c}); paint(n); }
  save(); refreshPop();
});
document.addEventListener("pointerdown",e=>{ if(e.target.closest(".npop,.pnote,.pnframe")) return; if(popOpen) closePop(); if(selId&&!editId) select(null); },true);

/* ---- 붙여넣을 위치: 마지막으로 누른 곳, 없으면 화면 가운데 ---- */
function spot(){
  const vx=window.scrollX, vy=window.scrollY, ml=mLeft();
  if(last && last.y>vy+40 && last.y<vy+innerHeight-40) return last;
  return {x:Math.max(ml+20,vx+innerWidth*0.15),y:vy+innerHeight*0.35};
}
async function pasteBtn(){
  closePop(); const p=spot(); let t="";
  try{ t=await navigator.clipboard.readText(); }catch(e){}
  add(t,p.x,p.y,!tidy(t));
}

document.addEventListener("pointerdown",e=>{ if(!e.target.closest("#pbar,.fab,.npop,.pnframe")) last={x:e.pageX,y:e.pageY}; },true);

/* ---- Ctrl+V: 어디서든 복사한 글을 글상자로 ----
   (Safari·미리보기 창 등은 입력칸이 아니면 붙여넣기 신호를 안 보내므로, 숨은 입력칸으로 받는다) */
const catcher=document.createElement("textarea");
catcher.setAttribute("aria-hidden","true"); catcher.tabIndex=-1;
catcher.style.cssText="position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none;border:0;padding:0;resize:none;z-index:-1";
document.body.append(catcher);
let catchT=0;
function fromCatcher(t){
  clearTimeout(catchT); catcher.value=""; catcher.blur();
  if(tidy(t)){ const p=spot(); add(t,p.x,p.y,false); }
}
document.addEventListener("keydown",e=>{
  if(!(e.ctrlKey||e.metaKey) || e.altKey || e.key.toLowerCase()!=="v") return;
  const a=document.activeElement;
  if(editId || (a&&a!==catcher&&a.closest&&a.closest("input,textarea,select,[contenteditable='true']"))) return;
  catcher.value=""; catcher.focus({preventScroll:true});
  /* 붙여넣기 신호가 안 와도 입력칸에 들어온 글로 처리 */
  catchT=setTimeout(()=>{ if(catcher.value) fromCatcher(catcher.value); else catcher.blur(); },400);
},true);
catcher.addEventListener("input",()=>{ clearTimeout(catchT); catchT=setTimeout(()=>{ if(catcher.value) fromCatcher(catcher.value); },30); });
document.addEventListener("paste",e=>{
  const t=(e.clipboardData||window.clipboardData).getData("text");
  if(e.target===catcher){ e.preventDefault(); fromCatcher(t); return; }
  const ed=e.target.closest&&e.target.closest(".pnote.edit");
  if(ed){ e.preventDefault(); document.execCommand("insertText",false,tidy(t)); return; }
  if(e.target.closest&&e.target.closest("input,textarea,[contenteditable='true']")) return;
  if(!tidy(t)) return;
  e.preventDefault(); const p=spot(); add(t,p.x,p.y,false);
});

/* ---- 끌어서 옮기기 · 손잡이로 크기/줄 길이 · 누르면 선택(한 번 더 누르면 창 닫기) · 두 번 누르면 고치기 ---- */
let drag=null, lastTap={id:null,t:0};
document.addEventListener("pointerdown",e=>{
  const h=e.target.closest&&e.target.closest(".pnh");
  if(h){
    const n=selId&&noteOf(selId), el=n&&elOf(n.id); if(!n||!el) return;
    e.preventDefault(); e.stopPropagation();
    drag={kind:h.dataset.h,n,el,sx:e.pageX,sy:e.pageY,w0:el.offsetWidth,h0:el.offsetHeight,s0:n.s,wd0:n.wd||el.offsetWidth,hadWd:!!n.wd,moved:false,id:e.pointerId};
    try{ h.setPointerCapture(e.pointerId); }catch(_){}
    return;
  }
  const el=e.target.closest(".pnote"); if(!el||el.classList.contains("edit")) return;
  e.preventDefault(); e.stopPropagation();
  const n=noteOf(el.dataset.id); drag={kind:"m",n,el,sx:e.pageX,sy:e.pageY,x0:n.x,y0:n.y,moved:false,id:e.pointerId,chip:!!e.target.closest(".pnfold")};
  try{ el.setPointerCapture(e.pointerId); }catch(_){}
},true);
document.addEventListener("pointermove",e=>{
  if(!drag||e.pointerId!==drag.id) return;
  const dx=e.pageX-drag.sx, dy=e.pageY-drag.sy;
  if(!drag.moved){
    if(Math.hypot(dx,dy)<(drag.kind==="m"?5:2)) return;
    drag.moved=true; drag.el.classList.add("drag"); pop.style.visibility="hidden";
  }
  const n=drag.n;
  if(drag.kind==="m"){ n.x=drag.x0+dx; n.y=drag.y0+dy; }
  else if(drag.kind==="w"){ n.wd=Math.round(clamp(drag.w0+dx,MIN_W,pageRight()-(mLeft()+n.x))); }
  else {
    /* 오른쪽 아래로 끌면 커지고, 왼쪽 위로 끌면 작아짐 */
    const k=1+(dx*drag.w0+dy*drag.h0)/(drag.w0*drag.w0+drag.h0*drag.h0);
    n.s=Math.round(clamp(drag.s0*k,MIN_S,MAX_S)); style.s=n.s;
    if(drag.hadWd) n.wd=Math.max(MIN_W,Math.round(drag.wd0*n.s/drag.s0));
  }
  paint(n,drag.el);
  e.preventDefault();
},{passive:false});
function dragEnd(e){
  if(!drag||e.pointerId!==drag.id) return;
  const {n,el,moved,kind,chip}=drag; drag=null; el.classList.remove("drag"); pop.style.visibility="";
  if(kind!=="m"){ if(moved) save(); syncFrame(); refreshPop(); return; }
  if(moved){ select(n.id); save(); return; }
  if(chip){ lastTap={id:null,t:0}; setFold(n,!folded(n)); return; }
  const now=Date.now(), dbl=lastTap.id===n.id && now-lastTap.t<400;
  lastTap={id:n.id,t:now};
  if(dbl){ closePop(); startEdit(n.id); }
  else if(selId===n.id && popOpen) closePop();
  else { select(n.id); openPop(); }
}
document.addEventListener("pointerup",dragEnd); document.addEventListener("pointercancel",dragEnd);
document.addEventListener("click",e=>{ if(e.target.closest(".pnote,.pnframe")) e.stopPropagation(); },true);

document.addEventListener("focusout",e=>{ if(e.target.classList&&e.target.classList.contains("pnote")) setTimeout(()=>{ if(editId===e.target.dataset.id && document.activeElement!==e.target) endEdit(); },0); });
document.addEventListener("keydown",e=>{
  if(editId){ if(e.key==="Escape"){ e.preventDefault(); endEdit(); } e.stopPropagation(); return; }
  if(selId && (e.key==="Delete"||e.key==="Backspace") && !e.target.closest("input,textarea")){ e.preventDefault(); remove(selId); }
  else if(e.key==="Escape" && selId){ select(null); closePop(); }
},true);

/* PDF 저장 직전: 선택·편집 표시 지우기 */
const sv=document.getElementById("savepdf");
if(sv) sv.addEventListener("click",()=>{ endEdit(); select(null); closePop(); },true);
})();`;
