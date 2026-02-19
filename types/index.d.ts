export type SelectorInput = string | Element | Document | Window | null | undefined;
export type ParentLike = Element | Document | Window | null | undefined;

export interface MiniQuery {
  el: Element | null;
  on(type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): this;
  off(type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): this;
  offAll(): this;
  destroy(): this;
  text(value?: string): string | this;
  html(value?: string): string | this;
  attr(name: string): string | null;
  attr(name: string, value: string | number | boolean): this;
  addClass(...names: string[]): this;
  removeClass(...names: string[]): this;
  toggleClass(name: string, force?: boolean): this;
  append(...contents: unknown[]): this;
  appendTo(target: SelectorInput | MiniQuery | ArrayLike<Node>): this;
  prepend(...contents: unknown[]): this;
  prependTo(target: SelectorInput | MiniQuery | ArrayLike<Node>): this;
  before(...contents: unknown[]): this;
  after(...contents: unknown[]): this;
  closest(selector: string): MiniQueryProxy;
  parent(): MiniQueryProxy;
  find(selector: string): MiniQueryProxy;
  remove(): this;
}

export type MiniQueryProxy = MiniQuery & {
  get(): Element | null;
  $(): MiniQueryProxy;
};

export interface DollarStatic {
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

export type DollarWithStatics = {
  (sel: SelectorInput, ctx?: ParentLike): MiniQueryProxy;
} & DollarStatic;

export const $: DollarWithStatics;
export function $$(sel: string | Element | Element[] | null | undefined, ctx?: Element | Document | null): Element[];
