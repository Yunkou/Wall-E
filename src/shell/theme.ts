// Theme preference helpers — pure, no host I/O.

import type { ColorScheme, Model, ThemeMode } from "./model";

export function theme_effectiveScheme(mode: ThemeMode, system: ColorScheme): ColorScheme {
  if (mode === "system") return system;
  if (mode === "light") return "light";
  return "dark";
}

export function theme_nextThemeMode(mode: ThemeMode): ThemeMode {
  if (mode === "system") return "light";
  if (mode === "light") return "dark";
  return "system";
}

export function theme_isDark(model: Model): boolean {
  return model.colorScheme === "dark";
}

export function theme_isLight(model: Model): boolean {
  return model.colorScheme === "light";
}

export function theme_isThemeSystem(model: Model): boolean {
  return model.themeMode === "system";
}

export function theme_isThemeLight(model: Model): boolean {
  return model.themeMode === "light";
}

export function theme_isThemeDark(model: Model): boolean {
  return model.themeMode === "dark";
}

export function theme_schemeLabel(model: Model): string {
  if (model.themeMode === "system") {
    return model.systemScheme === "dark" ? "Auto · Dark" : "Auto · Light";
  }
  return model.colorScheme === "dark" ? "Dark" : "Light";
}
