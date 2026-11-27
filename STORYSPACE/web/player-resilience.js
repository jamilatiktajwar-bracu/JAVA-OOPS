(()=>{"use strict";
const video=document.getElementById("previewVideo"),stage=document.getElementById("playerStage"),backdrop=document.getElementById("playerBackdrop");
if(!video||!stage||!backdrop)return;
let overlay=stage.querySelector(".player-buffer-state");
if(!overlay){overlay=document.createElement("div");overlay.className="player-buffer-state";overlay.setAttribute("role","status");overlay.setAttribute("aria-live","polite");overlay.hidden=true;overlay.innerHTML='<span class="player-buffer-spinner" aria-hidden="true"></span><span class="player-buffer-message">Preparing playback…</span><button class="player-buffer-retry" type="button" hidden>Retry playback</button>';stage.append(overlay)}
const message=overlay.querySelector(".player-buffer-message"),retryAction=overlay.querySelector(".player-buffer-retry");
let waitingTimer=0,lastPosition=0,stalledAt=0,recoveryTimer=0,stallRecoveryTimer=0,lastAutoRecoveryAt=0,recovering=false,recoveryId=0;
function show(text,canRetry=false){message.textContent=text;retryAction.hidden=!canRetry;overlay.hidden=false;overlay.setAttribute("aria-busy","true");stage.classList.add("is-buffering")}
function hide(){overlay.hidden=true;overlay.setAttribute("aria-busy","false");stage.classList.remove("is-buffering");clearTimeout(waitingTimer)}
function active(){return !backdrop.hidden&&!video.paused&&!video.ended}
function onWaiting(){if(!active())return;clearTimeout(waitingTimer);waitingTimer=setTimeout(()=>{if(active()&&video.readyState<3)show("Buffering · waiting for video data…")},450)}
function stopRecovery(){clearTimeout(recoveryTimer);recovering=false;const retry=document.getElementById("playerRetry");if(retry)retry.disabled=false}
function recover({resume=true,autoplay=true}={}){if(recovering)return;const retry=document.getElementById("playerRetry");if(!navigator.onLine){show("Still offline · Check your internet connection");return}recovering=true;if(retry)retry.disabled=true;const id=++recoveryId,position=resume?(Number.isFinite(video.currentTime)?video.currentTime:lastPosition):0;show("Reconnecting to video…");clearTimeout(recoveryTimer);let restore;const onError=()=>{if(id!==recoveryId)return;clearTimeout(recoveryTimer);video.removeEventListener("loadedmetadata",restore);video.removeEventListener("error",onError);stopRecovery();show("Source unavailable · Check the video URL or try another stream",true)};recoveryTimer=setTimeout(()=>{if(id!==recoveryId)return;video.removeEventListener("loadedmetadata",restore);video.removeEventListener("error",onError);stopRecovery();show("Recovery timed out · Check the connection or retry playback",true)},12000);
restore=()=>{if(id!==recoveryId)return;video.removeEventListener("loadedmetadata",restore);video.removeEventListener("error",onError);clearTimeout(recoveryTimer);try{if(position>0){const ranges=video.seekable;if(ranges&&ranges.length){const start=ranges.start(ranges.length-1),end=ranges.end(ranges.length-1),target=Math.max(start,Math.min(end-.1,position));if(Number.isFinite(start)&&Number.isFinite(end)&&end>start)video.currentTime=target;}else if(Number.isFinite(video.duration)&&video.duration>0)video.currentTime=Math.min(position,Math.max(0,video.duration-.25));}}catch{}stopRecovery();if(autoplay)video.play().catch(()=>show("Video is ready · Press Play to continue"));else hide()};
video.addEventListener("loadedmetadata",restore,{once:true});video.addEventListener("error",onError,{once:true});try{video.load()}catch{stopRecovery();show("Could not restart this source · Check the video URL",true)}
}
video.addEventListener("waiting",onWaiting);
video.addEventListener("stalled",()=>{
 if(!active())return;
 stalledAt=Date.now();show("Connection is slow · waiting for video data…");
 clearTimeout(stallRecoveryTimer);
 const observedAt=stalledAt;
 stallRecoveryTimer=setTimeout(()=>{
  if(!active()||stalledAt!==observedAt||video.readyState>=3||Date.now()-lastAutoRecoveryAt<25000)return;
  lastAutoRecoveryAt=Date.now();recover({resume:true,autoplay:true});
 },8500);
});
video.addEventListener("playing",()=>{hide();lastPosition=video.currentTime;stalledAt=0;clearTimeout(stallRecoveryTimer);stopRecovery()});
video.addEventListener("canplay",()=>{if(!active())hide()});
video.addEventListener("timeupdate",()=>{if(!video.paused&&video.currentTime>lastPosition+.2){lastPosition=video.currentTime;if(!overlay.hidden)hide()}});
video.addEventListener("pause",()=>{clearTimeout(stallRecoveryTimer);stalledAt=0;hide()});
video.addEventListener("ended",()=>{clearTimeout(stallRecoveryTimer);stalledAt=0;hide()});
video.addEventListener("emptied",()=>{clearTimeout(stallRecoveryTimer);stalledAt=0;hide()});
video.addEventListener("error",()=>{stopRecovery();clearTimeout(waitingTimer);const code=video.error?.code;const reason=code===2?"Network interrupted":code===3?"Video decoding failed":code===4?"This video format or source is unavailable":"Playback could not continue";show((video.dataset.demoStream==="1"?"Sample stream unavailable · ":"")+reason+" · Use Retry playback to try again.",true)});
window.addEventListener("offline",()=>{if(active())show("You’re offline · Playback will resume when connection returns")});
window.addEventListener("online",()=>{if(active()){recover({resume:true,autoplay:true})}});
const retry=document.getElementById("playerRetry");
retry?.addEventListener("click",()=>recover({resume:true,autoplay:true}));
retryAction?.addEventListener("click",()=>recover({resume:true,autoplay:true}));
document.addEventListener("visibilitychange",()=>{if(document.hidden&&video.paused)hide()});
window.StoryspacePlayerResilience=Object.freeze({show,hide,isBuffering:()=>!overlay.hidden,recover:()=>recover({resume:true,autoplay:true}),getLastPosition:()=>lastPosition});
})();