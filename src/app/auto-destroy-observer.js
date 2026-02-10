import { $ } from "./dom.js";

let started = false;
let observer = null;

/**
 * Auto-destroy listeners when elements are removed from DOM.
 * This uses MutationObserver and calls $.destroyTree(node) on removed nodes.
 *
 * Notes:
 * - Only affects listeners registered via `$().on(...)` (tracked in dom.js registry).
 * - Timers/fetch/observers still need explicit cleanup via route cleanup.
 * - For large DOM churn apps, you may want to disable or scope this.
 */
export function startAutoDestroyObserver({
  root = document.documentElement,
  enabled = true,
  maxNodesPerMutation = 200,
} = {}) {
  if (!enabled || started) return () => {};
  started = true;

  observer = new MutationObserver((mutations) => {
    let processed = 0;

    for (const m of mutations) {
      if (!m.removedNodes || m.removedNodes.length === 0) continue;

      for (const n of m.removedNodes) {
        if (!(n instanceof Element)) continue;

        // Safety: cap work per mutation batch
        processed += 1;
        if (processed > maxNodesPerMutation) return;

        try { $.destroyTree(n); } catch {}
      }
    }
  });

  observer.observe(root, { childList: true, subtree: true });

  return () => {
    try { observer?.disconnect(); } catch {}
    observer = null;
    started = false;
  };
}

export function stopAutoDestroyObserver() {
  try { observer?.disconnect(); } catch {}
  observer = null;
  started = false;
}
