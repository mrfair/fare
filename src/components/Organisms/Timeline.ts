export interface TimelineEvent {
  title: string;
  date: string;
  description?: string;
}

export interface TimelineOptions {
  events: TimelineEvent[];
}

export function Timeline(options: TimelineOptions): HTMLDivElement {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-4");

  options.events.forEach((event) => {
    const row = document.createElement("div");
    row.classList.add("flex", "gap-3", "items-start");

    const marker = document.createElement("span");
    marker.classList.add("w-3", "h-3", "rounded-full");
    marker.style.setProperty("background", "var(--accent)");

    const body = document.createElement("div");
    body.classList.add("flex", "flex-col", "gap-1");

    const title = document.createElement("strong");
    title.textContent = event.title;
    const date = document.createElement("span");
    date.classList.add("text-xs");
    date.style.setProperty("color", "var(--muted)");
    date.textContent = event.date;

    body.appendChild(title);
    body.appendChild(date);

    if (event.description) {
      const desc = document.createElement("p");
      desc.classList.add("text-sm");
      desc.style.setProperty("margin", "0");
      desc.textContent = event.description;
      body.appendChild(desc);
    }

    row.appendChild(marker);
    row.appendChild(body);
    root.appendChild(row);
  });

  return root;
}
