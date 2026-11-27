"use strict";const fs=require("node:fs"),path=require("node:path");const read=n=>fs.readFileSync(path.join(__dirname,n),"utf8");const h=read("index.html"),a=read("app.js"),collections=read("collections.js"),collectionsCss=read("collections.css"),c=read("styles.css"),cp=read("command-palette.css"),e=read("enhancements.js"),ec=read("enhancements.css"),m=read("media-uploads.js"),cine=read("cinematic.js"),cc=read("cinematic.css"),pg=read("player-gestures.js"),pgc=read("player-gestures.css"),ps=read("player-shortcuts.js"),psc=read("player-shortcuts.css"),sw=read("sw.js"),settings=read("player-settings.js"),settingsCss=read("player-settings.css"),tv=read("tv-navigation.js"),next=read("player-next.js"),mediaInfo=read("player-media-info.js"),resilienceCss=read("player-resilience.css"),sm=read("player-mini.js"),css=c;const demoEntries=a.match(/\{id:\s*1\d{2}[\s\S]*?demo:true\}/g)||[];if(demoEntries.length<13||demoEntries.some(entry=>!entry.includes("streamUrl:")))throw Error("Playable demo catalog should retain at least 13 streamed demo entries");for(const token of ["Big Buck Bunny · Full Demo","Elephants Dream · Full Demo","Sintel · Demo Movie","streamUrl:\"https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4\"","streamUrl:\"https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4\"","streamUrl:\"https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4\""])if(!a.includes(token))throw Error("Missing playable sample movie: "+token);for(const token of ['$$(".movie-card",row)','$$(".movie-row,.movie-grid").forEach(updateSpatialContainer)'])if(!cine.includes(token))throw Error("Spatial shelf must update every card and container");const ids=["profilePrivacyTitle","profileActivitySummary","clearWatchHistory","clearMyUniverse","profileAccessTitle","setProfileLock","removeProfileLock","profileAccessGate","profileAccessGateTitle","profileAccessGateName","profileAccessGatePin","profileAccessGateError","profileAccessGateUnlock","profileAccessGateSwitch","exportProfiles","importProfiles","profileBackupFile","kidsModeToggle","kidsAgeBand","setParentPin","removeParentPin","dailyScreenLimit","screenTimeTitle","screenTimeSummary","screenTimeProgress","screenTimeProgressFill","screenTimeHint","screenTimeWeekSummary","screenTimeWeek","breakReminderMinutes","quietHoursStart","quietHoursEnd","quietHoursStart","quietHoursEnd","familyUsageList","kidsWelcome","kidsSection","kidsPicksRow","kidsPicksCount","playerCaptionTrack","playerCaptionStyle","playerAudioTrack","playerSettingsNotice","playerRecovery","playerRetry","profilesBackdrop","profileSelect","addProfile","deleteProfile","browseType","browseRating","browseYear","resetBrowseFilters","universeSort","universeGenre","skipBack","skipForward","playerSpeed","playerPip","playerFullscreen","playerSeek","playerStage","playerGestureFeedback","playerGesturesToggle","playerGestureHint","playerCurrentTime","playerDuration","playerShortcutHelp","playerShortcutGuide"];for(const id of ids)if(!h.includes('id="'+id+'"'))throw Error("Missing interface id: "+id);for(const token of ["KIDS_AGE_RATINGS","KIDS_FRIENDLY_GENRES","kidsSafe","visibleCatalog","renderKidsHub","deriveParentPin","deriveParentPin","PBKDF2","PARENT_PIN_ITERATIONS","verifyParentPin","handleKidsModeToggle","handleKidsAgeBandChange","SCREEN_TIME_LIMITS","normalizeScreenTime","recentScreenTimeDays","weeklyScreenTimeRows","renderScreenTimeDashboard","handleDailyScreenLimitChange","BREAK_REMINDER_INTERVALS","handleBreakReminderChange","handleQuietHoursChange","isWithinQuietHours","quietHoursResumeLabel","notifyQuietHoursLock","startScreenTimeTicker","stopScreenTimeTicker","accrueScreenTime","Time for a quick break","Quiet hours are active","weeklyScreenTimeRows","recentScreenTimeDays","profile-switching","kidsCategory","parentPin:","activeLocalProfile.parentPin","Kids content age guide","initializeLocalProfiles","switchLocalProfile","persistLocalProfiles","renderProfilePrivacy","clearProfileWatchHistory","clearProfileMyUniverse","profileLock","verifyProfileAccess","changeProfileAccessPin","removeProfileAccessPin","showProfileAccessGate","unlockProfileAccessGate","useUnlockedProfileInstead","exportProfileBackup","importProfileBackup","storyspace-profile-backup","Restore","profile(s) restored","localProfiles.length+data.profiles.length>8","Existing profiles will not be replaced","storyspace-profiles-backup.json","defaultProgress","browseRating","browseYear","playerSpeed","updatePlayerTimeline","aria-valuetext","setPlayerRecovery","Buffering","Retrying playback","playerVideo.error?.code","playerRetry","normalizeResumePoints","maxAge=180*24*60*60*1000","normalizeHistory","new Map()","previous.count=Math.max(previous.count,entry.count)","sort((a,b)=>b.at-a.at)","addEventListener(\"seeked\"","addEventListener(\"pause\"","addEventListener(\"ended\"","persistPlayerProgress(true)"])if(!a.includes(token))throw Error("Missing feature implementation: "+token);for(const sel of [".profiles-panel",".universe-controls",".player-tools",".screen-time-panel",".screen-time-track",".family-usage-item",".screen-time-week",".screen-time-day",".kids-routine-settings",".quiet-hours-row",".profile-backup-actions",".profile-privacy-panel",".profile-privacy-actions",".profile-access-panel",".profile-access-actions",".profile-access-gate",".profile-access-gate-card",".kids-welcome",".kids-category",".kids-age-setting",".kids-pin-actions","storyspaceProfileSwap"])if(!c.includes(sel))throw Error("Missing stylesheet: "+sel);for(const token of ["userTaste","historyGenres","preferenceHits","selectDiverse","__storyspaceReason","rankedPool(shuffleMix)"])if(!e.includes(token))throw Error("Missing recommendation upgrade: "+token);if(!ec.includes(".mix-reason"))throw Error("Missing recommendation reason style");for(const token of ["/api/auth/verify/uploader","/api/auth/verify/admin","selectedFile&&selectedFile.name===x.filename&&selectedFile.size===x.size","refreshCommunityCatalog();resumeAll()","method:\"DELETE\"","Cancel upload","UPLOAD_CANCELLED","Cancelling upload"])if(!m.includes(token))throw Error("Missing media reliability feature: "+token);for(const token of ["resumePositionSeconds","durationSeconds","lastPlayedAt","currentTime,duration:video.duration","progressPercent:100,currentTime:video.duration"])if(!a.includes(token))throw Error("Missing cloud resume feature: "+token);for(const token of ["cinematic-toolbar","Toggle spatial 3D shelf view","Toggle cinematic motion effects","nextFeatured","previousFeatured","pointerdown","pointerup","cinematic-dragging","IntersectionObserver","MutationObserver","prefers-reduced-motion","StoryspaceCinematic"])if(!cine.includes(token))throw Error("Missing cinematic interaction: "+token);for(const token of [".cinematic-spatial .movie-row>.movie-card",".cinematic-spatial .movie-grid>.movie-card",".cinematic-stars",".cinematic-hero-dots",".cinematic-reveal","@media(prefers-reduced-motion:reduce)"])if(!cc.includes(token))throw Error("Missing cinematic style: "+token);if(!h.includes("Little explorers"))throw Error("Missing Kids welcome interface");if(!h.includes("cinematic.css")||!h.includes("cinematic.js"))throw Error("Cinematic assets are not wired into the app");for(const token of ["pointerdown","pointerup","storyspace.playerGestures","playerGestureFeedback","playerGesturesToggle","Math.abs(dx) >= 48","Math.abs(dx) > Math.abs(dy) * 1.25","Math.abs(dy) >= 42","video.style.filter","brightness(","video.volume","formatTime"])if(!pg.includes(token))throw Error("Missing player gesture implementation: "+token);for(const token of [".player-stage",".player-gesture-feedback",".player-gesture-row","prefers-reduced-motion"])if(!pgc.includes(token))throw Error("Missing player gesture style: "+token);if(!h.includes("player-gestures.css")||!h.includes("player-gestures.js"))throw Error("Player gesture assets are not wired into the app");for(const token of ["playerShortcutHelp","playerShortcutGuide","Keyboard shortcuts"])if(!h.includes(token))throw Error("Missing keyboard shortcut UI: "+token);for(const token of ["activeOverlay","aria-hidden","isContentEditable","playerBackdrop:not([hidden])","prefers-reduced-motion"])if(!a.includes(token))throw Error("Missing TV navigation behavior: "+token);for(const token of ["keydown","video.paused","arrowleft","arrowright","arrowup","arrowdown","event.shiftKey","playerShortcutGuide","escape","isEditable"])if(!ps.includes(token))throw Error("Missing keyboard shortcut implementation: "+token);for(const sel of [".player-shortcut-guide","kbd","prefers-reduced-motion"])if(!psc.includes(sel))throw Error("Missing keyboard shortcut styles: "+sel);if(!h.includes("player-shortcuts.css")||!h.includes("player-shortcuts.js"))throw Error("Keyboard shortcut assets not wired");for(const token of ["storyspace.playerSpeed","playbackRate","playerCaptionTrack","playerCaptionStyle","playerAudioTrack","loadedmetadata","addtrack","removetrack","textTracks","audioTracks"])if(!settings.includes(token))throw Error("Missing player preference behavior: "+token);for(const token of [".player-settings-row",".player-caption-large",".player-caption-high-contrast"])if(!settingsCss.includes(token))throw Error("Missing player preference styling: "+token);if(!h.includes("player-settings.css")||!h.includes("player-settings.js"))throw Error("Player settings assets not wired");if(!h.includes("tv-navigation.js")||!sw.includes("./tv-navigation.js")||!tv.includes("StoryspaceTVNavigation")||!tv.includes("ArrowDown")||!tv.includes("focusin"))throw Error("TV navigation missing/unwired");if(!h.includes("playerCaptionSize")||!settings.includes("storyspace.captionSize")||!settings.includes("extra-large")||!ps.includes('case "c":'))throw Error("Caption size controls or toggle shortcut missing");if(!h.includes('id="playerTheater"')||!ps.includes('setTheater')||!ps.includes('case "t":')||!pgc.includes('player-theater-mode'))throw Error("Theater mode feature missing");for(const token of ["storyspace.playerSpeed","playbackRate","playerCaptionTrack","playerCaptionStyle","playerAudioTrack","loadedmetadata","textTracks","audioTracks"])if(!settings.includes(token))throw Error("Missing player preference behavior: "+token);for(const token of [".player-settings-row",".player-caption-large",".player-caption-high-contrast"])if(!settingsCss.includes(token))throw Error("Missing player preference styling: "+token);if(!h.includes("player-settings.css")||!h.includes("player-settings.js"))throw Error("Player settings assets not wired");if(!h.includes("player-next.js")||!sw.includes("./player-next.js")||!next.includes("StoryspacePlayerNext")||!next.includes("playerAutoNext")||!next.includes("addEventListener(\"ended\""))throw Error("Up-next recommendations missing/unwired");if(!h.includes("playerUpNext")||!a.includes("StoryspacePlayerNext?.setContext")||!a.includes("StoryspacePlayerNext?.reset"))throw Error("Up-next panel integration missing");if(!h.includes("player-mini.js")||!sw.includes("./player-mini.js")||!sm.includes("StoryspaceMiniPlayer"))throw Error("Mini-player module missing or unwired");for(const token of ["player-mini-mode","player-mini-toggle","restore","minimize","MutationObserver"])if(!css.includes(token)&&!read("player-mini.js").includes(token))throw Error("Mini-player behavior/style missing: "+token);for(const asset of ["./player-settings.css","./player-settings.js","./cinematic.css","./cinematic.js","./player-gestures.css","./player-gestures.js","./player-shortcuts.css","./player-shortcuts.js","./media-uploads.js"])if(!sw.includes(asset))throw Error("Missing offline shell asset: "+asset);if(!/storyspace-shell-v\d+/.test(sw))throw Error("Offline shell cache was not versioned for new assets");console.log("Storyspace UI, discovery, media authentication, upload-resume and cloud playback-sync, cinematic 3D and gesture smoke checks passed");
// Library & performance batch v1 guards
if(!a.includes("image.loading=\"lazy\"")||!a.includes("image.decoding=\"async\""))throw Error("poster lazy-loading missing");
if(!a.includes("universe.sort((a,b)=>String(a.title||a.name).localeCompare"))throw Error("My Universe title sort missing");
if(!a.includes("universeCount"))throw Error("My Universe count indicator missing");
if(!c.includes("movie-poster-image")||!c.includes("prefers-reduced-motion:reduce"))throw Error("performance/transition styles missing");
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("shell cache version not bumped for cinematic fix");

