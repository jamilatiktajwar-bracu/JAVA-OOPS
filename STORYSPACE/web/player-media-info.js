(()=>{"use strict";
const video=document.getElementById("previewVideo"),info=document.getElementById("playerMediaInfo"),backdrop=document.getElementById("playerBackdrop");
if(!video||!info||!backdrop)return;
const formatTime=value=>{if(!Number.isFinite(value)||value<0)return "";const sec=Math.floor(value),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h?h+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0"):m+":"+String(s).padStart(2,"0")};
function update(){if(backdrop.hidden||video.readyState<1){info.hidden=true;info.textContent="";return}
const parts=[];if(video.videoWidth&&video.videoHeight)parts.push(video.videoWidth+" × "+video.videoHeight);
const duration=formatTime(video.duration);if(duration)parts.push("Duration "+duration);
parts.push(video.dataset.demoStream==="1"?"Sample stream":"Preview stream");
info.textContent=parts.join(" · ");info.hidden=!parts.length}
video.addEventListener("loadedmetadata",update);video.addEventListener("durationchange",update);video.addEventListener("emptied",()=>{info.hidden=true;info.textContent=""});
const observer=new MutationObserver(update);observer.observe(backdrop,{attributes:true,attributeFilter:["hidden"]});
window.StoryspaceMediaInfo=Object.freeze({refresh:update,formatTime});
})();