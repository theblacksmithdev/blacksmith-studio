import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Flex, Text, HStack, Input, Button, IconButton, SimpleGrid } from '@chakra-ui/react'
import { Search, Plus, ArrowLeft, Check, Wand2, Sparkles } from 'lucide-react'
import { useSkills } from '@/hooks/use-skills'
import { useProjectStore } from '@/stores/project-store'
import { settingsPath } from '@/router/paths'
import { SKILL_PRESETS, SKILL_CATEGORIES, type SkillPreset } from '@/components/settings/skills-library/presets'
import { SkillEditorModal } from '@/components/settings/skills-library'
import type { SkillEntry } from '@/api/modules/skills'

export default function SkillsBrowserPage() {
  const navigate = useNavigate()
  const { skills, add } = useSkills()
  const pid = useProjectStore((s) => s.activeProject?.id)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [editor, setEditor] = useState<{ preset?: SkillPreset; custom?: boolean } | null>(null)

  const installedNames = new Set(skills.map((s) => s.name))
  const installedCount = SKILL_PRESETS.filter((p) => installedNames.has(p.name)).length

  const filtered = SKILL_PRESETS.filter((p) => {
    if (category !== 'all' && p.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      return p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.name.includes(q)
    }
    return true
  })

  const handleAdd = async (name: string, description: string, content: string) => {
    await add({ name, description, content })
    setEditor(null)
  }

  if (editor) {
    const skill: SkillEntry | undefined = editor.preset
      ? { name: editor.preset.name, description: editor.preset.description, content: editor.preset.content }
      : undefined
    return (
      <SkillEditorModal
        skill={skill}
        onSave={handleAdd}
        onClose={() => setEditor(null)}
      />
    )
  }

  return (
    <Flex direction="column" css={{ height: '100%', background: 'var(--studio-bg-main)' }}>

      {/* Hero */}
      <Box css={{ flexShrink: 0 }}>
        <Flex
          align="center"
          gap={3}
          css={{ padding: '12px 24px 0' }}
        >
          <IconButton
            aria-label="Back"
            size="sm"
            variant="ghost"
            onClick={() => pid && navigate(settingsPath(pid))}
            css={{
              color: 'var(--studio-text-muted)',
              borderRadius: '8px',
              '&:hover': { background: 'var(--studio-bg-hover)', color: 'var(--studio-text-primary)' },
            }}
          >
            <ArrowLeft size={16} />
          </IconButton>
          <Box css={{ flex: 1 }} />
          <Button
            size="sm"
            onClick={() => setEditor({ custom: true })}
            css={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid var(--studio-border)',
              background: 'var(--studio-bg-surface)',
              color: 'var(--studio-text-secondary)',
              fontSize: '13px',
              fontWeight: 500,
              '&:hover': {
                background: 'var(--studio-bg-hover)',
                borderColor: 'var(--studio-border-hover)',
                color: 'var(--studio-text-primary)',
              },
            }}
          >
            <Plus size={14} />
            Create Custom Skill
          </Button>
        </Flex>

        <Flex direction="column" align="center" css={{ padding: '24px 24px 28px', textAlign: 'center' }}>
          <Box css={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'var(--studio-accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
          }}>
            <Sparkles size={22} color="var(--studio-accent-fg)" />
          </Box>
          <Text css={{ fontSize: '22px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.03em', marginBottom: '6px' }}>
            Skills Library
          </Text>
          <Text css={{ fontSize: '14px', color: 'var(--studio-text-tertiary)', maxWidth: '420px', lineHeight: 1.5 }}>
            Extend Claude with reusable instructions. Browse skills or create your own.
          </Text>

          {/* Stats */}
          <HStack gap={4} css={{ marginTop: '16px' }}>
            <Flex align="center" gap={2}>
              <Text css={{ fontSize: '20px', fontWeight: 600, color: 'var(--studio-text-primary)' }}>
                {SKILL_PRESETS.length}
              </Text>
              <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)' }}>available</Text>
            </Flex>
            <Box css={{ width: '1px', height: '16px', background: 'var(--studio-border)' }} />
            <Flex align="center" gap={2}>
              <Text css={{ fontSize: '20px', fontWeight: 600, color: 'var(--studio-text-primary)' }}>
                {installedCount}
              </Text>
              <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)' }}>installed</Text>
            </Flex>
          </HStack>
        </Flex>

        {/* Search */}
        <Box css={{ padding: '0 24px', maxWidth: '560px', margin: '0 auto', width: '100%' }}>
          <Flex
            align="center"
            gap={2}
            css={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid var(--studio-border)',
              background: 'var(--studio-bg-sidebar)',
              transition: 'border-color 0.12s ease',
              '&:focus-within': { borderColor: 'var(--studio-border-hover)' },
            }}
          >
            <Search size={15} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills..."
              css={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: '14px', color: 'var(--studio-text-primary)',
                '&:focus': { boxShadow: 'none' },
                '&::placeholder': { color: 'var(--studio-text-muted)' },
              }}
            />
            {search && (
              <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)', flexShrink: 0 }}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </Text>
            )}
          </Flex>
        </Box>

        {/* Categories */}
        <Flex justify="center" css={{ padding: '16px 24px 0' }}>
          <HStack gap={1} css={{ flexWrap: 'wrap' }}>
            {SKILL_CATEGORIES.map((cat) => {
              const isActive = category === cat.id
              const count = cat.id === 'all'
                ? SKILL_PRESETS.length
                : SKILL_PRESETS.filter((p) => p.category === cat.id).length
              return (
                <Button
                  key={cat.id}
                  size="sm"
                  variant="ghost"
                  onClick={() => setCategory(cat.id)}
                  css={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: isActive ? 500 : 400,
                    background: isActive ? 'var(--studio-accent)' : 'transparent',
                    color: isActive ? 'var(--studio-accent-fg)' : 'var(--studio-text-muted)',
                    '&:hover': isActive ? { opacity: 0.85 } : {
                      color: 'var(--studio-text-secondary)',
                      background: 'var(--studio-bg-surface)',
                    },
                  }}
                >
                  {cat.label}
                  <Text as="span" css={{
                    fontSize: '11px',
                    marginLeft: '4px',
                    opacity: 0.6,
                  }}>
                    {count}
                  </Text>
                </Button>
              )
            })}
          </HStack>
        </Flex>
      </Box>

      {/* Grid */}
      <Box css={{ flex: 1, overflowY: 'auto', padding: '20px 24px 32px' }}>
        {filtered.length === 0 ? (
          <Flex direction="column" align="center" gap={4} css={{ padding: '60px 20px', textAlign: 'center' }}>
            <Box css={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'var(--studio-bg-surface)', border: '1px solid var(--studio-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--studio-text-muted)',
            }}>
              <Search size={22} />
            </Box>
            <Box>
              <Text css={{ fontSize: '15px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '4px' }}>
                No skills found
              </Text>
              <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)' }}>
                Try a different search or create a custom skill.
              </Text>
            </Box>
            <Button
              size="sm"
              onClick={() => setEditor({ custom: true })}
              css={{
                padding: '8px 16px', borderRadius: '10px',
                background: 'var(--studio-accent)', color: 'var(--studio-accent-fg)',
                fontSize: '13px', fontWeight: 500, border: 'none',
                '&:hover': { opacity: 0.85 },
              }}
            >
              <Plus size={13} />
              Create Skill
            </Button>
          </Flex>
        ) : (
          <SimpleGrid columns={3} gap={4} css={{ maxWidth: '960px', margin: '0 auto', minChildWidth: '260px' }}>
            {filtered.map((preset) => {
              const installed = installedNames.has(preset.name)
              const Icon = preset.icon
              return (
                <Flex
                  key={preset.name}
                  direction="column"
                  as="button"
                  onClick={() => !installed && setEditor({ preset })}
                  css={{
                    padding: '20px',
                    borderRadius: '14px',
                    border: '1px solid var(--studio-border)',
                    background: 'var(--studio-bg-sidebar)',
                    cursor: installed ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    position: 'relative',
                    '&:hover': installed ? {} : {
                      borderColor: 'var(--studio-border-hover)',
                      background: 'var(--studio-bg-surface)',
                      transform: 'translateY(-2px)',
                      boxShadow: 'var(--studio-shadow)',
                    },
                  }}
                >
                  {/* Installed badge */}
                  {installed && (
                    <Flex
                      align="center"
                      gap={1}
                      css={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'var(--studio-bg-hover)',
                        fontSize: '10px',
                        fontWeight: 500,
                        color: 'var(--studio-text-muted)',
                      }}
                    >
                      <Check size={10} />
                      Installed
                    </Flex>
                  )}

                  {/* Icon + Name */}
                  <Flex align="center" gap={3} css={{ marginBottom: '12px' }}>
                    <Box css={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: 'var(--studio-bg-main)', border: '1px solid var(--studio-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: installed ? 'var(--studio-text-muted)' : 'var(--studio-text-secondary)',
                      flexShrink: 0,
                      transition: 'color 0.12s ease',
                    }}>
                      <Icon size={18} />
                    </Box>
                    <Box>
                      <Text css={{
                        fontSize: '14px', fontWeight: 600,
                        color: installed ? 'var(--studio-text-tertiary)' : 'var(--studio-text-primary)',
                        letterSpacing: '-0.01em',
                      }}>
                        {preset.label}
                      </Text>
                      <Text css={{
                        fontSize: '11px',
                        color: 'var(--studio-text-muted)',
                        fontFamily: "'SF Mono', monospace",
                        marginTop: '1px',
                      }}>
                        /{preset.name}
                      </Text>
                    </Box>
                  </Flex>

                  {/* Description */}
                  <Text css={{
                    fontSize: '13px',
                    color: installed ? 'var(--studio-text-muted)' : 'var(--studio-text-tertiary)',
                    lineHeight: 1.6,
                    flex: 1,
                  }}>
                    {preset.description}
                  </Text>

                  {/* Footer */}
                  <Flex
                    align="center"
                    justify="space-between"
                    css={{
                      marginTop: '16px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--studio-border)',
                    }}
                  >
                    <Text css={{
                      fontSize: '11px', fontWeight: 500,
                      color: 'var(--studio-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {preset.category}
                    </Text>
                    {!installed && (
                      <Text css={{
                        fontSize: '11px', fontWeight: 500,
                        color: 'var(--studio-accent)',
                      }}>
                        Add to project →
                      </Text>
                    )}
                  </Flex>
                </Flex>
              )
            })}
          </SimpleGrid>
        )}
      </Box>
    </Flex>
  )
}
