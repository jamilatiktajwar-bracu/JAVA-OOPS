(()=>{"use strict";
const video=document.getElementById("previewVideo"),health=document.getElementById("playerPlaybackHealth"),backdrop=document.getElementById("playerBackdrop");
if(!video||!health||!backdrop)return;
let lastState="";
function bufferedSeconds(){if(!video.buffered.length||!Number.isFinite(video.currentTime))return 0;for(let i=0;i<video.buffered.length;i++){const start=video.buffered.start(i),end=video.buffered.end(i);if(video.currentTime>=start&&video.currentTime<=end)return Math.max(0,end-video.currentTime)}return 0}
function update(state){if(backdrop.hidden||!video.currentSrc){health.hidden=true;health.textContent="";health.removeAttribute("data-state");lastState="";return}
let label=state||(!navigator.onLine?"Offline · playback may be interrupted":video.paused?"Paused":"Playing");
let key=label;if(key===lastState)return;lastState=key;health.dataset.state=label.toLowerCase().includes("buffer")?"buffering":label.toLowerCase().includes("offline")?"offline":label.toLowerCase().includes("play")?"playing":"idle";
const buffer=bufferedSeconds();health.textContent=label+(buffer>0?" · Buffered "+Math.floor(buffer)+"s":"");health.hidden=false}
video.addEventListener("playing",()=>update("Playing"));video.addEventListener("pause",()=>update("Paused"));video.addEventListener("waiting",()=>update("Buffering…"));video.addEventListener("stalled",()=>update("Stream stalled · waiting for data"));video.addEventListener("canplay",()=>update(video.paused?"Ready":"Playing"));video.addEventListener("progress",()=>update());video.addEventListener("loadedmetadata",()=>update());video.addEventListener("emptied",()=>update());
window.addEventListener("offline",()=>update("Offline · playback may be interrupted"));window.addEventListener("online",()=>update(video.paused?"Connection restored · Ready":"Playing"));
const observer=new MutationObserver(()=>update());observer.observe(backdrop,{attributes:true,attributeFilter:["hidden"]});
window.StoryspacePlaybackDiagnostics=Object.freeze({refresh:update,bufferedSeconds});
})();