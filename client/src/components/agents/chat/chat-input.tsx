import { useState } from 'react'
import styled from '@emotion/styled'
import { Box, Text, Textarea } from '@chakra-ui/react'
import { ArrowUp } from 'lucide-react'
import { Tooltip } from '@/components/shared/tooltip'

const Wrap = styled.div`
  padding: 10px 14px 14px;
  flex-shrink: 0;
`

const Card = styled.div`
  position: relative;
  background: var(--studio-bg-main);
  border-radius: 12px;
  border: 1px solid var(--studio-border);
  transition: all 0.15s ease;

  &:focus-within {
    border-color: var(--studio-border-hover);
    box-shadow: 0 0 0 3px rgba(0,0,0,0.03);
  }
`

const Send = styled.button<{ $on: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: 7px;
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
  &:hover { ${({ $on }) => $on && 'transform: scale(1.06);'} }
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

  return (
    <Wrap>
      <Card>
        <Textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={onKey}
          placeholder="Build a user dashboard..."
          resize="none"
          rows={2}
          disabled={disabled}
          css={{
            minHeight: '48px', maxHeight: '120px',
            padding: '12px 40px 12px 14px',
            background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--studio-text-primary)',
            fontSize: '13px', lineHeight: '1.5',
            '&::placeholder': { color: 'var(--studio-text-tertiary)' },
            '&:focus': { outline: 'none', boxShadow: 'none', borderColor: 'transparent' },
          }}
        />
        <Box css={{ position: 'absolute', right: '8px', bottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Text css={{ fontSize: '9px', color: 'var(--studio-text-muted)', userSelect: 'none', opacity: 0.7 }}>{'\u2318'}↵</Text>
          <Tooltip content="Send">
            <Send $on={!!val.trim() && !disabled} onClick={send}>
              <ArrowUp size={13} />
            </Send>
          </Tooltip>
        </Box>
      </Card>
    </Wrap>
  )
}
