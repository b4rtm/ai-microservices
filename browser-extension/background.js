const SPAM_API_URL = "http://localhost:8080/spam/predict";
const SPAM_BERT_API_URL = "http://localhost:8080/spam/predict-bert";
const LOGIN_API_URL = "http://localhost:8080/auth/login";
const AUTH_STORAGE_KEY = "spamshieldAuth";

function sendToTab(tabId, payload) {
  const trySend = () =>
    new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, payload, () => {
        resolve({
          sent: !chrome.runtime.lastError,
          errorMessage: chrome.runtime.lastError?.message || "",
        });
      });
    });

  trySend().then(async (result) => {
    if (result.sent) {
      return;
    }

    const noReceiver = result.errorMessage.includes(
      "Receiving end does not exist"
    );
    if (!noReceiver) {
      return;
    }

    try {
      await chrome.scripting.insertCSS({
        target: { tabId },
        files: ["content.css"],
      });
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"],
      });

      await trySend();
    } catch (_error) {
    }
  });
}

function getStoredAuth() {
  return new Promise((resolve) => {
    chrome.storage.local.get([AUTH_STORAGE_KEY], (result) => {
      resolve(result[AUTH_STORAGE_KEY] || null);
    });
  });
}

function setStoredAuth(authData) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [AUTH_STORAGE_KEY]: authData }, resolve);
  });
}

function clearStoredAuth() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(AUTH_STORAGE_KEY, resolve);
  });
}

function getPredictEndpoint(menuItemId) {
  if (menuItemId === "checkSpamBert") {
    return SPAM_BERT_API_URL;
  }

  return SPAM_API_URL;
}

async function requestSpamPrediction(endpoint, text, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ text }),
  });

  return response;
}

async function handleSpamCheck(info, tab) {
  const isPredictMenu =
    info.menuItemId === "checkSpam" || info.menuItemId === "checkSpamBert";
  if (!isPredictMenu || !info.selectionText || !tab?.id) {
    return;
  }

  const text = info.selectionText.trim();
  if (!text) {
    return;
  }

  try {
    const auth = await getStoredAuth();
    const token = auth?.token;
    const endpoint = getPredictEndpoint(info.menuItemId);

    let response = await requestSpamPrediction(endpoint, text, token);

    if (response.status === 401 && token) {
      await clearStoredAuth();

      sendToTab(tab.id, {
        type: "SPAM_SESSION_EXPIRED",
        message: "Session expired. You were logged out.",
      });

      response = await requestSpamPrediction(endpoint, text, null);
    }

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    sendToTab(tab.id, {
      type: "SPAM_RESULT",
      category: data.category,
      probability: data.spam_probability,
    });
  } catch (err) {
    sendToTab(tab.id, {
      type: "SPAM_ERROR",
      message: err.message || "Could not reach the spam detection service.",
    });
  }
}

async function handleLoginMessage(message, sendResponse) {
  try {
    const response = await fetch(LOGIN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: message.email,
        password: message.password,
      }),
    });

    if (!response.ok) {
      throw new Error(response.status === 401 ? "Invalid credentials." : `Login failed (${response.status}).`);
    }

    const loginData = await response.json();
    await setStoredAuth(loginData);

    sendResponse({
      ok: true,
      email: loginData.email,
      role: loginData.role,
    });
  } catch (err) {
    sendResponse({
      ok: false,
      error: err.message || "Login request failed.",
    });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "checkSpam",
    title: "Check for Spam",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "loginSpamShield",
    title: "Login to SpamShield",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "checkSpamBert",
    title: "Check for Spam (BERT)",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) {
    return;
  }

  if (info.menuItemId === "loginSpamShield") {
    sendToTab(tab.id, { type: "SPAM_SHOW_LOGIN" });
    return;
  }

  handleSpamCheck(info, tab);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "SPAM_LOGIN") {
    handleLoginMessage(message, sendResponse);
    return true;
  }

  if (message?.type === "SPAM_LOGOUT") {
    clearStoredAuth().then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message?.type === "SPAM_GET_AUTH") {
    getStoredAuth().then((auth) => {
      sendResponse({
        ok: true,
        auth: auth
          ? {
              email: auth.email,
              role: auth.role,
              userId: auth.userId,
            }
          : null,
      });
    });
    return true;
  }
});
