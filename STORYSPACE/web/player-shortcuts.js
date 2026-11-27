(() => {
  "use strict";
  const video=document.getElementById("previewVideo");
  const backdrop=document.getElementById("playerBackdrop");
  const helpButton=document.getElementById("playerShortcutHelp");
  const guide=document.getElementById("playerShortcutGuide");
  const fullscreenButton=document.getElementById("playerFullscreen");
  const closeButton=document.getElementById("playerClose");
  const theaterButton=document.getElementById("playerTheater");
  const feedback=document.getElementById("playerGestureFeedback");
  let feedbackTimer=0;
  const formatSeekTime=value=>{if(!Number.isFinite(value)||value<0)return "Live";const sec=Math.floor(value),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h?h+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0"):m+":"+String(s).padStart(2,"0")};
  const announceSeek=message=>{if(!feedback)return;feedback.setAttribute("aria-live","polite");feedback.textContent=message;feedback.classList.add("is-visible");clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>feedback.classList.remove("is-visible"),1200)};
  if(!video||!backdrop||!helpButton||!guide||!fullscreenButton||!closeButton)return;
  const visible=()=>!backdrop.hidden;
  const isEditable=target=>{
    if(!target)return false;
    if(target.isContentEditable)return true;
    const name=target.tagName?.toLowerCase();
    return ["input","textarea","select","button"].includes(name)||
      target.closest?.("[contenteditable='true'],[role='textbox']");
  };
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  // Seek within VOD duration or the latest live/DVR seekable range.
  const seekWindow=()=>{
    const duration=Number(video.duration);
    if(Number.isFinite(duration)&&duration>0)return {start:0,end:duration,live:false};
    const ranges=video.seekable;
    if(ranges&&ranges.length){try{const i=ranges.length-1,start=ranges.start(i),end=ranges.end(i);if(Number.isFinite(start)&&Number.isFinite(end)&&end>start)return {start,end,live:true}}catch{}}
    return null;
  };
  const seekPercent=percent=>{const range=seekWindow();if(!range||!Number.isFinite(percent))return false;const target=clamp(range.start+(range.end-range.start)*clamp(percent,0,100)/100,range.start,range.end);try{video.currentTime=target;return target}catch{return false}};
  const seek=delta=>{
    if(video.readyState<1)return false;
    const range=seekWindow();if(!range)return false;
    const target=clamp(video.currentTime+delta,range.start,range.end);
    try{video.currentTime=target;return target}catch{return false}
  };
  const goLive=()=>{const range=seekWindow();if(!range||!range.live)return false;try{video.currentTime=range.end;video.play().catch(()=>{});announceSeek("Jumped to live");return range.end}catch{return false}};
  function setGuide(open){guide.hidden=!open;helpButton.setAttribute("aria-expanded",String(open));}
  function setTheater(open){const active=!!open;backdrop.classList.toggle("player-theater-mode",active);if(theaterButton){theaterButton.setAttribute("aria-pressed",String(active));theaterButton.textContent=active?"Exit theater mode":"Theater mode";}}
  theaterButton?.addEventListener("click",()=>setTheater(!backdrop.classList.contains("player-theater-mode")));
  helpButton.addEventListener("click",()=>setGuide(guide.hidden));
  document.addEventListener("keydown",event=>{
    if(!visible()||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||isEditable(event.target))return;
    const key=event.key.toLowerCase();let handled=true;
    switch(key){
      case " ":case "k":event.preventDefault();if(video.paused)video.play().catch(()=>{});else video.pause();break;
      case "arrowleft":{const delta=event.shiftKey?-10:-5;const target=seek(delta);if(target!==false)announceSeek("Seek to "+formatSeekTime(target));event.preventDefault();break;}
      case "arrowright":{const delta=event.shiftKey?10:5;const target=seek(delta);if(target!==false)announceSeek("Seek to "+formatSeekTime(target));event.preventDefault();break;}
      case "j":event.preventDefault();{const target=seek(-10);if(target!==false)announceSeek("Seek to "+formatSeekTime(target))};break;case "l":event.preventDefault();{const target=seek(10);if(target!==false)announceSeek("Seek to "+formatSeekTime(target))};break;
      case "arrowup":video.volume=clamp(video.volume+0.05,0,1);video.muted=false;event.preventDefault();break;
      case "arrowdown":video.volume=clamp(video.volume-0.05,0,1);event.preventDefault();break;
      case "m":video.muted=!video.muted;break;
      case "c":{const size=document.getElementById("playerCaptionSize"),sizes=["small","medium","large","extra-large"];if(size){size.value=sizes[(sizes.indexOf(size.value)+1)%sizes.length];size.dispatchEvent(new Event("change"));event.preventDefault()}break;}
      case "f":fullscreenButton.click();break;
      case "t":setTheater(!backdrop.classList.contains("player-theater-mode"));event.preventDefault();break;
      case "r":{const range=seekWindow();if(range){try{video.currentTime=range.start;video.play().catch(()=>{});announceSeek(range.live?"Restarted at DVR window start":"Restarted from beginning");event.preventDefault()}catch{}}break;}
      case "g":{const target=goLive();if(target!==false)event.preventDefault();break;}
      case "0":case "1":case "2":case "3":case "4":case "5":case "6":case "7":case "8":case "9":{const percent=Number(key)*10,target=seekPercent(percent);if(target!==false){announceSeek("Seek to "+percent+"% · "+formatSeekTime(target));event.preventDefault()}break;}
      case "?":setGuide(guide.hidden);break;
      case "escape":closeButton.click();setGuide(false);break;
      default:handled=false;
    }
    if(handled){event.stopPropagation();event.stopImmediatePropagation();}
  });
  backdrop.addEventListener("transitionend",()=>{if(backdrop.hidden){setGuide(false);setTheater(false)}});
  window.StoryspacePlayerShortcuts=Object.freeze({isEditable,seek,seekPercent,seekWindow,goLive,setGuide,setTheater});
})();
