//! Wall-E TypeScript-core launcher — Uber theme + Lucide icons.
//!
//! Staged by the framework as `main.zig` next to the compiled core mirror.
//! Source of truth lives in the app tree; `scripts/prepare-sdk-overlay.sh`
//! installs this file (and companions) into `.native/sdk-overlay`.
//!
//! - Uber theme: `uber.zig` via `tokens_fn` (Auto / Light / Dark)
//! - Lucide icons: `lucide_icons.zig` via `registerAppIcons` + markup `app:<name>`
//!   (@see https://lucide.dev/guide/static/)

const std = @import("std");
const runner = @import("runner");
const native_sdk = @import("native_sdk");
const manifest = @import("app_manifest_zon");
const uber = @import("uber.zig");
const lucide = @import("lucide_icons.zig");
pub const core = @import("core.zig");

pub const panic = std.debug.FullPanic(native_sdk.debug.capturePanic);

/// Re-exported so the model-contract step (and any test) reflects the
/// core's real surface: `native check` verifies app.native against it.
pub const Model = core.Model;
pub const Msg = core.Msg;

/// Lucide table for `native check` (`app:<name>` validation) and boot registration.
pub const app_icons = lucide.app_icons;

const Adapter = native_sdk.TsUiApp(core);
const App = Adapter.App;
const canvas = native_sdk.canvas;

const shell_scene = native_sdk.app_manifest.shellConfigFrom(manifest);
const canvas_label = native_sdk.app_manifest.firstGpuSurfaceLabel(shell_scene);
pub const app_markup = @embedFile("app.native");

/// Embedded `<import>` closure for the first-frame resolve.
/// Paths are relative to the markup root (`src/` via watch_path dirname):
/// `reloadMarkup` resolves with root_name "" against this set; disk hot
/// reload uses watch_path and reads the same files from cwd.
/// Staged beside main.zig by `scripts/prepare-sdk-overlay.sh`.
const app_markup_sources = [_]canvas.ui_markup.SourceFile{
    .{ .path = "components/titlebar.native", .source = @embedFile("components/titlebar.native") },
    .{ .path = "components/session-card.native", .source = @embedFile("components/session-card.native") },
    .{ .path = "components/session-sidebar.native", .source = @embedFile("components/session-sidebar.native") },
    .{ .path = "components/message-user.native", .source = @embedFile("components/message-user.native") },
    .{ .path = "components/message-assistant.native", .source = @embedFile("components/message-assistant.native") },
    .{ .path = "components/compose-bar.native", .source = @embedFile("components/compose-bar.native") },
    .{ .path = "components/conversation-pane.native", .source = @embedFile("components/conversation-pane.native") },
    .{ .path = "components/review-pane.native", .source = @embedFile("components/review-pane.native") },
};

const app_permissions = manifestStringList(manifest, "permissions");
const allowed_origins = manifestAllowedOrigins();
const app_data_dir_env = "NATIVE_SDK_APP_DATA_DIR";

