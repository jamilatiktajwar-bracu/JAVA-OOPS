(() => {
  "use strict";
  const video=document.getElementById("previewVideo"),panel=document.getElementById("playerUpNext"),titleNode=document.getElementById("playerUpNextTitle"),meta=document.getElementById("playerUpNextMeta"),countdown=document.getElementById("playerUpNextCountdown"),playButton=document.getElementById("playerUpNextPlay"),dismiss=document.getElementById("playerUpNextDismiss"),auto=document.getElementById("playerAutoNext");
  if(!video||!panel||!titleNode||!meta||!countdown||!playButton||!dismiss||!auto)return;
  const KEY="storyspace.autoNext";let current=null,catalog=[],launch=null,timer=null,remaining=12,nextTitle=null;
  const read=()=>{try{return localStorage.getItem(KEY)==="1"}catch{return false}},save=v=>{try{localStorage.setItem(KEY,v?"1":"0")}catch{}};
  auto.checked=read();
  function clear(){if(timer){clearInterval(timer);timer=null}panel.hidden=true;countdown.textContent="";nextTitle=null}
  function choose(){if(!current)return null;const candidates=catalog.filter(x=>x&&x.id!==current.id&&x.type===current.type);candidates.sort((a,b)=>((b.genre===current.genre?3:0)+(Number(b.score)||0)/10)-((a.genre===current.genre?3:0)+(Number(a.score)||0)/10));return candidates[0]||catalog.find(x=>x&&x.id!==current.id)||null}
  function startNext(){const item=nextTitle;if(!item||typeof launch!=="function")return;clear();launch(item)}
  function show(){nextTitle=choose();if(!nextTitle){clear();return}panel.hidden=false;titleNode.textContent=nextTitle.title||nextTitle.name||"Recommended story";meta.textContent=[nextTitle.year,nextTitle.genre,nextTitle.duration,nextTitle.score?("★ "+nextTitle.score):""].filter(Boolean).join(" · ");remaining=12;countdown.textContent=auto.checked?"Auto-play in 12 seconds":"Auto-play is off · choose Play next to continue";if(auto.checked){timer=setInterval(()=>{remaining--;if(remaining<=0){startNext();return}countdown.textContent="Auto-play in "+remaining+" seconds"},1000)}}
  video.addEventListener("ended",show);
  playButton.addEventListener("click",startNext);dismiss.addEventListener("click",clear);auto.addEventListener("change",()=>{save(auto.checked);if(!panel.hidden){if(timer){clearInterval(timer);timer=null}remaining=12;if(auto.checked){countdown.textContent="Auto-play in 12 seconds";timer=setInterval(()=>{remaining--;if(remaining<=0){startNext();return}countdown.textContent="Auto-play in "+remaining+" seconds"},1000)}else countdown.textContent="Auto-play is off · choose Play next to continue"}});
  window.StoryspacePlayerNext=Object.freeze({setContext(item,items,callback){clear();current=item;catalog=Array.isArray(items)?items:[];launch=callback},reset(){clear();current=null;launch=null},show});
})();
