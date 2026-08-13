// Shell domain modules (logic only — no React).

export { createInitialModel, reduce } from "./update";
export type { ColorScheme, ComposerDraft, Model, Msg, ThemeMode } from "./model";
export { emptyComposerDraft } from "./model";
export {
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
} from "./selectors";
export {
  theme_effectiveScheme,
  theme_nextThemeMode,
  theme_isDark,
  theme_isLight,
  theme_isThemeSystem,
  theme_isThemeLight,
  theme_isThemeDark,
  theme_schemeLabel,
} from "./theme";
