(()=>{"use strict";
const video=document.getElementById("previewVideo"),stage=document.getElementById("playerStage"),backdrop=document.getElementById("playerBackdrop");
if(!video||!stage||!backdrop)return;
let overlay=stage.querySelector(".player-buffer-state");
if(!overlay){overlay=document.createElement("div");overlay.className="player-buffer-state";overlay.setAttribute("role","status");overlay.setAttribute("aria-live","polite");overlay.hidden=true;overlay.innerHTML='<span class="player-buffer-spinner" aria-hidden="true"></span><span class="player-buffer-message">Preparing playback…</span>';stage.append(overlay)}
const message=overlay.querySelector(".player-buffer-message");
let waitingTimer=0,lastPosition=0,stalledAt=0;
function show(text){message.textContent=text;overlay.hidden=false;stage.classList.add("is-buffering")}
function hide(){overlay.hidden=true;stage.classList.remove("is-buffering");clearTimeout(waitingTimer)}
function active(){return !backdrop.hidden&&!video.paused&&!video.ended}
function onWaiting(){if(!active())return;clearTimeout(waitingTimer);waitingTimer=setTimeout(()=>{if(active()&&video.readyState<3)show("Buffering · waiting for video data…")},450)}
video.addEventListener("waiting",onWaiting);
video.addEventListener("stalled",()=>{if(active()){stalledAt=Date.now();show("Connection is slow · trying to recover…")}});
video.addEventListener("playing",()=>{hide();lastPosition=video.currentTime;stalledAt=0});
video.addEventListener("canplay",()=>{if(!active())hide()});
video.addEventListener("timeupdate",()=>{if(!video.paused&&video.currentTime>lastPosition+.2){lastPosition=video.currentTime;if(!overlay.hidden)hide()}});
video.addEventListener("pause",hide);
video.addEventListener("ended",hide);
video.addEventListener("emptied",hide);
video.addEventListener("error",()=>{clearTimeout(waitingTimer);const code=video.error?.code;const reason=code===2?"Network interrupted":code===3?"Video decoding failed":code===4?"This video format or source is unavailable":"Playback could not continue";show(reason+" · Use Retry playback to try again.")});
window.addEventListener("offline",()=>{if(active())show("You’re offline · Playback will resume when connection returns")});
window.addEventListener("online",()=>{if(active()){show("Connection restored · Resuming playback…");video.load();video.play().catch(()=>{})}});
const retry=document.getElementById("playerRetry");
retry?.addEventListener("click",()=>{if(!navigator.onLine){show("Still offline · Check your internet connection");return}const time=Number.isFinite(video.currentTime)?video.currentTime:0;show("Reconnecting to video…");try{video.load();video.addEventListener("loadedmetadata",function restore(){video.removeEventListener("loadedmetadata",restore);if(time>0&&Number.isFinite(video.duration))video.currentTime=Math.min(time,Math.max(0,video.duration-.25));video.play().catch(()=>show("Ready to retry · Press Play on the video"))},{once:true});video.play().catch(()=>{})}catch{show("Could not restart this source · Check the video URL") }});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&video.paused)hide()});
window.StoryspacePlayerResilience=Object.freeze({show,hide,isBuffering:()=>!overlay.hidden});
})();