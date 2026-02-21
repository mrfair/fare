import { Button } from "../Atoms/Button";
import { Heading } from "../Atoms/Text";

export interface HeroSectionOptions {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function HeroSection(options: HeroSectionOptions): HTMLSectionElement {
  const section = document.createElement("section");
  section.classList.add("flex", "flex-col", "gap-3", "p-6");
  section.style.setProperty("background", "rgba(255,255,255,.02)");
  section.style.setProperty("border-radius", "var(--r-xl)");
  section.style.setProperty("border", "1px solid var(--border)");

  const title = Heading(1, options.title);
  section.appendChild(title);

  if (options.subtitle) {
    const subtitle = document.createElement("p");
    subtitle.classList.add("text-sm");
    subtitle.textContent = options.subtitle;
    subtitle.style.setProperty("color", "var(--muted)");
    subtitle.style.setProperty("margin", "0");
    section.appendChild(subtitle);
  }

  if (options.ctaLabel) {
    const cta = Button({ text: options.ctaLabel });
    cta.addEventListener("click", () => options.onCta?.());
    section.appendChild(cta);
  }

  return section;
}
