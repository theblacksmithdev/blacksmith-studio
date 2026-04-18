import type { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";
import { KeyboardHint, spacing } from "@/components/shared/ui";
import { ModelSelector } from "@/components/chat/model-selector";
import { GraphifyChip } from "@/components/chat/graphify-chip";
import { AttachmentPickerButton } from "../attachments";
import { SendButton } from "./send-button";
import type { SendShortcut } from "./variants";

interface ComposerToolbarProps {
  leading?: ReactNode | null;
  attachmentsEnabled: boolean;
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  canSend: boolean;
  isStreaming?: boolean;
  onSend: () => void;
  onCancel?: () => void;
  sendShortcut: SendShortcut;
}

export function ComposerToolbar({
  leading,
  attachmentsEnabled,
  onFiles,
  disabled,
  canSend,
  isStreaming,
  onSend,
  onCancel,
  sendShortcut,
}: ComposerToolbarProps) {
  const hintText =
    sendShortcut === "cmd+enter" ? "\u2318+Enter" : "Shift+Enter for newline";

  return (
    <Flex
      align="center"
      justify="space-between"
      css={{
        padding: `0 ${spacing.sm} ${spacing.sm}`,
        position: "relative",
        zIndex: 2,
      }}
    >
      <Flex align="center" gap="2px">
        {attachmentsEnabled && (
          <AttachmentPickerButton onFiles={onFiles} disabled={disabled} />
        )}
        {leading === undefined ? (
          <>
            <ModelSelector />
            <GraphifyChip />
          </>
        ) : (
          leading
        )}
      </Flex>

      <Flex align="center" gap={spacing.sm}>
        <KeyboardHint keys={hintText} />
        <SendButton
          canSend={canSend}
          isStreaming={isStreaming}
          onSend={onSend}
          onCancel={onCancel}
          sendShortcut={sendShortcut}
        />
      </Flex>
    </Flex>
  );
}
