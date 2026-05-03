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

  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;

    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      setSpoilerMode("auto");
      setSpoilerHidden(true);
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
