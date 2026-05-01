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

  /** Sync met lib/chatbot/widget-starters.ts */
  var DEFAULT_WELCOME =
    "Welkom. Waarmee kunnen we je helpen? Kies hieronder een onderwerp — of stel je eigen vraag.";
  var STARTERS = [
    {
      label: "Plan een reparatie",
      prompt:
        "Ik wil een reparatie laten uitvoeren. Leg uit hoe ik bij jullie een afspraak plan, wat de gang van zaken is en wat ik eventueel mee moet brengen of vooraf moet regelen. Gebruik alleen informatie uit jullie bedrijfsgegevens.",
    },
    {
      label: "Modellen en prijzen",
      prompt:
        "Ik wil weten welke modellen jullie aanbieden en wat de prijzen zijn. Geef een duidelijk overzicht; noem bij prijzen consequent de juiste vanaf-prijzen zonder tegenstrijdige zinnen. Gebruik alleen wat in jullie kennis staat.",
    },
    {
      label: "Retourzending",
      prompt:
        "Hoe werkt een retour, ruiling of garantie bij jullie? Wat zijn de stappen, termijnen en voorwaarden? Antwoord op basis van jullie officiële informatie.",
    },
  ];

  var conversationId = null;
  var isOpen = false;
  var isBusy = false;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function removeStarter() {
    var st = body.querySelector(".zl-starter");
    if (st) st.remove();
  }

  function addMessage(role, content) {
    var wrap = el("div", role === "user" ? "zl-row zl-row-user" : "zl-row zl-row-bot");
    var bubble = el("div", role === "user" ? "zl-bubble zl-user" : "zl-bubble zl-bot", content);
    wrap.appendChild(bubble);
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function postChat(messageText) {
    return fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatbot_id: chatbotId,
        message: messageText,
        gesprek_id: conversationId,
        kanaal: "web",
        stream: false,
      }),
    }).then(function (res) {
      if (!res.ok) throw new Error("Kon geen antwoord ophalen.");
      return res.json();
    });
  }

  function setBusy(next) {
    isBusy = next;
    input.disabled = next;
    sendBtn.disabled = next;
    sendBtn.textContent = next ? "…" : "Verstuur";
  }

  function toggle(openState) {
    isOpen = openState;
    panel.style.display = isOpen ? "flex" : "none";
    if (isOpen) {
      input.focus();
    }
  }

  function sendWithText(displayForUser, apiMessage) {
    if (isBusy) return;
    removeStarter();
    addMessage("user", displayForUser);
    setBusy(true);
    postChat(apiMessage)
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

  function sendMessage() {
    var text = input.value.trim();
    if (!text || isBusy) return;
    input.value = "";
    removeStarter();
    sendWithText(text, text);
  }

  function renderWelcome() {
    var openingAttr = script.getAttribute("data-opening");
    var welcomeText =
      openingAttr && String(openingAttr).trim() ? String(openingAttr).trim() : DEFAULT_WELCOME;

    var row = el("div", "zl-row zl-row-bot");
    var col = el("div", "zl-welcome-col");
    col.appendChild(el("div", "zl-bubble zl-bot", welcomeText));

    var starter = el("div", "zl-starter");
    starter.appendChild(el("div", "zl-starter-hint", "Kies een optie"));
    for (var i = 0; i < STARTERS.length; i++) {
      (function (item) {
        var btn = el("button", "zl-choice");
        btn.type = "button";
        var t1 = el("span", "zl-choice-title", item.label);
        var t2 = el("span", "zl-choice-sub", "Meer informatie");
        btn.appendChild(t1);
        btn.appendChild(t2);
        btn.addEventListener("click", function () {
          sendWithText(item.label, item.prompt);
        });
        starter.appendChild(btn);
      })(STARTERS[i]);
    }
    col.appendChild(starter);
    row.appendChild(col);
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  var style = el("style");
  style.textContent =
    ".zl-bubble-btn{position:fixed;right:22px;bottom:22px;z-index:2147483000;min-height:56px;padding:0 22px;border:none;border-radius:999px;background:linear-gradient(145deg,#1a1a1d 0%,#0c0c0e 100%);color:#fafafa;font:600 13px system-ui,-apple-system,BlinkMacSystemFont,sans-serif;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;box-shadow:0 12px 40px rgba(0,0,0,.35),0 0 0 1px rgba(201,162,39,.35);transition:transform .2s ease,box-shadow .2s ease}" +
    ".zl-bubble-btn:hover{transform:translateY(-1px);box-shadow:0 16px 44px rgba(0,0,0,.4),0 0 0 1px rgba(212,175,55,.5)}" +
    ".zl-panel{display:none;position:fixed;right:22px;bottom:92px;z-index:2147483000;width:min(380px,calc(100vw - 24px));height:min(580px,72vh);background:#fff;border-radius:20px;overflow:hidden;flex-direction:column;border:1px solid rgba(0,0,0,.06);box-shadow:0 28px 80px rgba(15,15,20,.45),0 0 0 1px rgba(255,255,255,.04)}" +
    ".zl-head{flex-shrink:0;height:56px;padding:0 18px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(180deg,#161618 0%,#0e0e10 100%);border-bottom:1px solid rgba(201,162,39,.28);font:600 14px system-ui,-apple-system,sans-serif;color:#f4f4f5;letter-spacing:.02em}" +
    ".zl-body{flex:1;overflow:auto;padding:16px 14px;background:linear-gradient(180deg,#f9f7f4 0%,#f3f0eb 100%)}" +
    ".zl-welcome-col{display:flex;max-width:100%;flex-direction:column;align-items:flex-end;gap:12px}" +
    ".zl-row{display:flex;margin-bottom:14px}" +
    ".zl-row-user{justify-content:flex-start}" +
    ".zl-row-bot{justify-content:flex-end}" +
    ".zl-bubble{max-width:92%;padding:12px 14px;border-radius:16px;font:14px/1.55 system-ui,-apple-system,sans-serif;white-space:pre-wrap;word-break:break-word}" +
    ".zl-user{background:#fff;color:#18181b;border:1px solid rgba(0,0,0,.06);box-shadow:0 4px 18px rgba(0,0,0,.06)}" +
    ".zl-bot{background:linear-gradient(165deg,#2a2a2e,#1f1f23);color:#fafafa;border:1px solid rgba(255,255,255,.06);box-shadow:0 8px 28px rgba(0,0,0,.18)}" +
    ".zl-starter{width:100%;max-width:100%;display:flex;flex-direction:column;gap:8px;padding-top:2px}" +
    ".zl-starter-hint{font:600 10px system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#78716c;text-align:right;padding-right:4px}" +
    ".zl-choice{display:flex;width:100%;flex-direction:column;align-items:flex-start;gap:2px;padding:12px 14px;border-radius:14px;border:1px solid rgba(28,25,23,.12);background:rgba(255,255,255,.82);backdrop-filter:blur(8px);cursor:pointer;text-align:left;transition:border-color .2s ease,box-shadow .2s ease,background .2s ease}" +
    ".zl-choice:hover{border-color:rgba(201,162,39,.55);background:#fff;box-shadow:0 8px 28px rgba(0,0,0,.07)}" +
    ".zl-choice-title{font:600 13px system-ui,sans-serif;color:#1c1917;letter-spacing:.01em}" +
    ".zl-choice-sub{font:500 11px system-ui,sans-serif;color:#a8a29e;letter-spacing:.02em}" +
    ".zl-foot{border-top:1px solid rgba(0,0,0,.06);padding:12px;display:flex;gap:10px;background:rgba(255,255,255,.95);backdrop-filter:blur(12px)}" +
    ".zl-input{flex:1;height:42px;border:1px solid rgba(0,0,0,.1);border-radius:12px;padding:0 14px;font:14px system-ui,-apple-system,sans-serif;outline:none;background:#fafaf9}" +
    ".zl-input:focus{border-color:rgba(201,162,39,.45);box-shadow:0 0 0 3px rgba(201,162,39,.12)}" +
    ".zl-send{height:42px;padding:0 18px;border:none;border-radius:12px;background:linear-gradient(165deg,#27272a,#18181b);color:#fafafa;font:600 13px system-ui,sans-serif;letter-spacing:.03em;cursor:pointer;border:1px solid rgba(201,162,39,.25)}" +
    ".zl-send:disabled{opacity:.55;cursor:not-allowed}" +
    ".zl-close{height:32px;width:32px;border:none;border-radius:10px;background:rgba(255,255,255,.06);color:#d6d3d1;cursor:pointer;font:300 20px/1 system-ui,sans-serif;line-height:32px}";
  document.head.appendChild(style);

  var bubble = el("button", "zl-bubble-btn", "Chat");
  var panel = el("div", "zl-panel");
  var head = el("div", "zl-head");
  var title = el("span", "", "Assistent");
  var closeBtn = el("button", "zl-close", "×");
  closeBtn.type = "button";
  closeBtn.addEventListener("click", function () {
    toggle(false);
  });
  head.appendChild(title);
  head.appendChild(closeBtn);

  var body = el("div", "zl-body");
  renderWelcome();

  var foot = el("form", "zl-foot");
  var input = el("input", "zl-input");
  input.type = "text";
  input.placeholder = "Of typ je eigen vraag…";
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
