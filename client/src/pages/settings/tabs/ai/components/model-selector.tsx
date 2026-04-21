import { Box } from "@chakra-ui/react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { ModelPicker } from "@/components/shared/model-picker";

interface ModelSelectorProps {
  model: string;
  onModelChange: (model: string) => void;
}

/**
 * Settings-tab wrapper around the shared ModelPicker. All option data
 * comes from the server-side model registry via `useModels()` — no
 * hardcoded list here.
 */
export function ModelSelector({ model, onModelChange }: ModelSelectorProps) {
  return (
    <SettingsSection
      title="Model"
      description="Choose which model to use. Each family has trade-offs across speed, capability, and context window."
    >
      <Box css={{ padding: "14px 16px" }}>
        <ModelPicker variant="grid" value={model} onChange={onModelChange} />
      </Box>
    </SettingsSection>
  );
}
