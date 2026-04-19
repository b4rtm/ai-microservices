(() => {
  let lastX = 0;
  let lastY = 0;
  const CARD_ID = "spamshield-card";

  // Track the position of the most recent right-click so we can anchor the card there.
  document.addEventListener("contextmenu", (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
  });

  function removeCard() {
    const existing = document.getElementById(CARD_ID);
    if (existing) existing.remove();
  }

  function showCard({ category, probability }) {
    removeCard();

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

    // Position card near the cursor, clamped to the viewport.
    const OFFSET = 12;
    const CARD_WIDTH = 276;
    const CARD_HEIGHT = 130;

    let x = lastX + OFFSET;
    let y = lastY + OFFSET;

    if (x + CARD_WIDTH > window.innerWidth - 8) {
      x = lastX - CARD_WIDTH - OFFSET;
    }
    if (y + CARD_HEIGHT > window.innerHeight - 8) {
      y = lastY - CARD_HEIGHT - OFFSET;
    }

    card.style.left = `${Math.max(8, x)}px`;
    card.style.top = `${Math.max(8, y)}px`;

    document.body.appendChild(card);

    card.querySelector(".ss-close").addEventListener("click", removeCard);

    // Dismiss when clicking anywhere outside the card.
    const outsideClick = (e) => {
      if (!card.contains(e.target)) {
        removeCard();
        document.removeEventListener("mousedown", outsideClick, true);
      }
    };
    document.addEventListener("mousedown", outsideClick, true);
  }

  function showError(message) {
    removeCard();

    const card = document.createElement("div");
    card.id = CARD_ID;
    card.setAttribute("role", "alert");

    card.innerHTML = `
      <div class="ss-header ss-header--error">
        <span class="ss-title">SpamShield Error</span>
        <button class="ss-close" aria-label="Dismiss">&times;</button>
      </div>
      <div class="ss-body">
        <div class="ss-error-msg">${message}</div>
      </div>
    `;

    const OFFSET = 12;
    card.style.left = `${Math.max(8, lastX + OFFSET)}px`;
    card.style.top = `${Math.max(8, lastY + OFFSET)}px`;

    document.body.appendChild(card);
    card.querySelector(".ss-close").addEventListener("click", removeCard);

    const outsideClick = (e) => {
      if (!card.contains(e.target)) {
        removeCard();
        document.removeEventListener("mousedown", outsideClick, true);
      }
    };
    document.addEventListener("mousedown", outsideClick, true);
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "SPAM_RESULT") {
      showCard({ category: msg.category, probability: msg.probability });
    } else if (msg.type === "SPAM_ERROR") {
      showError(msg.message);
    }
  });
})();
