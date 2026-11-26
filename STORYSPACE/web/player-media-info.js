(()=>{"use strict";
const video=document.getElementById("previewVideo"),info=document.getElementById("playerMediaInfo"),backdrop=document.getElementById("playerBackdrop");
if(!video||!info||!backdrop)return;
const formatTime=value=>{if(!Number.isFinite(value)||value<0)return "";const sec=Math.floor(value),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h?h+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0"):m+":"+String(s).padStart(2,"0")};
let lastText="";
function bufferedAhead(){const now=Number(video.currentTime);if(!Number.isFinite(now))return 0;const ranges=video.buffered;for(let i=0;i<ranges.length;i++){try{const start=ranges.start(i),end=ranges.end(i);if(now>=start-.25&&now<=end+.25)return Math.max(0,end-now)}catch{}}return 0}
function update(){if(backdrop.hidden||video.readyState<1){info.hidden=true;info.textContent="";lastText="";return}
const parts=[];if(video.videoWidth&&video.videoHeight)parts.push(video.videoWidth+" × "+video.videoHeight);
const duration=formatTime(video.duration);if(video.duration===Infinity)parts.push("LIVE");else if(duration)parts.push("Duration "+duration);
const ahead=bufferedAhead();parts.push("Buffer "+(ahead<10?ahead.toFixed(1):Math.round(ahead))+"s ahead");
if(video.networkState===video.NETWORK_NO_SOURCE)parts.push("No source");else if(video.networkState===video.NETWORK_LOADING)parts.push("Loading");
if(video.readyState===video.HAVE_NOTHING)parts.push("No media");else if(video.readyState===video.HAVE_METADATA)parts.push("Metadata ready");else if(video.readyState===video.HAVE_CURRENT_DATA)parts.push("Frame ready");else if(video.readyState===video.HAVE_FUTURE_DATA)parts.push("Playback ready");else if(video.readyState===video.HAVE_ENOUGH_DATA)parts.push("Playback buffered");
if(video.playbackRate!==1)parts.push(video.playbackRate+"× speed");
const quality=video.getVideoPlaybackQuality?.();if(quality&&Number.isFinite(quality.droppedVideoFrames)&&Number.isFinite(quality.totalVideoFrames)&&quality.totalVideoFrames>0)parts.push("Dropped frames "+quality.droppedVideoFrames+"/"+quality.totalVideoFrames);
parts.push(video.dataset.demoStream==="1"?"Sample stream":"Preview stream");
const text=parts.join(" · ");if(text!==lastText){info.textContent=text;lastText=text}info.hidden=!parts.length}
const events=["loadedmetadata","loadeddata","durationchange","progress","timeupdate","playing","waiting","stalled","seeking","seeked","ratechange","canplay","canplaythrough"];
events.forEach(name=>video.addEventListener(name,update));
video.addEventListener("emptied",()=>{info.hidden=true;info.textContent="";lastText=""});
const observer=new MutationObserver(update);observer.observe(backdrop,{attributes:true,attributeFilter:["hidden"]});
window.StoryspaceMediaInfo=Object.freeze({refresh:update,formatTime,bufferedAhead});
})();