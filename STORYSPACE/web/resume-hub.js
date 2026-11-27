(() => {
  "use strict";
  const $=id=>document.getElementById(id),hub=$("resumeHub"),list=$("resumeHubList"),close=$("resumeHubClose");
  if(!hub||!list||!close)return;
  const read=()=>{try{const value=JSON.parse(localStorage.getItem("storyspace.resumePoints")||"{}");return value&&typeof value==="object"&&!Array.isArray(value)?value:{}}catch{return{}}};
  function formatTime(value){const t=Math.max(0,Math.floor(Number(value)||0)),h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return h?h+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0"):m+":"+String(s).padStart(2,"0")}
  function render(){const focused=list.contains(document.activeElement)?document.activeElement.dataset.resumeAction+"|"+document.activeElement.dataset.resumeId:null;list.replaceChildren();const points=read(),catalog=typeof movies!=="undefined"?movies:[];const entries=Object.entries(points).map(([id,p])=>({id,p,movie:catalog.find(m=>String(m.apiId||m.id)===String(id))})).filter(x=>x.movie&&Number(x.p.currentTime)>5&&Number(x.p.duration)>0&&Number(x.p.currentTime)<Number(x.p.duration)-3).sort((a,b)=>(Number(b.p.updatedAt||b.p.lastPlayedAt)||0)-(Number(a.p.updatedAt||a.p.lastPlayedAt)||0));
    if(!entries.length){const empty=document.createElement("p");empty.className="resume-hub-empty";empty.textContent="Nothing in progress yet. Start a story and your progress will appear here.";list.append(empty);if(focused)close.focus({preventScroll:true});return}
    entries.forEach(({movie,p})=>{const card=document.createElement("article");card.className="resume-hub-card";const poster=document.createElement("img");poster.className="resume-hub-poster";poster.alt=(movie.title||movie.name||"Title")+" poster";poster.loading="lazy";poster.decoding="async";poster.src=movie.poster||"";poster.onerror=()=>poster.remove();const content=document.createElement("div");content.className="resume-hub-content";const title=document.createElement("strong");title.textContent=movie.title||movie.name||"Untitled";const pct=Math.max(1,Math.min(99,Math.round(Number(p.currentTime)/Number(p.duration)*100)));const meta=document.createElement("span");meta.textContent="Resume at "+formatTime(p.currentTime)+" · "+pct+"%";const progress=document.createElement("div");progress.className="resume-hub-progress";progress.setAttribute("role","progressbar");progress.setAttribute("aria-valuemin","0");progress.setAttribute("aria-valuemax","100");progress.setAttribute("aria-valuenow",String(pct));const bar=document.createElement("i");bar.style.width=pct+"%";progress.append(bar);const actions=document.createElement("div");actions.className="resume-hub-actions";const resume=document.createElement("button");resume.type="button";resume.dataset.resumeAction="resume";resume.dataset.resumeId=String(movie.apiId||movie.id);resume.textContent="▶ Resume";resume.onclick=()=>{closeHub();if(typeof playMovie==="function")playMovie(movie)};const remove=document.createElement("button");remove.type="button";remove.dataset.resumeAction="clear";remove.dataset.resumeId=String(movie.apiId||movie.id);remove.textContent="Clear progress";remove.onclick=()=>{const store=read();delete store[String(movie.apiId||movie.id)];try{localStorage.setItem("storyspace.resumePoints",JSON.stringify(store))}catch{}movie.progress=0;delete movie.resumePoint;if(typeof activeLocalProfile!=="undefined"&&activeLocalProfile?.resumePoints){delete activeLocalProfile.resumePoints[String(movie.apiId||movie.id)];if(typeof persistLocalProfiles==="function")persistLocalProfiles()}if(typeof refreshContinueRow==="function")refreshContinueRow();if(typeof renderHome==="function")renderHome();render()};actions.append(resume,remove);content.append(title,meta,progress,actions);card.append(poster,content);list.append(card)});if(focused){const [action,id]=focused;list.querySelector(`[data-resume-action="${action}"][data-resume-id="${CSS.escape(id)}"]`)?.focus({preventScroll:true})}
  }
  let returnFocus=null;
  function open(trigger){
    returnFocus=trigger instanceof HTMLElement?trigger:document.activeElement;
    hub.hidden=false;render();hub.scrollIntoView({behavior:"smooth",block:"start"});
    close.focus({preventScroll:true});
  }
  function closeHub(){
    if(hub.hidden)return;
    hub.hidden=true;
    if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
    returnFocus=null;
  }
  close.onclick=closeHub;
  document.addEventListener("click",event=>{const trigger=event.target.closest('[data-view="continue"]');if(trigger)open(trigger)});
  document.addEventListener("keydown",event=>{
    if(hub.hidden)return;
    if(event.key==="Escape"){event.preventDefault();closeHub();return}
    if(event.key!=="Tab")return;
    const focusable=Array.from(hub.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(el=>!el.hidden);
    if(!focusable.length){event.preventDefault();close.focus();return}
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  });
  window.addEventListener("storage",event=>{if(event.key==="storyspace.resumePoints"||event.key===null)render()});\n  window.addEventListener("focus",()=>{if(hub.hidden)render()});\n  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&hub.hidden)render()});\n  window.storyspaceResumeHub={open,close:closeHub,refresh:render};
  render();
})();