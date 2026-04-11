import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

/**
 * Blacksmith Studio — Light & Dark theme via CSS custom properties.
 *
 * All colors are referenced as var(--studio-*) across components.
 * Toggle by adding/removing `class="dark"` on <html>.
 */

const config = defineConfig({
  globalCss: {
    ':root': {
      /* ── Light mode (default) ── */
      '--studio-bg-main': '#ffffff',
      '--studio-bg-sidebar': '#f7f7f7',
      '--studio-bg-surface': '#f2f2f2',
      '--studio-bg-hover': '#eaeaea',
      '--studio-bg-hover-strong': '#e0e0e0',
      '--studio-bg-inset': '#fafafa',

      '--studio-border': 'rgba(0,0,0,0.12)',
      '--studio-border-hover': 'rgba(0,0,0,0.22)',

      '--studio-text-primary': '#0a0a0a',
      '--studio-text-secondary': '#525252',
      '--studio-text-tertiary': '#7a7a7a',
      '--studio-text-muted': '#a0a0a0',

      '--studio-accent': '#0a0a0a',
      '--studio-accent-fg': '#ffffff',
      '--studio-green': '#10a37f',
      '--studio-green-subtle': 'rgba(16,163,127,0.1)',

      '--studio-error': '#ef4444',
      '--studio-warning': '#f59e0b',
      '--studio-link': '#2563eb',

      '--studio-code-bg': '#f7f7f7',
      '--studio-code-border': 'rgba(0,0,0,0.06)',

      '--studio-scrollbar': 'rgba(0,0,0,0.1)',
      '--studio-scrollbar-hover': 'rgba(0,0,0,0.18)',
      '--studio-selection': 'rgba(0,0,0,0.1)',

      '--studio-shadow': '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
    },

    '.dark': {
      /* ── Dark mode ── */
      '--studio-bg-main': '#1a1a1a',
      '--studio-bg-sidebar': '#141414',
      '--studio-bg-surface': '#262626',
      '--studio-bg-hover': '#333333',
      '--studio-bg-hover-strong': '#3d3d3d',
      '--studio-bg-inset': '#111111',

      '--studio-border': 'rgba(255,255,255,0.1)',
      '--studio-border-hover': 'rgba(255,255,255,0.2)',

      '--studio-text-primary': '#f0f0f0',
      '--studio-text-secondary': '#a8a8a8',
      '--studio-text-tertiary': '#787878',
      '--studio-text-muted': '#555555',

      '--studio-accent': '#f0f0f0',
      '--studio-accent-fg': '#1a1a1a',
      '--studio-green': '#10a37f',
      '--studio-green-subtle': 'rgba(16,163,127,0.15)',

      '--studio-error': '#ef4444',
      '--studio-warning': '#f59e0b',
      '--studio-link': '#7ab8f5',

      '--studio-code-bg': '#141414',
      '--studio-code-border': 'rgba(255,255,255,0.06)',

      '--studio-scrollbar': 'rgba(255,255,255,0.1)',
      '--studio-scrollbar-hover': 'rgba(255,255,255,0.2)',
      '--studio-selection': 'rgba(255,255,255,0.15)',

      '--studio-shadow': '0 1px 3px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15)',
    },

    body: {
      bg: 'var(--studio-bg-main)',
      color: 'var(--studio-text-primary)',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      fontSize: '13px',
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
    '*::-webkit-scrollbar': { width: '6px', height: '6px' },
    '*::-webkit-scrollbar-track': { background: 'transparent' },
    '*::-webkit-scrollbar-thumb': { background: 'var(--studio-scrollbar)', borderRadius: '3px' },
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
