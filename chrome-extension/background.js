// Intcu Chrome Extension — Background Service Worker

// Create context menus on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendToIntcu",
    title: "Send to Intcu Script",
    contexts: ["selection"],
  });
  chrome.contextMenus.create({
    id: "brainstormIntcu",
    title: "Brainstorm this with Intcu",
    contexts: ["selection"],
  });
  console.log("Intcu extension installed — context menus created");
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const text = info.selectionText;
  if (!text) return;

  if (info.menuItemId === "sendToIntcu") {
    await chrome.storage.local.set({ "intcu-inject-text": text, "intcu-inject-action": "script" });
    // Open side panel
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (e) {
      console.warn("Side panel open failed:", e);
      // Fallback: open intcu.com
      chrome.tabs.create({ url: "https://intcu.com" });
    }
  } else if (info.menuItemId === "brainstormIntcu") {
    await chrome.storage.local.set({ "intcu-inject-text": text, "intcu-inject-action": "brainstorm" });
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (e) {
      chrome.tabs.create({ url: "https://intcu.com" });
    }
  }

  // Update badge
  const data = await chrome.storage.local.get("intcu-inject-count");
  const count = (data["intcu-inject-count"] || 0) + 1;
  await chrome.storage.local.set({ "intcu-inject-count": count });
  chrome.action.setBadgeText({ text: String(count) });
  chrome.action.setBadgeBackgroundColor({ color: "#00D4C8" });
});

// Message listener for popup/sidepanel/content communication
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "openSidePanel") {
    chrome.sidePanel.open({ tabId: sender.tab?.id }).catch(() => {});
    sendResponse({ ok: true });
  } else if (msg.type === "getInjectedText") {
    chrome.storage.local.get(["intcu-inject-text", "intcu-inject-action"], (data) => {
      sendResponse({ text: data["intcu-inject-text"] || "", action: data["intcu-inject-action"] || "script" });
      // Clear after reading
      chrome.storage.local.remove(["intcu-inject-text", "intcu-inject-action"]);
    });
    return true; // async response
  } else if (msg.type === "clearBadge") {
    chrome.action.setBadgeText({ text: "" });
    chrome.storage.local.set({ "intcu-inject-count": 0 });
    sendResponse({ ok: true });
  }
});
