import { Box, HStack, VStack } from "@chakra-ui/react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Divider, Logo, Text } from "@/components/shared/ui";
import {
  doneEmblemCss,
  doneSummaryRowCss,
  doneTitleCss,
  eyebrowCss,
  rootCss,
} from "./styles";

interface DoneStepProps {
  projectName: string | undefined;
  runnerConfigured: boolean;
  graphifyReady: boolean;
}

/**
 * Final project onboarding screen. Left-aligned hero with a fade
 * divider separating the Blacksmith logo from the step copy and a
 * summary of what got set up.
 */
export function DoneStep({
  projectName,
  runnerConfigured,
  graphifyReady,
}: DoneStepProps) {
  return (
    <VStack align="stretch" gap="20px" css={rootCss}>
      <Box css={doneEmblemCss}>
        <Logo size={30} variant="brand" />
      </Box>

      <Divider variant="fade" />

      <Box as="span" css={eyebrowCss}>
        <Sparkles size={10} />
        Ready
      </Box>

      <Text as="h2" variant="heading" css={doneTitleCss}>
        {projectName ? `${projectName} is wired up.` : "Your project is ready."}
      </Text>

      <Text
        variant="body"
        color="secondary"
        css={{ lineHeight: 1.6, maxWidth: "520px" }}
      >
        Hit{" "}
        <Text as="span" variant="code">
          Open project
        </Text>{" "}
        below to jump in. Everything you configured here is editable from
        Settings later.
      </Text>

      <HStack gap="8px" wrap="wrap" pt="4px">
        <Box css={doneSummaryRowCss}>
          <CheckCircle2 size={13} style={{ color: "var(--studio-accent)" }} />
          Project registered
        </Box>
        {runnerConfigured && (
          <Box css={doneSummaryRowCss}>
            <CheckCircle2 size={13} style={{ color: "var(--studio-accent)" }} />
            Runner configured
          </Box>
        )}
        {graphifyReady && (
          <Box css={doneSummaryRowCss}>
            <CheckCircle2 size={13} style={{ color: "var(--studio-accent)" }} />
            Knowledge graph ready
          </Box>
        )}
      </HStack>
    </VStack>
  );
}
