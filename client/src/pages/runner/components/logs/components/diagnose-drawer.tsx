import { Flex, Box } from "@chakra-ui/react";
import { Drawer } from "@/components/shared/ui";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { useClaude } from "@/hooks/use-claude";
import { useChatStore } from "@/stores/chat-store";

interface DiagnoseDrawerProps {
  sessionId: string;
  initialPrompt: string;
  title: string;
  onClose: () => void;
}

export function DiagnoseDrawer({
  sessionId,
  initialPrompt,
  title,
  onClose,
}: DiagnoseDrawerProps) {
  const { sendPrompt, cancelPrompt } = useClaude();
  const { messages, isStreaming, partialMessage } = useChatStore();

  return (
    <Drawer title={title} onClose={onClose} size="lg" placement="end">
      <Flex
        direction="column"
        css={{ height: "100%", margin: "-20px", marginTop: "-8px" }}
      >
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          partialMessage={partialMessage}
        />
        <Box css={{ padding: "0 16px 12px", flexShrink: 0 }}>
          <ChatInput
            onSend={(text) => sendPrompt(text, sessionId)}
            onCancel={() => cancelPrompt(sessionId)}
            isStreaming={isStreaming}
            initialValue={initialPrompt}
          />
        </Box>
      </Flex>
    </Drawer>
  );
}
