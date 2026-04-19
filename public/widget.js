/**
 * Zylmero embed chat — vanilla JS, geen frameworks.
 * Gebruik:
 * <script src="https://jouwdomein.nl/widget.js" data-chatbot="CHATBOT_UUID" defer></script>
 * Optioneel: data-api-base="https://jouwdomein.nl" als de script-URL niet je API-host is.
 */
(function () {
  var script = document.currentScript;
  if (!script || !script.src) return;

  var chatbotId = script.getAttribute("data-chatbot");
  if (!chatbotId || !chatbotId.trim()) {
    console.warn("[Zylmero widget] Ontbrekend data-chatbot attribuut.");
    return;
  }
  chatbotId = chatbotId.trim();

  var apiBaseAttr = script.getAttribute("data-api-base");
  var apiBase =
    (apiBaseAttr && apiBaseAttr.trim()) ||
    new URL(script.src).origin.replace(/\/$/, "");

  var storageKey = "zylmero_embed_sess_" + chatbotId;

  /** @type {{ open: boolean, sess: string }} */
  var state = {
    open: false,
    sess: "",
  };

  try {
    state.sess = window.localStorage.getItem(storageKey) || "";
  } catch (e) {}

  function saveSession(id) {
    state.sess = id || "";
    try {
      if (id) window.localStorage.setItem(storageKey, id);
      else window.localStorage.removeItem(storageKey);
    } catch (e) {}
  }

  var root = document.createElement("div");
  root.setAttribute("data-zylmero-widget", "");
  root.style.cssText =
    "position:fixed;z-index:2147483646;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.45;";
  document.body.appendChild(root);

  var shadow = root.attachShadow({ mode: "open" });

  var css = `
    :host{color-scheme:dark;}
    *,*::before,*::after{box-sizing:border-box;}
    button{font:inherit;margin:0;cursor:pointer;border:none;}
    .bubble-btn{
      position:fixed;right:18px;bottom:18px;width:56px;height:56px;border-radius:999px;
      background:linear-gradient(145deg,#2563eb,#1d4ed8);color:#fff;display:flex;align-items:center;justify-content:center;
      box-shadow:0 12px 36px rgba(15,23,42,.35);transition:transform .15s ease;
    }
    .bubble-btn:hover{transform:translateY(-1px);}
    .bubble-btn svg{width:26px;height:26px;}
    .panel{
      position:fixed;right:18px;bottom:88px;width:min(380px,calc(100vw - 28px));max-height:min(520px,calc(100vh - 120px));
      display:flex;flex-direction:column;border-radius:16px;overflow:hidden;
      background:#0f172a;border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 60px rgba(0,0,0,.45);
    }
    .panel.hidden{display:none;}
    .hd{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);}
    .hd strong{display:block;color:#f8fafc;font-weight:600;font-size:14px;}
    .hd span{display:block;color:#94a3b8;font-size:12px;margin-top:4px;}
    .msgs{flex:1;min-height:180px;max-height:320px;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:10px;}
    .row-u{display:flex;justify-content:flex-end;}
    .row-a{display:flex;justify-content:flex-start;}
    .b-u{max-width:85%;padding:10px 12px;border-radius:14px 14px 4px 14px;background:#2563eb;color:#fff;font-size:13px;}
    .b-a{max-width:85%;padding:10px 12px;border-radius:14px 14px 14px 4px;background:#1e293b;color:#e2e8f0;font-size:13px;border:1px solid rgba(255,255,255,.08);}
    .typing{font-size:12px;color:#94a3b8;padding:4px 2px;}
    .err{font-size:12px;color:#fca5a5;padding:4px 2px;}
    .ft{padding:12px;border-top:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.2);}
    .ft form{display:flex;gap:8px;}
    .ft input{
      flex:1;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:#020617;color:#f1f5f9;
      padding:11px 12px;font-size:14px;outline:none;
    }
    .ft input:focus{border-color:#3b82f6;}
    .ft button.send{
      border-radius:12px;background:#2563eb;color:#fff;padding:0 16px;font-weight:600;font-size:13px;
    }
    .ft button.send:disabled{opacity:.45;cursor:not-allowed;}
  `;

  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  shadow.appendChild(styleEl);

  var panel = document.createElement("div");
  panel.className = "panel hidden";
  panel.innerHTML =
    '<div class="hd"><strong>Chat</strong><span>We reageren direct — stel je vraag.</span></div>' +
    '<div class="msgs" role="log"></div>' +
    '<div class="ft"><form><input type="text" maxlength="8000" placeholder="Typ je bericht…" autocomplete="off" /><button type="submit" class="send">Verstuur</button></form></div>';

  var toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "bubble-btn";
  toggleBtn.setAttribute("aria-label", "Chat openen");
  toggleBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>';

  shadow.appendChild(panel);
  shadow.appendChild(toggleBtn);

  var msgsEl = panel.querySelector(".msgs");
  var formEl = panel.querySelector("form");
  var inputEl = panel.querySelector("input");

  function appendBubble(role, text) {
    var wrap = document.createElement("div");
    wrap.className = role === "user" ? "row-u" : "row-a";
    var b = document.createElement("div");
    b.className = role === "user" ? "b-u" : "b-a";
    b.textContent = text;
    wrap.appendChild(b);
    msgsEl.appendChild(wrap);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function clearTyping() {
    var t = msgsEl.querySelector(".typing");
    if (t) t.remove();
  }

  function showTyping() {
    clearTyping();
    var t = document.createElement("div");
    t.className = "typing";
    t.textContent = "Even geduld…";
    msgsEl.appendChild(t);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function showErr(msg) {
    var e = msgsEl.querySelector(".err");
    if (!e) {
      e = document.createElement("div");
      e.className = "err";
      msgsEl.appendChild(e);
    }
    e.textContent = msg;
  }

  var sending = false;

  async function sendMessage(text) {
    if (!text.trim() || sending) return;
    sending = true;
    showTyping();
    showErr("");
    try {
      var res = await fetch(apiBase + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatbotId: chatbotId,
          message: text.trim(),
          sessionId: state.sess || undefined,
        }),
      });
      var data = await res.json().catch(function () {
        return {};
      });
      clearTyping();
      if (!res.ok) {
        appendBubble("assistant", data.error || "Chat tijdelijk niet beschikbaar.");
        return;
      }
      if (data.sessionId) {
        saveSession(data.sessionId);
      }
      if (data.reply) appendBubble("assistant", data.reply);
    } catch (e) {
      clearTyping();
      appendBubble("assistant", "Er ging iets mis met de verbinding. Probeer het zo opnieuw.");
    } finally {
      sending = false;
    }
  }

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = inputEl.value.trim();
    if (!v) return;
    appendBubble("user", v);
    inputEl.value = "";
    sendMessage(v);
  });

  toggleBtn.addEventListener("click", function () {
    state.open = !state.open;
    if (state.open) {
      panel.classList.remove("hidden");
      toggleBtn.setAttribute("aria-label", "Chat sluiten");
      setTimeout(function () {
        inputEl.focus();
      }, 50);
    } else {
      panel.classList.add("hidden");
      toggleBtn.setAttribute("aria-label", "Chat openen");
    }
  });
})();
