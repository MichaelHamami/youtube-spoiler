import { useState } from "react";

function App() {
  const [status, setStatus] = useState("Active");

  const sendCommand = async (action) => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        setStatus("No active tab");
        return;
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "youtube-spoiler-command",
        command: action.command,
      });

      setStatus(
        response?.ok ? action.actionLabel : response?.error || "Failed",
      );
    } catch (error) {
      console.error(error);
      setStatus("Open a YouTube video");
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h3>YouTube Spoiler Extension </h3>
      <p style={{ color: "green" }}>{status}</p>
      {Object.values(actions).map((action) => (
        <button
          key={action.command}
          onClick={() => sendCommand(action)}
          style={buttonStyle}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

export default App;

const buttonStyle = {
  display: "block",
  margin: "0.5rem 0",
  padding: "0.5rem 1rem",
  fontSize: "14px",
  cursor: "pointer",
  width: "100%",
};

const actions = {
  restart: {
    label: "Restart",
    command: "restart",
    actionLabel: "Restarted",
  },
  skip5: {
    label: "Skip 5 min",
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
