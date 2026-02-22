export interface StepperStep {
  label: string;
  status?: "complete" | "current" | "upcoming";
}

export interface StepperOptions {
  steps: StepperStep[];
}

export function Stepper(options: StepperOptions): HTMLDivElement {
  const root = document.createElement("div");
  root.classList.add("flex", "items-center", "gap-3", "flex-wrap");

  options.steps.forEach((step, index) => {
    const badge = document.createElement("span");
    badge.classList.add("rounded-full", "px-3", "py-1", "text-sm", "border");
    badge.textContent = step.label;
    badge.style.setProperty("border-color", "var(--border)");
    if (step.status === "complete") {
      badge.style.setProperty("background", "rgba(64,196,99,.12)");
    } else if (step.status === "current") {
      badge.style.setProperty("border-color", "var(--accent)");
      badge.style.setProperty("background", "rgba(124,92,255,.12)");
    }
    root.appendChild(badge);
    if (index < options.steps.length - 1) {
      const connector = document.createElement("span");
      connector.textContent = "→";
      connector.classList.add("text-sm");
      root.appendChild(connector);
    }
  });

  return root;
}
