// Intcu Side Panel Script

const frame = document.getElementById("intcuFrame");

// Listen for injected text from background.js context menus
chrome.runtime.sendMessage({ type: "getInjectedText" }, (response) => {
  if (response?.text) {
    // Wait for iframe to load, then pass the text via postMessage
    frame.addEventListener("load", () => {
      frame.contentWindow.postMessage({
        type: "intcu-inject",
        text: response.text,
        action: response.action || "script",
      }, "https://intcu.com");
    }, { once: true });
  }
});

// Also listen for future injections while panel is open
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes["intcu-inject-text"]?.newValue) {
    const text = changes["intcu-inject-text"].newValue;
    chrome.storage.local.get("intcu-inject-action", (data) => {
      frame.contentWindow.postMessage({
        type: "intcu-inject",
        text: text,
        action: data["intcu-inject-action"] || "script",
      }, "https://intcu.com");
      // Clear after sending
      chrome.storage.local.remove(["intcu-inject-text", "intcu-inject-action"]);
    });
  }
});

// Clear badge when panel opens
chrome.runtime.sendMessage({ type: "clearBadge" });
