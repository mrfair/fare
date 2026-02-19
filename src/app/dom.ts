const TEMPLATE_TAG = "template";

type SelectorInput = string | Element | Document | null | undefined;
type ParentLike = Element | Document | null | undefined;
type ContentInput = string | Node | MiniQuery | ContentInput[] | NodeListOf<Node> | HTMLCollectionOf<Element> | null | undefined;
type ListenerTuple = [string, EventListenerOrEventListenerObject, boolean | AddEventListenerOptions | undefined];
type HasGet = { get?: () => Element | null };

const hasGet = (value: unknown): value is HasGet & { get: () => Element | null } =>
  typeof value === "object" && value !== null && typeof (value as HasGet).get === "function";

function toEl(sel: SelectorInput, ctx: ParentLike = document): Element | null {
  if (!sel) return null;

  if (sel instanceof Element || sel === document) return sel as Element;

  if (typeof sel === "string") {
    const s = sel.trim();
    if (s.startsWith("<") && s.endsWith(">") && s.length > 1) {
      const template = document.createElement(TEMPLATE_TAG);
      template.innerHTML = s;
      return template.content.firstElementChild;
    }
    return (ctx || document).querySelector(s);
  }

  return null;
}

const __listenerRegistry = new WeakMap<Element, ListenerTuple[]>();

function __regAdd(el: Element, type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
  const arr = __listenerRegistry.get(el) || [];
  arr.push([type, handler, options]);
  __listenerRegistry.set(el, arr);
}

function __regRemove(el: Element, type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
  const arr = __listenerRegistry.get(el);
  if (!arr) return;
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    const [t, h, o] = arr[i];
    if (t === type && h === handler && o === options) arr.splice(i, 1);
  }
  if (arr.length === 0) __listenerRegistry.delete(el);
}

function __destroyEl(el: Element) {
  const arr = __listenerRegistry.get(el);
  if (!arr || !arr.length) return;
  for (const [type, handler, options] of arr) {
    try {
      el.removeEventListener(type, handler, options);
    } catch {
      // ignore
    }
  }
  __listenerRegistry.delete(el);
}

function normalizeContents(values: ContentInput[]): Node[] {
  const nodes: Node[] = [];

  const collect = (value: ContentInput) => {
    if (value == null) return;

    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }

    if (value instanceof Node) {
      nodes.push(value);
      return;
    }

    if (typeof value === "object") {
      if (value instanceof NodeList || value instanceof HTMLCollection) {
        Array.from(value).forEach(collect);
        return;
      }
      if (hasGet(value)) {
        const el = value.get();
        if (el instanceof Node) nodes.push(el);
        return;
      }
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
        const template = document.createElement(TEMPLATE_TAG);
        template.innerHTML = value;
        nodes.push(...Array.from(template.content.childNodes));
        return;
      }
      nodes.push(document.createTextNode(value));
    }
  };

  values.forEach(collect);
  return nodes;
}

function resolveElements(target: SelectorInput | MiniQuery | ArrayLike<Node>): Element[] {
  const nodes: Element[] = [];

  const collect = (value: SelectorInput | MiniQuery | ArrayLike<Node>) => {
    if (!value) return;

    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }

    if (value instanceof Element) {
      nodes.push(value);
      return;
    }

    if (typeof value === "object") {
      if (hasGet(value)) {
        const el = value.get();
        if (el instanceof Element) nodes.push(el);
        return;
      }
      if (
        value instanceof NodeList ||
        value instanceof HTMLCollection ||
        (typeof (value as NodeList).item === "function" && typeof (value as NodeList).length === "number")
      ) {
        Array.from(value as NodeListOf<Element>).forEach(collect);
        return;
      }
    }

    if (typeof value === "string") {
      nodes.push(...Array.from(document.querySelectorAll(value.trim())));
      return;
    }
  };

  collect(target);
  return nodes;
}

export function $$(sel: string | Element | Element[] | null | undefined, ctx: Element | Document | null = document): Element[] {
  if (!sel) return [];
  if (Array.isArray(sel)) return sel;
  if (sel instanceof Element) return [sel];
  return Array.from((ctx || document).querySelectorAll(sel));
}

