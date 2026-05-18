function getVideo() {
  return document.querySelector("video");
}

function getPlayerControls() {
  return {
    timeDisplay: document.querySelector("div.ytp-time-display.notranslate"),
    progressBar: document.querySelector("div.ytp-progress-bar-container"),
  };
}

function installHideStyle() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    html[${HIDE_ATTRIBUTE}="true"] .ytp-time-display.notranslate,
    html[${HIDE_ATTRIBUTE}="true"] .ytp-progress-bar-container {
      display: none !important;
    }
  `;

  document.documentElement.appendChild(style);
}

function setSpoilerHidden(hidden) {
  document.documentElement.setAttribute(HIDE_ATTRIBUTE, String(hidden));
}

function setSpoilerMode(mode) {
  document.documentElement.setAttribute(MODE_ATTRIBUTE, mode);
}

function getSpoilerMode() {
  return document.documentElement.getAttribute(MODE_ATTRIBUTE) || "auto";
}

function hasSpoilerTitle() {
  const title = document.title.toLowerCase();
  return SPOILER_TITLES.some((titleToSearch) => title.includes(titleToSearch));
}

function hasUsefulTitle() {
  const title = document.title.trim().toLowerCase();
  return title && title !== "youtube";
}

function hideSpoilerElements() {
  const mode = getSpoilerMode();

  if (mode === "show") {
    setSpoilerHidden(false);
    return;
  }

  if (mode === "hide") {
    setSpoilerHidden(true);
    return;
  }

  setSpoilerHidden(!hasUsefulTitle() || hasSpoilerTitle());
}

function restartVideo() {
  const video = getVideo();
  if (!video) return { ok: false, error: "No video found" };

  video.currentTime = 0;
  return { ok: true };
}

function skipVideo(minutes) {
  const video = getVideo();
  if (!video) return { ok: false, error: "No video found" };

  video.currentTime = Math.min(
    video.duration,
    video.currentTime + minutes * 60,
  );
  return { ok: true };
}

function isLiveVideo() {
  const video = getVideo();
  if (!video) return false;

  const isNaNDuration = isNaN(video.duration);
  if (isNaNDuration) {
    console.log("Video duration:", video.duration);
    return true; // Some live videos may have NaN duration
  }
  return video.duration === Infinity;
}

function togglePlayPause() {
  const video = getVideo();
  if (!video) return { ok: false, error: "No video found" };

  // Toggle play/pause for all videos
  if (video.paused) {
    video.play().catch((err) => console.error("Play failed:", err));
  } else {
    video.pause();
  }

  return { ok: true };
}

function autoRestartLiveVideo() {
  const video = getVideo();
  if (!video) return;

  // Check if video is live and restart it
  if (isLiveVideo()) {
    video.currentTime = 0;
  }
}

function hideControls() {
  setSpoilerMode("hide");
  setSpoilerHidden(true);
  return { ok: true };
}

function showControls() {
  const { timeDisplay, progressBar } = getPlayerControls();

  setSpoilerMode("show");
  setSpoilerHidden(false);

  if (timeDisplay) {
    timeDisplay.style.removeProperty("display");
  }

  if (progressBar) {
    progressBar.style.removeProperty("display");
  }

  return { ok: true };
}

function handleCommand(command) {
  switch (command) {
    case "restart":
      return restartVideo();

    case "skip5":
      return skipVideo(5);

    case "hide":
      return hideControls();

    case "show":
      return showControls();

    case "togglePlayPause":
      return togglePlayPause();

    default:
      return { ok: false, error: `Unknown command: ${command}` };
  }
}

function listenForPopupCommands() {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "youtube-spoiler-command") return false;

    sendResponse(handleCommand(message.command));
    return false;
  });
}

function init() {
  installHideStyle();
  setSpoilerMode("auto");
  setSpoilerHidden(true);
  hideSpoilerElements();
  listenForPopupCommands();

  // Auto-restart live videos when they load
  let videoElement = null;
  const checkAndRestartLive = () => {
    const currentVideo = getVideo();
    if (currentVideo && currentVideo !== videoElement) {
      videoElement = currentVideo;
      // Give video time to load metadata
      setTimeout(() => autoRestartLiveVideo(), 500);
    }
  };

  // Check for video element periodically
  setInterval(checkAndRestartLive, 1000);

  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;

    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      setSpoilerMode("auto");
      setSpoilerHidden(true);
      videoElement = null; // Reset video reference on URL change
      checkAndRestartLive(); // Check for new video
    }

    hideSpoilerElements();
  }).observe(document.documentElement, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

const HIDE_ATTRIBUTE = "data-youtube-spoiler-hide";
const MODE_ATTRIBUTE = "data-youtube-spoiler-mode";
const STYLE_ID = "youtube-spoiler-blocker-style";
const SPOILER_TITLES = ["lck", "lec", "msi", "ewc", "worlds"];

init();
