import { Flex } from '@chakra-ui/react'
import { useActiveProjectId } from '@/api/hooks/_shared'
import { skillsBrowserPath } from '@/router/paths'
import { SkillEditorModal } from '@/pages/skills/components'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useSkillsActions } from './hooks/use-skills-actions'
import { SkillsHeader } from './components/skills-header'
import { SkillsList } from './components/skills-list'
import { SkillsEmptyState } from './components/skills-empty-state'

export function SkillsSettings() {
  const pid = useActiveProjectId()
  const { skills, modal, setModal, handleUpdate, handleRemove } = useSkillsActions()

  const browsePath = skillsBrowserPath(pid!)

  return (
    <Flex direction="column" gap="14px">
      <SkillsHeader count={skills.length} addPath={browsePath} />

      {skills.length === 0 ? (
        <SkillsEmptyState browsePath={browsePath} />
      ) : (
        <SkillsList
          skills={skills}
          browsePath={browsePath}
          onEdit={(skill) => setModal({ type: 'edit', skill })}
          onDelete={(name) => setModal({ type: 'delete', name })}
        />
      )}

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
