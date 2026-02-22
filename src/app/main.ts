import "./runtime.scss";
import { createRouter } from "./router";
import type { RouterInstance } from "./router";
import { registerServiceWorker } from "./sw-register";
import { bootstrapSession } from "./auth";
import { startAutoDestroyObserver } from "./auto-destroy-observer";

declare global {
  interface Window {
    __AUTO_DESTROY_OBSERVER__?: boolean;
    __LEAK_CHECK__?: boolean;
    __router?: RouterInstance;
  }
}

(async () => {
  // await bootstrapSession();

  const router = createRouter({ appEl: "#app" });
  const __autoDestroyEnabled = window.__AUTO_DESTROY_OBSERVER__ !== false;
  startAutoDestroyObserver({ enabled: __autoDestroyEnabled });

  router.start();

  if (import.meta.env.DEV && window.__LEAK_CHECK__ === true) {
    const navigateOriginal = router.navigate.bind(router);
    router.navigate = async (...args) => {
      const result = await navigateOriginal(...args);
      try {
        console.log("[leak-check] navigation complete");
      } catch {
        // ignore
      }
      return result;
    };
  }

  window.__router = router;

  if (import.meta.env.PROD) {
    registerServiceWorker();
  }
})();
