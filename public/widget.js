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
  var configUrl = apiOrigin + "/api/widget/config?chatbot_id=" + encodeURIComponent(chatbotId);

  /** Fallback — sync met lib/chatbot/widget-starters.ts / widget-public-config.ts */
  var DEFAULT_WELCOME =
    "Welkom. Waarmee kunnen we je helpen? Kies hieronder een onderwerp — of stel je eigen vraag.";
  var FALLBACK_STARTERS = [
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

  function defaultConfig() {
    return {
      opening_line: DEFAULT_WELCOME,
      widget_title: "Chat",
      primary_color: "#c9a227",
      logo_url: null,
      show_starters: true,
      starters: FALLBACK_STARTERS,
      contact: { tel_href: null, whatsapp_href: null, phone_display: null },
    };
  }

  var conversationId = null;
  var isOpen = false;
  var isBusy = false;
  var body;
  var input;
  var sendBtn;
  var bubble;
  var titleEl;
  var headLeft;
  var styleNode;
  var contactBar;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
    return m
      ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
      : { r: 201, g: 162, b: 39 };
  }

  function shadeHex(hex, factor) {
    var rgb = hexToRgb(hex);
    function c(n) {
      return Math.round(Math.min(255, Math.max(0, n * factor)));
    }
    return (
      "#" +
      ("0" + c(rgb.r).toString(16)).slice(-2) +
      ("0" + c(rgb.g).toString(16)).slice(-2) +
      ("0" + c(rgb.b).toString(16)).slice(-2)
    );
  }

  function buildCss(primary) {
    var p = /^#[0-9A-Fa-f]{6}$/.test(primary) ? primary : "#c9a227";
    var rgb = hexToRgb(p);
    var rgba = function (a) {
      return "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + a + ")";
    };
    var pDark = shadeHex(p, 0.38);
    var pMid = shadeHex(p, 0.65);
    return (
      ".zl-bubble-btn{position:fixed;right:22px;bottom:22px;z-index:2147483000;min-height:56px;padding:0 22px;border:none;border-radius:999px;background:linear-gradient(145deg," +
      p +
      " 0%," +
      pDark +
      " 100%);color:#fafafa;font:600 12px system-ui,-apple-system,BlinkMacSystemFont,sans-serif;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;box-shadow:0 12px 40px rgba(0,0,0,.35),0 0 0 1px " +
      rgba(0.4) +
      ";transition:transform .2s ease,box-shadow .2s ease}" +
      ".zl-bubble-btn:hover{transform:translateY(-1px);box-shadow:0 16px 44px rgba(0,0,0,.4),0 0 0 1px " +
      rgba(0.55) +
      "}" +
      ".zl-panel{display:none;position:fixed;right:22px;bottom:92px;z-index:2147483000;width:min(380px,calc(100vw - 24px));height:min(580px,72vh);background:#fff;border-radius:20px;overflow:hidden;flex-direction:column;border:1px solid rgba(0,0,0,.06);box-shadow:0 28px 80px rgba(15,15,20,.45),0 0 0 1px rgba(255,255,255,.04)}" +
      ".zl-head{flex-shrink:0;height:56px;padding:0 14px 0 18px;display:flex;align-items:center;justify-content:space-between;gap:10px;background:linear-gradient(180deg,#161618 0%,#0e0e10 100%);border-bottom:1px solid " +
      rgba(0.35) +
      ";font:600 14px system-ui,-apple-system,sans-serif;color:#f4f4f5;letter-spacing:.02em}" +
      ".zl-head-left{display:flex;min-width:0;flex:1;align-items:center;gap:10px}" +
      ".zl-logo{height:28px;width:28px;object-fit:contain;border-radius:8px;background:#fff;flex-shrink:0}" +
      ".zl-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".zl-body{flex:1;overflow:auto;padding:16px 14px;background:linear-gradient(180deg,#f9f7f4 0%,#f3f0eb 100%)}" +
      ".zl-welcome-col{display:flex;max-width:100%;flex-direction:column;align-items:flex-end;gap:12px}" +
      ".zl-row{display:flex;margin-bottom:14px}" +
      ".zl-row-user{justify-content:flex-start}" +
      ".zl-row-bot{justify-content:flex-end}" +
      ".zl-bubble{max-width:92%;padding:12px 14px;border-radius:16px;font:14px/1.55 system-ui,-apple-system,sans-serif;white-space:pre-wrap;word-break:break-word}" +
      ".zl-user{background:#fff;color:#18181b;border:1px solid rgba(0,0,0,.06);box-shadow:0 4px 18px rgba(0,0,0,.06)}" +
      ".zl-bot{background:linear-gradient(165deg,#2a2a2e,#1f1f23);color:#fafafa;border:1px solid rgba(255,255,255,.06);box-shadow:0 8px 28px rgba(0,0,0,.18)}" +
      ".zl-starter-wrap{width:100%;max-width:100%;display:flex;flex-direction:column;gap:8px;padding-top:2px}" +
      ".zl-starter-toggle{width:100%;display:flex;flex-direction:column;align-items:stretch;gap:4px;padding:11px 13px;border-radius:14px;border:1px solid rgba(28,25,23,.14);background:rgba(255,255,255,.92);cursor:pointer;text-align:left;transition:border-color .2s ease,box-shadow .2s ease,background .2s ease}" +
      ".zl-starter-toggle:hover{border-color:" +
      rgba(0.45) +
      ";background:#fff;box-shadow:0 6px 22px rgba(0,0,0,.06)}" +
      ".zl-starter-toggle-line{display:flex;align-items:center;justify-content:space-between;gap:10px}" +
      ".zl-starter-toggle-title{font:600 13px system-ui,sans-serif;color:#1c1917}" +
      ".zl-starter-toggle-chev{font:600 12px system-ui,sans-serif;color:" +
      p +
      ";flex-shrink:0}" +
      ".zl-starter-toggle-sub{font:500 11px system-ui,sans-serif;line-height:1.35;color:#78716c}" +
      ".zl-starter-panel{width:100%;display:flex;flex-direction:column;gap:8px}" +
      ".zl-starter-panel.zl-collapsed{display:none}" +
      ".zl-starter-hint{font:600 10px system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#78716c;text-align:right;padding-right:4px}" +
      ".zl-choice{display:flex;width:100%;flex-direction:column;align-items:flex-start;gap:2px;padding:12px 14px;border-radius:14px;border:1px solid rgba(28,25,23,.12);background:rgba(255,255,255,.82);backdrop-filter:blur(8px);cursor:pointer;text-align:left;transition:border-color .2s ease,box-shadow .2s ease,background .2s ease}" +
      ".zl-choice:hover{border-color:" +
      rgba(0.55) +
      ";background:#fff;box-shadow:0 8px 28px rgba(0,0,0,.07)}" +
      ".zl-choice-title{font:600 13px system-ui,sans-serif;color:#1c1917;letter-spacing:.01em}" +
      ".zl-choice-sub{font:500 11px system-ui,sans-serif;color:#a8a29e;letter-spacing:.02em}" +
      ".zl-foot-outer{flex-shrink:0;display:flex;flex-direction:column;min-width:0;border-top:1px solid rgba(0,0,0,.08);background:rgba(255,255,255,.98);backdrop-filter:blur(12px)}" +
      ".zl-contact-bar{display:none;flex-direction:row;flex-wrap:nowrap;align-items:stretch;gap:6px;padding:6px 10px 7px;box-sizing:border-box}" +
      ".zl-contact-bar.zl-contact-visible{display:flex}" +
      ".zl-contact-btn{flex:1;min-width:0;max-width:calc(50% - 3px);display:flex;align-items:center;gap:8px;padding:5px 8px 5px 6px;border-radius:11px;border:1px solid rgba(28,25,23,.09);background:linear-gradient(180deg,#fff 0%,#fafaf9 100%);text-decoration:none;color:#1c1917;transition:border-color .18s ease,box-shadow .18s ease,transform .15s ease;box-shadow:0 1px 2px rgba(0,0,0,.04)}" +
      ".zl-contact-btn:hover{border-color:" +
      rgba(0.38) +
      ";box-shadow:0 3px 12px rgba(0,0,0,.07);transform:translateY(-0.5px)}" +
      ".zl-c-tel:focus-visible,.zl-c-wa:focus-visible{outline:2px solid " +
      rgba(0.5) +
      ";outline-offset:1px}" +
      ".zl-c-ring{flex-shrink:0;width:26px;height:26px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;background:rgba(0,0,0,.045);border:1px solid rgba(0,0,0,.06)}" +
      ".zl-c-wa .zl-c-ring{background:rgba(16,185,129,.1);border-color:rgba(16,185,129,.22);font-size:12px}" +
      ".zl-c-meta{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:1px;min-width:0;text-align:left;flex:1}" +
      ".zl-c-tag{font:650 9px system-ui,-apple-system,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#78716c}" +
      ".zl-c-num{font:600 11px system-ui,-apple-system,sans-serif;color:#1c1917;letter-spacing:.01em;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".zl-c-wa .zl-c-tag{color:#059669}" +
      ".zl-c-wa .zl-c-num{font:600 10px system-ui,sans-serif;color:#047857;letter-spacing:.02em}" +
      ".zl-foot{padding:12px;display:flex;gap:10px;border-top:none}" +
      ".zl-input{flex:1;height:42px;border:1px solid rgba(0,0,0,.1);border-radius:12px;padding:0 14px;font:14px system-ui,-apple-system,sans-serif;outline:none;background:#fafaf9}" +
      ".zl-input:focus{border-color:" +
      rgba(0.45) +
      ";box-shadow:0 0 0 3px " +
      rgba(0.15) +
      "}" +
      ".zl-send{height:42px;padding:0 18px;border:none;border-radius:12px;background:linear-gradient(165deg," +
      pMid +
      "," +
      pDark +
      ");color:#fafafa;font:600 13px system-ui,sans-serif;letter-spacing:.03em;cursor:pointer;border:1px solid " +
      rgba(0.35) +
      "}" +
      ".zl-send:disabled{opacity:.55;cursor:not-allowed}" +
      ".zl-actions-wrap{width:100%;max-width:92%;align-self:flex-end;display:flex;flex-direction:column;gap:6px;margin-top:6px}" +
      ".zl-action-btn{display:block;width:100%;text-align:center;padding:9px 11px;border-radius:11px;font:600 12px system-ui,sans-serif;text-decoration:none;color:#fafafa;background:linear-gradient(165deg," +
      pMid +
      "," +
      pDark +
      ");border:1px solid " +
      rgba(0.35) +
      ";box-shadow:0 2px 8px rgba(0,0,0,.12);transition:opacity .15s ease,transform .15s ease}" +
      ".zl-action-btn:hover{opacity:.95;transform:translateY(-0.5px)}" +
      ".zl-close{flex-shrink:0;height:32px;width:32px;border:none;border-radius:10px;background:rgba(255,255,255,.06);color:#d6d3d1;cursor:pointer;font:300 20px/1 system-ui,sans-serif;line-height:32px}"
    );
  }

  function removeStarter() {
    if (!body) return;
    var st = body.querySelector(".zl-starter-wrap");
    if (st) st.remove();
  }

  function addMessage(role, content, actions) {
    var isUser = role === "user";
    var wrap = el("div", isUser ? "zl-row zl-row-user" : "zl-row zl-row-bot");
    var bubbleN = el("div", isUser ? "zl-bubble zl-user" : "zl-bubble zl-bot", content);
    wrap.appendChild(bubbleN);
    if (!isUser && actions && actions.length) {
      var aw = el("div", "zl-actions-wrap");
      for (var i = 0; i < actions.length; i++) {
        var item = actions[i];
        if (!item || !item.url || !item.label) continue;
        var link = document.createElement("a");
        link.className = "zl-action-btn";
        link.href = String(item.url);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = String(item.label);
        aw.appendChild(link);
      }
      if (aw.childNodes.length) wrap.appendChild(aw);
    }
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
        addMessage(
          "bot",
          data && data.reply ? String(data.reply) : "Er kwam geen antwoord.",
          data && Array.isArray(data.actions) ? data.actions : null,
        );
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

  function renderWelcome(cfg) {
    var openingAttr = script.getAttribute("data-opening");
    var welcomeText =
      openingAttr && String(openingAttr).trim()
        ? String(openingAttr).trim()
        : cfg.opening_line || DEFAULT_WELCOME;

    var row = el("div", "zl-row zl-row-bot");
    var col = el("div", "zl-welcome-col");
    col.appendChild(el("div", "zl-bubble zl-bot", welcomeText));

    if (cfg.show_starters !== false && cfg.starters && cfg.starters.length > 0) {
      var starters = cfg.starters;
      var n = starters.length;
      var wrap = el("div", "zl-starter-wrap");
      var storageKey = "cf-zl-opt-" + chatbotId;
      var expanded = false;
      try {
        var stored = sessionStorage.getItem(storageKey);
        if (stored === "1") expanded = true;
        else if (stored === "0") expanded = false;
        else expanded = false;
      } catch (e1) {
        expanded = false;
      }

      var panel = el("div", "zl-starter-panel");
      if (!expanded) panel.className = "zl-starter-panel zl-collapsed";

      panel.appendChild(el("div", "zl-starter-hint", "Kies een optie"));
      for (var j = 0; j < starters.length; j++) {
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
          panel.appendChild(btn);
        })(starters[j]);
      }

      var previewTxt = starters
        .slice(0, 2)
        .map(function (s) {
          return String(s.label || "").trim();
        })
        .filter(Boolean)
        .join(", ");
      if (n > 2) previewTxt += "…";

      var toggleBtn = el("button", "zl-starter-toggle");
      toggleBtn.type = "button";
      toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");

      function syncToggleVisual() {
        toggleBtn.innerHTML = "";
        var line = el("div", "zl-starter-toggle-line");
        var tit = el("span", "zl-starter-toggle-title");
        tit.textContent = expanded
          ? "Opties verbergen"
          : (n === 1 ? "1 snelle optie beschikbaar" : n + " snelle opties beschikbaar");
        var chev = el("span", "zl-starter-toggle-chev");
        chev.textContent = expanded ? "\u25B2" : "\u25BC";
        line.appendChild(tit);
        line.appendChild(chev);
        toggleBtn.appendChild(line);
        var sub = el("span", "zl-starter-toggle-sub");
        sub.textContent = expanded
          ? "Tik om de lijst kleiner te maken"
          : (previewTxt ? "o.a. " + previewTxt + " — tik om te openen" : "Tik om opties te tonen");
        toggleBtn.appendChild(sub);
        toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
        panel.className = expanded ? "zl-starter-panel" : "zl-starter-panel zl-collapsed";
      }

      syncToggleVisual();

      toggleBtn.addEventListener("click", function () {
        expanded = !expanded;
        try {
          sessionStorage.setItem(storageKey, expanded ? "1" : "0");
        } catch (e2) {}
        syncToggleVisual();
      });

      wrap.appendChild(toggleBtn);
      wrap.appendChild(panel);
      col.appendChild(wrap);
    }
    row.appendChild(col);
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function applyContactBar(cfg) {
    if (!contactBar) return;
    contactBar.innerHTML = "";
    var c = cfg.contact || {};
    var tel = c.tel_href;
    var wa = c.whatsapp_href;
    if (!tel && !wa) {
      contactBar.className = "zl-contact-bar";
      return;
    }
    contactBar.className = "zl-contact-bar zl-contact-visible";

    function meta(tag, line) {
      var m = el("div", "zl-c-meta");
      m.appendChild(el("span", "zl-c-tag", tag));
      m.appendChild(el("span", "zl-c-num", line));
      return m;
    }

    if (tel) {
      var aTel = el("a", "zl-contact-btn zl-c-tel");
      aTel.href = tel;
      aTel.appendChild(el("span", "zl-c-ring", "\u260E"));
      aTel.appendChild(meta("Bellen", c.phone_display || "\u2014"));
      aTel.setAttribute("aria-label", "Bellen: " + (c.phone_display || ""));
      contactBar.appendChild(aTel);
    }
    if (wa) {
      var aWa = el("a", "zl-contact-btn zl-c-wa");
      aWa.href = wa;
      aWa.target = "_blank";
      aWa.rel = "noopener noreferrer";
      aWa.appendChild(el("span", "zl-c-ring", "\uD83D\uDCAC"));
      aWa.appendChild(meta("WhatsApp", "Bericht sturen"));
      aWa.setAttribute("aria-label", "WhatsApp openen");
      contactBar.appendChild(aWa);
    }
  }

  function applyHead(cfg) {
    headLeft.innerHTML = "";
    if (cfg.logo_url && /^https?:\/\//i.test(String(cfg.logo_url))) {
      var img = el("img", "zl-logo");
      img.src = String(cfg.logo_url);
      img.alt = "";
      img.referrerPolicy = "no-referrer-when-downgrade";
      headLeft.appendChild(img);
    }
    titleEl = el("span", "zl-title", cfg.widget_title || "Chat");
    headLeft.appendChild(titleEl);
    var label = (cfg.widget_title || "Chat").trim().slice(0, 20) || "Chat";
    bubble.textContent = label.toUpperCase();
  }

  function applyConfig(cfg) {
    styleNode.textContent = buildCss(cfg.primary_color || "#c9a227");
    applyHead(cfg);
    body.innerHTML = "";
    renderWelcome(cfg);
    applyContactBar(cfg);
  }

  styleNode = el("style");
  document.head.appendChild(styleNode);

  bubble = el("button", "zl-bubble-btn", "CHAT");
  var panel = el("div", "zl-panel");
  var head = el("div", "zl-head");
  headLeft = el("div", "zl-head-left");
  var closeBtn = el("button", "zl-close", "×");
  closeBtn.type = "button";
  closeBtn.addEventListener("click", function () {
    toggle(false);
  });
  head.appendChild(headLeft);
  head.appendChild(closeBtn);

  body = el("div", "zl-body");
  var loadRow = el("div", "zl-row zl-row-bot");
  loadRow.appendChild(el("div", "zl-bubble zl-bot", "Widget laden…"));
  body.appendChild(loadRow);

  var footOuter = el("div", "zl-foot-outer");
  contactBar = el("div", "zl-contact-bar");
  var foot = el("form", "zl-foot");
  input = el("input", "zl-input");
  input.type = "text";
  input.placeholder = "Of typ je eigen vraag…";
  sendBtn = el("button", "zl-send", "Verstuur");
  sendBtn.type = "submit";
  foot.appendChild(input);
  foot.appendChild(sendBtn);
  foot.addEventListener("submit", function (event) {
    event.preventDefault();
    sendMessage();
  });
  footOuter.appendChild(contactBar);
  footOuter.appendChild(foot);

  panel.appendChild(head);
  panel.appendChild(body);
  panel.appendChild(footOuter);

  bubble.addEventListener("click", function () {
    toggle(!isOpen);
  });

  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  fetch(configUrl)
    .then(function (r) {
      if (!r.ok) throw new Error("config");
      return r.json();
    })
    .then(function (j) {
      if (!j || typeof j !== "object") throw new Error("bad");
      var jc = j.contact && typeof j.contact === "object" ? j.contact : {};
      return {
        opening_line: String(j.opening_line || DEFAULT_WELCOME),
        widget_title: String(j.widget_title || "Chat").slice(0, 48),
        primary_color: /^#[0-9A-Fa-f]{6}$/.test(String(j.primary_color || ""))
          ? String(j.primary_color)
          : "#c9a227",
        logo_url: j.logo_url ? String(j.logo_url) : null,
        show_starters: j.show_starters !== false,
        starters: Array.isArray(j.starters) && j.starters.length ? j.starters : FALLBACK_STARTERS,
        contact: {
          tel_href: jc.tel_href ? String(jc.tel_href) : null,
          whatsapp_href: jc.whatsapp_href ? String(jc.whatsapp_href) : null,
          phone_display: jc.phone_display ? String(jc.phone_display) : null,
        },
      };
    })
    .catch(function () {
      return defaultConfig();
    })
    .then(function (cfg) {
      applyConfig(cfg);
    });
})();
