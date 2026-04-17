import type { ReactNode } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { spacing } from "@/components/shared/ui";
import { bubbleTokens, bubbleKeyframes } from "./tokens";

export type ShellTone = "user" | "agent" | "assistant" | "error";

interface BubbleShellProps {
  tone: ShellTone;
  align: "left" | "right";
  accent?: string;
  maxWidth?: string;
  children: ReactNode;
}

const SHELL_STYLE: Record<
  ShellTone,
  { background: string; color: string; border: string; radius: string }
> = {
  user: {
    background: "var(--studio-accent)",
    color: "var(--studio-accent-fg)",
    border: "1px solid transparent",
    radius: bubbleTokens.radius.user,
  },
  agent: {
    background: "var(--studio-bg-surface)",
    color: "var(--studio-text-primary)",
    border: "1px solid var(--studio-border)",
    radius: bubbleTokens.radius.agent,
  },
  assistant: {
    background: "transparent",
    color: "var(--studio-text-primary)",
    border: "1px solid transparent",
    radius: bubbleTokens.radius.neutral,
  },
  error: {
    background: "var(--studio-error-subtle)",
    color: "var(--studio-error)",
    border: "1px solid var(--studio-error)",
    radius: bubbleTokens.radius.agent,
  },
};

export function BubbleShell({
  tone,
  align,
  accent,
  maxWidth,
  children,
}: BubbleShellProps) {
  const s = SHELL_STYLE[tone];
  const hasPadding = tone !== "assistant";

  return (
    <Flex
      direction="column"
      align={align === "right" ? "flex-end" : "flex-start"}
      css={{ width: "100%", minWidth: 0 }}
    >
      <Box
        css={{
          position: "relative",
          width: maxWidth ? undefined : "100%",
          maxWidth: maxWidth ?? "100%",
          minWidth: 0,
          "&:hover .msg-actions": {
            opacity: 1,
            pointerEvents: "auto",
            transform: "translateY(0)",
          },
          animation: `${bubbleKeyframes.animationName} ${bubbleTokens.enter.duration}ms ${bubbleTokens.enter.easing} both`,
        }}
      >
        <style>{bubbleKeyframes.css}</style>
        <Box
          css={{
            padding: hasPadding
              ? `${bubbleTokens.paddingY} ${bubbleTokens.paddingX}`
              : 0,
            borderRadius: s.radius,
            background: s.background,
            color: s.color,
            border: s.border,
            boxShadow:
              tone === "agent" || tone === "error"
                ? "0 1px 0 rgba(0,0,0,0.02)"
                : undefined,
            position: "relative",
            overflow: "hidden",
            maxWidth: "100%",
            minWidth: 0,
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          }}
        >
          {accent && tone === "agent" && (
            <Box
              css={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "3px",
                background: accent,
              }}
            />
          )}
          <Box
            css={{
              paddingLeft: accent && tone === "agent" ? spacing.sm : 0,
              minWidth: 0,
              maxWidth: "100%",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
