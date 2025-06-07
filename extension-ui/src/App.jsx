function App() {
  const sendCommand = async (command) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab.id) return;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (cmd) => {
        const video = document.querySelector("video");
        if (!video) {
          console.log("No video found");
          return;
        }

        if (cmd === "restart") {
          video.currentTime = 0;
        } else if (cmd === "skip5") {
          video.currentTime = Math.min(video.duration, video.currentTime + 300);
        } else if (cmd === "hide") {
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
        } else if (cmd === "show") {
          const timeDisplay = document.querySelector(
            "div.ytp-time-display.notranslate"
          );
          const progressBar = document.querySelector(
            "div.ytp-progress-bar-container"
          );

          if (timeDisplay) {
            timeDisplay.style.display = "block";
          }

          if (progressBar) {
            progressBar.style.display = "block";
          }
        }
      },
      args: [command],
    });
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h3>My YouTube Spoiler Extension </h3>
      <p style={{ color: "green" }}>✅ Active</p>
      {Object.values(actions).map((action) => (
        <button
          key={action.command}
          onClick={() => sendCommand(action.command)}
          style={buttonStyle}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

const actions = {
  restart: {
    label: "⏮ Restart",
    command: "restart",
    actionLabel: "Restarted",
  },
  skip5: {
    label: "⏩ Skip 5 min",
    command: "skip5",
    actionLabel: "Skipped 5 minutes",
  },
  hide: {
    label: "Hide",
    command: "hide",
    actionLabel: "Hidden",
  },
  show: {
    label: "Show",
    command: "show",
    actionLabel: "Shown",
  },
};

const buttonStyle = {
  display: "block",
  margin: "0.5rem 0",
  padding: "0.5rem 1rem",
  fontSize: "14px",
  cursor: "pointer",
  width: "100%",
};
export default App;
