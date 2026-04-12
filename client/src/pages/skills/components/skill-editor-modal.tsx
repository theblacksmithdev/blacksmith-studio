import { Flex, Box } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Wand2, Code2, FileText } from 'lucide-react'
import type { SkillEntry } from '@/api/modules/skills'
import { Drawer, Button, Text, Badge } from '@/components/shared/ui'
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

/* ── Styled ── */

const FieldLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--studio-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
`

const StyledInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.hasError ? 'var(--studio-error)' : 'var(--studio-border)')};
  background: var(--studio-bg-surface);
  color: var(--studio-text-primary);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.12s ease;

  &::placeholder { color: var(--studio-text-muted); }
  &:hover:not(:disabled) { border-color: var(--studio-border-hover); }
  &:focus { border-color: var(--studio-border-hover); box-shadow: var(--studio-ring-focus); }
  &:disabled { opacity: 0.5; }
`

const FieldError = styled.span`
  font-size: 12px;
  color: var(--studio-error);
  margin-top: 4px;
  display: block;
`

const FieldHint = styled.span`
  font-size: 12px;
  color: var(--studio-text-muted);
  margin-top: 4px;
  display: block;
`

/* ── Component ── */

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
      title={isEdit ? `Edit: ${skill.name}` : 'Create Skill'}
      subtitle={isEdit ? 'Modify the skill instructions' : 'Define a reusable prompt for Claude'}
      onClose={onClose}
      placement="end"
      size="lg"
      headerExtra={
        <Flex css={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'var(--studio-bg-surface)', border: '1px solid var(--studio-border)',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          color: 'var(--studio-text-muted)',
        }}>
          <Wand2 size={14} />
        </Flex>
      }
      footer={
        <Flex align="center" gap="8px" css={{ width: '100%' }}>
          <Flex flex={1} />
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" disabled={!isValid} onClick={handleSubmit(onSubmit)}>
            {isEdit ? 'Save Changes' : 'Create Skill'}
          </Button>
        </Flex>
      }
    >
      <Flex direction="column" gap="20px" css={{ height: '100%' }}>
        {/* Name */}
        <Box>
          <FieldLabel><Code2 size={12} /> Skill Name</FieldLabel>
          <StyledInput
            {...register('name')}
            placeholder="e.g. code-review"
            disabled={isEdit}
            hasError={!!errors.name}
          />
          {errors.name ? (
            <FieldError>{errors.name.message}</FieldError>
          ) : (
            <FieldHint>Lowercase with hyphens — invoked as <Badge variant="default" size="sm">/{skill?.name || 'skill-name'}</Badge></FieldHint>
          )}
        </Box>

        {/* Description */}
        <Box>
          <FieldLabel><FileText size={12} /> Description</FieldLabel>
          <StyledInput
            {...register('description')}
            placeholder="Short description of what this skill does"
            hasError={!!errors.description}
          />
          {errors.description && <FieldError>{errors.description.message}</FieldError>}
        </Box>

        {/* Content */}
        <Flex direction="column" css={{ flex: 1, minHeight: 0 }}>
          <FieldLabel>
            <Wand2 size={12} /> Instructions
            <Text css={{ fontSize: '11px', fontWeight: 400, color: 'var(--studio-text-muted)', textTransform: 'none', letterSpacing: 'normal', marginLeft: '4px' }}>
              Use $ARGUMENTS for user input
            </Text>
          </FieldLabel>
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
          {errors.content && <FieldError>{errors.content.message}</FieldError>}
        </Flex>
      </Flex>
    </Drawer>
  )
}
