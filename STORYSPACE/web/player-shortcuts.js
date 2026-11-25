(() => {
  "use strict";
  const video=document.getElementById("previewVideo");
  const backdrop=document.getElementById("playerBackdrop");
  const helpButton=document.getElementById("playerShortcutHelp");
  const guide=document.getElementById("playerShortcutGuide");
  const fullscreenButton=document.getElementById("playerFullscreen");
  const closeButton=document.getElementById("playerClose");
  const stage=document.getElementById("playerStage");
  const theaterButton=document.getElementById("playerTheater");
  if(!video||!backdrop||!helpButton||!guide||!fullscreenButton||!closeButton||!stage||!theaterButton)return;
  const visible=()=>!backdrop.hidden;
  const theaterKey="storyspace.playerTheater";
  function setTheater(enabled){stage.classList.toggle("player-theater-mode",enabled);theaterButton.setAttribute("aria-pressed",String(enabled));theaterButton.textContent=enabled?"Exit theater":"Theater mode";try{localStorage.setItem(theaterKey,String(enabled))}catch{}}
  theaterButton.addEventListener("click",()=>setTheater(!stage.classList.contains("player-theater-mode")));
  try{setTheater(localStorage.getItem(theaterKey)==="true")}catch{setTheater(false)}
  const isEditable=target=>{
    if(!target)return false;
    if(target.isContentEditable)return true;
    const name=target.tagName?.toLowerCase();
    return ["input","textarea","select","button"].includes(name)||
      target.closest?.("[contenteditable='true'],[role='textbox']");
  };
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const seek=delta=>{
    if(!Number.isFinite(video.duration)||video.duration<=0||video.readyState<1)return;
    video.currentTime=clamp(video.currentTime+delta,0,video.duration);
  };
  function setGuide(open){guide.hidden=!open;helpButton.setAttribute("aria-expanded",String(open));}
  helpButton.addEventListener("click",()=>setGuide(guide.hidden));
  document.addEventListener("keydown",event=>{
    if(!visible()||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||isEditable(event.target))return;
    const key=event.key.toLowerCase();let handled=true;
    switch(key){
      case " ":case "k":event.preventDefault();if(video.paused)video.play().catch(()=>{});else video.pause();break;
      case "arrowleft":seek(event.shiftKey?-10:-5);event.preventDefault();break;
      case "arrowright":seek(event.shiftKey?10:5);event.preventDefault();break;
      case "j":seek(-10);break;case "l":seek(10);break;
      case "arrowup":video.volume=clamp(video.volume+0.05,0,1);video.muted=false;event.preventDefault();break;
      case "arrowdown":video.volume=clamp(video.volume-0.05,0,1);event.preventDefault();break;
      case "m":video.muted=!video.muted;break;
      case "f":fullscreenButton.click();break;
      case "t":setTheater(!stage.classList.contains("player-theater-mode"));break;
      case "r":video.currentTime=0;video.play().catch(()=>{});break;
      case "?":setGuide(guide.hidden);break;
      case "escape":closeButton.click();setGuide(false);break;
      default:handled=false;
    }
    if(handled){event.stopPropagation();event.stopImmediatePropagation();}
  });
  backdrop.addEventListener("transitionend",()=>{if(backdrop.hidden)setGuide(false);});
  window.StoryspacePlayerShortcuts=Object.freeze({isEditable,seek,setGuide,setTheater});
})();
