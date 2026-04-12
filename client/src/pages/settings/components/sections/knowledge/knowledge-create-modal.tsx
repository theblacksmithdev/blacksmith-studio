import { Flex, Box } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { BookOpen } from 'lucide-react'
import { Modal, ModalPrimaryButton, ModalFooterSpacer, Button, Text } from '@/components/shared/ui'

const NameInput = styled.input`
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-primary);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.12s ease;

  &::placeholder { color: var(--studio-text-muted); }
  &:focus { border-color: var(--studio-border-hover); box-shadow: var(--studio-ring-focus); }
`

interface KnowledgeCreateModalProps {
  name: string
  onNameChange: (v: string) => void
  onCreate: () => void
  onClose: () => void
}

export function KnowledgeCreateModal({ name, onNameChange, onCreate, onClose }: KnowledgeCreateModalProps) {
  return (
    <Modal
      title="New Document"
      onClose={onClose}
      width="420px"
      headerExtra={
        <Flex css={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'var(--studio-bg-surface)', border: '1px solid var(--studio-border)',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          color: 'var(--studio-text-muted)',
        }}>
          <BookOpen size={14} />
        </Flex>
      }
      footer={
        <>
          <ModalFooterSpacer />
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <ModalPrimaryButton disabled={!name.trim()} onClick={onCreate}>Create</ModalPrimaryButton>
        </>
      }
    >
      <Flex direction="column" gap="6px">
        <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-secondary)' }}>
          Filename
        </Text>
        <NameInput
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. requirements, api-spec, design-system"
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onCreate() }}
        />
        <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)' }}>
          Saved as a .md file in .blacksmith/docs/
        </Text>
      </Flex>
    </Modal>
  )
}
