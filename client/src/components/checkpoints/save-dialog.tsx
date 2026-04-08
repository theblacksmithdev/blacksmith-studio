import { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import { Box, Flex, Text, Input, Button, Checkbox } from '@chakra-ui/react'
import { Sparkles, X } from 'lucide-react'
import type { GitChangedFile } from '@/api/types'
import { useGit } from '@/hooks/use-git'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`

const Dialog = styled.div`
  width: 480px;
  max-height: 80vh;
  background: var(--studio-bg-main);
  border-radius: 16px;
  border: 1px solid var(--studio-border);
  box-shadow: var(--studio-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
`

const Body = styled.div`
  padding: 20px 24px;
  flex: 1;
  overflow-y: auto;
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid var(--studio-border);
`

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
`

const FileItem = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'SF Mono', monospace;
  color: var(--studio-text-secondary);
  cursor: pointer;

  &:hover {
    background: var(--studio-bg-hover);
  }
`

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

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const msg = await generateMessage.mutateAsync()
      setMessage(msg)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Header>
          <Text css={{ fontSize: '16px', fontWeight: 600, color: 'var(--studio-text-primary)' }}>
            Commit Changes
          </Text>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            css={{
              color: 'var(--studio-text-muted)',
              borderRadius: '8px',
              padding: '4px',
              '&:hover': { background: 'var(--studio-bg-hover)' },
            }}
          >
            <X size={16} />
          </Button>
        </Header>

        <Body>
          {/* Message */}
          <Box css={{ marginBottom: '20px' }}>
            <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-secondary)', marginBottom: '8px' }}>
              Commit message
            </Text>
            <Input
              value={generating ? 'Generating...' : message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your changes..."
              disabled={generating}
              css={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--studio-border)',
                background: 'var(--studio-bg-sidebar)',
                fontSize: '14px',
                color: 'var(--studio-text-primary)',
                '&:focus': { borderColor: 'var(--studio-border-hover)', boxShadow: 'none' },
                '&::placeholder': { color: 'var(--studio-text-muted)' },
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleGenerate}
              disabled={generating}
              css={{
                marginTop: '8px',
                fontSize: '12px',
                color: 'var(--studio-text-muted)',
                padding: '4px 10px',
                borderRadius: '6px',
                '&:hover': { color: 'var(--studio-text-secondary)', background: 'var(--studio-bg-hover)' },
              }}
            >
              <Sparkles size={12} />
              <span style={{ marginLeft: '4px' }}>Generate message</span>
            </Button>
          </Box>

          {/* Files to stage */}
          <Box>
            <Flex align="center" justify="space-between" css={{ marginBottom: '8px' }}>
              <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-secondary)' }}>
                Staged files:
              </Text>
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleAll}
                css={{
                  fontSize: '11px',
                  color: 'var(--studio-text-muted)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  '&:hover': { color: 'var(--studio-text-secondary)' },
                }}
              >
                {selected.size === files.length ? 'Deselect all' : 'Select all'}
              </Button>
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
        </Body>

        <Footer>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            css={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid var(--studio-border)',
              background: 'transparent',
              color: 'var(--studio-text-secondary)',
              fontSize: '13px',
              '&:hover': { background: 'var(--studio-bg-hover)' },
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleCommit}
            disabled={commit.isPending || !message.trim() || selected.size === 0}
            css={{
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'var(--studio-accent)',
              color: 'var(--studio-accent-fg)',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              '&:hover': { opacity: 0.85 },
              '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
            }}
          >
            {commit.isPending ? 'Committing...' : 'Commit'}
          </Button>
        </Footer>
      </Dialog>
    </Overlay>
  )
}
