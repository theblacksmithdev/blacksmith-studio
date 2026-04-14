import { useState } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Wand2, Code2, FileText, Pencil, Eye } from 'lucide-react'
import Editor from '@monaco-editor/react'
import type { SkillEntry } from '@/api/modules/skills'
import { Drawer, Button, Text, Badge } from '@/components/shared/ui'
import { MarkdownRenderer } from '@/components/shared/markdown-renderer'
import { useThemeMode } from '@/hooks/use-theme-mode'

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

interface SkillEditorModalProps {
  skill?: SkillEntry
  onSave: (name: string, description: string, content: string) => void
  onClose: () => void
}

export function SkillEditorModal({ skill, onSave, onClose }: SkillEditorModalProps) {
  const isEdit = !!skill
  const [editingContent, setEditingContent] = useState(!isEdit)
  const { mode: themeMode } = useThemeMode()

  const {
    register,
    control,
    handleSubmit,
    watch,
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

  const currentContent = watch('content')
  const currentName = watch('name')

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
      noPadding
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
      <Flex direction="column" gap="20px" css={{ height: '100%', padding: '20px 24px 0' }}>
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
            <FieldHint>Invoked as <Badge variant="default" size="sm">/{currentName || 'skill-name'}</Badge></FieldHint>
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

        {/* Instructions — edit/preview toggle */}
        <Flex direction="column" css={{ flex: 1, minHeight: 0 }}>
          <Flex align="center" justify="space-between" css={{ marginBottom: '6px' }}>
            <FieldLabel style={{ marginBottom: 0 }}>
              <Wand2 size={12} /> Instructions
              <Text css={{ fontSize: '11px', fontWeight: 400, color: 'var(--studio-text-muted)', textTransform: 'none', letterSpacing: 'normal', marginLeft: '4px' }}>
                Use $ARGUMENTS for user input
              </Text>
            </FieldLabel>
            {isEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingContent(!editingContent)}
                css={{ padding: '2px 8px', fontSize: '12px' }}
              >
                {editingContent ? <><Eye size={11} /> Preview</> : <><Pencil size={11} /> Edit</>}
              </Button>
            )}
          </Flex>

          {editingContent ? (
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <Box css={{ flex: 1, minHeight: 0, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--studio-border)' }}>
                  <Editor
                    height="100%"
                    language="markdown"
                    theme={themeMode === 'dark' ? 'vs-dark' : 'light'}
                    value={field.value}
                    onChange={(v) => field.onChange(v ?? '')}
                    options={{
                      minimap: { enabled: false },
                      lineNumbers: 'off',
                      glyphMargin: false,
                      folding: false,
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      wrappingStrategy: 'advanced',
                      fontSize: 13,
                      fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, monospace",
                      lineHeight: 20,
                      padding: { top: 12, bottom: 12 },
                      renderLineHighlight: 'none',
                      overviewRulerLanes: 0,
                      hideCursorInOverviewRuler: true,
                      overviewRulerBorder: false,
                      scrollbar: { vertical: 'auto', horizontal: 'hidden', verticalScrollbarSize: 6 },
                    }}
                  />
                </Box>
              )}
            />
          ) : (
            <Box css={{
              flex: 1, minHeight: 0, borderRadius: '8px', overflow: 'auto',
              border: '1px solid var(--studio-border)', padding: '16px', background: 'var(--studio-bg-main)',
            }}>
              {currentContent.trim() ? (
                <MarkdownRenderer content={currentContent} />
              ) : (
                <Text css={{ color: 'var(--studio-text-muted)', fontSize: '14px', fontStyle: 'italic' }}>
                  No instructions yet. Click Edit to add content.
                </Text>
              )}
            </Box>
          )}
          {errors.content && <FieldError>{errors.content.message}</FieldError>}
        </Flex>
      </Flex>
    </Drawer>
  )
}
