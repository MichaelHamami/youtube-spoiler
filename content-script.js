function hideSpoilerElements() {
  console.log("Spoiler script running");
  const title = document.title.toLowerCase();
  const hasSpoiler =
    title.includes("lck") || title.includes("lec") || title.includes("msi");
  console.log(hasSpoiler);

  if (!hasSpoiler) return;

  const observer = new MutationObserver(() => {
    const timeDisplay = document.querySelector(
      "div.ytp-time-display.notranslate"
    );
    const progressBar = document.querySelector(
      "div.ytp-progress-bar-container"
    );

    if (timeDisplay) {
      timeDisplay.style.display = "none";
    }

    if (progressBar) {
      progressBar.style.display = "none";
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Run immediately and on history changes (SPA)
const init = () => {
  hideSpoilerElements();

  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      setTimeout(hideSpoilerElements, 500);
    }
  }).observe(document.body, { childList: true, subtree: true });
};

init();
