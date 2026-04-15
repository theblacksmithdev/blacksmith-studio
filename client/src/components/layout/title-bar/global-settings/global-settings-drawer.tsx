import { Flex } from "@chakra-ui/react";
import { Server } from "lucide-react";
import { Drawer, Text } from "@/components/shared/ui";
import { NodeVersionPicker } from "@/components/shared/node-version-picker";
import { useGlobalSettings } from "@/hooks/use-global-settings";

interface GlobalSettingsDrawerProps {
  onClose: () => void;
}

export function GlobalSettingsDrawer({ onClose }: GlobalSettingsDrawerProps) {
  const gs = useGlobalSettings();

  return (
    <Drawer
      title="Global Settings"
      subtitle="Defaults for all projects. Override per-project in workspace settings."
      onClose={onClose}
      size="sm"
    >
      <Flex direction="column" gap="12px">
        <Flex direction="column" gap="4px">
          <Flex align="center" gap="6px">
            <Server size={13} style={{ color: "var(--studio-text-muted)" }} />
            <Text
              css={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--studio-text-primary)",
              }}
            >
              Node.js
            </Text>
          </Flex>
          <Text
            css={{ fontSize: "13px", color: "var(--studio-text-tertiary)" }}
          >
            Runtime for dev servers, CLI tools, and AI agents.
          </Text>
        </Flex>
        <NodeVersionPicker
          value={gs.nodePath}
          onChange={(v) => gs.set("runner.nodePath", v)}
        />
      </Flex>
    </Drawer>
  );
}
