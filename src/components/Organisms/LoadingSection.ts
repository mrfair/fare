import { Skeleton } from "../Atoms/Skeleton";
import { applyClassAttribute, WithClassAttribute } from "../shared";

export function LoadingSection(options: WithClassAttribute = {}): HTMLDivElement {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-2");
  applyClassAttribute(root, options.class);
  for (let i = 0; i < 4; i += 1) {
    const skeleton = Skeleton();
    skeleton.style.setProperty("width", `${80 - i * 10}%`);
    root.appendChild(skeleton);
  }
  return root;
}
