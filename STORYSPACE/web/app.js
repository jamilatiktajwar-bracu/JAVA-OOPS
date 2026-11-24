const movies=[
{id:1,title:"Signal Beyond",type:"series",year:2026,rating:"16+",duration:"2 Seasons",genre:"Sci-Fi",score:8.9,featured:true,original:true,description:"Somewhere beyond the edge of everything we know, a signal is waiting to be heard. A small crew follows it into a mystery that reshapes their idea of home.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1400&q=85",progress:0},
{id:2,title:"Lantern Protocol",type:"series",year:2025,rating:"16+",duration:"1 Season",genre:"Thriller",score:8.1,original:true,description:"A quiet night becomes a race to uncover a mystery hidden in the city's shadows.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",progress:64},
{id:3,title:"Tideglass",type:"movie",year:2024,rating:"13+",duration:"2h 08m",genre:"Adventure",score:8.4,original:true,description:"A team of ocean explorers discovers a breathtaking world—and a secret that could change everything.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=85",progress:32},
{id:4,title:"Echo Atlas",type:"series",year:2026,rating:"16+",duration:"1 Season",genre:"Mystery",score:8.7,original:true,description:"In a city where memories can be traded, a detective follows a trail that leads into her own past.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",progress:0},
{id:5,title:"Where Maps End",type:"movie",year:2025,rating:"13+",duration:"1h 54m",genre:"Drama",score:8.2,description:"Two strangers take the long road home and discover that the journey is the story they needed.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=85",progress:0},
{id:6,title:"Circuit at Dusk",type:"movie",year:2026,rating:"18+",duration:"2h 01m",genre:"Action",score:8.0,original:true,description:"One city. One night. A courier carrying a package everyone wants.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",progress:0},
{id:7,title:"Paper Constellation",type:"series",year:2025,rating:"13+",duration:"3 Seasons",genre:"Drama",score:9.1,original:true,description:"A family-run publishing house becomes the battleground for ambition, love, and legacy.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85",progress:72},
{id:8,title:"Rainlight",type:"movie",year:2024,rating:"16+",duration:"1h 48m",genre:"Romance",score:7.9,description:"On a rain-soaked island, two former friends meet again and finally say what they never could.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",progress:0},
{id:9,title:"Orbit of Glass",type:"series",year:2026,rating:"16+",duration:"1 Season",genre:"Sci-Fi",score:8.8,original:true,description:"A missing astronaut sends a signal that should be impossible to receive.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=85",progress:0},
{id:10,title:"A Stranger's Map",type:"movie",year:2025,rating:"16+",duration:"1h 42m",genre:"Thriller",score:8.3,description:"A dinner party guest knows far too much about the people who invited him.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85",progress:0},
{id:11,title:"Nocturne District",type:"series",year:2024,rating:"18+",duration:"2 Seasons",genre:"Crime",score:8.6,original:true,description:"A jazz club owner navigates the changing underworld of a city on the brink.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=85",progress:0},
{id:12,title:"Tiny North",type:"movie",year:2025,rating:"7+",duration:"1h 36m",genre:"Family",score:8.5,description:"A curious kid and a retired inventor turn an ordinary summer into something extraordinary.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1476231682828-37e571bc5bcd?auto=format&fit=crop&w=900&q=85",progress:0},
{id:13,title:"Signal Orchard",type:"series",year:2026,rating:"16+",duration:"1 Season",genre:"Action",score:8.4,original:true,description:"A covert team is activated when every emergency broadcast in the country goes silent.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",progress:0},
{id:14,title:"Root & Star",type:"movie",year:2023,rating:"13+",duration:"2h 12m",genre:"Drama",score:8.2,description:"A small-town doctor returns to the forest where his family history began.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=85",progress:0},
{id:15,title:"Neon Orchard",type:"series",year:2025,rating:"16+",duration:"2 Seasons",genre:"Music",score:8.0,original:true,description:"A group of young artists try to make their sound heard in a city that never sleeps.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",progress:0},
{id:16,title:"Hush Harbor",type:"movie",year:2024,rating:"18+",duration:"1h 58m",genre:"Horror",score:7.8,description:"A new home has a rule: never open the door after midnight.",cast:"Original story ensemble",poster:"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=85",progress:0}
];
const storage={
  get(key){try{return window.localStorage.getItem(key)}catch{return null}},
  set(key,value){try{window.localStorage.setItem(key,value);return true}catch{return false}},
  remove(key){try{window.localStorage.removeItem(key)}catch{}}
};
const readList=()=>{try{const parsed=JSON.parse(storage.get("storyspace.myUniverse")||"[5,9,12]");return new Set(Array.isArray(parsed)?parsed.filter(v=>typeof v==="number"||typeof v==="string"):[5,9,12])}catch{return new Set([5,9,12])}};
function normalizeResumePoints(raw){
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return {};
  return Object.fromEntries(Object.entries(raw).slice(0,500).flatMap(([id,value])=>{
    if(!id||id.length>128||!value||typeof value!=="object")return [];
    const currentTime=Number(value.currentTime),duration=Number(value.duration),updatedAt=Number(value.updatedAt)||0;
    if(!Number.isFinite(currentTime)||!Number.isFinite(duration)||currentTime<0||duration<=0||currentTime>=duration||duration>86400)return [];
    return [[id,{currentTime:Math.min(currentTime,duration),duration,updatedAt}]];
  }));
}
const resumePoints=(()=>{try{return normalizeResumePoints(JSON.parse(storage.get("storyspace.resumePoints")||"{}"))}catch{return {}}})();
const savedAt=(()=>{try{const raw=JSON.parse(storage.get("storyspace.savedAt")||"{}");return raw&&typeof raw==="object"?raw:{}}catch{return {}}})();
function applyResumePoint(title){
  const key=String(title.apiId||title.id),point=resumePoints[key];
  if(point&&point.currentTime<point.duration-3){
    title.progress=Math.max(1,Math.min(99,Math.round(point.currentTime/point.duration*100)));
    title.resumePoint=point.currentTime;
  }else if(point){delete resumePoints[key]}
  return title;
}
const defaultProgress=Object.fromEntries(movies.map(m=>[String(m.id),Number(m.progress)||0]));
movies.forEach(applyResumePoint);
const state={list:readList(),view:"home",search:"",selected:null,mute:true};
const $=id=>document.getElementById(id);
const escapeHTML=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
function safeAssetUrl(value){try{const u=new URL(String(value||""),location.href);if(u.protocol==="https:"||u.origin===location.origin||(u.protocol==="http:"&&["localhost","127.0.0.1"].includes(u.hostname)))return u.href}catch{}return ""}
const art=m=>safeAssetUrl(m.poster||m.posterUrl);
function safeMediaUrl(value){try{const url=new URL(String(value||""),location.href);if(url.protocol==="https:"||url.origin===location.origin)return url.href}catch{}return ""}
function persistList(){storage.set("storyspace.myUniverse",JSON.stringify([...state.list]));persistLocalProfiles()}
function showToast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove("show"),2300)}
function card(m){const title=String(m.title||m.name||"Untitled story");const c=document.createElement("article");c.className="movie-card";c.tabIndex=0;c.setAttribute("role","button");c.setAttribute("aria-label",`Open details for ${title}`);
const poster=document.createElement("div");poster.className="movie-poster";if(art(m))poster.style.backgroundImage=`url("${art(m)}")`;
const shade=document.createElement("div");shade.className="card-shade";
const top=document.createElement("div");top.className="card-topline";if(m.original){const badge=document.createElement("span");badge.className="card-badge";badge.textContent="SS";top.append(badge)}
const rating=document.createElement("span");rating.className="card-rating";rating.textContent="✦ "+(Number(m.score||m.communityScore)||"—");top.append(rating);
const name=document.createElement("div");name.className="card-title";name.textContent=title;
if(Number(m.progress)>0){const track=document.createElement("div");track.className="progress-track";const progress=document.createElement("span");progress.style.width=Math.max(0,Math.min(100,Number(m.progress)||0))+"%";track.append(progress);c.append(poster,shade,top,name,track)}else c.append(poster,shade,top,name);
const overlay=document.createElement("div");overlay.className="card-overlay";const actions=document.createElement("div");actions.className="card-actions";
const actionButton=(action,label,caption,dark=false)=>{const b=document.createElement("button");b.type="button";b.className="mini-action"+(dark?" dark":"");b.dataset.action=action;b.title=caption;b.setAttribute("aria-label",caption);b.textContent=label;actions.append(b)};
actionButton("play","▶","Open story");actionButton("list",state.list.has(m.id)?"✓":"＋","Add/remove from My Universe",true);actionButton("info","✦","Explore details",true);overlay.append(actions);c.append(overlay);
c.addEventListener("click",e=>{const b=e.target.closest("[data-action]");if(b){e.stopPropagation();const a=b.dataset.action;if(a==="play")playMovie(m);if(a==="list")toggleList(m);if(a==="info")openDetails(m)}else openDetails(m)});
c.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target===c){e.preventDefault();openDetails(m)}});return c}
function renderRow(id,items){const el=$(id);el.innerHTML="";items.forEach(m=>el.append(card(m)))}
function renderHome(){renderRow("continueRow",movies.filter(m=>m.progress>0));renderRow("trendingRow",[movies[2],movies[3],movies[8],movies[9],movies[6],movies[12],movies[10],movies[1]]);renderRow("originalsRow",movies.filter(m=>m.original));renderRow("topRow",[...movies].sort((a,b)=>b.score-a.score).slice(0,8));renderRow("mylistRow",movies.filter(m=>state.list.has(m.id)));$("mylistSection").hidden=state.view==="home"&&state.list.size===0}
function heroMovie(){return movies[0]}
function setHero(m){$("heroTitle").innerHTML=m.title.toUpperCase().replace(/\s+/g,"<br>");$("heroDescription").textContent=m.description;$("heroArt").style.backgroundImage=`url('${m.poster}')`;const meta=$("hero").querySelector(".hero-meta");meta.innerHTML=`<span class="top10">FEATURED</span><span>${m.year}</span><span class="maturity">${m.rating}</span><span>${m.duration}</span><span class="quality">4K</span>`;$("heroPlay").onclick=()=>playMovie(m);$("heroInfo").onclick=()=>openDetails(m)}
function openDetails(m){state.selected=m;$("modalArt").style.backgroundImage=`url('${m.poster}')`;$("modalArtTitle").textContent=m.title.toUpperCase();$("modalYear").textContent=m.year;$("modalMaturity").textContent=m.rating;$("modalDuration").textContent=m.duration;$("modalDescription").textContent=m.description;$("modalCast").textContent=m.cast;$("modalGenres").textContent=m.genre;$("modalPlay").onclick=()=>playMovie(m);$("modalBackdrop").hidden=false;document.body.style.overflow="hidden";$("modalClose").focus()}
function closeDetails(){$("modalBackdrop").hidden=true;document.body.style.overflow="";state.selected=null}
function playMovie(m){closeDetails();showToast(`Preview mode · ${m.title}`)}
function toggleList(m){if(state.list.has(m.id)){state.list.delete(m.id);delete savedAt[String(m.id)];showToast(`Removed ${m.title} from My Universe`)}else{state.list.add(m.id);savedAt[String(m.id)]=Date.now();showToast(`Saved ${m.title} to My Universe`)}storage.set("storyspace.savedAt",JSON.stringify(savedAt));persistList();renderHome();if(state.view==="mylist")showView("mylist")}
function legacyShowView(view){state.view=view;document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===view));document.querySelectorAll(".mood-pill").forEach(b=>b.classList.remove("active"));$("welcomeLine").hidden=view!=="home";$("moodSection").hidden=view!=="home";const homeSections=["continueSection","trendingSection","originalsSection","topSection","mylistSection"];homeSections.forEach(id=>$(id).hidden=view!=="home");$("searchResultsSection").hidden=true;const label={home:"",series:"Series",movies:"Films",new:"Fresh Stories",mylist:"My Universe",continue:"Pick up your journey",trending:"In the Orbit of Glass",originals:"Storyspace Premieres",top:"Curated for you"};if(view==="home"){homeSections.forEach(id=>$(id).hidden=id==="mylistSection"&&state.list.size===0);$("hero").hidden=false;return}$("hero").hidden=view==="mylist"||view==="continue";$("searchResultsSection").hidden=false;$("searchHeading").textContent=label[view]||"Explore";let filtered=movies;if(view==="series")filtered=movies.filter(m=>m.type==="series");if(view==="movies")filtered=movies.filter(m=>m.type==="movie");if(view==="new")filtered=movies.filter(m=>m.year>=2025);if(view==="mylist")filtered=movies.filter(m=>state.list.has(m.id));if(view==="continue")filtered=movies.filter(m=>m.progress>0);if(view==="trending")filtered=[movies[2],movies[3],movies[8],movies[9],movies[6],movies[12],movies[10],movies[1]];if(view==="originals")filtered=movies.filter(m=>m.original);if(view==="top")filtered=[...movies].sort((a,b)=>b.score-a.score);renderGrid(filtered);window.scrollTo({top:350,behavior:"smooth"})}
let browseSourceItems=[];
function renderGrid(items){
  browseSourceItems=Array.isArray(items)?items.slice():[];
  const genreControl=$("browseGenre"),sortControl=$("browseSort"),typeControl=$("browseType"),ratingControl=$("browseRating"),yearControl=$("browseYear");
  const previousGenre=genreControl?.value||"all",previousYear=yearControl?.value||"all";
  if(genreControl){
    const available=[...new Set(browseSourceItems.flatMap(m=>titleTokens(m.genre||m.genres)))].filter(Boolean).sort();
    const options=[["all","All genres"],...available.map(g=>[g,g.replace(/\b\w/g,c=>c.toUpperCase())])];
    genreControl.replaceChildren(...options.map(([value,label])=>{const o=document.createElement("option");o.value=value;o.textContent=label;return o}));
    genreControl.value=options.some(([v])=>v===previousGenre)?previousGenre:"all";
  }
  if(yearControl){const years=[...new Set(browseSourceItems.map(m=>Number(m.year||m.releaseYear)).filter(y=>y>0))].sort((a,b)=>b-a);const options=[["all","Any year"],...years.map(y=>[String(y),String(y)])];yearControl.replaceChildren(...options.map(([value,label])=>{const o=document.createElement("option");o.value=value;o.textContent=label;return o}));yearControl.value=options.some(([v])=>v===previousYear)?previousYear:"all"}
  let visible=browseSourceItems.filter(m=>(!genreControl||genreControl.value==="all"||titleTokens(m.genre||m.genres).includes(genreControl.value))&&(!typeControl||typeControl.value==="all"||String(m.type||m.format||"").toLowerCase().includes(typeControl.value))&&(!ratingControl||ratingControl.value==="all"||String(m.rating||m.ageRating||"").toLowerCase()===ratingControl.value.toLowerCase())&&(!yearControl||yearControl.value==="all"||String(m.year||m.releaseYear||"")===yearControl.value));
  const sort=sortControl?.value||"recommended";
  if(sort==="rating")visible.sort((a,b)=>Number(b.score||b.communityScore||0)-Number(a.score||a.communityScore||0));
  else if(sort==="newest")visible.sort((a,b)=>Number(b.year||b.releaseYear||0)-Number(a.year||a.releaseYear||0));
  else if(sort==="title")visible.sort((a,b)=>String(a.title||a.name||"").localeCompare(String(b.title||b.name||"")));
  else visible=ranked(visible);
  const grid=$("searchGrid");grid.replaceChildren(...visible.map(card));
  $("emptySearch").hidden=visible.length!==0;
  const count=$("browseCount");if(count)count.textContent=visible.length+" "+(visible.length===1?"story":"stories");
}
function legacySearch(q){
  state.search=String(q||"").trim();
  if(!state.search){showView(state.view==="search"?"home":state.view);return}
  state.view="search";$("hero").hidden=true;$("moodSection").hidden=true;
  ["continueSection","trendingSection","originalsSection","topSection","mylistSection"].forEach(id=>$(id).hidden=true);
  $("welcomeLine").hidden=true;$("searchResultsSection").hidden=false;
  const rawTokens=state.search.match(/"[^"]+"|\S+/g)||[];
  const filters={genre:[],mood:[],language:[],type:[]},terms=[];
  rawTokens.forEach(token=>{
    const match=token.match(/^(genre|mood|language|type):(.+)$/i);
    if(match&&filters[match[1].toLowerCase()])filters[match[1].toLowerCase()].push(match[2].replace(/^"|"$/g,"").toLowerCase());
    else terms.push(token.replace(/^"|"$/g,"").toLowerCase());
  });
  const results=ranked(movies.filter(m=>{
    const fields=[m.title,m.name,m.genre,m.genres,m.moods,m.type,m.format,m.description,m.synopsis,m.language,m.year,m.releaseYear].flat().join(" ").toLowerCase();
    const matchesTerms=terms.every(term=>fields.includes(term));
    const matchesGenre=filters.genre.every(term=>titleTokens(m.genre||m.genres).some(v=>v.includes(term)));
    const matchesMood=filters.mood.every(term=>titleTokens(m.moods).some(v=>v.includes(term)));
    const matchesLanguage=filters.language.every(term=>String(m.language||"").toLowerCase().includes(term));
    const matchesType=filters.type.every(term=>String(m.type||m.format||"").toLowerCase().includes(term));
    return matchesTerms&&matchesGenre&&matchesMood&&matchesLanguage&&matchesType;
  }));
  $("searchHeading").textContent=results.length+" stories matching “"+state.search+"”";
  renderGrid(results);
}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>{if($("searchInput").value){$("searchInput").value="";$("searchBox").classList.remove("has-value")}showView(b.dataset.view)}));
document.querySelectorAll(".see-all").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelector(".search-toggle").addEventListener("click",()=>{$("searchBox").classList.toggle("open");if($("searchBox").classList.contains("open"))$("searchInput").focus()});
$("searchInput").addEventListener("input",e=>{$("searchBox").classList.toggle("has-value",!!e.target.value);if(e.target.value)search(e.target.value);else showView("home")});
$("searchInput").addEventListener("keydown",e=>{if(e.key==="Escape"){e.target.value="";$("searchBox").classList.remove("open","has-value");showView("home")}});
$("clearSearch").addEventListener("click",()=>{$("searchInput").value="";$("searchBox").classList.remove("has-value");showView("home");$("searchInput").focus()});
document.querySelectorAll(".mood-pill").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".mood-pill").forEach(x=>x.classList.toggle("active",x===b));state.view="mood";$("hero").hidden=true;$("welcomeLine").hidden=true;$("moodSection").hidden=false;["continueSection","trendingSection","originalsSection","topSection","mylistSection"].forEach(id=>$(id).hidden=true);$("searchResultsSection").hidden=false;$("searchHeading").textContent=`Stories for: ${b.textContent}`;renderGrid(movies.filter(m=>m.genre===b.dataset.mood))}));
$("profileButton").addEventListener("click",()=> $("profileMenu").classList.toggle("open"));
$("openProfileManager").onclick=()=>{$("profileMenu").classList.remove("open");openProfileManager()};
$("profilesClose").onclick=closeProfileManager;
$("profilesBackdrop").onclick=e=>{if(e.target===$("profilesBackdrop"))closeProfileManager()};
$("profileSelect").onchange=e=>switchLocalProfile(e.target.value);
$("addProfile").onclick=()=>{const raw=$("newProfileName").value.trim();if(!raw){showToast("Enter a profile name");return}const name=profileCleanName(raw);if(localProfiles.some(p=>p.name.toLowerCase()===name.toLowerCase())){showToast("A profile with that name already exists");return}if(localProfiles.length>=8){showToast("You can keep up to 8 profiles on this device");return}const next=createLocalProfile(name);localProfiles.push(next);persistLocalProfiles();$("newProfileName").value="";switchLocalProfile(next.id)};
$("deleteProfile").onclick=()=>{if(localProfiles.length<=1){showToast("Keep at least one local profile");return}const removed=activeLocalProfile;localProfiles=localProfiles.filter(p=>p.id!==removed.id);activeLocalProfile=localProfiles[0];activeProfileId=activeLocalProfile.id;applyLocalProfile(activeLocalProfile);persistLocalProfiles();refreshProfileOptions();showToast("Deleted local profile "+removed.name)};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("profilesBackdrop").hidden)closeProfileManager()});

