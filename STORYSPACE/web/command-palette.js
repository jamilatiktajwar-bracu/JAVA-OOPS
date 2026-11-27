(() => {
  "use strict";
  const commands=[
    {name:"Home / Discover",keywords:"home browse discover",run:()=>nav("home")},
    {name:"Series",keywords:"tv shows episodes",run:()=>nav("series")},
    {name:"Movies",keywords:"films movie",run:()=>nav("movies")},
    {name:"Fresh Stories",keywords:"new latest",run:()=>nav("new")},
    {name:"My Universe",keywords:"watchlist saved collection",run:()=>nav("mylist")},
    {name:"Demo Cinema",keywords:"sample videos demo streams",run:()=>nav("demoCinema")},
    {name:"Continue Watching",keywords:"resume progress",run:()=>{nav("continue");window.storyspaceResumeHub?.open()}},
    {name:"Watch Later",keywords:"saved for later personal list",run:()=>window.storyspaceWatchLater?.open()},
    {name:"Smart Queue",keywords:"playlist shuffle repeat queue",run:()=>window.StoryspaceQueue?.open()},
    {name:"Search titles",keywords:"find movie search",run:()=>{document.querySelector("#searchBox")?.classList.add("open");document.querySelector("#searchInput")?.focus()}},
    {name:"Manage profiles",keywords:"switch user avatar theme",run:()=>document.querySelector("#openProfileManager")?.click()},
    {name:"Preferences",keywords:"settings personalize feed",run:()=>document.querySelector("#openPreferences")?.click()},
    {name:"Upload media",keywords:"video upload pc server",run:()=>document.querySelector("#openMediaHub")?.click()},
    {name:"Scroll to top",keywords:"top beginning page",run:()=>window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})}
  ];
  let panel,input,list,trigger,openState=false,returnFocus=null,activeIndex=-1;
  const editable=target=>target instanceof HTMLElement&&(target.isContentEditable||["INPUT","TEXTAREA","SELECT"].includes(target.tagName));
  function nav(view){if(typeof showView==="function")showView(view)}
  function ensure(){if(panel)return;panel=document.createElement("section");panel.className="command-palette";panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.setAttribute("aria-label","Quick actions");panel.id="storyspaceCommandPalette";panel.innerHTML='<div class="command-palette-card"><div class="command-palette-head"><span>STORYSPACE QUICK ACTIONS</span><button class="command-palette-close" type="button" aria-label="Close quick actions">×</button></div><input class="command-palette-input" type="search" placeholder="Type a command…" aria-label="Filter commands" autocomplete="off"><div class="command-palette-list" role="listbox" aria-label="Commands"></div><p class="command-palette-hint">↑ ↓ navigate · Enter run · Alt+K open</p></div>';document.body.append(panel);input=panel.querySelector("input");list=panel.querySelector(".command-palette-list");const closeButton=panel.querySelector(".command-palette-close");closeButton.addEventListener("click",close);input.addEventListener("input",render);input.addEventListener("keydown",e=>{
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){
      const rows=[...list.querySelectorAll("button")];if(!rows.length)return;
      e.preventDefault();const current=rows.indexOf(document.activeElement),delta=e.key==="ArrowDown"?1:-1;
      activeIndex=current<0?(delta>0?0:rows.length-1):(current+delta+rows.length)%rows.length;
      rows[activeIndex]?.focus();
    }
    if(e.key==="Enter"&&document.activeElement.closest(".command-palette-item"))document.activeElement.click();
  });panel.addEventListener("keydown",e=>{if(e.key!=="Tab")return;const focusables=[input,closeButton,...list.querySelectorAll("button")].filter(el=>!el.disabled&&!el.hidden);if(!focusables.length)return;const first=focusables[0],last=focusables[focusables.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});panel.addEventListener("click",e=>{if(e.target===panel)close()})}
  function render(){
    const query=input.value.trim().toLowerCase(),filtered=commands.filter(c=>(c.name+" "+c.keywords).toLowerCase().includes(query));
    list.replaceChildren();activeIndex=-1;
    filtered.forEach((c,index)=>{
      const button=document.createElement("button");button.className="command-palette-item";button.type="button";
      button.id="storyspaceCommand-"+index;button.setAttribute("role","option");button.setAttribute("aria-selected","false");
      button.textContent=c.name;button.onclick=()=>{close();c.run()};
      button.onfocus=()=>{activeIndex=index;button.setAttribute("aria-selected","true");list.querySelectorAll('[role="option"]').forEach(other=>{if(other!==button)other.setAttribute("aria-selected","false")})};
      list.append(button)
    });
    if(!filtered.length){const empty=document.createElement("p");empty.className="command-palette-empty";empty.setAttribute("role","status");empty.textContent="No matching action";list.append(empty)}
  }
  function open(){
    ensure();returnFocus=document.activeElement instanceof HTMLElement?document.activeElement:trigger;
    panel.hidden=false;openState=true;trigger?.setAttribute("aria-expanded","true");
    input.value="";render();input.focus();
  }
  function close(){
    if(!panel)return;panel.hidden=true;openState=false;trigger?.setAttribute("aria-expanded","false");
    if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});else trigger?.focus({preventScroll:true});
    returnFocus=null;
  }
  trigger=document.getElementById("commandPaletteOpen");trigger?.setAttribute("aria-controls","storyspaceCommandPalette");trigger?.setAttribute("aria-haspopup","dialog");trigger?.setAttribute("aria-expanded","false");trigger?.addEventListener("click",open);
  window.StoryspaceCommands={open,close,isOpen:()=>openState};
  document.addEventListener("keydown",e=>{if(openState&&e.key==="Escape"){e.preventDefault();close();return}if(e.altKey&&!e.ctrlKey&&!e.metaKey&&e.key.toLowerCase()==="k"){e.preventDefault();open();return}if(e.key==="/"&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!editable(e.target)){e.preventDefault();document.querySelector("#searchBox")?.classList.add("open");document.querySelector("#searchInput")?.focus();return}if(e.key==="?"&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!editable(e.target)){e.preventDefault();open()}});
})();