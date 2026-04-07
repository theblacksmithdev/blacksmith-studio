import { useState, useRef } from 'react'
import styled from '@emotion/styled'
import { Textarea } from '@chakra-ui/react'
import { ArrowUp, Square, ChevronDown, Check, Zap, Sparkles, Brain } from 'lucide-react'
import { Tooltip } from '@/components/shared/tooltip'
import { useSettings } from '@/hooks/use-settings'

const MODELS = [
  { id: 'sonnet', label: 'Claude Sonnet', description: 'Fast & capable', icon: Zap },
  { id: 'opus', label: 'Claude Opus', description: 'Most intelligent', icon: Brain },
  { id: 'haiku', label: 'Claude Haiku', description: 'Fastest responses', icon: Sparkles },
] as const

// ─── Styled Components ───

const Container = styled.div`
  width: 100%;
`

const InputCard = styled.div`
  position: relative;
  background: var(--studio-bg-surface);
  border-radius: 16px;
  border: 1px solid var(--studio-border);
  transition: all 0.2s ease;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);

  &:focus-within {
    border-color: var(--studio-border-hover);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
`

const BottomBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 10px 14px;
`

const ModelSelectorWrap = styled.div`
  position: relative;
`

const ModelTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-secondary);
  }
`

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99;
`

const Dropdown = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 6px;
  width: 200px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border-hover);
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  z-index: 100;
  overflow: hidden;
  padding: 4px;
`

const ModelOption = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 7px;
  border: none;
  background: ${(p) => (p.$active ? 'var(--studio-bg-hover)' : 'transparent')};
  cursor: pointer;
  text-align: left;
  transition: all 0.1s ease;

  &:hover {
    background: var(--studio-bg-hover);
  }
`

const ModelLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: var(--studio-text-primary);
`

const ModelDesc = styled.div`
  font-size: 10px;
  color: var(--studio-text-muted);
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const KeyHint = styled.span`
  font-size: 11px;
  color: var(--studio-text-muted);
  user-select: none;
`

const ActionBtn = styled.button<{ $variant?: 'send' | 'cancel'; $active?: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;

  background: ${(p) => {
    if (p.$variant === 'cancel') return 'var(--studio-error)'
    if (p.$active) return 'var(--studio-accent)'
    return 'var(--studio-bg-hover)'
  }};

  color: ${(p) => {
    if (p.$variant === 'cancel') return '#fff'
    if (p.$active) return 'var(--studio-accent-fg)'
    return 'var(--studio-text-muted)'
  }};

  cursor: ${(p) => (p.$variant === 'cancel' || p.$active) ? 'pointer' : 'default'};

  &:hover {
    ${(p) => (p.$variant === 'cancel' || p.$active) ? 'transform: scale(1.05);' : ''}
    ${(p) => p.$variant === 'cancel' ? 'opacity: 0.85;' : ''}
  }
`

// ─── Component ───

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
  const canSend = !!value.trim() && !disabled

  return (
    <Container>
      <InputCard>
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

        <BottomBar>
          <ModelSelectorWrap>
            <ModelTrigger onClick={() => setModelMenuOpen(!modelMenuOpen)}>
              <ActiveIcon size={12} />
              {activeModel.label}
              <ChevronDown size={10} style={{
                transform: modelMenuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s',
              }} />
            </ModelTrigger>

            {modelMenuOpen && (
              <>
                <Backdrop onClick={() => setModelMenuOpen(false)} />
                <Dropdown>
                  {MODELS.map((m) => {
                    const Icon = m.icon
                    const isActive = m.id === model
                    return (
                      <ModelOption
                        key={m.id}
                        $active={isActive}
                        onClick={() => { set('ai.model', m.id); setModelMenuOpen(false) }}
                      >
                        <Icon size={14} style={{ color: isActive ? 'var(--studio-green)' : 'var(--studio-text-muted)', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <ModelLabel>{m.label}</ModelLabel>
                          <ModelDesc>{m.description}</ModelDesc>
                        </div>
                        {isActive && <Check size={13} style={{ color: 'var(--studio-green)', flexShrink: 0 }} />}
                      </ModelOption>
                    )
                  })}
                </Dropdown>
              </>
            )}
          </ModelSelectorWrap>

          <Actions>
            <KeyHint>{'\u2318'}Enter</KeyHint>

            {isStreaming ? (
              <Tooltip content="Stop generation">
                <ActionBtn $variant="cancel" onClick={onCancel}>
                  <Square size={10} fill="currentColor" />
                </ActionBtn>
              </Tooltip>
            ) : (
              <Tooltip content="Send (Cmd+Enter)">
                <ActionBtn $active={canSend} onClick={handleSend}>
                  <ArrowUp size={15} />
                </ActionBtn>
              </Tooltip>
            )}
          </Actions>
        </BottomBar>
      </InputCard>
    </Container>
  )
}
