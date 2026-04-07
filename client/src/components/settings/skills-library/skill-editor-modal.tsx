import { VStack, Input } from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { SkillEntry } from '@/api/modules/skills'
import { Drawer } from '@/components/shared/drawer'
import { PrimaryButton, GhostButton, FooterSpacer } from '@/components/shared/modal'
import { FormField } from '@/components/shared/form-controls'
import { MarkdownEditor } from '@/components/shared/markdown-editor'

const DEFAULT_CONTENT = `# Skill Name

Describe what this skill does and how Claude should execute it.

## Steps

1. First step
2. Second step
3. Third step

$ARGUMENTS`

const schema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  description: z.string().min(1, 'Description is required'),
  content: z.string().min(1, 'Content is required'),
})

type FormData = z.infer<typeof schema>

const inputCss = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid var(--studio-border)',
  background: 'var(--studio-bg-inset)',
  color: 'var(--studio-text-primary)',
  fontSize: '13px',
  '&:focus': { borderColor: 'var(--studio-border-hover)', boxShadow: 'none' },
  '&::placeholder': { color: 'var(--studio-text-muted)' },
}

interface SkillEditorModalProps {
  skill?: SkillEntry
  onSave: (name: string, description: string, content: string) => void
  onClose: () => void
}

export function SkillEditorModal({ skill, onSave, onClose }: SkillEditorModalProps) {
  const isEdit = !!skill

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: skill?.name ?? '',
      description: skill?.description ?? '',
      content: skill?.content || DEFAULT_CONTENT,
    },
  })

  const onSubmit = (data: FormData) => {
    onSave(data.name, data.description, data.content)
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
          <PrimaryButton disabled={!isValid} onClick={handleSubmit(onSubmit)}>
            {isEdit ? 'Save Changes' : 'Create Skill'}
          </PrimaryButton>
        </>
      }
    >
      <VStack gap={4} align="stretch" css={{ width: '100%', flex: 1, minHeight: 0 }}>
        <FormField label="Skill Name" hint="Lowercase with hyphens (e.g. code-review)" error={errors.name?.message}>
          <Input
            {...register('name')}
            placeholder="e.g. code-review"
            disabled={isEdit}
            css={inputCss}
          />
        </FormField>

        <FormField label="Description" error={errors.description?.message}>
          <Input
            {...register('description')}
            placeholder="Short description of what this skill does"
            css={inputCss}
          />
        </FormField>

        <FormField
          label="Skill Content"
          hint="Markdown instructions that Claude will follow. Use $ARGUMENTS for user input."
          error={errors.content?.message}
          fill
        >
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <MarkdownEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="# Skill Title\n\nInstructions for Claude...\n\n$ARGUMENTS"
                fill
              />
            )}
          />
        </FormField>
      </VStack>
    </Drawer>
  )
}
