(() => {
  "use strict";
  const video=document.getElementById("previewVideo");
  const button=document.getElementById("playerOfflineToggle");
  const status=document.getElementById("playerOfflineStatus");
  if(!video||!button||!status||!("caches" in window))return;
  const CACHE="storyspace-offline-media-v1",MAX_BYTES=250*1024*1024;
  let sourceUrl="",objectUrl="",busy=false;
  const currentUrl=()=>{try{const value=sourceUrl||video.currentSrc||video.src||video.querySelector("source")?.src;const url=new URL(value,location.href);return /^https:$/.test(url.protocol)||url.origin===location.origin?url.href:""}catch{return ""}};
  const announce=value=>{status.textContent=value};
  async function cacheFor(url){const cache=await caches.open(CACHE);return{cache,response:await cache.match(url)}}
  async function sync(){
    if(busy)return;
    const url=currentUrl();
    button.disabled=!url;
    if(!url){button.textContent="Save offline";announce("Offline copies require a secure media URL.");return}
    try{const {response}=await cacheFor(url);button.textContent=response?"Remove offline copy":"Save for offline";announce(response?"Saved on this device · available without a connection":"Save this video on this device for offline playback.");}
    catch{button.disabled=true;announce("Offline storage is unavailable in this browser.")}
  }
  async function saveOffline(){
    const url=currentUrl();if(!url)throw new Error("This media URL cannot be saved for offline playback.");
    const response=await fetch(url,{method:"GET",credentials:"omit",cache:"no-store"});
    if(!response.ok||response.status!==200||!["basic","cors"].includes(response.type))throw new Error("The media server did not provide a complete, cacheable video response.");
    const size=Number(response.headers.get("content-length"));
    if(!Number.isSafeInteger(size)||size<1||size>MAX_BYTES)throw new Error("Offline copies are limited to videos up to 250 MB with a known file size.");
    if(navigator.storage?.estimate){const estimate=await navigator.storage.estimate();if(Number.isFinite(estimate.quota)&&Number.isFinite(estimate.usage)&&estimate.quota-estimate.usage<size*1.15)throw new Error("Not enough device storage is available for this offline copy.");}
    const cache=await caches.open(CACHE);await cache.put(url,response.clone());sourceUrl=url;
    announce("Offline copy saved · "+Math.round(size/1024/1024)+" MB");
  }
  async function switchToCached(){
    if(navigator.onLine||objectUrl)return;
    const url=currentUrl();if(!url)return;
    const {response}=await cacheFor(url);if(!response)return;
    const blob=await response.blob();sourceUrl=url;objectUrl=URL.createObjectURL(blob);
    const position=Number(video.currentTime)||0,wasPlaying=!video.paused;
    video.src=objectUrl;video.load();
    video.addEventListener("loadedmetadata",function restorePosition(){video.removeEventListener("loadedmetadata",restorePosition);if(Number.isFinite(position)&&position<video.duration)video.currentTime=position;if(wasPlaying)video.play().catch(()=>{})});
    announce("Connection lost · playing the saved offline copy");
  }
  function restoreNetwork(){
    if(!objectUrl||!navigator.onLine||!sourceUrl)return;
    const url=sourceUrl,position=Number(video.currentTime)||0,wasPlaying=!video.paused,old=objectUrl;objectUrl="";
    video.src=url;video.load();
    video.addEventListener("loadedmetadata",function restorePosition(){video.removeEventListener("loadedmetadata",restorePosition);if(Number.isFinite(position)&&position<video.duration)video.currentTime=position;if(wasPlaying)video.play().catch(()=>{});URL.revokeObjectURL(old)});
    announce("Connection restored · returning to the network stream");
  }
  button.addEventListener("click",async()=>{
    if(busy)return;busy=true;button.disabled=true;
    try{const url=currentUrl();const {cache,response}=await cacheFor(url);if(response){await cache.delete(url);announce("Offline copy removed from this device");}else await saveOffline();}
    catch(error){announce(error.message||"Could not update the offline copy");}
    finally{busy=false;await sync()}
  });
  video.addEventListener("loadedmetadata",()=>{if(!objectUrl)sourceUrl=video.currentSrc||video.src;sync()});
  video.addEventListener("emptied",sync);
  window.addEventListener("offline",()=>switchToCached().catch(error=>announce(error.message||"Offline recovery failed")));
  window.addEventListener("online",restoreNetwork);
  sync();
  if(!navigator.onLine)switchToCached().catch(error=>announce(error.message||"Offline recovery failed"));
  window.StoryspaceOfflinePlayback=Object.freeze({sync,switchToCached,restoreNetwork});
})();