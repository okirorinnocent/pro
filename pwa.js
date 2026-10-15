/* Registers the service worker and adds an "Install app" button to the header. */
(function () {
  if ("serviceWorker" in navigator) {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (standalone) return;                                   // already installed, no button needed

  const nav = document.querySelector("nav"), themeBtn = document.getElementById("theme");
  if (!nav || !themeBtn) return;

  const btn = document.createElement("button");
  btn.className = "btn o"; btn.type = "button"; btn.id = "install"; btn.hidden = true;
  btn.textContent = "⬇ Install app"; btn.style.cssText = "padding:8px 14px;font-size:.88rem";
  nav.insertBefore(btn, themeBtn);

  let deferred = null;
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; btn.hidden = false; });
  addEventListener("appinstalled", () => { btn.hidden = true; deferred = null; });

  btn.onclick = async () => {
    if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; btn.hidden = true; return; }
    alert("To install on iPhone/iPad:\n1. Tap the Share button in Safari\n2. Choose \"Add to Home Screen\"\n3. Tap Add");
  };

  // iOS Safari never fires beforeinstallprompt, so show the button with manual steps
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) btn.hidden = false;
})();
