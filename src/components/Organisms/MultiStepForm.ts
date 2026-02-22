import { Button } from "../Atoms/Button";
import { Stepper, StepperOptions } from "./Stepper";

export interface MultiStepFormStep {
  title: string;
  content: () => HTMLElement;
}

export interface MultiStepFormOptions {
  steps: MultiStepFormStep[];
  onComplete?: () => void;
}

export interface MultiStepFormResult {
  root: HTMLDivElement;
  goTo(index: number): void;
}

export function MultiStepForm(options: MultiStepFormOptions): MultiStepFormResult {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-4", "w-full");

  let currentIndex = 0;

  const stepperOptions: StepperOptions = {
    steps: options.steps.map((step, idx) => ({
      label: step.title,
      status: idx === 0 ? "current" : "upcoming",
    })),
  };
  const stepperContainer = document.createElement("div");


  const content = document.createElement("div");
  content.classList.add("flex", "flex-col", "gap-3", "w-full");

  const nav = document.createElement("div");
  nav.classList.add("flex", "gap-3");
  const prevBtn = Button({ text: "Back", variant: "ghost" });
  const nextBtn = Button({ text: "Next", variant: "primary" });

  const renderStepper = () => {
    stepperOptions.steps.forEach((step, idx) => {
      if (idx === currentIndex) {
        step.status = "current";
      } else if (idx < currentIndex) {
        step.status = "complete";
      } else {
        step.status = "upcoming";
      }
    });
    stepperContainer.innerHTML = "";
    stepperContainer.appendChild(Stepper(stepperOptions));
  };

  const refreshContent = () => {
    content.innerHTML = "";
    content.appendChild(options.steps[currentIndex].content());
    prevBtn.disabled = currentIndex === 0;
    nextBtn.textContent = currentIndex === options.steps.length - 1 ? "Finish" : "Next";
  };

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      render();
      refreshContent();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < options.steps.length - 1) {
      currentIndex += 1;
      render();
      refreshContent();
    } else {
      options.onComplete?.();
    }
  });

  nav.appendChild(prevBtn);
  nav.appendChild(nextBtn);

  renderStepper();
  root.appendChild(stepperContainer);
  root.appendChild(content);
  root.appendChild(nav);

  refreshContent();

  return {
    root,
    goTo(index: number) {
      if (index >= 0 && index < options.steps.length) {
        currentIndex = index;
        render();
        refreshContent();
      }
    },
  };
}
