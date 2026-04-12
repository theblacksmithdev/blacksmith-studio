import { useRef, useEffect, useCallback, type ReactNode } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Box } from '@chakra-ui/react'

export interface InfiniteScrollListProps<T> {
  /** The full data array */
  items: T[]
  /** Estimated height of each row in pixels */
  estimateSize?: number
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode
  /** Number of items to render beyond the visible area */
  overscan?: number
  /** Called when the user scrolls near the bottom */
  onLoadMore?: () => void
  /** Distance from bottom (in px) to trigger onLoadMore */
  loadMoreThreshold?: number
  /** Whether more data is currently loading */
  isLoadingMore?: boolean
  /** Custom footer rendered at the bottom when loading more */
  loadingFooter?: ReactNode
  /** Gap between items in pixels */
  gap?: number
  /** CSS class for the scroll container */
  className?: string
}

export function InfiniteScrollList<T>({
  items,
  estimateSize = 36,
  renderItem,
  overscan = 10,
  onLoadMore,
  loadMoreThreshold = 200,
  isLoadingMore,
  loadingFooter,
  gap = 0,
  className,
}: InfiniteScrollListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    gap,
  })

  const handleScroll = useCallback(() => {
    if (!onLoadMore || isLoadingMore) return
    const el = parentRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollHeight - scrollTop - clientHeight < loadMoreThreshold) {
      onLoadMore()
    }
  }, [onLoadMore, isLoadingMore, loadMoreThreshold])

  useEffect(() => {
    const el = parentRef.current
    if (!el || !onLoadMore) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll, onLoadMore])

  return (
    <Box
      ref={parentRef}
      className={className}
      css={{
        height: '100%',
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(128,128,128,0.15)', borderRadius: '3px' },
        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(128,128,128,0.25)' },
      }}
    >
      <Box css={{ height: virtualizer.getTotalSize(), width: '100%', position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <Box
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            css={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </Box>
        ))}
      </Box>

      {isLoadingMore && loadingFooter && (
        <Box css={{ padding: '8px 0' }}>
          {loadingFooter}
        </Box>
      )}
    </Box>
  )
}
