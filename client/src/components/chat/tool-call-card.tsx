import { useState, memo } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { FileEdit, Terminal, Eye, FileSearch, Globe, ChevronRight, ChevronDown } from 'lucide-react'
import { Text, Badge, spacing, radii } from '@/components/shared/ui'
import type { ToolCall } from '@/types'

const TOOL_CONFIG: Record<string, { icon: typeof FileEdit; color: string; label: string }> = {
  Edit:     { icon: FileEdit,   color: '#60a5fa', label: 'Edit' },
  Write:    { icon: FileEdit,   color: '#60a5fa', label: 'Write' },
  Bash:     { icon: Terminal,   color: '#f59e0b', label: 'Bash' },
  Read:     { icon: Eye,        color: '#34d399', label: 'Read' },
  Grep:     { icon: FileSearch, color: '#a78bfa', label: 'Grep' },
  Glob:     { icon: FileSearch, color: '#a78bfa', label: 'Glob' },
  WebFetch: { icon: Globe,      color: '#38bdf8', label: 'Fetch' },
}

const DEFAULT_CONFIG = { icon: Terminal, color: 'var(--studio-text-muted)', label: 'Tool' }

function getSummary(toolCall: ToolCall): string {
  const input = toolCall.input as Record<string, any>
  if (['Edit', 'Write', 'Read'].includes(toolCall.toolName)) return input.file_path || input.path || ''
  if (toolCall.toolName === 'Bash') return input.command || ''
  if (['Grep', 'Glob'].includes(toolCall.toolName)) return input.pattern || ''
  return JSON.stringify(input).slice(0, 80)
}

interface ToolCallCardProps {
  toolCall: ToolCall
  isActive?: boolean
}

export const ToolCallCard = memo(function ToolCallCard({ toolCall, isActive }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false)
  const config = TOOL_CONFIG[toolCall.toolName] || DEFAULT_CONFIG
  const Icon = config.icon
  const summary = getSummary(toolCall)

  return (
    <Box css={{
      borderRadius: radii.md,
      overflow: 'hidden',
      border: '1px solid var(--studio-border)',
      background: 'var(--studio-bg-surface)',
      transition: 'border-color 0.12s ease',
      '&:hover': { borderColor: 'var(--studio-border-hover)' },
    }}>
      {/* Header row */}
      <Flex
        as="button"
        align="center"
        gap={spacing.sm}
        onClick={() => setExpanded(!expanded)}
        css={{
          width: '100%',
          padding: `${spacing.xs} ${spacing.sm}`,
          background: 'transparent',
          border: 'none',
          borderLeft: `2px solid ${config.color}`,
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        {/* Status dot */}
        <Box css={{
          width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
          background: isActive ? config.color : 'var(--studio-green)',
          boxShadow: isActive ? `0 0 6px ${config.color}` : 'none',
          animation: isActive ? 'pulse 1.5s ease infinite' : 'none',
        }} />

        <Icon size={12} style={{ color: config.color, flexShrink: 0 }} />

        <Badge variant="default" size="sm" css={{
          color: config.color,
          background: `${config.color}12`,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontSize: '10px',
          fontWeight: 600,
        }}>
          {config.label}
        </Badge>

        <Text variant="caption" css={{
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: 'var(--studio-text-secondary)',
        }}>
          {summary}
        </Text>

        {expanded
          ? <ChevronDown size={11} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
          : <ChevronRight size={11} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
        }
      </Flex>

      {/* Expandable output */}
      {expanded && (
        <Box css={{
          padding: `${spacing.sm} ${spacing.sm} ${spacing.sm} ${spacing.xl}`,
          borderTop: '1px solid var(--studio-border)',
          maxHeight: '240px',
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(128,128,128,0.15)', borderRadius: '2px' },
        }}>
          <Text variant="caption" css={{
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            lineHeight: '18px',
            color: 'var(--studio-text-secondary)',
          }}>
            {toolCall.output || JSON.stringify(toolCall.input, null, 2)}
          </Text>
        </Box>
      )}
    </Box>
  )
})
