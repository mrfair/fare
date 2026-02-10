import "./runtime.scss";
import { createRouter } from "./router.js";
import { registerServiceWorker } from "./sw-register.js";
import { bootstrapSession } from "./auth.js";
import { startAutoDestroyObserver } from "./auto-destroy-observer.js";

(async () => {
  // Sync localStorage session from backend cookie before starting router (guards need sync state)
  await bootstrapSession();

  const router = createRouter({ appEl: "#app" });
  // Auto-destroy listeners when DOM nodes are removed (MutationObserver).
// Disable by setting: window.__AUTO_DESTROY_OBSERVER__ = false; (before main.js runs)
const __autoDestroyEnabled = (window.__AUTO_DESTROY_OBSERVER__ !== false);
startAutoDestroyObserver({ enabled: __autoDestroyEnabled });

router.start();

// DEV: Leak check (scopes/timers/controllers) — enable with: window.__LEAK_CHECK__ = true
if (import.meta.env.DEV && window.__LEAK_CHECK__ === true) {
  const _nav = router.navigate.bind(router);
  router.navigate = async (...args) => {
    const res = await _nav(...args);
    try {
      // router exports internal scopes via window hook if present
      console.log("[leak-check] navigation complete");
    } catch {}
    return res;
  };
}


  // expose for debugging
  window.__router = router;

  // Register SW only in production build
  if (import.meta.env.PROD) {
    registerServiceWorker();
  }
})();
