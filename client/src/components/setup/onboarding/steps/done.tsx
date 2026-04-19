import { Box, Flex, Grid, VStack } from "@chakra-ui/react";
import { CheckCircle2, Sparkles, Hammer } from "lucide-react";
import { Text } from "@/components/shared/ui";
import {
  doneDescCss,
  doneEmblemCss,
  doneEyebrowCss,
  doneHeroCss,
  doneSummaryListCss,
  doneSummaryRowCss,
  doneTitleCss,
} from "./styles";

interface DoneStepProps {
  nodeVersion?: string;
  claudeVersion?: string;
  pythonPath?: string | null;
}

export function DoneStep({
  nodeVersion,
  claudeVersion,
  pythonPath,
}: DoneStepProps) {
  return (
    <VStack align="stretch" gap="18px" css={doneHeroCss}>
      <Flex css={doneEmblemCss}>
        <Hammer size={24} />
      </Flex>
      <Box as="span" css={doneEyebrowCss}>
        <Sparkles size={10} />
        Ready
      </Box>
      <Text as="h2" variant="heading" css={doneTitleCss}>
        Your forge is lit.
      </Text>
      <Text variant="body" color="secondary" css={doneDescCss}>
        Everything Blacksmith Studio needs is in place. Open the app to create
        your first project — we'll pick up all of these choices automatically.
      </Text>
      <Grid
        as="ul"
        templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
        gap="8px"
        mt="4px"
        css={doneSummaryListCss}
      >
        {nodeVersion && (
          <Box as="li" css={doneSummaryRowCss}>
            <CheckCircle2 size={14} style={{ color: "var(--studio-accent)" }} />
            Node.js {nodeVersion}
          </Box>
        )}
        {claudeVersion && (
          <Box as="li" css={doneSummaryRowCss}>
            <CheckCircle2 size={14} style={{ color: "var(--studio-accent)" }} />
            Claude Code {claudeVersion}
          </Box>
        )}
        {pythonPath && (
          <Box as="li" css={doneSummaryRowCss}>
            <CheckCircle2 size={14} style={{ color: "var(--studio-accent)" }} />
            Python environment ready
          </Box>
        )}
      </Grid>
    </VStack>
  );
}
