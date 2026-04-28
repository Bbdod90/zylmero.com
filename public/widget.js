(function () {
  var script = document.currentScript;
  if (!script) return;

  var chatbotId = script.getAttribute("data-id");
  if (!chatbotId) return;

  var apiOrigin;
  try {
    apiOrigin = new URL(script.src).origin;
  } catch (_e) {
    return;
  }
  var apiUrl = apiOrigin + "/api/chat";

  var conversationId = null;
  var isOpen = false;
  var isBusy = false;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function addMessage(role, content) {
    var wrap = el("div", role === "user" ? "zl-row zl-row-user" : "zl-row zl-row-bot");
    var bubble = el("div", role === "user" ? "zl-bubble zl-user" : "zl-bubble zl-bot", content);
    wrap.appendChild(bubble);
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function setBusy(next) {
    isBusy = next;
    input.disabled = next;
    sendBtn.disabled = next;
    sendBtn.textContent = next ? "..." : "Verstuur";
  }

  function toggle(openState) {
    isOpen = openState;
    panel.style.display = isOpen ? "flex" : "none";
    if (isOpen) {
      input.focus();
    }
  }

  function sendMessage() {
    var text = input.value.trim();
    if (!text || isBusy) return;
    input.value = "";
    addMessage("user", text);
    setBusy(true);

    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatbot_id: chatbotId,
        message: text,
        gesprek_id: conversationId,
        kanaal: "web",
        stream: false,
      }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Kon geen antwoord ophalen.");
        return res.json();
      })
      .then(function (data) {
        if (data && data.gesprek_id) conversationId = data.gesprek_id;
        addMessage("bot", data && data.reply ? String(data.reply) : "Er kwam geen antwoord.");
      })
      .catch(function () {
        addMessage("bot", "Sorry, er ging iets mis. Probeer het zo opnieuw.");
      })
      .finally(function () {
        setBusy(false);
      });
  }

  var style = el("style");
  style.textContent =
    ".zl-bubble-btn{position:fixed;right:22px;bottom:22px;z-index:2147483000;height:56px;min-width:56px;padding:0 18px;border:none;border-radius:999px;background:#111827;color:#fff;font:600 14px system-ui,-apple-system,sans-serif;box-shadow:0 10px 28px rgba(0,0,0,.24);cursor:pointer}" +
    ".zl-panel{display:none;position:fixed;right:22px;bottom:90px;z-index:2147483000;width:min(360px,calc(100vw - 24px));height:min(560px,70vh);background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 22px 50px rgba(15,23,42,.24);overflow:hidden;flex-direction:column}" +
    ".zl-head{height:58px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e5e7eb;font:600 14px system-ui,-apple-system,sans-serif;color:#111827}" +
    ".zl-body{flex:1;overflow:auto;padding:14px;background:#f9fafb}" +
    ".zl-row{display:flex;margin-bottom:10px}" +
    ".zl-row-user{justify-content:flex-start}" +
    ".zl-row-bot{justify-content:flex-end}" +
    ".zl-bubble{max-width:84%;padding:10px 12px;border-radius:14px;font:14px/1.5 system-ui,-apple-system,sans-serif;white-space:pre-wrap;word-break:break-word}" +
    ".zl-user{background:#fff;color:#111827;border:1px solid #e5e7eb}" +
    ".zl-bot{background:#111827;color:#fff}" +
    ".zl-foot{border-top:1px solid #e5e7eb;padding:10px;display:flex;gap:8px;background:#fff}" +
    ".zl-input{flex:1;height:40px;border:1px solid #d1d5db;border-radius:10px;padding:0 12px;font:14px system-ui,-apple-system,sans-serif;outline:none}" +
    ".zl-input:focus{border-color:#9ca3af}" +
    ".zl-send{height:40px;padding:0 14px;border:none;border-radius:10px;background:#111827;color:#fff;font:600 13px system-ui,-apple-system,sans-serif;cursor:pointer}" +
    ".zl-close{height:30px;width:30px;border:none;border-radius:8px;background:transparent;color:#6b7280;cursor:pointer;font:16px system-ui,-apple-system,sans-serif}";
  document.head.appendChild(style);

  var bubble = el("button", "zl-bubble-btn", "Chat");
  var panel = el("div", "zl-panel");
  var head = el("div", "zl-head");
  var title = el("span", "", "Chat met ons team");
  var closeBtn = el("button", "zl-close", "×");
  closeBtn.type = "button";
  closeBtn.addEventListener("click", function () {
    toggle(false);
  });
  head.appendChild(title);
  head.appendChild(closeBtn);

  var body = el("div", "zl-body");
  addMessage("bot", "Hallo! Waarmee kan ik je helpen?");

  var foot = el("form", "zl-foot");
  var input = el("input", "zl-input");
  input.type = "text";
  input.placeholder = "Typ je vraag...";
  var sendBtn = el("button", "zl-send", "Verstuur");
  sendBtn.type = "submit";
  foot.appendChild(input);
  foot.appendChild(sendBtn);
  foot.addEventListener("submit", function (event) {
    event.preventDefault();
    sendMessage();
  });

  panel.appendChild(head);
  panel.appendChild(body);
  panel.appendChild(foot);

  bubble.addEventListener("click", function () {
    toggle(!isOpen);
  });

  document.body.appendChild(bubble);
  document.body.appendChild(panel);
})();
