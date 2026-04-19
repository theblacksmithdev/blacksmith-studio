import { Fragment, type ReactNode } from "react";
import { Box, Flex, HStack, VStack } from "@chakra-ui/react";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  X,
} from "lucide-react";
import { Button, Logo, Text } from "@/components/shared/ui";
import { useThemeMode } from "@/hooks/use-theme-mode";
import type { WizardStep } from "./types";
import {
  CloseButton,
  Content,
  ContentBackdrop,
  FooterBar,
  FooterBarFill,
  Rail,
  Shell,
  StepConnector,
  StepIndicator,
  StepItem,
  ThemeToggle,
  eyebrowCss,
  fadeIn,
  wizardBrandCaptionCss,
  wizardBrandTitleCss,
  wizardDescCss,
  wizardFooterCss,
  wizardFooterProgressCss,
  wizardRailFooterLabelCss,
  wizardStepHintCss,
  wizardStepListCss,
  wizardStepTitleCss,
  wizardTitleCss,
} from "./styles";

export interface WizardProps {
  brandTitle: string;
  brandCaption: string;
  steps: WizardStep[];
  currentStepId: string;
  onBack?: () => void;
  onNext: () => void;
  onSkip?: () => void;
  /**
   * When supplied, renders a circular close button in the top-right of
   * the shell. Global first-run wizards leave this unset (the flow is
   * required); per-project wizards opt in so users can bail out.
   */
  onClose?: () => void;
  progressLabel?: string;
  footerExtra?: ReactNode;
  advancing?: boolean;
}

/**
 * Full-screen, two-pane wizard shell.
 *
 * Rail: branded step list on the left with a theme toggle. Content:
 * centered, generously padded step body with animated transitions.
 * Pure presentational — the host owns all state (current step, status,
 * validation) and wires Back/Next/Skip handlers.
 */
export function Wizard({
  brandTitle,
  brandCaption,
  steps,
  currentStepId,
  onBack,
  onNext,
  onSkip,
  onClose,
  progressLabel,
  footerExtra,
  advancing,
}: WizardProps) {
  const { mode, toggle } = useThemeMode();

  const currentIndex = steps.findIndex((s) => s.id === currentStepId);
  const current = steps[currentIndex];
  const doneCount = steps.filter((s) => s.status === "done").length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <Shell>
      {onClose && (
        <CloseButton
          type="button"
          onClick={onClose}
          aria-label="Close setup"
          title="Close setup"
        >
          <X size={16} />
        </CloseButton>
      )}
      <Rail>
        <Flex
          align="center"
          gap="12px"
          pb="22px"
          mb="22px"
          borderBottom="1px solid var(--studio-border)"
          pl="4px"
        >
          <Logo size={32} />
          <VStack align="flex-start" gap="2px" minW="0">
            <Text css={wizardBrandTitleCss}>{brandTitle}</Text>
            <Text css={wizardBrandCaptionCss}>{brandCaption}</Text>
          </VStack>
        </Flex>

        <Box
          as="ul"
          flex="1"
          minH="0"
          overflowY="auto"
          css={wizardStepListCss}
        >
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            const isActive = step.status === "active";
            return (
              <Fragment key={step.id}>
                <StepItem $status={step.status}>
                  {!isLast && (
                    <StepConnector
                      $status={step.status === "done" ? "done" : "other"}
                    />
                  )}
                  <StepIndicator $status={step.status}>
                    {step.status === "done" ? (
                      <Check size={12} strokeWidth={2.5} />
                    ) : (
                      i + 1
                    )}
                  </StepIndicator>
                  <VStack align="flex-start" gap="2px" flex="1" minW="0">
                    <Text css={wizardStepTitleCss(isActive)}>{step.title}</Text>
                    {step.hint && (
                      <Text css={wizardStepHintCss}>{step.hint}</Text>
                    )}
                  </VStack>
                </StepItem>
              </Fragment>
            );
          })}
        </Box>

        <Flex
          align="center"
          justify="space-between"
          pt="14px"
          mt="12px"
          borderTop="1px solid var(--studio-border)"
        >
          <Text css={wizardRailFooterLabelCss}>Blacksmith · Setup</Text>
          <ThemeToggle
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
          >
            {mode === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </ThemeToggle>
        </Flex>
      </Rail>

      <Content>
        {current?.backdrop && (
          <ContentBackdrop>{current.backdrop()}</ContentBackdrop>
        )}
        <Flex
          position="relative"
          zIndex={1}
          flex="1"
          minH="0"
          overflowY="auto"
          justify="center"
          px="48px"
          pt="72px"
          pb="48px"
        >
          {current && (
            <VStack
              key={current.id}
              align="stretch"
              w="100%"
              maxW="660px"
              gap="32px"
              css={{ animation: `${fadeIn} 0.32s cubic-bezier(0.16, 1, 0.3, 1)` }}
            >
              <VStack align="stretch" gap="10px">
                <Box as="span" css={eyebrowCss}>
                  <Sparkles size={10} />
                  Step {currentIndex + 1} of {steps.length}
                </Box>
                <Text as="h1" css={wizardTitleCss}>
                  {current.title}
                </Text>
                {current.description && (
                  <Text css={wizardDescCss}>{current.description}</Text>
                )}
              </VStack>
              <VStack align="stretch" gap="18px">
                {current.render()}
              </VStack>
            </VStack>
          )}
        </Flex>

        <Flex align="center" gap="10px" css={wizardFooterCss}>
          {onBack && !current?.hideBack && (
            <Button
              variant="ghost"
              size="md"
              onClick={onBack}
              disabled={currentIndex === 0}
            >
              <ArrowLeft size={14} />
              Back
            </Button>
          )}
          <HStack flex="1" minW="0" gap="12px" css={wizardFooterProgressCss}>
            <Text as="span">
              {progressLabel ?? `Step ${currentIndex + 1} of ${steps.length}`}
            </Text>
            <FooterBar>
              <FooterBarFill $pct={pct} />
            </FooterBar>
          </HStack>
          {footerExtra}
          {current?.optional && onSkip && (
            <Button variant="ghost" size="md" onClick={onSkip}>
              Skip
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={onNext}
            disabled={advancing || current?.canAdvance === false}
          >
            {advancing ? "Working…" : (current?.nextLabel ?? "Continue")}
            {!advancing && <ArrowRight size={14} />}
          </Button>
        </Flex>
      </Content>
    </Shell>
  );
}
