/**
 * Blacksmith Studio — Design Tokens
 *
 * Single source of truth for spacing, radii, and sizing.
 * Import and use these instead of magic numbers.
 *
 * Usage:
 *   import { spacing, radii, sizes } from '@/components/shared/ui/tokens'
 *   padding: spacing.md       // '16px'
 *   borderRadius: radii.md    // '8px'
 *   gap: spacing.sm           // '8px'
 */

/** Spacing scale — named sizes */
export const spacing = {
  none: '0',
  '2xs': '2px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
  '6xl': '64px',
} as const

/** Border radius scale */
export const radii = {
  none: '0',
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  '2xl': '14px',
  '3xl': '16px',
  full: '9999px',
} as const

/** Common component sizes */
export const sizes = {
  /** Icon button / avatar sizes */
  icon: {
    xs: '20px',
    sm: '28px',
    md: '34px',
    lg: '48px',
  },
  /** Input / button heights */
  control: {
    sm: '28px',
    md: '34px',
    lg: '40px',
  },
  /** Sidebar widths */
  sidebar: {
    collapsed: '56px',
    expanded: '210px',
  },
  /** Panel widths */
  panel: {
    sm: '280px',
    md: '360px',
    lg: '560px',
  },
  /** Content max-widths */
  content: {
    narrow: '480px',
    default: '620px',
    wide: '720px',
  },
} as const

/** Shadow elevations */
export const shadows = {
  sm: 'var(--studio-shadow)',
  lg: 'var(--studio-shadow-lg)',
  focus: 'var(--studio-ring-focus)',
} as const

export type Spacing = keyof typeof spacing
export type Radii = keyof typeof radii
