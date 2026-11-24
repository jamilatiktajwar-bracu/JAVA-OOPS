
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

    const results = element("div", "discovery-results");
    results.setAttribute("aria-live", "polite");
    results.setAttribute("aria-label", "Recommended stories");

    root.append(top, moodBar, results);
    const welcome = document.getElementById("welcomeLine");
    if (welcome) welcome.insertAdjacentElement("afterend", root);
    else content.prepend(root);

    let activeMood = "feel-good";
    try {
      const savedMood = localStorage.getItem("storyspace.discoveryMood");
      if (moods.some(mood => mood.id === savedMood)) activeMood = savedMood;
    } catch {}

    function rankedPool() {
      const mood = moods.find(item => item.id === activeMood) || moods[0];
      return catalog.filter(Boolean).map((movie, index) => {
        const details = [
          movie.title, movie.name, movie.genre, movie.genres, movie.moods,
          movie.description, movie.synopsis, movie.type, movie.format
        ].join(" ").toLowerCase();
        const hits = mood.words.reduce((sum, word) => sum + (details.includes(word) ? 1 : 0), 0);
        const rating = Number(movie.score || movie.communityScore || 0);
        const yearBoost = Number(movie.year || movie.releaseYear || 0) >= 2025 ? 0.25 : 0;
        const originalBoost = movie.original ? 0.2 : 0;
        const savedPenalty = typeof state !== "undefined" && state.list && state.list.has(movie.id) ? 0.35 : 0;
        return { movie, score: hits * 4 + rating + yearBoost + originalBoost - savedPenalty, index };
      }).sort((a, b) => b.score - a.score || a.index - b.index);
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
      body.append(meta);

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
      actions.append(details, save);
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
        }
      });
      return article;
    }

    function render(shuffleMix) {
      const ranked = rankedPool();
      let selected = ranked.slice(0, Math.min(12, ranked.length));
      if (shuffleMix && selected.length > 1) {
        for (let i = selected.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [selected[i], selected[j]] = [selected[j], selected[i]];
        }
      }
      const chosen = selected.slice(0, 4);
      results.replaceChildren();
      if (!chosen.length) {
        results.append(element("p", "discovery-empty", "No stories match this mood yet. Try another feeling."));
      } else {
        chosen.forEach(item => results.append(buildCard(item.movie)));
      }
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
    syncVisibility();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
