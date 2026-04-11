import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Flex, Text, VStack, IconButton } from '@chakra-ui/react'
import { Plus, Pencil, Trash2, Wand2, ArrowRight } from 'lucide-react'
import { useSkills } from '@/hooks/use-skills'
import { useProjectStore } from '@/stores/project-store'
import { skillsBrowserPath } from '@/router/paths'
import { SkillEditorModal } from '../skills-library'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import type { SkillEntry } from '@/api/modules/skills'

type ModalState =
  | null
  | { type: 'edit'; skill: SkillEntry }
  | { type: 'delete'; name: string }

export function SkillsSettings() {
  const navigate = useNavigate()
  const pid = useProjectStore((s) => s.activeProject?.id)
  const { skills, update, remove } = useSkills()
  const [modal, setModal] = useState<ModalState>(null)

  const handleUpdate = async (name: string, description: string, content: string) => {
    await update({ name, description, content })
    setModal(null)
  }

  return (
    <VStack gap={0} align="stretch">
      {/* Header */}
      <Flex align="flex-start" css={{ marginBottom: '16px' }}>
        <Box css={{ flex: 1 }}>
          <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em', marginBottom: '4px' }}>
            Claude Skills
          </Text>
          <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)' }}>
            Reusable instructions that teach Claude how to perform tasks in your project.
          </Text>
        </Box>
        <Box
          as="button"
          onClick={() => pid && navigate(skillsBrowserPath(pid))}
          css={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '7px 14px', borderRadius: '8px', border: 'none',
            background: 'var(--studio-accent)', color: 'var(--studio-accent-fg)',
            fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            flexShrink: 0, marginTop: '2px', transition: 'opacity 0.12s ease',
            '&:hover': { opacity: 0.85 },
          }}
        >
          <Plus size={13} /> Add Skill
        </Box>
      </Flex>

      {/* List or empty state */}
      {skills.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          gap={3}
          css={{
            padding: '40px 20px', textAlign: 'center',
            borderRadius: '10px', border: '1px solid var(--studio-border)',
            background: 'var(--studio-bg-sidebar)',
          }}
        >
          <Box css={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'var(--studio-bg-surface)', border: '1px solid var(--studio-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--studio-text-muted)',
          }}>
            <Wand2 size={20} />
          </Box>
          <Text css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>
            No skills configured
          </Text>
          <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', maxWidth: '300px' }}>
            Skills are reusable prompts that Claude can invoke with /skill-name.
          </Text>
          <Box
            as="button"
            onClick={() => pid && navigate(skillsBrowserPath(pid))}
            css={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '8px 16px', borderRadius: '8px',
              border: '1px solid var(--studio-border)', background: 'var(--studio-bg-main)',
              color: 'var(--studio-text-secondary)', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit', marginTop: '4px',
              '&:hover': { background: 'var(--studio-bg-surface)', borderColor: 'var(--studio-border-hover)', color: 'var(--studio-text-primary)' },
            }}
          >
            <Plus size={13} /> Browse Library
          </Box>
        </Flex>
      ) : (
        <VStack
          gap={0}
          align="stretch"
          css={{
            borderRadius: '10px', border: '1px solid var(--studio-border)',
            overflow: 'hidden', background: 'var(--studio-bg-sidebar)',
          }}
        >
          {skills.map((skill) => (
            <Flex
              key={skill.name}
              align="center"
              gap={3}
              css={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--studio-border)',
                transition: 'background 0.1s ease',
                '&:last-child': { borderBottom: 'none' },
                '&:hover': {
                  background: 'var(--studio-bg-surface)',
                  '& .skill-actions': { opacity: 1 },
                },
              }}
            >
              <Box css={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'var(--studio-bg-surface)', border: '1px solid var(--studio-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--studio-text-muted)', flexShrink: 0,
              }}>
                <Wand2 size={14} />
              </Box>

              <Box css={{ flex: 1, minWidth: 0 }}>
                <Flex align="center" gap={2}>
                  <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>
                    {skill.name}
                  </Text>
                  <Text css={{
                    fontSize: '10px', fontWeight: 500, color: 'var(--studio-text-muted)',
                    padding: '1px 6px', borderRadius: '4px',
                    background: 'var(--studio-bg-surface)', border: '1px solid var(--studio-border)',
                    fontFamily: "'SF Mono', monospace",
                  }}>
                    /{skill.name}
                  </Text>
                </Flex>
                <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', marginTop: '2px' }}>
                  {skill.description}
                </Text>
              </Box>

              <Flex
                gap={1}
                className="skill-actions"
                css={{ opacity: 0, transition: 'opacity 0.1s ease', flexShrink: 0 }}
              >
                <IconButton
                  aria-label="Edit"
                  size="xs"
                  variant="ghost"
                  onClick={() => setModal({ type: 'edit', skill })}
                  css={{
                    color: 'var(--studio-text-muted)', borderRadius: '6px',
                    '&:hover': { background: 'var(--studio-bg-hover)', color: 'var(--studio-text-primary)' },
                  }}
                >
                  <Pencil size={13} />
                </IconButton>
                <IconButton
                  aria-label="Remove"
                  size="xs"
                  variant="ghost"
                  onClick={() => setModal({ type: 'delete', name: skill.name })}
                  css={{
                    color: 'var(--studio-text-muted)', borderRadius: '6px',
                    '&:hover': { background: 'var(--studio-error-subtle)', color: 'var(--studio-error)' },
                  }}
                >
                  <Trash2 size={13} />
                </IconButton>
              </Flex>
            </Flex>
          ))}
        </VStack>
      )}

      {/* Browse full library */}
      <Flex
        as="button"
        align="center"
        gap={2}
        onClick={() => pid && navigate(skillsBrowserPath(pid))}
        css={{
          marginTop: '12px',
          padding: '8px 0',
          border: 'none',
          background: 'transparent',
          color: 'var(--studio-text-muted)',
          fontSize: '13px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'color 0.12s ease',
          '&:hover': { color: 'var(--studio-text-primary)' },
        }}
      >
        Browse full library
        <ArrowRight size={13} />
      </Flex>

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
          title="Remove Skill"
          message={`Remove "${modal.name}"?`}
          description="This will delete the skill file from your project. You can re-add it later from the library."
          confirmLabel="Remove"
          onConfirm={async () => { await remove(modal.name); setModal(null) }}
          onCancel={() => setModal(null)}
        />
      )}
    </VStack>
  )
}
