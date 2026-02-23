import { applyClassAttribute, WithClassAttribute } from "../shared";

export function OfflineBanner(options: WithClassAttribute = {}): HTMLDivElement {
  const banner = document.createElement("div");
  banner.classList.add("flex", "items-center", "justify-center", "gap-2", "p-3", "w-full");
  banner.style.setProperty("background", "rgba(255,189,89,.12)");
  banner.style.setProperty("border", "1px solid rgba(255,189,89,.4)");
  banner.textContent = "You are currently offline.";
  applyClassAttribute(banner, options.class);
  return banner;
}
