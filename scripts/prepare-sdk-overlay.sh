#!/usr/bin/env bash
# Build or refresh a project-local Native SDK tree that stages Wall-E's
# Uber theme + Lucide icons launcher. Most of the SDK is symlinked; only
# owned launcher/theme/icon Zig files and a stage patch are real files.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/.native/sdk-overlay"

# Prefer a real (non-overlay) SDK install. Never use the overlay as the source.
if [[ -n "${NATIVE_SDK_ROOT:-}" && -d "$NATIVE_SDK_ROOT" ]]; then
  REAL="$NATIVE_SDK_ROOT"
elif [[ -d "$ROOT/node_modules/@native-sdk/cli" ]]; then
  REAL="$ROOT/node_modules/@native-sdk/cli"
elif [[ -d "${HOME}/.vite-plus/js_runtime/node/24.14.0/lib/node_modules/@native-sdk/cli" ]]; then
  REAL="${HOME}/.vite-plus/js_runtime/node/24.14.0/lib/node_modules/@native-sdk/cli"
else
  CLI_BIN="$(command -v native || true)"
  if [[ -n "$CLI_BIN" ]]; then
    REAL="$(cd "$(dirname "$CLI_BIN")/../lib/node_modules/@native-sdk/cli" 2>/dev/null && pwd || true)"
  fi
  if [[ -z "${REAL:-}" || ! -d "$REAL" ]]; then
    echo "error: cannot locate @native-sdk/cli — set NATIVE_SDK_ROOT or install the CLI" >&2
    exit 1
  fi
fi

REAL="$(cd "$REAL" && pwd)"
if [[ "$REAL" == "$DEST" ]]; then
  echo "error: NATIVE_SDK_ROOT must point at a real @native-sdk/cli install, not the overlay" >&2
  exit 1
fi

copy_owned_sources() {
  cp "$ROOT/src/theme/ts_core_main.zig" "$DEST/src/app_runner/ts_core_main.zig"
  cp "$ROOT/src/theme/uber.zig" "$DEST/src/app_runner/uber.zig"
  cp "$ROOT/src/theme/lucide_icons.zig" "$DEST/src/app_runner/lucide_icons.zig"
}

