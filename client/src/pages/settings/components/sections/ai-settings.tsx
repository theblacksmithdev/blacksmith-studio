import { Flex, Box } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { Sparkles, Zap, Feather, Terminal, Shield, DollarSign, HardDrive, Download } from 'lucide-react'
import { SettingsSection } from '../settings-section'
import { SettingRow } from '../setting-row'
import { SettingInput } from '../setting-input'
import { SettingTextarea } from '../setting-textarea'
import { SegmentedControl } from '../segmented-control'
import { useSettings } from '@/hooks/use-settings'
import { Text, Badge } from '@/components/shared/ui'

/* ── Provider Card ── */

const ProviderCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-bottom: 1px solid var(--studio-border);

  &:last-child { border-bottom: none; }
`

const ProviderIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--studio-text-secondary);
`

const StatusDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--studio-green);
  flex-shrink: 0;
`

/* ── Model Cards ── */

const ModelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
`

const ModelCard = styled.button<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  border-radius: 9px;
  border: 1.5px solid ${(p) => (p.active ? 'var(--studio-accent)' : 'var(--studio-border)')};
  background: ${(p) => (p.active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)')};
  color: ${(p) => (p.active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-secondary);
  }

  & svg {
    width: 18px;
    height: 18px;
  }
`

const ModelName = styled.span<{ active: boolean }>`
  font-size: 13px;
  font-weight: ${(p) => (p.active ? 600 : 500)};
`

const ModelDesc = styled.span`
  font-size: 11px;
  color: var(--studio-text-muted);
`

/* ── Options ── */

const MODELS = [
  { value: 'sonnet', label: 'Sonnet', desc: 'Fast & capable', icon: <Zap /> },
  { value: 'opus', label: 'Opus', desc: 'Most intelligent', icon: <Sparkles /> },
  { value: 'haiku', label: 'Haiku', desc: 'Fastest responses', icon: <Feather /> },
] as const

const PERMISSION_OPTIONS = [
  { value: 'bypassPermissions', label: 'Auto-approve' },
  { value: 'auto', label: 'Smart' },
  { value: 'default', label: 'Ask each time' },
] as const

/* ── Component ── */

export function AiSettings() {
  const s = useSettings()

  return (
    <Flex direction="column" gap="28px">
      {/* Provider */}
      <SettingsSection
        title="Provider"
        description="The AI provider powering code generation and chat."
      >
        <ProviderCard>
          <ProviderIcon>
            <Terminal size={18} />
          </ProviderIcon>
          <Box css={{ flex: 1, minWidth: 0 }}>
            <Flex align="center" gap="8px">
              <Text css={{ fontSize: '14px', fontWeight: 600, color: 'var(--studio-text-primary)' }}>
                Claude Code CLI
              </Text>
              <Badge variant="default" size="sm">Installed</Badge>
            </Flex>
            <Flex align="center" gap="5px" css={{ marginTop: '3px' }}>
              <StatusDot />
              <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)' }}>
                Active — uses your local Claude Code installation
              </Text>
            </Flex>
          </Box>
        </ProviderCard>
      </SettingsSection>

      {/* Local Models */}
      <SettingsSection
        title="Local Models"
        description="Download and run open-source LLMs on your machine. Code with AI for free, forever — no API keys, no cloud, fully private."
      >
        <Flex
          direction="column"
          align="center"
          gap="12px"
          css={{ padding: '28px 20px', textAlign: 'center' }}
        >
          <Flex
            align="center"
            justify="center"
            css={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--studio-bg-surface)',
              border: '1px solid var(--studio-border)',
              color: 'var(--studio-text-muted)',
            }}
          >
            <HardDrive size={22} />
          </Flex>
          <Flex direction="column" gap="4px" align="center">
            <Flex align="center" gap="8px">
              <Text css={{ fontSize: '14px', fontWeight: 600, color: 'var(--studio-text-primary)' }}>
                On-device AI
              </Text>
              <Badge variant="default" size="sm">Coming Soon</Badge>
            </Flex>
            <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5, maxWidth: '380px' }}>
              Download models like Llama, Codestral, and Qwen directly to your machine. Run them locally with full tool access — no internet required.
            </Text>
          </Flex>
          <Flex
            align="center"
            gap="6px"
            css={{
              marginTop: '4px',
              padding: '7px 16px',
              borderRadius: '8px',
              background: 'var(--studio-bg-surface)',
              border: '1px solid var(--studio-border)',
              color: 'var(--studio-text-muted)',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            <Download size={12} />
            Model downloads will appear here
          </Flex>
        </Flex>
      </SettingsSection>

      {/* Model */}
      <SettingsSection
        title="Model"
        description="Choose which Claude model to use. Each has different speed and capability trade-offs."
      >
        <Box css={{ padding: '14px 16px' }}>
          <ModelGrid>
            {MODELS.map((m) => (
              <ModelCard
                key={m.value}
                active={s.model === m.value}
                onClick={() => s.set('ai.model', m.value)}
              >
                {m.icon}
                <ModelName active={s.model === m.value}>{m.label}</ModelName>
                <ModelDesc>{m.desc}</ModelDesc>
              </ModelCard>
            ))}
          </ModelGrid>
        </Box>
      </SettingsSection>

      {/* Behavior */}
      <SettingsSection
        title="Behavior"
        description="Control how Claude interacts with your project."
      >
        <SettingRow
          label="Permissions"
          description={<Flex align="center" gap="4px"><Shield size={11} /> How Claude handles file edits and shell commands.</Flex>}
        >
          <SegmentedControl
            value={s.permissionMode}
            options={[...PERMISSION_OPTIONS]}
            onChange={(v) => s.set('ai.permissionMode', v)}
          />
        </SettingRow>
        <SettingRow
          label="Budget limit"
          description={<Flex align="center" gap="4px"><DollarSign size={11} /> Max USD per prompt. Leave empty for unlimited.</Flex>}
        >
          <SettingInput
            value={s.maxBudget ?? ''}
            type="number"
            placeholder="No limit"
            prefix="$"
            suffix="per prompt"
            onChange={(v) => s.set('ai.maxBudget', v === '' || v === 0 ? null : v)}
          />
        </SettingRow>
      </SettingsSection>

      {/* Instructions */}
      <SettingsSection
        title="Custom Instructions"
        description="Project-specific rules appended to every prompt. Use this for coding conventions, preferred libraries, or patterns."
      >
        <Box css={{ padding: '14px 16px' }}>
          <SettingTextarea
            value={s.customInstructions}
            placeholder={"e.g.\n- Always use TypeScript with strict mode\n- Prefer functional components with hooks\n- Use Tailwind for styling\n- Follow the existing project patterns"}
            rows={7}
            mono
            onChange={(v) => s.set('ai.customInstructions', v)}
          />
        </Box>
      </SettingsSection>
    </Flex>
  )
}
