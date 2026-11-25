(() => {
  "use strict";
  const toggle=document.getElementById("tvNavigationToggle");
  if(!toggle)return;
  const KEY="storyspace.tvNavigation";
  let enabled=false;
  const selector="a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";
  const visible=el=>!!(el&&el.getClientRects().length&&!el.closest("[hidden],[inert],[aria-hidden='true']")&&!el.disabled);
  const list=()=>Array.from(document.querySelectorAll(selector)).filter(visible);
  const rect=el=>{const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height}};
  const activate=state=>{enabled=!!state;document.body.classList.toggle("tv-navigation-active",enabled);toggle.setAttribute("aria-pressed",String(enabled));toggle.textContent=enabled?"TV Mode: On":"TV Mode";try{localStorage.setItem(KEY,String(enabled))}catch{}};
  toggle.addEventListener("click",()=>activate(!enabled));
  try{activate(localStorage.getItem(KEY)==="true")}catch{activate(false)}
  function move(direction){
    const els=list();if(!els.length)return;
    let current=document.activeElement;
    if(!els.includes(current)){current=els[0];current.focus();current.scrollIntoView?.({block:"nearest",inline:"nearest"});return}
    const a=rect(current);let best=null,bestScore=Infinity;
    for(const candidate of els){if(candidate===current)continue;const b=rect(candidate),dx=b.x-a.x,dy=b.y-a.y;
      const primary=direction==="left"?-dx:direction==="right"?dx:direction==="up"?-dy:dy;
      if(primary<=8)continue;const cross=direction==="left"||direction==="right"?Math.abs(dy):Math.abs(dx);
      const score=primary+cross*1.65+cross*cross/Math.max(primary,1)*.15;
      if(score<bestScore){best=candidate;bestScore=score}
    }
    if(best){best.focus({preventScroll:true});best.scrollIntoView?.({block:"nearest",inline:"nearest",behavior:"smooth"})}
  }
  document.addEventListener("keydown",event=>{
    if(!enabled||event.altKey||event.ctrlKey||event.metaKey||event.defaultPrevented)return;
    const focused=event.target,tag=focused?.tagName?.toLowerCase();const editable=focused?.closest?.("[contenteditable]");if(focused?.isContentEditable||["input","textarea","select"].includes(tag)||(editable&&editable.getAttribute("contenteditable")!=="false"))return;
    const key=event.key,dir={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down"}[key];
    if(dir){event.preventDefault();move(dir);return}
    if(key==="Escape"){document.activeElement?.blur?.();toggle.focus();event.preventDefault()}
  },true);
  window.StoryspaceTVNavigation=Object.freeze({activate,move,isEnabled:()=>enabled});
})();