$("universeSort")?.addEventListener("change",renderHome);$("universeGenre")?.addEventListener("change",renderHome);
document.addEventListener("click",e=>{if(!e.target.closest(".profile-wrap"))$("profileMenu").classList.remove("open")});
$("profileMenu").querySelectorAll("[data-profile]").forEach(b=>b.addEventListener("click",()=>{
  const action=b.dataset.profile;
  if(action==="Preferences")openPreferences();
  else if(action==="Sign out")signOut();
  else if(action!=="Account")showToast(action+" · Prototype");
  $("profileMenu").classList.remove("open");
}));
$("modalClose").addEventListener("click",closeDetails);$("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))closeDetails()});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("modalBackdrop").hidden)closeDetails()});
$("heroMute").addEventListener("click",()=>{state.mute=!state.mute;$("heroMute").textContent=state.mute?"◖":"♪";showToast(state.mute?"Preview muted":"Sound toggle · preview demo")});
window.addEventListener("scroll",()=> $("topbar").classList.toggle("scrolled",window.scrollY>30));
// Initial render is performed after personalization state initializes.
// ─────────── Personal discovery engine + optional API integration ───────────
const configuredApiRoot=String(window.STORYSPACE_API_ROOT||document.querySelector('meta[name="storyspace-api-root"]')?.content||"").trim();
const nativeApiMisconfigured=window.StoryspaceNative?.native===true&&(!configuredApiRoot||!/^https:\/\//i.test(configuredApiRoot));
const API_ROOT=configuredApiRoot||(location.hostname==="localhost"||location.hostname==="127.0.0.1"?"http://localhost:8080/api":"/api");
const prefDefaults={genres:[],moods:[],languages:["English"],balance:"balanced"};
const readJson=(key,fallback)=>{try{return JSON.parse(storage.get(key))??fallback}catch{return fallback}};
function normalizePreferences(raw){
  const p=raw&&typeof raw==="object"?raw:{};
  const strings=value=>Array.isArray(value)?[...new Set(value.filter(x=>typeof x==="string").map(x=>x.trim()).filter(Boolean))].slice(0,20):[];
  const languages=strings(p.languages);
  return {genres:strings(p.genres),moods:strings(p.moods),languages:languages.length?languages:["English"],balance:["comfort","balanced","explore"].includes(p.balance)?p.balance:"balanced"};
}
function normalizeHistory(raw){
  if(!Array.isArray(raw))return [];
  return raw.filter(x=>x&&typeof x==="object"&&(typeof x.id==="string"||typeof x.id==="number")).slice(0,100).map(x=>({id:x.id,count:Math.max(1,Math.min(1000,Number(x.count)||1)),kind:String(x.kind||"view").slice(0,24),at:Number(x.at)||0}));
}
const personalized={preferences:normalizePreferences(readJson("storyspace.preferences",prefDefaults)),token:storage.get("storyspace.token")||"",account:readJson("storyspace.account",null),history:normalizeHistory(readJson("storyspace.history",[])),serverLibrary:[],serverAvailable:false,apiTitles:[],heroCycle:0};
/* Local profiles isolate device-side state (not server identities). */
const PROFILE_STORE="storyspace.localProfiles",PROFILE_ACTIVE="storyspace.activeProfile";
const profileCleanName=value=>String(value||"").trim().slice(0,32)||"Explorer";
const profileCleanId=value=>String(value||"").slice(0,48);
function createLocalProfile(name,id){return{id:profileCleanId(id||("local-"+Date.now()+"-"+Math.floor(Math.random()*10000))),name:profileCleanName(name),watchlist:[],preferences:{genres:[],moods:[],languages:["English"],balance:"balanced"},history:[],resumePoints:{},savedAt:{}}}
function profileSanitize(raw){const p=raw&&typeof raw==="object"?raw:{};return{id:profileCleanId(p.id),name:profileCleanName(p.name),watchlist:Array.isArray(p.watchlist)?p.watchlist.filter(v=>typeof v==="number"||typeof v==="string").slice(0,500):[],preferences:normalizePreferences(p.preferences),history:normalizeHistory(p.history),resumePoints:normalizeResumePoints(p.resumePoints),savedAt:p.savedAt&&typeof p.savedAt==="object"?p.savedAt:{}}}
let localProfiles=(()=>{const stored=readJson(PROFILE_STORE,null);if(Array.isArray(stored)&&stored.length)return stored.slice(0,8).map(profileSanitize).filter(p=>p.id);return[createLocalProfile("Explorer","local-default")]})();
let activeProfileId=storage.get(PROFILE_ACTIVE)||localProfiles[0].id;
let activeLocalProfile=localProfiles.find(p=>p.id===activeProfileId)||localProfiles[0];
function profileCapture(p=activeLocalProfile){if(!p)return;p.watchlist=[...state.list].slice(0,500);p.preferences=normalizePreferences(personalized.preferences);p.history=normalizeHistory(personalized.history);p.resumePoints=normalizeResumePoints(resumePoints);p.savedAt={...savedAt}}
function persistLocalProfiles(){if(!activeLocalProfile||!Array.isArray(localProfiles))return;profileCapture();storage.set(PROFILE_STORE,JSON.stringify(localProfiles.slice(0,8)));storage.set(PROFILE_ACTIVE,activeLocalProfile.id)}
function applyLocalProfile(p){activeLocalProfile=p;activeProfileId=p.id;state.list=new Set(p.watchlist);personalized.preferences=normalizePreferences(p.preferences);personalized.history=normalizeHistory(p.history);Object.keys(resumePoints).forEach(k=>delete resumePoints[k]);Object.assign(resumePoints,normalizeResumePoints(p.resumePoints));Object.keys(savedAt).forEach(k=>delete savedAt[k]);Object.assign(savedAt,p.savedAt||{});movies.forEach(m=>{m.progress=defaultProgress[String(m.id)]||0;delete m.resumePoint});movies.forEach(applyResumePoint);storage.set("storyspace.myUniverse",JSON.stringify([...state.list]));storage.set("storyspace.preferences",JSON.stringify(personalized.preferences));storage.set("storyspace.history",JSON.stringify(personalized.history));storage.set("storyspace.resumePoints",JSON.stringify(resumePoints));storage.set("storyspace.savedAt",JSON.stringify(savedAt));updateAccountUI();renderHome();setHero(chooseHero())}
function switchLocalProfile(id){const target=localProfiles.find(p=>p.id===id);if(!target||target===activeLocalProfile)return;persistLocalProfiles();applyLocalProfile(target);refreshProfileOptions();closeProfileManager();showToast("Switched to "+target.name)}
function refreshProfileOptions(){const select=$("profileSelect");if(!select)return;select.replaceChildren(...localProfiles.map(p=>{const o=document.createElement("option");o.value=p.id;o.textContent=p.name;return o}));select.value=activeLocalProfile?.id||localProfiles[0]?.id||"";const del=$("deleteProfile");if(del)del.disabled=localProfiles.length<=1}
function openProfileManager(){refreshProfileOptions();$("profilesBackdrop").hidden=false;document.body.style.overflow="hidden";$("newProfileName").focus()}
function closeProfileManager(){if($("profilesBackdrop").hidden)return;$("profilesBackdrop").hidden=true;document.body.style.overflow=""}
function initializeLocalProfiles(){if(!storage.get(PROFILE_STORE)){const starter=localProfiles[0];starter.watchlist=[...state.list];starter.preferences=normalizePreferences(personalized.preferences);starter.history=normalizeHistory(personalized.history);starter.resumePoints=normalizeResumePoints(resumePoints);starter.savedAt={...savedAt};localProfiles=[starter];activeLocalProfile=starter;activeProfileId=starter.id}activeLocalProfile=localProfiles.find(p=>p.id===activeProfileId)||localProfiles[0];applyLocalProfile(activeLocalProfile);persistLocalProfiles()}
initializeLocalProfiles();

function savePrefs(){storage.set("storyspace.preferences",JSON.stringify(personalized.preferences));persistLocalProfiles()}
function titleTokens(s){return String(s||"").split(/[,|]/).map(x=>x.trim().toLowerCase()).filter(Boolean)}
function currentDaypart(){const hour=new Date().getHours();if(hour>=5&&hour<11)return{label:"morning",moods:["Hopeful","Curious","Feel-good"]};if(hour>=11&&hour<17)return{label:"daytime",moods:["Adventure","Bold","Curious"]};if(hour>=17&&hour<22)return{label:"evening",moods:["Comforting","Emotional","Soft"]};return{label:"late-night",moods:["Tense","Mystery","Sci-Fi"]}}
function scoreTitle(m){const p=personalized.preferences;let score=(m.score||7)*.45;const gs=titleTokens(m.genre||m.genres),ms=titleTokens(m.moods);p.genres.forEach(g=>{if(gs.includes(g.toLowerCase()))score+=4});p.moods.forEach(x=>{if(ms.includes(x.toLowerCase()))score+=3.2});p.languages.forEach(l=>{if(String(m.language||"English").toLowerCase().includes(l.toLowerCase()))score+=1.5});currentDaypart().moods.forEach(x=>{if(ms.includes(x.toLowerCase()))score+=.65});const h=personalized.history.find(x=>String(x.id)===String(m.id));if(h)score+=Math.min(2.8,h.count*.35);if(m.original)score+=.35;if(p.balance==="comfort"&&h)score+=2;if(p.balance==="explore"&&!h)score+=2.3;const day=Math.floor(Date.now()/86400000);score+=((Number(m.id)||String(m.id).split("").reduce((a,c)=>a+c.charCodeAt(0),0)+day)%11)/50;return score}
function ranked(items=movies){return [...items].sort((a,b)=>scoreTitle(b)-scoreTitle(a))}
function recordInterest(m,kind){let entry=personalized.history.find(x=>String(x.id)===String(m.id));if(entry){entry.count++;entry.kind=kind;entry.at=Date.now()}else personalized.history.unshift({id:m.id,count:1,kind,at:Date.now()});personalized.history=personalized.history.slice(0,100);storage.set("storyspace.history",JSON.stringify(personalized.history));persistLocalProfiles()}
const baseRenderHome=renderHome;
function renderHome(){const ordered=ranked(movies);const cont=movies.filter(m=>m.progress>0);$("continueSection").hidden=cont.length===0;renderRow("continueRow",cont);renderRow("trendingRow",ordered.slice(0,9));renderRow("originalsRow",ranked(movies.filter(m=>m.original)).slice(0,8));renderRow("topRow",ordered.slice(0,10));const ug=$("universeGenre"),us=$("universeSort");const savedMovies=movies.filter(m=>state.list.has(m.id));if(ug){const genres=[...new Set(savedMovies.flatMap(m=>titleTokens(m.genre||m.genres)))].filter(Boolean).sort(),prev=ug.value;ug.replaceChildren(...[["all","All genres"],...genres.map(g=>[g,g])].map(([v,l])=>{const o=document.createElement("option");o.value=v;o.textContent=l;return o}));ug.value=genres.includes(prev)?prev:"all"}let universeItems=savedMovies.filter(m=>!ug||ug.value==="all"||titleTokens(m.genre||m.genres).includes(ug.value));const order=us?.value||"saved";if(order==="title")universeItems.sort((a,b)=>String(a.title||a.name).localeCompare(String(b.title||b.name)));else if(order==="rating")universeItems.sort((a,b)=>Number(b.score||b.communityScore)-Number(a.score||a.communityScore));else if(order==="year")universeItems.sort((a,b)=>Number(b.year||b.releaseYear)-Number(a.year||a.releaseYear));else universeItems.sort((a,b)=>Number(savedAt[String(b.id)]||0)-Number(savedAt[String(a.id)]||0));renderRow("mylistRow",universeItems);const uc=$("universeCount");if(uc)uc.textContent=universeItems.length+" saved";$("mylistSection").hidden=state.view==="home"&&state.list.size===0;const s=document.getElementById("personalSection");if(s){renderRow("personalRow",ordered.filter(m=>!cont.includes(m)).slice(0,8));s.hidden=false;const h=document.getElementById("personalHeading");h.textContent=personalized.preferences.genres.length? "Picked around "+personalized.preferences.genres.slice(0,2).join(" & "):"Your evolving picks";const note=document.getElementById("personalNote");note.textContent=(personalized.preferences.moods.length?"Mood signals: "+personalized.preferences.moods.slice(0,3).join(", "):"Based on what you explore, save, and choose.")+" · "+currentDaypart().label+" mix";const welcome=$("welcomeLine").querySelector("span");if(welcome)welcome.textContent="Good "+currentDaypart().label+" — stories for your state of mind."}}
function setHero(m){if(!m)return;const title=String(m.title||m.name||"Explore a new story").toUpperCase();const titleEl=$("heroTitle");titleEl.replaceChildren();title.split(/\s+/).forEach((word,index)=>{if(index)titleEl.append(document.createElement("br"));titleEl.append(document.createTextNode(word))});$("heroDescription").textContent=m.description||m.synopsis||"";const image=art(m);$("heroArt").style.backgroundImage=image?`url("${image}")`:"";const meta=$("hero").querySelector(".hero-meta");meta.replaceChildren();const addMeta=(text,className="")=>{const span=document.createElement("span");span.className=className;span.textContent=String(text??"");meta.append(span)};addMeta("FOR YOU","top10");addMeta(m.year||m.releaseYear||"");addMeta(m.rating||m.ageRating||"13+","maturity");addMeta(m.duration||m.format||"");addMeta("HD","quality");$("heroPlay").onclick=()=>playMovie(m);$("heroInfo").onclick=()=>openDetails(m);const score=document.querySelector(".hero-rating b");if(score)score.textContent=Number(m.score||m.communityScore||8.5).toFixed(1);const genre=document.querySelector(".hero-rating small");if(genre)genre.textContent=" / "+String(m.genre||m.genres?.[0]||"Story");}
function chooseHero(){const pool=ranked(movies).filter(m=>!personalized.history.slice(0,8).some(h=>String(h.id)===String(m.id)));return pool[personalized.heroCycle%Math.max(1,pool.length)]||movies[0]}
function nextHero(){personalized.heroCycle++;setHero(chooseHero());const p=document.querySelector(".hero-progress span");if(p){p.style.width=(25+(personalized.heroCycle%4)*18)+"%"}}
function openPreferences(){const back=$("preferencesBackdrop");if(!back)return;drawPreferences();back.hidden=false;document.body.style.overflow="hidden"}
function closePreferences(){if($("preferencesBackdrop").hidden)return;$("preferencesBackdrop").hidden=true;document.body.style.overflow=""}
const genreOptions=["Sci-Fi","Adventure","Drama","Thriller","Romance","Family","Mystery","Action","Comedy","Documentary","Fantasy","Crime","Music","Horror"];
const moodOptions=["Curious","Comforting","Hopeful","Tense","Reflective","Feel-good","Wonder","Emotional","Nature","Soft","Bold","Funny"];
const languageOptions=["English","Bangla","Hindi","Korean","Japanese","Arabic","Spanish"];
function chips(containerId,options,selected){const c=$(containerId);c.innerHTML="";options.forEach(v=>{const b=document.createElement("button");b.className="choice-chip"+(selected.includes(v)?" selected":"");b.type="button";b.textContent=v;b.setAttribute("aria-pressed",selected.includes(v));b.onclick=()=>{const arr=selected.includes(v)?selected.filter(x=>x!==v):selected.concat(v);selected.splice(0,selected.length,...arr);drawPreferences()};c.append(b)})}
function drawPreferences(){const p=personalized.preferences;chips("genreChoices",genreOptions,p.genres);chips("moodChoices",moodOptions,p.moods);chips("languageChoices",languageOptions,p.languages);document.querySelectorAll(".balance-choice").forEach(b=>b.classList.toggle("active",b.dataset.balance===p.balance))}
function resetPreferences(){personalized.preferences={...prefDefaults,genres:[],moods:[],languages:["English"]};drawPreferences()}
function savePreferences(){savePrefs();closePreferences();renderHome();setHero(chooseHero());if(personalized.account&&personalized.token){api("/profile/preferences",{method:"PUT",body:{displayName:personalized.account.displayName,genres:personalized.preferences.genres,moods:personalized.preferences.moods,languages:personalized.preferences.languages}}).catch(e=>showToast("Saved locally · sync unavailable"));}showToast("Your discovery feed has been tuned");}
async function api(path,options={}){
  if(nativeApiMisconfigured)throw new Error("Sign-in is not enabled in this app build yet. Configure the Storyspace HTTPS API endpoint and rebuild the app.");
  const controller=typeof AbortController==="function"?new AbortController():null;
  const timeout=controller?setTimeout(()=>controller.abort(),15000):null;
  const headers={"Content-Type":"application/json",...(personalized.token?{Authorization:"Bearer "+personalized.token}:{})};
  try{
    const res=await fetch(API_ROOT+path,{...options,headers,...(options.body?{body:JSON.stringify(options.body)}:{}),...(controller?{signal:controller.signal}:{})});
    if(res.status===204)return null;
    const raw=await res.text();let data=null;
    if(raw){try{data=JSON.parse(raw)}catch{data=raw}}
    if(!res.ok){
      const message=typeof data==="object"&&data?(data.error||data.message):null;
      const error=new Error(message||"API request failed ("+res.status+")");error.status=res.status;throw error;
    }
    return data;
  }catch(error){
    if(error.name==="AbortError")throw new Error("Request timed out. Check your connection and try again.");
    if(error instanceof TypeError)throw new Error("Unable to reach the Storyspace API. Check your connection or API server.");
    throw error;
  }finally{if(timeout)clearTimeout(timeout)}
}
function apiTitle(t){return applyResumePoint({id:t.id,title:t.name,description:t.synopsis,genre:(t.genres||[]).join(", "),moods:(t.moods||[]).join(", "),language:t.language,year:t.releaseYear,rating:t.ageRating,duration:t.format,score:t.score,poster:t.posterUrl,original:t.original,featured:t.featured,type:t.format?.toLowerCase()==="series"?"series":"movie",progress:0,apiId:t.id})}
async function loadServerCatalog(){try{const data=await api("/catalog");if(Array.isArray(data)&&data.length){personalized.serverAvailable=true;const mapped=data.map(apiTitle);personalized.apiTitles=mapped;const existing=new Set(movies.map(m=>m.title.toLowerCase()));mapped.forEach(m=>{if(!existing.has(m.title.toLowerCase()))movies.push(m)});}}catch{personalized.serverAvailable=false}}
async function syncAccount(){
  if(!personalized.token)return;
  try{
    const profile=await api("/profile");personalized.account=profile;
    storage.set("storyspace.account",JSON.stringify(profile));
    personalized.preferences=normalizePreferences({...profile,balance:personalized.preferences.balance});
    savePrefs();
    const saved=await api("/library");personalized.serverLibrary=Array.isArray(saved)?saved:[];
    personalized.serverLibrary.forEach(item=>{
      const titleId=item?.title?.id,percent=Number(item?.progressPercent)||0;
      if(titleId===undefined||percent<=0)return;
      const title=movies.find(m=>String(m.apiId||m.id)===String(titleId));
      if(title){title.remoteProgressPercent=Math.min(99,percent);title.progress=Math.max(Number(title.progress)||0,Math.min(99,percent));}
    });
    state.list=new Set(personalized.serverLibrary.map(x=>x?.title?.id).filter(x=>x!==undefined&&x!==null));
    storage.set("storyspace.myUniverse",JSON.stringify([...state.list]));
    const feed=await api("/catalog/for-you");
    if(Array.isArray(feed)&&feed.length){
      const mapped=feed.map(apiTitle);const map=new Map(mapped.map(m=>[String(m.title||"").toLowerCase(),m]));
      const existing=movies.map(m=>map.get(String(m.title||"").toLowerCase())||m);
      const known=new Set(existing.map(m=>String(m.title||"").toLowerCase()));
      movies.splice(0,movies.length,...existing,...mapped.filter(m=>!known.has(String(m.title||"").toLowerCase())));
    }
    updateAccountUI();renderHome();
  }catch(e){
    if(e.status===401||e.status===403){
      personalized.token="";personalized.account=null;storage.remove("storyspace.token");storage.remove("storyspace.account");
      updateAccountUI();showToast("Your session expired. Please sign in again.");
    }else{
      updateAccountUI();showToast("Couldn't sync right now. Your saved account stays on this device.");
    }
  }
}
function updateAccountUI(){
  const acc=personalized.account;
  const label=acc?String(acc.displayName||"U").slice(0,1).toUpperCase():"V";
  const avatar=document.querySelector(".profile-button .avatar");if(avatar)avatar.textContent=label;
  const row=document.querySelector(".profile-row");
  if(row){
    row.replaceChildren();
    const icon=document.createElement("span");icon.className="avatar";icon.textContent=label;
    const details=document.createElement("div"),name=document.createElement("b"),sub=document.createElement("small");
    name.textContent=acc?String(acc.displayName||"Explorer"):"Explorer";
    sub.textContent=acc?String(acc.email||"Signed-in account"):"Guest · saved on this device";
    details.append(name,sub);row.append(icon,details);
  }
  const action=$("accountAction");if(action)action.textContent=acc?"Sign out":"Sign in / create account";
}
function openAuth(mode="register"){if(personalized.account){signOut();return}state.authMode=mode;$("authBackdrop").hidden=false;document.body.style.overflow="hidden";drawAuthMode();$("authEmail").focus()}
function closeAuth(){ $("authBackdrop").hidden=true;document.body.style.overflow=""}
function drawAuthMode(){const mode=state.authMode||"register";document.querySelectorAll(".auth-tab").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));$("authTitle").textContent=mode==="register"?"Create your space":"Welcome back";$("authHint").textContent=(mode==="register"?"Sign up to sync your preferences and saved stories.":"Sign in to continue your personalized universe.")+(nativeApiMisconfigured?" Account sync is not configured in this app build yet; browsing and on-device preferences remain available.":""); $("authName").hidden=mode==="login";$("authName").required=mode==="register";$("authPassword").autocomplete=mode==="register"?"new-password":"current-password";$("authForm").querySelector(".auth-submit").textContent=mode==="register"?"Create account":"Sign in";$("authStatus").textContent=""}
function signOut(){personalized.token="";personalized.account=null;personalized.serverLibrary=[];storage.remove("storyspace.token");storage.remove("storyspace.account");state.list=readList();updateAccountUI();renderHome();showToast("Signed out. Guest preferences stay on this device.");}
$("preferencesClose").onclick=closePreferences;$("preferencesBackdrop").onclick=e=>{if(e.target===$("preferencesBackdrop"))closePreferences()};$("openPreferences").onclick=()=>{openPreferences();$("profileMenu").classList.remove("open")};$("savePreferences").onclick=savePreferences;$("resetPreferences").onclick=resetPreferences;document.querySelectorAll(".balance-choice").forEach(b=>b.onclick=()=>{personalized.preferences.balance=b.dataset.balance;drawPreferences()});
$("authClose").onclick=closeAuth;$("authBackdrop").onclick=e=>{if(e.target===$("authBackdrop"))closeAuth()};document.querySelectorAll(".auth-tab").forEach(b=>b.onclick=()=>{state.authMode=b.dataset.mode;drawAuthMode()});$("accountAction").onclick=()=>{ $("profileMenu").classList.remove("open");openAuth(personalized.account?"login":"register")};
$("authForm").onsubmit=async e=>{
  e.preventDefault();
  const submit=$("authForm").querySelector(".auth-submit");
  if(submit.disabled)return;
  submit.disabled=true;
  const mode=state.authMode||"register";
  const payload={email:$("authEmail").value.trim(),password:$("authPassword").value};
  if(mode==="register")payload.displayName=$("authName").value.trim();
  $("authStatus").textContent="Connecting…";
  try{
    const response=await api("/auth/"+mode,{method:"POST",body:payload});
    if(!response?.token||!response?.profile)throw new Error("The server returned an incomplete sign-in response.");
    personalized.token=response.token;personalized.account=response.profile;
    storage.set("storyspace.token",response.token);storage.set("storyspace.account",JSON.stringify(response.profile));
    $("authStatus").textContent="Account ready. Syncing your profile…";
    await syncAccount();
    if(!personalized.token||!personalized.account)throw new Error("The server could not verify this session. Please sign in again.");
    closeAuth();showToast("Welcome, "+(personalized.account.displayName||"Explorer"));openPreferences();
  }catch(err){
    const hint=window.StoryspaceNative?.native?"Configure the HTTPS API endpoint for this app build.":"Check that the Java API is running and the API URL is correct.";
    $("authStatus").textContent=(err.message||"Sign-in failed")+" · "+hint;
  }finally{
    submit.disabled=false;
  }
};
document.querySelectorAll(".mood-pill").forEach(old=>{const fresh=old.cloneNode(true);old.replaceWith(fresh);fresh.addEventListener("click",()=>{const mood=fresh.dataset.mood;state.view="mood";$("hero").hidden=true;$("welcomeLine").hidden=true;$("moodSection").hidden=false;["continueSection","trendingSection","originalsSection","topSection","mylistSection","personalSection"].forEach(id=>{const el=$(id);if(el)el.hidden=true});$("searchResultsSection").hidden=false;$("searchHeading").textContent="Stories for: "+fresh.textContent;const matches=movies.filter(m=>titleTokens(m.genre||m.genres).includes(mood.toLowerCase())||titleTokens(m.moods).includes(mood.toLowerCase()));renderGrid(ranked(matches));})});
function toggleList(m){const id=m.apiId||m.id;if(personalized.token&&m.apiId){api("/library/"+encodeURIComponent(m.apiId),{method:state.list.has(m.id)?"DELETE":"PUT"}).then(async()=>{if(state.list.has(m.id))state.list.delete(m.id);else state.list.add(m.id);persistList();await syncAccount();showToast(state.list.has(m.id)?"Added to My Universe":"Removed from My Universe")}).catch(e=>showToast(e.message));return;}if(state.list.has(m.id)){state.list.delete(m.id);showToast("Removed from My Universe")}else{state.list.add(m.id);showToast("Saved to My Universe")}persistList();recordInterest(m,"save");renderHome();if(state.view==="mylist")showView("mylist")}
function playMovie(m){recordInterest(m,"play");closeDetails();closePreferences();showToast("Preview concept · "+m.title+" · media player not connected");renderHome()}
function openDetails(m){recordInterest(m,"details");state.selected=m;const image=art(m);$("modalArt").style.backgroundImage=image?`url("${image}")`:"";$("modalArtTitle").textContent=String(m.title||m.name||"").toUpperCase();$("modalYear").textContent=m.year||m.releaseYear||"";$("modalMaturity").textContent=m.rating||m.ageRating||"13+";$("modalDuration").textContent=m.duration||m.format||"";$("modalDescription").textContent=m.description||m.synopsis||"";$("modalCast").textContent=m.cast||"Original story";$("modalGenres").textContent=m.genre||m.genres?.join(", ")||"";$("modalPlay").onclick=()=>playMovie(m);$("modalBackdrop").hidden=false;document.body.style.overflow="hidden";$("modalClose").focus()}
const profileFresh=$("profileButton").cloneNode(true);$("profileButton").replaceWith(profileFresh);profileFresh.onclick=()=> $("profileMenu").classList.toggle("open");
function showView(view){legacyShowView(view);const personal=$("personalSection");if(personal)personal.hidden=view!=="home";if(view==="home")renderHome()}
function search(q){if($("personalSection"))$("personalSection").hidden=true;legacySearch(q)}
updateAccountUI();drawPreferences();renderHome();setHero(chooseHero());
loadServerCatalog().then(()=>{renderHome();setHero(chooseHero());if(personalized.token)syncAccount()});
if(!storage.get("storyspace.onboarded")){setTimeout(()=>openPreferences(),600)}
$("savePreferences").addEventListener("click",()=>{storage.set("storyspace.onboarded","1")});
setInterval(()=>{
  const overlayOpen=["modalBackdrop","preferencesBackdrop","authBackdrop","subscriptionBackdrop","adminBackdrop","playerBackdrop"].some(id=>!$(id).hidden);
  if(overlayOpen||document.hidden||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  nextHero();
},60000);

async function openMembership(){if(!personalized.account){openAuth("register");showToast("Sign in first to manage a membership");return}$("subscriptionBackdrop").hidden=false;document.body.style.overflow="hidden";await renderMembership()}
function closeMembership(){$("subscriptionBackdrop").hidden=true;document.body.style.overflow=""}
async function renderMembership(){const grid=$("planGrid");grid.innerHTML="";try{const [plans,current]=await Promise.all([api("/subscriptions/plans"),api("/subscriptions/me")]);$("subscriptionCurrent").textContent="Current demo membership: "+current.plan+" · "+current.status;plans.forEach(p=>{const card=document.createElement("article");card.className="plan-card"+(p.id===current.plan?" current":"");card.innerHTML=`<h3>${escapeHTML(p.name)}</h3><div class="plan-price">${p.price===0?"Free":"৳"+escapeHTML(p.price)}<small> / ${escapeHTML(p.period)}</small></div><ul>${p.features.map(x=>"<li>"+escapeHTML(x)+"</li>").join("")}</ul><button class="primary-button" data-plan="${escapeHTML(p.id)}">${p.id===current.plan?"Current plan":"Choose "+escapeHTML(p.name)}</button>`;grid.append(card)});grid.querySelectorAll("[data-plan]").forEach(b=>b.onclick=async()=>{try{const r=await api("/subscriptions/activate",{method:"POST",body:{plan:b.dataset.plan}});$("subscriptionCurrent").textContent="Plan set: "+r.plan+" · "+r.status+" (demo, no charge)";await renderMembership();showToast("Demo membership updated")}catch(e){showToast(e.message)}})}catch(e){$("subscriptionCurrent").textContent=e.message;grid.innerHTML="<p>Membership demo is unavailable until the Java API is running.</p>"}}
async function cancelMembership(){try{const r=await api("/subscriptions/cancel",{method:"POST"});$("subscriptionCurrent").textContent="Demo membership: "+r.plan+" · "+r.status;showToast("Demo membership cancelled")}catch(e){showToast(e.message)}}
async function openAdmin(){if(!personalized.account||personalized.account.role!=="ADMIN"){showToast("Creator console is restricted to administrator accounts");return}$("adminBackdrop").hidden=false;document.body.style.overflow="hidden";try{const m=await api("/admin/metrics");$("adminStats").innerHTML=Object.entries(m).map(([k,v])=>`<div class="admin-stat"><small>${escapeHTML(k.toUpperCase())}</small><b>${escapeHTML(v)}</b></div>`).join("")}catch(e){$("adminStats").textContent=e.message}}
function closeAdmin(){$("adminBackdrop").hidden=true;document.body.style.overflow=""}
let playerLoadId=0,activePlayerTitle=null,lastProgressPersistAt=0,lastProgressSyncAt=0,lastRemoteProgress=0;
function refreshContinueRow(){
  const items=movies.filter(m=>Number(m.progress)>0);
  if(typeof renderRow==="function")renderRow("continueRow",items);
  const section=$("continueSection");if(section)section.hidden=items.length===0;
}
function persistPlayerProgress(force=false){
  const video=$("previewVideo"),title=activePlayerTitle;
  if(!title||!Number.isFinite(video.duration)||video.duration<=0||!Number.isFinite(video.currentTime))return;
  const currentTime=Math.max(0,Math.min(video.currentTime,video.duration));
  const key=String(title.apiId||title.id);
  if(currentTime>=video.duration-3){
    delete resumePoints[key];title.progress=0;delete title.resumePoint;
    storage.set("storyspace.resumePoints",JSON.stringify(resumePoints));refreshContinueRow();
    return;
  }
  if(currentTime<2)return;
  const percent=Math.max(1,Math.min(99,Math.round(currentTime/video.duration*100)));
  title.progress=percent;title.resumePoint=currentTime;
  resumePoints[key]={currentTime,duration:video.duration,updatedAt:Date.now()};
  const now=Date.now();
  if(force||now-lastProgressPersistAt>=8000){
    lastProgressPersistAt=now;
    storage.set("storyspace.resumePoints",JSON.stringify(resumePoints));
    persistLocalProfiles();
    refreshContinueRow();
  }
  if(personalized.token&&title.apiId&&state.list.has(title.id)&&
     (force||now-lastProgressSyncAt>=60000||Math.abs(percent-lastRemoteProgress)>=10)){
    lastProgressSyncAt=now;lastRemoteProgress=percent;
    api("/library/"+encodeURIComponent(title.apiId)+"/progress",{method:"PATCH",body:{progressPercent:percent}}).catch(()=>{});
  }
}
function updatePlayerTimeline(){
  const duration=Number.isFinite(playerVideo.duration)?playerVideo.duration:0;
  const current=Number.isFinite(playerVideo.currentTime)?playerVideo.currentTime:0;
  const seek=$("playerSeek"),currentLabel=$("playerCurrentTime"),durationLabel=$("playerDuration");
  if(currentLabel)currentLabel.textContent=formatPlayerTime(current);
  if(durationLabel)durationLabel.textContent=formatPlayerTime(duration);
  if(seek){
    seek.disabled=duration<=0;
    if(document.activeElement!==seek)seek.value=String(duration>0?Math.round(current/duration*1000):0);
    seek.setAttribute("aria-valuetext",formatPlayerTime(current)+" of "+formatPlayerTime(duration));
  }
}
function formatPlayerTime(seconds){
  const value=Math.max(0,Math.floor(Number(seconds)||0));
  const hours=Math.floor(value/3600),minutes=Math.floor(value%3600/60),secs=value%60;
  return hours?hours+":"+String(minutes).padStart(2,"0")+":"+String(secs).padStart(2,"0"):minutes+":"+String(secs).padStart(2,"0");
}
const playerVideo=$("previewVideo");
playerVideo.addEventListener("timeupdate",()=>{persistPlayerProgress(false);updatePlayerTimeline()});
playerVideo.addEventListener("durationchange",updatePlayerTimeline);
playerVideo.addEventListener("seeking",updatePlayerTimeline);
$("playerSeek").addEventListener("input",()=>{
  if(!Number.isFinite(playerVideo.duration)||playerVideo.duration<=0)return;
  const fraction=Math.max(0,Math.min(1,Number($("playerSeek").value)/1000));
  const target=fraction*playerVideo.duration;
  $("playerCurrentTime").textContent=formatPlayerTime(target);
  $("playerSeek").setAttribute("aria-valuetext",formatPlayerTime(target)+" of "+formatPlayerTime(playerVideo.duration));
});
$("playerSeek").addEventListener("change",()=>{
  if(!Number.isFinite(playerVideo.duration)||playerVideo.duration<=0)return;
  playerVideo.currentTime=(Math.max(0,Math.min(1000,Number($("playerSeek").value)))/1000)*playerVideo.duration;
  persistPlayerProgress(true);
  updatePlayerTimeline();
});
document.addEventListener("visibilitychange",()=>{if(document.hidden)persistPlayerProgress(true)});
window.addEventListener("pagehide",()=>persistPlayerProgress(true));
playerVideo.addEventListener("loadedmetadata",()=>{
  updatePlayerTimeline();
  $("playerRestart").disabled=false;
  ["skipBack","skipForward"].forEach(id=>{const control=$(id);if(control)control.disabled=false});
  $("playerPip").disabled=!playerVideo.requestPictureInPicture;
  if(!activePlayerTitle)return;
  const point=resumePoints[String(activePlayerTitle.apiId||activePlayerTitle.id)];
  const localTime=point&&point.currentTime>5?point.currentTime:0;
  const remotePercent=Number(activePlayerTitle.remoteProgressPercent)||0;
  const resumeTime=localTime||((remotePercent>5&&remotePercent<100)?playerVideo.duration*remotePercent/100:0);
  if(resumeTime>5&&playerVideo.duration>resumeTime+3){
    playerVideo.currentTime=Math.min(resumeTime,playerVideo.duration-2);
    $("playerNotice").textContent="CC0 sample preview · resuming at "+formatPlayerTime(resumeTime)+". Not the title's licensed footage.";
  }
});
$("playerRestart").addEventListener("click",()=>{
  if(!activePlayerTitle||playerVideo.readyState<1)return;
  const title=activePlayerTitle,key=String(title.apiId||title.id);
  playerVideo.currentTime=0;
  delete resumePoints[key];title.progress=0;delete title.resumePoint;
  storage.set("storyspace.resumePoints",JSON.stringify(resumePoints));persistLocalProfiles();refreshContinueRow();
  $("playerNotice").textContent="Preview restarted from the beginning. CC0 sample footage only.";
  playerVideo.play().catch(()=>{});
});
playerVideo.addEventListener("ended",()=>{
  if(!activePlayerTitle)return;
  const title=activePlayerTitle,key=String(title.apiId||title.id);
  delete resumePoints[key];title.progress=0;delete title.resumePoint;
  storage.set("storyspace.resumePoints",JSON.stringify(resumePoints));persistLocalProfiles();refreshContinueRow();
  $("playerNotice").textContent="Preview finished. Your continue-watching progress has been cleared.";
});
async function openPlayer(m){
  const request=++playerLoadId;
  activePlayerTitle=m;lastProgressPersistAt=0;lastProgressSyncAt=0;lastRemoteProgress=Number(m.progress)||0;
  closeDetails();$("playerBackdrop").hidden=false;document.body.style.overflow="hidden";
  $("playerTitle").textContent=m.title||m.name||"Preview";
  $("playerNotice").textContent="CC0 demo clip only; this is not the movie/series footage.";
  const video=$("previewVideo");$("playerRestart").disabled=true;video.pause();
  video.onerror=()=>{if(request===playerLoadId&&!$("playerBackdrop").hidden)$("playerNotice").textContent="The preview could not be loaded. Check your connection and try again."};
  video.src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
  try{
    if(personalized.token&&m.apiId){
      const data=await api("/media/"+encodeURIComponent(m.apiId)+"/preview");
      if(request!==playerLoadId||$("playerBackdrop").hidden)return;
      const preview=safeMediaUrl(data?.previewUrl);
      if(preview){video.src=preview;$("playerNotice").textContent=data.notice||"Preview-only sample video."}
      else $("playerNotice").textContent="The server returned an unsupported preview URL. Showing the sample clip instead.";
    }
  }catch(error){
    if(request!==playerLoadId||$("playerBackdrop").hidden)return;
    $("playerNotice").textContent="Preview service unavailable. Showing the sample clip instead.";
  }
  if(request!==playerLoadId||$("playerBackdrop").hidden)return;
  video.load();
  try{await video.play()}catch{$("playerNotice").textContent+=" Tap play to start the sample."}
}
function closePlayer(){persistPlayerProgress(true);$("playerSeek").disabled=true;$("playerSeek").value="0";$("playerCurrentTime").textContent="0:00";$("playerDuration").textContent="0:00";playerLoadId++;$("playerRestart").disabled=true;["skipBack","skipForward","playerPip"].forEach(id=>{const control=$(id);if(control)control.disabled=true});const v=$("previewVideo");v.pause();v.onerror=null;v.removeAttribute("src");v.load();$("playerBackdrop").hidden=true;document.body.style.overflow="";activePlayerTitle=null}
function playMovie(m){recordInterest(m,"play");closeDetails();closePreferences();openPlayer(m)}
$("subscriptionAction").onclick=()=>{$("profileMenu").classList.remove("open");openMembership()};$("subscriptionClose").onclick=closeMembership;$("subscriptionBackdrop").onclick=e=>{if(e.target===$("subscriptionBackdrop"))closeMembership()};$("cancelSubscription").onclick=cancelMembership;
$("adminAction").onclick=()=>{$("profileMenu").classList.remove("open");openAdmin()};$("adminClose").onclick=closeAdmin;$("adminBackdrop").onclick=e=>{if(e.target===$("adminBackdrop"))closeAdmin()};
$("playerClose").onclick=closePlayer;$("playerBackdrop").onclick=e=>{if(e.target===$("playerBackdrop"))closePlayer()};
$("skipBack").onclick=()=>{if(playerVideo.readyState>=1)playerVideo.currentTime=Math.max(0,playerVideo.currentTime-10)};
$("skipForward").onclick=()=>{if(playerVideo.readyState>=1)playerVideo.currentTime=Math.min(playerVideo.duration||Infinity,playerVideo.currentTime+10)};
$("playerSpeed").onchange=()=>{playerVideo.playbackRate=Number($("playerSpeed").value)||1};
$("playerPip").onclick=async()=>{try{if(document.pictureInPictureElement)await document.exitPictureInPicture();else if(playerVideo.requestPictureInPicture)await playerVideo.requestPictureInPicture();else showToast("Picture-in-picture isn't supported on this device")}catch{showToast("Picture-in-picture couldn't start")}};
$("playerFullscreen").onclick=async()=>{try{const panel=$("playerBackdrop");if(document.fullscreenElement)await document.exitFullscreen();else if(panel.requestFullscreen)await panel.requestFullscreen();else if(playerVideo.webkitEnterFullscreen)playerVideo.webkitEnterFullscreen();else showToast("Fullscreen isn't supported")}catch{showToast("Fullscreen couldn't start")}};
$("playerSpeed").value="1";
document.addEventListener("keydown",event=>{
  if($("playerBackdrop").hidden||!activePlayerTitle||event.ctrlKey||event.metaKey||event.altKey)return;
  if(event.target?.closest?.("input,textarea,select,button"))return;
  if(event.key==="ArrowLeft"){event.preventDefault();playerVideo.currentTime=Math.max(0,playerVideo.currentTime-10)}
  else if(event.key==="ArrowRight"){event.preventDefault();playerVideo.currentTime=Math.min(playerVideo.duration||Infinity,playerVideo.currentTime+10)}
  else if(event.key.toLowerCase()==="r"){event.preventDefault();$("playerRestart").click()}
  else if(event.key===" "){event.preventDefault();playerVideo.paused?playerVideo.play().catch(()=>{}):playerVideo.pause()}
});

$("adminTitleForm").onsubmit=async e=>{e.preventDefault();const f=e.currentTarget;const d=new FormData(f);const body={slug:d.get("slug"),name:d.get("name"),synopsis:d.get("synopsis"),genres:d.get("genres"),moods:d.get("moods"),language:d.get("language"),releaseYear:Number(d.get("releaseYear")),ageRating:d.get("ageRating"),format:d.get("format"),score:Number(d.get("score")),posterUrl:d.get("posterUrl"),backdropUrl:d.get("backdropUrl"),featured:d.get("featured")==="on",original:d.get("original")==="on"};$("adminStatus").textContent="Publishing…";try{const created=await api("/admin/catalog",{method:"POST",body});const m=apiTitle(created);movies.unshift(m);renderHome();$("adminStatus").textContent="Added "+m.title;f.reset();showToast("Catalog title added")}catch(err){$("adminStatus").textContent=err.message}};
function updateAccountUI(){const acc=personalized.account;const localName=activeLocalProfile?.name||"Explorer";const label=String(localName).slice(0,1).toUpperCase();const avatar=document.querySelector(".profile-button .avatar");if(avatar)avatar.textContent=label;const row=document.querySelector(".profile-row");if(row){row.replaceChildren();const icon=document.createElement("span");icon.className="avatar";icon.textContent=label;const details=document.createElement("div");const name=document.createElement("b");name.textContent=localName;const sub=document.createElement("small");sub.textContent=acc?acc.email+" · local profile":"Local profile · saved on this device";details.append(name,sub);row.append(icon,details)}const action=$("accountAction");if(action)action.textContent=acc?"Sign out":"Sign in / create account";const admin=$("adminAction");if(admin)admin.hidden=acc?.role!=="ADMIN";const membership=$("subscriptionAction");if(membership)membership.textContent=acc?"Membership & plans":"Sign in for membership";}
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!$("playerBackdrop").hidden)closePlayer();if(!$("subscriptionBackdrop").hidden)closeMembership();if(!$("adminBackdrop").hidden)closeAdmin();if(!$("authBackdrop").hidden)closeAuth();if(!$("preferencesBackdrop").hidden)closePreferences()}});


