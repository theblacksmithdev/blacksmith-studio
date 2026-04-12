import { Flex, Box } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRight } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { skillsBrowserPath } from '@/router/paths'
import { SkillEditorModal } from '@/pages/skills/components'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Text, Badge } from '@/components/shared/ui'
import { useSkillsActions } from './use-skills-actions'
import { SkillRow } from './skill-row'
import { SkillsEmptyState } from './skills-empty-state'

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

export function SkillsSettings() {
  const navigate = useNavigate()
  const pid = useProjectStore((s) => s.activeProject?.id)
  const { skills, modal, setModal, handleUpdate, handleRemove } = useSkillsActions()

  const browseSkills = () => pid && navigate(skillsBrowserPath(pid))

  return (
    <Flex direction="column" gap="14px">
      {/* Header */}
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Flex align="center" gap="8px" css={{ marginBottom: '4px' }}>
            <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
              Claude Skills
            </Text>
            {skills.length > 0 && <Badge variant="default" size="sm">{skills.length}</Badge>}
          </Flex>
          <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
            Reusable prompts that Claude can invoke with slash commands in your project.
          </Text>
        </Box>
        {skills.length > 0 && (
          <AddBtn onClick={browseSkills}>
            <Plus size={13} /> Add
          </AddBtn>
        )}
      </Flex>

      {/* Content */}
      {skills.length === 0 ? (
        <SkillsEmptyState onBrowse={browseSkills} />
      ) : (
        <>
          <List>
            {skills.map((skill) => (
              <SkillRow
                key={skill.name}
                skill={skill}
                onEdit={() => setModal({ type: 'edit', skill })}
                onDelete={() => setModal({ type: 'delete', name: skill.name })}
              />
            ))}
          </List>
          <FooterLink onClick={browseSkills}>
            Browse library <ArrowRight size={11} />
          </FooterLink>
        </>
      )}

      {/* Modals */}
      {modal?.type === 'edit' && (
        <SkillEditorModal
          skill={modal.skill}
          onSave={handleUpdate}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'delete' && (
        <ConfirmDialog
          message={`Remove "${modal.name}"?`}
          description="This will delete the skill from your project. You can re-add it from the library."
          confirmLabel="Remove"
          variant="danger"
          onConfirm={handleRemove}
          onCancel={() => setModal(null)}
        />
      )}
    </Flex>
  )
}
