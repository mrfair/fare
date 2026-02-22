import { Heading } from "../Atoms/Text";

export interface CarouselRowItem {
  title: string;
  subtitle?: string;
  caption?: string;
}

export interface CarouselRowOptions {
  items: CarouselRowItem[];
  title?: string;
}

export function CarouselRow(options: CarouselRowOptions): HTMLDivElement {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-3");

  if (options.title) {
    const heading = Heading(4, options.title);
    heading.classList.add("m-0");
    root.appendChild(heading);
  }

  const track = document.createElement("div");
  track.classList.add("flex", "gap-3", "overflow-x-auto", "py-2");
  track.style.setProperty("scroll-snap-type", "x mandatory");

  options.items.forEach((item) => {
    const card = document.createElement("article");
    card.classList.add("flex", "flex-col", "gap-2", "min-w-[220px]", "p-4", "rounded-2xl", "border");
    card.style.setProperty("border-color", "var(--border)");
    card.style.setProperty("background", "rgba(255,255,255,.02)");
    card.style.setProperty("scroll-snap-align", "start");

    const title = Heading(5, item.title);
    title.classList.add("m-0");
    card.appendChild(title);

    if (item.subtitle) {
      const subtitle = document.createElement("p");
      subtitle.textContent = item.subtitle;
      subtitle.classList.add("text-sm");
      subtitle.style.setProperty("color", "var(--muted)");
      subtitle.style.setProperty("margin", "0");
      card.appendChild(subtitle);
    }

    if (item.caption) {
      const caption = document.createElement("span");
      caption.textContent = item.caption;
      caption.classList.add("text-xs");
      caption.style.setProperty("color", "var(--accent)");
      card.appendChild(caption);
    }

    track.appendChild(card);
  });

  root.appendChild(track);
  return root;
}
