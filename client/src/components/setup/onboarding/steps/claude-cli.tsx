import { Box, Flex, HStack, VStack } from "@chakra-ui/react";
import {
  CheckCircle2,
  Download,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Button, Text } from "@/components/shared/ui";
import { useInstallClaude } from "@/api/hooks/setup";
import { Spinner, errorBlockCss, statusRowCss } from "./styles";

interface ClaudeCliStepProps {
  installed: boolean;
  version?: string;
  onChange: () => void;
}

export function ClaudeCliStep({
  installed,
  version,
  onChange,
}: ClaudeCliStepProps) {
  const { install, installing, error } = useInstallClaude({
    onSuccess: onChange,
  });

  if (installed) {
    return (
      <Flex css={statusRowCss("ok")}>
        <CheckCircle2 size={18} style={{ color: "var(--studio-accent)" }} />
        <VStack align="flex-start" gap="2px" flex="1" minW="0">
          <Text variant="body" css={{ fontWeight: 500 }}>
            Claude Code CLI is installed
          </Text>
          <Text variant="caption" color="muted">
            {version}
          </Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <VStack align="stretch" gap="16px">
      <Flex css={statusRowCss(error ? "err" : "idle")}>
        {installing ? (
          <Spinner size={18} style={{ color: "var(--studio-text-muted)" }} />
        ) : error ? (
          <XCircle size={18} style={{ color: "var(--studio-error)" }} />
        ) : (
          <Download size={18} style={{ color: "var(--studio-text-muted)" }} />
        )}
        <VStack align="flex-start" gap="2px" flex="1" minW="0">
          <Text variant="body" css={{ fontWeight: 500 }}>
            {installing
              ? "Installing Claude Code CLI…"
              : error
                ? "Installation failed"
                : "Claude Code CLI is required"}
          </Text>
          <Text variant="caption" color="muted">
            Powers every agent and chat — installed globally via npm.
          </Text>
        </VStack>
      </Flex>

      {error && (
        <Box as="pre" css={errorBlockCss}>
          {error}
        </Box>
      )}

      <HStack gap="8px">
        <Button
          variant="primary"
          size="md"
          onClick={install}
          disabled={installing}
        >
          {installing ? <Spinner size={13} /> : <Download size={13} />}
          {installing ? "Installing…" : "Install Claude Code"}
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={onChange}
          disabled={installing}
        >
          <RefreshCw size={13} />
          Re-check
        </Button>
      </HStack>
    </VStack>
  );
}
