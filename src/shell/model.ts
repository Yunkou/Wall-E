// Composer draft factory only.
// ThemeMode / ComposerDraft / Model / Msg are declared on src/core.ts.

import type { ComposerDraft } from "../core.ts";

export function emptyComposerDraft(): ComposerDraft {
  return {
    bytes: new Uint8Array(0),
    anchor: 0,
    focus: 0,
    compStart: -1,
    compEnd: -1,
  };
}
