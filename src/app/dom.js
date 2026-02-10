/**
 * Tiny jQuery-like wrapper (vanilla)
 *
 * Usage:
 *   $("#btn").on("click", fn)
 *   $("#box").addClass("a b").css("opacity", "0.8")
 *   $("#x").text("hi").html("<b>ok</b>")
 *   $$("#items").forEach(el => ...)   // returns real Elements
 *
 * Also supports old style:
 *   $.on(el, "click", fn)
 *   $.delegate(document, "click", "a[data-link]", fn)
 */

function toEl(sel, ctx = document) {
  if (!sel) return null;

  // already an element/window/document
  if (sel instanceof Element || sel === window || sel === document) return sel;

  // jQuery-like element creation: $("<button>") or $("<div class='x'>...</div>")
  if (typeof sel === "string") {
    const s = sel.trim();

    // allow "<button>" or "<button/>" or "<div>..</div>"
    if (s.startsWith("<") && s.endsWith(">")) {
      const t = document.createElement("template");
      t.innerHTML = s;
      return t.content.firstElementChild;
    }

    return (ctx || document).querySelector(s);
  }

  return null;
}

// Global listener registry (auto-destroy friendly)
const __listenerRegistry = new WeakMap(); // Element -> Array<[type, handler, options]>

function __regAdd(el, type, handler, options) {
  if (!el) return;
  const arr = __listenerRegistry.get(el) || [];
  arr.push([type, handler, options]);
  __listenerRegistry.set(el, arr);
}

function __regRemove(el, type, handler, options) {
  const arr = __listenerRegistry.get(el);
  if (!arr) return;
  for (let i = arr.length - 1; i >= 0; i--) {
    const x = arr[i];
    if (x[0] === type && x[1] === handler && x[2] === options) arr.splice(i, 1);
  }
  if (arr.length === 0) __listenerRegistry.delete(el);
}

function __destroyEl(el) {
  const arr = __listenerRegistry.get(el);
  if (!arr || !arr.length) return;
  for (const [t, h, o] of arr) {
    try { el.removeEventListener(t, h, o); } catch {}
  }
  __listenerRegistry.delete(el);
}



export function $$(sel, ctx = document) {
  if (!sel) return [];
  if (Array.isArray(sel)) return sel;
  return Array.from((ctx || document).querySelectorAll(sel));
}

class MiniQuery {
  constructor(el) {
    this.el = el || null;
    // track listeners added via .on() for easy cleanup (per instance)
    this._listeners = [];
  }

  // --- event (chainable like jQuery) ---
  on(type, handler, options) {
    if (!this.el) return this;
    this.el.addEventListener(type, handler, options);
    this._listeners.push([type, handler, options]);
    __regAdd(this.el, type, handler, options);
    return this;
  }

  off(type, handler, options) {
    if (!this.el) return this;
    this.el.removeEventListener(type, handler, options);
    __regRemove(this.el, type, handler, options);
    this._listeners = this._listeners.filter((x) => !(x[0] === type && x[1] === handler && x[2] === options));
    return this;
  }

  offAll() {
    if (!this.el) return this;
    for (const [t, h, o] of this._listeners) {
      try { this.el.removeEventListener(t, h, o); } catch {}
      __regRemove(this.el, t, h, o);
    }
    this._listeners = [];
    return this;
  }

  /**
   * destroy(): remove all listeners added via .on() on this wrapper.
   * - Does NOT remove element from DOM automatically (so you can decide).
   * - You can call `.get().remove()` yourself if you want.
   */
  destroy() {
    return this.offAll();
  }

  // --- content ---
  text(value) {
    if (!this.el) return value === undefined ? "" : this;
    if (value === undefined) return this.el.textContent ?? "";
    this.el.textContent = String(value);
    return this;
  }

  html(value) {
    if (!this.el) return value === undefined ? "" : this;
    if (value === undefined) return this.el.innerHTML ?? "";
    this.el.innerHTML = String(value);
    return this;
  }

  // --- attrs / css / class ---
  attr(name, value) {
    if (!this.el) return value === undefined ? undefined : this;
    if (value === undefined) return this.el.getAttribute(name);
    this.el.setAttribute(name, String(value));
    return this;
  }

