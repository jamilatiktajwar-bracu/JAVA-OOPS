(() => {
  "use strict";
  const video=document.getElementById("previewVideo");
  const button=document.getElementById("playerOfflineToggle");
  const status=document.getElementById("playerOfflineStatus");
  if(!video||!button||!status||!("caches" in window))return;
  const CACHE="storyspace-offline-media-v1",MAX_BYTES=250*1024*1024;
  let sourceUrl="",objectUrl="",busy=false,switching=false;
  const currentUrl=()=>{try{const value=sourceUrl||video.currentSrc||video.src;const url=new URL(value,location.href);return /^https:$/.test(url.protocol)||url.origin===location.origin?url.href:""}catch{return ""}};
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
  async function touchCached(cache,url,response){
    const headers=new Headers(response.headers);headers.set("x-storyspace-cached-at",String(Date.now()));
    await cache.put(url,new Response(response.clone().body,{status:response.status,statusText:response.statusText,headers}));
  }
  async function evictForQuota(cache,requiredBytes,keepUrl){
    const estimate=await navigator.storage?.estimate?.().catch(()=>null);
    const quota=Number(estimate?.quota),usage=Number(estimate?.usage);
    const budget=Number.isFinite(quota)&&quota>0?Math.min(500*1024*1024,quota*.35):500*1024*1024;
    const entries=[];
    for(const request of await cache.keys()){
      if(request.url===keepUrl)continue;
      const response=await cache.match(request);if(!response)continue;
      const bytes=Math.max(0,Number(response.headers.get("content-length"))||0);
      const savedAt=Math.max(0,Number(response.headers.get("x-storyspace-cached-at"))||0);
      entries.push({request,bytes,savedAt});
    }
    let total=entries.reduce((sum,item)=>sum+item.bytes,0);
    entries.sort((a,b)=>a.savedAt-b.savedAt);
    let free=Number.isFinite(quota)&&Number.isFinite(usage)?quota-usage:Infinity;
    while(entries.length&&(total+requiredBytes>budget||free<requiredBytes*1.15)){
      const oldest=entries.shift();await cache.delete(oldest.request);total=Math.max(0,total-oldest.bytes);
      const next=await navigator.storage?.estimate?.().catch(()=>null);
      if(Number.isFinite(Number(next?.quota))&&Number.isFinite(Number(next?.usage)))free=Number(next.quota)-Number(next.usage);
    }
    if(total+requiredBytes>budget||free<requiredBytes*1.15)throw new Error("Device storage is full. Remove another offline video or free device space.");
  }
  async function saveOffline(){
    const url=currentUrl();if(!url)throw new Error("This media URL cannot be saved for offline playback.");
    const response=await fetch(url,{method:"GET",credentials:"omit",cache:"no-store"});
    if(!response.ok||response.status!==200||!["basic","cors"].includes(response.type))throw new Error("The media server did not provide a complete, cacheable video response.");
    const size=Number(response.headers.get("content-length"));
    if(!Number.isSafeInteger(size)||size<1||size>MAX_BYTES)throw new Error("Offline copies are limited to videos up to 250 MB with a known file size.");
    const cache=await caches.open(CACHE);await evictForQuota(cache,size,url);
    const headers=new Headers(response.headers);headers.set("x-storyspace-cached-at",String(Date.now()));
    const cachedResponse=new Response(response.clone().body,{status:response.status,statusText:response.statusText,headers});
    try{await cache.put(url,cachedResponse.clone())}catch(error){
      if(error?.name!=="QuotaExceededError")throw error;
      await evictForQuota(cache,size,url);await cache.put(url,cachedResponse.clone());
    }
    sourceUrl=url;
    announce("Offline copy saved · "+Math.round(size/1024/1024)+" MB");
  }
  async function switchToCached(){
    if(navigator.onLine||objectUrl)return;
    const url=currentUrl();if(!url)return;
    const {cache,response}=await cacheFor(url);if(!response)return;
    try{await touchCached(cache,url,response)}catch{/* Playback remains available even if recency metadata cannot be refreshed. */}
    const blob=await response.blob();sourceUrl=url;objectUrl=URL.createObjectURL(blob);
    const position=Number(video.currentTime)||0,wasPlaying=!video.paused;
    switching=true;video.src=objectUrl;video.load();
    const restorePosition=()=>{if(!switching)return;switching=false;video.removeEventListener("loadedmetadata",restorePosition);video.removeEventListener("error",failRestore);clearTimeout(restoreTimer);if(Number.isFinite(position)&&position>=0&&Number.isFinite(video.duration)&&video.duration>0)video.currentTime=Math.min(position,Math.max(0,video.duration-.1));if(wasPlaying)video.play().catch(()=>announce("Offline copy ready · press Play to continue"));};
    const failRestore=()=>{if(!switching)return;switching=false;video.removeEventListener("loadedmetadata",restorePosition);video.removeEventListener("error",failRestore);clearTimeout(restoreTimer);if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl="";}video.src=url;video.load();announce("Saved offline video could not be opened · try again");};
    const restoreTimer=setTimeout(failRestore,10000);
    video.addEventListener("loadedmetadata",restorePosition,{once:true});video.addEventListener("error",failRestore,{once:true});
    announce("Connection lost · opening saved offline copy…");
  }
  function restoreNetwork(){
    if(!objectUrl||!navigator.onLine||!sourceUrl)return;
    const url=sourceUrl,position=Number(video.currentTime)||0,wasPlaying=!video.paused,old=objectUrl;objectUrl="";
    switching=true;video.src=url;video.load();
    const restorePosition=()=>{if(!switching)return;switching=false;video.removeEventListener("loadedmetadata",restorePosition);video.removeEventListener("error",failRestore);clearTimeout(restoreTimer);if(Number.isFinite(position)&&position>=0&&Number.isFinite(video.duration)&&video.duration>0)video.currentTime=Math.min(position,Math.max(0,video.duration-.1));if(wasPlaying)video.play().catch(()=>announce("Network stream ready · press Play to continue"));URL.revokeObjectURL(old);};
    const failRestore=()=>{if(!switching)return;switching=false;video.removeEventListener("loadedmetadata",restorePosition);video.removeEventListener("error",failRestore);clearTimeout(restoreTimer);video.src=old;video.load();objectUrl=old;announce("Network stream unavailable · continuing with saved offline copy");};
    const restoreTimer=setTimeout(failRestore,10000);
    video.addEventListener("loadedmetadata",restorePosition,{once:true});video.addEventListener("error",failRestore,{once:true});
    announce("Connection restored · reconnecting to network stream…");
  }
  button.addEventListener("click",async()=>{
    if(busy)return;busy=true;button.disabled=true;
    try{const url=currentUrl();const {cache,response}=await cacheFor(url);if(response){await cache.delete(url);announce("Offline copy removed from this device");}else await saveOffline();}
    catch(error){announce(error.message||"Could not update the offline copy");}
    finally{busy=false;await sync()}
  });
  video.addEventListener("play",()=>{if(!navigator.onLine)return;const url=currentUrl();if(url)cacheFor(url).then(({cache,response})=>response?touchCached(cache,url,response):null).catch(()=>{})});
  video.addEventListener("loadedmetadata",()=>{if(!objectUrl)sourceUrl=video.currentSrc||video.src;sync()});
  video.addEventListener("emptied",()=>{if(switching)return;if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=""}sync()});
  document.getElementById("playerClose")?.addEventListener("click",()=>{if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=""}sourceUrl="";switching=false;sync()});
  window.addEventListener("offline",()=>switchToCached().catch(error=>announce(error.message||"Offline recovery failed")));
  window.addEventListener("online",restoreNetwork);
  sync();
  if(!navigator.onLine)switchToCached().catch(error=>announce(error.message||"Offline recovery failed"));
  window.StoryspaceOfflinePlayback=Object.freeze({sync,switchToCached,restoreNetwork});
})();