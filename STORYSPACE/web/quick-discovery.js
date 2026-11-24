(() => {
  "use strict";
  function init() {
    const root = document.getElementById("discoveryStudio");
    const catalog = typeof movies !== "undefined" && Array.isArray(movies) ? movies : [];
    if (!root || !catalog.length || document.getElementById("quickDiscovery")) return;
    const panel = document.createElement("div");
    panel.id = "quickDiscovery";
    panel.className = "quick-discovery";
    const head = document.createElement("div");
    head.className = "quick-discovery-head";
    const heading = document.createElement("h3");
    heading.textContent = "Quick picks";
    const copy = document.createElement("p");
    copy.textContent = "Jump straight into a collection, or explore a genre you love.";
    head.append(heading, copy);
    const buttons = document.createElement("div");
    buttons.className = "quick-discovery-buttons";
    const actions = [
      ["Fresh arrivals", () => showView("new")],
      ["Highest rated", () => showView("top")],
      ["Continue watching", () => showView("continue")],
      ["My Universe", () => showView("mylist")]
    ];
    actions.forEach(([label, action]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quick-discovery-chip";
      button.textContent = label;
      button.addEventListener("click", action);
      buttons.append(button);
    });
    const genres = [...new Set(catalog.flatMap(movie => String(movie.genre || movie.genres || "").split(/[;,/]/).map(x => x.trim()).filter(Boolean)))].sort();
    const genreTitle = document.createElement("div");
    genreTitle.className = "quick-discovery-subtitle";
    genreTitle.textContent = "Explore by genre";
    const genreButtons = document.createElement("div");
    genreButtons.className = "quick-discovery-buttons";
    genres.forEach(genre => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quick-discovery-chip genre";
      button.textContent = genre;
      button.addEventListener("click", () => {
        const input = document.getElementById("searchInput");
        if (input) {
          input.value = "genre:" + genre.toLowerCase();
          input.dispatchEvent(new Event("input", { bubbles: true }));
          if (typeof search === "function") search(input.value);
          else if (typeof legacySearch === "function") legacySearch(input.value);
        }
      });
      genreButtons.append(button);
    });
    const taste = document.createElement("div");
    taste.className = "quick-discovery-taste";
    const savedIds = typeof state !== "undefined" && state.list ? state.list : new Set();
    const saved = catalog.filter(movie => savedIds.has(movie.id));
    const counts = new Map();
    saved.forEach(movie => String(movie.genre || movie.genres || "").split(/[;,/]/).map(g => g.trim()).filter(Boolean).forEach(g => counts.set(g, (counts.get(g) || 0) + 1)));
    const favourite = [...counts].sort((a,b)=>b[1]-a[1])[0];
    taste.textContent = saved.length ? "Your Universe: " + saved.length + " saved stories" + (favourite ? " · Favourite genre: " + favourite[0] : "") : "Save stories to My Universe and your personal taste summary will appear here.";
    panel.append(head, buttons, genreTitle, genreButtons, taste);
    root.append(panel);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
