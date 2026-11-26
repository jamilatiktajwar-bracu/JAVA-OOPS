(()=>{"use strict";
const backdrop=document.getElementById("playerBackdrop"),panel=backdrop?.querySelector(".player-panel"),video=document.getElementById("previewVideo"),seek=document.getElementById("playerSeek"),timeline=seek?.closest(".player-timeline"),close=document.getElementById("playerClose");
if(!backdrop||!panel||!video||!seek||!timeline||!close)return;
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmt=s=>{s=Math.max(0,Math.floor(Number(s)||0));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;return h?h+":"+String(m).padStart(2,"0")+":"+String(sec).padStart(2,"0"):m+":"+String(sec).padStart(2,"0")};
let tip=timeline.querySelector(".player-seek-preview");if(!tip){tip=document.createElement("output");tip.className="player-seek-preview";tip.setAttribute("aria-hidden","true");timeline.append(tip)}
function seekWindow(){const duration=Number(video.duration);if(Number.isFinite(duration)&&duration>0)return {start:0,end:duration,live:false};const ranges=video.seekable;if(ranges&&ranges.length){try{const i=ranges.length-1,start=ranges.start(i),end=ranges.end(i);if(Number.isFinite(start)&&Number.isFinite(end)&&end>start)return {start,end,live:true}}catch{}}return null}
function updatePreviewAt(ratio){const range=seekWindow();if(!range)return;ratio=Math.max(0,Math.min(1,ratio));const time=range.start+ratio*(range.end-range.start);tip.textContent=fmt(time)+(range.live?" · LIVE":"");tip.style.left="var(--seek-preview-offset)";tip.style.setProperty("--seek-preview-offset",Math.max(18,Math.min(timeline.clientWidth-18,ratio*timeline.clientWidth))+"px");timeline.classList.add("is-previewing");seek.setAttribute("aria-valuetext",fmt(time)+" of "+(range.live?"live window":fmt(range.end)));}
function updatePreview(event){const rect=seek.getBoundingClientRect(),x=Math.max(0,Math.min(rect.width,event.clientX-rect.left));updatePreviewAt(x/Math.max(1,rect.width))}
timeline.addEventListener("pointermove",e=>{if(e.pointerType==="mouse"||e.pointerType==="pen")updatePreview(e)});
seek.addEventListener("pointermove",e=>{if(e.pointerType==="mouse"||e.pointerType==="pen")updatePreview(e)});
seek.addEventListener("pointerdown",e=>{updatePreview(e);timeline.classList.add("is-previewing")});
seek.addEventListener("pointerup",()=>timeline.classList.remove("is-previewing"));
seek.addEventListener("pointercancel",()=>timeline.classList.remove("is-previewing"));
timeline.addEventListener("pointerleave",e=>{if(!seek.matches(":focus"))timeline.classList.remove("is-previewing")});
seek.addEventListener("focus",()=>{if(seekWindow())updatePreviewAt(Number(seek.value)/1000)});
seek.addEventListener("blur",()=>timeline.classList.remove("is-previewing"));
seek.addEventListener("input",()=>{if(seekWindow())updatePreviewAt(Number(seek.value)/1000)});
seek.addEventListener("change",()=>{if(seekWindow())updatePreviewAt(Number(seek.value)/1000)});
function fullscreenState(){const active=document.fullscreenElement===backdrop||document.fullscreenElement===panel;backdrop.classList.toggle("player-fullscreen-active",active);const b=document.getElementById("playerFullscreen");if(b){b.setAttribute("aria-pressed",String(active));b.textContent=active?"Exit fullscreen":"Fullscreen"}}
document.addEventListener("fullscreenchange",fullscreenState);document.addEventListener("webkitfullscreenchange",fullscreenState);fullscreenState();
let start=null;
panel.addEventListener("pointerdown",e=>{if(!["touch","pen"].includes(e.pointerType)||backdrop.hidden||e.target.closest("button,select,input,video,.player-stage,.player-tools,.player-settings-row,.player-up-next"))return;const top=e.target.closest("#playerTitle,.section-kicker,.modal-close");if(!top&&e.clientY>panel.getBoundingClientRect().top+100)return;start={id:e.pointerId,x:e.clientX,y:e.clientY};},{passive:true});
panel.addEventListener("pointerup",e=>{if(!start||e.pointerId!==start.id)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(dy>90&&dy>Math.abs(dx)*1.35){close.click();}});
panel.addEventListener("pointercancel",()=>start=null);
backdrop.addEventListener("transitionend",e=>{if(e.target===backdrop&&backdrop.hidden){start=null;timeline.classList.remove("is-previewing");tip.textContent=""}});
video.addEventListener("emptied",()=>{timeline.classList.remove("is-previewing");tip.textContent=""});

// User-defined intro/credits skip points, stored per media URL.
const introButton=document.getElementById("skipIntro"),introMark=document.getElementById("markIntroEnd"),creditsButton=document.getElementById("skipCredits"),creditsMark=document.getElementById("markCreditsStart");
if(introButton&&introMark&&creditsButton&&creditsMark){const key=()=>"storyspace.playerSegments.v1."+encodeURIComponent(video.currentSrc||video.src||"unknown-media");const read=()=>{try{return JSON.parse(localStorage.getItem(key())||"{}")}catch{return {}}};const save=(name,value)=>{const data=read();data[name]=value;try{localStorage.setItem(key(),JSON.stringify(data))}catch{}};const refresh=()=>{const d=read(),intro=Number(d.introEnd),credits=Number(d.creditsStart),dur=video.duration;introButton.hidden=!(Number.isFinite(intro)&&intro>0&&video.currentTime<intro-1);creditsButton.hidden=!(Number.isFinite(credits)&&credits>=0&&Number.isFinite(dur)&&dur>0&&video.currentTime>=credits&&dur-video.currentTime>2);introMark.disabled=!(video.currentTime>0&&Number.isFinite(dur));creditsMark.disabled=!(video.currentTime>0&&Number.isFinite(dur));};introMark.addEventListener("click",()=>{if(!Number.isFinite(video.duration)||video.currentTime<=0)return;save("introEnd",video.currentTime);refresh();});introButton.addEventListener("click",()=>{const t=Number(read().introEnd);if(Number.isFinite(t)&&t>0){video.currentTime=Math.min(t,video.duration||t);refresh()}});creditsMark.addEventListener("click",()=>{if(!Number.isFinite(video.duration)||video.currentTime<=0)return;save("creditsStart",video.currentTime);refresh()});creditsButton.addEventListener("click",()=>{if(Number.isFinite(video.duration)&&video.duration>0){video.currentTime=Math.max(0,video.duration-1);refresh()}});video.addEventListener("timeupdate",refresh);video.addEventListener("loadedmetadata",refresh);video.addEventListener("emptied",refresh);refresh();}
window.StoryspacePlayerUX=Object.freeze({formatTime:fmt,clearPreview:()=>timeline.classList.remove("is-previewing")});
})();
// Modal keyboard accessibility: keep Tab navigation inside the player and restore focus on close.
let playerReturnFocus=null;
const focusable=()=>Array.from(panel.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(el=>!el.hidden&&el.getAttribute('aria-hidden')!=='true'&&el.getClientRects().length);
const playerObserver=new MutationObserver(()=>{if(!backdrop.hidden&&!playerReturnFocus){playerReturnFocus=document.activeElement;const first=focusable()[0];if(first)first.focus({preventScroll:true});}});
playerObserver.observe(backdrop,{attributes:true,attributeFilter:['hidden']});
panel.addEventListener('focusin',e=>{if(backdrop.hidden||panel.contains(e.target))return;const first=focusable()[0];if(first)first.focus({preventScroll:true});else{panel.setAttribute('tabindex','-1');panel.focus({preventScroll:true});}});
panel.addEventListener('keydown',e=>{if(e.key!=='Escape'||backdrop.hidden||document.fullscreenElement===backdrop||document.fullscreenElement===panel)return;e.preventDefault();e.stopPropagation();close.click();});
const focusRestoreObserver=new MutationObserver(()=>{if(backdrop.hidden&&playerReturnFocus){const target=playerReturnFocus;playerReturnFocus=null;if(target&&target.isConnected&&typeof target.focus==='function')target.focus({preventScroll:true});}});
focusRestoreObserver.observe(backdrop,{attributes:true,attributeFilter:['hidden']});
panel.addEventListener('keydown',e=>{if(backdrop.hidden||e.key!=='Tab')return;const items=focusable();if(!items.length){e.preventDefault();panel.setAttribute('tabindex','-1');panel.focus();return;}const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
backdrop.addEventListener('transitionend',e=>{if(e.target!==backdrop||!backdrop.hidden||!playerReturnFocus)return;const target=playerReturnFocus;playerReturnFocus=null;if(target&&target.isConnected&&typeof target.focus==='function')target.focus({preventScroll:true});});
