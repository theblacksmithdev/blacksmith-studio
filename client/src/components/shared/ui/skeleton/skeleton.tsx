import { Box, Flex } from '@chakra-ui/react'
import { radii } from '../tokens'

export type SkeletonVariant = 'text' | 'circular' | 'rectangular'

interface SkeletonProps {
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
  /** Number of skeleton lines to render */
  count?: number
  /** Gap between lines (only when count > 1) */
  gap?: string | number
}

const shimmer = {
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
}

function getRadius(variant: SkeletonVariant) {
  switch (variant) {
    case 'circular': return '50%'
    case 'text': return radii.xs
    case 'rectangular': return radii.sm
  }
}

function SingleSkeleton({ variant = 'text', width, height }: Omit<SkeletonProps, 'count' | 'gap'>) {
  const h = height ?? (variant === 'text' ? '12px' : variant === 'circular' ? '32px' : '40px')
  const w = width ?? (variant === 'circular' ? h : '100%')

  return (
    <Box
      css={{
        width: w,
        height: h,
        borderRadius: getRadius(variant),
        background: 'linear-gradient(90deg, var(--studio-bg-surface) 25%, var(--studio-bg-hover) 50%, var(--studio-bg-surface) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
        ...shimmer,
      }}
    />
  )
}

export function Skeleton({ variant = 'text', width, height, count = 1, gap = '8px' }: SkeletonProps) {
  if (count <= 1) {
    return <SingleSkeleton variant={variant} width={width} height={height} />
  }

  return (
    <Flex direction="column" gap={gap}>
      {Array.from({ length: count }).map((_, i) => (
        <SingleSkeleton key={i} variant={variant} width={width} height={height} />
      ))}
    </Flex>
  )
}

/** Preset: a row skeleton that looks like a list item (icon + text) */
export function SkeletonRow({ width }: { width?: string }) {
  return (
    <Flex align="center" gap="8px" css={{ padding: '6px 8px' }}>
      <SingleSkeleton variant="circular" width="14px" height="14px" />
      <SingleSkeleton variant="text" width={width ?? '70%'} height="12px" />
    </Flex>
  )
}

/** Preset: multiple row skeletons for loading states */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <Flex direction="column" gap="2px">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} width={`${60 + Math.random() * 30}%`} />
      ))}
    </Flex>
  )
}
