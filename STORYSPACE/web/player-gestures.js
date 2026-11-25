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
  let pointer = null;
  let lastTap = { at: 0, zone: "" };
  let feedbackTimer = 0;\n  let holdTimer = 0;\n  let fastPlayback = false;\n  let brightness = 1;\n  try { brightness = clamp(Number(localStorage.getItem("storyspace.playerBrightness")) || 1, 0.4, 1.6); } catch {}\n  video.style.filter = "brightness(" + brightness + ")";

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

  function showFeedback(message) {
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
      ? "Double-tap the left or right side to skip 10 seconds. Swipe sideways to seek."
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

  function startGesture(event) {
    if (!enabled || !isOpen() || !["touch", "pen"].includes(event.pointerType)) return;
    if (event.target !== video) return;
    const rect = video.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    // Leave native controls and browser scrolling affordances alone.
    if (event.clientY >= rect.bottom - Math.max(44, rect.height * 0.14)) return;
    pointer = {
      id: event.pointerId, x: event.clientX, y: event.clientY,
      zone: getZone(event.clientX, rect), rect, startedAt: performance.now(),
      longPress: false
    };
    window.clearTimeout(holdTimer);
    holdTimer = window.setTimeout(() => {
      if (!pointer || pointer.id !== event.pointerId || !enabled || !isOpen()) return;
      pointer.longPress = true;
      fastPlayback = true;
      video.playbackRate = 2;
      showFeedback("2× speed · hold to fast-forward");
    }, 420);
  }

  function finishGesture(event) {
    if (!pointer || event.pointerId !== pointer.id) return;
    const start = pointer;
    pointer = null;
    window.clearTimeout(holdTimer);
    if (!enabled || !isOpen()) {
      if (fastPlayback) { video.playbackRate = Number(localStorage.getItem("storyspace.playerSpeed")) || 1; fastPlayback = false; }
      return;
    }
    if (start.longPress) {
      video.playbackRate = Number(localStorage.getItem("storyspace.playerSpeed")) || 1;
      fastPlayback = false;
      showFeedback("Playback speed restored");
      return;
    }
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (Math.abs(dy) >= 42 && Math.abs(dy) > Math.abs(dx) * 1.25) {
      const zone = getZone(start.x, start.rect);
      const factor = clamp(Math.abs(dy) / start.rect.height, 0.06, 0.42);
      if (zone === "left") {
        brightness = clamp(brightness + (dy < 0 ? factor : -factor), 0.4, 1.6);
        video.style.filter = "brightness(" + brightness.toFixed(2) + ")";
        try { localStorage.setItem("storyspace.playerBrightness", String(brightness)); } catch {}
        showFeedback("Brightness · " + Math.round(brightness * 100) + "%");
      } else if (zone === "right") {
        video.volume = clamp(video.volume + (dy < 0 ? factor : -factor), 0, 1);
        if (video.volume > 0) video.muted = false;
        showFeedback("Volume · " + Math.round(video.volume * 100) + "%");
      } else {
        showFeedback("Swipe left/right or use the video controls");
      }
      lastTap = { at: 0, zone: "" };
      if (event.cancelable) event.preventDefault();
      return;
    }
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      if (!Number.isFinite(video.duration) || video.duration <= 0 || video.readyState < 1) return;
      const maxSwipeSeconds = Math.max(20, Math.min(120, video.duration * 0.28));
      const delta = clamp((dx / start.rect.width) * maxSwipeSeconds, -90, 90);
      const before = video.currentTime, next = clamp(before + delta, 0, video.duration);
      video.currentTime = next;
      lastTap = { at: 0, zone: "" };
      showFeedback((next >= before ? "Forward " : "Back ") + Math.round(Math.abs(next - before)) + " sec · " + formatGestureTime(next));
      if (event.cancelable) event.preventDefault();
      return;
    }
    if (Math.abs(dx) > 15 || Math.abs(dy) > 15) return;
    const now = performance.now(), zone = getZone(event.clientX, start.rect);
    if (zone !== "center" && zone === lastTap.zone && now - lastTap.at <= 320) {
      if (!Number.isFinite(video.duration) || video.duration <= 0 || video.readyState < 1) return;
      const delta = zone === "left" ? -10 : 10;
      const before = video.currentTime, next = clamp(before + delta, 0, video.duration);
      video.currentTime = next; lastTap = { at: 0, zone: "" };
      showFeedback((next >= before ? "Forward " : "Back ") + Math.round(Math.abs(next - before)) + " sec · " + formatGestureTime(next));
      if (event.cancelable) event.preventDefault();
      return;
    }
    lastTap = { at: now, zone };
  }

  function cancelGesture(event) {
    if (pointer && event.pointerId === pointer.id) {
      pointer = null;
      window.clearTimeout(holdTimer);
      if (fastPlayback) {
        video.playbackRate = Number(localStorage.getItem("storyspace.playerSpeed")) || 1;
        fastPlayback = false;
      }
    }
  }

 cancelGesture, { passive: true, capture: true });
  player.addEventListener("transitionend", () => {
    if (player.hidden) {
      pointer = null;
      lastTap = { at: 0, zone: "" };
      feedback.classList.remove("is-visible");
    }
  });

  updateToggle();
  window.StoryspacePlayerGestures = Object.freeze({
    isEnabled: () => enabled,
    formatTime: formatGestureTime
  });
})();
