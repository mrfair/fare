import { Text } from "../Atoms/Text";

export interface FAQItem {
  question: string;
  answer: string;
}

export function FAQAccordionSection(items: FAQItem[]): HTMLSectionElement {
  const section = document.createElement("section");
  section.classList.add("flex", "flex-col", "gap-3");

  items.forEach((item) => {
    const container = document.createElement("div");
    container.classList.add("border", "rounded-lg", "p-4", "flex", "flex-col", "gap-3");
    container.style.setProperty("border-color", "var(--border)");
    container.style.setProperty("background", "rgba(255,255,255,.02)");

    const question = document.createElement("button");
    question.type = "button";
    question.classList.add("btn", "ghost");
    question.textContent = item.question;

    const icon = document.createElement("span");
    icon.textContent = "+";
    icon.classList.add("icon");
    question.appendChild(icon);

    const answer = document.createElement("p");
    answer.appendChild(Text(item.answer));
    answer.classList.add("text-sm");
    answer.style.setProperty("color", "var(--muted)");
    answer.style.display = "none";
    answer.style.margin = "0";

    question.addEventListener("click", () => {
      answer.style.display = answer.style.display === "none" ? "block" : "none";
    });

    container.appendChild(question);
    container.appendChild(answer);
    section.appendChild(container);
  });

  return section;
}
