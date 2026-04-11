import { useState } from 'react'
import styled from '@emotion/styled'
import { Box, Text, Textarea } from '@chakra-ui/react'
import { ArrowUp, Loader2 } from 'lucide-react'
import { Tooltip } from '@/components/shared/tooltip'

const Wrap = styled.div`
  padding: 8px 12px 12px;
  flex-shrink: 0;
`

const Card = styled.div`
  position: relative;
  background: var(--studio-bg-main);
  border-radius: 14px;
  border: 1px solid var(--studio-border);
  transition: all 0.15s ease;

  &:focus-within {
    border-color: var(--studio-border-hover);
    box-shadow: 0 0 0 3px rgba(0,0,0,0.03);
  }
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 8px 14px;
`

const Hint = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
  user-select: none;
  opacity: 0.6;
  display: flex;
  align-items: center;
  gap: 3px;
`

const Send = styled.button<{ $on: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: inherit;
  transition: all 0.12s ease;

  background: ${({ $on }) => $on ? 'var(--studio-accent)' : 'var(--studio-bg-hover)'};
  color: ${({ $on }) => $on ? 'var(--studio-accent-fg)' : 'var(--studio-text-muted)'};
  cursor: ${({ $on }) => $on ? 'pointer' : 'default'};

  &:hover {
    ${({ $on }) => $on && 'transform: scale(1.05); opacity: 0.9;'}
  }
`

interface ChatInputProps {
  onSend: (msg: string) => void
  disabled: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [val, setVal] = useState('')

  const send = () => {
    const t = val.trim()
    if (!t || disabled) return
    onSend(t)
    setVal('')
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send() }
  }

  const canSend = !!val.trim() && !disabled

  return (
    <Wrap>
      <Card>
        <Textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={onKey}
          placeholder={disabled ? 'Agents are working...' : 'Build a user dashboard...'}
          resize="none"
          rows={2}
          disabled={disabled}
          css={{
            minHeight: '44px', maxHeight: '100px',
            padding: '10px 14px 4px',
            background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--studio-text-primary)',
            fontSize: '13.5px', lineHeight: '1.5',
            '&::placeholder': { color: 'var(--studio-text-tertiary)' },
            '&:focus': { outline: 'none', boxShadow: 'none', borderColor: 'transparent' },
          }}
        />
        <Footer>
          <Hint>
            {disabled ? (
              <><Loader2 size={9} style={{ animation: 'spin 1s linear infinite' }} /> Processing</>
            ) : (
              <>{'\u2318'}+Return to send</>
            )}
          </Hint>
          <Tooltip content="Send">
            <Send $on={canSend} onClick={send}>
              <ArrowUp size={13} />
            </Send>
          </Tooltip>
        </Footer>
      </Card>
    </Wrap>
  )
}
