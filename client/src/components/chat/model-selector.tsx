import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Flex, Box } from "@chakra-ui/react";
import {
  ChevronDown,
  Check,
  Cpu,
  Zap,
  Sparkles,
  Brain,
  type LucideIcon,
} from "lucide-react";
import { Text, spacing, radii } from "@/components/shared/ui";
import { useSettings } from "@/hooks/use-settings";
import { useAiModelsQuery } from "@/api/hooks/ai";

/** Per-model-id icon. Unknown ids fall back to `Cpu`. */
const ICONS: Record<string, LucideIcon> = {
  sonnet: Zap,
  opus: Brain,
  haiku: Sparkles,
};

export function ModelSelector() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { model, set } = useSettings();
  const { data: models = [] } = useAiModelsQuery();

  const active = models.find((m) => m.value === model) ?? models[0];
  if (!active) return null;
  const ActiveIcon = ICONS[active.value] ?? Cpu;

  return (
    <Box css={{ position: "relative" }}>
      <Flex
        as="button"
        ref={triggerRef}
        align="center"
        gap={spacing.xs}
        onClick={() => setOpen(!open)}
        css={{
          padding: `${spacing.xs} ${spacing.sm}`,
          borderRadius: radii.md,
          border: "none",
          background: "transparent",
          color: "var(--studio-text-muted)",
          fontSize: "12px",
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.12s ease",
          "&:hover": {
            background: "var(--studio-bg-hover)",
            color: "var(--studio-text-secondary)",
          },
        }}
      >
        <ActiveIcon size={12} />
        {active.label}
        <ChevronDown
          size={10}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s",
          }}
        />
      </Flex>

      {open &&
        createPortal(
          <>
            <Box
              onClick={() => setOpen(false)}
              css={{ position: "fixed", inset: 0, zIndex: 99 }}
            />
            <Box
              css={{
                position: "fixed",
                bottom: triggerRef.current
                  ? window.innerHeight -
                    triggerRef.current.getBoundingClientRect().top +
                    6
                  : 0,
                left: triggerRef.current?.getBoundingClientRect().left ?? 0,
                width: "200px",
                background: "var(--studio-bg-surface)",
                border: "1px solid var(--studio-border-hover)",
                borderRadius: radii.lg,
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.18)",
                zIndex: 100,
                padding: spacing.xs,
                animation: "fadeIn 0.1s ease",
              }}
            >
              {models.map((m) => {
                const Icon = ICONS[m.value] ?? Cpu;
                const isActive = m.value === model;
                return (
                  <Flex
                    as="button"
                    key={m.value}
                    align="center"
                    gap={spacing.sm}
                    onClick={() => {
                      set("ai.model", m.value);
                      setOpen(false);
                    }}
                    css={{
                      width: "100%",
                      padding: `${spacing.sm} ${spacing.sm}`,
                      borderRadius: radii.md,
                      border: "none",
                      background: isActive
                        ? "var(--studio-bg-hover)"
                        : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                      transition: "all 0.1s ease",
                      "&:hover": { background: "var(--studio-bg-hover)" },
                    }}
                  >
                    <Icon
                      size={14}
                      style={{
                        color: isActive
                          ? "var(--studio-accent)"
                          : "var(--studio-text-muted)",
                        flexShrink: 0,
                      }}
                    />
                    <Box css={{ flex: 1 }}>
                      <Text variant="bodySmall" css={{ fontWeight: 500 }}>
                        {m.label}
                      </Text>
                      <Text variant="caption" color="muted">
                        {m.description}
                      </Text>
                    </Box>
                    {isActive && (
                      <Check
                        size={13}
                        style={{ color: "var(--studio-accent)", flexShrink: 0 }}
                      />
                    )}
                  </Flex>
                );
              })}
            </Box>
          </>,
          document.body,
        )}
    </Box>
  );
}
