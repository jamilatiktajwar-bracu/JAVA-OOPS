(() => {
  "use strict";
  const $=id=>document.getElementById(id),MAX=500;
  const profileKey=()=>String(typeof activeLocalProfile!=="undefined"&&activeLocalProfile?.id||"guest");
  const key=()=> "storyspace.watchLater.v1."+profileKey();
  const safeRead=()=>{try{const data=JSON.parse(localStorage.getItem(key())||"[]");return Array.isArray(data)?data.filter(x=>x&&(typeof x.id==="string"||typeof x.id==="number")).slice(0,MAX):[]}catch{return[]}};
  let items=safeRead(),root=$("storyspaceWatchLater"),list=$("watchLaterList"),openButton=$("watchLaterOpen"),countNode=$("watchLaterCount");
  if(!root||!list||!openButton)return;
  const catalog=()=>typeof movies!=="undefined"&&Array.isArray(movies)?movies:[];
  const identify=m=>String(m.apiId||m.id);
  const save=()=>{try{localStorage.setItem(key(),JSON.stringify(items.slice(0,MAX)))}catch{}};
  function render(){list.replaceChildren();const matched=items.map(saved=>catalog().find(m=>identify(m)===String(saved.id))).filter(Boolean);countNode.textContent=String(items.length);openButton.setAttribute("aria-expanded",String(!root.hidden));openButton.classList.toggle("is-active",!root.hidden);
    if(!matched.length){const empty=document.createElement("p");empty.className="watch-later-empty";empty.textContent=items.length?"Saved stories aren't in the current catalog. They remain saved for later.":"Your list is empty. Save a story from Discovery Studio.";list.append(empty);return}
    matched.forEach(movie=>{const card=document.createElement("article");card.className="watch-later-item";const poster=document.createElement("img");poster.className="watch-later-poster";poster.alt="";poster.loading="lazy";poster.decoding="async";poster.src=movie.poster||"";poster.onerror=()=>poster.remove();const copy=document.createElement("div"),title=document.createElement("strong"),meta=document.createElement("span");title.textContent=movie.title||movie.name||"Untitled";meta.textContent=[movie.year||movie.releaseYear,movie.genre||movie.genres].filter(Boolean).join(" · ");copy.append(title,meta);const actions=document.createElement("div");actions.className="watch-later-actions";const explore=document.createElement("button");explore.type="button";explore.textContent="Explore";explore.setAttribute("aria-label","Explore "+title.textContent);explore.onclick=()=>{if(typeof openDetails==="function")openDetails(movie)};const remove=document.createElement("button");remove.type="button";remove.textContent="Remove";remove.setAttribute("aria-label","Remove "+title.textContent+" from Watch later");remove.onclick=()=>{items=items.filter(x=>String(x.id)!==identify(movie));save();render()};actions.append(explore,remove);card.append(poster,copy,actions);list.append(card)});
  }
  function open(){root.hidden=false;render();openButton.setAttribute("aria-expanded","true");root.scrollIntoView({behavior:"smooth",block:"start"})}
  function close(){root.hidden=true;openButton.setAttribute("aria-expanded","false")}
  function add(id){id=String(id);if(items.some(x=>String(x.id)===id))return false;if(items.length>=MAX){if(typeof showToast==="function")showToast("Watch Later is full · 500 items");return false}items.unshift({id,at:Date.now()});save();render();return true}
  openButton.onclick=()=>root.hidden?open():close();$("watchLaterClose").onclick=close;
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!root.hidden)close()});
  document.addEventListener("storyspace:profile-updated",()=>{items=safeRead();render();if(!root.hidden)openButton.setAttribute("aria-expanded","true")});
  window.storyspaceWatchLater={open,close,add,remove(id){items=items.filter(x=>String(x.id)!==String(id));save();render()},has(id){return items.some(x=>String(x.id)===String(id))},list(){return items.map(x=>({...x}))},toggle(id){if(this.has(id)){this.remove(id);return false}return this.add(id)}};
  render();
})();