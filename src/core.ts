// App domain entry — Electron/React host uses this surface.
//
// Declared HERE:
//   Model, Msg, update, initialModel, and derived helpers
//
// Implemented in modules:
//   src/shell/*  — pure reduce / selectors / theme / composer
//   src/mock/*   — fixtures + selection domain

export type {
  ColorScheme,
  ComposerDraft,
  Model,
  Msg,
  ThemeMode,
} from "./shell/model";

import { createInitialModel, reduce } from "./shell/update";
import type { Model, Msg } from "./shell/model";
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
  query_threadTitle,
  query_projectName,
  query_filePath,
  query_fileDiff,
  query_draftText,
  query_messageCount,
  query_fileCount,
  query_threadStatusLabel,
  query_additionsLabel,
  query_deletionsLabel,
} from "./shell/selectors";
import {
  theme_isDark,
  theme_isLight,
  theme_isThemeSystem,
  theme_isThemeLight,
  theme_isThemeDark,
  theme_schemeLabel,
} from "./shell/theme";
import type { FileChange, Message, Project, Thread } from "./mock/types";

export function initialModel(): Model {
  return createInitialModel();
}

export function update(model: Model, msg: Msg): Model {
  return reduce(model, msg);
}

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
export function threadTitle(model: Model): string {
  return query_threadTitle(model);
}
export function projectName(model: Model): string {
  return query_projectName(model);
}
export function filePath(model: Model): string {
  return query_filePath(model);
}
export function fileDiff(model: Model): string {
  return query_fileDiff(model);
}
export function draftText(model: Model): string {
  return query_draftText(model);
}
export function messageCount(model: Model): number {
  return query_messageCount(model);
}
export function fileCount(model: Model): number {
  return query_fileCount(model);
}
export function threadStatusLabel(model: Model): string {
  return query_threadStatusLabel(model);
}
export function additionsLabel(model: Model): string {
  return query_additionsLabel(model);
}
export function deletionsLabel(model: Model): string {
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
export function schemeLabel(model: Model): string {
  return theme_schemeLabel(model);
}
