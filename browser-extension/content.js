(() => {
  if (window.__spamshieldContentScriptLoaded) {
    return;
  }
  window.__spamshieldContentScriptLoaded = true;

  let lastX = 0;
  let lastY = 0;
  let outsideClickHandler = null;
  const CARD_ID = "spamshield-card";

  function escapeHtml(input) {
    return String(input)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  document.addEventListener("contextmenu", (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
  });

  function removeCard() {
    if (outsideClickHandler) {
      document.removeEventListener("mousedown", outsideClickHandler, true);
      outsideClickHandler = null;
    }

    const existing = document.getElementById(CARD_ID);
    if (existing) existing.remove();
  }

  function attachOutsideClickToDismiss(card) {
    if (outsideClickHandler) {
      document.removeEventListener("mousedown", outsideClickHandler, true);
      outsideClickHandler = null;
    }

    outsideClickHandler = (e) => {
      if (!card.contains(e.target)) {
        removeCard();
      }
    };

    document.addEventListener("mousedown", outsideClickHandler, true);
  }

  function updateAnchorFromSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    let rect = range.getBoundingClientRect();

    if (!rect || (rect.width === 0 && rect.height === 0)) {
      const rects = range.getClientRects();
      rect = rects.length > 0 ? rects[0] : null;
    }

    if (!rect) {
      return;
    }

    const anchorX = Number.isFinite(rect.left) ? rect.left : lastX;
    const anchorY = Number.isFinite(rect.bottom) ? rect.bottom : lastY;

    lastX = Math.max(0, anchorX);
    lastY = Math.max(0, anchorY);
  }

  function setCardPosition(card, width = 276, height = 130) {
    const MIN_MARGIN = 8;
    const maxX = window.innerWidth - width - MIN_MARGIN;
    const maxY = window.innerHeight - height - MIN_MARGIN;

    const x = Math.max(MIN_MARGIN, Math.min(lastX, maxX));
    const y = Math.max(MIN_MARGIN, Math.min(lastY, maxY));

    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
  }

  function showCard({ category, probability }) {
    removeCard();
    updateAnchorFromSelection();

    const isSpam = category === "spam";
    const percent = (probability * 100).toFixed(1);

    const card = document.createElement("div");
    card.id = CARD_ID;
    card.setAttribute("role", "status");
    card.setAttribute("aria-live", "polite");

    card.innerHTML = `
      <div class="ss-header ss-header--${isSpam ? "spam" : "safe"}">
        <span class="ss-title">${isSpam ? "⚠ Spam Detected" : "✓ Not Spam"}</span>
        <button class="ss-close" aria-label="Dismiss">&times;</button>
      </div>
      <div class="ss-body">
        <div class="ss-label">Spam probability</div>
        <div class="ss-percent">${percent}%</div>
        <div class="ss-bar-track">
          <div class="ss-bar-fill ss-bar-fill--${isSpam ? "spam" : "safe"}" style="width: ${percent}%"></div>
        </div>
      </div>
    `;

    setCardPosition(card, 276, 130);

    document.body.appendChild(card);

    card.querySelector(".ss-close").addEventListener("click", removeCard);
    attachOutsideClickToDismiss(card);
  }

  function showError(message) {
    removeCard();
    updateAnchorFromSelection();

    const card = document.createElement("div");
    card.id = CARD_ID;
    card.setAttribute("role", "alert");

    card.innerHTML = `
      <div class="ss-header ss-header--error">
        <span class="ss-title">SpamShield Error</span>
        <button class="ss-close" aria-label="Dismiss">&times;</button>
      </div>
      <div class="ss-body">
        <div class="ss-error-msg">${escapeHtml(message)}</div>
      </div>
    `;

    setCardPosition(card, 276, 108);

    document.body.appendChild(card);
    card.querySelector(".ss-close").addEventListener("click", removeCard);

    attachOutsideClickToDismiss(card);
  }

  function showInfo(message) {
    removeCard();

    const card = document.createElement("div");
    card.id = CARD_ID;
    card.setAttribute("role", "status");

    card.innerHTML = `
      <div class="ss-header ss-header--info">
        <span class="ss-title">SpamShield</span>
        <button class="ss-close" aria-label="Dismiss">&times;</button>
      </div>
      <div class="ss-body">
        <div class="ss-info-msg">${escapeHtml(message)}</div>
      </div>
    `;

    setCardPosition(card, 276, 108);

    document.body.appendChild(card);
    card.querySelector(".ss-close").addEventListener("click", removeCard);

    attachOutsideClickToDismiss(card);
  }

  function showLogin() {
    removeCard();

    const card = document.createElement("div");
    card.id = CARD_ID;
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-label", "SpamShield login");

    card.innerHTML = `
      <div class="ss-header ss-header--info">
        <span class="ss-title">Login to SpamShield</span>
        <button class="ss-close" aria-label="Dismiss">&times;</button>
      </div>
      <form class="ss-body ss-login-form">
        <label class="ss-form-label" for="ss-email">Email</label>
        <input id="ss-email" class="ss-input" type="email" required autocomplete="email" />

        <label class="ss-form-label" for="ss-password">Password</label>
        <input id="ss-password" class="ss-input" type="password" required autocomplete="current-password" />

        <button class="ss-button" type="submit">Login</button>
        <div class="ss-form-status" aria-live="polite"></div>
      </form>
    `;

    setCardPosition(card, 300, 260);
    document.body.appendChild(card);

    card.querySelector(".ss-close").addEventListener("click", removeCard);

    const form = card.querySelector(".ss-login-form");
    const emailInput = card.querySelector("#ss-email");
    const passwordInput = card.querySelector("#ss-password");
    const status = card.querySelector(".ss-form-status");
    const submitButton = card.querySelector(".ss-button");

    emailInput.focus();

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        status.textContent = "Please fill in both fields.";
        status.classList.add("ss-form-status--error");
        return;
      }

      status.textContent = "Logging in...";
      status.classList.remove("ss-form-status--error");
      submitButton.disabled = true;

      chrome.runtime.sendMessage(
        {
          type: "SPAM_LOGIN",
          email,
          password,
        },
        (response) => {
          submitButton.disabled = false;

          if (chrome.runtime.lastError) {
            status.textContent = "Login failed. Extension connection error.";
            status.classList.add("ss-form-status--error");
            return;
          }

          if (!response?.ok) {
            status.textContent = response?.error || "Login failed.";
            status.classList.add("ss-form-status--error");
            return;
          }

          showInfo(`Logged in as ${response.email} (${response.role})`);
        }
      );
    });

    attachOutsideClickToDismiss(card);
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "SPAM_RESULT") {
      showCard({ category: msg.category, probability: msg.probability });
    } else if (msg.type === "SPAM_ERROR") {
      showError(msg.message);
    } else if (msg.type === "SPAM_SHOW_LOGIN") {
      showLogin();
    } else if (msg.type === "SPAM_SESSION_EXPIRED") {
      showInfo(msg.message || "Session expired. Please log in again.");
    }
  });
})();
