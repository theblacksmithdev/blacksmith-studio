import { Box, Flex, HStack, VStack } from "@chakra-ui/react";
import { CheckCircle2, RefreshCw, Copy, Terminal } from "lucide-react";
import { Button, Text } from "@/components/shared/ui";
import { copyToClipboard } from "@/lib/clipboard";
import { cmdCardCss, cmdTextCss, statusRowCss } from "./styles";

interface ClaudeAuthStepProps {
  authenticated: boolean;
  onRecheck: () => void;
}

/**
 * Claude authentication is delegated to the CLI — we show the command,
 * let the user copy it, and provide a re-check button that runs
 * `setup:check` again.
 */
export function ClaudeAuthStep({
  authenticated,
  onRecheck,
}: ClaudeAuthStepProps) {
  const copy = () => {
    void copyToClipboard("claude login");
  };

  if (authenticated) {
    return (
      <Flex css={statusRowCss("ok")}>
        <CheckCircle2 size={18} style={{ color: "var(--studio-accent)" }} />
        <VStack align="flex-start" gap="2px" flex="1" minW="0">
          <Text variant="body" css={{ fontWeight: 500 }}>
            You're authenticated with Claude
          </Text>
          <Text variant="caption" color="muted">
            Agents and chat will now call the Claude API.
          </Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <VStack align="stretch" gap="16px">
      <Text variant="body" color="secondary">
        Open a terminal, paste the command below, and follow the prompts. Then
        come back here and hit Re-check.
      </Text>

      <Flex css={cmdCardCss}>
        <Terminal size={15} style={{ color: "var(--studio-text-muted)" }} />
        <Box as="code" css={cmdTextCss}>
          claude login
        </Box>
        <Button variant="ghost" size="sm" onClick={copy}>
          <Copy size={13} /> Copy
        </Button>
      </Flex>

      <HStack gap="8px" wrap="wrap">
        <Button variant="primary" size="md" onClick={onRecheck}>
          <RefreshCw size={13} />
          I've authenticated
        </Button>
      </HStack>
    </VStack>
  );
}
