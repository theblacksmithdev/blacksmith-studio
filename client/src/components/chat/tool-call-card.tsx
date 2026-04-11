import { useState } from 'react'
import { Box, Text, HStack } from '@chakra-ui/react'
import { FileEdit, Terminal, Eye, FileSearch, Globe, ChevronRight, ChevronDown } from 'lucide-react'
import type { ToolCall } from '@/types'

const TOOL_CONFIG: Record<string, { icon: typeof FileEdit; color: string; label: string }> = {
  Edit:  { icon: FileEdit,   color: '#60a5fa', label: 'Edit' },
  Write: { icon: FileEdit,   color: '#60a5fa', label: 'Write' },
  Bash:  { icon: Terminal,   color: '#f59e0b', label: 'Bash' },
  Read:  { icon: Eye,        color: '#34d399', label: 'Read' },
  Grep:  { icon: FileSearch, color: '#a78bfa', label: 'Grep' },
  Glob:  { icon: FileSearch, color: '#a78bfa', label: 'Glob' },
  WebFetch: { icon: Globe,   color: '#38bdf8', label: 'Fetch' },
}

const DEFAULT_CONFIG = { icon: Terminal, color: 'var(--studio-text-muted)', label: 'Tool' }

interface ToolCallCardProps {
  toolCall: ToolCall
  isActive?: boolean
}

export function ToolCallCard({ toolCall, isActive }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false)
  const config = TOOL_CONFIG[toolCall.toolName] || DEFAULT_CONFIG
  const Icon = config.icon

  const summary = (() => {
    const input = toolCall.input as Record<string, any>
    if (toolCall.toolName === 'Edit' || toolCall.toolName === 'Write' || toolCall.toolName === 'Read') {
      return input.file_path || input.path || ''
    }
    if (toolCall.toolName === 'Bash') return input.command || ''
    if (toolCall.toolName === 'Grep' || toolCall.toolName === 'Glob') return input.pattern || ''
    return JSON.stringify(input).slice(0, 80)
  })()

  return (
    <Box
      css={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid var(--studio-border)',
        background: 'var(--studio-bg-surface)',
        transition: 'all 0.15s ease',
        '&:hover': { borderColor: 'var(--studio-border-hover)' },
      }}
    >
      <Box
        as="button"
        onClick={() => setExpanded(!expanded)}
        css={{
          display: 'flex', alignItems: 'center', gap: '8px',
          width: '100%', padding: '7px 10px',
          background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
          borderLeft: `2px solid ${config.color}`,
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

        {/* Tool badge */}
        <Text css={{
          fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.04em', color: config.color,
          padding: '1px 5px', borderRadius: '3px',
          background: `${config.color}12`, flexShrink: 0,
        }}>
          {config.label}
        </Text>

        {/* Summary */}
        <Text css={{
          fontFamily: "'SF Mono', 'Fira Code', Menlo, monospace",
          fontSize: '12px', color: 'var(--studio-text-secondary)',
          overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', flex: 1,
        }}>
          {summary}
        </Text>

        {expanded ? <ChevronDown size={11} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
                   : <ChevronRight size={11} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />}
      </Box>

      {expanded && (
        <Box css={{
          padding: '8px 10px 8px 20px', borderTop: '1px solid var(--studio-border)',
          maxHeight: '200px', overflowY: 'auto',
        }}>
          <Text css={{
            fontFamily: "'SF Mono', 'Fira Code', Menlo, monospace",
            fontSize: '12px', color: 'var(--studio-text-secondary)',
            whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: '18px',
          }}>
            {toolCall.output || JSON.stringify(toolCall.input, null, 2)}
          </Text>
        </Box>
      )}
    </Box>
  )
}
