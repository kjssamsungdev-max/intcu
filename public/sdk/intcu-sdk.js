(function () {
  "use strict";

  var DEFAULTS = {
    mode: "copilot",
    position: "bottom-right",
    theme: "dark",
    niche: "general",
    style: "brief",
    width: "400px",
    height: "600px",
    container: null,
    collapsed: true,
    brandColor: "#00D4C8",
    onSuggestion: null,
    onTranscript: null,
    onReady: null,
  };

  var BASE_URL = "https://intcu.com";
  var Z_INDEX = 999999;
  var BTN_SIZE = 56;

  var config = {};
  var iframe = null;
  var btn = null;
  var panel = null;
  var isOpen = false;
  var initialized = false;

  function buildUrl() {
    return BASE_URL + "?embed=true&mode=" + encodeURIComponent(config.mode) + "&theme=" + encodeURIComponent(config.theme);
  }

  function positionStyles() {
    var p = config.position;
    var s = { position: "fixed", zIndex: Z_INDEX };
    if (p === "bottom-right") { s.bottom = "20px"; s.right = "20px"; }
    else if (p === "bottom-left") { s.bottom = "20px"; s.left = "20px"; }
    else if (p === "top-right") { s.top = "20px"; s.right = "20px"; }
    else if (p === "top-left") { s.top = "20px"; s.left = "20px"; }
    return s;
  }

  function applyStyles(el, styles) {
    for (var k in styles) {
      if (styles.hasOwnProperty(k)) el.style[k] = styles[k];
    }
  }

  function createButton() {
    btn = document.createElement("div");
    var pos = positionStyles();
    applyStyles(btn, {
      position: pos.position,
      zIndex: String(Z_INDEX),
      bottom: pos.bottom || "",
      top: pos.top || "",
      left: pos.left || "",
      right: pos.right || "",
      width: BTN_SIZE + "px",
      height: BTN_SIZE + "px",
      borderRadius: "50%",
      background: "#09090b",
      color: config.brandColor,
      fontSize: "18px",
      fontWeight: "700",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 4px 16px rgba(0,0,0,0.4), 0 0 0 2px " + config.brandColor + "44",
      transition: "transform 0.15s, box-shadow 0.15s",
      userSelect: "none",
    });
    btn.textContent = "ic";
    btn.title = "Open Intcu";
    btn.addEventListener("mouseenter", function () { btn.style.transform = "scale(1.1)"; });
    btn.addEventListener("mouseleave", function () { btn.style.transform = "scale(1)"; });
    btn.addEventListener("click", function () { toggle(); });
    document.body.appendChild(btn);
  }

  function createPanel() {
    panel = document.createElement("div");
    var pos = positionStyles();
    var panelBottom = pos.bottom ? (parseInt(pos.bottom) + BTN_SIZE + 12) + "px" : "";
    var panelTop = pos.top ? (parseInt(pos.top) + BTN_SIZE + 12) + "px" : "";

    applyStyles(panel, {
      position: "fixed",
      zIndex: String(Z_INDEX - 1),
      bottom: panelBottom || "",
      top: panelTop || "",
      left: pos.left || "",
      right: pos.right || "",
      width: config.width,
      height: config.height,
      background: "#09090b",
      border: "1px solid #2a2a30",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 16px 64px rgba(0,0,0,0.6)",
      display: "none",
      flexDirection: "column",
    });

    iframe = document.createElement("iframe");
    iframe.src = buildUrl();
    applyStyles(iframe, {
      width: "100%",
      height: "100%",
      border: "none",
    });
    iframe.setAttribute("allow", "microphone; camera");

    panel.appendChild(iframe);
    document.body.appendChild(panel);
  }

  function createInline() {
    var container = document.querySelector(config.container);
    if (!container) {
      console.warn("Intcu SDK: container not found: " + config.container);
      return;
    }
    iframe = document.createElement("iframe");
    iframe.src = buildUrl();
    applyStyles(iframe, {
      width: config.width,
      height: config.height,
      border: "none",
      borderRadius: "8px",
    });
    iframe.setAttribute("allow", "microphone; camera");
    container.appendChild(iframe);
    isOpen = true;
  }

  function postToFrame(msg) {
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(msg, BASE_URL);
    }
  }

  function handleMessage(e) {
    if (e.origin !== BASE_URL) return;
    var data = e.data;
    if (!data || !data.type) return;
    if (data.type === "intcu-suggestion" && config.onSuggestion) {
      config.onSuggestion(data.text);
    } else if (data.type === "intcu-transcript" && config.onTranscript) {
      config.onTranscript(data.text);
    } else if (data.type === "intcu-ready" && config.onReady) {
      config.onReady();
    }
  }

  // Public API
  var Intcu = {
    init: function (opts) {
      if (initialized) { console.warn("Intcu SDK: already initialized"); return; }
      config = {};
      for (var k in DEFAULTS) { config[k] = DEFAULTS[k]; }
      for (var k2 in opts) { if (opts.hasOwnProperty(k2)) config[k2] = opts[k2]; }

      window.addEventListener("message", handleMessage);

      if (config.position === "inline" && config.container) {
        createInline();
      } else {
        createButton();
        createPanel();
        if (!config.collapsed) { Intcu.open(); }
      }

      initialized = true;
    },

    open: function () {
      if (panel) { panel.style.display = "flex"; isOpen = true; }
    },

    close: function () {
      if (panel) { panel.style.display = "none"; isOpen = false; }
    },

    toggle: function () {
      if (isOpen) { Intcu.close(); } else { Intcu.open(); }
    },

    destroy: function () {
      window.removeEventListener("message", handleMessage);
      if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
      if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
      if (config.position === "inline" && iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      btn = null; panel = null; iframe = null;
      isOpen = false; initialized = false;
    },

    setMode: function (mode) {
      config.mode = mode;
      postToFrame({ type: "intcu-set-mode", mode: mode });
    },

    setNiche: function (niche) {
      config.niche = niche;
      postToFrame({ type: "intcu-set-niche", niche: niche });
    },

    setScript: function (text) {
      postToFrame({ type: "intcu-set-script", text: text });
    },

    sendInjection: function (text) {
      postToFrame({ type: "intcu-injection", text: text });
    },
  };

  // Expose globally
  window.Intcu = Intcu;
})();
