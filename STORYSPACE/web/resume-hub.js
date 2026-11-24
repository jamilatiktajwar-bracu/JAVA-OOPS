(() => {
"use strict";
const $=id=>document.getElementById(id);
function init(){
 const hub=$("resumeHub"),list=$("resumeHubList"),close=$("resumeHubClose");
 if(!hub||!list||!close)return;
 const read=()=>{try{return JSON.parse(localStorage.getItem("storyspace.resumePoints")||"{}")}catch{return {}}};
 function render(){
  list.replaceChildren();
  const points=read(),catalog=typeof movies!=="undefined"?movies:[];
  const entries=Object.entries(points).map(([id,p])=>({id,p,movie:catalog.find(m=>String(m.apiId||m.id)===String(id))})).filter(x=>x.movie&&Number(x.p.currentTime)>5&&Number(x.p.duration)>0&&Number(x.p.currentTime)<Number(x.p.duration)-3).sort((a,b)=>(Number(b.p.updatedAt)||0)-(Number(a.p.updatedAt)||0));
  if(!entries.length){const empty=document.createElement("p");empty.className="resume-hub-empty";empty.textContent="Nothing in progress yet. Start a story and your progress will appear here.";list.append(empty);return;}
  entries.forEach(({movie,p})=>{
   const item=document.createElement("article");item.className="resume-hub-card";
   const poster=document.createElement("div");poster.className="resume-hub-poster";poster.style.backgroundImage="url("+JSON.stringify(movie.poster||"").slice(1,-1)+")";poster.setAttribute("role","img");poster.setAttribute("aria-label",movie.title+" poster");
   const content=document.createElement("div");content.className="resume-hub-content";
   const title=document.createElement("strong");title.textContent=movie.title||movie.name||"Untitled";
   const meta=document.createElement("span");const pct=Math.max(1,Math.min(99,Math.round(Number(p.currentTime)/Number(p.duration)*100)));meta.textContent="Resume at "+format(p.currentTime)+" · "+pct+"%";
   const progress=document.createElement("div");progress.className="resume-hub-progress";progress.setAttribute("role","progressbar");progress.setAttribute("aria-valuemin","0");progress.setAttribute("aria-valuemax","100");progress.setAttribute("aria-valuenow",String(pct));const bar=document.createElement("i");bar.style.width=pct+"%";progress.append(bar);
   const actions=document.createElement("div");actions.className="resume-hub-actions";
   const resume=document.createElement("button");resume.type="button";resume.textContent="▶ Resume";resume.addEventListener("click",()=>{if(typeof playMovie==="function")playMovie(movie)});
   const remove=document.createElement("button");remove.type="button";remove.textContent="Clear progress";remove.addEventListener("click",()=>{const store=read();delete store[String(movie.apiId||movie.id)];localStorage.setItem("storyspace.resumePoints",JSON.stringify(store));movie.progress=0;delete movie.resumePoint;if(typeof renderHome==="function")renderHome();render();});
   actions.append(resume,remove);content.append(title,meta,progress,actions);item.append(poster,content);list.append(item);
  });
 }
 function format(t){t=Math.max(0,Math.floor(Number(t)||0));const h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return h?h+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0"):m+":"+String(s).padStart(2,"0")}
 function open(){hub.hidden=false;render();hub.scrollIntoView({behavior:"smooth",block:"start"})}
 close.addEventListener("click",()=>hub.hidden=true);
 document.addEventListener("click",e=>{if(e.target.closest('[data-view="continue"]')){e.preventDefault();open()}});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!hub.hidden)hub.hidden=true});
 window.storyspaceResumeHub={open,refresh:render};
 render();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();