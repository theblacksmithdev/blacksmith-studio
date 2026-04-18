import { Box } from "@chakra-ui/react";
import { ArrowUp, Square } from "lucide-react";
import { IconButton, Tooltip, radii } from "@/components/shared/ui";
import type { SendShortcut } from "./variants";

interface SendButtonProps {
  canSend: boolean;
  isStreaming?: boolean;
  onSend: () => void;
  onCancel?: () => void;
  sendShortcut: SendShortcut;
}

export function SendButton({
  canSend,
  isStreaming,
  onSend,
  onCancel,
  sendShortcut,
}: SendButtonProps) {
  if (isStreaming && onCancel) {
    return (
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
    );
  }

  const tooltip =
    sendShortcut === "cmd+enter" ? "Send (Cmd+Enter)" : "Send (Enter)";

  return (
    <Tooltip content={tooltip}>
      <Box
        as="button"
        onClick={canSend ? onSend : undefined}
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
  );
}
