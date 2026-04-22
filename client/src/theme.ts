import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

/**
 * Blacksmith Studio — Sharp, high-contrast theme with glassy surfaces.
 *
 * Design language: Material Design 3 + glassmorphism.
 * Solid hex borders, clear surface hierarchy, translucent overlays.
 *
 * All colors referenced as var(--studio-*) across components.
 * Toggle by adding/removing `class="dark"` on <html>.
 */

const config = defineConfig({
  globalCss: {
    ":root": {
      /* ── Light mode ── */

      /* Backgrounds — cool-slate tinted so the brand green reads warm */
      "--studio-bg-main": "#ffffff",
      "--studio-bg-sidebar": "#f4f5f7",
      "--studio-bg-surface": "#edeef1",
      "--studio-bg-hover": "#e2e4e9",
      "--studio-bg-hover-strong": "#d4d7de",
      "--studio-bg-inset": "#f8f9fb",

      /* Borders — slightly cool so selection accents stand out */
      "--studio-border": "rgba(17,24,39,0.08)",
      "--studio-border-hover": "rgba(17,24,39,0.16)",

      /* Text — high contrast, sharp hierarchy */
      "--studio-text-primary": "#1a1a1a",
      "--studio-text-secondary": "#424242",
      "--studio-text-tertiary": "#616161",
      "--studio-text-muted": "#9e9e9e",

      /* Accent — inverted neutral; use sparingly for destructive/primary */
      "--studio-accent": "#1a1a1a",
      "--studio-accent-fg": "#ffffff",

      /* Brand — the single chromatic accent across the app.
         Solid: "something is live / running".
         Subtle / border: selection, focus, live-surface tint. */
      "--studio-brand": "#10a37f",
      "--studio-brand-subtle": "rgba(16,163,127,0.1)",
      "--studio-brand-border": "rgba(16,163,127,0.35)",
      /* Legacy aliases — existing callers keep working. */
      "--studio-green": "#10a37f",
      "--studio-green-subtle": "rgba(16,163,127,0.1)",
      "--studio-green-border": "rgba(16,163,127,0.25)",

      /* Semantic */
      "--studio-error": "#d32f2f",
      "--studio-error-subtle": "rgba(211,47,47,0.08)",
      "--studio-warning": "#f57c00",
      "--studio-link": "#1565c0",

      /* Semantic accents for tool/thinking indicators */
      "--studio-purple-subtle": "rgba(139,92,246,0.06)",
      "--studio-blue-subtle": "rgba(59,130,246,0.06)",

      /* Code */
      "--studio-code-bg": "#f5f5f5",
      "--studio-code-border": "rgba(0,0,0,0.12)",

      /* Utilities */
      "--studio-scrollbar": "rgba(0,0,0,0.2)",
      "--studio-scrollbar-hover": "rgba(0,0,0,0.35)",
      "--studio-selection": "rgba(26,26,26,0.12)",

      /* Shadows — layered, directional */
      "--studio-shadow":
        "0 1px 3px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)",
      "--studio-shadow-lg":
        "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",

      /* Glass surfaces */
      "--studio-backdrop": "rgba(0,0,0,0.45)",
      "--studio-glass": "rgba(255,255,255,0.72)",
      "--studio-glass-border": "rgba(255,255,255,0.4)",

      /* Focus — brand-tinted ring, soft and functional */
      "--studio-ring-focus": "0 0 0 3px rgba(16,163,127,0.22)",
    },

    ".dark": {
      /* ── Dark mode — warm slate blacks, flat elevated surfaces ── */

      /* Backgrounds — shifted ~2° cool-slate so the brand green reads warm */
      "--studio-bg-main": "#0f1013",
      "--studio-bg-sidebar": "#0a0b0e",
      "--studio-bg-surface": "#181a1f",
      "--studio-bg-hover": "#21242a",
      "--studio-bg-hover-strong": "#2c3038",
      "--studio-bg-inset": "#0b0c0f",

      /* Borders — slightly cool so selection accents stand out */
      "--studio-border": "rgba(230,232,240,0.08)",
      "--studio-border-hover": "rgba(230,232,240,0.18)",

      /* Text — bright and sharp */
      "--studio-text-primary": "#f5f5f5",
      "--studio-text-secondary": "#bdbdbd",
      "--studio-text-tertiary": "#8a8a8a",
      "--studio-text-muted": "#666666",

      /* Accent — inverted neutral, sparingly used */
      "--studio-accent": "#f5f5f5",
      "--studio-accent-fg": "#0f1013",

      /* Brand — the single chromatic accent across the app.
         Solid: "something is live / running".
         Subtle / border: selection, focus, live-surface tint. */
      "--studio-brand": "#2dd4a8",
      "--studio-brand-subtle": "rgba(45,212,168,0.12)",
      "--studio-brand-border": "rgba(45,212,168,0.38)",
      /* Legacy aliases — existing callers keep working. */
      "--studio-green": "#2dd4a8",
      "--studio-green-subtle": "rgba(45,212,168,0.12)",
      "--studio-green-border": "rgba(45,212,168,0.3)",

      /* Semantic */
      "--studio-error": "#ef5350",
      "--studio-error-subtle": "rgba(239,83,80,0.1)",
      "--studio-warning": "#ffa726",
      "--studio-link": "#64b5f6",

      /* Semantic accents */
      "--studio-purple-subtle": "rgba(139,92,246,0.1)",
      "--studio-blue-subtle": "rgba(59,130,246,0.1)",

      /* Code */
      "--studio-code-bg": "#0d0d0d",
      "--studio-code-border": "#333333",

      /* Utilities */
      "--studio-scrollbar": "rgba(255,255,255,0.18)",
      "--studio-scrollbar-hover": "rgba(255,255,255,0.32)",
      "--studio-selection": "rgba(138,180,248,0.2)",

      /* Shadows */
      "--studio-shadow":
        "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.25)",
      "--studio-shadow-lg":
        "0 8px 30px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",

      /* Glass surfaces */
      "--studio-backdrop": "rgba(0,0,0,0.6)",
      "--studio-glass": "rgba(30,30,30,0.78)",
      "--studio-glass-border": "rgba(255,255,255,0.08)",

      /* Focus — brand-tinted ring, soft and functional */
      "--studio-ring-focus": "0 0 0 3px rgba(45,212,168,0.22)",
    },

    body: {
      bg: "var(--studio-bg-main)",
      color: "var(--studio-text-primary)",
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: "14px",
      lineHeight: "1.5",
      letterSpacing: "-0.003em",
      fontWeight: 400,
    },
    "*": {
      borderColor: "var(--studio-border)",
    },
    "h1, h2, h3, h4, h5, h6": {
      fontWeight: 600,
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
    },
    "b, strong": {
      fontWeight: 600,
    },
    "button, input, textarea, select": {
      fontFamily: "inherit",
      letterSpacing: "inherit",
    },
    "*::-webkit-scrollbar": { width: "7px", height: "7px" },
    "*::-webkit-scrollbar-track": { background: "transparent" },
    "*::-webkit-scrollbar-thumb": {
      background: "var(--studio-scrollbar)",
      borderRadius: "4px",
    },
    "*::-webkit-scrollbar-thumb:hover": {
      background: "var(--studio-scrollbar-hover)",
    },
    "::selection": {
      background: "var(--studio-selection)",
      color: "var(--studio-text-primary)",
    },

    "@keyframes pickerFadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
    "@keyframes pickerSlideUp": {
      from: { opacity: 0, transform: "translate(-50%, -47%)" },
      to: { opacity: 1, transform: "translate(-50%, -50%)" },
    },
    "@keyframes shimmer": {
      "0%,100%": { opacity: 0.3 },
      "50%": { opacity: 0.6 },
    },
    "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
    "@keyframes dotPulse": {
      "0%,100%": { opacity: 0.3, transform: "scale(0.8)" },
      "50%": { opacity: 1, transform: "scale(1)" },
    },
    "@keyframes cursorBlink": {
      "0%,100%": { opacity: 1 },
      "50%": { opacity: 0 },
    },
    "@keyframes shimmerBar": {
      "0%": { opacity: 0.3, transform: "scaleX(0.5)" },
      "50%": { opacity: 0.6, transform: "scaleX(1)" },
      "100%": { opacity: 0.3, transform: "scaleX(0.5)" },
    },
    "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.4 } },
    "@keyframes spin": {
      from: { transform: "rotate(0deg)" },
      to: { transform: "rotate(360deg)" },
    },
  },
});

export const system = createSystem(defaultConfig, config);
