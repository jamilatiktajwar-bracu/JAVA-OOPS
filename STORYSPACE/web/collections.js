(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const MAX_COLLECTIONS = 20, MAX_ITEMS = 100;
  const profileId = () => String(typeof activeLocalProfile !== "undefined" && activeLocalProfile?.id || "guest");
  const storageKey = () => "storyspace.collections.v1." + encodeURIComponent(profileId());
  const catalog = () => typeof movies !== "undefined" && Array.isArray(movies) ? movies : [];
  const identify = movie => String(movie?.apiId || movie?.id);
  const cleanName = value => String(value || "").replace(/\s+/g, " ").trim().slice(0, 28);
  const themes = ["violet", "ocean", "ember", "forest"];
  const themeLabel = theme => ({violet:"Nebula",ocean:"Ocean",ember:"Ember",forest:"Forest"}[theme] || "Nebula");
  let collections = [];
  let activeCollectionId = null;

  function readCollections() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey()) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.slice(0, MAX_COLLECTIONS).flatMap((item, index) => {
        if (!item || typeof item !== "object") return [];
        const name = cleanName(item.name);
        if (!name) return [];
        const items = Array.isArray(item.items)
          ? [...new Set(item.items.filter(x => typeof x === "string" || typeof x === "number").map(String))].slice(0, MAX_ITEMS)
          : [];
        return [{
          id: String(item.id || ("collection-" + index)),
          name,
          theme: themes.includes(item.theme) ? item.theme : themes[index % themes.length],
          createdAt: Math.max(0, Number(item.createdAt) || Date.now()),
          items
        }];
      });
    } catch { return []; }
  }

  function saveCollections() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(collections.slice(0, MAX_COLLECTIONS)));
      document.dispatchEvent(new CustomEvent("storyspace:collections-updated", {
        detail: { profileId: profileId(), count: collections.length }
      }));
      return true;
    } catch {
      if (typeof showToast === "function") showToast("Collections could not be saved on this device");
      return false;
    }
  }

  function newCollectionId() {
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "collection-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function exportBackup() {
    const backup = {
      format: "storyspace-collections",
      version: 1,
      exportedAt: new Date().toISOString(),
      collections: collections.map(item => ({
        name: item.name,
        theme: item.theme,
        items: [...item.items]
      }))
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "storyspace-collections-" + new Date().toISOString().slice(0,10) + ".json";
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return backup.collections.length;
  }

  async function importBackup(file) {
    if (!file) return {ok:false,reason:"Choose a backup file first"};
    if (file.size > 1024 * 1024) return {ok:false,reason:"Backup file is too large (1 MB maximum)"};
    let parsed;
    try { parsed = JSON.parse(await file.text()); }
    catch { return {ok:false,reason:"That file is not valid JSON"}; }
    if (!parsed || parsed.format !== "storyspace-collections" || parsed.version !== 1 || !Array.isArray(parsed.collections)) {
      return {ok:false,reason:"This is not a supported Storyspace Collections backup"};
    }
    let skipped = Math.max(0, parsed.collections.length - 100);
    const incoming = parsed.collections.slice(0, 100).flatMap((item, index) => {
      if (!item || typeof item !== "object" || !Array.isArray(item.items)) { skipped++; return []; }
      const name = cleanName(item.name);
      if (!name) { skipped++; return []; }
      const uniqueItems = [...new Set(item.items.filter(id => typeof id === "string" || typeof id === "number").map(String))];
      const items = uniqueItems.slice(0, MAX_ITEMS);
      skipped += uniqueItems.length - items.length;
      return [{
        name,
        theme: themes.includes(item.theme) ? item.theme : themes[index % themes.length],
        items
      }];
    });
    if (!incoming.length) return {ok:false,reason:"No usable collections were found in that backup"};
    if (!confirm("Import " + incoming.length + " collection(s)? Matching names will merge stories; existing shelves will not be replaced.")) {
      return {ok:false,reason:"Import cancelled"};
    }
    let added = 0, merged = 0;
    incoming.forEach(item => {
      const existing = collections.find(c => c.name.toLowerCase() === item.name.toLowerCase());
      if (existing) {
        const combined = [...new Set([...existing.items, ...item.items])];
        existing.items = combined.slice(0, MAX_ITEMS);
        skipped += combined.length - existing.items.length;
        merged++;
        return;
      }
      if (collections.length >= MAX_COLLECTIONS) { skipped++; return; }
      collections.push({id:newCollectionId(),name:item.name,theme:item.theme,createdAt:Date.now(),items:item.items});
      added++;
    });
    if (!added && !merged) return {ok:false,reason:"All collections were skipped because your shelves are full"};
    if (!saveCollections()) return {ok:false,reason:"Could not save imported collections"};
    render();
    return {ok:true,added,merged,skipped};
  }

  function setBackupStatus(message) {
    const status = $("collectionBackupStatus");
    if (status) status.textContent = message;
  }

  function movieFor(id) {
    return catalog().find(movie => identify(movie) === String(id));
  }

  function renderCollectionGrid() {
    const grid = $("collectionsGrid");
    if (!grid) return;
    grid.replaceChildren();
    const empty = $("collectionsEmpty");
    if (empty) empty.hidden = collections.length !== 0;
    if (!collections.length) {
      grid.hidden = true;
      return;
    }
    grid.hidden = false;
    collections.forEach(collection => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "collection-tile";
      button.dataset.theme = collection.theme;
      button.setAttribute("aria-label", "Open collection " + collection.name + ", " + collection.items.length + " stories");
      const mosaic = document.createElement("span");
      mosaic.className = "collection-mosaic";
      const samples = collection.items.slice(0, 4).map(movieFor).filter(Boolean);
      if (!samples.length) {
        const emptyMark = document.createElement("span");
        emptyMark.className = "collection-mosaic-empty";
        emptyMark.textContent = "✧";
        mosaic.append(emptyMark);
      } else {
        samples.forEach(movie => {
          const image = document.createElement("img");
          image.alt = "";
          image.loading = "lazy";
          image.decoding = "async";
          image.src = typeof art === "function" ? art(movie) : String(movie.poster || "");
          image.onerror = () => image.remove();
          mosaic.append(image);
        });
      }
      const copy = document.createElement("span");
      copy.className = "collection-tile-copy";
      const title = document.createElement("strong");
      title.textContent = collection.name;
      const meta = document.createElement("small");
      meta.textContent = collection.items.length + (collection.items.length === 1 ? " story" : " stories") + " · " + themeLabel(collection.theme);
      copy.append(title, meta);
      const arrow = document.createElement("span");
      arrow.className = "collection-tile-arrow";
      arrow.textContent = "↗";
      button.append(mosaic, copy, arrow);
      button.addEventListener("click", () => openCollection(collection.id));
      grid.append(button);
    });
  }

  function renderCollectionDetail() {
    const detail = $("collectionDetail"), grid = $("collectionsGrid");
    if (!detail || !grid) return;
    const collection = collections.find(item => item.id === activeCollectionId);
    if (!collection) {
      detail.hidden = true;
      grid.hidden = collections.length === 0;
      activeCollectionId = null;
      return;
    }
    detail.hidden = false;
    grid.hidden = true;
    $("collectionDetailTitle").textContent = collection.name;
    $("collectionDetailCount").textContent = collection.items.length + (collection.items.length === 1 ? " saved story" : " saved stories");
    const row = $("collectionItemsRow");
    row.replaceChildren();
    const found = collection.items.map(movieFor).filter(movie => movie && (typeof kidsSafe !== "function" || kidsSafe(movie)));\n    const sortMode = collection.sort || "custom";\n    if (sortMode === "title") found.sort((a,b) => String(a.title||a.name||"").localeCompare(String(b.title||b.name||""),undefined,{sensitivity:"base"}));\n    else if (sortMode === "recent") found.sort((a,b) => collection.items.indexOf(identify(b))-collection.items.indexOf(identify(a)));\n    else if (sortMode === "rating") found.sort((a,b) => (Number(b.rating||b.voteAverage||b.score)||0)-(Number(a.rating||a.voteAverage||a.score)||0));\n    else if (sortMode === "year") found.sort((a,b) => (Number(b.year||b.releaseYear)||0)-(Number(a.year||a.releaseYear)||0));\n    const sortControl = $("collectionSort");\n    if (sortControl) sortControl.value = sortMode;
    if (!found.length) {
      const empty = document.createElement("p");
      empty.className = "collection-detail-empty";
      empty.textContent = collection.items.length
        ? "These saved stories are not available in the current catalog or are hidden by Kids Mode."
        : "This collection is waiting for its first story. Open a story and add it here.";
      row.append(empty);
      return;
    }
    found.forEach(movie => {
      const tile = typeof card === "function" ? card(movie) : document.createElement("article");
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "collection-card-remove";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", "Remove " + (movie.title || movie.name || "story") + " from " + collection.name);
      remove.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        collection.items = collection.items.filter(id => id !== identify(movie));
        saveCollections();
        render();
        if (typeof showToast === "function") showToast("Removed from " + collection.name);
      });
      tile.append(remove);
      row.append(tile);
    });
  }

  function openCollection(id) {
    activeCollectionId = String(id);
    renderCollectionGrid();
    renderCollectionDetail();
    $("collectionDetail")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    $("collectionDetailTitle")?.focus({preventScroll:true});
  }

  function render() {
    renderCollectionGrid();
    renderCollectionDetail();
  }

  function createCollection(name, theme) {
    const clean = cleanName(name);
    if (!clean) return {ok:false, reason:"Enter a collection name"};
    if (collections.length >= MAX_COLLECTIONS) return {ok:false, reason:"You can create up to " + MAX_COLLECTIONS + " collections"};
    if (collections.some(item => item.name.toLowerCase() === clean.toLowerCase())) return {ok:false, reason:"A collection with that name already exists"};
    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "collection-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    collections.unshift({id, name:clean, theme:themes.includes(theme)?theme:"violet", createdAt:Date.now(), items:[]});
    saveCollections();
    render();
    return {ok:true, id};
  }

  function renderModalChoices(movie) {
    const panel = $("modalCollectionsPanel"), choices = $("modalCollectionsChoices");
    if (!panel || !choices) return;
    choices.replaceChildren();
    if (!movie) {
      const note = document.createElement("p");
      note.textContent = "Open a story first to save it to a collection.";
      choices.append(note);
      return;
    }
    if (!collections.length) {
      const note = document.createElement("p");
      note.textContent = "Create your first collection, then return here to save this story.";
      const create = document.createElement("button");
      create.type = "button";
      create.className = "secondary-button collection-inline-create";
      create.textContent = "＋ Create collection";
      create.addEventListener("click", () => {
        $("modalClose").click();
        $("collectionCreateForm").hidden = false;
        $("collectionsSection").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});
        $("collectionName").focus();
      });
      choices.append(note, create);
      return;
    }
    collections.forEach(collection => {
      const included = collection.items.includes(identify(movie));
      const button = document.createElement("button");
      button.type = "button";
      button.className = "collection-choice" + (included ? " is-selected" : "");
      button.setAttribute("aria-pressed", String(included));
      const icon = document.createElement("span");
      icon.textContent = included ? "✓" : "＋";
      const name = document.createElement("span");
      name.textContent = collection.name;
      const count = document.createElement("small");
      count.textContent = collection.items.length + " saved";
      button.append(icon, name, count);
      button.addEventListener("click", () => {
        if (included) collection.items = collection.items.filter(id => id !== identify(movie));
        else if (collection.items.length < MAX_ITEMS) collection.items.unshift(identify(movie));
        else if (typeof showToast === "function") showToast("A collection can hold up to " + MAX_ITEMS + " stories");
        saveCollections();
        render();
        renderModalChoices(movie);
        if (typeof showToast === "function") showToast(included ? "Removed from " + collection.name : "Added to " + collection.name);
      });
      choices.append(button);
    });
  }

  $("collectionExport")?.addEventListener("click", () => {
    const count = exportBackup();
    setBackupStatus("Backup downloaded · " + count + (count === 1 ? " collection" : " collections"));
    if (typeof showToast === "function") showToast("Collections backup downloaded");
  });
  $("collectionImportToggle")?.addEventListener("click", () => $("collectionImportFile")?.click());
  $("collectionImportFile")?.addEventListener("change", async event => {
    const file = event.target.files?.[0];
    const result = await importBackup(file);
    if (result.ok) {
      setBackupStatus("Imported " + result.added + " new · merged " + result.merged + " · skipped " + result.skipped + " items/collections (limits or invalid data)");
      if (typeof showToast === "function") showToast("Collections backup restored");
    } else setBackupStatus(result.reason);
    event.target.value = "";
  });

  const createToggle = $("collectionCreateToggle");
  const createForm = $("collectionCreateForm");
  const createName = $("collectionName");
  createToggle?.addEventListener("click", () => {
    createForm.hidden = !createForm.hidden;
    if (!createForm.hidden) createName.focus();
  });
  $("collectionCreateCancel")?.addEventListener("click", () => {
    createForm.reset();
    createForm.hidden = true;
    $("collectionCreateStatus").textContent = "";
  });
  createForm?.addEventListener("submit", event => {
    event.preventDefault();
    const result = createCollection(createName.value, $("collectionTheme").value);
    $("collectionCreateStatus").textContent = result.ok ? "Collection created. Open a story to add it." : result.reason;
    if (result.ok) {
      createForm.reset();
      createForm.hidden = true;
      $("collectionCreateStatus").textContent = "";
      if (typeof showToast === "function") showToast("Created " + cleanName(collections[0].name));
    }
  });

  $("collectionSort")?.addEventListener("change", event => {\n    const collection = collections.find(item => item.id === activeCollectionId);\n    if (!collection) return;\n    collection.sort = ["custom","title","recent","rating","year"].includes(event.target.value) ? event.target.value : "custom";\n    saveCollections(); render();\n  });\n  $("collectionRename")?.addEventListener("click", () => {\n    const collection = collections.find(item => item.id === activeCollectionId);\n    if (!collection) return;\n    const next = cleanName(prompt("Rename collection", collection.name));\n    if (!next || next === collection.name) return;\n    if (collections.some(item => item.id !== collection.id && item.name.toLowerCase() === next.toLowerCase())) {\n      if (typeof showToast === "function") showToast("A collection with that name already exists");\n      return;\n    }\n    collection.name = next; saveCollections(); render();\n    $("collectionDetailTitle")?.focus({preventScroll:true});\n    if (typeof showToast === "function") showToast("Collection renamed");\n  });\n\n  $("collectionBack")?.addEventListener("click", () => {
    activeCollectionId = null;
    render();
    ($("collectionsGrid").querySelector(".collection-tile") || $("collectionCreateToggle"))?.focus();
  });
  $("collectionDelete")?.addEventListener("click", () => {
    const collection = collections.find(item => item.id === activeCollectionId);
    if (!collection || !confirm("Delete the collection “" + collection.name + "”? Stories will stay in My Universe.")) return;
    collections = collections.filter(item => item.id !== activeCollectionId);
    activeCollectionId = null;
    saveCollections();
    render();
    ($("collectionsGrid").querySelector(".collection-tile") || $("collectionCreateToggle"))?.focus();
    if (typeof showToast === "function") showToast("Collection deleted");
  });

  $("modalCollectionsToggle")?.addEventListener("click", () => {
    const panel = $("modalCollectionsPanel"), button = $("modalCollectionsToggle");
    panel.hidden = !panel.hidden;
    button.setAttribute("aria-expanded", String(!panel.hidden));
    if (!panel.hidden) renderModalChoices(typeof state !== "undefined" ? state.selected : null);
  });

  document.addEventListener("storyspace:profile-updated", () => {
    collections = readCollections();
    activeCollectionId = null;
    render();
  });
  document.addEventListener("storyspace:catalog-updated", render);
  window.addEventListener("storage", event => {
    if (event.key === storageKey()) {
      collections = readCollections();
      render();
    }
  });

  collections = readCollections();
  render();
  window.storyspaceCollections = Object.freeze({
    list: () => collections.map(item => ({...item, items:[...item.items]})),
    create: createCollection,
    exportBackup,
    importBackup,
    add(collectionId, movieId) {
      const collection = collections.find(item => item.id === String(collectionId));
      if (!collection || collection.items.includes(String(movieId)) || collection.items.length >= MAX_ITEMS) return false;
      collection.items.unshift(String(movieId)); saveCollections(); render(); return true;
    },
    remove(collectionId, movieId) {
      const collection = collections.find(item => item.id === String(collectionId));
      if (!collection) return false;
      collection.items = collection.items.filter(id => id !== String(movieId)); saveCollections(); render(); return true;
    },
    open: openCollection
  });
})();
