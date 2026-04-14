import { Flex } from '@chakra-ui/react'
import { useAiSettings } from './hooks/use-ai-settings'
import { ProviderSection } from './components/provider-section'
import { ModelSelector } from './components/model-selector'
import { BehaviorSection } from './components/behavior-section'
import { CustomInstructionsSection } from './components/custom-instructions-section'

export function AiSettings() {
  const ai = useAiSettings()

  return (
    <Flex direction="column" gap="28px">
      <ProviderSection />
      <ModelSelector model={ai.model} onModelChange={ai.setModel} />
      <BehaviorSection
        permissionMode={ai.permissionMode}
        maxBudget={ai.maxBudget}
        onPermissionChange={ai.setPermissionMode}
        onBudgetChange={ai.setBudget}
      />
      <CustomInstructionsSection
        value={ai.customInstructions}
        onChange={ai.setCustomInstructions}
      />
    </Flex>
  )
}
