import { useMemo } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Drawer } from "@/components/shared/ui";
import { MessageList } from "@/components/chat/message-list";
import { ConversationInput } from "@/components/shared/conversation";
import { useAiChat } from "@/hooks/use-ai-chat";
import { useChatStore } from "@/stores/chat-store";
import { useSessionQuery } from "@/api/hooks/sessions";

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
  const { sendPrompt, cancelPrompt } = useAiChat();
  const { isStreaming, partialMessage, pendingMessages } = useChatStore();
  const { data: session } = useSessionQuery(sessionId);

  const messages = useMemo(
    () => [...(session?.messages ?? []), ...pendingMessages],
    [session?.messages, pendingMessages],
  );

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
          <ConversationInput
            onSend={(text) => sendPrompt(text, sessionId)}
            onCancel={() => cancelPrompt(sessionId)}
            isStreaming={isStreaming}
            initialValue={initialPrompt}
            sendShortcut="cmd+enter"
          />
        </Box>
      </Flex>
    </Drawer>
  );
}
