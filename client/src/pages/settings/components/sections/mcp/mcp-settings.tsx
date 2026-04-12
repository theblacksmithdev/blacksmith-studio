import { Flex, Box } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRight } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { mcpBrowserPath } from '@/router/paths'
import { McpServerModal } from '@/pages/mcp/components/mcp-server-modal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Text, Badge } from '@/components/shared/ui'
import { useMcpActions } from './use-mcp-actions'
import { McpServerRow } from './mcp-server-row'
import { McpEmptyState } from './mcp-empty-state'

/* ── Styled ── */

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 8px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  transition: opacity 0.12s ease;
  &:hover { opacity: 0.85; }
`

const List = styled.div`
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  overflow: hidden;
  background: var(--studio-bg-sidebar);
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
`

const FooterLink = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 0;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.12s ease;
  &:hover { color: var(--studio-text-primary); }
`

const CountLabel = styled.span`
  font-size: 12px;
  color: var(--studio-text-muted);
`

/* ── Component ── */

export function McpSettings() {
  const navigate = useNavigate()
  const pid = useProjectStore((s) => s.activeProject?.id)
  const {
    servers, modal, setModal,
    testing, testResults, clearTestResult,
    handleUpdate, handleRemove, handleTest,
    toggle,
  } = useMcpActions()

  const browseMcp = () => pid && navigate(mcpBrowserPath(pid))
  const enabledCount = servers.filter((s) => s.enabled).length

  return (
    <Flex direction="column" gap="14px">
      {/* Header */}
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Flex align="center" gap="8px" css={{ marginBottom: '4px' }}>
            <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
              MCP Servers
            </Text>
            {servers.length > 0 && (
              <Badge variant="default" size="sm">{enabledCount}/{servers.length} active</Badge>
            )}
          </Flex>
          <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
            External tools and data sources that extend Claude's capabilities through the Model Context Protocol.
          </Text>
        </Box>
        {servers.length > 0 && (
          <AddBtn onClick={browseMcp}>
            <Plus size={13} /> Add
          </AddBtn>
        )}
      </Flex>

      {/* Content */}
      {servers.length === 0 ? (
        <McpEmptyState onBrowse={browseMcp} />
      ) : (
        <>
          <List>
            {servers.map((entry) => (
              <McpServerRow
                key={entry.name}
                entry={entry}
                testing={testing === entry.name}
                testResult={testResults[entry.name]}
                onTest={() => handleTest(entry.name)}
                onEdit={() => setModal({ type: 'edit', server: entry })}
                onDelete={() => setModal({ type: 'delete', name: entry.name })}
                onToggle={() => toggle({ name: entry.name, enabled: !entry.enabled })}
                onClearTest={() => clearTestResult(entry.name)}
              />
            ))}
          </List>
          <Footer>
            <CountLabel>
              {enabledCount} of {servers.length} server{servers.length !== 1 ? 's' : ''} enabled
            </CountLabel>
            <FooterLink onClick={browseMcp}>
              Browse library <ArrowRight size={11} />
            </FooterLink>
          </Footer>
        </>
      )}

      {/* Modals */}
      {modal?.type === 'edit' && (
        <McpServerModal
          server={modal.server}
          onSave={handleUpdate}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'delete' && (
        <ConfirmDialog
          message={`Remove "${modal.name}"?`}
          description="This will remove the server from your project's MCP configuration."
          confirmLabel="Remove"
          variant="danger"
          onConfirm={handleRemove}
          onCancel={() => setModal(null)}
        />
      )}
    </Flex>
  )
}
