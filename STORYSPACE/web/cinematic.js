(() => {
  "use strict";
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches === true;
  const storage = {
    get(key, fallback) { try { const value=localStorage.getItem(key); return value===null?fallback:value; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} }
  };
  let spatialEnabled = storage.get("storyspace.spatialView", "1") === "1";
  let effectsEnabled = storage.get("storyspace.motionEffects", reducedMotion ? "0" : "1") === "1" && !reducedMotion;
  let heroIndex = 0, heroItems = [], pointerFrame = 0, spatialFrame = 0, suppressCardClickUntil = 0, drag = null;
  const hero = $("#hero"), content = $(".content-area");
  if (!hero || !content) return;

  const styleRoot = document.documentElement;
  const motionToggle = document.createElement("button");
  const spatialToggle = document.createElement("button");
  const toolbar = document.createElement("section");
  toolbar.className = "cinematic-toolbar";
  toolbar.setAttribute("aria-label", "Cinematic viewing controls");
  toolbar.innerHTML = '<div class="cinematic-toolbar-copy"><span class="cinematic-eyebrow">STORYSPACE / SPATIAL EXPERIENCE</span><strong>Step inside the story</strong><small>Move through the shelves, tilt a card, or swipe the featured world.</small></div><div class="cinematic-toolbar-actions"></div>';
  const actions = $(".cinematic-toolbar-actions", toolbar);
  const makeToggle = (button, label, onLabel, offLabel, enabled) => {
    button.type = "button"; button.className = "cinematic-toggle";
    button.setAttribute("aria-pressed", String(enabled)); button.textContent = enabled ? onLabel : offLabel;
    button.setAttribute("aria-label", label);
  };
  makeToggle(spatialToggle, "Toggle spatial 3D shelf view", "✧ 3D view on", "▱ 3D view off", spatialEnabled);
  makeToggle(motionToggle, "Toggle cinematic motion effects", "✦ Effects on", "◌ Effects off", effectsEnabled);
  actions.append(spatialToggle, motionToggle);
  const welcome = $(".welcome-line", content);
  if (welcome) welcome.insertAdjacentElement("afterend", toolbar); else content.prepend(toolbar);
  if(welcome){
    toolbar.hidden=welcome.hidden;
    const viewObserver=new MutationObserver(()=>{toolbar.hidden=welcome.hidden;});
    viewObserver.observe(welcome,{attributes:true,attributeFilter:["hidden"]});
  }

  const setSpatial = enabled => {
    spatialEnabled = !!enabled; styleRoot.classList.toggle("cinematic-spatial", spatialEnabled);
    spatialToggle.setAttribute("aria-pressed", String(spatialEnabled));
    spatialToggle.textContent = spatialEnabled ? "✧ 3D view on" : "▱ 3D view off";
    storage.set("storyspace.spatialView", spatialEnabled ? "1" : "0"); scheduleSpatialUpdate();
  };
  const setEffects = enabled => {
    effectsEnabled = !!enabled && !reducedMotion; styleRoot.classList.toggle("cinematic-effects", effectsEnabled);
    motionToggle.setAttribute("aria-pressed", String(effectsEnabled));
    motionToggle.textContent = effectsEnabled ? "✦ Effects on" : "◌ Effects off";
    storage.set("storyspace.motionEffects", effectsEnabled ? "1" : "0");
    if (!effectsEnabled) resetHeroTilt();
  };
  spatialToggle.addEventListener("click", () => setSpatial(!spatialEnabled));
  motionToggle.addEventListener("click", () => setEffects(!effectsEnabled));
  setSpatial(spatialEnabled); setEffects(effectsEnabled);

  // Restrained particle field: CSS 3D does the heavy lifting, without WebGL or external libraries.
  const art = $(".hero-art", hero), vignette = $(".hero-vignette", hero);
  let starCanvas=null, starContext=null, stars=[], starWidth=0, starHeight=0, starDpr=1, starAnimation=0, lastStarFrame=0;
  if (art && vignette && effectsEnabled) {
    starCanvas=document.createElement("canvas"); starCanvas.className="cinematic-stars";
    starCanvas.setAttribute("aria-hidden","true"); hero.insertBefore(starCanvas,vignette);
    starContext=starCanvas.getContext("2d",{alpha:true});
    const resizeStars=()=>{
      const rect=hero.getBoundingClientRect(); starWidth=Math.max(1,rect.width); starHeight=Math.max(1,rect.height);
      starDpr=Math.min(window.devicePixelRatio||1,1.5);
      starCanvas.width=Math.round(starWidth*starDpr); starCanvas.height=Math.round(starHeight*starDpr);
      starCanvas.style.width=starWidth+"px"; starCanvas.style.height=starHeight+"px";
      starContext?.setTransform(starDpr,0,0,starDpr,0,0);
      stars=Array.from({length:Math.min(54,Math.max(24,Math.round(starWidth/22)))},(_,index)=>({
        x:Math.random()*starWidth,y:Math.random()*starHeight,radius:.35+Math.random()*1.2,
        phase:Math.random()*Math.PI*2,speed:.25+Math.random()*.65,drift:.08+Math.random()*.28,index
      }));
    };
    const drawStars=timestamp=>{
      starAnimation=0;
      if(!effectsEnabled||document.hidden||!starContext)return;
      if(timestamp-lastStarFrame<32){starAnimation=requestAnimationFrame(drawStars);return;}
      lastStarFrame=timestamp;starContext.clearRect(0,0,starWidth,starHeight);
      for(const star of stars){
        const pulse=.28+(Math.sin(timestamp*.0007*star.speed+star.phase)+1)*.22;
        starContext.beginPath();starContext.fillStyle="rgba(181,245,239,"+pulse.toFixed(3)+")";
        starContext.arc(star.x,star.y+Math.sin(timestamp*.00012+star.phase)*star.drift*8,star.radius,0,Math.PI*2);
        starContext.fill();
      }
      starAnimation=requestAnimationFrame(drawStars);
    };
    resizeStars();
    if(!reducedMotion)starAnimation=requestAnimationFrame(drawStars);
    window.addEventListener("resize",resizeStars,{passive:true});
    document.addEventListener("visibilitychange",()=>{
      if(document.hidden&&starAnimation){cancelAnimationFrame(starAnimation);starAnimation=0;}
      else if(!document.hidden&&effectsEnabled&&!reducedMotion&&!starAnimation)starAnimation=requestAnimationFrame(drawStars);
    });
  }

  const heroDots=document.createElement("div"); heroDots.className="cinematic-hero-dots";
  heroDots.setAttribute("role","group"); heroDots.setAttribute("aria-label","Featured stories");
  const heroPrev=document.createElement("button"),heroNext=document.createElement("button");
  [heroPrev,heroNext].forEach(button=>{button.type="button";button.className="cinematic-hero-arrow";});
  heroPrev.classList.add("is-prev");heroNext.classList.add("is-next");
  heroPrev.textContent="‹";heroNext.textContent="›";
  heroPrev.setAttribute("aria-label","Previous featured story");heroNext.setAttribute("aria-label","Next featured story");
  heroDots.append(heroPrev,heroNext);
  const heroProgress=$(".hero-progress",hero);
  if(heroProgress)heroProgress.insertAdjacentElement("beforebegin",heroDots);else hero.append(heroDots);
  const currentTitle=()=>($("#heroTitle")?.textContent||"").replace(/\s+/g," ").trim().toLowerCase();
  const refreshHeroItems=()=>{
    try{heroItems=movies.filter(item=>item&&(item.featured||item.original)).slice(0,8);if(!heroItems.length)heroItems=movies.slice(0,8);}
    catch{heroItems=[];}
    let found=heroItems.findIndex(item=>String(item.title||item.name||"").toLowerCase()===currentTitle());
    if(found<0){
      const active=movies.find(item=>String(item?.title||item?.name||"").toLowerCase()===currentTitle());
      if(active){heroItems=[active,...heroItems.filter(item=>item!==active)].slice(0,8);found=0;}
    }
    heroIndex=found>=0?found:0;renderHeroDots();
  };
  function renderHeroDots(){
    $$(".cinematic-hero-dot",heroDots).forEach(dot=>dot.remove());
    heroItems.forEach((item,index)=>{
      const dot=document.createElement("button");dot.type="button";
      dot.className="cinematic-hero-dot"+(index===heroIndex?" is-active":"");
      dot.setAttribute("aria-label","Show featured story "+(index+1)+": "+String(item.title||"Story"));
      dot.setAttribute("aria-pressed",String(index===heroIndex));
      dot.addEventListener("click",()=>showHero(index));heroDots.insertBefore(dot,heroNext);
    });
    heroDots.hidden=heroItems.length<2;
  }
  function showHero(index){
    if(!heroItems.length||typeof setHero!=="function")return;
    heroIndex=(index+heroItems.length)%heroItems.length;hero.classList.add("cinematic-hero-changing");
    if(effectsEnabled&&art?.animate)art.animate(
      [{filter:"brightness(1)",transform:"translate3d(0,0,0) scale(1.02)"},{filter:"brightness(1.24)",transform:"translate3d(0,0,0) scale(1.06)"},{filter:"brightness(1)",transform:"translate3d(0,0,0) scale(1.02)"}],
      {duration:520,easing:"ease-out"});
    setHero(heroItems[heroIndex]);renderHeroDots();hero.classList.remove("cinematic-hero-changing");
    stars.forEach(star=>{star.x=(star.x+starWidth*.17)%Math.max(1,starWidth);star.y=(star.y+starHeight*.09)%Math.max(1,starHeight);});
  }
  heroPrev.addEventListener("click",()=>showHero(heroIndex-1));
  heroNext.addEventListener("click",()=>showHero(heroIndex+1));
  refreshHeroItems();
  const heroTitleNode=$("#heroTitle");
  if(heroTitleNode&&"MutationObserver" in window){
    const heroTitleObserver=new MutationObserver(()=>refreshHeroItems());
    heroTitleObserver.observe(heroTitleNode,{childList:true,subtree:true,characterData:true});
  }

  function resetHeroTilt(){
    hero.style.setProperty("--hero-tilt-x","0deg");hero.style.setProperty("--hero-tilt-y","0deg");
    hero.style.setProperty("--hero-shift-x","0px");hero.style.setProperty("--hero-shift-y","0px");
  }
  hero.addEventListener("pointermove",event=>{
    if(!effectsEnabled||event.pointerType!=="mouse"||!art)return;
    const rect=hero.getBoundingClientRect(),x=(event.clientX-rect.left)/Math.max(1,rect.width)-.5,y=(event.clientY-rect.top)/Math.max(1,rect.height)-.5;
    if(pointerFrame)cancelAnimationFrame(pointerFrame);
    pointerFrame=requestAnimationFrame(()=>{
      hero.style.setProperty("--hero-tilt-x",(-y*2.4).toFixed(2)+"deg");
      hero.style.setProperty("--hero-tilt-y",(x*3.6).toFixed(2)+"deg");
      hero.style.setProperty("--hero-shift-x",(x*-9).toFixed(1)+"px");
      hero.style.setProperty("--hero-shift-y",(y*-7).toFixed(1)+"px");pointerFrame=0;
    });
  },{passive:true});
  hero.addEventListener("pointerleave",resetHeroTilt,{passive:true});
  let heroTouch=null;
  hero.addEventListener("pointerdown",event=>{
    if(event.pointerType==="mouse"||event.target.closest("button"))return;
    heroTouch={x:event.clientX,y:event.clientY,time:Date.now()};
  },{passive:true});
  hero.addEventListener("pointerup",event=>{
    if(!heroTouch)return;const dx=event.clientX-heroTouch.x,dy=event.clientY-heroTouch.y;
    if(Math.abs(dx)>54&&Math.abs(dy)<90&&Date.now()-heroTouch.time<900)showHero(heroIndex+(dx<0?1:-1));
    heroTouch=null;
  },{passive:true});
  hero.addEventListener("pointercancel",()=>{heroTouch=null;},{passive:true});
  hero.setAttribute("aria-roledescription","featured story carousel");

  // Per-card 3D tilt and light response are delegated so dynamically-rendered cards work too.
  const resetCard=card=>{
    card.style.setProperty("--tilt-x","0deg");card.style.setProperty("--tilt-y","0deg");
    card.style.setProperty("--shine-x","50%");card.style.setProperty("--shine-y","35%");
    card.classList.remove("cinematic-card-active");
  };
  document.addEventListener("pointermove",event=>{
    const card=event.target.closest?.(".movie-card");
    if(!card||!effectsEnabled||event.pointerType!=="mouse"||event.buttons)return;
    const rect=card.getBoundingClientRect(),x=(event.clientX-rect.left)/Math.max(1,rect.width),y=(event.clientY-rect.top)/Math.max(1,rect.height);
    card.style.setProperty("--tilt-x",((.5-y)*9).toFixed(2)+"deg");
    card.style.setProperty("--tilt-y",((x-.5)*11).toFixed(2)+"deg");
    card.style.setProperty("--shine-x",(x*100).toFixed(1)+"%");
    card.style.setProperty("--shine-y",(y*100).toFixed(1)+"%");
    card.classList.add("cinematic-card-active");
  },{passive:true});
  document.addEventListener("pointerout",event=>{
    const card=event.target.closest?.(".movie-card");
    if(card&&!card.contains(event.relatedTarget))resetCard(card);
  },{passive:true});

  // Desktop click-and-drag shelf navigation; touch devices keep native swipe momentum.
  document.addEventListener("pointerdown",event=>{
    if(event.pointerType!=="mouse"||event.button!==0)return;
    const row=event.target.closest?.(".movie-row");
    if(!row||event.target.closest("button,a,input,select"))return;
    drag={row,startX:event.clientX,startScroll:row.scrollLeft,moved:false,pointerId:event.pointerId};
  },true);
  window.addEventListener("pointermove",event=>{
    if(!drag||event.pointerId!==drag.pointerId)return;
    const dx=event.clientX-drag.startX;
    if(Math.abs(dx)>5){drag.moved=true;drag.row.classList.add("cinematic-dragging");drag.row.scrollLeft=drag.startScroll-dx;}
  },{passive:true});
  const endDrag=event=>{
    if(!drag||(event?.pointerId!==undefined&&event.pointerId!==drag.pointerId))return;
    if(drag.moved){suppressCardClickUntil=Date.now()+260;document.body.classList.add("cinematic-no-select");setTimeout(()=>document.body.classList.remove("cinematic-no-select"),80);}
    drag.row.classList.remove("cinematic-dragging");drag=null;
  };
  window.addEventListener("pointerup",endDrag,{passive:true});window.addEventListener("pointercancel",endDrag,{passive:true});
  document.addEventListener("click",event=>{
    if(Date.now()<=suppressCardClickUntil&&event.target.closest?.(".movie-card")){
      event.preventDefault();event.stopImmediatePropagation();
    }
  },true);

  // Convert vertical wheel movement to horizontal shelf movement for mouse users/trackpads.
  document.addEventListener("wheel",event=>{
    const row=event.target.closest?.(".movie-row");
    if(!row||Math.abs(event.deltaY)<=Math.abs(event.deltaX)||row.scrollWidth<=row.clientWidth+2||event.ctrlKey)return;
    row.scrollLeft+=event.deltaY;event.preventDefault();
  },{passive:false});
  document.addEventListener("keydown",event=>{
    const card=event.target.closest?.(".movie-card");
    if(!card||!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
    const row=card.closest(".movie-row,.movie-grid");if(!row)return;
    const cards=$$$(".movie-card",row),index=cards.indexOf(card);
    const next=event.key==="Home"?0:event.key==="End"?cards.length-1:index+(event.key==="ArrowRight"?1:-1);
    if(next<0||next>=cards.length)return;
    event.preventDefault();cards[next].focus({preventScroll:true});
    cards[next].scrollIntoView({block:"nearest",inline:"center",behavior:effectsEnabled?"smooth":"auto"});
  });

  function updateSpatialContainer(row){
    if(!spatialEnabled||!row.isConnected)return;
    const bounds=row.getBoundingClientRect();if(bounds.bottom<0||bounds.top>window.innerHeight)return;
    const center=bounds.left+bounds.width/2;
    for(const card of $$(".movie-card",row)){
      const rect=card.getBoundingClientRect(),relative=(rect.left+rect.width/2-center)/Math.max(1,bounds.width/2);
      const clamped=Math.max(-1.35,Math.min(1.35,relative));
      card.style.setProperty("--spatial-yaw",(clamped*-12).toFixed(2)+"deg");
      card.style.setProperty("--spatial-z",(Math.max(0,1-Math.abs(clamped))*17).toFixed(1)+"px");
      card.style.setProperty("--spatial-scale",(1-Math.min(1,Math.abs(clamped))*.035).toFixed(3));
    }
  }
  function scheduleSpatialUpdate(){
    if(spatialFrame)return;
    spatialFrame=requestAnimationFrame(()=>{
      spatialFrame=0;
      if(!spatialEnabled){
        $$(".movie-card").forEach(card=>["--spatial-yaw","--spatial-z","--spatial-scale"].forEach(key=>card.style.removeProperty(key)));
        return;
      }
      $$(".movie-row,.movie-grid").forEach(updateSpatialContainer);
    });
  }
  document.addEventListener("scroll",scheduleSpatialUpdate,{passive:true,capture:true});
  window.addEventListener("resize",scheduleSpatialUpdate,{passive:true});

  // Reveal cards on entry; MutationObserver covers filters, account sync, and feed refreshes.
  if("IntersectionObserver" in window&&!reducedMotion){
    const revealObserver=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add("cinematic-visible");revealObserver.unobserve(entry.target);}
    },{rootMargin:"0px 0px -36px 0px",threshold:.04});
    const reveal=node=>{
      if(!(node instanceof Element))return;
      if(node.matches(".movie-card")&&!node.classList.contains("cinematic-reveal")){node.classList.add("cinematic-reveal");revealObserver.observe(node);}
      $$(".movie-card",node).forEach(card=>{
        if(!card.classList.contains("cinematic-reveal")){card.classList.add("cinematic-reveal");revealObserver.observe(card);}
      });
    };
    reveal(content);
    const observer=new MutationObserver(records=>{
      for(const record of records)for(const node of record.addedNodes)reveal(node);
      scheduleSpatialUpdate();
    });
    observer.observe(content,{childList:true,subtree:true});
  }

  if(effectsEnabled&&!coarsePointer){
    document.addEventListener("pointermove",event=>{
      const button=event.target.closest?.(".primary-button,.secondary-button,.cinematic-toggle,.mini-action");
      if(!button||event.pointerType!=="mouse")return;
      const rect=button.getBoundingClientRect(),x=(event.clientX-(rect.left+rect.width/2))/Math.max(1,rect.width),y=(event.clientY-(rect.top+rect.height/2))/Math.max(1,rect.height);
      button.style.setProperty("--mag-x",(x*3).toFixed(1)+"px");button.style.setProperty("--mag-y",(y*3).toFixed(1)+"px");button.classList.add("cinematic-magnetic");
    },{passive:true});
    document.addEventListener("pointerout",event=>{
      const button=event.target.closest?.(".cinematic-magnetic");
      if(button&&!button.contains(event.relatedTarget)){
        button.style.removeProperty("--mag-x");button.style.removeProperty("--mag-y");button.classList.remove("cinematic-magnetic");
      }
    },{passive:true});
  }

  window.StoryspaceCinematic=Object.freeze({
    get spatialEnabled(){return spatialEnabled;},get effectsEnabled(){return effectsEnabled;},
    nextFeatured(){showHero(heroIndex+1);},previousFeatured(){showHero(heroIndex-1);}
  });
  scheduleSpatialUpdate();
})();