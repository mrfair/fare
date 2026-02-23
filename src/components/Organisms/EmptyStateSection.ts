import { EmptyStateBlock } from "../Molecules/EmptyStateBlock";
import { WithClassAttribute } from "../shared";

export interface EmptyStateSectionOptions extends WithClassAttribute {
  icon?: string;
  title: string;
  message?: string;
}

export function EmptyStateSection(options: EmptyStateSectionOptions): HTMLDivElement {
  const root = EmptyStateBlock({
    icon: options.icon,
    title: options.title,
    message: options.message,
    class: options.class,
  }).root;
  return root;
}
