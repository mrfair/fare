export interface InfiniteScrollFeedOptions<T> {
  loadMore: () => Promise<T[]>;
  renderItem: (item: T) => HTMLElement;
  buffer?: number;
}

export interface InfiniteScrollFeedResult {
  root: HTMLDivElement;
  destroy(): void;
}

export function InfiniteScrollFeed<T>(options: InfiniteScrollFeedOptions<T>): InfiniteScrollFeedResult {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-3");

  const sentinel = document.createElement("div");
  sentinel.classList.add("h-2");

  let loading = false;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !loading) {
          loading = true;
          options
            .loadMore()
            .then((items) => {
              items.forEach((item) => {
                root.insertBefore(options.renderItem(item), sentinel);
              });
            })
            .finally(() => {
              loading = false;
            });
        }
      });
    },
    { threshold: 0.4 }
  );

  root.appendChild(sentinel);
  observer.observe(sentinel);

  return {
    root,
    destroy() {
      observer.disconnect();
    },
  };
}
