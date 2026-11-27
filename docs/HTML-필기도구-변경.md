# HTML 자료 필기 도구 변경 안내

펜 툴바와 붙여넣기 글상자(툴바의 **T** 버튼)를 고쳤습니다.
**사이트(START)에서는 이미 자동으로 적용**됩니다. 올려 둔 파일은 그대로 두고, 열 때만 바꿔서 실행합니다.
아래 내용은 **파일 자체를 고칠 때**(새 자료를 만들거나, 사이트 밖에서 파일을 열 때도 같게 하려면) 쓰세요.

## 무엇이 바뀌었나

| 부분 | 바뀐 점 |
|---|---|
| 펜 툴바 | 버튼 36px → 32px, 아이콘 19px → 17px. 전체가 조금 작아짐 |
| 그리기·형광펜·지우개 설정 창 | 폭 272px → 236px. 글자·버튼을 붙여넣기 설정 창과 같은 크기로 맞춤 |
| 붙여넣기 글상자 – 크기 | **가장 작게(12)** 추가 → 가장 작게·아주 작게·작게·보통·크게·아주 크게 6단계 |
| 붙여넣기 글상자 – 손잡이 | 글상자를 누르면 손잡이 2개: 모서리 **⤡** = 크기, 오른쪽 **↔** = 줄 길이(폭) |
| 붙여넣기 글상자 – 설정 창 | 작게 정리했고, 글상자를 가리지 않는 자리(아래 → 위 → 오른쪽 → 왼쪽 → 화면 구석)에 뜸. 끌거나 크기를 바꾸는 동안에는 잠시 숨겨지고, 글상자를 한 번 더 누르면 닫힘 |
| 붙여넣기 후 | 그리기 모드를 자동으로 꺼서 바로 옮기거나 크기를 바꿀 수 있음 |
| 붙여 넣은 글 | 앞뒤 빈 줄·공백 자동 정리 |
| 저장 | 사이트에서 다시 열어도 붙여 넣은 글이 남아 있음(제목 기준으로 저장) |

## 파일 고치는 방법

### 1단계 — 펜 툴바·설정 창 작게 (펜 툴바가 있는 모든 파일)

`</head>` 바로 앞에 아래를 그대로 붙여 넣습니다.

```html
<style id="pentool-compact">
#pbar.pbar2{gap:1px;padding:4px;border-radius:11px}
#pbar.pbar2 .pt{width:32px;height:32px;border-radius:8px}
#pbar.pbar2 .pt svg{width:17px;height:17px}
#pbar.pbar2 .pt.opt::after{right:2px;bottom:2px;border-width:2px}
#pbar.pbar2 .psep{margin:2px 4px}
#pbar.pbar2 .pdot{width:15px;height:15px}
/* 그리기·형광펜·지우개 설정 창 (붙여넣기 글상자 설정 창과 같은 크기) */
.ppop:not(.npop){box-sizing:border-box;width:236px;padding:10px 12px;gap:5px;border-radius:14px;font-size:.78rem}
.ppop:not(.npop) .pph{font-size:.72rem;font-weight:600;color:#aeb3bd}
.ppop:not(.npop) .ppr{gap:3px}
.ppop:not(.npop) .ppb{width:36px;height:30px;border-radius:8px}
.ppop:not(.npop) .ppb svg{width:18px;height:18px}
.ppop:not(.npop) .ppb .sw{width:17px;height:17px}
.ppop:not(.npop) .ppb i{width:20px}
.ppop:not(.npop) .pphint{font-size:.7rem;line-height:1.4}
.ppop:not(.npop) .ppbtn{padding:6px 8px;font-size:.78rem}
</style>
```

### 2단계 — 붙여넣기 글상자 교체 (붙여넣기 버튼이 이미 있는 파일)

1. 파일에서 `const KEY="pnotes:"` 를 검색합니다.
2. 그 줄이 들어 있는 `<script>` 안에서 **`(function(){` 부터 맨 끝 `})();` 까지** 전부 지웁니다.
   (`<script>` 와 `</script>` 태그는 남겨 둡니다.)
3. 그 자리에 아래 코드를 그대로 붙여 넣습니다.

`<style id="pnote-css">` 와 펜 툴바 코드는 **바꾸지 않아도 됩니다.**

