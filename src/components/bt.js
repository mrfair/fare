import { $ } from "../app/dom.ts";

/**
 * jQuery-style component example.
 * Returns { el, destroy } so routes can cleanup on navigation.
 */
export function bt({ text = "Click", onClick } = {}) {
  const btn = $(`<button class="btn primary">${text}</button>`);

  const off = btn.on("click", function (e) {
    onClick?.(e);
  });

  return { el: btn.get(), destroy: off };
}
