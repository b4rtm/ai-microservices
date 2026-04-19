const API_URL = "http://localhost:8080/spam/predict";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "checkSpam",
    title: "Check for Spam",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "checkSpam" || !info.selectionText || !tab?.id)
    return;

  const text = info.selectionText.trim();
  if (!text) return;

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      return res.json();
    })
    .then((data) => {
      chrome.tabs.sendMessage(tab.id, {
        type: "SPAM_RESULT",
        category: data.category,
        probability: data.spam_probability,
      });
    })
    .catch((err) => {
      chrome.tabs.sendMessage(tab.id, {
        type: "SPAM_ERROR",
        message: err.message || "Could not reach the spam detection service.",
      });
    });
});
