//! Wall-E owned build (from `native eject`).
//!
//! Before `addApp`, refresh `.native/sdk-overlay` so the TypeScript-core
//! launcher stages the Uber DesignTokens theme (`tokens_fn`).

const std = @import("std");
const native_sdk = @import("native_sdk");

pub fn build(b: *std.Build) void {
    prepareSdkOverlay(b);
    native_sdk.addApp(b, b.dependency("native_sdk", .{}), .{ .name = "wall-e" });
}

/// Rebuild the project-local SDK overlay that carries Uber's launcher.
/// Cheap: mostly symlinks; only a few files are copied from `src/theme/`.
fn prepareSdkOverlay(b: *std.Build) void {
    const root = b.build_root.path orelse ".";
    const script = b.fmt("{s}/scripts/prepare-sdk-overlay.sh", .{root});
    const result = std.process.run(b.allocator, b.graph.io, .{
        .argv = &.{ "bash", script },
        .stdout_limit = .limited(64 * 1024),
        .stderr_limit = .limited(64 * 1024),
    }) catch |err| {
        std.debug.panic("failed to run scripts/prepare-sdk-overlay.sh: {s}", .{@errorName(err)});
    };
    defer {
        b.allocator.free(result.stdout);
        b.allocator.free(result.stderr);
    }
    if (result.stderr.len > 0) std.debug.print("{s}", .{result.stderr});
    if (result.stdout.len > 0) std.debug.print("{s}", .{result.stdout});
    if (result.term != .exited or result.term.exited != 0) {
        std.debug.panic("scripts/prepare-sdk-overlay.sh failed", .{});
    }
}
