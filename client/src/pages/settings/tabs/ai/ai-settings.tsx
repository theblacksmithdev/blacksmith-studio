import { Flex } from "@chakra-ui/react";
import { useAiSettings } from "./hooks/use-ai-settings";
import { BehaviorSection } from "./components/behavior-section";
import { CustomInstructionsSection } from "./components/custom-instructions-section";

export function AiSettings() {
  const ai = useAiSettings();

  return (
    <Flex direction="column" gap="28px">
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
  );
}
