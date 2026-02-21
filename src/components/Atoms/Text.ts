export function Text(text: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.classList.add("text-base", "leading-normal");
  span.textContent = text;
  return span;
}

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const HEADING_CLASSES: Record<HeadingLevel, string[]> = {
  1: ["text-2xl", "font-bold",     "leading-tight"],
  2: ["text-xl",  "font-semibold", "leading-tight"],
  3: ["text-lg",  "font-semibold", "leading-tight"],
  4: ["text-base","font-semibold", "leading-tight"],
  5: ["text-base","font-medium",   "leading-normal"],
  6: ["text-sm",  "font-medium",   "leading-normal"],
};

export function Heading(level: HeadingLevel, text: string): HTMLHeadingElement {
  const heading = document.createElement(`h${level}` as "h1");
  heading.classList.add(...HEADING_CLASSES[level]);
  heading.textContent = text;
  return heading;
}
