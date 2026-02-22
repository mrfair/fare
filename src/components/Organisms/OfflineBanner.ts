export function OfflineBanner(): HTMLDivElement {
  const banner = document.createElement("div");
  banner.classList.add("flex", "items-center", "justify-center", "gap-2", "p-3", "w-full");
  banner.style.setProperty("background", "rgba(255,189,89,.12)");
  banner.style.setProperty("border", "1px solid rgba(255,189,89,.4)");
  banner.textContent = "You are currently offline.";
  return banner;
}
