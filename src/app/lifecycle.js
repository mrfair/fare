/**
 * Lifecycle scope for routes/components.
 * Provides:
 * - use(fn): register cleanup
 * - setTimeout/setInterval auto-clear
 * - abortController / fetch (auto-abort)
 * - on(target, type, handler): auto-remove global listeners (window/document/etc)
 * - observe* helpers
 * - isActive(): prevents async race updating unmounted UI
 */

export function createScope({ debugLabel = "" } = {}) {
  const cleanups = [];
  const timeouts = new Set();
  const intervals = new Set();
  const controllers = new Set();
  const listeners = []; // [target, type, handler, options]
  const observers = new Set(); // any object with disconnect()

  let active = true;

  function use(fn) {
    if (typeof fn === "function") cleanups.push(fn);
    return fn;
  }

  function isActive() {
    return active;
  }

  function setTimeoutScoped(fn, ms, ...args) {
    const id = setTimeout(() => {
      timeouts.delete(id);
      fn(...args);
    }, ms);
    timeouts.add(id);
    return id;
  }

  function clearTimeoutScoped(id) {
    clearTimeout(id);
    timeouts.delete(id);
  }

  function setIntervalScoped(fn, ms, ...args) {
    const id = setInterval(() => fn(...args), ms);
    intervals.add(id);
    return id;
  }

  function clearIntervalScoped(id) {
    clearInterval(id);
    intervals.delete(id);
  }

  function abortController() {
    const ac = new AbortController();
    controllers.add(ac);
    // ensure removed when aborted
    const origAbort = ac.abort.bind(ac);
    ac.abort = () => { try { origAbort(); } finally { controllers.delete(ac); } };
    return ac;
  }

  async function fetchScoped(input, init = {}) {
    const ac = abortController();
    const merged = { ...init, signal: ac.signal };
    try {
      return await fetch(input, merged);
    } finally {
      // keep controller until cleanup; removing now might prevent abort on navigation while request ongoing
      // but once fetch resolves, we can remove
      controllers.delete(ac);
    }
  }

  function on(target, type, handler, options) {
    if (!target?.addEventListener) return () => {};
    target.addEventListener(type, handler, options);
    listeners.push([target, type, handler, options]);
    return () => {
      try { target.removeEventListener(type, handler, options); } catch {}
    };
  }

  function observeMutation(target, cb, options = { childList: true, subtree: true }) {
    const ob = new MutationObserver(cb);
    ob.observe(target, options);
    observers.add(ob);
    return use(() => { try { ob.disconnect(); } catch {}; observers.delete(ob); });
  }

  function observeResize(target, cb) {
    if (typeof ResizeObserver === "undefined") return () => {};
    const ob = new ResizeObserver(cb);
    ob.observe(target);
    observers.add(ob);
    return use(() => { try { ob.disconnect(); } catch {}; observers.delete(ob); });
  }

  function cleanup() {
    if (!active) return;
    active = false;

    // abort pending
    for (const ac of Array.from(controllers)) {
      try { ac.abort(); } catch {}
    }
    controllers.clear();

    // clear timers
    for (const id of Array.from(timeouts)) { try { clearTimeout(id); } catch {} }
    timeouts.clear();
    for (const id of Array.from(intervals)) { try { clearInterval(id); } catch {} }
    intervals.clear();

    // disconnect observers
    for (const ob of Array.from(observers)) { try { ob.disconnect(); } catch {} }
    observers.clear();

    // remove global listeners
    for (const [t, ty, h, o] of listeners) {
      try { t.removeEventListener(ty, h, o); } catch {}
    }
    listeners.length = 0;

    // user cleanups (LIFO)
    for (let i = cleanups.length - 1; i >= 0; i--) {
      try { cleanups[i]?.(); } catch {}
    }
    cleanups.length = 0;
  }

  // DEV helper
  function stats() {
    return {
      debugLabel,
      active,
      cleanups: cleanups.length,
      timeouts: timeouts.size,
      intervals: intervals.size,
      controllers: controllers.size,
      listeners: listeners.length,
      observers: observers.size,
    };
  }

  return {
    use,
    cleanup,
    isActive,
    // timers
    setTimeout: setTimeoutScoped,
    clearTimeout: clearTimeoutScoped,
    setInterval: setIntervalScoped,
    clearInterval: clearIntervalScoped,
    // async
    abortController,
    fetch: fetchScoped,
    // global events
    on,
    // observers
    observeMutation,
    observeResize,
    // debug
    stats,
  };
}
