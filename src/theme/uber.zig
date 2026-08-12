//! Uber theme — Native SDK `DesignTokens`.
//!
//! Monochrome greys + semantic status hues, 4px radius. Wired by
//! `src/theme/ts_core_main.zig` (`tokens_fn`) through the SDK overlay
//! launcher (see `scripts/prepare-sdk-overlay.sh`).
//!
//! Role mapping (token surface):
//!   page              → colors.background
//!   card              → colors.surface
//!   hover / pressed   → colors.surface_subtle / surface_pressed
//!   ink / muted       → colors.text / text_muted
//!   hairline          → colors.border
//!   primary fill      → colors.accent / accent_text
//!   status            → destructive / success / warning (+ _text)
//!   focus             → colors.focus_ring
//!   radius            → 4 (all rungs)

const native_sdk = @import("native_sdk");
const canvas = native_sdk.canvas;

const Color = canvas.Color;
const ColorScheme = canvas.ColorScheme;
const ColorContrast = canvas.ColorContrast;
const DesignTokens = canvas.DesignTokens;
const ColorTokenOverrides = canvas.ColorTokenOverrides;

/// Uber register for one scheme/contrast pair.
/// Geist supplies control tables / metrics; Uber overrides colors + radius.
pub fn designTokens(color_scheme: ColorScheme, contrast: ColorContrast) DesignTokens {
    return DesignTokens.theme(.{
        .pack = .geist,
        .color_scheme = color_scheme,
        .contrast = contrast,
    }).withOverrides(.{
        .colors = colorOverrides(color_scheme, contrast),
        // radius 0.25rem ≈ 4px
        .radius = .{ .sm = 4, .md = 4, .lg = 4, .xl = 4 },
    });
}

fn colorOverrides(color_scheme: ColorScheme, contrast: ColorContrast) ColorTokenOverrides {
    return switch (color_scheme) {
        .light => switch (contrast) {
            .standard => light(),
            .high => highContrastLight(),
        },
        .dark => switch (contrast) {
            .standard => dark(),
            .high => highContrastDark(),
        },
    };
}

/// Light palette.
fn light() ColorTokenOverrides {
    return .{
        // background oklch(97.02% 0 0)
        .background = Color.rgb8(245, 245, 245),
        // surface oklch(100% 0 0)
        .surface = Color.rgb8(255, 255, 255),
        // surface secondary oklch(95.24% 0 0)
        .surface_subtle = Color.rgb8(239, 239, 239),
        // pressed / default
        .surface_pressed = Color.rgb8(234, 234, 234),
        // text oklch(21.03% 0 0)
        .text = Color.rgb8(24, 24, 24),
        // muted oklch(55.17% 0 0)
        .text_muted = Color.rgb8(114, 114, 114),
        .syntax_plain = Color.rgb8(24, 24, 24),
        .syntax_comment = Color.rgb8(114, 114, 114),
        .syntax_keyword = Color.rgb8(189, 40, 100),
        .syntax_literal = Color.rgb8(41, 122, 58),
        .syntax_function = Color.rgb8(120, 32, 188),
        .syntax_property = Color.rgb8(203, 42, 47),
        .syntax_constant = Color.rgb8(0, 104, 214),
        // border oklch(90% 0 0)
        .border = Color.rgb8(222, 222, 222),
        // accent black / near-white knockout
        .accent = Color.rgb8(0, 0, 0),
        .accent_text = Color.rgb8(252, 252, 252),
        // danger oklch(0.573 0.2249 21.97)
        .destructive = Color.rgb8(222, 17, 53),
        .destructive_text = Color.rgb8(255, 244, 242),
        // success oklch(0.6277 0.1604 153.06)
        .success = Color.rgb8(5, 163, 87),
        .success_text = Color.rgb8(241, 252, 243),
        // warning oklch(0.8446 0.1525 80.6)
        .warning = Color.rgb8(255, 192, 67),
        .warning_text = Color.rgb8(21, 8, 0),
        // Uber focus is monochrome (not Geist blue).
        .focus_ring = Color.rgb8(0, 0, 0),
        .info = Color.rgb8(55, 55, 55),
        .info_text = Color.rgb8(252, 252, 252),
        .shadow = Color.rgba8(0, 0, 0, 20),
        .scrim = Color.rgba8(0, 0, 0, 26),
        .disabled = Color.rgb8(235, 235, 235),
    };
}

/// Dark palette.
fn dark() ColorTokenOverrides {
    return .{
        // background oklch(12% 0 0)
        .background = Color.rgb8(6, 6, 6),
        // surface oklch(21.03% 0 0)
        .surface = Color.rgb8(24, 24, 24),
        // surface secondary oklch(25.70% 0 0)
        .surface_subtle = Color.rgb8(35, 35, 35),
        // pressed
        .surface_pressed = Color.rgb8(39, 39, 39),
        // text oklch(99.11% 0 0)
        .text = Color.rgb8(252, 252, 252),
        // muted oklch(70.50% 0 0)
        .text_muted = Color.rgb8(160, 160, 160),
        .syntax_plain = Color.rgb8(252, 252, 252),
        .syntax_comment = Color.rgb8(160, 160, 160),
        .syntax_keyword = Color.rgb8(247, 95, 143),
        .syntax_literal = Color.rgb8(98, 192, 115),
        .syntax_function = Color.rgb8(191, 122, 240),
        .syntax_property = Color.rgb8(255, 97, 102),
        .syntax_constant = Color.rgb8(82, 168, 255),
        // border oklch(28% 0 0)
        .border = Color.rgb8(41, 41, 41),
        // accent porcelain / near-black knockout
        .accent = Color.rgb8(250, 250, 250),
        .accent_text = Color.rgb8(11, 11, 11),
        // danger oklch(0.7044 0.1872 23.19)
        .destructive = Color.rgb8(255, 102, 102),
        .destructive_text = Color.rgb8(28, 2, 3),
        // success oklch(0.6514 0.1321 156.22)
        .success = Color.rgb8(58, 167, 109),
        .success_text = Color.rgb8(0, 16, 5),
        // warning oklch(0.8803 0.1348 86.06)
        .warning = Color.rgb8(255, 209, 102),
        .warning_text = Color.rgb8(19, 9, 0),
        // focus oklch(0.9848 0 0)
        .focus_ring = Color.rgb8(250, 250, 250),
        .info = Color.rgb8(200, 200, 200),
        .info_text = Color.rgb8(11, 11, 11),
        .shadow = Color.rgba8(0, 0, 0, 48),
        .scrim = Color.rgba8(0, 0, 0, 40),
        .disabled = Color.rgb8(39, 39, 39),
    };
}

fn highContrastLight() ColorTokenOverrides {
    var base = light();
    base.text = Color.rgb8(0, 0, 0);
    base.text_muted = Color.rgb8(24, 24, 24);
    base.border = Color.rgb8(0, 0, 0);
    base.focus_ring = Color.rgb8(0, 0, 0);
    base.disabled = Color.rgb8(201, 201, 201);
    base.scrim = Color.rgba8(0, 0, 0, 160);
    return base;
}

fn highContrastDark() ColorTokenOverrides {
    var base = dark();
    base.text = Color.rgb8(255, 255, 255);
    base.text_muted = Color.rgb8(237, 237, 237);
    base.border = Color.rgb8(255, 255, 255);
    base.accent = Color.rgb8(255, 255, 255);
    base.focus_ring = Color.rgb8(255, 255, 255);
    base.disabled = Color.rgb8(69, 69, 69);
    base.scrim = Color.rgba8(0, 0, 0, 200);
    return base;
}
