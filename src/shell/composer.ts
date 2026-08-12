// Prompt composer draft — text-edit reducer for the bottom input.

import {
  applyTextInputEvent,
  clampedInsertEvent,
  type TextEditState,
  type TextInputEvent,
} from "@native-sdk/core/text";
import type { ComposerDraft } from "../core.ts";
import { emptyComposerDraft } from "./model.ts";

const MAX_DRAFT = 4096;

export { emptyComposerDraft };

function composerState(d: ComposerDraft): TextEditState {
  return {
    text: d.bytes,
    selection: { anchor: d.anchor, focus: d.focus },
    composition: d.compStart >= 0 ? { start: d.compStart, end: d.compEnd } : null,
  };
}

export function applyComposerEvent(d: ComposerDraft, event: TextInputEvent): ComposerDraft {
  const state = composerState(d);
  const next = applyTextInputEvent(state, event, MAX_DRAFT);
  if (next === null) {
    const clamped = clampedInsertEvent(state, event, MAX_DRAFT);
    if (clamped === null) return d;
    const nextClamped = applyTextInputEvent(state, clamped, MAX_DRAFT);
    if (nextClamped === null) return d;
    const clampedStart = nextClamped.composition !== null ? nextClamped.composition.start : -1;
    const clampedEnd = nextClamped.composition !== null ? nextClamped.composition.end : -1;
    return {
      bytes: nextClamped.text,
      anchor: nextClamped.selection.anchor,
      focus: nextClamped.selection.focus,
      compStart:
        clampedStart >= -1 && clampedStart <= 9007199254740991 ? Math.trunc(clampedStart) : -1,
      compEnd: clampedEnd >= -1 && clampedEnd <= 9007199254740991 ? Math.trunc(clampedEnd) : -1,
    };
  }
  const start = next.composition !== null ? next.composition.start : -1;
  const end = next.composition !== null ? next.composition.end : -1;
  return {
    bytes: next.text,
    anchor: next.selection.anchor,
    focus: next.selection.focus,
    compStart: start >= -1 && start <= 9007199254740991 ? Math.trunc(start) : -1,
    compEnd: end >= -1 && end <= 9007199254740991 ? Math.trunc(end) : -1,
  };
}
