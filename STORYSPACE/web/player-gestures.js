(() => {
  "use strict";

  const video = document.getElementById("previewVideo");
  const stage = document.getElementById("playerStage");
  const feedback = document.getElementById("playerGestureFeedback");
  const toggle = document.getElementById("playerGesturesToggle");
  const hint = document.getElementById("playerGestureHint");
  const player = document.getElementById("playerBackdrop");
  if (!video || !stage || !feedback || !toggle || !hint || !player) return;

  const STORAGE_KEY = "storyspace.playerGestures";
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
  let enabled = true;
  let brightness = 1;
  let pointer = null;
  let lastTap = { at: 0, zone: "" };
  let feedbackTimer = 0;
  let previewFrame = 0;
  let previewPoint = null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "false") enabled = false;
  } catch {
    // Keep gestures available for this session if storage is unavailable.
  }

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const isOpen = () => !player.hidden;
  const formatGestureTime = seconds => {
    const value = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const secs = value % 60;
    return hours
      ? hours + ":" + String(minutes).padStart(2, "0") + ":" + String(secs).padStart(2, "0")
      : minutes + ":" + String(secs).padStart(2, "0");
  };

  function showFeedback(message, announce = true) {
    feedback.setAttribute("aria-live", announce ? "polite" : "off");
    feedback.textContent = message;
    feedback.classList.remove("is-visible");
    // Restart the short feedback transition without reading layout.
    requestAnimationFrame(() => feedback.classList.add("is-visible"));
    window.clearTimeout(feedbackTimer);
    feedbackTimer = window.setTimeout(() => feedback.classList.remove("is-visible"), reducedMotion ? 450 : 950);
  }

  function updateToggle() {
    toggle.setAttribute("aria-pressed", String(enabled));
    toggle.textContent = "Touch gestures: " + (enabled ? "On" : "Off");
    hint.textContent = enabled
      ? "Double-tap to skip · swipe sideways to seek · swipe vertically left for brightness or right for volume."
      : "Touch gestures are off. Use the video controls or keyboard shortcuts instead.";
    stage.classList.toggle("player-gestures-disabled", !enabled);
  }

  toggle.addEventListener("click", () => {
    enabled = !enabled;
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // The setting remains active until this page is closed.
    }
    pointer = null;
    lastTap = { at: 0, zone: "" };
    updateToggle();
  });

  function getZone(clientX, rect) {
    const position = (clientX - rect.left) / Math.max(1, rect.width);
    if (position < 0.34) return "left";
    if (position > 0.66) return "right";
    return "center";
  }

  function getSeekRange() {
    try {
      if (video.seekable && video.seekable.length) {
        const last = video.seekable.length - 1;
        const start = video.seekable.start(last);
        const end = video.seekable.end(last);
        if (Number.isFinite(start) && Number.isFinite(end) && end >= start) return { start, end };
      }
    } catch {
      // Fall back to the finite VOD duration when seekable ranges are unavailable.
    }
    return Number.isFinite(video.duration) && video.duration > 0
      ? { start: 0, end: video.duration }
      : null;
  }

  function startGesture(event) {
    if (!enabled || !isOpen() || !["touch", "pen"].includes(event.pointerType)) return;
    if (event.target !== video) return;
    const rect = video.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    // Leave the browser's native control strip fully interactive.
    if (event.clientY >= rect.bottom - Math.max(44, rect.height * 0.14)) return;
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      zone: getZone(event.clientX, rect),
      rect,
      startedAt: performance.now()
    };
  }

  function renderGesturePreview(point) {
    if (!pointer || point.pointerId !== pointer.id || !enabled || !isOpen()) return;
    const dx=point.clientX-pointer.x,dy=point.clientY-pointer.y;
    const seekRange = Math.abs(dx)>=24&&Math.abs(dx)>Math.abs(dy)*1.15&&video.readyState>=1 ? getSeekRange() : null;
    if(seekRange){
      const range=seekRange,maxSwipeSeconds=Math.max(20,Math.min(120,(range.end-range.start)*0.28));
      const delta=clamp((dx/pointer.rect.width)*maxSwipeSeconds,-90,90);
      const target=clamp(video.currentTime+delta,range.start,range.end);
      showFeedback("Seek preview · "+formatGestureTime(target)+" ("+(target>=video.currentTime?"+":"−")+Math.round(Math.abs(target-video.currentTime))+"s)", false);
      return;
    }
    if(Math.abs(dy)>=24&&Math.abs(dy)>Math.abs(dx)*1.15){
      if(pointer.zone==="left"){
        const value=clamp(brightness-dy/pointer.rect.height*0.75,0.45,1.4);
        showFeedback("Brightness preview · "+Math.round(value*100)+"%", false);
      }else if(pointer.zone==="right"){
        const value=clamp(video.volume-dy/pointer.rect.height*0.75,0,1);
        showFeedback("Volume preview · "+Math.round(value*100)+"%", false);
      }
    }
  }

  function previewGesture(event) {
    // Coalesce high-frequency touchmove events to one calculation per frame.
    previewPoint = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY };
    if (previewFrame) return;
    previewFrame = requestAnimationFrame(() => {
      previewFrame = 0;
      const point = previewPoint;
      previewPoint = null;
      if (point) renderGesturePreview(point);
    });
  }

  function finishGesture(event) {
    if (previewFrame) cancelAnimationFrame(previewFrame);
    previewFrame = 0;
    previewPoint = null;
    if (!pointer || event.pointerId !== pointer.id) return;
    const start = pointer;
    pointer = null;
    if (!enabled || !isOpen()) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dy) >= 42 && Math.abs(dy) > Math.abs(dx) * 1.25) {
      if(start.zone==="left"){
        brightness=clamp(brightness-dy/start.rect.height*0.75,0.45,1.4);
        video.style.filter="brightness("+brightness.toFixed(2)+")";
        showFeedback("Brightness "+Math.round(brightness*100)+"%");
      }else if(start.zone==="right"){
        video.volume=clamp(video.volume-dy/start.rect.height*0.75,0,1);
        showFeedback("Volume "+Math.round(video.volume*100)+"%");
      }else return;
      lastTap={at:0,zone:""};
      if(event.cancelable)event.preventDefault();
      return;
    }
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      const range = getSeekRange();
      if (!range || video.readyState < 1) return;
      const maxSwipeSeconds = Math.max(20, Math.min(120, (range.end - range.start) * 0.28));
      const delta = clamp((dx / start.rect.width) * maxSwipeSeconds, -90, 90);
      const before = video.currentTime;
      const next = clamp(before + delta, range.start, range.end);
      video.currentTime = next;
      lastTap = { at: 0, zone: "" };
      showFeedback((next >= before ? "Forward " : "Back ") +
        Math.round(Math.abs(next - before)) + " sec · " + formatGestureTime(next));
      if (event.cancelable) event.preventDefault();
      return;
    }

    if (Math.abs(dx) > 15 || Math.abs(dy) > 15) return;
    const now = performance.now();
    const zone = getZone(event.clientX, start.rect);
    if (zone !== "center" && zone === lastTap.zone && now - lastTap.at <= 320) {
      const range = getSeekRange();
      if (!range || video.readyState < 1) return;
      const delta = zone === "left" ? -10 : 10;
      const before = video.currentTime;
      const next = clamp(before + delta, range.start, range.end);
      video.currentTime = next;
      lastTap = { at: 0, zone: "" };
      showFeedback((next >= before ? "Forward " : "Back ") +
        Math.round(Math.abs(next - before)) + " sec · " + formatGestureTime(next));
      if (event.cancelable) event.preventDefault();
      return;
    }
    lastTap = { at: now, zone };
  }

  function cancelGesture(event) {
    if (pointer && event.pointerId === pointer.id) {
      if (previewFrame) cancelAnimationFrame(previewFrame);
      previewFrame = 0;
      previewPoint = null;
      pointer = null;
      lastTap = { at: 0, zone: "" };
      feedback.classList.remove("is-visible");
    }
  }

  stage.addEventListener("pointerdown", startGesture, { passive: true });
  stage.addEventListener("pointermove", previewGesture, { passive: true });
  window.addEventListener("pointerup", finishGesture, { passive: false, capture: true });
  window.addEventListener("pointercancel", cancelGesture, { passive: true, capture: true });
  player.addEventListener("transitionend", () => {
    if (player.hidden) {
      pointer = null;
      lastTap = { at: 0, zone: "" };
      feedback.classList.remove("is-visible");
    }
  });

  window.addEventListener("blur", () => { pointer = null; lastTap = { at: 0, zone: "" }; });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { pointer = null; lastTap = { at: 0, zone: "" }; } });

  updateToggle();
  window.StoryspacePlayerGestures = Object.freeze({
    isEnabled: () => enabled,
    formatTime: formatGestureTime,
    brightness: () => brightness
  });
})();
