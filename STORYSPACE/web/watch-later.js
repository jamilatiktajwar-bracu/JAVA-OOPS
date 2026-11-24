(() => {
  "use strict";
  const KEY = "storyspace.watchLater.v1";
  const safeRead = () => {
    try { const data = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(data) ? data.filter(x => x && (typeof x.id === "string" || typeof x.id === "number")).slice(0, 500) : []; }
    catch { return []; }
  };
  const save = items => { try { localStorage.setItem(KEY, JSON.stringify(items.slice(0, 500))); } catch {} };
  const catalog = () => typeof movies !== "undefined" && Array.isArray(movies) ? movies : [];
  const identify = movie => String(movie.apiId || movie.id);
  function init() {
    if (!document.querySelector(".content-area") || document.getElementById("storyspaceWatchLater")) return;
    const items = safeRead();
    const root = document.createElement("section"); root.id = "storyspaceWatchLater"; root.className = "watch-later-panel"; root.hidden = true;
    root.innerHTML = '<div class="watch-later-head"><div><span class="watch-later-kicker">YOUR PERSONAL QUEUE</span><h2>Watch later</h2><p>Save stories for another time. Your list stays on this device.</p></div><button type="button" class="watch-later-close" aria-label="Close Watch later">×</button></div><div class="watch-later-list" aria-live="polite"></div>';
    document.querySelector(".content-area").prepend(root);
    const list = root.querySelector(".watch-later-list");
    function render() {
      list.replaceChildren();
      const available = catalog();
      const matched = items.map(saved => available.find(m => identify(m) === String(saved.id))).filter(Boolean);
      if (!matched.length) { const empty = document.createElement("p"); empty.className = "watch-later-empty"; empty.textContent = items.length ? "Saved titles are not in the current catalog. They remain saved and will appear when available." : "Your queue is empty. Add stories from Discovery Studio."; list.append(empty); return; }
      matched.forEach(movie => {
        const card = document.createElement("article"); card.className = "watch-later-item";
        const title = document.createElement("strong"); title.textContent = movie.title || movie.name || "Untitled";
        const meta = document.createElement("span"); meta.textContent = [movie.year || movie.releaseYear, movie.genre || movie.genres].filter(Boolean).join(" · ");
        const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "Remove"; remove.setAttribute("aria-label", "Remove " + title.textContent + " from Watch later");
        remove.addEventListener("click", () => { const id = identify(movie); const index = items.findIndex(x => String(x.id) === id); if(index >= 0) items.splice(index,1); save(items); render(); });
        const play = document.createElement("button"); play.type = "button"; play.textContent = "Explore"; play.addEventListener("click", () => { if(typeof openDetails === "function") openDetails(movie); });
        card.append(title,meta,play,remove); list.append(card);
      });
    }
    function open() { root.hidden = false; render(); root.scrollIntoView({behavior:"smooth",block:"start"}); }
    function close() { root.hidden = true; }
    root.querySelector(".watch-later-close").addEventListener("click",close);
    document.addEventListener("click", event => {
      const add = event.target.closest("[data-storyspace-watch-add]");
      if(add) { event.preventDefault(); const id = add.dataset.storyspaceWatchAdd; if(!items.some(x=>String(x.id)===id)) { items.unshift({id,at:Date.now()}); save(items); add.textContent="✓ Watch later"; add.setAttribute("aria-pressed","true"); } return; }
      const openButton = event.target.closest("[data-storyspace-watch-open]");
      if(openButton) { event.preventDefault(); open(); }
      const nav = event.target.closest('[data-view="watchlater"]');
      if(nav) { event.preventDefault(); open(); }
    });
    document.addEventListener("keydown", event => { if(event.key==="Escape"&&!root.hidden) close(); });
    window.storyspaceWatchLater = {open,close,add(id){id=String(id);if(!items.some(x=>String(x.id)===id)){items.unshift({id,at:Date.now()});save(items);}render();},has(id){return items.some(x=>String(x.id)===String(id));},list:()=>items.map(x=>({...x}))};
    render();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();