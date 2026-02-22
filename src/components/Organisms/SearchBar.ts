import { Button } from "../Atoms/Button";
import { Spinner } from "../Atoms/Spinner";
import { SearchField, SearchFieldResult } from "../Molecules/SearchField";

export interface SearchBarOptions {
  placeholder?: string;
  includeFilterToggle?: boolean;
  filterLabel?: string;
  onSearch?: (value: string) => void;
  onFilterToggle?: () => void;
  loading?: boolean;
}

export interface SearchBarResult {
  root: HTMLDivElement;
  searchField: SearchFieldResult;
  filterButton?: HTMLButtonElement;
  setLoading(loading: boolean): void;
}

export function SearchBar(options: SearchBarOptions = {}): SearchBarResult {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-3");

  const searchField = SearchField({
    placeholder: options.placeholder,
    onSearch: options.onSearch,
  });

  const actionRow = document.createElement("div");
  actionRow.classList.add("flex", "items-center", "gap-3", "flex-wrap");
  actionRow.appendChild(searchField.el);

  let filterButton: HTMLButtonElement | undefined;
  if (options.includeFilterToggle) {
    filterButton = Button({
      text: options.filterLabel || "Filters",
      variant: "ghost",
    });
    filterButton.classList.add("text-sm");
    filterButton.addEventListener("click", () => {
      options.onFilterToggle?.();
    });
    actionRow.appendChild(filterButton);
  }

  const statusRow = document.createElement("div");
  statusRow.classList.add("flex", "items-center", "gap-2");

  const loader = Spinner();
  loader.style.display = options.loading ? "inline-flex" : "none";
  statusRow.appendChild(loader);

  const info = document.createElement("span");
  info.classList.add("text-sm");
  info.textContent = "Search across the catalog.";
  statusRow.appendChild(info);

  root.appendChild(actionRow);
  root.appendChild(statusRow);

  const setLoading = (loading: boolean) => {
    loader.style.display = loading ? "inline-flex" : "none";
  };

  return { root, searchField, filterButton, setLoading };
}
