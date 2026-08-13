// Pure Model transition — host-agnostic reducer.

import {
  selectFile as selFile,
  selectProject as selProject,
  selectThread as selThread,
  defaultSelection,
} from "../mock/selection";
import { MOCK_PROJECTS } from "../mock/fixtures";
import type { Model, Msg, ThemeMode } from "./model";
import { emptyComposerDraft } from "./model";
import { applyComposerText } from "./composer";
import { theme_effectiveScheme, theme_nextThemeMode } from "./theme";

export function createInitialModel(): Model {
  const projects = MOCK_PROJECTS;
  return {
    projects,
    selection: defaultSelection({ projects }),
    draft: emptyComposerDraft(),
    navSplit: 0.24,
    mainSplit: 0.58,
    themeMode: "system",
    systemScheme: "dark",
    colorScheme: "dark",
    reduceMotion: false,
    highContrast: false,
  };
}

function withThemeMode(model: Model, mode: ThemeMode): Model {
  return {
    ...model,
    themeMode: mode,
    colorScheme: theme_effectiveScheme(mode, model.systemScheme),
  };
}

export function reduce(model: Model, msg: Msg): Model {
  switch (msg.kind) {
    case "select_project":
      return {
        ...model,
        selection: selProject({ projects: model.projects }, msg.id),
      };
    case "select_thread":
      return {
        ...model,
        selection: selThread(
          { projects: model.projects },
          model.selection.projectId,
          msg.id,
        ),
      };
    case "select_file":
      return {
        ...model,
        selection: selFile(
          { projects: model.projects },
          model.selection.projectId,
          model.selection.threadId,
          msg.id,
        ),
      };
    case "draft_edit":
      return { ...model, draft: applyComposerText(model.draft, msg.text) };
    case "compose_submit":
      return { ...model, draft: emptyComposerDraft() };
    case "nav_resized":
      return {
        ...model,
        navSplit: msg.fraction > 0.12 && msg.fraction < 0.45 ? msg.fraction : model.navSplit,
      };
    case "main_resized":
      return {
        ...model,
        mainSplit: msg.fraction > 0.35 && msg.fraction < 0.85 ? msg.fraction : model.mainSplit,
      };
    case "set_theme_system":
      return withThemeMode(model, "system");
    case "set_theme_light":
      return withThemeMode(model, "light");
    case "set_theme_dark":
      return withThemeMode(model, "dark");
    case "toggle_theme":
      return withThemeMode(model, theme_nextThemeMode(model.themeMode));
    case "appearance_changed": {
      const system = msg.colorScheme;
      return {
        ...model,
        systemScheme: system,
        colorScheme: theme_effectiveScheme(model.themeMode, system),
        reduceMotion: msg.reduceMotion,
        highContrast: msg.highContrast,
      };
    }
  }
}
