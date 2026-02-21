import { $ } from "./dom.ts";

type AutoDestroyOptions = {
  root?: Element;
  enabled?: boolean;
  maxNodesPerMutation?: number;
};

let started = false;
let observer: MutationObserver | null = null;

/**
 * Automatically removes listeners that were registered via `$().on(...)` when the
 * corresponding DOM nodes are detached.
 */
export function startAutoDestroyObserver({
  root = document.documentElement,
  enabled = true,
  maxNodesPerMutation = 200,
}: AutoDestroyOptions = {}): () => void {
  if (!enabled || started) return () => {};
  started = true;

  observer = new MutationObserver((mutations) => {
    let processed = 0;

    for (const mutation of mutations) {
      if (!mutation.removedNodes || mutation.removedNodes.length === 0) continue;

      for (const node of mutation.removedNodes) {
        if (!(node instanceof Element)) continue;

        processed += 1;
        if (processed > maxNodesPerMutation) return;

        try { $.destroyTree(node); } catch {
          /* ignore */
        }
      }
    }
  });

  observer.observe(root, { childList: true, subtree: true });

  return () => {
    try { observer?.disconnect(); } catch {
      /* ignore */
    }
    observer = null;
    started = false;
  };
}

export function stopAutoDestroyObserver(): void {
  try { observer?.disconnect(); } catch {
    /* ignore */
  }
  observer = null;
  started = false;
}
