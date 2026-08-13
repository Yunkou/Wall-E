// Prompt composer draft — string reducer for the bottom input.

import type { ComposerDraft } from "./model";
import { emptyComposerDraft } from "./model";

const MAX_DRAFT = 4096;

export { emptyComposerDraft };

export function applyComposerText(d: ComposerDraft, text: string): ComposerDraft {
  if (text.length <= MAX_DRAFT) return { text };
  return { text: text.slice(0, MAX_DRAFT) };
}

export function clearComposerDraft(): ComposerDraft {
  return emptyComposerDraft();
}
