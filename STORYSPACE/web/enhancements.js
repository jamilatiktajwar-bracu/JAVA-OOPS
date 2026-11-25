
(() => {
  "use strict";

  const moods = [
    { id: "feel-good", label: "Feel-good", words: ["family", "romance", "comedy", "adventure", "hope", "comfort"] },
    { id: "edge", label: "Edge of your seat", words: ["thriller", "crime", "horror", "action", "mystery", "suspense"] },
    { id: "wonder", label: "Wonder & escape", words: ["sci-fi", "science fiction", "fantasy", "adventure", "space", "curious"] },
    { id: "emotions", label: "Big emotions", words: ["drama", "romance", "family", "emotional", "heart", "memory"] },
    { id: "surprise", label: "Surprise me", words: [] }
  ];

  const element = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  };

  function init() {
    const catalog = typeof movies !== "undefined" && Array.isArray(movies) ? movies : [];
    const content = document.querySelector(".content-area");
    if (!catalog.length || !content || document.getElementById("discoveryStudio")) return;

    const root = element("section", "discovery-studio");
    root.id = "discoveryStudio";
    root.setAttribute("aria-labelledby", "discoveryTitle");

    const top = element("div", "discovery-top");
    const heading = element("div");
    heading.append(
      element("span", "discovery-kicker", "THE DISCOVERY STUDIO"),
      element("h2", "discovery-title", "Find your next favourite"),
      element("p", "discovery-copy", "Choose the feeling you want tonight. Your mix reshapes around the mood and the stories in your library.")
    );
    const shuffle = element("button", "discovery-shuffle", "↻  Shuffle my mix");
    shuffle.type = "button";
    shuffle.setAttribute("aria-label", "Shuffle recommended stories");
    top.append(heading, shuffle);

    const moodBar = element("div", "discovery-moods");
    moodBar.setAttribute("role", "group");
    moodBar.setAttribute("aria-label", "Choose a viewing mood");

    const tastePanel=element("section","taste-panel");
    tastePanel.setAttribute("aria-label","Personalized taste controls");
    const tasteHeading=element("div","taste-heading");
    tasteHeading.append(element("span","taste-label","YOUR TASTE PROFILE"),element("strong","taste-title","Tune your mix"));
    const balanceGroup=element("div","taste-balance");
    balanceGroup.setAttribute("role","group");balanceGroup.setAttribute("aria-label","Recommendation balance");
    const modes=[{id:"comfort",label:"Comfort picks",desc:"More familiar stories"},{id:"balanced",label:"Balanced",desc:"Your taste plus variety"},{id:"explore",label:"Explore",desc:"More new genres and discoveries"}];
    const tasteInsight=element("p","taste-insight","Your mix learns from preferences and viewing activity.");
    const tasteGenres=element("div","taste-genres");
    modes.forEach(mode=>{const btn=element("button","taste-mode",mode.label);btn.type="button";btn.dataset.balance=mode.id;btn.setAttribute("aria-label",mode.desc);btn.addEventListener("click",()=>{if(typeof personalized==="undefined")return;personalized.preferences=Object.assign({},personalized.preferences,{balance:mode.id});try{localStorage.setItem("storyspace.preferences",JSON.stringify(personalized.preferences))}catch{}if(typeof persistLocalProfiles==="function")persistLocalProfiles();document.dispatchEvent(new CustomEvent("storyspace:interest-updated",{detail:{balance:mode.id}}));render(false)});balanceGroup.append(btn)});
    tastePanel.append(tasteHeading,balanceGroup,tasteInsight,tasteGenres);
    const restore=element("button","discovery-restore","↺ Show hidden stories");restore.type="button";restore.hidden=true;restore.setAttribute("aria-label","Restore stories hidden from recommendations");
    const results = element("div", "discovery-results");
    results.setAttribute("aria-live", "polite");
    results.setAttribute("aria-label", "Recommended stories");

    root.append(top, moodBar, tastePanel, restore, results);
    const welcome = document.getElementById("welcomeLine");
    if (welcome) welcome.insertAdjacentElement("afterend", root);
    else content.prepend(root);

    let activeMood = "feel-good";
    const dismissed=new Set();
    try{const saved=JSON.parse(localStorage.getItem("storyspace.discoveryDismissed")||"[]");if(Array.isArray(saved))saved.slice(0,300).forEach(id=>{if(typeof id==="string"||typeof id==="number")dismissed.add(String(id))})}catch{}
    function persistDismissed(){try{localStorage.setItem("storyspace.discoveryDismissed",JSON.stringify([...dismissed].slice(0,300)))}catch{}}
    try {
      const savedMood = localStorage.getItem("storyspace.discoveryMood");
      if (moods.some(mood => mood.id === savedMood)) activeMood = savedMood;
    } catch {}

    const tokens = value => String(value || "").split(/[,|]/).map(v => v.trim().toLowerCase()).filter(Boolean);
    function userTaste() {
      const prefs = typeof personalized !== "undefined" ? personalized.preferences || {} : {};
      const history = typeof personalized !== "undefined" && Array.isArray(personalized.history) ? personalized.history : [];
      const historyGenres = new Map();
      history.forEach(entry => {
        const title = catalog.find(m => String(m.id) === String(entry.id) || String(m.apiId || "") === String(entry.id));
        if (!title) return;
        const weight = Math.min(3, Math.max(1, Number(entry.count) || 1));
        tokens(title.genre || title.genres).forEach(g => historyGenres.set(g, (historyGenres.get(g) || 0) + weight));
      });
      return { genres: tokens(prefs.genres), moods: tokens(prefs.moods), languages: tokens(prefs.languages), balance: prefs.balance || "balanced", historyGenres };
    }
    function explain(movie, taste, mood) {
      const genres = tokens(movie.genre || movie.genres);
      const preferred = taste.genres.find(g => genres.includes(g));
      if (preferred) return "Because you like " + preferred;
      const historyMatch = genres.find(g => (taste.historyGenres.get(g) || 0) > 0);
      if (historyMatch) return "Similar to stories you explored";
      if (mood.words.some(word => String(movie.description || movie.synopsis || "").toLowerCase().includes(word))) return "Fits your chosen mood";
      if (taste.balance === "explore") return "A fresh discovery";
      return "A highly rated story";
    }
    function rankedPool(shuffleMix = false) {
      const mood = moods.find(item => item.id === activeMood) || moods[0];
      const taste = userTaste();
      return catalog.filter(Boolean).map((movie, index) => {
        const details = [movie.title, movie.name, movie.genre, movie.genres, movie.moods, movie.description, movie.synopsis, movie.type, movie.format].join(" ").toLowerCase();
        const moodHits = mood.words.reduce((sum, word) => sum + (details.includes(word) ? 1 : 0), 0);
        const genres = tokens(movie.genre || movie.genres), movieMoods = tokens(movie.moods);
        const preferenceHits = taste.genres.filter(g => genres.includes(g)).length;
        const preferenceMoodHits = taste.moods.filter(m => movieMoods.includes(m) || details.includes(m)).length;
        const languageMatch = taste.languages.some(l => String(movie.language || "English").toLowerCase().includes(l));
        const historyAffinity = genres.reduce((sum, g) => sum + Math.min(2.2, (taste.historyGenres.get(g) || 0) * 0.28), 0);
        const historyItem = typeof personalized !== "undefined" && personalized.history?.find(h => String(h.id) === String(movie.id));
        const familiarBoost = taste.balance === "comfort" && historyItem ? 1.1 : 0;
        const exploreBoost = taste.balance === "explore" && !historyItem && !preferenceHits ? 1.6 : 0;
        const savedPenalty = typeof state !== "undefined" && state.list?.has(movie.id) ? 0.2 : 0;
        const rating = Number(movie.score || movie.communityScore || 0);
        const yearBoost = Number(movie.year || movie.releaseYear || 0) >= 2025 ? 0.25 : 0;
        const originalBoost = movie.original ? 0.2 : 0;
        const jitter = shuffleMix ? Math.random() * 1.7 : 0;
        const score = rating * 0.55 + moodHits * 2.4 + preferenceHits * 4.8 + preferenceMoodHits * 2.2 + (languageMatch ? 1.1 : 0) + historyAffinity + familiarBoost + exploreBoost + yearBoost + originalBoost - savedPenalty + jitter;
        return { movie, score, index, reason: explain(movie, taste, mood) };
      }).sort((a, b) => b.score - a.score || a.index - b.index);
    }
    function selectDiverse(ranked, count = 4) {
      const selected = [], genreCounts = new Map(), typeCounts = new Map(), remaining = ranked.slice();
      while (selected.length < count && remaining.length) {
        let bestIndex = 0, bestValue = -Infinity;
        remaining.forEach((item, index) => {
          const genres = tokens(item.movie.genre || item.movie.genres), type = String(item.movie.type || item.movie.format || "other").toLowerCase();
          const repeatedGenre = genres.reduce((sum, genre) => sum + (genreCounts.get(genre) || 0), 0);
          const repeatedType = typeCounts.get(type) || 0;
          const diversityBonus = (genres.length && repeatedGenre === 0 ? 2.5 : 0) - repeatedGenre * 1.25 - repeatedType * 0.3;
          const value = item.score + diversityBonus;
          if (value > bestValue) { bestValue = value; bestIndex = index; }
        });
        const chosen = remaining.splice(bestIndex, 1)[0];
        selected.push(chosen);
        tokens(chosen.movie.genre || chosen.movie.genres).forEach(g => genreCounts.set(g, (genreCounts.get(g) || 0) + 1));
        const type = String(chosen.movie.type || chosen.movie.format || "other").toLowerCase();
        typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
      }
      return selected;
    }

    function imageUrl(movie) {
      const raw = movie.poster || movie.posterUrl || "";
      try {
        const url = new URL(raw, location.href);
        return url.protocol === "https:" || url.origin === location.origin ? url.href : "";
      } catch {
        return "";
      }
    }

    function buildCard(movie) {
      const title = String(movie.title || movie.name || "Untitled story");
      const article = element("article", "mix-card");
      article.tabIndex = 0;
      article.setAttribute("role", "button");
      article.setAttribute("aria-label", "Explore " + title);

      const poster = element("div", "mix-poster");
      const src = imageUrl(movie);
      if (src) {
        const image = element("img");
        image.src = src;
        image.alt = title + " poster";
        image.loading = "lazy";
        image.decoding = "async";
        image.onerror = () => { image.remove(); };
        poster.append(image);
      }
      const score = element("span", "mix-score", "✦ " + (Number(movie.score || movie.communityScore) ? Number(movie.score || movie.communityScore).toFixed(1) : "New"));
      poster.append(score);

      const body = element("div", "mix-card-body");
      body.append(element("div", "mix-card-title", title));
      const meta = element("div", "mix-card-meta");
      meta.append(
        element("span", "", String(movie.year || movie.releaseYear || "New")),
        element("span", "", "·"),
        element("span", "mix-card-genre", String(movie.genre || movie.genres || "Discover"))
      );
      body.append(meta, element("p", "mix-reason", movie.__storyspaceReason || "Picked for your mix"));

      const actions = element("div", "mix-card-actions");
      const details = element("button", "discovery-action primary", "Explore");
      details.type = "button";
      details.dataset.mixAction = "details";
      details.setAttribute("aria-label", "Explore " + title);
      const saved = typeof state !== "undefined" && state.list && state.list.has(movie.id);
      const save = element("button", "discovery-action", saved ? "✓ Saved" : "+ My Universe");
      save.type = "button";
      save.dataset.mixAction = "save";
      save.setAttribute("aria-label", (saved ? "Remove " : "Save ") + title + (saved ? " from" : " to") + " My Universe");
      const hide=element("button","discovery-action discovery-dismiss","Not for me");hide.type="button";hide.dataset.mixAction="dismiss";hide.setAttribute("aria-label","Hide "+title+" from future recommendations");
      const watchId=String(movie.apiId||movie.id);const watchLater=window.storyspaceWatchLater;const watchButton=element("button","discovery-action",watchLater&&watchLater.has(watchId)?"✓ Watch later":"＋ Watch later");watchButton.type="button";watchButton.dataset.mixAction="watch-later";watchButton.setAttribute("aria-pressed",String(Boolean(watchLater&&watchLater.has(watchId))));watchButton.setAttribute("aria-label",(watchLater&&watchLater.has(watchId)?"Remove ":"Add ")+title+" "+(watchLater&&watchLater.has(watchId)?"from":"to")+" Watch later");
      actions.append(details, save, hide, watchButton);
      body.append(actions);
      article.append(poster, body);

      article.addEventListener("click", event => {
        if (event.target.closest("button")) return;
        if (typeof openDetails === "function") openDetails(movie);
      });
      article.addEventListener("keydown", event => {
        if (event.target !== article) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (typeof openDetails === "function") openDetails(movie);
        }
      });
      actions.addEventListener("click", event => {
        const button = event.target.closest("[data-mix-action]");
        if (!button) return;
        event.stopPropagation();
        if (button.dataset.mixAction === "details" && typeof openDetails === "function") {
          openDetails(movie);
        } else if (button.dataset.mixAction === "save" && typeof toggleList === "function") {
          toggleList(movie);
          render(false);
        } else if(button.dataset.mixAction==="dismiss") { dismissed.add(String(movie.apiId||movie.id));persistDismissed();render(false); } else if(button.dataset.mixAction==="watch-later"&&window.storyspaceWatchLater){const added=window.storyspaceWatchLater.toggle(String(movie.apiId||movie.id));button.textContent=added?"✓ Watch later":"＋ Watch later";button.setAttribute("aria-pressed",String(added));render(false)} else if(button.dataset.mixAction==="watch-later"&&window.storyspaceWatchLater){const added=window.storyspaceWatchLater.toggle(String(movie.apiId||movie.id));button.textContent=added?"✓ Watch later":"＋ Watch later";button.setAttribute("aria-pressed",String(added));render(false)}
      });
      return article;
    }

    function syncTastePanel(){const taste=userTaste(),mode=taste.balance||"balanced";balanceGroup.querySelectorAll("[data-balance]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.balance===mode)));const historyGenres=[...taste.historyGenres.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);const combined=[...new Set([...taste.genres.slice(0,3),...historyGenres])].slice(0,4);tasteGenres.replaceChildren();if(combined.length)combined.forEach(g=>tasteGenres.append(element("span","taste-chip",g)));else tasteGenres.append(element("span","taste-chip","Explore to build your taste"));const history=typeof personalized!=="undefined"&&Array.isArray(personalized.history)?personalized.history.reduce((sum,item)=>sum+(Number(item.count)||1),0):0;tasteInsight.textContent=history?history+" interaction"+(history===1?"":"s")+" learned · "+(combined.length?"Leaning toward "+combined.join(" · "):"Your taste profile is still growing"):"Your profile is new. Choose a balance to shape your mix";}
    function render(shuffleMix) {
      const ranked = rankedPool(shuffleMix).filter(item=>!dismissed.has(String(item.movie.apiId||item.movie.id)));
      const chosen = selectDiverse(ranked, 4).map(item => Object.assign({}, item.movie, { __storyspaceReason: item.reason }));
      results.replaceChildren();
      if (!chosen.length) {
        results.append(element("p", "discovery-empty", dismissed.size?"You hid these stories. Restore them or choose another mood.":"No stories match this mood yet. Try another feeling."));
      } else {
        chosen.forEach(movie => results.append(buildCard(movie)));
      }
      restore.hidden=dismissed.size===0;
      restore.hidden=dismissed.size===0;
      moodBar.querySelectorAll(".discovery-mood").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.mood === activeMood));
      });
    }

    moods.forEach(mood => {
      const button = element("button", "discovery-mood", mood.label);
      button.type = "button";
      button.dataset.mood = mood.id;
      button.setAttribute("aria-pressed", String(mood.id === activeMood));
      button.addEventListener("click", () => {
        activeMood = mood.id;
        try { localStorage.setItem("storyspace.discoveryMood", activeMood); } catch {}
        render(false);
      });
      moodBar.append(button);
    });

    shuffle.addEventListener("click", () => render(true));
    restore.addEventListener("click",()=>{dismissed.clear();persistDismissed();render(false)});
    restore.addEventListener("click",()=>{dismissed.clear();persistDismissed();render(false)});

    function syncVisibility() {
      const currentView = typeof state !== "undefined" ? state.view : "home";
      const query = document.getElementById("searchInput")?.value?.trim();
      root.hidden = currentView !== "home" || Boolean(query);
    }

    document.addEventListener("click", event => {
      if (event.target.closest("[data-view]")) queueMicrotask(syncVisibility);
    });
    document.getElementById("searchInput")?.addEventListener("input", syncVisibility);
    document.getElementById("clearSearch")?.addEventListener("click", () => queueMicrotask(syncVisibility));
    render(false);
    document.addEventListener("storyspace:interest-updated",()=>render(false));
    document.addEventListener("storyspace:profile-updated",()=>render(false));
    syncVisibility();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