```js
(function(){
"use strict";
/* pnote v2 — 붙여넣기 글상자 (AllMyExam START 플레이어가 예전 버전을 이 코드로 바꿔 실행) */
const bar=document.getElementById("pbar"), main=document.querySelector("main");
if(!bar||!main) return;
const FONTS=[["'Nanum Pen Script',cursive","펜글씨",1.25],["'Gaegu',cursive","개구",1],["'Gamja Flower',cursive","감자꽃",1],["'Hi Melody',cursive","멜로디",1.1],["'Nanum Brush Script',cursive","붓글씨",1.25],["'Caveat','Nanum Pen Script',cursive","Caveat",1.15]];
const SIZES=[[12,"가장 작게"],[15,"아주 작게"],[18,"작게"],[24,"보통"],[32,"크게"],[44,"아주 크게"]];
const WEIGHTS=[[1,"보통"],[2,"굵게"],[3,"아주 굵게"]];
const COLS=[["#111111","검정"],["#1565C0","파랑"],["#D32F2F","빨강"],["#2E7D32","초록"],["#F9A825","노랑"]];
const MIN_S=10, MAX_S=120, MIN_W=40;
/* 사이트 미리보기(blob 주소)는 열 때마다 주소가 바뀌므로 제목으로만 저장 */
const KEY="pnotes:"+(/^(blob|about|data):$/.test(location.protocol)?"":location.pathname.split("/").pop())+":"+document.title;
let style={f:0,s:24,w:1,c:"#D32F2F"}, notes=[], selId=null, editId=null, popOpen=false, last=null;

/* ---- 추가 스타일 (기존 pnote-css 뒤에 덮어씀) ---- */
const css=document.createElement("style"); css.id="pnote-css2";
css.textContent=[
".pnote{box-sizing:border-box}",
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

function paint(n,el){
  el=el||elOf(n.id); if(!el) return;
  const F=FONTS[n.f]||FONTS[0], left=mLeft()+n.x;
  el.style.left=left+"px"; el.style.top=n.y+"px";
  el.style.fontFamily=F[0]; el.style.fontSize=Math.round(n.s*F[2])+"px"; el.style.color=n.c;
  el.style.fontWeight=n.w>1?"700":"400";
  el.style.webkitTextStroke=n.w>2?"0.7px "+n.c:"0";
  if(n.wd){ el.style.width=n.wd+"px"; el.style.maxWidth="none"; }
  else { el.style.width=""; el.style.maxWidth=Math.max(160,mRight()-left-4)+"px"; }
  if(n.id===selId) syncFrame();
}
function build(n){
  const el=document.createElement("div"); el.className="pnote"; el.dataset.id=n.id; el.textContent=n.t;
  document.body.append(el); paint(n,el); return el;
}
function relayout(){ notes.forEach(n=>paint(n)); syncFrame(); if(popOpen) place(); }
notes.forEach(build);
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
  const n={id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),t:text,x:px-mLeft(),y:py,f:style.f,s:style.s,w:style.w,c:style.c};
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
  const el=elOf(id); if(!el) return; editId=id;
  el.classList.add("edit"); el.contentEditable="true"; el.focus();
  const r=document.createRange(); r.selectNodeContents(el); r.collapse(false); const s=getSelection(); s.removeAllRanges(); s.addRange(r);
  syncFrame();
}
function endEdit(){
  const id=editId; if(!id) return; editId=null;
  const el=elOf(id), n=noteOf(id); if(!el||!n) return;
  el.contentEditable="false"; el.classList.remove("edit");
  n.t=el.innerText.replace(/\n$/,"");
  if(!n.t.trim()) remove(id); else { save(); syncFrame(); }
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
  pop.innerHTML=
    '<div class="pph">글씨체</div><div class="ppr">'+FONTS.map((F,i)=>'<button class="ppb nfont '+(style.f===i?"on":"")+'" type="button" data-nf="'+i+'" style="font-family:'+F[0].replace(/"/g,"")+'" title="'+F[1]+'">'+(i===5?"Abc":"가나다")+'</button>').join("")+'</div>'+
    '<div class="pph"><span>크기</span><span>'+style.s+'</span></div><div class="ppr">'+SIZES.map(([s,nm])=>'<button class="ppb nsz '+(style.s===s?"on":"")+'" type="button" data-ns="'+s+'" title="'+nm+'" aria-label="'+nm+'"><b style="font-size:'+(9+s/3)+'px;color:#e9ebef">가</b></button>').join("")+'</div>'+
    '<div class="pph">두께 · 색상</div><div class="ppr">'+WEIGHTS.map(([w,nm])=>'<button class="ppb nw '+(style.w===w?"on":"")+'" type="button" data-nw="'+w+'" title="'+nm+'" aria-label="'+nm+'"><b style="font-weight:'+(w>1?700:400)+';-webkit-text-stroke:'+(w>2?".8px #e9ebef":"0")+'">가</b></button>').join("")+'<span class="nsep"></span>'+COLS.map(([c,nm])=>'<button class="ppb ncol '+(style.c===c?"on":"")+'" type="button" data-nc="'+c+'" title="'+nm+'" aria-label="'+nm+'"><span class="sw" style="background:'+c+'"></span></button>').join("")+'</div>'+
    '<div class="nrow2"><button class="ppbtn" type="button" data-na="edit">✏️ 글 고치기</button><button class="ppbtn" type="button" data-na="del">🗑 삭제</button></div>'+
    '<p class="pphint">⤡ 모서리: 크기 · ↔ 옆: 줄 길이<br>끌어서 옮기기 · 두 번 누르면 글 고치기</p>'+
    '<button class="ppbtn nclear" type="button" data-na="clear">붙여 넣은 글 모두 지우기</button>';
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
  else if(d.na==="del"){ if(selId) remove(selId); closePop(); return; }
  else if(d.na==="clear"){ if(notes.length && confirm("붙여 넣은 글을 모두 지울까요?")){ notes.forEach(x=>{ const el=elOf(x.id); if(el) el.remove(); }); notes=[]; selId=editId=null; syncFrame(); save(); } closePop(); return; }
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
  const n=noteOf(el.dataset.id); drag={kind:"m",n,el,sx:e.pageX,sy:e.pageY,x0:n.x,y0:n.y,moved:false,id:e.pointerId};
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
  const {n,el,moved,kind}=drag; drag=null; el.classList.remove("drag"); pop.style.visibility="";
  if(kind!=="m"){ if(moved) save(); syncFrame(); refreshPop(); return; }
  if(moved){ select(n.id); save(); return; }
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
})();
```

