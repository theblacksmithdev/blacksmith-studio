import { Box } from '@chakra-ui/react'
import { SettingsSection } from '@/pages/settings/components/settings-section'
import { SettingTextarea } from '@/pages/settings/components/setting-textarea'

const PLACEHOLDER = `e.g.
- Always use TypeScript with strict mode
- Prefer functional components with hooks
- Use Tailwind for styling
- Follow the existing project patterns`

interface CustomInstructionsSectionProps {
  value: string
  onChange: (value: string) => void
}

export function CustomInstructionsSection({ value, onChange }: CustomInstructionsSectionProps) {
  return (
    <SettingsSection
      title="Custom Instructions"
      description="Project-specific rules appended to every prompt. Use this for coding conventions, preferred libraries, or patterns."
    >
      <Box css={{ padding: '14px 16px' }}>
        <SettingTextarea
          value={value}
          placeholder={PLACEHOLDER}
          rows={7}
          mono
          onChange={onChange}
        />
      </Box>
    </SettingsSection>
  )
}
