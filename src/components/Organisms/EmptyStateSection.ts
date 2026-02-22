import { EmptyStateBlock } from "../Molecules/EmptyStateBlock";

export interface EmptyStateSectionOptions {
  icon?: string;
  title: string;
  message?: string;
}

export function EmptyStateSection(options: EmptyStateSectionOptions): HTMLDivElement {
  const root = EmptyStateBlock({
    icon: options.icon,
    title: options.title,
    message: options.message,
  }).root;
  return root;
}
