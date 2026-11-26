(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const MAX_COLLECTIONS = 20, MAX_ITEMS = 100;
  const profileId = () => String(typeof activeLocalProfile !== "undefined" && activeLocalProfile?.id || "guest");
  const storageKey = () => "storyspace.collections.v1." + encodeURIComponent(profileId());
  const catalog = () => typeof movies !== "undefined" && Array.isArray(movies) ? movies : [];
  const identify = movie => String(movie?.apiId || movie?.id);
  const cleanName = value => String(value || "").replace(/\s+/g, " ").trim().slice(0, 28);
  const cleanDescription = value => String(value || "").replace(/\s+/g, " ").trim().slice(0, 72);
  const themes = ["violet", "ocean", "ember", "forest"];
  const coverIcons = ["✧","🎬","🍿","🌙","❤️","⚡","🧭","🌿","🔥","🪐","👑","🎭"];
  const validIcon = value => coverIcons.includes(value) ? value : "✧";
  const themeLabel = theme => ({violet:"Nebula",ocean:"Ocean",ember:"Ember",forest:"Forest"}[theme] || "Nebula");
  let collections = [];
  let activeCollectionId = null;
  let collectionSearchQuery = "";

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
          description: cleanDescription(item.description),
          theme: themes.includes(item.theme) ? item.theme : themes[index % themes.length],
          icon: validIcon(item.icon),
          sort: ["custom","title","recent","rating","year"].includes(item.sort) ? item.sort : "custom",
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
        description: cleanDescription(item.description),
        theme: item.theme,
        icon: validIcon(item.icon),
        sort: item.sort || "custom",
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
        description: cleanDescription(item.description),
        theme: themes.includes(item.theme) ? item.theme : themes[index % themes.length],
        icon: validIcon(item.icon),
        sort: ["custom","title","recent","rating","year"].includes(item.sort) ? item.sort : "custom",
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
      collections.push({id:newCollectionId(),name:item.name,description:item.description,theme:item.theme,icon:item.icon,sort:item.sort,createdAt:Date.now(),items:item.items});
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

  function renderSmartSuggestions() {
    const host=$("smartCollectionChips");if(!host)return;host.replaceChildren();const counts=new Map();catalog().forEach(movie=>{const raw=movie.genres||movie.genre||movie.category||[];const list=Array.isArray(raw)?raw:String(raw).split(/[|,]/);list.map(x=>typeof x==="object"?x.name:x).filter(Boolean).forEach(name=>{const clean=String(name).trim();if(clean)counts.set(clean,(counts.get(clean)||0)+1)})});const genres=[...counts].filter(([,count])=>count>=2).sort((a,b)=>b[1]-a[1]).slice(0,8);if(!genres.length){host.closest("section").hidden=true;return}host.closest("section").hidden=false;genres.forEach(([genre,count])=>{const button=document.createElement("button");button.type="button";button.className="smart-collection-chip";button.textContent=genre+" · "+count;button.setAttribute("aria-label","Create collection for "+genre+", "+count+" titles");button.addEventListener("click",()=>{const matches=catalog().filter(movie=>{const raw=movie.genres||movie.genre||movie.category||[];const list=Array.isArray(raw)?raw:String(raw).split(/[|,]/);return list.some(item=>String(typeof item==="object"?item.name:item||"").trim().toLowerCase()===genre.toLowerCase())});if(!matches.length)return;let name=cleanName(genre);let suffix=2;while(collections.some(c=>c.name.toLowerCase()===name.toLowerCase()))name=cleanName(genre+" "+suffix++);const result=createCollection(name,"ocean","🎬",genre+" stories");if(result.ok){const shelf=collections.find(c=>c.id===result.id);shelf.items=matches.slice(0,MAX_ITEMS).map(identify);saveCollections();render();if(typeof showToast==="function")showToast("Created "+name+" with "+shelf.items.length+" titles")}else if(typeof showToast==="function")showToast(result.reason)});host.append(button)})
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
    collections.forEach((collection, index) => {
      const shelf = document.createElement("article");
      shelf.className = "collection-shelf-card"; shelf.draggable = true; shelf.dataset.collectionId = collection.id;
      shelf.addEventListener("dragstart", event => { event.dataTransfer?.setData("text/plain", collection.id); if(event.dataTransfer)event.dataTransfer.effectAllowed="move"; shelf.classList.add("collection-shelf-dragging"); });
      shelf.addEventListener("dragend", () => shelf.classList.remove("collection-shelf-dragging"));
      shelf.addEventListener("dragover", event => { event.preventDefault(); if(event.dataTransfer)event.dataTransfer.dropEffect="move"; shelf.classList.add("collection-shelf-over"); });
      shelf.addEventListener("dragleave", () => shelf.classList.remove("collection-shelf-over"));
      shelf.addEventListener("drop", event => { event.preventDefault(); shelf.classList.remove("collection-shelf-over"); const id=event.dataTransfer?.getData("text/plain"); const from=collections.findIndex(item=>item.id===id); if(from>=0&&from!==index)reorderCollections(from,index); });
      const button=document.createElement("button"); button.type="button"; button.className="collection-tile"; button.dataset.theme=collection.theme;
      button.setAttribute("aria-label","Open collection "+collection.name+", "+collection.items.length+" stories");
      const mosaic=document.createElement("span"); mosaic.className="collection-mosaic";
      const samples=collection.items.slice(0,4).map(movieFor).filter(Boolean);
      if(!samples.length){const mark=document.createElement("span");mark.className="collection-mosaic-empty";mark.textContent=validIcon(collection.icon);mosaic.append(mark);}
      else samples.forEach(movie=>{const image=document.createElement("img");image.alt="";image.loading="lazy";image.decoding="async";image.src=typeof art==="function"?art(movie):String(movie.poster||"");image.onerror=()=>image.remove();mosaic.append(image);});
      const badge=document.createElement("span");badge.className="collection-cover-icon";badge.textContent=validIcon(collection.icon);mosaic.append(badge);
      const copy=document.createElement("span");copy.className="collection-tile-copy";
      const title=document.createElement("strong");title.textContent=collection.name;
      const meta=document.createElement("small");meta.textContent=collection.items.length+(collection.items.length===1?" story":" stories")+" · "+themeLabel(collection.theme);
      const description=document.createElement("small");description.className="collection-tile-description";description.textContent=collection.description||"A personal shelf of stories";
      copy.append(title,meta,description);const arrow=document.createElement("span");arrow.className="collection-tile-arrow";arrow.textContent="↗";button.append(mosaic,copy,arrow);
      button.addEventListener("click",()=>openCollection(collection.id));
      const controls=document.createElement("div");controls.className="collection-shelf-controls";controls.setAttribute("aria-label","Arrange "+collection.name);
      const hint=document.createElement("span");hint.className="collection-shelf-hint";hint.textContent="Reorder shelf";
      const up=document.createElement("button");up.type="button";up.className="collection-shelf-move";up.textContent="↑";up.setAttribute("aria-label","Move "+collection.name+" earlier");up.disabled=index===0;up.addEventListener("click",()=>reorderCollections(index,index-1));
      const down=document.createElement("button");down.type="button";down.className="collection-shelf-move";down.textContent="↓";down.setAttribute("aria-label","Move "+collection.name+" later");down.disabled=index===collections.length-1;down.addEventListener("click",()=>reorderCollections(index,index+1));
      controls.append(hint,up,down);shelf.append(button,controls);grid.append(shelf);
    });
  }

  function reorderCollections(from, to) {
    if (from < 0 || to < 0 || from >= collections.length || to >= collections.length || from === to) return false;
    const activeLabel = document.activeElement?.getAttribute("aria-label");
    const [item] = collections.splice(from, 1);
    collections.splice(to, 0, item);
    saveCollections();
    renderCollectionGrid();
    if (activeLabel) {
      const target = Array.from($("collectionsGrid").querySelectorAll("button")).find(button => button.getAttribute("aria-label") === activeLabel);
      target?.focus({preventScroll:true});
    }
    return true;
  }

  function reorderVisibleItems(collection, visibleIds, from, to) {
    if (!collection || from === to || from < 0 || to < 0 || from >= visibleIds.length || to >= visibleIds.length) return false;
    const nextVisible = [...visibleIds];
    const [moved] = nextVisible.splice(from, 1);
    nextVisible.splice(to, 0, moved);
    const visibleSet = new Set(visibleIds);
    let cursor = 0;
    collection.items = collection.items.map(id => visibleSet.has(id) ? nextVisible[cursor++] : id);
    collection.sort = "custom";
    saveCollections();
    render();
    return true;
  }

  const collectionBulkSelection=new Set();let collectionBulkMode=false;
  function syncCollectionBulkToolbar(found){const toolbar=$("collectionBulkToolbar"),selected=[...collectionBulkSelection].filter(id=>found.some(m=>identify(m)===id));if(toolbar)toolbar.hidden=!collectionBulkMode;const count=$("collectionBulkCount");if(count)count.textContent=selected.length;const remove=$("collectionRemoveSelected");if(remove)remove.disabled=!selected.length;const move=$("collectionMoveSelected");if(move)move.disabled=!selected.length||!$("collectionMoveTarget")?.value;const all=$("collectionSelectAll");if(all)all.textContent=found.length&&found.every(m=>collectionBulkSelection.has(identify(m)) )?"Deselect all":"Select all";}
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
    const detailIcon = $("collectionDetailIcon");
    if (detailIcon) detailIcon.textContent = validIcon(collection.icon);
    const detailDescription = $("collectionDetailDescription");
    if (detailDescription) { detailDescription.textContent = collection.description; detailDescription.hidden = !collection.description; }
    $("collectionDetailCount").textContent = collection.items.length + (collection.items.length === 1 ? " saved story" : " saved stories");
    const row = $("collectionItemsRow");
    row.replaceChildren();
    const found = collection.items.map(movieFor).filter(movie => movie && (typeof kidsSafe !== "function" || kidsSafe(movie))).filter(movie => {const q=collectionSearchQuery.trim().toLowerCase();return !q||[movie.title,movie.name,movie.description,movie.genre,movie.genres,movie.year,movie.cast].flat().filter(Boolean).join(" ").toLowerCase().includes(q)});
    const sortMode = collection.sort || "custom";const bulkToggle=$("collectionBulkToggle");if(bulkToggle){bulkToggle.setAttribute("aria-pressed",String(collectionBulkMode));bulkToggle.textContent=collectionBulkMode?"Done selecting":"Select stories"}const moveTarget=$("collectionMoveTarget");if(moveTarget){const old=moveTarget.value;moveTarget.replaceChildren(new Option("Choose destination…",""),...collections.filter(x=>x.id!==collection.id).map(x=>new Option(x.name,x.id)));moveTarget.value=collections.some(x=>x.id===old&&x.id!==collection.id)?old:"";const moveBtn=$("collectionMoveSelected");if(moveBtn)moveBtn.disabled=!moveTarget.value||!collectionBulkSelection.size}
    if (sortMode === "title") found.sort((a,b) => String(a.title||a.name||"").localeCompare(String(b.title||b.name||""),undefined,{sensitivity:"base"}));
    else if (sortMode === "recent") found.sort((a,b) => collection.items.indexOf(identify(a))-collection.items.indexOf(identify(b)));
    else if (sortMode === "rating") found.sort((a,b) => (Number(b.rating??b.voteAverage??b.vote_average??b.score)||0)-(Number(a.rating??a.voteAverage??a.vote_average??a.score)||0));
    else if (sortMode === "year") found.sort((a,b) => (Number(String(b.year||b.releaseYear||b.release_date||"").slice(0,4))||0)-(Number(String(a.year||a.releaseYear||a.release_date||"").slice(0,4))||0));
    const sortControl = $("collectionSort");
    if (sortControl) sortControl.value = sortMode;
    syncCollectionBulkToolbar(found);
    if (!found.length) {
      const empty = document.createElement("p");
      empty.className = "collection-detail-empty";
      empty.textContent = collection.items.length
        ? "These saved stories are not available in the current catalog or are hidden by Kids Mode."
        : "This collection is waiting for its first story. Open a story and add it here.";
      row.append(empty);
      return;
    }
    found.forEach((movie, index) => {
      const tile = typeof card === "function" ? card(movie) : document.createElement("article");if(collectionBulkMode){tile.classList.toggle("collection-bulk-selected",collectionBulkSelection.has(identify(movie)));tile.addEventListener("click",event=>{if(event.target.closest("button[data-action],.collection-card-remove,.collection-order-controls"))return;event.preventDefault();event.stopPropagation();if(collectionBulkSelection.has(identify(movie)))collectionBulkSelection.delete(identify(movie));else collectionBulkSelection.add(identify(movie));renderCollectionDetail()})}
      tile.dataset.collectionItemId = identify(movie);
      tile.draggable = sortMode === "custom";
      if (sortMode === "custom") {
        tile.classList.add("collection-reorder-draggable");
        tile.addEventListener("dragstart", event => {
          event.dataTransfer?.setData("text/plain", identify(movie));
          if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
          tile.classList.add("collection-is-dragging");
        });
        tile.addEventListener("dragend", () => tile.classList.remove("collection-is-dragging"));
        tile.addEventListener("dragover", event => { event.preventDefault(); if (event.dataTransfer) event.dataTransfer.dropEffect = "move"; });
        tile.addEventListener("drop", event => {
          event.preventDefault();
          const fromId = event.dataTransfer?.getData("text/plain");
          const from = found.findIndex(item => identify(item) === fromId);
          if (from >= 0 && from !== index) reorderVisibleItems(collection, found.map(identify), from, index);
        });
        const orderControls = document.createElement("div");
        orderControls.className = "collection-order-controls";
        orderControls.setAttribute("aria-label", "Reorder " + (movie.title || movie.name || "story"));
        const moveUp = document.createElement("button");
        moveUp.type = "button";
        moveUp.className = "collection-order-button";
        moveUp.textContent = "↑";
        moveUp.setAttribute("aria-label", "Move " + (movie.title || movie.name || "story") + " earlier");
        moveUp.disabled = index === 0;
        moveUp.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); reorderVisibleItems(collection, found.map(identify), index, index - 1); });
        const moveDown = document.createElement("button");
        moveDown.type = "button";
        moveDown.className = "collection-order-button";
        moveDown.textContent = "↓";
        moveDown.setAttribute("aria-label", "Move " + (movie.title || movie.name || "story") + " later");
        moveDown.disabled = index === found.length - 1;
        moveDown.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); reorderVisibleItems(collection, found.map(identify), index, index + 1); });
        orderControls.append(moveUp, moveDown);
        tile.append(orderControls);
      }
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
    activeCollectionId = String(id);collectionSearchQuery="";if($("collectionSearch"))$("collectionSearch").value="";collectionBulkSelection.clear();collectionBulkMode=false;
    renderCollectionGrid();
    renderCollectionDetail();
    $("collectionDetail")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    $("collectionDetailTitle")?.focus({preventScroll:true});
  }

  function render() {
    renderCollectionGrid();
    renderCollectionDetail();
  }

  function createCollection(name, theme, icon, description) {
    const clean = cleanName(name);
    if (!clean) return {ok:false, reason:"Enter a collection name"};
    if (collections.length >= MAX_COLLECTIONS) return {ok:false, reason:"You can create up to " + MAX_COLLECTIONS + " collections"};
    if (collections.some(item => item.name.toLowerCase() === clean.toLowerCase())) return {ok:false, reason:"A collection with that name already exists"};
    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "collection-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    collections.unshift({id, name:clean, description:cleanDescription(description), theme:themes.includes(theme)?theme:"violet", icon:validIcon(icon), sort:"custom", createdAt:Date.now(), items:[]});
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
    const result = createCollection(createName.value, $("collectionTheme").value, $("collectionIcon").value, $("collectionDescription").value);
    $("collectionCreateStatus").textContent = result.ok ? "Collection created. Open a story to add it." : result.reason;
    if (result.ok) {
      createForm.reset();
      createForm.hidden = true;
      $("collectionCreateStatus").textContent = "";
      if (typeof showToast === "function") showToast("Created " + cleanName(collections[0].name));
    }
  });

  $("collectionBulkToggle")?.addEventListener("click",()=>{collectionBulkMode=!collectionBulkMode;if(!collectionBulkMode)collectionBulkSelection.clear();renderCollectionDetail()});$("collectionSearch")?.addEventListener("input",event=>{collectionSearchQuery=event.target.value;renderCollectionDetail()});$("collectionMoveTarget")?.addEventListener("change",()=>renderCollectionDetail());$("collectionMoveSelected")?.addEventListener("click",()=>{const source=collections.find(x=>x.id===activeCollectionId),target=collections.find(x=>x.id===$("collectionMoveTarget").value);if(!source||!target)return;const ids=[...collectionBulkSelection].filter(id=>source.items.includes(id));let moved=0;ids.forEach(id=>{if(target.items.includes(id)||target.items.length>=MAX_ITEMS)return;target.items.unshift(id);source.items=source.items.filter(item=>item!==id);moved++});collectionBulkSelection.clear();saveCollections();render();if(typeof showToast==="function")showToast("Moved "+moved+" title"+(moved===1?"":"s")+" to "+target.name)});$("collectionDuplicate")?.addEventListener("click",()=>{const source=collections.find(x=>x.id===activeCollectionId);if(!source)return;if(collections.length>=MAX_COLLECTIONS){showToast("You reached the collection limit");return}let name=cleanName(source.name+" Copy"),suffix=2;while(collections.some(x=>x.name.toLowerCase()===name.toLowerCase()))name=cleanName(source.name+" Copy "+suffix++);const copy={...source,id:newCollectionId(),name,createdAt:Date.now(),items:[...source.items]};collections.unshift(copy);saveCollections();activeCollectionId=copy.id;render();showToast("Duplicated collection")}$("collectionSelectAll")?.addEventListener("click",()=>{const found=collections.find(x=>x.id===activeCollectionId)?.items.map(movieFor).filter(Boolean)||[];if(found.length&&found.every(m=>collectionBulkSelection.has(identify(m))))found.forEach(m=>collectionBulkSelection.delete(identify(m)));else found.forEach(m=>collectionBulkSelection.add(identify(m)));renderCollectionDetail()});$("collectionClearSelection")?.addEventListener("click",()=>{collectionBulkSelection.clear();renderCollectionDetail()});$("collectionRemoveSelected")?.addEventListener("click",()=>{const collection=collections.find(x=>x.id===activeCollectionId);if(!collection)return;const ids=[...collectionBulkSelection].filter(id=>collection.items.includes(id));if(!ids.length)return;collection.items=collection.items.filter(id=>!ids.includes(id));collectionBulkSelection.clear();saveCollections();render();if(typeof showToast==="function")showToast("Removed "+ids.length+" from "+collection.name)});
  $("collectionSort")?.addEventListener("change", event => {
    const collection = collections.find(item => item.id === activeCollectionId);
    if (!collection) return;
    collection.sort = ["custom","title","recent","rating","year"].includes(event.target.value) ? event.target.value : "custom";
    saveCollections(); render();
  });
  $("collectionRename")?.addEventListener("click", () => {
    const collection = collections.find(item => item.id === activeCollectionId);
    if (!collection) return;
    const next = cleanName(prompt("Rename collection", collection.name));
    if (!next || next === collection.name) return;
    if (collections.some(item => item.id !== collection.id && item.name.toLowerCase() === next.toLowerCase())) {
      if (typeof showToast === "function") showToast("A collection with that name already exists");
      return;
    }
    collection.name = next; saveCollections(); render();
    $("collectionDetailTitle")?.focus({preventScroll:true});
    if (typeof showToast === "function") showToast("Collection renamed");
  });

  $("collectionBack")?.addEventListener("click", () => {
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
    bulkAdd(collectionId,movieIds) { const collection=collections.find(item=>item.id===String(collectionId));if(!collection||!Array.isArray(movieIds))return {ok:false,added:0};let added=0;for(const id of movieIds.map(String)){if(collection.items.includes(id))continue;if(collection.items.length>=MAX_ITEMS)break;collection.items.unshift(id);added++;}if(added){saveCollections();render()}return {ok:true,added,remaining:MAX_ITEMS-collection.items.length}; },
    open: openCollection
  });
})();
