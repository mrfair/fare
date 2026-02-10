export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    reg.addEventListener("updatefound", () => {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener("statechange", () => {
        // Hook UI toast/banner here if desired.
      });
    });
  } catch (e) {
    console.warn("Service worker registration failed:", e);
  }
}
