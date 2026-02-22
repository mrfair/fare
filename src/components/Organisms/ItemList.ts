import { EmptyStateBlock } from "../Molecules/EmptyStateBlock";
import { ListItem, ListItemResult } from "../Molecules/ListItem";
import { Skeleton } from "../Atoms/Skeleton";

export interface ItemListItem {
  title: string;
  subtitle?: string;
  leading?: string | HTMLElement;
  trailing?: string | HTMLElement;
}

export interface ItemListOptions {
  items?: ItemListItem[];
  loading?: boolean;
  emptyState?: {
    title: string;
    message?: string;
  };
}

export interface ItemListResult {
  root: HTMLDivElement;
  setItems(items: ItemListItem[]): void;
  setLoading(loading: boolean): void;
}

export function ItemList(options: ItemListOptions = {}): ItemListResult {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-2", "w-full");

  const list = document.createElement("div");
  list.classList.add("flex", "flex-col", "gap-2");

  const skeletonWrapper = document.createElement("div");
  skeletonWrapper.classList.add("flex", "flex-col", "gap-2");

  const renderSkeletons = () => {
    skeletonWrapper.innerHTML = "";
    for (let i = 0; i < 3; i += 1) {
      const skeleton = Skeleton();
      skeleton.classList.add("h-4");
      skeletonWrapper.appendChild(skeleton);
    }
  };

  const renderItems = (items: ItemListItem[]) => {
    list.innerHTML = "";
    if (!items.length) return;
    items.forEach((item) => {
      const row = ListItem(item);
      list.appendChild(row.el);
    });
  };

  const renderEmpty = () => {
    const emptyDesc = options.emptyState;
    if (!emptyDesc) return;
    const empty = EmptyStateBlock({
      icon: "ℹ️",
      title: emptyDesc.title,
      message: emptyDesc.message,
    });
    list.innerHTML = "";
    list.appendChild(empty.root);
  };

  renderSkeletons();
  renderItems(options.items ?? []);
  if ((options.items ?? []).length === 0 && !options.loading && options.emptyState) {
    renderEmpty();
  }

  const setItems = (items: ItemListItem[]) => {
    renderItems(items);
    if (!items.length && options.emptyState) {
      renderEmpty();
    }
  };

  const setLoading = (loading: boolean) => {
    skeletonWrapper.style.display = loading ? "flex" : "none";
    list.style.display = loading ? "none" : "flex";
  };

  root.appendChild(skeletonWrapper);
  root.appendChild(list);

  setLoading(!!options.loading);

  return { root, setItems, setLoading };
}
