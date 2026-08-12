// App entry core — Native SDK contract surface.
//
// Declared HERE (required by the entry contract):
//   Model, Msg, update, initialModel, channels, viewUnbound, markup helpers
//
// Implemented in modules:
//   src/shell/*     — pure reduce / selectors / theme / composer
//   src/mock/*      — fixtures + selection domain
//   src/components/* — markup templates
//   src/app.native  — shell layout entry view

import type { TextInputEvent } from "@native-sdk/core/text";
import type {
  ChromeButtons,
  ChromeInsets,
  ColorScheme,
  KeyEvent,
} from "@native-sdk/core/events";
import type { FileChange, Message, Project, SelectionState, Thread } from "./mock/types.ts";
import { createInitialModel, reduce } from "./shell/update.ts";
import {
  query_selectedProject,
  query_selectedThread,
  query_selectedFile,
  query_projectThreads,
  query_messages,
  query_files,
  query_hasThread,
  query_hasMessages,
  query_hasFiles,
  query_hasSelectedFile,
  query_hasThreadStatus,
  query_threadTitle,
  query_projectName,
  query_filePath,
  query_fileDiff,
  query_fileLanguage,
  query_draftText,
  query_messageCount,
  query_fileCount,
  query_threadStatusLabel,
  query_additionsLabel,
  query_deletionsLabel,
} from "./shell/selectors.ts";
import {
  theme_isDark,
  theme_isLight,
  theme_isThemeSystem,
  theme_isThemeLight,
  theme_isThemeDark,
  theme_schemeLabel,
  theme_schemeIcon,
} from "./shell/theme.ts";

export type { ColorScheme };

/** How the shell chooses light/dark: follow OS, or force one scheme. */
export type ThemeMode = "system" | "light" | "dark";

export interface ComposerDraft {
  readonly bytes: Uint8Array;
  readonly anchor: number;
  readonly focus: number;
  readonly compStart: number;
  readonly compEnd: number;
}

export interface Model {
  readonly projects: readonly Project[];
  readonly selection: SelectionState;
  readonly draft: ComposerDraft;
  readonly navSplit: number;
  readonly mainSplit: number;
  readonly chromeLeading: number;
  readonly chromeTop: number;
  readonly headerHeight: number;
  readonly themeMode: ThemeMode;
  readonly systemScheme: ColorScheme;
  readonly colorScheme: ColorScheme;
  readonly reduceMotion: boolean;
  readonly highContrast: boolean;
  /** Debug Uber token swatches; toggled by Cmd/Ctrl+Shift+P. */
  readonly showPalette: boolean;
}

export type Msg =
  | { readonly kind: "select_project"; readonly id: number }
  | { readonly kind: "select_thread"; readonly id: number }
  | { readonly kind: "select_file"; readonly id: number }
  | { readonly kind: "draft_edit"; readonly text: TextInputEvent }
  | { readonly kind: "compose_submit" }
  | { readonly kind: "nav_resized"; readonly fraction: number }
  | { readonly kind: "main_resized"; readonly fraction: number }
  | { readonly kind: "set_theme_system" }
  | { readonly kind: "set_theme_light" }
  | { readonly kind: "set_theme_dark" }
  | { readonly kind: "toggle_theme" }
  | { readonly kind: "toggle_palette" }
  | {
      readonly kind: "chrome_changed";
      readonly insets: ChromeInsets;
      readonly buttons: ChromeButtons;
      readonly tabsProjected: boolean;
    }
  | {
      readonly kind: "appearance_changed";
      readonly colorScheme: ColorScheme;
      readonly reduceMotion: boolean;
      readonly highContrast: boolean;
    };

export const viewUnbound = [
  "chromeTop",
  "chrome_changed",
  "appearance_changed",
  "reduceMotion",
  "highContrast",
  "systemScheme",
  "colorScheme",
  "themeMode",
  "showPalette",
  "toggle_palette",
  // Consumed by the Uber tokens_fn / theme helpers, not bound as fields.
  "isDark",
  "isLight",
  "hasMessages",
  "fileLanguage",
  "draft",
] as const;

export const chromeMsg = "chrome_changed";
export const appearanceMsg = "appearance_changed";

export function initialModel(): Model {
  return createInitialModel();
}

export function update(model: Model, msg: Msg): Model {
  return reduce(model, msg);
}

/** App-level key fallback: Cmd/Ctrl+Shift+P toggles the Uber palette pane. */
export function keyMsg(key: KeyEvent): Msg | null {
  if (!key.shift) return null;
  if (key.alt) return null;
  if (!(key.super || key.control)) return null;
  if (key.key !== "p") return null;
  return { kind: "toggle_palette" };
}

// --- Markup binding helpers (declared here; logic in shell/) ---
// Explicit param + return types are required for the frontend to treat
// these as model helpers (single-Model derived values for markup).

export function selectedProject(model: Model): Project | null {
  return query_selectedProject(model);
}
export function selectedThread(model: Model): Thread | null {
  return query_selectedThread(model);
}
export function selectedFile(model: Model): FileChange | null {
  return query_selectedFile(model);
}
export function projectThreads(model: Model): readonly Thread[] {
  return query_projectThreads(model);
}
export function messages(model: Model): readonly Message[] {
  return query_messages(model);
}
export function files(model: Model): readonly FileChange[] {
  return query_files(model);
}
export function hasThread(model: Model): boolean {
  return query_hasThread(model);
}
export function hasMessages(model: Model): boolean {
  return query_hasMessages(model);
}
export function hasFiles(model: Model): boolean {
  return query_hasFiles(model);
}
export function hasSelectedFile(model: Model): boolean {
  return query_hasSelectedFile(model);
}
export function hasThreadStatus(model: Model): boolean {
  return query_hasThreadStatus(model);
}
export function threadTitle(model: Model): Uint8Array {
  return query_threadTitle(model);
}
export function projectName(model: Model): Uint8Array {
  return query_projectName(model);
}
export function filePath(model: Model): Uint8Array {
  return query_filePath(model);
}
export function fileDiff(model: Model): Uint8Array {
  return query_fileDiff(model);
}
export function fileLanguage(model: Model): Uint8Array {
  return query_fileLanguage(model);
}
export function draftText(model: Model): Uint8Array {
  return query_draftText(model);
}
export function messageCount(model: Model): number {
  return query_messageCount(model);
}
export function fileCount(model: Model): number {
  return query_fileCount(model);
}
export function threadStatusLabel(model: Model): Uint8Array {
  return query_threadStatusLabel(model);
}
export function additionsLabel(model: Model): Uint8Array {
  return query_additionsLabel(model);
}
export function deletionsLabel(model: Model): Uint8Array {
  return query_deletionsLabel(model);
}
export function isDark(model: Model): boolean {
  return theme_isDark(model);
}
export function isLight(model: Model): boolean {
  return theme_isLight(model);
}
export function isThemeSystem(model: Model): boolean {
  return theme_isThemeSystem(model);
}
export function isThemeLight(model: Model): boolean {
  return theme_isThemeLight(model);
}
export function isThemeDark(model: Model): boolean {
  return theme_isThemeDark(model);
}
export function schemeLabel(model: Model): Uint8Array {
  return theme_schemeLabel(model);
}
export function schemeIcon(model: Model): Uint8Array {
  return theme_schemeIcon(model);
}
export function showShell(model: Model): boolean {
  return !model.showPalette;
}