export class MiniQuery {
  private _listeners: ListenerTuple[] = [];

  constructor(public el: Element | null) {}

  on(type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    if (!this.el) return this;
    this.el.addEventListener(type, handler, options);
    this._listeners.push([type, handler, options]);
    __regAdd(this.el, type, handler, options);
    return this;
  }

  off(type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    if (!this.el) return this;
    this.el.removeEventListener(type, handler, options);
    __regRemove(this.el, type, handler, options);
    this._listeners = this._listeners.filter(([t, h, o]) => t !== type || h !== handler || o !== options);
    return this;
  }

  offAll() {
    if (!this.el) return this;
    for (const [type, handler, options] of this._listeners) {
      try {
        this.el.removeEventListener(type, handler, options);
      } catch {
        // ignore
      }
      __regRemove(this.el, type, handler, options);
    }
    this._listeners = [];
    return this;
  }

  destroy() {
    return this.offAll();
  }

  text(): string;
  text(value: string): this;
  text(value?: string) {
    if (!this.el) return value === undefined ? "" : this;
    if (value === undefined) return this.el.textContent ?? "";
    this.el.textContent = String(value);
    return this;
  }

  html(): string;
  html(value: ContentInput | ContentInput[]): this;
  html(value?: ContentInput | ContentInput[]) {
    if (!this.el) return value === undefined ? "" : this;
    if (value === undefined) return this.el.innerHTML ?? "";
    if (Array.isArray(value)) {
      this.el.innerHTML = "";
      const nodes = normalizeContents(value);
      nodes.forEach((node) => this.el.appendChild(node));
      return this;
    }
    if (value instanceof MiniQuery) {
      this.el.innerHTML = "";
      const nodes = normalizeContents([value]);
      nodes.forEach((node) => this.el.appendChild(node));
      return this;
    }
    this.el.innerHTML = String(value);
    return this;
  }

  attr(name: string): string | null;
  attr(name: string, value: string | number | boolean): this;
  attr(name: string, value?: string | number | boolean) {
    if (!this.el) return value === undefined ? null : this;
    if (value === undefined) return this.el.getAttribute(name);
    this.el.setAttribute(name, String(value));
    return this;
  }

  addClass(...names: string[]) {
    if (!this.el) return this;
    const normalized = names.flatMap((n) => String(n).split(/\s+/).filter(Boolean));
    this.el.classList.add(...normalized);
    return this;
  }

  removeClass(...names: string[]) {
    if (!this.el) return this;
    const normalized = names.flatMap((n) => String(n).split(/\s+/).filter(Boolean));
    this.el.classList.remove(...normalized);
    return this;
  }

  toggleClass(name: string, force?: boolean) {
    if (!this.el) return this;
    this.el.classList.toggle(name, force);
    return this;
  }

  append(...contents: ContentInput[]) {
    if (!this.el) return this;
    const nodes = normalizeContents(contents);
    for (const node of nodes) this.el.appendChild(node);
    return this;
  }

  appendTo(target: SelectorInput | MiniQuery | ArrayLike<Node>) {
    if (!this.el) return this;
    const parents = resolveElements(target);
    if (!parents.length) return this;
    parents.forEach((parent, index) => {
      const node = index === parents.length - 1 ? this.el : (this.el.cloneNode(true) as Element);
      parent.appendChild(node);
    });
    return this;
  }

  prepend(...contents: ContentInput[]) {
    if (!this.el) return this;
    const nodes = normalizeContents(contents);
    if (!nodes.length) return this;
    const ref = this.el.firstChild;
    for (let i = nodes.length - 1; i >= 0; i -= 1) {
      this.el.insertBefore(nodes[i], ref);
    }
    return this;
  }

  prependTo(target: SelectorInput | MiniQuery | ArrayLike<Node>) {
    if (!this.el) return this;
    const parents = resolveElements(target);
    if (!parents.length) return this;
    parents.forEach((parent, index) => {
      const node = index === parents.length - 1 ? this.el : (this.el.cloneNode(true) as Element);
      parent.insertBefore(node, parent.firstChild);
    });
    return this;
  }

  before(...contents: ContentInput[]) {
    if (!this.el?.parentNode) return this;
    const nodes = normalizeContents(contents);
    for (const node of nodes) {
      this.el.parentNode.insertBefore(node, this.el);
    }
    return this;
  }

