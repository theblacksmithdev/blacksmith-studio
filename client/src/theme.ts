import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

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
    ':root': {
      /* ── Light mode ── */

      /* Backgrounds — pure white base, cool-tinted surfaces */
      '--studio-bg-main': '#ffffff',
      '--studio-bg-sidebar': '#f5f5f5',
      '--studio-bg-surface': '#eeeeee',
      '--studio-bg-hover': '#e0e0e0',
      '--studio-bg-hover-strong': '#d6d6d6',
      '--studio-bg-inset': '#f8f8f8',

      /* Borders — calm and subtle */
      '--studio-border': 'rgba(0,0,0,0.08)',
      '--studio-border-hover': 'rgba(0,0,0,0.16)',

      /* Text — high contrast, sharp hierarchy */
      '--studio-text-primary': '#1a1a1a',
      '--studio-text-secondary': '#424242',
      '--studio-text-tertiary': '#616161',
      '--studio-text-muted': '#9e9e9e',

      /* Accent */
      '--studio-accent': '#1a1a1a',
      '--studio-accent-fg': '#ffffff',

      /* Brand */
      '--studio-green': '#10a37f',
      '--studio-green-subtle': 'rgba(16,163,127,0.1)',
      '--studio-green-border': 'rgba(16,163,127,0.25)',

      /* Semantic */
      '--studio-error': '#d32f2f',
      '--studio-error-subtle': 'rgba(211,47,47,0.08)',
      '--studio-warning': '#f57c00',
      '--studio-link': '#1565c0',

      /* Semantic accents for tool/thinking indicators */
      '--studio-purple-subtle': 'rgba(139,92,246,0.06)',
      '--studio-blue-subtle': 'rgba(59,130,246,0.06)',

      /* Code */
      '--studio-code-bg': '#f5f5f5',
      '--studio-code-border': 'rgba(0,0,0,0.12)',

      /* Utilities */
      '--studio-scrollbar': 'rgba(0,0,0,0.2)',
      '--studio-scrollbar-hover': 'rgba(0,0,0,0.35)',
      '--studio-selection': 'rgba(26,26,26,0.12)',

      /* Shadows — layered, directional */
      '--studio-shadow': '0 1px 3px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)',
      '--studio-shadow-lg': '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',

      /* Glass surfaces */
      '--studio-backdrop': 'rgba(0,0,0,0.45)',
      '--studio-glass': 'rgba(255,255,255,0.72)',
      '--studio-glass-border': 'rgba(255,255,255,0.4)',

      /* Focus */
      '--studio-ring-focus': '0 0 0 3px rgba(0,0,0,0.08)',
    },

    '.dark': {
      /* ── Dark mode — deep blacks, glassy elevated surfaces ── */

      /* Backgrounds */
      '--studio-bg-main': '#121212',
      '--studio-bg-sidebar': '#0a0a0a',
      '--studio-bg-surface': '#1e1e1e',
      '--studio-bg-hover': '#2c2c2c',
      '--studio-bg-hover-strong': '#383838',
      '--studio-bg-inset': '#0d0d0d',

      /* Borders — calm and subtle */
      '--studio-border': 'rgba(255,255,255,0.08)',
      '--studio-border-hover': 'rgba(255,255,255,0.16)',

      /* Text — bright and sharp */
      '--studio-text-primary': '#f5f5f5',
      '--studio-text-secondary': '#bdbdbd',
      '--studio-text-tertiary': '#8a8a8a',
      '--studio-text-muted': '#666666',

      /* Accent */
      '--studio-accent': '#f5f5f5',
      '--studio-accent-fg': '#121212',

      /* Brand */
      '--studio-green': '#2dd4a8',
      '--studio-green-subtle': 'rgba(45,212,168,0.12)',
      '--studio-green-border': 'rgba(45,212,168,0.3)',

      /* Semantic */
      '--studio-error': '#ef5350',
      '--studio-error-subtle': 'rgba(239,83,80,0.1)',
      '--studio-warning': '#ffa726',
      '--studio-link': '#64b5f6',

      /* Semantic accents */
      '--studio-purple-subtle': 'rgba(139,92,246,0.1)',
      '--studio-blue-subtle': 'rgba(59,130,246,0.1)',

      /* Code */
      '--studio-code-bg': '#0d0d0d',
      '--studio-code-border': '#333333',

      /* Utilities */
      '--studio-scrollbar': 'rgba(255,255,255,0.18)',
      '--studio-scrollbar-hover': 'rgba(255,255,255,0.32)',
      '--studio-selection': 'rgba(138,180,248,0.2)',

      /* Shadows */
      '--studio-shadow': '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.25)',
      '--studio-shadow-lg': '0 8px 30px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',

      /* Glass surfaces */
      '--studio-backdrop': 'rgba(0,0,0,0.6)',
      '--studio-glass': 'rgba(30,30,30,0.78)',
      '--studio-glass-border': 'rgba(255,255,255,0.08)',

      /* Focus */
      '--studio-ring-focus': '0 0 0 3px rgba(255,255,255,0.06)',
    },

    body: {
      bg: 'var(--studio-bg-main)',
      color: 'var(--studio-text-primary)',
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: '14px',
      lineHeight: '1.5',
      letterSpacing: '-0.003em',
      fontWeight: 400,
    },
    '*': {
      borderColor: 'var(--studio-border)',
    },
    'h1, h2, h3, h4, h5, h6': {
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    'b, strong': {
      fontWeight: 600,
    },
    'button, input, textarea, select': {
      fontFamily: 'inherit',
      letterSpacing: 'inherit',
    },
    '*::-webkit-scrollbar': { width: '7px', height: '7px' },
    '*::-webkit-scrollbar-track': { background: 'transparent' },
    '*::-webkit-scrollbar-thumb': { background: 'var(--studio-scrollbar)', borderRadius: '4px' },
    '*::-webkit-scrollbar-thumb:hover': { background: 'var(--studio-scrollbar-hover)' },
    '::selection': { background: 'var(--studio-selection)', color: 'var(--studio-text-primary)' },

    '@keyframes pickerFadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
    '@keyframes pickerSlideUp': {
      from: { opacity: 0, transform: 'translate(-50%, -47%)' },
      to: { opacity: 1, transform: 'translate(-50%, -50%)' },
    },
    '@keyframes shimmer': { '0%,100%': { opacity: 0.3 }, '50%': { opacity: 0.6 } },
    '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
    '@keyframes dotPulse': { '0%,100%': { opacity: 0.3, transform: 'scale(0.8)' }, '50%': { opacity: 1, transform: 'scale(1)' } },
    '@keyframes cursorBlink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
    '@keyframes shimmerBar': { '0%': { opacity: 0.3, transform: 'scaleX(0.5)' }, '50%': { opacity: 0.6, transform: 'scaleX(1)' }, '100%': { opacity: 0.3, transform: 'scaleX(0.5)' } },
    '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
    '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
  },
})

export const system = createSystem(defaultConfig, config)
