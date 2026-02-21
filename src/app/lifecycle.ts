type TimeoutId = ReturnType<typeof setTimeout>;
type IntervalId = ReturnType<typeof setInterval>;
type EventOptions = boolean | AddEventListenerOptions | undefined;

type CleanupFn = () => void;
type MutationObserverTarget = Element | Document;

type ObserverLike = { disconnect(): void };

type ListenerRecord = [GlobalEventTarget, string, EventListenerOrEventListenerObject, EventOptions];

type GlobalEventTarget = EventTarget & {
  addEventListener(type: string, handler: EventListenerOrEventListenerObject, options?: EventOptions): void;
  removeEventListener(type: string, handler: EventListenerOrEventListenerObject, options?: EventOptions): void;
};

export interface LifecycleStats {
  debugLabel: string;
  active: boolean;
  cleanups: number;
  timeouts: number;
  intervals: number;
  controllers: number;
  listeners: number;
  observers: number;
}

export interface LifecycleScope {
  use(fn?: CleanupFn): CleanupFn | undefined;
  cleanup(): void;
  isActive(): boolean;
  setTimeout(fn: (...args: unknown[]) => void, ms: number, ...args: unknown[]): TimeoutId;
  clearTimeout(id?: TimeoutId): void;
  setInterval(fn: (...args: unknown[]) => void, ms: number, ...args: unknown[]): IntervalId;
  clearInterval(id?: IntervalId): void;
  abortController(): AbortController;
  fetch(input: Parameters<typeof fetch>[0], init?: RequestInit): Promise<Response>;
  on(target: GlobalEventTarget, type: string, handler: EventListenerOrEventListenerObject, options?: EventOptions): () => void;
  observeMutation(target: MutationObserverTarget, cb: MutationCallback, options?: MutationObserverInit): () => void;
  observeResize(target: Element, cb: ResizeObserverCallback): () => void;
  stats(): LifecycleStats;
}

export function createScope({ debugLabel = "" } = {}): LifecycleScope {
  const cleanups: CleanupFn[] = [];
  const timeouts = new Set<TimeoutId>();
  const intervals = new Set<IntervalId>();
  const controllers = new Set<AbortController>();
  const listeners: ListenerRecord[] = [];
  const observers = new Set<ObserverLike>();

  let active = true;

  function use(fn?: CleanupFn): CleanupFn | undefined {
    if (typeof fn === "function") cleanups.push(fn);
    return fn;
  }

  function isActive(): boolean {
    return active;
  }

  function setTimeoutScoped(fn: (...args: unknown[]) => void, ms: number, ...args: unknown[]): TimeoutId {
    const id = window.setTimeout(() => {
      timeouts.delete(id);
      fn(...args);
    }, ms);
    timeouts.add(id);
    return id;
  }

  function clearTimeoutScoped(id?: TimeoutId): void {
    if (id === undefined) return;
    window.clearTimeout(id);
    timeouts.delete(id);
  }

  function setIntervalScoped(fn: (...args: unknown[]) => void, ms: number, ...args: unknown[]): IntervalId {
    const id = window.setInterval(() => fn(...args), ms);
    intervals.add(id);
    return id;
  }

  function clearIntervalScoped(id?: IntervalId): void {
    if (id === undefined) return;
    window.clearInterval(id);
    intervals.delete(id);
  }

  function abortController(): AbortController {
    const ac = new AbortController();
    controllers.add(ac);
    const originalAbort = ac.abort.bind(ac);
    ac.abort = () => {
      try {
        originalAbort();
      } finally {
        controllers.delete(ac);
      }
    };
    return ac;
  }

  async function fetchScoped(input: Parameters<typeof fetch>[0], init: RequestInit = {}): Promise<Response> {
    const ac = abortController();
    const merged: RequestInit = { ...init, signal: ac.signal };
    try {
      return await fetch(input, merged);
    } finally {
      controllers.delete(ac);
    }
  }

  function on(target: GlobalEventTarget, type: string, handler: EventListenerOrEventListenerObject, options?: EventOptions): () => void {
    if (!target?.addEventListener) return () => {};
    target.addEventListener(type, handler, options);
    listeners.push([target, type, handler, options]);
    return () => {
      try {
        target.removeEventListener(type, handler, options);
      } catch {
        /* ignore */
      }
    };
  }

  function observeMutation(target: MutationObserverTarget, cb: MutationCallback, options: MutationObserverInit = { childList: true, subtree: true }): () => void {
    const observerInstance = new MutationObserver(cb);
    observerInstance.observe(target, options);
    observers.add(observerInstance);
    return use(() => {
      try {
        observerInstance.disconnect();
      } catch {
        /* ignore */
      }
      observers.delete(observerInstance);
    });
  }

  function observeResize(target: Element, cb: ResizeObserverCallback): () => void {
    if (typeof ResizeObserver === "undefined") return () => {};
    const observerInstance = new ResizeObserver(cb);
    observerInstance.observe(target);
    observers.add(observerInstance);
    return use(() => {
      try {
        observerInstance.disconnect();
      } catch {
        /* ignore */
      }
      observers.delete(observerInstance);
    });
  }

  function cleanup(): void {
    if (!active) return;
    active = false;

    for (const ac of Array.from(controllers)) {
      try {
        ac.abort();
      } catch {
        /* ignore */
      }
    }
    controllers.clear();

    for (const id of Array.from(timeouts)) {
      try {
        window.clearTimeout(id);
      } catch {
        /* ignore */
      }
    }
    timeouts.clear();

    for (const id of Array.from(intervals)) {
      try {
        window.clearInterval(id);
      } catch {
        /* ignore */
      }
    }
    intervals.clear();

    for (const observerInstance of Array.from(observers)) {
      try {
        observerInstance.disconnect();
      } catch {
        /* ignore */
      }
    }
    observers.clear();

    for (const [target, type, handler, options] of listeners) {
      try {
        target.removeEventListener(type, handler, options);
      } catch {
        /* ignore */
      }
    }
    listeners.length = 0;

    for (let i = cleanups.length - 1; i >= 0; i--) {
      try {
        cleanups[i]?.();
      } catch {
        /* ignore */
      }
    }
    cleanups.length = 0;
  }

  function stats(): LifecycleStats {
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
    setTimeout: setTimeoutScoped,
    clearTimeout: clearTimeoutScoped,
    setInterval: setIntervalScoped,
    clearInterval: clearIntervalScoped,
    abortController,
    fetch: fetchScoped,
    on,
    observeMutation,
    observeResize,
    stats,
  };
}