  after(...contents: ContentInput[]) {
    if (!this.el?.parentNode) return this;
    const nodes = normalizeContents(contents);
    const ref = this.el.nextSibling;
    for (const node of nodes) {
      this.el.parentNode.insertBefore(node, ref);
    }
    return this;
  }

  closest(selector: string) {
    if (!this.el) return createProxy(null);
    return createProxy(this.el.closest(selector));
  }

  parent() {
    if (!this.el) return createProxy(null);
    return createProxy(this.el.parentElement);
  }

  find(selector: string) {
    if (!this.el) return createProxy(null);
    return createProxy(this.el.querySelector(selector));
  }

  remove() {
    if (!this.el) return this;
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    __destroyEl(this.el);
    return this;
  }
}

export type MiniQueryProxy = MiniQuery & {
  get: () => Element | null;
  $: () => MiniQueryProxy;
};

interface DollarStatic {
  on(el: SelectorInput, type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): () => void;
  delegate(el: SelectorInput, type: string, selector: string, handler: (event: Event, target: Element) => void, options?: boolean | AddEventListenerOptions): () => void;
  create(html: string): Element | null;
  attr(el: SelectorInput, name: string, value?: string | number | boolean): string | MiniQueryProxy | null;
  addClass(el: SelectorInput, ...names: string[]): MiniQueryProxy;
  removeClass(el: SelectorInput, ...names: string[]): MiniQueryProxy;
  toggleClass(el: SelectorInput, name: string, force?: boolean): MiniQueryProxy;
  text(el: SelectorInput, value?: string): string | MiniQueryProxy;
  html(el: SelectorInput, value?: string): string | MiniQueryProxy;
  destroyTree(container: SelectorInput): void;
  destroy(el: SelectorInput): void;
}

type DollarWithStatics = {
  (sel: SelectorInput, ctx?: ParentLike): MiniQueryProxy;
} & DollarStatic;

function createProxy(el: Element | null): MiniQueryProxy {
  const q = new MiniQuery(el);

  const proxy = new Proxy(q, {
    get(target, prop, receiver) {
      if (prop === "get") return () => el;
      if (prop === "$") return () => proxy;
      if (prop in target) {
        const value = Reflect.get(target, prop, receiver);
        return typeof value === "function" ? value.bind(target) : value;
      }
      if (el && prop in el) {
        const value = el[prop as keyof Element];
        return typeof value === "function" ? (value as Function).bind(el) : value;
      }
      return undefined;
    },
    set(_target, prop, value) {
      if (el) {
        (el as any)[prop] = value;
        return true;
      }
      return false;
    }
  }) as MiniQueryProxy;

  return proxy;
}

export const $ = ((sel: SelectorInput, ctx: ParentLike = document) => createProxy(toEl(sel, ctx))) as DollarWithStatics;

$.on = function on(el, type, handler, options) {
  const target = toEl(el);
  if (!target) return () => {};
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
};

$.delegate = function delegate(el, type, selector, handler, options) {
  const target = toEl(el);
  if (!target) return () => {};
  const wrapped = (event: Event) => {
    const candidate = event.target instanceof Element ? event.target.closest(selector) : null;
    if (candidate && target.contains(candidate)) {
      handler.call(candidate, event, candidate);
    }
  };
  target.addEventListener(type, wrapped, options);
  return () => target.removeEventListener(type, wrapped, options);
};

$.create = function create(html) {
  const template = document.createElement(TEMPLATE_TAG);
  template.innerHTML = String(html).trim();
  return template.content.firstElementChild;
};

$.attr = function attr(el, name, value) {
  return $(el).attr(name, value as string);
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

$.destroyTree = function destroyTree(container) {
  const root = toEl(container) || (container as Element);
  if (!root) return;
  if (root instanceof Element) __destroyEl(root);
  const nodes = root.querySelectorAll ? Array.from(root.querySelectorAll("*")) : [];
  for (const node of nodes) __destroyEl(node);
};

$.destroy = function destroy(el) {
  const element = toEl(el) || (el as Element);
  if (element instanceof Element) __destroyEl(element);
};
