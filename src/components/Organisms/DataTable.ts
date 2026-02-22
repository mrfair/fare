export interface DataTableColumn<T> {
  label: string;
  render?: (row: T) => string | Node;
  key: keyof T;
}

export interface DataTableOptions<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
}

export function DataTable<T>(options: DataTableOptions<T>): HTMLDivElement {
  const container = document.createElement("div");
  container.classList.add("overflow-x-auto", "w-full");

  const table = document.createElement("table");
  table.classList.add("w-full", "border-collapse");
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  options.columns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column.label;
    th.classList.add("text-left", "py-2", "px-3", "text-sm");
    th.style.setProperty("border-bottom", "1px solid var(--border)");
    headRow.appendChild(th);
  });

  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  options.rows.forEach((row) => {
    const tr = document.createElement("tr");
    options.columns.forEach((column) => {
      const td = document.createElement("td");
      td.classList.add("py-2", "px-3", "text-sm");
      td.style.setProperty("border-bottom", "1px solid rgba(255,255,255,.08)");
      const cell = column.render
        ? column.render(row)
        : String(row[column.key] ?? "");
      if (typeof cell === "string" || typeof cell === "number") {
        td.textContent = String(cell);
      } else {
        td.appendChild(cell);
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
  return container;
}
