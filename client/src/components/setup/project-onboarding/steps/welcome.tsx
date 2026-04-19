import { Box, Flex, VStack } from "@chakra-ui/react";
import { Folder, MessageSquare, Sparkles, Play, BrainCircuit } from "lucide-react";
import { Text } from "@/components/shared/ui";
import type { Project } from "@/api/types";
import {
  eyebrowCss,
  HeroCard,
  highlightCardCss,
  highlightIconCss,
  highlightsGridCss,
  pathChipCss,
  rootCss,
} from "./styles";

interface WelcomeStepProps {
  project: Project | undefined;
}

const HIGHLIGHTS = [
  {
    icon: <Play size={14} />,
    title: "Run it",
    desc: "Wire up how Blacksmith should start your dev server.",
  },
  {
    icon: <BrainCircuit size={14} />,
    title: "Graphify",
    desc: "Build a knowledge graph so agents understand the codebase.",
  },
  {
    icon: <MessageSquare size={14} />,
    title: "Chat & agents",
    desc: "Start a chat or dispatch a multi-agent task, hands-off.",
  },
];

/**
 * First screen of the per-project flow. Non-interactive — gives the
 * user a snapshot of what's about to happen.
 */
export function WelcomeStep({ project }: WelcomeStepProps) {
  return (
    <VStack align="stretch" gap="20px" css={rootCss}>
      <HeroCard>
        <Box as="span" css={eyebrowCss}>
          <Sparkles size={10} />
          Project setup
        </Box>
        <Text
          as="h2"
          variant="subtitle"
          css={{
            fontSize: "22px",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Let's tune Blacksmith for {project?.name ?? "this project"}.
        </Text>
        <Text variant="bodySmall" color="secondary" css={{ lineHeight: 1.6 }}>
          A handful of quick choices — how to run it, whether to index the
          codebase for agents — and you're set. Skip anything you're not ready
          for; it's all reversible in Settings.
        </Text>
        {project?.path && (
          <Box css={pathChipCss}>
            <Folder size={12} /> {project.path}
          </Box>
        )}
      </HeroCard>

      <Box css={highlightsGridCss}>
        {HIGHLIGHTS.map((h) => (
          <Flex key={h.title} css={highlightCardCss}>
            <Flex css={highlightIconCss}>{h.icon}</Flex>
            <VStack align="flex-start" gap="2px" flex="1" minW="0">
              <Text variant="bodySmall" css={{ fontWeight: 600 }}>
                {h.title}
              </Text>
              <Text variant="caption" color="tertiary" css={{ lineHeight: 1.5 }}>
                {h.desc}
              </Text>
            </VStack>
          </Flex>
        ))}
      </Box>
    </VStack>
  );
}

