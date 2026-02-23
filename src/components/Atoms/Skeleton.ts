import { applyClassAttribute, WithClassAttribute } from "../shared";

export type SkeletonVariant = "text" | "circle";

export interface SkeletonOptions extends WithClassAttribute {
  variant?: SkeletonVariant;
}

export function Skeleton(options: SkeletonOptions = {}): HTMLSpanElement {
  const { variant = "text", class: classAttr } = options;
  const span = document.createElement("span");
  span.classList.add("skeleton");
  if (variant === "text") span.classList.add("text");
  if (variant === "circle") span.classList.add("circle");
  applyClassAttribute(span, classAttr);
  return span;
}
