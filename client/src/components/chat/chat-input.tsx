import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Flex, Box } from "@chakra-ui/react";
import {
  ArrowUp,
  Square,
  ChevronDown,
  Check,
  Zap,
  Sparkles,
  Brain,
} from "lucide-react";
import {
  Text,
  IconButton,
  Tooltip,
  KeyboardHint,
  spacing,
  radii,
  shadows,
} from "@/components/shared/ui";
import { useSettings } from "@/hooks/use-settings";

const MODELS = [
  { id: "sonnet", label: "Sonnet", description: "Fast & capable", icon: Zap },
  { id: "opus", label: "Opus", description: "Most intelligent", icon: Brain },
  {
    id: "haiku",
    label: "Haiku",
    description: "Fastest responses",
    icon: Sparkles,
  },
] as const;

interface ChatInputProps {
  onSend: (text: string) => void;
  onCancel: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  /** Pre-fill the input with this text on mount */
  initialValue?: string;
}

export function ChatInput({
  onSend,
  onCancel,
  isStreaming,
  disabled,
  initialValue,
}: ChatInputProps) {
  const [value, setValue] = useState(initialValue ?? "");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { model, set } = useSettings();

  const MAX_HEIGHT = 450;

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
    // Reset height after sending
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeModel = MODELS.find((m) => m.id === model) || MODELS[0];
  const ActiveIcon = activeModel.icon;
  const canSend = !!value.trim() && !disabled;

  return (
    <Box css={{ width: "100%" }}>
      <Box
        css={{
          position: "relative",
          background: "var(--studio-bg-surface)",
          borderRadius: radii["2xl"],
          border: "1px solid var(--studio-border)",
          transition: "all 0.2s ease",
          boxShadow: shadows.sm,
          "&:focus-within": {
            borderColor: "var(--studio-border-hover)",
            boxShadow: shadows.lg,
          },
        }}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Claude to build something..."
          disabled={disabled}
          rows={1}
          style={{
            width: "100%",
            minHeight: "44px",
            padding: `${spacing.md} ${spacing.xl}`,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            overflowY: "hidden",
            color: "var(--studio-text-primary)",
            fontSize: "15px",
            lineHeight: "1.6",
            fontFamily: "inherit",
          }}
        />

        {/* Bottom bar */}
        <Flex
          align="center"
          justify="space-between"
          css={{ padding: `0 ${spacing.sm} ${spacing.sm}` }}
        >
          {/* Model selector */}
          <Box css={{ position: "relative" }}>
            <Flex
              as="button"
              ref={triggerRef}
              align="center"
              gap={spacing.xs}
              onClick={() => setModelMenuOpen(!modelMenuOpen)}
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
              {activeModel.label}
              <ChevronDown
                size={10}
                style={{
                  transform: modelMenuOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.15s",
                }}
              />
            </Flex>

            {modelMenuOpen &&
              createPortal(
                <>
                  <Box
                    onClick={() => setModelMenuOpen(false)}
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
                      left:
                        triggerRef.current?.getBoundingClientRect().left ?? 0,
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
                    {MODELS.map((m) => {
                      const Icon = m.icon;
                      const isActive = m.id === model;
                      return (
                        <Flex
                          as="button"
                          key={m.id}
                          align="center"
                          gap={spacing.sm}
                          onClick={() => {
                            set("ai.model", m.id);
                            setModelMenuOpen(false);
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
                              style={{
                                color: "var(--studio-accent)",
                                flexShrink: 0,
                              }}
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

          {/* Actions */}
          <Flex align="center" gap={spacing.sm}>
            <KeyboardHint keys={"\u2318+Enter"} />

            {isStreaming ? (
              <Tooltip content="Stop generation">
                <IconButton
                  variant="danger"
                  size="sm"
                  onClick={onCancel}
                  aria-label="Stop"
                  css={{ borderRadius: radii.lg }}
                >
                  <Square size={10} fill="currentColor" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip content="Send (Cmd+Enter)">
                <Box
                  as="button"
                  onClick={canSend ? handleSend : undefined}
                  css={{
                    width: "30px",
                    height: "30px",
                    borderRadius: radii.lg,
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: canSend ? "pointer" : "default",
                    transition: "all 0.15s ease",
                    background: canSend
                      ? "var(--studio-accent)"
                      : "var(--studio-bg-hover)",
                    color: canSend
                      ? "var(--studio-accent-fg)"
                      : "var(--studio-text-muted)",
                    "&:hover": canSend ? { transform: "scale(1.05)" } : {},
                  }}
                >
                  <ArrowUp size={15} />
                </Box>
              </Tooltip>
            )}
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
