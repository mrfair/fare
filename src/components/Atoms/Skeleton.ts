export type SkeletonVariant = "text" | "circle";

export function Skeleton(variant: SkeletonVariant = "text"): HTMLSpanElement {
  const span = document.createElement("span");
  span.classList.add("skeleton");
  if (variant === "text") span.classList.add("text");
  if (variant === "circle") span.classList.add("circle");
  return span;
}
