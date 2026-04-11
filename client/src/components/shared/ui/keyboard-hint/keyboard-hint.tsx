import { Box, type BoxProps } from '@chakra-ui/react'
import type { SystemStyleObject } from '@chakra-ui/react'
import { spacing, radii } from '../tokens'

interface KeyboardHintProps extends BoxProps {
  /** Key combination to display, e.g. "⌘+Return" or "Esc" */
  keys: string
}

export function KeyboardHint({
  keys,
  css: cssProp,
  ...rest
}: KeyboardHintProps) {
  const merged: SystemStyleObject = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing['2xs'],
    fontSize: '10px',
    fontWeight: 500,
    fontFamily: 'inherit',
    color: 'var(--studio-text-muted)',
    userSelect: 'none',
    opacity: 0.6,
    ...(cssProp as SystemStyleObject ?? {}),
  }

  const kbdStyle: SystemStyleObject = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing['2xs']} ${spacing.xs}`,
    borderRadius: radii.xs,
    background: 'var(--studio-bg-surface)',
    border: '1px solid var(--studio-border)',
    fontSize: '10px',
    fontWeight: 500,
    fontFamily: 'inherit',
    color: 'var(--studio-text-tertiary)',
    lineHeight: 1,
    minWidth: '18px',
    textAlign: 'center',
  }

  const parts = keys.split('+').map((k) => k.trim())

  return (
    <Box as="span" css={merged} {...rest}>
      {parts.map((key, i) => (
        <span key={i}>
          {i > 0 && <span style={{ margin: '0 1px' }}>+</span>}
          <Box as="kbd" css={kbdStyle}>{key}</Box>
        </span>
      ))}
    </Box>
  )
}