// Modal keyboard accessibility: keep keyboard focus inside the topmost open dialog.
(() => {
  const overlayIds=["playerBackdrop","adminBackdrop","subscriptionBackdrop","authBackdrop","profilesBackdrop","preferencesBackdrop","modalBackdrop"];
  const selector='button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  document.addEventListener("keydown",event=>{
    if(event.key!=="Tab")return;
    const overlay=overlayIds.map(id=>document.getElementById(id)).find(el=>el&&!el.hidden);
    if(!overlay)return;
    const focusable=[...overlay.querySelectorAll(selector)].filter(el=>el.getClientRects().length&&!el.closest("[hidden]"));
    if(!focusable.length){event.preventDefault();return}
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&(document.activeElement===first||!overlay.contains(document.activeElement))){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  });
})();


 
// ─────────── Product quality upgrades: activity, portability, and shortcuts ───────────
(() => {
  const $el = id => document.getElementById(id);
  const installButton=$el("installAppAction");
  let installPromptEvent=null;
  const alreadyInstalled=()=>window.matchMedia?.("(display-mode: standalone)").matches||navigator.standalone===true;
  if(installButton){
    installButton.hidden=!!window.StoryspaceNative?.native||alreadyInstalled();
    window.addEventListener("beforeinstallprompt",event=>{
      event.preventDefault();installPromptEvent=event;
      if(!window.StoryspaceNative?.native&&!alreadyInstalled())installButton.hidden=false;
    });
    window.addEventListener("appinstalled",()=>{
      installPromptEvent=null;installButton.hidden=true;showToast("Storyspace installed on this device");
    });
    installButton.addEventListener("click",async()=>{
      $el("profileMenu")?.classList.remove("open");
      if(!installPromptEvent){
        showToast("Use your browser menu: Install app or Add to Home Screen.");
        return;
      }
      const prompt=installPromptEvent;installPromptEvent=null;installButton.disabled=true;
      try{
        await prompt.prompt();
        const choice=await prompt.userChoice;
        if(choice?.outcome==="accepted"){installButton.hidden=true;showToast("Storyspace installation started");}
        else showToast("Installation was cancelled");
      }catch{showToast("Install prompt unavailable. Use the browser menu instead.");}
      finally{installButton.disabled=false;}
    });
  }
  const activityButton=$el("activityButton"),activityPanel=$el("activityPanel"),activityList=$el("activityList");
  function renderActivity(){
    if(!activityList)return;
    activityList.replaceChildren();
    const recent=[...personalized.history].sort((a,b)=>(b.at||0)-(a.at||0)).slice(0,8);
    if(!recent.length){
      const empty=document.createElement("p");empty.className="activity-empty";empty.textContent="Your activity will appear here as you explore stories.";activityList.append(empty);return;
    }
    recent.forEach(entry=>{
      const item=movies.find(m=>String(m.id)===String(entry.id)||String(m.apiId||"")===String(entry.id));
      if(!item)return;
      const button=document.createElement("button");button.type="button";button.className="activity-item";
      const title=document.createElement("b"),meta=document.createElement("small");
      title.textContent=String(item.title||item.name||"Story");
      const when=entry.at?new Date(entry.at).toLocaleString():"Recently";
      meta.textContent=(entry.kind==="save"?"Saved":entry.kind==="play"?"Previewed":"Explored")+" · "+when;
      button.append(title,meta);button.addEventListener("click",()=>{activityPanel.hidden=true;activityButton?.setAttribute("aria-expanded","false");openDetails(item)});
      activityList.append(button);
    });
  }
  function closeActivity(){if(activityPanel)activityPanel.hidden=true;activityButton?.setAttribute("aria-expanded","false")}
  activityButton?.addEventListener("click",event=>{
    event.stopPropagation();
    if(!activityPanel)return;
    const opening=activityPanel.hidden;
    if(opening)renderActivity();
    activityPanel.hidden=!opening;activityButton.setAttribute("aria-expanded",String(opening));
  });
  $el("activityClose")?.addEventListener("click",closeActivity);
  document.addEventListener("click",event=>{if(!event.target.closest(".notification-wrap"))closeActivity()});

  // Export only user-owned preferences, saved titles, and activity. Never export auth tokens.
  function exportData(){
    const payload={format:"storyspace-user-data",version:1,exportedAt:new Date().toISOString(),
      preferences:normalizePreferences(personalized.preferences),
      savedTitles:[...state.list].filter(v=>typeof v==="string"||typeof v==="number"),
      history:normalizeHistory(personalized.history),resumePoints:normalizeResumePoints(resumePoints)};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download="storyspace-my-data.json";document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);showToast("Your Storyspace data export is ready");
  }
  function importData(file){
    if(!file)return;
    if(file.size>1024*1024){showToast("Import file must be 1 MB or smaller");return}
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const data=JSON.parse(String(reader.result||""));
        if(data?.format!=="storyspace-user-data"||data.version!==1)throw new Error("Unsupported Storyspace export format");
        personalized.preferences=normalizePreferences(data.preferences);
        state.list=new Set(Array.isArray(data.savedTitles)?data.savedTitles.filter(v=>typeof v==="string"||typeof v==="number").slice(0,500):[]);
        personalized.history=normalizeHistory(data.history);
        Object.keys(resumePoints).forEach(key=>delete resumePoints[key]);Object.assign(resumePoints,normalizeResumePoints(data.resumePoints));
        movies.forEach(applyResumePoint);
        savePrefs();persistList();storage.set("storyspace.history",JSON.stringify(personalized.history));storage.set("storyspace.resumePoints",JSON.stringify(resumePoints));
        drawPreferences();renderHome();setHero(chooseHero());showToast(personalized.account?"Imported on this device; account sync may replace remote items.":"Preferences, saved stories, and activity imported");
      }catch(error){showToast(error.message||"That file could not be imported")}
    };
    reader.onerror=()=>showToast("Could not read the selected file");
    reader.readAsText(file);
  }
  $el("exportDataAction")?.addEventListener("click",()=>{$el("profileMenu")?.classList.remove("open");exportData()});
  $el("importDataAction")?.addEventListener("click",()=>{$el("profileMenu")?.classList.remove("open");$el("importDataFile")?.click()});
  $el("importDataFile")?.addEventListener("change",event=>{importData(event.target.files?.[0]);event.target.value=""});

  const genre=$el("browseGenre"),sort=$el("browseSort"),type=$el("browseType"),rating=$el("browseRating"),year=$el("browseYear");
  [genre,sort,type,rating,year].forEach(control=>control?.addEventListener("change",()=>renderGrid(browseSourceItems)));
  $el("resetBrowseFilters")?.addEventListener("click",()=>{[genre,type,rating,year].forEach(control=>{if(control)control.value="all"});if(sort)sort.value="recommended";renderGrid(browseSourceItems)});

  // Keyboard-first desktop navigation; never steal keystrokes from forms or dialogs.
  const isEditing=target=>target instanceof HTMLElement&&(
    target.isContentEditable||["INPUT","TEXTAREA","SELECT"].includes(target.tagName));
  document.addEventListener("keydown",event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();$el("searchBox")?.classList.add("open");$el("searchInput")?.focus();return}
    if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey)return;
    if(isEditing(event.target))return;
    const overlayOpen=["modalBackdrop","preferencesBackdrop","authBackdrop","subscriptionBackdrop","adminBackdrop","playerBackdrop"].some(id=>!$el(id)?.hidden);
    if(overlayOpen)return;
    if(event.key==="/"&&!event.shiftKey){
      event.preventDefault();$el("searchBox")?.classList.add("open");$el("searchInput")?.focus();
    }else if(event.key==="?" ){
      showToast("Shortcuts: / Search · Esc Close · H Discover · M My Universe");
    }else if(event.key.toLowerCase()==="h"){
      showView("home");window.scrollTo({top:0,behavior:"smooth"});
    }else if(event.key.toLowerCase()==="m"){
      showView("mylist");
    }
  });
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&activityPanel&&!activityPanel.hidden)closeActivity();
  });
  // Make the service-worker update check explicit while preserving a usable offline shell.
  if("serviceWorker" in navigator&&location.protocol!=="file:"){
    navigator.serviceWorker.ready.then(registration=>registration.update()).catch(()=>{});
  }
})();

