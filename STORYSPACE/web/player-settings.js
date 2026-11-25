(() => {
  "use strict";
  const video=document.getElementById("previewVideo"),speed=document.getElementById("playerSpeed"),captions=document.getElementById("playerCaptionTrack"),style=document.getElementById("playerCaptionStyle"),audio=document.getElementById("playerAudioTrack"),notice=document.getElementById("playerSettingsNotice"),stage=document.getElementById("playerStage");
  if(!video||!speed||!captions||!style||!audio||!notice||!stage)return;
  const save=(k,v)=>{try{localStorage.setItem(k,v)}catch{}},read=(k,d)=>{try{return localStorage.getItem(k)||d}catch{return d}};
  const rates=["0.75","1","1.25","1.5","2"],rate=read("storyspace.playerSpeed","1");speed.value=rates.includes(rate)?rate:"1";video.playbackRate=Number(speed.value);
  speed.addEventListener("change",()=>{const v=rates.includes(speed.value)?speed.value:"1";speed.value=v;video.playbackRate=Number(v);save("storyspace.playerSpeed",v)});
  const styles=["default","large","high-contrast"],saved=read("storyspace.captionStyle","default");style.value=styles.includes(saved)?saved:"default";
  function applyStyle(){stage.classList.remove("player-caption-large","player-caption-high-contrast");if(style.value==="large")stage.classList.add("player-caption-large");if(style.value==="high-contrast")stage.classList.add("player-caption-high-contrast");save("storyspace.captionStyle",style.value)}
  style.addEventListener("change",applyStyle);applyStyle();
  const trackName=t=>{const label=(t.label||"").trim(),lang=(t.language||"").trim();return label&&lang?label+" · "+lang:label||lang||"Caption track"};
  const autoIndex=()=>{const pref=(navigator.language||"").toLowerCase().split("-")[0];if(!pref)return -1;for(let i=0;i<video.textTracks.length;i++){const lang=(video.textTracks[i].language||"").toLowerCase();if(lang===pref||lang.startsWith(pref+"-"))return i}return -1};
  function applyCaptionChoice(choice){for(let i=0;i<video.textTracks.length;i++)video.textTracks[i].mode="disabled";let idx=choice==="-2"?autoIndex():Number(choice);if(Number.isInteger(idx)&&idx>=0&&video.textTracks[idx])video.textTracks[idx].mode="showing";return idx}
  function refreshTracks(){
    const ts=video.textTracks,stored=read("storyspace.captionTrack","-1");captions.replaceChildren(new Option("Auto (device language)","-2"),new Option("Off","-1"));
    for(let i=0;i<ts.length;i++)captions.add(new Option(trackName(ts[i]),String(i)));
    captions.value=[...captions.options].some(o=>o.value===stored)?stored:"-1";const selected=applyCaptionChoice(captions.value);
    const ats=video.audioTracks;audio.replaceChildren(new Option("Default","-1"));
    if(ats&&typeof ats.length==="number")for(let i=0;i<ats.length;i++)audio.add(new Option(trackName(ats[i]),String(i)));
    const aud=read("storyspace.audioTrack","-1");audio.value=[...audio.options].some(o=>o.value===aud)?aud:"-1";
    if(ats&&ats.length)for(let i=0;i<ats.length;i++)ats[i].enabled=audio.value==="-1"?i===0:i===Number(audio.value);
    captions.disabled=!ts.length;audio.disabled=!ats||!ats.length;
    notice.textContent=ts.length?(captions.value==="-2"&&selected<0?"No caption track matches your device language; choose one manually.":"Captions available · Auto uses your device language."):(ats?.length?"Audio track options available.":"Caption/audio tracks appear when included in the video.");
  }
  captions.addEventListener("change",()=>{applyCaptionChoice(captions.value);save("storyspace.captionTrack",captions.value)});
  audio.addEventListener("change",()=>{const ts=video.audioTracks;if(!ts)return;for(let i=0;i<ts.length;i++)ts[i].enabled=audio.value==="-1"?i===0:i===Number(audio.value);save("storyspace.audioTrack",audio.value)});
  video.addEventListener("loadedmetadata",refreshTracks);video.addEventListener("loadeddata",refreshTracks);video.addEventListener("emptied",refreshTracks);
  video.textTracks.addEventListener?.("addtrack",refreshTracks);video.textTracks.addEventListener?.("removetrack",refreshTracks);
  video.textTracks.addEventListener?.("change",refreshTracks);
  video.querySelectorAll("track").forEach(t=>t.addEventListener("load",refreshTracks));
  video.audioTracks?.addEventListener?.("addtrack",refreshTracks);video.audioTracks?.addEventListener?.("removetrack",refreshTracks);
  function cycleCaption(){const opts=["-1","-2",...Array.from({length:video.textTracks.length},(_,i)=>String(i))];const at=opts.indexOf(captions.value),next=opts[(at+1+opts.length)%opts.length];captions.value=next;applyCaptionChoice(next);save("storyspace.captionTrack",next);refreshTracks();return captions.options[captions.selectedIndex]?.text||"Captions off"}
  window.StoryspacePlayerSettings=Object.freeze({refreshTracks,applyStyle,applyCaptionChoice,cycleCaption});refreshTracks();
})();