  css(prop, value) {
    if (!this.el) return value === undefined ? undefined : this;
    if (value === undefined) return getComputedStyle(this.el)[prop];
    this.el.style[prop] = String(value);
    return this;
  }

  addClass(...names) {
    if (!this.el) return this;
    this.el.classList.add(...names.flatMap(n => String(n).split(/\s+/).filter(Boolean)));
    return this;
  }

  removeClass(...names) {
    if (!this.el) return this;
    this.el.classList.remove(...names.flatMap(n => String(n).split(/\s+/).filter(Boolean)));
    return this;
  }

  toggleClass(name, force) {
    if (!this.el) return this;
    this.el.classList.toggle(name, force);
    return this;
  }
}

/**
 * $(selector, ctx?) returns a Proxy that:
 * - exposes MiniQuery methods (.on/.text/.addClass/...)
 * - forwards unknown properties to the underlying Element (so existing code still works)
 * - provides .get() to retrieve the raw element safely
 */
, ctx?) returns a Proxy that:
 * - exposes MiniQuery methods (.on/.text/.addClass/...)
 * - forwards unknown properties to the underlying Element (so existing code using .textContent still works)
 * - provides .get( ) to retrieve the raw element safely
 */
export function $(sel, ctx = document) {
  const el = toEl(sel, ctx);
  const q = new MiniQuery(el);

  const proxy = new Proxy(q, {
    get(target, prop, receiver) {
      if (prop === "get") return () => el;
      if (prop === "$") return () => proxy; // tiny convenience
      if (prop in target) {
        const v = Reflect.get(target, prop, receiver);
        // bind methods
        return typeof v === "function" ? v.bind(target) : v;
      }
      // forward to element
      if (el && prop in el) {
        const v = el[prop];
        return typeof v === "function" ? v.bind(el) : v;
      }
      return undefined;
    },
    set(_target, prop, value) {
      if (el) {
        el[prop] = value
        return true
      }
      return false
    }
  });

  return proxy;
}

// ---------- Static helpers (old style, still supported) ----------
$.on = function on(el, type, handler, options) {
  el = toEl(el);
  if (!el) return () => {};
  el.addEventListener(type, handler, options);
  return () => el.removeEventListener(type, handler, options);
};

$.delegate = function delegate(el, type, selector, handler, options) {
  el = toEl(el);
  if (!el) return () => {};
  const wrapped = (e) => {
    const target = e.target instanceof Element ? e.target.closest(selector) : null;
    if (target && el.contains(target)) handler.call(target, e, target);
  };
  el.addEventListener(type, wrapped, options);
  return () => el.removeEventListener(type, wrapped, options);
};

$.create = function create(html) {
  const t = document.createElement("template");
  t.innerHTML = String(html).trim();
  return t.content.firstElementChild;
};

$.attr = function attr(el, name, value) {
  return $(el).attr(name, value);
};

$.css = function css(el, prop, value) {
  return $(el).css(prop, value);
};

$.addClass = function addClass(el, ...names) {
  return $(el).addClass(...names);
};

$.removeClass = function removeClass(el, ...names) {
  return $(el).removeClass(...names);
};

$.toggleClass = function toggleClass(el, name, force) {
  return $(el).toggleClass(name, force);
};

$.text = function text(el, value) {
  return $(el).text(value);
};

$.html = function html(el, value) {
  return $(el).html(value);
};


// ---------- Auto-destroy helpers ----------
/**
 * Remove all listeners registered via `$().on(...)` within the subtree.
 * Use this before wiping innerHTML to avoid leaked listeners if a route forgot to cleanup.
 */
$.destroyTree = function destroyTree(container) {
  const root = toEl(container) || container;
  if (!root) return;

  // destroy root itself
  if (root instanceof Element) __destroyEl(root);

  // destroy descendants
  const nodes = root.querySelectorAll ? root.querySelectorAll("*") : [];
  for (const n of nodes) __destroyEl(n);
};

/**
 * Destroy listeners for a single element (registered via `$().on`).
 */
$.destroy = function destroy(el) {
  const e = toEl(el) || el;
  if (e instanceof Element) __destroyEl(e);
};