pub fn main(init: std.process.Init) !void {
    // Lucide static icons (stroke dialect) — must register before first draw.
    lucide.register();

    var options: Adapter.Options = .{
        .name = manifest.name,
        .scene = shell_scene,
        .canvas_label = canvas_label,
        .markup = .{
            .source = app_markup,
            .sources = &app_markup_sources,
            .watch_path = "src/app.native",
            .io = init.io,
        },
        // Full model-owned Uber palette. When tokens_fn is set the stock
        // pack / theme_accent path is skipped — scheme comes from the core.
        .tokens_fn = uberTokens,
    };
    if (comptime @hasDecl(core, "commandMsg")) {
        options.on_command = core.commandMsg;
    }
    var cache_dir_buffer: [512]u8 = undefined;
    const audio_cache_dir = native_sdk.app_dirs.resolveOne(
        .{ .name = manifest.name },
        native_sdk.app_dirs.currentPlatform(),
        native_sdk.debug.envFromMap(init.environ_map),
        .cache,
        &cache_dir_buffer,
    ) catch "";
    var data_dir_buffer: [512]u8 = undefined;
    const app_data_dir = native_sdk.app_dirs.resolveOne(
        .{ .name = manifest.name },
        native_sdk.app_dirs.currentPlatform(),
        native_sdk.debug.envFromMap(init.environ_map),
        .data,
        &data_dir_buffer,
    ) catch "";
    const manifest_images = comptime manifestImages();
    var boot_images_buffer: [manifest_images.len]Adapter.BootImage = undefined;
    var boot_image_count: usize = 0;
    inline for (manifest_images) |asset| {
        if (runner.app_assets.readFileAlloc(init.io, asset.path, std.heap.page_allocator, .limited(max_boot_image_bytes))) |bytes| {
            boot_images_buffer[boot_image_count] = .{ .id = asset.id, .bytes = bytes };
            boot_image_count += 1;
        } else |_| {}
    }

    var env_values_buffer: [envMsgsLen()]Adapter.EnvValue = undefined;
    var env_value_count: usize = 0;
    if (comptime @hasDecl(core, "envMsgs")) {
        inline for (core.envMsgs) |entry| {
            if (std.mem.eql(u8, entry.env, app_data_dir_env)) {
                if (app_data_dir.len > 0) {
                    env_values_buffer[env_value_count] = .{ .msg = entry.msg, .value = app_data_dir };
                    env_value_count += 1;
                }
            } else if (init.environ_map.get(entry.env)) |value| {
                env_values_buffer[env_value_count] = .{ .msg = entry.msg, .value = value };
                env_value_count += 1;
            }
        }
    }

    const app_state = try Adapter.create(std.heap.page_allocator, .{
        .audio_cache_dir = audio_cache_dir,
        .image_cache_dir = audio_cache_dir,
        .boot_images = boot_images_buffer[0..boot_image_count],
        .env_values = env_values_buffer[0..env_value_count],
    }, options);
    defer app_state.destroy();

    try runner.runWithOptions(app_state.app(), .{
        .app_name = manifest.name,
        .window_title = comptime windowTitle(),
        .bundle_id = manifest.id,
        .icon_path = "assets/icon.png",
        .default_frame = comptime defaultFrame(),
        .restore_state = comptime startupRestoreState(),
        .js_window_api = false,
        .security = .{
            .permissions = app_permissions,
            .navigation = .{ .allowed_origins = allowed_origins },
        },
    }, init);
}

/// Model-owned Uber tokens. Prefer the core's effective `colorScheme`
/// (Auto tracks OS; Light/Dark force the palette) and accessibility flags.
fn uberTokens(model: *const Model) canvas.DesignTokens {
    const scheme: canvas.ColorScheme = switch (model.colorScheme) {
        .light => .light,
        .dark => .dark,
    };
    const contrast: canvas.ColorContrast = if (model.highContrast) .high else .standard;
    var tokens = uber.designTokens(scheme, contrast);
    if (model.reduceMotion) tokens.motion = canvas.MotionTokens.reduced();
    return tokens;
}

fn windowTitle() []const u8 {
    if (shell_scene.windows.len > 0) {
        if (shell_scene.windows[0].title) |title| return title;
    }
    if (@hasField(@TypeOf(manifest), "display_name")) return manifest.display_name;
    return manifest.name;
}

fn defaultFrame() native_sdk.geometry.RectF {
    if (shell_scene.windows.len > 0) {
        const window = shell_scene.windows[0];
        return native_sdk.geometry.RectF.init(window.x orelse 0, window.y orelse 0, window.width, window.height);
    }
    return native_sdk.geometry.RectF.init(0, 0, 720, 480);
}

fn startupRestoreState() bool {
    if (shell_scene.windows.len > 0) return shell_scene.windows[0].restore_state;
    return true;
}

const ImageAsset = struct {
    id: u64,
    path: []const u8,
};

const max_boot_image_bytes: usize = 4 * 1024 * 1024;

fn manifestImages() []const ImageAsset {
    comptime {
        if (!@hasField(@TypeOf(manifest), "assets")) return &.{};
        if (!@hasField(@TypeOf(manifest.assets), "images")) return &.{};
        var out: []const ImageAsset = &.{};
        for (manifest.assets.images) |entry| {
            out = out ++ &[_]ImageAsset{.{ .id = entry.id, .path = entry.path }};
        }
        return out;
    }
}

fn envMsgsLen() usize {
    comptime {
        if (!@hasDecl(core, "envMsgs")) return 0;
        return core.envMsgs.len;
    }
}

fn manifestStringList(comptime m: anytype, comptime field: []const u8) []const []const u8 {
    comptime {
        if (!@hasField(@TypeOf(m), field)) return &.{};
        var out: []const []const u8 = &.{};
        for (@field(m, field)) |entry| {
            const name: []const u8 = entry;
            out = out ++ &[_][]const u8{name};
        }
        return out;
    }
}

fn manifestAllowedOrigins() []const []const u8 {
    comptime {
        if (!@hasField(@TypeOf(manifest), "security")) return &.{};
        if (!@hasField(@TypeOf(manifest.security), "navigation")) return &.{};
        return manifestStringList(manifest.security.navigation, "allowed_origins");
    }
}
