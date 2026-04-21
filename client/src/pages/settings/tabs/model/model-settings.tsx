import { Box, Flex } from "@chakra-ui/react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { ModelPicker } from "@/components/shared/model-picker";
import { useAiSettings } from "../ai/hooks/use-ai-settings";
import { ProviderSection } from "./components/provider-section";
import { LocalModelsSection } from "./components/local-models-section";

/**
 * Dedicated tab for everything about "which model is running?" —
 * provider transport, the model picker itself, and the on-device
 * placeholder. Prompting, budget, and custom instructions live on
 * the AI / Prompting tab next door.
 */
export function ModelSettings() {
  const ai = useAiSettings();

  return (
    <Flex direction="column" gap="28px">
      <ProviderSection />

      <SettingsSection
        title="Model"
        description="The default model for chat sessions and agent dispatches in this project. Agent roles can override this individually from the Agents Team panel."
      >
        <Box css={{ padding: "14px 16px" }}>
          <ModelPicker
            variant="grid"
            value={ai.model}
            onChange={ai.setModel}
          />
        </Box>
      </SettingsSection>

      <LocalModelsSection />
    </Flex>
  );
}
