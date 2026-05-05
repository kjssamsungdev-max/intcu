// Intcu Content Script — Floating button + overlay on all pages

(function () {
  "use strict";

  // Don't inject on intcu.com itself
  if (window.location.hostname === "intcu.com") return;

  const MEETING_SITES = ["meet.google.com", "zoom.us", "teams.microsoft.com"];
  const isMeetingSite = MEETING_SITES.some(s => window.location.hostname.includes(s));

  // Create floating button
  const btn = document.createElement("div");
  btn.id = "intcu-float-btn";
  btn.textContent = "ic";
  btn.title = "Open Intcu teleprompter";
  if (isMeetingSite) btn.classList.add("intcu-pulse");
  document.body.appendChild(btn);

  // Overlay state
  let overlayVisible = false;
  let overlay = null;

  btn.addEventListener("click", () => {
    if (overlayVisible) {
      closeOverlay();
    } else {
      openOverlay();
    }
  });

  function openOverlay() {
    if (overlay) { overlay.style.display = "flex"; overlayVisible = true; return; }

    overlay = document.createElement("div");
    overlay.id = "intcu-overlay";
    overlay.innerHTML = `
      <div class="intcu-overlay-titlebar" id="intcu-titlebar">
        <span class="intcu-overlay-title">INT<span style="color:#00D4C8">CU</span></span>
        <div class="intcu-overlay-controls">
          <button class="intcu-overlay-btn" id="intcu-minimize" title="Minimize">−</button>
          <button class="intcu-overlay-btn" id="intcu-close" title="Close">✕</button>
        </div>
      </div>
      <iframe src="https://intcu.com" class="intcu-overlay-frame"></iframe>
    `;
    document.body.appendChild(overlay);
    overlayVisible = true;

    // Close button
    document.getElementById("intcu-close").addEventListener("click", closeOverlay);

    // Minimize button
    document.getElementById("intcu-minimize").addEventListener("click", () => {
      const frame = overlay.querySelector(".intcu-overlay-frame");
      if (frame.style.display === "none") {
        frame.style.display = "block";
        overlay.style.height = "600px";
      } else {
        frame.style.display = "none";
        overlay.style.height = "36px";
      }
    });

    // Dragging
    makeDraggable(overlay, document.getElementById("intcu-titlebar"));
  }

  function closeOverlay() {
    if (overlay) { overlay.style.display = "none"; }
    overlayVisible = false;
  }

  function makeDraggable(el, handle) {
    let isDragging = false, startX, startY, origX, origY;

    handle.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "BUTTON") return;
      isDragging = true;
      startX = e.clientX; startY = e.clientY;
      const rect = el.getBoundingClientRect();
      origX = rect.left; origY = rect.top;
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      el.style.left = (origX + dx) + "px";
      el.style.top = (origY + dy) + "px";
      el.style.right = "auto";
      el.style.bottom = "auto";
    });

    document.addEventListener("mouseup", () => { isDragging = false; });
  }
})();
