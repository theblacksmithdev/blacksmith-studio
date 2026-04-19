import { Box, Flex, Grid, VStack } from "@chakra-ui/react";
import { Sparkles, Zap, Layers } from "lucide-react";
import { Text } from "@/components/shared/ui";
import {
  featureCardCss,
  featureDescCss,
  featureTitleCss,
  iconSquareCss,
  welcomeEyebrowCss,
  welcomeKickerCss,
  welcomeRootCss,
} from "./styles";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function Feature({ icon, title, children }: FeatureProps) {
  return (
    <Box css={featureCardCss}>
      <Flex css={iconSquareCss}>{icon}</Flex>
      <Text variant="bodySmall" css={featureTitleCss}>
        {title}
      </Text>
      <Text variant="caption" color="tertiary" css={featureDescCss}>
        {children}
      </Text>
    </Box>
  );
}

/**
 * Welcome hero — three feature cards above a short intro block. The
 * mesh-grid backdrop is rendered by the wizard shell via the step's
 * `backdrop` slot so it spans the entire content pane, not just here.
 */
export function WelcomeStep() {
  return (
    <VStack
      align="stretch"
      gap="24px"
      position="relative"
      overflow="hidden"
      css={welcomeRootCss}
    >
      <VStack
        align="stretch"
        gap="10px"
        maxW="480px"
        position="relative"
        zIndex={1}
      >
        <Box as="span" css={welcomeEyebrowCss}>
          <Sparkles size={10} />
          Welcome
        </Box>
        <Text as="h2" variant="subtitle" css={welcomeKickerCss}>
          An AI-native forge for any stack.
        </Text>
        <Text variant="bodySmall" color="secondary" css={{ lineHeight: 1.55 }}>
          A few quick choices — runtime, interpreter, environment — and you're
          ready to build. Everything stays on your machine, and every decision
          here is reversible from Settings later.
        </Text>
      </VStack>

      <Grid
        templateColumns="repeat(3, 1fr)"
        gap="12px"
        position="relative"
        zIndex={1}
      >
        <Feature icon={<Sparkles size={14} />} title="AI-native from the start">
          Claude and local models side-by-side. Chat, agents, and tool-use
          wired into every corner.
        </Feature>
        <Feature icon={<Layers size={14} />} title="Any stack, any runtime">
          Bring your own Node, Python, and package managers. Blacksmith talks
          to your tools — it doesn't replace them.
        </Feature>
        <Feature icon={<Zap size={14} />} title="Fast, local-first">
          Everything runs on your machine. Sessions and projects are yours —
          no data leaves unless you ask.
        </Feature>
      </Grid>
    </VStack>
  );
}
