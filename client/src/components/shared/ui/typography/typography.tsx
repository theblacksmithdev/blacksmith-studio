import { Text as ChakraText, type TextProps as ChakraTextProps } from '@chakra-ui/react'
import type { SystemStyleObject } from '@chakra-ui/react'

/**
 * Blacksmith Studio — Typography Design System
 *
 * Single `Text` component with a `variant` prop to select the typographic style.
 * Built on Chakra UI's Text for composition flexibility (as, css, etc.).
 *
 * Usage:
 *   <Text variant="heading">Page Title</Text>
 *   <Text variant="body" color="secondary">Description text</Text>
 *   <Text variant="caption" color="muted">2 min ago</Text>
 *   <Text variant="code">npm install</Text>
 *   <Text variant="sectionLabel">Activity</Text>
 */

export type TextVariant =
  | 'display'      // 32px/700 — Hero banners, splash screens
  | 'heading'      // 24px/600 — Page titles, section heroes
  | 'title'        // 17px/600 — Panel headers, dialog titles
  | 'subtitle'     // 15px/600 — Subheadings, secondary headers
  | 'body'         // 14px/400 — Primary body text (default)
  | 'bodySmall'    // 13px/400 — Secondary body, list items
  | 'label'        // 12px/500 — Form labels, nav items, buttons
  | 'caption'      // 11px/450 — Timestamps, badges, meta
  | 'tiny'         // 10px/600 — Section labels, pill badges (uppercase)
  | 'code'         // 13px/mono — Inline code, paths
  | 'codeBlock'    // 13px/mono — Block code with background
  | 'sectionLabel' // 10px/600 — Uppercase section divider with margin

export type TextColor = 'primary' | 'secondary' | 'tertiary' | 'muted' | 'error' | 'success' | 'inherit'

const colorMap: Record<TextColor, string> = {
  primary: 'var(--studio-text-primary)',
  secondary: 'var(--studio-text-secondary)',
  tertiary: 'var(--studio-text-tertiary)',
  muted: 'var(--studio-text-muted)',
  error: 'var(--studio-error)',
  success: 'var(--studio-green)',
  inherit: 'inherit',
}

const variantStyles: Record<TextVariant, { css: SystemStyleObject; defaultColor: TextColor; defaultAs: string }> = {
  display: {
    css: { fontSize: '32px', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15 },
    defaultColor: 'primary',
    defaultAs: 'h1',
  },
  heading: {
    css: { fontSize: '24px', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.2 },
    defaultColor: 'primary',
    defaultAs: 'h2',
  },
  title: {
    css: { fontSize: '17px', fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.3 },
    defaultColor: 'primary',
    defaultAs: 'h3',
  },
  subtitle: {
    css: { fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.35 },
    defaultColor: 'primary',
    defaultAs: 'h4',
  },
  body: {
    css: { fontSize: '14px', fontWeight: 400, letterSpacing: '-0.003em', lineHeight: 1.55 },
    defaultColor: 'primary',
    defaultAs: 'p',
  },
  bodySmall: {
    css: { fontSize: '13px', fontWeight: 400, letterSpacing: '-0.003em', lineHeight: 1.5 },
    defaultColor: 'primary',
    defaultAs: 'p',
  },
  label: {
    css: { fontSize: '12px', fontWeight: 500, letterSpacing: '-0.003em', lineHeight: 1.4 },
    defaultColor: 'secondary',
    defaultAs: 'span',
  },
  caption: {
    css: { fontSize: '11px', fontWeight: 450, letterSpacing: '0', lineHeight: 1.4 },
    defaultColor: 'tertiary',
    defaultAs: 'span',
  },
  tiny: {
    css: { fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', lineHeight: 1.4, textTransform: 'uppercase' },
    defaultColor: 'tertiary',
    defaultAs: 'span',
  },
  code: {
    css: {
      fontSize: '13px', fontWeight: 400, letterSpacing: '0', lineHeight: 1.4,
      fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, Consolas, monospace",
      padding: '1px 5px',
      background: 'var(--studio-bg-surface)',
      border: '1px solid var(--studio-border)',
      borderRadius: '4px',
    },
    defaultColor: 'primary',
    defaultAs: 'code',
  },
  codeBlock: {
    css: {
      fontSize: '13px', fontWeight: 400, letterSpacing: '0', lineHeight: 1.6,
      fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, Consolas, monospace",
      display: 'block',
      padding: '12px 14px',
      background: 'var(--studio-code-bg)',
      border: '1px solid var(--studio-code-border)',
      borderRadius: '8px',
      overflowX: 'auto',
      whiteSpace: 'pre',
    },
    defaultColor: 'primary',
    defaultAs: 'pre',
  },
  sectionLabel: {
    css: { fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', lineHeight: 1.4, textTransform: 'uppercase', marginBottom: '10px' },
    defaultColor: 'muted',
    defaultAs: 'div',
  },
}

interface TextProps extends Omit<ChakraTextProps, 'color' | 'variant'> {
  variant?: TextVariant
  color?: TextColor
  /** Render as a different HTML element */
  as?: any
  /** Truncate with ellipsis */
  truncate?: boolean
}

export function Text({
  variant = 'body',
  color,
  as,
  truncate,
  css: cssProp,
  children,
  ...rest
}: TextProps) {
  const config = variantStyles[variant]
  const resolvedColor = colorMap[color ?? config.defaultColor]

  const mergedCss: SystemStyleObject = {
    ...config.css,
    color: resolvedColor,
    margin: 0,
    ...(truncate ? {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minWidth: 0,
    } : {}),
    ...(cssProp as SystemStyleObject ?? {}),
  }

  return (
    <ChakraText
      as={as ?? config.defaultAs}
      css={mergedCss}
      {...rest}
    >
      {children}
    </ChakraText>
  )
}
