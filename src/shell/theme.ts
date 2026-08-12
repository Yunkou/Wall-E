// Theme preference helpers — pure, no host I/O.

import { asciiBytes } from "@native-sdk/core";
import type { ColorScheme } from "@native-sdk/core/events";
import type { Model, ThemeMode } from "../core.ts";

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

export function theme_schemeLabel(model: Model): Uint8Array {
  if (model.themeMode === "system") {
    return model.systemScheme === "dark"
      ? asciiBytes("Auto · Dark")
      : asciiBytes("Auto · Light");
  }
  return model.colorScheme === "dark" ? asciiBytes("Dark") : asciiBytes("Light");
}

export function theme_schemeIcon(model: Model): Uint8Array {
  // Lucide via app: namespace (see src/theme/lucide_icons.zig).
  return model.colorScheme === "dark" ? asciiBytes("app:moon") : asciiBytes("app:sun");
}
