(() => {
  "use strict";
  function init(){
    const root=document.getElementById("discoveryStudio"),catalog=()=>typeof movies!=="undefined"&&Array.isArray(movies)?movies:[];
    if(!root||document.getElementById("quickDiscovery"))return;
    const panel=document.createElement("section");panel.id="quickDiscovery";panel.className="quick-discovery";
    const head=document.createElement("div"),heading=document.createElement("h3"),copy=document.createElement("p");
    head.className="quick-discovery-head";heading.textContent="Quick picks";copy.textContent="Jump straight into a collection, or explore a genre you love.";head.append(heading,copy);
    const buttons=document.createElement("div");buttons.className="quick-discovery-buttons";
    const actions=[["Fresh arrivals",()=>showView("new")],["Highest rated",()=>showView("top")],["Continue watching",()=>{showView("continue");window.storyspaceResumeHub?.open()}],["My Universe",()=>showView("mylist")],["Demo Cinema",()=>showView("demoCinema")],["Watch Later",()=>window.storyspaceWatchLater?.open()]];
    actions.forEach(([label,action])=>{const button=document.createElement("button");button.type="button";button.className="quick-discovery-chip";button.textContent=label;button.addEventListener("click",action);buttons.append(button)});
    const genreTitle=document.createElement("div");genreTitle.className="quick-discovery-subtitle";genreTitle.textContent="Explore by genre";
    const genreButtons=document.createElement("div");genreButtons.className="quick-discovery-buttons";
    const taste=document.createElement("div");taste.className="quick-discovery-taste";
    function refresh(){genreButtons.replaceChildren();const genres=[...new Set(catalog().flatMap(movie=>String(movie.genre||movie.genres||"").split(/[;,/]/).map(x=>x.trim()).filter(Boolean)))].sort();genres.forEach(genre=>{const button=document.createElement("button");button.type="button";button.className="quick-discovery-chip genre";button.textContent=genre;button.onclick=()=>{const input=document.getElementById("searchInput");if(input){input.value="genre:"+genre.toLowerCase();if(typeof search==="function")search(input.value);input.focus()}};genreButtons.append(button)});const savedIds=typeof state!=="undefined"&&state.list?state.list:new Set(),saved=catalog().filter(movie=>savedIds.has(movie.id)),counts=new Map();saved.forEach(movie=>String(movie.genre||movie.genres||"").split(/[;,/]/).map(g=>g.trim()).filter(Boolean).forEach(g=>counts.set(g,(counts.get(g)||0)+1)));const favourite=[...counts].sort((a,b)=>b[1]-a[1])[0];taste.textContent=saved.length?"Your Universe: "+saved.length+" saved stories"+(favourite?" · Favourite genre: "+favourite[0]:""):"Save stories to My Universe and your personal taste summary will appear here"}
    panel.append(head,buttons,genreTitle,genreButtons,taste);root.append(panel);refresh();document.addEventListener("storyspace:catalog-updated",refresh);document.addEventListener("storyspace:interest-updated",refresh);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();