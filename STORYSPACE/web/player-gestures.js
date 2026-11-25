(() => {
  "use strict";
  const video=document.getElementById("previewVideo"),stage=document.getElementById("playerStage"),feedback=document.getElementById("playerGestureFeedback"),toggle=document.getElementById("playerGesturesToggle"),hint=document.getElementById("playerGestureHint"),player=document.getElementById("playerBackdrop");
  if(!video||!stage||!feedback||!toggle||!hint||!player)return;
  const STORAGE_KEY="storyspace.playerGestures";
  const reducedMotion=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches===true;
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const read=(key,fallback)=>{try{const v=localStorage.getItem(key);return v===null?fallback:v}catch{return fallback}};
  const save=(key,value)=>{try{localStorage.setItem(key,String(value))}catch{}};
  let enabled=read(STORAGE_KEY,"true")!=="false",pointer=null,lastTap={at:0,zone:""},feedbackTimer=0,holdTimer=0,fastPlayback=false;
  let brightness=clamp(Number(read("storyspace.playerBrightness","1"))||1,0.4,1.6);
  video.style.filter="brightness("+brightness.toFixed(2)+")";
  const isOpen=()=>!player.hidden;
  const formatTime=seconds=>{const v=Math.max(0,Math.floor(Number(seconds)||0)),h=Math.floor(v/3600),m=Math.floor(v%3600/60),s=v%60;return h?h+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0"):m+":"+String(s).padStart(2,"0")};
  const restoreSpeed=()=>{video.playbackRate=Number(read("storyspace.playerSpeed","1"))||1;fastPlayback=false};
  function showFeedback(message){feedback.textContent=message;feedback.classList.remove("is-visible");requestAnimationFrame(()=>feedback.classList.add("is-visible"));window.clearTimeout(feedbackTimer);feedbackTimer=window.setTimeout(()=>feedback.classList.remove("is-visible"),reducedMotion?450:950)}
  function updateToggle(){toggle.setAttribute("aria-pressed",String(enabled));toggle.textContent="Touch gestures: "+(enabled?"On":"Off");hint.textContent=enabled?"Double-tap left/right to skip 10s · swipe horizontally to seek · swipe vertically for brightness/volume · hold for 2×":"Gestures are off. Use video controls or keyboard shortcuts.";stage.classList.toggle("player-gestures-disabled",!enabled)}
  toggle.addEventListener("click",()=>{enabled=!enabled;save(STORAGE_KEY,enabled);pointer=null;window.clearTimeout(holdTimer);if(fastPlayback)restoreSpeed();lastTap={at:0,zone:""};updateToggle()});
  function getZone(x,rect){const p=(x-rect.left)/Math.max(1,rect.width);return p<.34?"left":p>.66?"right":"center"}
  function startGesture(event){
    if(!enabled||!isOpen()||!["touch","pen"].includes(event.pointerType)||event.target!==video)return;
    const rect=video.getBoundingClientRect();if(rect.width<1||rect.height<1)return;
    // Keep the native control strip accessible.
    if(event.clientY>=rect.bottom-Math.max(44,rect.height*.14))return;
    pointer={id:event.pointerId,x:event.clientX,y:event.clientY,zone:getZone(event.clientX,rect),rect,longPress:false};
    window.clearTimeout(holdTimer);
    holdTimer=window.setTimeout(()=>{if(!pointer||pointer.id!==event.pointerId||!enabled||!isOpen())return;pointer.longPress=true;fastPlayback=true;video.playbackRate=2;if(event.cancelable)event.preventDefault();showFeedback("2× speed · hold to fast-forward")},420);
  }
  function finishGesture(event){
    if(!pointer||event.pointerId!==pointer.id)return;
    const start=pointer;pointer=null;window.clearTimeout(holdTimer);
    if(!enabled||!isOpen()){if(fastPlayback)restoreSpeed();return}
    if(start.longPress){restoreSpeed();showFeedback("Playback speed restored");if(event.cancelable)event.preventDefault();return}
    const dx=event.clientX-start.x,dy=event.clientY-start.y;
    if(Math.abs(dy)>=42&&Math.abs(dy)>Math.abs(dx)*1.25){
      const zone=getZone(start.x,start.rect),factor=clamp(Math.abs(dy)/start.rect.height,.06,.42);
      if(zone==="left"){brightness=clamp(brightness+(dy<0?factor:-factor),.4,1.6);video.style.filter="brightness("+brightness.toFixed(2)+")";save("storyspace.playerBrightness",brightness);showFeedback("Brightness · "+Math.round(brightness*100)+"%")}
      else if(zone==="right"){video.volume=clamp(video.volume+(dy<0?factor:-factor),0,1);if(video.volume>0)video.muted=false;showFeedback("Volume · "+Math.round(video.volume*100)+"%")}
      else showFeedback("Swipe on left for brightness or right for volume");
      lastTap={at:0,zone:""};if(event.cancelable)event.preventDefault();return;
    }
    if(Math.abs(dx)>=48&&Math.abs(dx)>Math.abs(dy)*1.25){
      if(!Number.isFinite(video.duration)||video.duration<=0||video.readyState<1)return;
      const max=Math.max(20,Math.min(120,video.duration*.28)),delta=clamp(dx/start.rect.width*max,-90,90),before=video.currentTime,next=clamp(before+delta,0,video.duration);
      video.currentTime=next;lastTap={at:0,zone:""};showFeedback((next>=before?"Forward ":"Back ")+Math.round(Math.abs(next-before))+" sec · "+formatTime(next));if(event.cancelable)event.preventDefault();return;
    }
    if(Math.abs(dx)>15||Math.abs(dy)>15)return;
    const now=performance.now(),zone=getZone(event.clientX,start.rect);
    if(zone!=="center"&&zone===lastTap.zone&&now-lastTap.at<=320){
      if(!Number.isFinite(video.duration)||video.duration<=0||video.readyState<1)return;
      const delta=zone==="left"?-10:10,before=video.currentTime,next=clamp(before+delta,0,video.duration);
      video.currentTime=next;lastTap={at:0,zone:""};showFeedback((next>=before?"Forward ":"Back ")+Math.round(Math.abs(next-before))+" sec · "+formatTime(next));if(event.cancelable)event.preventDefault();return;
    }
    lastTap={at:now,zone};
  }
  function cancelGesture(event){if(pointer&&event.pointerId===pointer.id){pointer=null;window.clearTimeout(holdTimer);if(fastPlayback)restoreSpeed()}}
  stage.addEventListener("pointerdown",startGesture,{passive:true});
  window.addEventListener("pointerup",finishGesture,{passive:false,capture:true});
  window.addEventListener("pointercancel",cancelGesture,{passive:true,capture:true});
  player.addEventListener("transitionend",()=>{if(player.hidden){pointer=null;window.clearTimeout(holdTimer);if(fastPlayback)restoreSpeed();lastTap={at:0,zone:""};feedback.classList.remove("is-visible")}});
  updateToggle();
  window.StoryspacePlayerGestures=Object.freeze({isEnabled:()=>enabled,formatTime,brightness:()=>brightness});
})();