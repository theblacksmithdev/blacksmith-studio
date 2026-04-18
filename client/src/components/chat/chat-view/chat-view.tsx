import { useCallback } from "react";
import styled from "@emotion/styled";
import { Flex, Box } from "@chakra-ui/react";
import { PanelRight, History } from "lucide-react";
import {
  ConversationView,
  AttachmentPreviewModal,
} from "@/components/shared/conversation";
import { StreamingIndicator } from "../streaming-indicator";
import { HistoryPanel } from "../history-panel";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { PreviewPanel } from "@/components/shared/preview-panel";
import { SplitPanel } from "@/components/shared/layout";
import { IconButton, Tooltip, spacing } from "@/components/shared/ui";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { useChatSession } from "./hooks/use-chat-session";
import { useChatPanels } from "./hooks/use-chat-panels";

const Root = styled(Flex)`
  height: 100%;
  overflow: hidden;
`;

export function ChatView() {
  const projectId = useActiveProjectId();
  const {
    sessionId,
    conversationMessages,
    isStreaming,
    partialMessage,
    handleSend,
    handleCancel,
    previewAttachment,
    closeAttachment,
  } = useChatSession();

  const {
    previewOpen,
    historyOpen,
    togglePreview,
    toggleHistory,
    closePreview,
  } = useChatPanels();

  const renderContent = useCallback(
    (content: string) => <MarkdownRenderer content={content} />,
    [],
  );

  const chatContent = (
    <Flex direction="column" css={{ flex: 1, minWidth: 0, height: "100%" }}>
      <Flex align="center" css={{ padding: spacing.sm, flexShrink: 0 }}>
        <Tooltip content={historyOpen ? "Close history" : "Chat history"}>
          <IconButton
            variant={historyOpen ? "default" : "ghost"}
            size="sm"
            onClick={toggleHistory}
            aria-label="Toggle history"
          >
            <History />
          </IconButton>
        </Tooltip>
        <Box css={{ flex: 1 }} />
        <Tooltip content={previewOpen ? "Close preview" : "Open preview"}>
          <IconButton
            variant={previewOpen ? "default" : "ghost"}
            size="sm"
            onClick={togglePreview}
            aria-label="Toggle preview"
          >
            <PanelRight />
          </IconButton>
        </Tooltip>
      </Flex>

      <ConversationView
        messages={conversationMessages}
        onSend={handleSend}
        onCancel={handleCancel}
        isStreaming={isStreaming}
        placeholder="Ask Claude to build something..."
        renderContent={renderContent}
        projectId={projectId ?? undefined}
        conversationId={sessionId ?? undefined}
        streamingTrailing={
          isStreaming ? (
            <StreamingIndicator partialMessage={partialMessage} />
          ) : undefined
        }
      />
    </Flex>
  );

  const mainContent = (
    <SplitPanel
      left={chatContent}
      defaultWidth={600}
      minWidth={360}
      maxWidth={900}
      storageKey="chat.previewSplit"
      reverse
      open={previewOpen}
    >
      <PreviewPanel onClose={closePreview} />
    </SplitPanel>
  );

  return (
    <Root>
      <SplitPanel
        left={<HistoryPanel />}
        defaultWidth={260}
        minWidth={200}
        maxWidth={400}
        storageKey="chat.historyWidth"
        open={historyOpen}
      >
        {mainContent}
      </SplitPanel>
      {previewAttachment && projectId && (
        <AttachmentPreviewModal
          projectId={projectId}
          record={previewAttachment}
          onClose={closeAttachment}
        />
      )}
    </Root>
  );
}
