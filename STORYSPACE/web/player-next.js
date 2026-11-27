(() => {
  "use strict";
  const video=document.getElementById("previewVideo"),panel=document.getElementById("playerUpNext"),titleNode=document.getElementById("playerUpNextTitle"),posterNode=document.getElementById("playerUpNextPoster"),progressNode=document.getElementById("playerUpNextProgress"),meta=document.getElementById("playerUpNextMeta"),countdown=document.getElementById("playerUpNextCountdown"),playButton=document.getElementById("playerUpNextPlay"),dismiss=document.getElementById("playerUpNextDismiss"),auto=document.getElementById("playerAutoNext");
  if(!video||!panel||!titleNode||!meta||!countdown||!playButton||!dismiss||!auto)return;
  const KEY="storyspace.autoNext";let current=null,catalog=[],launch=null,timer=null,remaining=12,nextTitle=null,queuedNext=false;
  const read=()=>{try{return localStorage.getItem(KEY)==="1"}catch{return false}},save=v=>{try{localStorage.setItem(KEY,v?"1":"0")}catch{}};
  auto.checked=read();
  function stopTimer(){if(timer){clearInterval(timer);timer=null}}
  function clear(){stopTimer();panel.hidden=true;countdown.textContent="";if(progressNode)progressNode.style.width="0%";if(posterNode){posterNode.hidden=true;posterNode.removeAttribute("src")}nextTitle=null;queuedNext=false}
  function queuedItem(){return window.StoryspaceQueue?.getItems?.()[0]||null}
  function choose(){const queued=queuedItem();if(queued&&String(queued.apiId||queued.id)!==String(current?.apiId||current?.id)){queuedNext=true;return queued}queuedNext=false;if(!current)return null;const candidates=catalog.filter(x=>x&&String(x.apiId||x.id)!==String(current.apiId||current.id)&&x.type===current.type);candidates.sort((a,b)=>((b.genre===current.genre?3:0)+(Number(b.score)||0)/10)-((a.genre===current.genre?3:0)+(Number(a.score)||0)/10));return candidates[0]||catalog.find(x=>x&&String(x.apiId||x.id)!==String(current.apiId||current.id))||null}
  function startNext(){const item=nextTitle;if(!item)return;const fromQueue=queuedNext,firstQueued=queuedItem();clear();if(fromQueue&&firstQueued&&String(firstQueued.apiId||firstQueued.id)===String(item.apiId||item.id)&&window.StoryspaceQueue?.playNext){window.StoryspaceQueue.playNext();return}if(typeof launch==="function")launch(item)}
  function tick(){remaining=Math.max(0,remaining-1);if(progressNode)progressNode.style.width=((12-remaining)/12*100)+"%";if(remaining<=0){startNext();return}countdown.textContent="Auto-play in "+remaining+" seconds"}
  function startTimer(){stopTimer();remaining=12;if(progressNode)progressNode.style.width="0%";countdown.textContent="Auto-play in 12 seconds";timer=setInterval(tick,1000)}
  function show(){if(window.StoryspaceQueue?.autoPlay?.())return;nextTitle=choose();if(!nextTitle){clear();return}panel.hidden=false;titleNode.textContent=nextTitle.title||nextTitle.name||"Recommended story";if(posterNode){posterNode.src=nextTitle.poster||"";posterNode.hidden=!nextTitle.poster;posterNode.alt=""}const detail=[nextTitle.year,nextTitle.genre,nextTitle.duration,nextTitle.score?("★ "+nextTitle.score):""].filter(Boolean).join(" · ");meta.textContent=queuedNext?"From Smart Queue · "+detail:detail;remaining=12;if(progressNode)progressNode.style.width="0%";countdown.textContent=auto.checked?"Auto-play in 12 seconds":"Auto-play is off · choose Play next to continue";if(auto.checked)startTimer()}
  video.addEventListener("ended",show);
  playButton.addEventListener("click",startNext);dismiss.addEventListener("click",clear);
  auto.addEventListener("change",()=>{save(auto.checked);if(!panel.hidden){stopTimer();if(auto.checked)startTimer();else countdown.textContent="Auto-play is off · choose Play next to continue"}});
  document.addEventListener("visibilitychange",()=>{if(panel.hidden||!auto.checked)return;if(document.hidden){stopTimer();countdown.textContent="Auto-play paused while tab is hidden"}else if(remaining>0)startTimer()});
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!panel.hidden){clear();event.stopPropagation()}});
  window.StoryspacePlayerNext=Object.freeze({setContext(item,items,callback){clear();current=item;catalog=Array.isArray(items)?items:[];launch=callback},reset(){clear();current=null;launch=null},show});
})();