import { Flex, HStack, VStack } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import {
  BrainCircuit,
  CheckCircle2,
  Loader2,
  Zap,
  XCircle,
} from "lucide-react";
import { Button, Text } from "@/components/shared/ui";
import { useProjectGraphifySetup } from "../hooks";
import { rootCss, statusRowCss } from "./styles";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const Spinner = styled(Loader2)`
  animation: ${spin} 0.8s linear infinite;
`;

/**
 * Graphify toggle + first-build. Uses the same hooks the Settings UI
 * does — `useProjectGraphifySetup` is a thin facade over status +
 * build + the `graphify.enabled` project setting.
 */
export function GraphifyStep() {
  const g = useProjectGraphifySetup();

  const tone = g.error
    ? "err"
    : g.building
      ? "working"
      : g.exists
        ? "ok"
        : "idle";

  return (
    <VStack align="stretch" gap="16px" css={rootCss}>
      <Flex css={statusRowCss(tone)}>
        {g.building ? (
          <Spinner size={18} style={{ color: "var(--studio-text-muted)" }} />
        ) : g.error ? (
          <XCircle size={18} style={{ color: "var(--studio-error)" }} />
        ) : g.exists ? (
          <CheckCircle2 size={18} style={{ color: "var(--studio-accent)" }} />
        ) : (
          <BrainCircuit size={18} style={{ color: "var(--studio-text-muted)" }} />
        )}
        <VStack align="flex-start" gap="2px" flex="1" minW="0">
          <Text variant="body" css={{ fontWeight: 500 }}>
            {g.building
              ? "Building knowledge graph…"
              : g.error
                ? "Build failed"
                : g.exists
                  ? "Knowledge graph is ready"
                  : "Give agents structural context"}
          </Text>
          <Text variant="caption" color="muted">
            {g.exists
              ? "Agents will use the graph for sharper answers. Rebuilds automatically when the codebase changes."
              : "Graphify extracts a lightweight map of your repo so agents see structure instead of raw files."}
          </Text>
        </VStack>
      </Flex>

      {g.error && (
        <Text variant="caption" color="error" css={{ fontFamily: "var(--studio-font-mono, monospace)", whiteSpace: "pre-wrap" }}>
          {g.error}
        </Text>
      )}

      <HStack gap="8px" wrap="wrap">
        {!g.enabled && (
          <Button
            variant="primary"
            size="md"
            onClick={() => g.setEnabled(true)}
          >
            <Zap size={13} />
            Enable Graphify
          </Button>
        )}
        {g.enabled && !g.exists && (
          <Button
            variant="primary"
            size="md"
            onClick={() => g.run()}
            disabled={g.building}
          >
            {g.building ? <Spinner size={13} /> : <BrainCircuit size={13} />}
            {g.building ? "Building…" : "Build graph"}
          </Button>
        )}
        {g.enabled && g.exists && (
          <Button
            variant="ghost"
            size="md"
            onClick={() => g.run()}
            disabled={g.building}
          >
            <BrainCircuit size={13} />
            Rebuild graph
          </Button>
        )}
      </HStack>
    </VStack>
  );
}
