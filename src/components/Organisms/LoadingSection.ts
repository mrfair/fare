import { Skeleton } from "../Atoms/Skeleton";

export function LoadingSection(): HTMLDivElement {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-2");
  for (let i = 0; i < 4; i += 1) {
    const skeleton = Skeleton();
    skeleton.style.setProperty("width", `${80 - i * 10}%`);
    root.appendChild(skeleton);
  }
  return root;
}
