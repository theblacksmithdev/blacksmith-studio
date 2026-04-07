import { useState } from 'react'
import { Box, Flex, Text, VStack, IconButton } from '@chakra-ui/react'
import { Plus, Pencil, Trash2, Wand2 } from 'lucide-react'
import { useSkills } from '@/hooks/use-skills'
import { SkillsLibraryModal, SkillEditorModal } from '../skills-library'
import type { SkillEntry } from '@/api/modules/skills'

type ModalState =
  | null
  | { type: 'library' }
  | { type: 'edit'; skill: SkillEntry }

export function SkillsSettings() {
  const { skills, add, update, remove } = useSkills()
  const [modal, setModal] = useState<ModalState>(null)

  const skillNames = new Set(skills.map((s) => s.name))

  const handleAdd = async (name: string, description: string, content: string) => {
    await add({ name, description, content })
    setModal(null)
  }

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
          onClick={() => setModal({ type: 'library' })}
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
            onClick={() => setModal({ type: 'library' })}
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
                  onClick={() => remove(skill.name)}
                  css={{
                    color: 'var(--studio-text-muted)', borderRadius: '6px',
                    '&:hover': { background: 'rgba(239,68,68,0.08)', color: 'var(--studio-error)' },
                  }}
                >
                  <Trash2 size={13} />
                </IconButton>
              </Flex>
            </Flex>
          ))}
        </VStack>
      )}

      {/* Modals */}
      {modal?.type === 'library' && (
        <SkillsLibraryModal
          existingNames={skillNames}
          onAdd={handleAdd}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'edit' && (
        <SkillEditorModal
          skill={modal.skill}
          onSave={handleUpdate}
          onClose={() => setModal(null)}
        />
      )}
    </VStack>
  )
}
