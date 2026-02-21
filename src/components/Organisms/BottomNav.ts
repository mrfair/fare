import { Button } from "../Atoms/Button";

export function BottomNav(labels: string[], onSelect?: (label: string) => void): HTMLDivElement {
  const nav = document.createElement("div");
  nav.classList.add("flex", "justify-around", "items-center", "gap-4");
  nav.style.setProperty("position", "fixed");
  nav.style.setProperty("left", "0");
  nav.style.setProperty("right", "0");
  nav.style.setProperty("bottom", "0");
  nav.style.setProperty("background", "rgba(11,16,32,.95)");
  nav.style.setProperty("border-top", "1px solid var(--border)");
  nav.style.setProperty("z-index", "10");
  nav.style.setProperty("padding", "var(--s-2) 0");

  const buttons: HTMLButtonElement[] = [];
  const setActive = (selectedIdx: number) => {
    buttons.forEach((btn, idx) => {
      btn.style.setProperty("color", idx === selectedIdx ? "var(--text)" : "var(--muted)");
    });
  };

  labels.forEach((label) => {
    const btn = Button({ text: label, variant: "ghost" });
    btn.classList.add("text-sm");
    buttons.push(btn);
    btn.addEventListener("click", () => {
      const idx = buttons.indexOf(btn);
      setActive(idx);
      onSelect?.(label);
    });
    nav.appendChild(btn);
  });

  if (buttons.length) {
    setActive(0);
  }

  return nav;
}
