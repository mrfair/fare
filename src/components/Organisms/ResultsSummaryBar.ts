export interface ResultsSummaryBarOptions {
  total?: number;
  filters?: string[];
}

export interface ResultsSummaryBarResult {
  root: HTMLDivElement;
  setTotal(value: number): void;
  setFilters(filters: string[]): void;
}

export function ResultsSummaryBar(options: ResultsSummaryBarOptions = {}): ResultsSummaryBarResult {
  const root = document.createElement("div");
  root.classList.add("flex", "items-center", "justify-between", "gap-3", "flex-wrap");

  const total = document.createElement("span");
  total.classList.add("font-semibold");
  total.textContent = `${options.total ?? 0} results`;

  const filterTags = document.createElement("div");
  filterTags.classList.add("flex", "gap-2", "flex-wrap");

  const renderFilters = (filters: string[]) => {
    filterTags.innerHTML = "";
    filters.forEach((filter) => {
      const tag = document.createElement("span");
      tag.classList.add("rounded-full", "px-3", "py-1", "text-xs");
      tag.style.setProperty("background", "rgba(255,255,255,.08)");
      tag.textContent = filter;
      filterTags.appendChild(tag);
    });
  };

  renderFilters(options.filters ?? []);

  root.appendChild(total);
  root.appendChild(filterTags);

  return {
    root,
    setTotal(value: number) {
      total.textContent = `${value} results`;
    },
    setFilters(filters: string[]) {
      renderFilters(filters);
    },
  };
}
