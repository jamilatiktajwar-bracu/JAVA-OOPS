(() => {
  const commands=[
    {name:"Go to Discover",keywords:"home browse discover",run:()=>window.showView?.("home")},
    {name:"Open My Universe",keywords:"my list watchlist saved",run:()=>window.showView?.("mylist")},
    {name:"Search titles",keywords:"find movie search",run:()=>{document.querySelector("#searchBox")?.classList.add("open");document.querySelector("#searchInput")?.focus()}},
    {name:"Open Profiles",keywords:"switch profile user",run:()=>document.querySelector("#openProfileManager")?.click()||document.querySelector("#profileButton")?.click()},
    {name:"Preferences",keywords:"settings personalization",run:()=>document.querySelector("#openPreferences")?.click()},
    {name:"Upload media",keywords:"upload video community",run:()=>{const hub=document.querySelector("#mediaHubBackdrop");if(hub)hub.hidden=false}},
    {name:"Scroll to top",keywords:"top page beginning",run:()=>window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})}
  ];
  let panel,input,list,opened=false;
  function ensure(){
    if(panel)return;
    panel=document.createElement("section");panel.className="command-palette";panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.setAttribute("aria-label","Quick actions");
    panel.innerHTML='<div class="command-palette-card"><div class="command-palette-head"><span>STORYSPACE QUICK ACTIONS</span><kbd>ESC</kbd></div><input class="command-palette-input" type="search" placeholder="Type a command…" aria-label="Filter commands" autocomplete="off"><div class="command-palette-list" role="listbox"></div><p class="command-palette-hint">↑ ↓ navigate · Enter run · Alt+K open</p></div>';
    document.body.append(panel);input=panel.querySelector("input");list=panel.querySelector(".command-palette-list");
    input.addEventListener("input",render);input.addEventListener("keydown",e=>{if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();const rows=[...list.querySelectorAll("button")];const i=rows.indexOf(document.activeElement);rows[(i+(e.key==="ArrowDown"?1:-1)+rows.length)%rows.length]?.focus()}if(e.key==="Enter")document.activeElement.closest("button")?.click()});
    panel.addEventListener("click",e=>{if(e.target===panel)close()});
  }
  function render(){const q=input.value.trim().toLowerCase();const filtered=commands.filter(c=>(c.name+" "+c.keywords).toLowerCase().includes(q));list.innerHTML="";filtered.forEach((c,i)=>{const btn=document.createElement("button");btn.className="command-palette-item";btn.setAttribute("role","option");btn.textContent=c.name;btn.addEventListener("click",()=>{close();c.run()});list.append(btn)});if(!filtered.length){const empty=document.createElement("p");empty.className="command-palette-empty";empty.textContent="No matching action";list.append(empty)}}
  function open(){ensure();panel.hidden=false;opened=true;input.value="";render();input.focus()}
  function close(){if(!panel)return;panel.hidden=true;opened=false}
  window.StoryspaceCommands={open,close,isOpen:()=>opened};
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&opened){e.preventDefault();close();return}if(e.altKey&&!e.ctrlKey&&!e.metaKey&&e.key.toLowerCase()==="k"){e.preventDefault();open();return}if(e.key==="?"&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!(e.target instanceof HTMLElement&&(e.target.isContentEditable||["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)))){e.preventDefault();open()}});
})();