import { Box, HStack, VStack } from "@chakra-ui/react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Divider, Logo, Text } from "@/components/shared/ui";
import {
  doneDescCss,
  doneEmblemCss,
  doneEyebrowCss,
  doneRootCss,
  doneSummaryRowCss,
  doneTitleCss,
} from "./styles";

interface DoneStepProps {
  nodeVersion?: string;
  claudeVersion?: string;
  pythonPath?: string | null;
}

/**
 * Final onboarding screen. Left-aligned hero with a fade divider
 * separating the Blacksmith logo from the step copy. The mesh-grid
 * backdrop is rendered by the wizard shell via the step's `backdrop`
 * slot so it spans the full content pane.
 */
export function DoneStep({
  nodeVersion,
  claudeVersion,
  pythonPath,
}: DoneStepProps) {
  return (
    <VStack align="stretch" gap="20px" css={doneRootCss}>
      <Box css={doneEmblemCss}>
        <Logo size={34} variant="brand" />
      </Box>

      <Divider variant="fade" />

      <Box as="span" css={doneEyebrowCss}>
        <Sparkles size={10} />
        Ready
      </Box>

      <Text as="h2" variant="heading" css={doneTitleCss}>
        Your forge is lit.
      </Text>

      <Text variant="body" color="secondary" css={doneDescCss}>
        Everything Blacksmith Studio needs is in place. Hit{" "}
        <Text as="span" variant="code">
          Enter Blacksmith
        </Text>{" "}
        below to start building — we'll pick up every choice you made.
      </Text>

      <HStack gap="8px" wrap="wrap" pt="4px">
        {nodeVersion && (
          <Box css={doneSummaryRowCss}>
            <CheckCircle2 size={13} style={{ color: "var(--studio-accent)" }} />
            Node.js {nodeVersion}
          </Box>
        )}
        {claudeVersion && (
          <Box css={doneSummaryRowCss}>
            <CheckCircle2 size={13} style={{ color: "var(--studio-accent)" }} />
            Claude Code {claudeVersion}
          </Box>
        )}
        {pythonPath && (
          <Box css={doneSummaryRowCss}>
            <CheckCircle2 size={13} style={{ color: "var(--studio-accent)" }} />
            Python environment ready
          </Box>
        )}
      </HStack>
    </VStack>
  );
}
