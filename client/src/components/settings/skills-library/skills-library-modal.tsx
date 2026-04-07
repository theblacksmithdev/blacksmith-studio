import { useState } from 'react'
import { Box, Flex, HStack, Input, Button, Text } from '@chakra-ui/react'
import { Search, Plus } from 'lucide-react'
import type { SkillEntry } from '@/api/modules/skills'
import { Modal, SecondaryButton } from '@/components/shared/modal'
import { SkillEditorModal } from './skill-editor-modal'
import { SKILL_PRESETS, SKILL_CATEGORIES, type SkillPreset } from './presets'

interface SkillsLibraryModalProps {
  existingNames: Set<string>
  onAdd: (name: string, description: string, content: string) => void
  onClose: () => void
}

export function SkillsLibraryModal({ existingNames, onAdd, onClose }: SkillsLibraryModalProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [configuring, setConfiguring] = useState<SkillPreset | null>(null)
  const [showCustom, setShowCustom] = useState(false)

  const filtered = SKILL_PRESETS.filter((p) => {
    if (category !== 'all' && p.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      return p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.name.includes(q)
    }
    return true
  })

  if (configuring) {
    const presetEntry: SkillEntry = {
      name: configuring.name,
      description: configuring.description,
      content: configuring.content,
    }
    return (
      <SkillEditorModal
        skill={presetEntry}
        onSave={(name, desc, content) => { onAdd(name, desc, content); setConfiguring(null) }}
        onClose={() => setConfiguring(null)}
      />
    )
  }

  if (showCustom) {
    return (
      <SkillEditorModal
        onSave={(name, desc, content) => { onAdd(name, desc, content); setShowCustom(false) }}
        onClose={() => setShowCustom(false)}
      />
    )
  }

  return (
    <Modal
      title="Add Skill"
      onClose={onClose}
      width="560px"
      footer={
        <SecondaryButton onClick={() => setShowCustom(true)}>
          <Plus size={13} />
          Custom Skill
        </SecondaryButton>
      }
    >
      <Box css={{ margin: '-20px', display: 'flex', flexDirection: 'column' }}>
        <Flex
          align="center"
          gap={2}
          css={{ padding: '10px 20px', borderBottom: '1px solid var(--studio-border)' }}
        >
          <Search size={14} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
            autoFocus
            css={{ fontSize: '13px', color: 'var(--studio-text-primary)', border: 'none', outline: 'none', background: 'transparent', '&:focus': { boxShadow: 'none' }, '&::placeholder': { color: 'var(--studio-text-muted)' } }}
          />
        </Flex>

        <HStack
          gap={1}
          css={{ padding: '10px 20px', borderBottom: '1px solid var(--studio-border)', flexWrap: 'wrap' }}
        >
          {SKILL_CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              size="xs"
              variant="ghost"
              onClick={() => setCategory(cat.id)}
              css={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: category === cat.id ? 500 : 400,
                background: category === cat.id ? 'var(--studio-bg-hover)' : 'transparent',
                color: category === cat.id ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)',
                '&:hover': { color: 'var(--studio-text-secondary)' },
              }}
            >
              {cat.label}
            </Button>
          ))}
        </HStack>

        <Box css={{ overflowY: 'auto', padding: '8px', maxHeight: '400px' }}>
          {filtered.map((preset) => {
            const added = existingNames.has(preset.name)
            const Icon = preset.icon
            return (
              <Box
                key={preset.name}
                as="button"
                onClick={() => !added && setConfiguring(preset)}
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  cursor: added ? 'default' : 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  transition: 'all 0.1s ease',
                  opacity: added ? 0.5 : 1,
                  '&:hover': added ? {} : { background: 'var(--studio-bg-hover)' },
                }}
              >
                <Box css={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'var(--studio-bg-sidebar)', border: '1px solid var(--studio-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--studio-text-muted)', flexShrink: 0,
                }}>
                  <Icon size={16} />
                </Box>
                <Box css={{ flex: 1, minWidth: 0 }}>
                  <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>
                    {preset.label}
                  </Text>
                  <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', marginTop: '1px' }}>
                    {preset.description}
                  </Text>
                </Box>
                {added && (
                  <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', flexShrink: 0 }}>
                    Added
                  </Text>
                )}
              </Box>
            )
          })}
          {filtered.length === 0 && (
            <Text css={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--studio-text-tertiary)' }}>
              No skills match your search.
            </Text>
          )}
        </Box>
      </Box>
    </Modal>
  )
}