### (선택) 붙여넣기 버튼이 없는 파일에 새로 넣기

펜 툴바(`id="pbar"`)와 본문 `<main>` 이 있는 파일이면 됩니다. `</body>` 바로 앞에 아래 두 가지를 순서대로 넣습니다.

1. 기본 스타일

```html
<style id="pnote-css">
.pnote{position:absolute;z-index:6;white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere;line-height:1.25;padding:2px 5px;border-radius:6px;cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;min-width:24px}
.pnote.sel{outline:2px dashed #1a73e8;outline-offset:2px}
.pnote.edit{outline:2px solid #1a73e8;outline-offset:2px;background:rgb(255 255 255/.88);cursor:text;-webkit-user-select:text;user-select:text;touch-action:auto}
.pnote.edit:empty::before{content:"여기에 붙여넣기 (길게 누르기 · Ctrl+V)";color:#9aa0aa;font:14px/1.4 system-ui,sans-serif}
.pnote.drag{cursor:grabbing;opacity:.85}
body.pendraw .pnote{pointer-events:none}
.npop{position:fixed!important;right:auto!important;bottom:auto!important;z-index:40;max-height:calc(100vh - 24px);overflow:auto}
.ppop .nfont{width:auto;min-width:76px;padding:0 8px;height:38px;font-size:19px;color:#e9ebef}
.ppop .nw b{font-size:17px;color:#e9ebef}
.ppop .nrow2{display:flex;gap:6px}
.ppop .nrow2 .ppbtn{flex:1}
@media print{.pnote{display:none!important}}
</style>
```

2. 2단계 코드를 `<script>` 와 `</script>` 사이에 넣어서 붙여 넣기

## 고친 뒤 확인

- [ ] 펜 툴바가 조금 작아졌다
- [ ] 툴바의 **T** 버튼(또는 PC에서 Ctrl+V)으로 붙여 넣으면 글상자가 생기고, 바로 끌어서 옮길 수 있다
- [ ] 글상자를 누르면 손잡이 2개(↔, ⤡)와 설정 창이 뜨고, 설정 창이 글상자를 가리지 않는다
- [ ] 크기에 6단계가 있다(맨 앞이 가장 작게)
- [ ] 닫았다가 다시 열어도 붙여 넣은 글이 남아 있다

## 참고

- 사이트는 파일 안에 `id="pentool-compact"` 가 이미 있으면 1단계를, 붙여넣기 도구가 이미 새 버전(코드 안에 `pnote v2`)이면 2단계를 다시 하지 않습니다. 고친 파일을 올려도 겹치지 않습니다.
- 이 안내의 코드는 사이트 코드 `src/components/utils/htmlPenTools.ts` 와 같습니다.
