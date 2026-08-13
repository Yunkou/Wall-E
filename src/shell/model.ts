// Domain model types and composer draft factory.

import type { Project, SelectionState } from "../mock/types";

export type ColorScheme = "light" | "dark";

/** How the shell chooses light/dark: follow OS, or force one scheme. */
export type ThemeMode = "system" | "light" | "dark";

export interface ComposerDraft {
  readonly text: string;
}

export interface Model {
  readonly projects: readonly Project[];
  readonly selection: SelectionState;
  readonly draft: ComposerDraft;
  readonly navSplit: number;
  readonly mainSplit: number;
  readonly themeMode: ThemeMode;
  readonly systemScheme: ColorScheme;
  readonly colorScheme: ColorScheme;
  readonly reduceMotion: boolean;
  readonly highContrast: boolean;
}

export type Msg =
  | { readonly kind: "select_project"; readonly id: number }
  | { readonly kind: "select_thread"; readonly id: number }
  | { readonly kind: "select_file"; readonly id: number }
  | { readonly kind: "draft_edit"; readonly text: string }
  | { readonly kind: "compose_submit" }
  | { readonly kind: "nav_resized"; readonly fraction: number }
  | { readonly kind: "main_resized"; readonly fraction: number }
  | { readonly kind: "set_theme_system" }
  | { readonly kind: "set_theme_light" }
  | { readonly kind: "set_theme_dark" }
  | { readonly kind: "toggle_theme" }
  | {
      readonly kind: "appearance_changed";
      readonly colorScheme: ColorScheme;
      readonly reduceMotion: boolean;
      readonly highContrast: boolean;
    };

export function emptyComposerDraft(): ComposerDraft {
  return { text: "" };
}
