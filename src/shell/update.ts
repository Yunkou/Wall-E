// Pure Model transition — called only from core.ts update.

import {
  selectFile as selFile,
  selectProject as selProject,
  selectThread as selThread,
  defaultSelection,
} from "../mock/selection.ts";
import { MOCK_PROJECTS } from "../mock/fixtures.ts";
import type { Model, Msg, ThemeMode } from "../core.ts";
import { emptyComposerDraft } from "./model.ts";
import { applyComposerEvent } from "./composer.ts";
import { theme_effectiveScheme, theme_nextThemeMode } from "./theme.ts";

export function createInitialModel(): Model {
  const projects = MOCK_PROJECTS;
  return {
    projects,
    selection: defaultSelection({ projects }),
    draft: emptyComposerDraft(),
    navSplit: 0.24,
    mainSplit: 0.58,
    chromeLeading: 78,
    chromeTop: 52,
    headerHeight: 52,
    themeMode: "system",
    systemScheme: "dark",
    colorScheme: "dark",
    reduceMotion: false,
    highContrast: false,
    showPalette: false,
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
      return { ...model, draft: applyComposerEvent(model.draft, msg.text) };
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
    case "chrome_changed": {
      const leading =
        msg.insets.left >= 0 && msg.insets.left <= 240
          ? Math.trunc(msg.insets.left)
          : model.chromeLeading;
      const top =
        msg.insets.top >= 0 && msg.insets.top <= 120
          ? Math.trunc(msg.insets.top)
          : model.chromeTop;
      const header = top > 52 ? top : 52;
      return {
        ...model,
        chromeLeading: leading,
        chromeTop: top,
        headerHeight: header >= 0 && header <= 120 ? Math.trunc(header) : 52,
      };
    }
    case "set_theme_system":
      return withThemeMode(model, "system");
    case "set_theme_light":
      return withThemeMode(model, "light");
    case "set_theme_dark":
      return withThemeMode(model, "dark");
    case "toggle_theme":
      return withThemeMode(model, theme_nextThemeMode(model.themeMode));
    case "toggle_palette":
      return { ...model, showPalette: !model.showPalette };
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