patch_stage() {
  python3 - "$DEST/build/app.zig" <<'PY'
import sys
from pathlib import Path

p = Path(sys.argv[1])
text = p.read_text()
# Already fully patched (theme + lucide + markup components including palette)
if (
    "lucide_icons.zig" in text
    and "uber.zig" in text
    and "components/titlebar.native" in text
    and "components/palette-pane.native" in text
):
    print("build/app.zig already stages uber + lucide + markup components")
    raise SystemExit(0)

components = [
    "titlebar",
    "session-card",
    "session-sidebar",
    "message-user",
    "message-assistant",
    "compose-bar",
    "conversation-pane",
    "review-pane",
    "palette-pane",
]
component_copies = "".join(
    f'    _ = staged.addCopyFile(b.path(appPath(b, app_root, "src/components/{name}.native")), "components/{name}.native");\n'
    for name in components
)

replacement = (
    '    _ = staged.addCopyFile(b.path(appPath(b, app_root, "src/app.native")), "app.native");\n'
    '    // Wall-E: stage markup <import> closure for first-frame resolve.\n'
    + component_copies
    + '    // Wall-E: stage Uber theme + Lucide icon registry next to main.\n'
    '    _ = staged.addCopyFile(dep.path("src/app_runner/uber.zig"), "uber.zig");\n'
    '    _ = staged.addCopyFile(dep.path("src/app_runner/lucide_icons.zig"), "lucide_icons.zig");\n'
    '    const main_root = staged.addCopyFile(dep.path("src/app_runner/ts_core_main.zig"), "main.zig");\n'
    '    return .{ .main_root = main_root, .archive = archive };\n'
)

# Prefer replacing the current Wall-E patch (uber+lucide, no components).
marker_lucide = (
    '    _ = staged.addCopyFile(b.path(appPath(b, app_root, "src/app.native")), "app.native");\n'
    '    // Wall-E: stage Uber theme + Lucide icon registry next to main.\n'
    '    _ = staged.addCopyFile(dep.path("src/app_runner/uber.zig"), "uber.zig");\n'
    '    _ = staged.addCopyFile(dep.path("src/app_runner/lucide_icons.zig"), "lucide_icons.zig");\n'
    '    const main_root = staged.addCopyFile(dep.path("src/app_runner/ts_core_main.zig"), "main.zig");\n'
    '    return .{ .main_root = main_root, .archive = archive };\n'
)
marker_uber = (
    '    _ = staged.addCopyFile(b.path(appPath(b, app_root, "src/app.native")), "app.native");\n'
    '    // Wall-E: stage Uber theme next to main so the custom launcher can @import it.\n'
    '    _ = staged.addCopyFile(dep.path("src/app_runner/uber.zig"), "uber.zig");\n'
    '    const main_root = staged.addCopyFile(dep.path("src/app_runner/ts_core_main.zig"), "main.zig");\n'
    '    return .{ .main_root = main_root, .archive = archive };\n'
)
marker_old = (
    '    _ = staged.addCopyFile(b.path(appPath(b, app_root, "src/app.native")), "app.native");\n'
    '    const main_root = staged.addCopyFile(dep.path("src/app_runner/ts_core_main.zig"), "main.zig");\n'
    '    return .{ .main_root = main_root, .archive = archive };\n'
)

if marker_lucide in text:
    p.write_text(text.replace(marker_lucide, replacement, 1))
    print("patched build/app.zig to also stage markup components")
elif marker_uber in text:
    p.write_text(text.replace(marker_uber, replacement, 1))
    print("patched build/app.zig to stage uber + lucide + markup components")
elif marker_old in text:
    p.write_text(text.replace(marker_old, replacement, 1))
    print("patched build/app.zig to stage uber + lucide + markup components")
else:
    raise SystemExit("prepare-sdk-overlay: could not patch build/app.zig (SDK layout changed?)")
PY
}

# Fast path: overlay already linked to this SDK — only refresh owned files.
if [[ -L "$DEST/package.json" ]] && [[ "$(readlink "$DEST/package.json")" == "$REAL/package.json" ]]; then
  copy_owned_sources
  # Re-copy stock app.zig then re-apply patch when lucide or markup
  # component staging is missing.
  if ! grep -q 'lucide_icons.zig' "$DEST/build/app.zig" 2>/dev/null \
    || ! grep -q 'components/titlebar.native' "$DEST/build/app.zig" 2>/dev/null \
    || ! grep -q 'components/palette-pane.native' "$DEST/build/app.zig" 2>/dev/null; then
    cp "$REAL/build/app.zig" "$DEST/build/app.zig"
    patch_stage
  fi
  echo "SDK overlay refreshed (launcher + theme + lucide + markup) → $DEST"
  exit 0
fi

rm -rf "$DEST"
mkdir -p "$DEST"

for item in "$REAL"/*; do
  name="$(basename "$item")"
  case "$name" in
    src|build) continue ;;
  esac
  ln -s "$item" "$DEST/$name"
done

mkdir -p "$DEST/src"
for item in "$REAL/src"/*; do
  name="$(basename "$item")"
  if [[ "$name" == "app_runner" ]]; then continue; fi
  ln -s "$item" "$DEST/src/$name"
done

mkdir -p "$DEST/src/app_runner"
for item in "$REAL/src/app_runner"/*; do
  name="$(basename "$item")"
  case "$name" in
    ts_core_main.zig|uber.zig|lucide_icons.zig) continue ;;
  esac
  ln -s "$item" "$DEST/src/app_runner/$name"
done

copy_owned_sources

mkdir -p "$DEST/build"
for item in "$REAL/build"/*; do
  name="$(basename "$item")"
  if [[ "$name" == "app.zig" ]]; then continue; fi
  ln -s "$item" "$DEST/build/$name"
done
cp "$REAL/build/app.zig" "$DEST/build/app.zig"
patch_stage

echo "SDK overlay ready → $DEST (from $REAL)"
