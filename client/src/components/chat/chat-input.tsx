import { useState, useRef } from 'react'
import { Box, Text, Textarea } from '@chakra-ui/react'
import { ArrowUp, Square, ChevronDown, Check, Zap, Sparkles, Brain } from 'lucide-react'
import { Tooltip } from '@/components/shared/tooltip'
import { useSettings } from '@/hooks/use-settings'

const MODELS = [
  { id: 'sonnet', label: 'Claude Sonnet', description: 'Fast & capable', icon: Zap },
  { id: 'opus', label: 'Claude Opus', description: 'Most intelligent', icon: Brain },
  { id: 'haiku', label: 'Claude Haiku', description: 'Fastest responses', icon: Sparkles },
] as const

interface ChatInputProps {
  onSend: (text: string) => void
  onCancel: () => void
  isStreaming: boolean
  disabled?: boolean
}

export function ChatInput({ onSend, onCancel, isStreaming, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const [modelMenuOpen, setModelMenuOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { model, set } = useSettings()

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const activeModel = MODELS.find((m) => m.id === model) || MODELS[0]
  const ActiveIcon = activeModel.icon

  return (
    <Box css={{
      padding: '0 24px 20px',
      maxWidth: '760px', marginLeft: 'auto', marginRight: 'auto', width: '100%',
    }}>
      <Box css={{
        position: 'relative',
        background: 'var(--studio-bg-surface)',
        borderRadius: '16px',
        border: '1px solid var(--studio-border)',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        '&:focus-within': {
          borderColor: 'var(--studio-border-hover)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        },
      }}>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Claude to build something..."
          resize="none"
          rows={2}
          disabled={disabled}
          css={{
            minHeight: '56px', maxHeight: '200px',
            padding: '16px 56px 16px 18px',
            background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--studio-text-primary)',
            fontSize: '14px', lineHeight: '1.6',
            '&::placeholder': { color: 'var(--studio-text-tertiary)' },
            '&:focus': { outline: 'none', boxShadow: 'none', borderColor: 'transparent' },
          }}
        />

        {/* Bottom bar */}
        <Box css={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 12px 10px 14px',
        }}>
          {/* Model selector */}
          <Box css={{ position: 'relative' }}>
            <Box
              as="button"
              onClick={() => setModelMenuOpen(!modelMenuOpen)}
              css={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '4px 8px', borderRadius: '6px',
                border: 'none', background: 'transparent',
                color: 'var(--studio-text-muted)', fontSize: '11px',
                cursor: 'pointer', transition: 'all 0.12s ease',
                '&:hover': { background: 'var(--studio-bg-hover)', color: 'var(--studio-text-secondary)' },
              }}
            >
              <ActiveIcon size={12} />
              <Text css={{ fontWeight: 500 }}>{activeModel.label}</Text>
              <ChevronDown size={10} style={{
                transform: modelMenuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s',
              }} />
            </Box>

            {/* Dropdown */}
            {modelMenuOpen && (
              <>
                <Box
                  css={{ position: 'fixed', inset: 0, zIndex: 99 }}
                  onClick={() => setModelMenuOpen(false)}
                />
                <Box css={{
                  position: 'absolute', bottom: '100%', left: 0,
                  marginBottom: '6px', width: '200px',
                  background: 'var(--studio-bg-surface)',
                  border: '1px solid var(--studio-border-hover)',
                  borderRadius: '10px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                  zIndex: 100, overflow: 'hidden', padding: '4px',
                }}>
                  {MODELS.map((m) => {
                    const Icon = m.icon
                    const isActive = m.id === model
                    return (
                      <Box
                        key={m.id}
                        as="button"
                        onClick={() => { set('ai.model', m.id); setModelMenuOpen(false) }}
                        css={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          width: '100%', padding: '8px 10px',
                          borderRadius: '7px', border: 'none',
                          background: isActive ? 'var(--studio-bg-hover)' : 'transparent',
                          cursor: 'pointer', textAlign: 'left',
                          transition: 'all 0.1s ease',
                          '&:hover': { background: 'var(--studio-bg-hover)' },
                        }}
                      >
                        <Icon size={14} style={{ color: isActive ? 'var(--studio-green)' : 'var(--studio-text-muted)', flexShrink: 0 }} />
                        <Box css={{ flex: 1 }}>
                          <Text css={{ fontSize: '12px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>
                            {m.label}
                          </Text>
                          <Text css={{ fontSize: '10px', color: 'var(--studio-text-muted)' }}>
                            {m.description}
                          </Text>
                        </Box>
                        {isActive && <Check size={13} style={{ color: 'var(--studio-green)', flexShrink: 0 }} />}
                      </Box>
                    )
                  })}

                </Box>
              </>
            )}
          </Box>

          <Box css={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text as="span" css={{
              fontSize: '11px', color: 'var(--studio-text-muted)',
              userSelect: 'none',
            }}>
              {'\u2318'}Enter
            </Text>

            {isStreaming ? (
              <Tooltip content="Stop generation">
                <Box
                  as="button"
                  onClick={onCancel}
                  css={{
                    width: '30px', height: '30px', borderRadius: '10px',
                    background: 'var(--studio-error)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff',
                    transition: 'all 0.15s ease', flexShrink: 0,
                    '&:hover': { opacity: 0.85, transform: 'scale(1.05)' },
                  }}
                >
                  <Square size={10} fill="currentColor" />
                </Box>
              </Tooltip>
            ) : (
              <Tooltip content="Send (Cmd+Enter)">
                <Box
                  as="button"
                  onClick={handleSend}
                  css={{
                    width: '30px', height: '30px', borderRadius: '10px',
                    background: value.trim() && !disabled ? 'var(--studio-accent)' : 'var(--studio-bg-hover)',
                    border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: value.trim() && !disabled ? 'pointer' : 'default',
                    color: value.trim() && !disabled ? 'var(--studio-accent-fg)' : 'var(--studio-text-muted)',
                    transition: 'all 0.15s ease', flexShrink: 0,
                    '&:hover': value.trim() && !disabled ? { transform: 'scale(1.05)' } : {},
                  }}
                >
                  <ArrowUp size={15} />
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
