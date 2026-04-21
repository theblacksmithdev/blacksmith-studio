import { Flex, Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Terminal } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { Text, Badge } from "@/components/shared/ui";

/**
 * Which transport is running the model. Today: the local Claude Code
 * CLI. Future: other providers show up as additional cards with
 * their own install/auth state.
 */
export function ProviderSection() {
  return (
    <SettingsSection
      title="Provider"
      description="The AI provider powering code generation and chat."
    >
      <Card>
        <IconBox>
          <Terminal size={18} />
        </IconBox>
        <Box css={{ flex: 1, minWidth: 0 }}>
          <Flex align="center" gap="8px">
            <Text
              css={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--studio-text-primary)",
              }}
            >
              Claude Code CLI
            </Text>
            <Badge variant="default" size="sm">
              Installed
            </Badge>
          </Flex>
          <Flex align="center" gap="5px" css={{ marginTop: "3px" }}>
            <StatusDot />
            <Text css={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>
              Active — uses your local Claude Code installation
            </Text>
          </Flex>
        </Box>
      </Card>
    </SettingsSection>
  );
}

const Card = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-bottom: 1px solid var(--studio-border);
  &:last-child {
    border-bottom: none;
  }
`;

const IconBox = styled.div`
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
`;

const StatusDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--studio-green);
  flex-shrink: 0;
`;
