import { useMemo, useState } from "react";
import { Box, HStack, VStack } from "@chakra-ui/react";
import {
  Copy,
  ExternalLink,
  Check,
  ChevronRight,
  Package,
  RefreshCw,
} from "lucide-react";
import { Drawer } from "@/components/shared/drawer";
import { SegmentedControl } from "@/components/shared/form-controls";
import { Text } from "@/components/shared/ui";
import { copyToClipboard } from "@/lib/clipboard";
import {
  PLATFORM_LABEL,
  detectPlatform,
  type Platform,
} from "@/lib/platform";
import {
  NODE_INSTRUCTIONS,
  PYTHON_INSTRUCTIONS,
  type InstallMethod,
  type InstallStep,
} from "./instructions";
import {
  Chevron,
  CommandRow,
  CommandText,
  CopyIconBtn,
  footerHintCss,
  introCss,
  LinkRow,
  MethodBody,
  MethodCard,
  MethodIconSlot,
  MethodTrigger,
  methodSubtitleCss,
  methodTitleCss,
  PromptGlyph,
  recommendedPillCss,
  sectionLabelCss,
  stepLabelCss,
} from "./styles";

export type InstallHelpKind = "node" | "python";

interface InstallHelpDrawerProps {
  kind: InstallHelpKind;
  onClose: () => void;
}

const TITLE: Record<InstallHelpKind, string> = {
  node: "Install Node.js",
  python: "Install Python",
};

const INTRO: Record<InstallHelpKind, string> = {
  node: "Pick the option that matches your OS and workflow. All commands are copy-ready.",
  python: "Pick the option that matches your OS and workflow. All commands are copy-ready.",
};

const PLATFORM_OPTIONS = (["mac", "windows", "linux"] as Platform[]).map(
  (p) => ({ value: p, label: PLATFORM_LABEL[p] }),
);

/**
 * Install-help panel. Opens over the wizard (above its z-index) with
 * the drawer's own padding disabled so we can control section spacing.
 *
 * Layout: intro → platform segmented control → list of collapsible
 * method cards (first recommended option is expanded by default) →
 * footer hint about Rescan.
 */
export function InstallHelpDrawer({ kind, onClose }: InstallHelpDrawerProps) {
  const [platform, setPlatform] = useState<Platform>(() => detectPlatform());

  const data = kind === "node" ? NODE_INSTRUCTIONS : PYTHON_INSTRUCTIONS;
  const methods = useMemo(() => data[platform], [data, platform]);

  return (
    <Drawer
      title={TITLE[kind]}
      size="540px"
      onClose={onClose}
      zIndex={10000}
      noPadding
    >
      <VStack
        align="stretch"
        gap="18px"
        h="100%"
        overflowY="auto"
        px="20px"
        py="20px"
      >
        <Text css={introCss}>{INTRO[kind]}</Text>

        <SegmentedControl
          options={PLATFORM_OPTIONS}
          value={platform}
          onChange={(v) => setPlatform(v as Platform)}
        />

        <VStack align="stretch" gap="10px">
          {methods.map((method) => (
            <CollapsibleMethod key={method.title} method={method} />
          ))}
        </VStack>

        <Box css={footerHintCss}>
          <RefreshCw size={14} style={{ marginTop: 2, flexShrink: 0 }} />
          <Box>
            After installing, come back and hit{" "}
            <Text as="span" variant="code">
              Rescan
            </Text>{" "}
            — Blacksmith will pick up the new install automatically.
          </Box>
        </Box>
      </VStack>
    </Drawer>
  );
}

function CollapsibleMethod({ method }: { method: InstallMethod }) {
  const [open, setOpen] = useState(!!method.recommended);

  return (
    <MethodCard $open={open}>
      <MethodTrigger type="button" onClick={() => setOpen((v) => !v)}>
        <MethodIconSlot>
          <Package size={14} />
        </MethodIconSlot>
        <VStack align="flex-start" gap="2px" flex="1" minW="0">
          <HStack gap="8px" align="center">
            <Text css={methodTitleCss}>{method.title}</Text>
            {method.recommended && (
              <Box css={recommendedPillCss}>Recommended</Box>
            )}
          </HStack>
          {method.subtitle && (
            <Text as="span" css={methodSubtitleCss}>
              {method.subtitle}
            </Text>
          )}
        </VStack>
        <Chevron $open={open}>
          <ChevronRight size={14} />
        </Chevron>
      </MethodTrigger>

      {open && (
        <MethodBody>
          {method.steps.map((step, i) => (
            <StepRow key={i} step={step} />
          ))}
        </MethodBody>
      )}
    </MethodCard>
  );
}

function StepRow({ step }: { step: InstallStep }) {
  if (step.kind === "text") {
    return <Box css={sectionLabelCss}>{step.content}</Box>;
  }
  if (step.kind === "link") {
    return (
      <LinkRow href={step.url} target="_blank" rel="noreferrer">
        <ExternalLink size={14} style={{ color: "var(--studio-text-muted)" }} />
        <Text as="span">{step.label}</Text>
        <ChevronRight size={14} className="link-arrow" />
      </LinkRow>
    );
  }
  return (
    <VStack align="stretch" gap="6px">
      {step.label && <Box css={stepLabelCss}>{step.label}</Box>}
      <CommandSnippet command={step.command} />
    </VStack>
  );
}

function CommandSnippet({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await copyToClipboard(command);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <CommandRow>
      <PromptGlyph>$</PromptGlyph>
      <CommandText>{command}</CommandText>
      <CopyIconBtn
        type="button"
        onClick={onCopy}
        $copied={copied}
        aria-label={copied ? "Copied" : "Copy command"}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </CopyIconBtn>
    </CommandRow>
  );
}
