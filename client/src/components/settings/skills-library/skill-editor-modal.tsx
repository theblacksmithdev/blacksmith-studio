import { useState } from 'react'
import { VStack } from '@chakra-ui/react'
import type { SkillEntry } from '@/api/modules/skills'
import { Drawer } from '@/components/shared/drawer'
import { PrimaryButton, GhostButton, FooterSpacer } from '@/components/shared/modal'
import { FormField, FormInput } from '@/components/shared/form-controls'
import { MarkdownEditor } from '@/components/shared/markdown-editor'

interface SkillEditorModalProps {
  skill?: SkillEntry
  onSave: (name: string, description: string, content: string) => void
  onClose: () => void
}

export function SkillEditorModal({ skill, onSave, onClose }: SkillEditorModalProps) {
  const isEdit = !!skill
  const [name, setName] = useState(skill?.name ?? '')
  const [description, setDescription] = useState(skill?.description ?? '')
  const defaultContent = `# Skill Name

Describe what this skill does and how Claude should execute it.

## Steps

1. First step
2. Second step
3. Third step

$ARGUMENTS`

  const [content, setContent] = useState(skill?.content || defaultContent)

  const canSave = name.trim() && description.trim() && content.trim()

  const handleSave = () => {
    if (!canSave) return
    onSave(name.trim(), description.trim(), content.trim())
  }

  return (
    <Drawer
      title={isEdit ? `Edit Skill: ${skill.name}` : 'Create Skill'}
      onClose={onClose}
      placement="right"
      size="720px"
      footer={
        <>
          <FooterSpacer />
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton disabled={!canSave} onClick={handleSave}>
            {isEdit ? 'Save Changes' : 'Create Skill'}
          </PrimaryButton>
        </>
      }
    >
      <VStack gap={4} align="stretch" css={{ width: '100%', flex: 1, minHeight: 0 }}>
        <FormField label="Skill Name" hint="Lowercase with hyphens (e.g. code-review)">
          <FormInput
            value={name}
            onChange={setName}
            placeholder="e.g. code-review"
            disabled={isEdit}
          />
        </FormField>

        <FormField label="Description">
          <FormInput
            value={description}
            onChange={setDescription}
            placeholder="Short description of what this skill does"
          />
        </FormField>

        <FormField label="Skill Content" hint="Markdown instructions that Claude will follow. Use $ARGUMENTS for user input." fill>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="# Skill Title\n\nInstructions for Claude...\n\n$ARGUMENTS"
            fill
          />
        </FormField>
      </VStack>
    </Drawer>
  )
}