// Multi-device install and living-room navigation foundation.
(() => {
  const isNativeAndroid = window.StoryspaceNative?.native === true && window.StoryspaceNative?.platform === "android";
  let tvMode = new URLSearchParams(location.search).get("tv") === "1";
  window.StoryspaceTV = { enable: () => { tvMode = true; document.documentElement.classList.add("tv-mode"); }, isEnabled: () => tvMode };
  if (tvMode) document.documentElement.classList.add("tv-mode");
  const isFocusable = el => el && el.matches("button,a,input,select,textarea,[tabindex]") && !el.disabled && el.tabIndex >= 0 && !el.closest("[hidden]") && el.getClientRects().length;
  const candidates = () => [...document.querySelectorAll("button,a,input,select,textarea,[tabindex]")].filter(isFocusable);
  function moveFocus(key) {
    const list = candidates(); if (!list.length) return;
    const current = document.activeElement;
    if (!list.includes(current)) { (list.find(el => el.closest(".main-nav")) || list[0]).focus(); return; }
    const a = current.getBoundingClientRect(), ax = a.left+a.width/2, ay=a.top+a.height/2;
    const vectors = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    const [dx,dy]=vectors[key]; let best=null, bestScore=Infinity;
    for (const el of list) {
      if(el===current) continue; const r=el.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2, vx=x-ax, vy=y-ay;
      const primary=vx*dx+vy*dy, cross=Math.abs(vx*dy-vy*dx);
      if(primary<=8) continue;
      const score=primary+cross*2.2+(cross>primary?cross*2:0);
      if(score<bestScore){bestScore=score;best=el}
    }
    if(best) { best.focus(); best.scrollIntoView({block:"nearest",inline:"nearest",behavior:"smooth"}); }
  }
  document.addEventListener("keydown", event => {
    if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)) return;
    // On native Android, the first remote arrow enables TV mode and must
    // still be processed instead of being swallowed during mode activation.
    if(!tvMode && isNativeAndroid) {
      window.StoryspaceTV.enable();
      tvMode = true;
    }
    if(!tvMode) return;
    const tag=document.activeElement?.tagName;
    if(["INPUT","TEXTAREA","SELECT"].includes(tag)) return;
    event.preventDefault(); moveFocus(event.key);
  });
  if(tvMode) setTimeout(()=>{(document.querySelector(".nav-link.active")||document.querySelector("button,a")).focus()},350);
  document.addEventListener("click", event => {
    const btn=event.target.closest("button");
    if(tvMode && btn) btn.classList.add("tv-activated");
  });
})();