// Player UX batch v1 guards
const pux=read("player-ux.js");
if(!h.includes("player-ux.js"))throw Error("player UX script not wired");
if(!sw.includes("player-ux.js")||!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("player UX offline shell not updated");
if(!pux.includes("player-seek-preview")||!pux.includes("dy>90")||!pux.includes("fullscreenchange"))throw Error("seek preview/swipe-dismiss/fullscreen UX missing");
if(!c.includes("player-fullscreen-active")||!c.includes("prefers-reduced-motion:reduce"))throw Error("fullscreen transition styles missing");

// Player resilience batch v1 guards
const resilience=read("player-resilience.js");
if(!h.includes("player-resilience.js")||!h.includes("player-resilience.css"))throw Error("player resilience assets not wired");
if(!sw.includes("player-resilience.js")||!sw.includes("player-resilience.css")||!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("player resilience offline shell not updated");
for(const token of ["waiting","stalled","loadedmetadata","navigator.onLine","StoryspacePlayerResilience","stallRecoveryTimer","lastAutoRecoveryAt","recover({resume:true,autoplay:true})","8500","25000"])if(!resilience.includes(token))throw Error("player recovery behavior missing: "+token);
if(!resilienceCss.includes("prefers-reduced-motion:reduce"))throw Error("player buffering reduced-motion style missing");

// Demo streaming library guards
const demoApp=read("app.js");
for(const marker of ["Big Buck Bunny · Full Demo","Elephants Dream · Full Demo","Sintel · Demo Movie","For Bigger Escapes · 4K Demo","For Bigger Joyrides · Demo","For Bigger Meltdowns · Demo","streamUrl","demo:true"])if(!demoApp.includes(marker))throw Error("Demo video library missing: "+marker);
if(!demoApp.includes('video.src=m.demo?'))throw Error("Demo video player source mapping missing");

// Demo Cinema row: sample titles must be rendered separately and never confused with licensed catalog items.
if(!a.includes('renderRow("demoCinemaRow",movies.filter(m=>m.demo))'))throw Error("Demo Cinema row render wiring missing");if(!a.includes("function ranked(items=movies.filter(m=>!m.demo))"))throw Error("Curated ranking must exclude demo streams by default");if(!a.includes("const ordered=ranked(movies.filter(m=>!m.demo));"))throw Error("Home curated rows must use the non-demo catalog");if(!a.includes("function chooseHero(){const available=visibleCatalog(movies.filter(m=>!m.demo))"))throw Error("Featured hero must exclude demo streams");if(!a.includes("pool=movies.filter(m=>!m.demo&&kidsSafe(m)&&m.id!==current?.id)"))throw Error("Surprise hero must respect demo and Kids Mode filters");if(!a.includes('if(view==="movies")filtered=movies.filter(m=>m.type==="movie"&&!m.demo);'))throw Error("Films browse must keep sample streams in Demo Cinema");if(!a.includes('if(view==="top")filtered=ranked(movies.filter(m=>!m.demo));'))throw Error("Top picks browse must exclude demo streams");
if(!h.includes('id="demoCinemaSection"')||!h.includes('id="demoCinemaRow"'))throw Error("Demo Cinema section markup missing");
if(!h.includes("13 sample streams")||!h.includes("Not a commercial film catalog"))throw Error("Demo Cinema sample-content disclaimer/count missing");
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Demo Cinema shell cache version not bumped");

// Visible demo tag on sample video cards.
if(!a.includes('demoBadge.textContent="DEMO"')||!c.includes(".card-demo-badge"))throw Error("Demo card badge styling/markup missing");

// Demo Cinema browse navigation and player source notice.
if(!a.includes('"demoCinemaSection"'))throw Error("Demo Cinema section not included in home view visibility");
if(!a.includes('if(view==="demoCinema")filtered=movies.filter(m=>m.demo);'))throw Error("Demo Cinema browse view missing");
if(!a.includes('demoCinema:"Demo Cinema · Sample streams"'))throw Error("Demo Cinema browse heading missing");
if(!a.includes('Sample video stream · Demo footage, not a licensed film.'))throw Error("Demo stream notice is inaccurate or missing");

// Demo-stream error messaging and cache-version regression checks
if(!a.includes('video.dataset.demoStream=m.demo?"1":"0"'))throw Error("Demo stream marker not set on player");
if(!resilience.includes('video.dataset.demoStream==="1"?"Sample stream unavailable · ":""'))throw Error("Demo stream error guidance missing");
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Demo recovery cache version not bumped");

// Player media metadata readout
if(!h.includes('id="playerMediaInfo"'))throw Error("Player media info element missing");
if(!h.includes("player-media-info.js"))throw Error("Player media metadata module not included");
if(!c.includes(".player-media-info"))throw Error("Player media metadata styling missing");
if(!sw.includes("player-media-info.js")||!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Player media metadata shell cache missing");
if(!mediaInfo.includes("loadedmetadata")||!mediaInfo.includes("video.videoWidth")||!mediaInfo.includes("video.videoHeight"))throw Error("Player metadata details missing");

// Player media metadata readout
if(!h.includes("playerMediaInfo"))throw Error("Player media info element missing");
if(!h.includes("player-media-info.js"))throw Error("Player media metadata module not included");
if(!c.includes(".player-media-info"))throw Error("Player media metadata styling missing");
if(!sw.includes("player-media-info.js")||!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Player media metadata shell cache missing");
if(!mediaInfo.includes("loadedmetadata")||!mediaInfo.includes("video.videoWidth")||!mediaInfo.includes("video.videoHeight"))throw Error("Player metadata details missing");

// Player playback diagnostics
const diagnostics=read("player-playback-diagnostics.js");
if(!h.includes("playerPlaybackHealth")||!h.includes("player-playback-diagnostics.js"))throw Error("Playback health status UI/module missing");
if(!sw.includes("player-playback-diagnostics.js")||!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Playback diagnostics cache entry missing");
for(const token of ["waiting","stalled","playing","navigator.onLine","buffered","StoryspacePlaybackDiagnostics","Math.floor(buffer)","Buffer ahead","label.toLowerCase().includes(\"stall\")?\"stalled\"","seeking","seeked","timeupdate"])if(!diagnostics.includes(token))throw Error("Playback diagnostics behavior missing: "+token);
if(!c.includes(".player-playback-health"))throw Error("Playback diagnostics style missing");

// Playback diagnostics accessibility + state mapping guards
if(!h.includes('id="playerPlaybackHealth" role="status" aria-live="off"'))throw Error("Playback diagnostics must not spam live announcements");
if(!diagnostics.includes('label.toLowerCase().includes("seek")?"seeking"')||!diagnostics.includes('label.toLowerCase().includes("ready")?"ready"'))throw Error("Seeking/ready diagnostics state mapping missing");
if(!c.includes('data-state="seeking"')||!c.includes('data-state="ready"'))throw Error("Seeking/ready diagnostics style missing");

// Live-stream metadata indicator regression guard
if(!mediaInfo.includes('video.duration===Infinity')||!mediaInfo.includes('parts.push("LIVE")'))throw Error("Live-stream metadata label missing");

// Preserve responsive polish already merged to main.
if(!h.includes("interaction-polish.css")||!sw.includes("./interaction-polish.css"))throw Error("Responsive polish asset missing from consolidated shell");
if(!read("player-queue.js").includes("StoryspaceQueue")||!sw.includes("./player-queue.js"))throw Error("Smart Queue module missing from consolidated shell");
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Consolidated shell cache not bumped");

// Discovery shortcuts and year search from merged PR #118
if(!h.includes("data-discovery=\"genre:Sci-Fi\"")||!h.includes("data-discovery=\"year:2026\""))throw Error("Quick discovery markup missing");
if(!a.includes("event.target.closest(\"[data-discovery]\")")||!a.includes("filters.year")||!a.includes("matchesYear"))throw Error("Discovery year filter wiring missing");
if(!c.includes(".discovery-shortcuts")||!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Discovery styles/cache missing");

// Similar-story rail added to consolidated branch
if(!h.includes("similarStoriesRow")||!h.includes("similarStoriesTitle"))throw Error("Similar-story markup missing");
if(!a.includes("renderRow(\"similarStoriesRow\",similar)")||!a.includes("targetGenres"))throw Error("Similar-story ranking missing");
if(!c.includes(".details-recommendations")||!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Similar-story styles/cache missing");

// Integrated details modal save/resume/highlights and surprise picker
if(!h.includes("modalSignals")||!h.includes("modalSave")||!h.includes("modalResumeProgress")||!h.includes("heroSurprise"))throw Error("Details modal controls missing");
if(!a.includes("syncSignals")||!a.includes("syncSave")||!a.includes("Continue where you left off")||!a.includes("function surpriseHero"))throw Error("Details save/resume/surprise behavior missing");
if(!c.includes(".modal-signals")||!c.includes(".details-save-button")||!c.includes(".modal-resume-track")||!c.includes(".hero-surprise")||!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Details modal styles/cache missing");

// Main-based Queue and Up Next polish guards
if(!h.includes('id="playerUpNextPoster"')||!h.includes('id="playerUpNextProgress"'))throw Error("Up Next poster/countdown bar missing");
if(!next.includes("queuedItem()")||!next.includes("From Smart Queue")||!next.includes("StoryspaceQueue?.playNext"))throw Error("Queue-aware next-item playback missing");
if(!next.includes('event.key==="Escape"&&!panel.hidden'))throw Error("Up Next Escape dismiss missing");
if(!c.includes(".player-up-next-poster")||!c.includes(".player-up-next-progress-track")||!c.includes(".queue-footer button:disabled"))throw Error("Player/queue polish styles missing");
if(!h.includes('id="queueShuffle"')||!read("player-queue.js").includes("Queue shuffled")||!read("player-queue.js").includes("aria-label"))throw Error("Shuffle/accessibility queue controls missing");
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Shell cache v36 not bumped");

// Full Smart Queue controls: auto-advance, repeat, playlist import/export, direct actions and demo bulk-add.
const queue=read("player-queue.js");
for(const id of ["queueExport","queueImport","queueImportFile","queueRepeat","queueShuffle","demoQueueAll"])if(!h.includes('id="'+id+'"'))throw Error("Missing queue control: "+id);
for(const token of ["storyspace-playlist","version:1","queue.length>=100","queuePlay","autoPlayQueue","repeatAll","queueExport","queueImportFile","queue-play-item","queue-play-next","aria-label","Queue limit reached","demoQueueAll"])if(!queue.includes(token))throw Error("Smart Queue behavior missing: "+token);
if(!next.includes("StoryspaceQueue?.autoPlay?.()"))throw Error("Up Next must not conflict with active queue autoplay");
if(!css.includes(".queue-import-export")||!css.includes(".queue-play-next")||!css.includes(".demo-queue-all"))throw Error("Queue extended styles missing");
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Queue feature cache v36 missing");

// Expanded 13-item sample catalog is included in the existing Demo Cinema row.
for(const title of ["For Bigger Fun · Demo","For Bigger Blazes · Demo","Tears of Steel · Open Film","Subaru Outback · Sample","Volkswagen GTI Review · Sample","Bullrun Road Rally · Sample","What Car for $1,000? · Sample"])if(!demoApp.includes(title))throw Error("Expanded sample catalog missing: "+title);
if(!a.includes('renderRow("demoCinemaRow",movies.filter(m=>m.demo))'))throw Error("Expanded Demo Cinema row render missing");
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Expanded demo shell cache v37 missing");

// Local profile identity and theme persistence guards
for(const id of ["renameProfile","profileAvatarChoice","profileThemeChoice"])if(!h.includes('id="'+id+'"'))throw Error("Missing profile personalization control: "+id);
for(const token of ["PROFILE_AVATARS","PROFILE_THEMES","profileCleanName(raw)","Profile renamed","activeLocalProfile.theme","activeLocalProfile.avatar","dataset.profileTheme"])if(!a.includes(token))throw Error("Profile identity/theme behavior missing: "+token);
for(const theme of ["data-profile-theme=\"ocean\"","data-profile-theme=\"ember\"","data-profile-theme=\"forest\""])if(!c.includes(theme))throw Error("Missing theme palette: "+theme);
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Profile theme shell v38 missing");

// Discovery taste balance and Not-for-me controls
for(const token of ["taste-panel","taste-mode","tasteInsight","storyspace:interest-updated","storyspace:profile-updated","comfort","balanced","explore"])if(!e.includes(token))throw Error("Taste balance feature missing: "+token);
for(const token of ["storyspace.discoveryDismissed","dismissed.add(String(movie.apiId||movie.id))","restore.hidden=dismissed.size===0","dismissed.clear()"])if(!e.includes(token))throw Error("Not-for-me persistence/restore missing: "+token);
for(const token of [".taste-panel",".taste-mode[aria-pressed=\"true\"]",".discovery-restore",".discovery-dismiss"])if(!ec.includes(token))throw Error("Discovery personalization styles missing: "+token);
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Discovery personalization shell v39 missing");

// Watch Later and Resume Hub controls, modules and offline assets
for(const id of ["watchLaterOpen","watchLaterCount","storyspaceWatchLater","watchLaterClose","watchLaterList","resumeHub","resumeHubClose","resumeHubList"])if(!h.includes('id="'+id+'"'))throw Error("Missing personal list/hub interface: "+id);
for(const asset of ["watch-later.js","watch-later.css","resume-hub.js","resume-hub.css"])if(!h.includes(asset)||!sw.includes("./"+asset))throw Error("Missing Watch Later/Resume Hub asset: "+asset);
for(const token of ["storyspace.watchLater.v1.","profileKey()","MAX","watchLaterCount","storyspace:profile-updated","toggle(id)","watchLaterOpen"])if(!read("watch-later.js").includes(token))throw Error("Watch Later persistence/control missing: "+token);
for(const token of ["storyspace.resumePoints","resumeHubList","resumeHubClose","Clear progress","refreshContinueRow","storyspaceResumeHub"])if(!read("resume-hub.js").includes(token))throw Error("Resume Hub behavior missing: "+token);
if(!e.includes("watch-later")||!e.includes("storyspaceWatchLater.toggle"))throw Error("Discovery Studio Watch Later actions missing");
if(!c.includes(".watch-later-panel")||!c.includes(".resume-hub-card"))throw Error("Watch Later/Resume Hub responsive styles missing");
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Personal lists shell v40 missing");

// Command palette and saved My Universe layout
for(const id of ["commandPaletteOpen","universeLayoutToggle"])if(!h.includes('id="'+id+'"'))throw Error("Missing quick navigation/layout control: "+id);
for(const token of ["syncUniverseLayout","storyspace.universeLayout","universe-grid","universeLayoutToggle"])if(!a.includes(token))throw Error("My Universe layout preference missing: "+token);
for(const asset of ["command-palette.css","command-palette.js"])if(!h.includes(asset)||!sw.includes("./"+asset))throw Error("Command palette asset missing: "+asset);
for(const token of ["StoryspaceCommands","ArrowDown","ArrowUp","No matching action","Alt+K","Watch Later","StoryspaceQueue","aria-haspopup","aria-expanded","aria-controls","command-palette-close","e.key!==\"Tab\"","focusables"])if(!read("command-palette.js").includes(token))throw Error("Command palette action/navigation/accessibility missing: "+token);if(!read("command-palette.css").includes(".command-palette-close:focus-visible"))throw Error("Command palette close focus styles missing");
if(!read("resume-hub.js").includes("resumeHub"))throw Error("Continue Watching hub asset missing");
for(const sel of [".command-palette",".command-palette-item",".command-palette-input","prefers-reduced-motion"])if(!read("command-palette.css").includes(sel))throw Error("Command palette styles missing: "+sel);
if(!c.includes(".movie-row.universe-grid"))throw Error("My Universe grid styles missing");
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Quick navigation shell v41 missing");

// Profile-aware welcome context
for(const token of ["refreshProfileWelcome","Good morning, ","Good afternoon, ","Good evening, ","stories","My Universe","resume","kidsMode"])if(!a.includes(token))throw Error("Profile-aware welcome behavior missing: "+token);
if(!c.includes(".welcome-line span")||!c.includes(".welcome-line small"))throw Error("Welcome context styles missing");
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Welcome context cache v42 missing");

// Quick Discovery collections, dynamic genre shortcuts and platform asset guard
if(!h.includes('quick-discovery.js')||!h.includes('quick-discovery.css'))throw Error('Quick Discovery assets missing from page');
if(!read('quick-discovery.js').includes('storyspace:catalog-updated')||!read('quick-discovery.js').includes('Demo Cinema'))throw Error('Quick collections/genre refresh missing');
if(!c.includes('.quick-discovery')||!c.includes('.quick-discovery-chip'))throw Error('Quick Discovery styles missing');
if(!sw.includes('./quick-discovery.js')||!sw.includes('./quick-discovery.css')||!/storyspace-shell-v\d+/.test(sw))throw Error('Quick Discovery offline shell missing');
if(!read('../platforms/check-platform-config.js').includes('quick-discovery.js'))throw Error('Platform asset configuration check missing Quick Discovery');

// Watch Later event wiring guard
if(!read("watch-later.js").includes("storyspace:watchlater-updated"))throw Error("Watch Later change event missing");

if(!a.includes("refreshProfileWelcome();"))throw Error("Profile welcome invocation missing");

// Discovery restore button should not trigger duplicate rerenders
const discoveryRestoreHandler = read("enhancements.js").split('restore.addEventListener("click",()=>{dismissed.clear();persistDismissed();render(false)});').length - 1;
if(discoveryRestoreHandler!==1)throw Error("Discovery restore handler must be registered exactly once");

// Discovery UI state synchronization guards
if((read("enhancements.js").match(/restore\.hidden=dismissed\.size===0;/g)||[]).length!==1)throw Error("Discovery restore visibility should update once");
if(!read("enhancements.js").includes("syncTastePanel();"))throw Error("Taste profile controls are not synchronized after render");

// Discovery recommendation cards keep nested actions semantically valid
if(read("enhancements.js").includes('article.setAttribute("role", "button")')||read("enhancements.js").includes("article.tabIndex = 0;"))throw Error("Discovery cards must not expose nested interactive button semantics");
if(!read("enhancements.js").includes('details.setAttribute("aria-label", "Explore " + title)'))throw Error("Discovery details action must remain keyboard accessible");


// Player reconnect/resume recovery regression guard
for(const token of ["resume:true","position>0&&Number.isFinite(video.duration)","Math.min(position,Math.max(0,video.duration-.25))","recoveryTimer=setTimeout","Recovery timed out","removeEventListener","retry.disabled=true","Still offline · Check your internet connection"])if(!read("player-resilience.js").includes(token))throw Error("Player reconnect recovery regression missing: "+token);
if(!h.includes("player-resilience.js")||!sw.includes("./player-resilience.js")||!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Player recovery module/cache wiring missing");

// Live gesture preview regression checks
for(const token of ['function previewGesture(event)','Seek preview · ','Brightness preview · ','Volume preview · ','pointermove'])if(!read('player-gestures.js').includes(token))throw Error('Gesture preview missing: '+token);
if(!/storyspace-shell-v\d+/.test(sw))throw Error('Gesture preview shell cache not bumped');

// Persistent player volume/mute controls
for(const id of ["playerVolume","playerMuteToggle"])if(!h.includes('id="'+id+'"'))throw Error("Missing volume preference control: "+id);
for(const token of ["storyspace.playerVolume","storyspace.playerMuted","function syncVolume()","aria-valuetext","volumechange"])if(!read("player-settings.js").includes(token))throw Error("Player volume persistence/sync missing: "+token);
if(!read("player-settings.css").includes(".player-volume-control")||!read("player-settings.css").includes(".player-mute-toggle"))throw Error("Player volume control styling missing");

// Custom intro and credits skip markers are scoped to the media URL and user-set.
for(const id of ["markIntroEnd","skipIntro","markCreditsStart","skipCredits"])if(!h.includes('id="'+id+'"'))throw Error("Player segment skip control missing: "+id);
for(const token of ["storyspace.playerSegments.v1.","introEnd","creditsStart","timeupdate","loadedmetadata"])if(!read("player-ux.js").includes(token))throw Error("Custom skip marker behavior missing: "+token);
if(!h.includes(">Skip intro</button>")||!h.includes(">Skip credits</button>"))throw Error("Custom skip labels missing from player UI");
if(!read("player-shortcuts.css").includes(".player-segment-button")||!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Player skip control styles/cache missing");

// Theater-mode keyboard/button control must have a defined handler and synchronized state.
if(!read("player-shortcuts.js").includes("function setTheater(open)")||!read("player-shortcuts.js").includes("playerTheater"))throw Error("Theater mode control handler missing");
if(!h.includes("playerTheater")||!h.includes("<kbd>T</kbd> theater mode"))throw Error("Theater mode button/shortcut help missing");
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Theater mode shell cache not bumped");

// Caption quick-toggle shortcut (Alt+C) must preserve the regular C size-cycle shortcut.
if(!settings.includes("toggleCaptionsShortcut")||!settings.includes("event.altKey")||!settings.includes("storyspace.captionLastEnabled"))throw Error("Caption on/off shortcut missing");
if(!h.includes("Alt+C</kbd> captions on/off"))throw Error("Caption shortcut help text missing");
for(const token of ["storyspace.captionLanguage","storyspace.audioLanguage","preferredTrack(tracks,language,fallback)","trackKey(track)","if(fallback===\"-1\")return fallback"])if(!settings.includes(token))throw Error("Preferred track language persistence missing: "+token);

// Mobile theater mode viewport and safe-area regression guards.
const theaterCss=read("player-gestures.css");
for(const token of ["100dvh","72dvh","55dvh","env(safe-area-inset-top)","env(safe-area-inset-bottom)","overscroll-behavior:contain"])if(!theaterCss.includes(token))throw Error("Mobile theater viewport/safe-area polish missing: "+token);
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Mobile theater polish shell cache missing");
if(!theaterCss.includes("orientation:landscape")||!theaterCss.includes("100dvh - 150px"))throw Error("Short landscape theater layout missing");
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Short landscape theater shell cache missing");


// Profile-aware My Collections studio
for(const id of ["collectionExport","collectionImportToggle","collectionImportFile","collectionBackupStatus","collectionsSection","collectionCreateToggle","collectionCreateForm","collectionName","collectionTheme","collectionsGrid","collectionsEmpty","collectionDetail","collectionDetailTitle","collectionDetailCount","collectionBack","collectionDelete","collectionItemsRow","modalCollectionsToggle","modalCollectionsPanel","modalCollectionsChoices"])if(!h.includes('id="'+id+'"'))throw Error("Missing collections UI: "+id);
for(const token of ["uniqueItems","skipped += uniqueItems.length - items.length","skipped += combined.length - existing.items.length","limits or invalid data","storyspace-collections","exportBackup","importBackup","file.size > 1024 * 1024","Matching names will merge stories","newCollectionId","collectionBackupStatus","storyspace.collections.v1.","MAX_COLLECTIONS = 20","MAX_ITEMS = 100","cleanName","readCollections","saveCollections","renderCollectionGrid","renderCollectionDetail","storyspace:profile-updated","modalCollectionsToggle","storyspace:collections-updated","aria-pressed"])if(!collections.includes(token))throw Error("Custom collections behavior missing: "+token);
for(const token of [".collection-toolbar",".collection-backup-status",".collections-grid",".collection-tile",".collection-mosaic",".collection-create-form",".collection-detail",".collection-card-remove",".modal-collections-panel",".collection-choice","prefers-reduced-motion"])if(!collectionsCss.includes(token))throw Error("Custom collections styling missing: "+token);
if(!h.includes("collections.css")||!h.includes("collections.js"))throw Error("Collections assets are not wired into the app");
if(!sw.includes("./collections.css")||!sw.includes("./collections.js")||!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Collections assets missing from offline shell");
if(!a.includes('if(collections)collections.hidden=view!=="home"')||!a.includes('if($("collectionsSection"))$("collectionsSection").hidden=true'))throw Error("Collections hub must hide in browse/search modes");

 // Collection management: safe rename and persisted presentation sorting.
 for(const id of ["collectionRename","collectionSort"])if(!h.includes('id="'+id+'"'))throw Error("Collection management control missing: "+id);
 for(const token of ["collection.sort","collectionRename","collectionSort","sortMode === \"title\"","sortMode === \"recent\"","sortMode === \"rating\"","sortMode === \"year\"","A collection with that name already exists","sort:item.sort"])if(!collections.includes(token))throw Error("Collection rename/sort persistence missing: "+token);
 for(const token of [".collection-sort-label","collection-sort-label select:focus-visible"])if(!collectionsCss.includes(token))throw Error("Collection sort styling missing: "+token);
 if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Collection management cache version missing");

// Custom Collection ordering: accessible move buttons and drag/drop, while preserving filtered slots.
for(const token of ["reorderVisibleItems","collection-order-controls","Move ","dragstart","dragend","dragover","tile.dataset.collectionItemId",'collection.sort = "custom"'])if(!collections.includes(token))throw Error("Collection reorder implementation missing: "+token);
for(const token of [".collection-order-controls",".collection-order-button",".collection-is-dragging"])if(!collectionsCss.includes(token))throw Error("Collection reorder styles missing: "+token);

// Collection cover personalization smoke guards
for(const token of ["coverIcons","validIcon(item.icon)","icon: validIcon(item.icon)","validIcon(collection.icon)","collectionIcon"])if(!collections.includes(token))throw Error("Collection cover personalization missing: "+token);
if(!h.includes('id="collectionIcon"')||!h.includes('id="collectionDetailIcon"'))throw Error("Collection icon controls missing");
for(const token of [".collection-cover-icon","#collectionDetailIcon"])if(!collectionsCss.includes(token))throw Error("Collection icon styles missing: "+token);
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Collection cover cache version missing");

// Per-profile storage schema retains sort and cover personalization across reloads.
if(!collections.includes("icon: validIcon(item.icon)")||!collections.includes('sort: ["custom","title","recent","rating","year"].includes(item.sort) ? item.sort : "custom"'))throw Error("Collection cover/sort profile persistence missing");

// Collection description metadata and optional form controls.
for(const token of ["cleanDescription(item.description)","description: cleanDescription(item.description)","collection.description","collectionDescription"])if(!collections.includes(token))throw Error("Collection descriptions missing: "+token);
if(!h.includes('id="collectionDescription"')||!h.includes('id="collectionDetailDescription"'))throw Error("Collection description controls missing");
if(!collectionsCss.includes(".collection-tile-description"))throw Error("Collection description styles missing");
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Collection descriptions cache version missing");

// Collection hub manual shelf ordering: drag/drop + accessible move controls.
for(const token of ["reorderCollections","collection-shelf-card","collection-shelf-controls","collection-shelf-move","dragstart","dragover","dragend"])if(!collections.includes(token))throw Error("Collection hub reorder feature missing: "+token);
for(const token of [".collection-shelf-card",".collection-shelf-controls",".collection-shelf-move",".collection-shelf-dragging"])if(!collectionsCss.includes(token))throw Error("Collection hub reorder styles missing: "+token);
if(!sw.includes(((sw.match(/storyspace-shell-v\d+/)||[])[0]||"")))throw Error("Collection hub cache version missing");

// My Universe search/empty-state behavior regression checks.
for(const id of ["universeSearch","universeSearchClear","universeEmptyState"])if(!h.includes('id="'+id+'"'))throw Error("My Universe search/empty-state interface missing: "+id);
for(const token of ["universeSearch","universeSearchClear","universeEmptyState","toLocaleLowerCase()","No saved titles match","savedMovies.length","m.description,m.cast,m.genre,m.genres,m.year,m.releaseYear"])if(!a.includes(token))throw Error("My Universe search/empty-state behavior missing: "+token);
for(const token of [".universe-search-label input",".universe-search-clear",".universe-empty-state","focus-visible"])if(!c.includes(token))throw Error("My Universe search/empty-state styling missing: "+token);

// My Universe bulk-selection regression guards.
for(const id of ["universeSelectToggle","universeBulkActions","universeSelectAll","universeClearSelection","universeRemoveSelected","universeSelectedCount"])if(!h.includes('id="'+id+'"'))throw Error("Bulk selection control missing: "+id);
for(const token of ["universeSelection","universeSelectMode","universeSelectAll","universeClearSelection","universeRemoveSelected","universe-selected","Select all visible","Removed ","syncUniverseBulkControls"])if(!a.includes(token))throw Error("Bulk selection behavior missing: "+token);
for(const token of [".universe-bulk-actions",".universe-selection-action",".movie-card.universe-selected",".universe-select-toggle"])if(!c.includes(token))throw Error("Bulk selection styling missing: "+token);

// Collection bulk tools regression guards.
for(const id of ["collectionBulkToggle","collectionBulkToolbar","collectionSelectAll","collectionClearSelection","collectionRemoveSelected","collectionBulkCount","universeCollectionAssign","universeAssignCollection","universeAssignSelected"])if(!h.includes('id="'+id+'"'))throw Error("Collection bulk UI missing: "+id);
for(const token of ["collectionBulkSelection","collectionBulkMode","collectionSelectAll","collectionRemoveSelected","bulkAdd","collection-bulk-selected","syncCollectionBulkToolbar"])if(!collections.includes(token))throw Error("Collection bulk behavior missing: "+token);
for(const token of ["universeCollectionAssign","universeAssignCollection","universeAssignSelected","bulkAdd","syncUniverseCollectionAssignment"])if(!a.includes(token))throw Error("Universe-to-collection bulk assignment missing: "+token);
for(const token of [".collection-bulk-toolbar",".collection-bulk-selected",".universe-collection-assign"])if(!collectionsCss.includes(token))throw Error("Collection bulk styles missing: "+token);

// Collection search, move and duplicate smoke checks.
for(const id of ["collectionSearch","collectionDuplicate","collectionMoveTarget","collectionMoveSelected"])if(!h.includes('id="'+id+'"'))throw Error("Collection search/move/duplicate UI missing: "+id);
for(const token of ["collectionSearchQuery","collectionMoveSelected","collectionMoveTarget","collectionDuplicate","newCollectionId","Moved ","Duplicated collection"])if(!collections.includes(token))throw Error("Collection search/move/duplicate behavior missing: "+token);
for(const token of [".collection-search-label",".collection-bulk-toolbar select"])if(!collectionsCss.includes(token))throw Error("Collection search/move styles missing: "+token);

// Smart genre suggestions derive from current catalog data and create prefilled shelves.
if(!h.includes('id="smartCollectionChips"'))throw Error("Smart collection suggestions UI missing");for(const token of ["renderSmartSuggestions","smartCollectionChips","genres","Created "])if(!collections.includes(token))throw Error("Smart collection suggestion logic missing: "+token);for(const token of [".smart-collection-chip",".smart-collection-chips"])if(!collectionsCss.includes(token))throw Error("Smart collection suggestion styling missing: "+token);

// Continue Watching resume polish: recent-first ordering and remaining-time labels.
for(const token of ["refreshContinueRow();","resume-time-label","updatedAt","min left","const items=movies.filter(m=>Number(m.progress)>0).sort"])if(!a.includes(token))throw Error("Continue Watching resume polish missing: "+token);
if(!css.includes(".resume-time-label"))throw Error("Continue Watching resume-time style missing");


// Guarded VOD and live/DVR seeking regression checks
for(const token of ["function getPlayerSeekWindow()","playerVideo.seekable","Number.isFinite(raw)","Math.max(range.start,Math.min(range.end,target))","Seeking unavailable","live window"])if(!a.includes(token))throw Error("Missing guarded seek behavior: "+token);
const seekUx=read("player-ux.js");
for(const token of ["function seekWindow()","video.seekable","range.live?\"live window\"","pointercancel"])if(!seekUx.includes(token))throw Error("Missing seek preview range behavior: "+token);


const playbackDiagnostics=read("player-media-info.js");
for(const token of ["function bufferedAhead()","video.buffered","networkState","readyState","getVideoPlaybackQuality","droppedVideoFrames","ratechange","bufferedAhead"])if(!playbackDiagnostics.includes(token))throw Error("Missing playback diagnostics: "+token);

// Copyable diagnostics should be user-triggered and provide clipboard fallback.
for(const token of ['diagnosticReport()','navigator.clipboard.writeText(report)','execCommand("copy")','player-diagnostics-copy','Dropped frames:','User agent:'])if(!mediaInfo.includes(token))throw Error('Playback diagnostics export missing: '+token);
if(!resilienceCss.includes('.player-diagnostics-copy')||!resilienceCss.includes('focus-visible'))throw Error('Playback diagnostics copy button styling missing');

// Exported diagnostics should not reveal full URLs or query/fragment secrets.
for(const token of ["function safeSource()","Source origin:","Privacy: URL query, fragment and path omitted","video.ended?","video.paused?"])if(!mediaInfo.includes(token))throw Error("Privacy-safe playback diagnostics missing: "+token);

// Buffer health classifier guards: offline/loading/paused/waiting/low/building/healthy.
for(const token of ["function bufferHealth()","Offline","Loading media","Paused","Waiting for data","Buffer low","Buffer building","Buffer healthy","bufferHealth()","window.StoryspaceMediaInfo=Object.freeze({refresh:update,formatTime,bufferedAhead,bufferHealth})"])if(!mediaInfo.includes(token))throw Error("Player buffer health classification missing: "+token);

// Keyboard seeking must use a finite VOD window or the latest live DVR range and clamp targets.
const shortcuts=read("player-shortcuts.js");
for(const token of ["const seekWindow=()=>","video.seekable","return {start,end,live:true}","const target=clamp(video.currentTime+delta,range.start,range.end)","case \"j\":event.preventDefault();{const target=seek(-10);if(target!==false)announceSeek(\"Seek to \"+formatSeekTime(target))};break","case \"l\":event.preventDefault();{const target=seek(10);if(target!==false)announceSeek(\"Seek to \"+formatSeekTime(target))};break","seekWindow,goLive,setGuide"])if(!shortcuts.includes(token))throw Error("Player keyboard seek guard missing: "+token);

// Restart shortcut must honor VOD/live seek-window start and guard assignment.
if(!shortcuts.includes('case "r":{const range=seekWindow();if(range){try{video.currentTime=range.start;'))throw Error("Restart shortcut must use seek-window start");
// Seek shortcuts give screen-reader/visual feedback after successful seeking.
for(const token of ["const feedback=document.getElementById(\"playerGestureFeedback\")","announceSeek(\"Seek to \"+formatSeekTime(target))","aria-live","Restarted at DVR window start"])if(!shortcuts.includes(token))throw Error("Accessible keyboard seek feedback missing: "+token);
// Seek feedback should announce the clamped target (not a stale currentTime).
if(!shortcuts.includes("video.currentTime=target;return target")||!shortcuts.includes("formatSeekTime(target)"))throw Error("Seek feedback must announce the seek target");\nif(!shortcuts.includes("const goLive=()=>{const range=seekWindow();if(!range||!range.live)return false;")||!shortcuts.includes("video.currentTime=range.end;video.play().catch(()=>{});announceSeek(\"Jumped to live\"")||!shortcuts.includes('case "g":{const target=goLive();'))throw Error("Go-live shortcut must jump to the live DVR edge");\nif(!shortcuts.includes("const goLive=()=>{const range=seekWindow();if(!range||!range.live)return false;")||!shortcuts.includes("video.currentTime=range.end;video.play().catch(()=>{});announceSeek(\\\"Jumped to live\\\""))throw Error("Go-live shortcut must jump to the DVR seekable edge");
\n// Percentage seek shortcut clamps to valid VOD/DVR seek window and announces target.\nif(!shortcuts.includes("const seekPercent=percent=>{const range=seekWindow();if(!range||!Number.isFinite(percent))return false;" )|| !shortcuts.includes("range.start+(range.end-range.start)*clamp(percent,0,100)/100") || !shortcuts.includes("case \\"9\\":{const percent=Number(key)*10,target=seekPercent(percent)"))throw Error("Percentage seek shortcuts must map digits to safe seek-window percentages");\nif(!h.includes("<kbd>0</kbd>–<kbd>9</kbd> seek to 0–90%"))throw Error("Percentage seek shortcuts missing from keyboard guide");\n