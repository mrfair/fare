export type ClassAttribute = string | string[];

export interface WithClassAttribute {
  class?: ClassAttribute;
}

const whitespacePattern = /\s+/;

function normalizeClassAttribute(value?: ClassAttribute): string[] {
  if (!value) {
    return [];
  }

  const tokens: string[] = [];

  const pushTokens = (chunk: string) => {
    chunk
      .split(whitespacePattern)
      .map((token) => token.trim())
      .filter(Boolean)
      .forEach((token) => tokens.push(token));
  };

  if (Array.isArray(value)) {
    value.forEach((chunk) => {
      if (chunk) {
        pushTokens(chunk);
      }
    });
  } else {
    pushTokens(value);
  }

  return tokens;
}

export function applyClassAttribute(element: HTMLElement, value?: ClassAttribute): void {
  normalizeClassAttribute(value).forEach((className) => element.classList.add(className));
}
