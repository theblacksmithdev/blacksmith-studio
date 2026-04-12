import { Flex } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { Trash2, Plus } from 'lucide-react'
import { IconButton } from '@/components/shared/ui'

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const KvInput = styled.input`
  flex: 1;
  padding: 6px 10px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-primary);
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  outline: none;
  transition: border-color 0.12s ease;

  &::placeholder { color: var(--studio-text-muted); }
  &:focus { border-color: var(--studio-border-hover); }
`

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.12s ease;

  &:hover { color: var(--studio-text-primary); }
`

interface KvPair { key: string; value: string }

interface KvEditorProps {
  pairs: KvPair[]
  onChange: (pairs: KvPair[]) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
  addLabel?: string
}

export function KvEditor({ pairs, onChange, keyPlaceholder = 'KEY', valuePlaceholder = 'Value', addLabel = 'Add' }: KvEditorProps) {
  const update = (i: number, field: 'key' | 'value', val: string) => {
    const next = [...pairs]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }

  return (
    <Flex direction="column" gap="6px">
      {pairs.map((pair, i) => (
        <Row key={i}>
          <KvInput value={pair.key} onChange={(e) => update(i, 'key', e.target.value)} placeholder={keyPlaceholder} />
          <KvInput value={pair.value} onChange={(e) => update(i, 'value', e.target.value)} placeholder={valuePlaceholder} />
          <IconButton
            variant="ghost" size="xs" aria-label="Remove"
            onClick={() => onChange(pairs.filter((_, j) => j !== i))}
          >
            <Trash2 size={12} />
          </IconButton>
        </Row>
      ))}
      <AddBtn onClick={() => onChange([...pairs, { key: '', value: '' }])}>
        <Plus size={12} /> {addLabel}
      </AddBtn>
    </Flex>
  )
}
