import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react'
import { Flex, Box } from '@chakra-ui/react'

/**
 * SplitPanel — Resizable two-pane layout built on Chakra UI.
 *
 * Usage:
 *   <SplitPanel
 *     left={<ExplorerPanel />}
 *     right={<EditorPanel />}
 *     defaultWidth={260}
 *     minWidth={180}
 *     maxWidth={500}
 *     storageKey="files.panelWidth"
 *   />
 */

export type SplitDirection = 'horizontal' | 'vertical'

interface SplitPanelProps {
  /** Left / top panel content */
  left: ReactNode
  /** Right / bottom panel content (main area) */
  children: ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  storageKey?: string
  direction?: SplitDirection
}

export function SplitPanel({
  left,
  children,
  defaultWidth = 260,
  minWidth = 160,
  maxWidth = 480,
  storageKey,
  direction = 'horizontal',
}: SplitPanelProps) {
  const isVertical = direction === 'vertical'

  const [size, setSize] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const n = parseInt(saved, 10)
        if (!isNaN(n) && n >= minWidth && n <= maxWidth) return n
      }
    }
    return defaultWidth
  })

  const [dragging, setDragging] = useState(false)
  const startRef = useRef({ pos: 0, size: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    startRef.current = {
      pos: isVertical ? e.clientY : e.clientX,
      size,
    }
  }, [size, isVertical])

  useEffect(() => {
    if (!dragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = isVertical
        ? e.clientY - startRef.current.pos
        : e.clientX - startRef.current.pos
      const next = Math.max(minWidth, Math.min(maxWidth, startRef.current.size + delta))
      setSize(next)
    }

    const handleMouseUp = () => {
      setDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = isVertical ? 'row-resize' : 'col-resize'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [dragging, minWidth, maxWidth, isVertical])

  useEffect(() => {
    if (storageKey && !dragging) {
      localStorage.setItem(storageKey, String(size))
    }
  }, [size, storageKey, dragging])

  return (
    <Flex
      direction={isVertical ? 'column' : 'row'}
      css={{ height: '100%', width: '100%', overflow: 'hidden' }}
    >
      <Box
        css={{
          flexShrink: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          ...(isVertical ? { height: size } : { width: size }),
        }}
      >
        {left}
      </Box>

      <Box
        onMouseDown={handleMouseDown}
        css={{
          flexShrink: 0,
          position: 'relative',
          zIndex: 2,
          ...(isVertical
            ? { width: '100%', height: '5px', cursor: 'row-resize' }
            : { height: '100%', width: '5px', cursor: 'col-resize' }
          ),
          '&::after': {
            content: '""',
            position: 'absolute',
            background: dragging ? 'var(--studio-border-hover)' : 'var(--studio-border)',
            transition: 'background 0.15s ease',
            ...(isVertical
              ? { left: 0, right: 0, top: '2px', height: '1px' }
              : { top: 0, bottom: 0, left: '2px', width: '1px' }
            ),
          },
          '&:hover::after': {
            background: 'var(--studio-border-hover)',
          },
        }}
      />

      <Box
        css={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Flex>
  )
}
