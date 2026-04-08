import { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import { Box, Flex, Text, Input, Checkbox } from '@chakra-ui/react'
import { Sparkles, GitCommitHorizontal } from 'lucide-react'
import type { GitChangedFile } from '@/api/types'
import { useGit } from '@/hooks/use-git'
import { Modal, PrimaryButton, SecondaryButton, GhostButton, FooterSpacer } from '@/components/shared/modal'

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 220px;
  overflow-y: auto;
  margin-top: 4px;
`

const FileItem = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--studio-text-secondary);
  cursor: pointer;
  transition: background 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
  }
`

const inputCss = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid var(--studio-border)',
  background: 'var(--studio-bg-inset)',
  fontSize: '13px',
  color: 'var(--studio-text-primary)',
  '&:focus': { borderColor: 'var(--studio-border-hover)', boxShadow: 'none' },
  '&::placeholder': { color: 'var(--studio-text-muted)' },
}

interface Props {
  files: GitChangedFile[]
  onClose: () => void
  onCommitted: () => void
}

export function CommitDialog({ files, onClose, onCommitted }: Props) {
  const { commit, generateMessage } = useGit()
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<Set<string>>(() => new Set(files.map((f) => f.path)))
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    setGenerating(true)
    generateMessage.mutateAsync().then((msg) => {
      setMessage(msg)
      setGenerating(false)
    }).catch(() => setGenerating(false))
  }, [])

  const toggleFile = (path: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === files.length) setSelected(new Set())
    else setSelected(new Set(files.map((f) => f.path)))
  }

  const handleCommit = async () => {
    if (!message.trim() || selected.size === 0) return
    const selectedFiles = selected.size === files.length ? undefined : Array.from(selected)
    await commit.mutateAsync({ message: message.trim(), files: selectedFiles })
    onCommitted()
  }

  return (
    <Modal
      title="Commit Changes"
      onClose={onClose}
      headerExtra={<GitCommitHorizontal size={16} style={{ color: 'var(--studio-text-muted)' }} />}
      footer={
        <>
          <FooterSpacer />
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton
            onClick={handleCommit}
            disabled={commit.isPending || !message.trim() || selected.size === 0}
          >
            {commit.isPending ? 'Committing...' : 'Commit'}
          </PrimaryButton>
        </>
      }
    >
      {/* Commit message */}
      <Box css={{ marginBottom: '20px' }}>
        <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-secondary)', marginBottom: '8px' }}>
          Commit message
        </Text>
        <Input
          value={generating ? 'Generating...' : message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your changes..."
          disabled={generating}
          autoFocus
          css={inputCss}
        />
        <GhostButton
          onClick={() => {
            setGenerating(true)
            generateMessage.mutateAsync().then((msg) => { setMessage(msg); setGenerating(false) }).catch(() => setGenerating(false))
          }}
          disabled={generating}
          css={{ marginTop: '8px', fontSize: '12px', padding: '4px 10px' }}
        >
          <Sparkles size={12} />
          <Box as="span" css={{ marginLeft: '4px' }}>Generate message</Box>
        </GhostButton>
      </Box>

      {/* Staged files */}
      <Box>
        <Flex align="center" justify="space-between" css={{ marginBottom: '6px' }}>
          <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-secondary)' }}>
            Staged files
          </Text>
          <GhostButton
            onClick={toggleAll}
            css={{ fontSize: '11px', padding: '2px 8px' }}
          >
            {selected.size === files.length ? 'Deselect all' : 'Select all'}
          </GhostButton>
        </Flex>
        <FileList>
          {files.map((f) => (
            <FileItem key={f.path}>
              <Checkbox.Root
                checked={selected.has(f.path)}
                onCheckedChange={() => toggleFile(f.path)}
                size="sm"
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control css={{
                  borderRadius: '4px',
                  border: '1px solid var(--studio-border)',
                  '&[data-state=checked]': {
                    background: 'var(--studio-accent)',
                    borderColor: 'var(--studio-accent)',
                  },
                }}>
                  <Checkbox.Indicator>
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  </Checkbox.Indicator>
                </Checkbox.Control>
              </Checkbox.Root>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {f.path}
              </span>
            </FileItem>
          ))}
        </FileList>
      </Box>
    </Modal>
  )
}
