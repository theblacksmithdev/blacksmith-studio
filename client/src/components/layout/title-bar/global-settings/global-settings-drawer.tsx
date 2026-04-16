import { Flex, Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Server, Terminal } from "lucide-react";
import { Drawer, Text } from "@/components/shared/ui";
import { NodeVersionPicker } from "@/components/shared/node-version-picker";
import { PythonVersionPicker } from "@/components/shared/python-version-picker";
import { useGlobalSettings } from "@/hooks/use-global-settings";

const Section = styled.div`
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--studio-border);
`;

const SectionBody = styled.div`
  padding: 14px 16px;
`;

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
      <Flex direction="column" gap="16px">
        <Section>
          <SectionHeader>
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
              css={{
                fontSize: "12px",
                color: "var(--studio-text-tertiary)",
                marginTop: "2px",
              }}
            >
              Runtime for dev servers, CLI tools, and AI agents.
            </Text>
          </SectionHeader>
          <SectionBody>
            <NodeVersionPicker
              value={gs.nodePath}
              onChange={(v) => gs.set("runner.nodePath", v)}
            />
          </SectionBody>
        </Section>

        <Section>
          <SectionHeader>
            <Flex align="center" gap="6px">
              <Terminal
                size={13}
                style={{ color: "var(--studio-text-muted)" }}
              />
              <Text
                css={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--studio-text-primary)",
                }}
              >
                Python
              </Text>
            </Flex>
            <Text
              css={{
                fontSize: "12px",
                color: "var(--studio-text-tertiary)",
                marginTop: "2px",
              }}
            >
              Optional. Enables features like Graphify knowledge graphs.
            </Text>
          </SectionHeader>
          <SectionBody>
            <PythonVersionPicker
              value={gs.pythonPath}
              onChange={(v) => gs.set("python.pythonPath", v)}
            />
          </SectionBody>
        </Section>
      </Flex>
    </Drawer>
  );
}
