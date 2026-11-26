(()=>{"use strict";
const video=document.getElementById("previewVideo"),stage=document.getElementById("playerStage"),backdrop=document.getElementById("playerBackdrop"),panel=backdrop?.querySelector(".player-panel");
if(!video||!stage||!backdrop||!panel)return;
const lowerControls=[document.querySelector(".player-gesture-row"),document.querySelector(".player-timeline"),document.querySelector(".player-tools")].filter(Boolean);
let playButton=stage.querySelector(".player-center-toggle");
if(!playButton){playButton=document.createElement("button");playButton.type="button";playButton.className="player-center-toggle";playButton.setAttribute("aria-label","Play preview");playButton.innerHTML='<span class="player-center-icon" aria-hidden="true">▶</span>';stage.append(playButton)}
let idleTimer=0;
const IDLE_DELAY=3200;
function setIdle(idle){stage.classList.toggle("player-controls-idle",!!idle);panel.classList.toggle("player-controls-idle",!!idle)}
function update(){const paused=video.paused||video.ended;playButton.hidden=!paused;playButton.setAttribute("aria-label",video.ended?"Replay preview":"Play preview");playButton.querySelector(".player-center-icon").textContent=video.ended?"↻":"▶";if(paused){setIdle(false);clearTimeout(idleTimer)}else scheduleIdle()}
function scheduleIdle(){clearTimeout(idleTimer);setIdle(false);if(video.paused||backdrop.hidden||panel.matches(":focus-within"))return;idleTimer=setTimeout(()=>{if(!video.paused&&!backdrop.hidden&&!panel.matches(":focus-within"))setIdle(true)},IDLE_DELAY)}
playButton.addEventListener("click",()=>{if(video.ended){video.currentTime=0}video.play().catch(()=>{playButton.hidden=false;playButton.focus()})});
stage.addEventListener("click",event=>{if(event.target===video||event.target.closest("button,.player-buffer-state,.player-gesture-feedback"))return;if(video.paused)video.play().catch(()=>{});else video.pause()});
["pointermove","pointerdown","touchstart"].forEach(type=>stage.addEventListener(type,scheduleIdle,{passive:true}));
panel.addEventListener("pointermove",scheduleIdle,{passive:true});
panel.addEventListener("focusin",()=>setIdle(false));
panel.addEventListener("focusout",()=>{setTimeout(()=>{if(!panel.matches(":focus-within"))scheduleIdle()},0)});
video.addEventListener("play",update);video.addEventListener("playing",update);video.addEventListener("pause",update);video.addEventListener("ended",update);
backdrop.addEventListener("transitionend",()=>{if(backdrop.hidden){clearTimeout(idleTimer);setIdle(false)}else update()});
document.addEventListener("visibilitychange",()=>{if(document.hidden)clearTimeout(idleTimer);else update()});
update();
window.StoryspacePlayerControls=Object.freeze({resetAutoHide:scheduleIdle,setIdle,autoHideDelay:IDLE_DELAY});
})();