import { Box } from "@chakra-ui/react";
import { ModelPicker } from "@/components/shared/model-picker";
import { useSettings } from "@/hooks/use-settings";

/**
 * Chat composer's model selector. Wraps the shared ModelPicker in
 * dropdown mode and wires it to the project's `ai.model` setting.
 */
export function ModelSelector() {
  const { model, set } = useSettings();

  return (
    <Box css={{ position: "relative" }}>
      <ModelPicker
        variant="dropdown"
        value={model}
        placement="up"
        onChange={(id) => set("ai.model", id)}
      />
    </Box>
  );
}
