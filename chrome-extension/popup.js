// Intcu Popup Script

document.addEventListener("DOMContentLoaded", () => {
  const openApp = document.getElementById("openApp");
  const openPanel = document.getElementById("openPanel");
  const scriptText = document.getElementById("scriptText");
  const scrollBtn = document.getElementById("scrollBtn");
  const userInfo = document.getElementById("userInfo");

  // Load user info
  chrome.storage.sync.get(["intcu-user-name", "intcu-user-plan"], (data) => {
    const name = data["intcu-user-name"] || "Guest";
    const plan = data["intcu-user-plan"] || "free";
    userInfo.innerHTML = `${name} · <span class="plan">${plan}</span>`;
  });

  // Load saved script
  chrome.storage.local.get("intcu-quick-script", (data) => {
    if (data["intcu-quick-script"]) {
      scriptText.value = data["intcu-quick-script"];
    }
  });

  // Save script on change
  scriptText.addEventListener("input", () => {
    chrome.storage.local.set({ "intcu-quick-script": scriptText.value });
  });

  // Open app
  openApp.addEventListener("click", () => {
    chrome.tabs.create({ url: "https://intcu.com" });
  });

  // Open side panel
  openPanel.addEventListener("click", async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.sidePanel.open({ tabId: tab.id });
      window.close();
    } catch (e) {
      console.warn("Side panel error:", e);
      chrome.tabs.create({ url: "https://intcu.com" });
    }
  });

  // Auto-scroll script
  let scrolling = false;
  let scrollInterval = null;

  scrollBtn.addEventListener("click", () => {
    if (scrolling) {
      clearInterval(scrollInterval);
      scrollBtn.textContent = "▶ Scroll";
      scrolling = false;
    } else {
      scrollBtn.textContent = "⏸ Pause";
      scrolling = true;
      scrollInterval = setInterval(() => {
        scriptText.scrollTop += 1;
        if (scriptText.scrollTop >= scriptText.scrollHeight - scriptText.clientHeight) {
          clearInterval(scrollInterval);
          scrollBtn.textContent = "▶ Scroll";
          scrolling = false;
        }
      }, 50);
    }
  });
});
