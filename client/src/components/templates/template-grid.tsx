import { useState } from "react";
import { Box, Text, useDisclosure } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { TemplateCard } from "./template-card";
import { TemplateModal } from "./template-modal";
import { PageContainer } from "@/components/shared/page-container";
import { usePromptTemplatesQuery } from "@/api/hooks/prompt-templates";
import { useCreateSession } from "@/api/hooks/sessions";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { useAiChat } from "@/hooks/use-ai-chat";
import { useSessionStore } from "@/stores/session-store";
import { chatPath } from "@/router/paths";
import type { PromptTemplate } from "@/types";

export function TemplateGrid() {
  const { data: templates = [] } = usePromptTemplatesQuery();
  const [selected, setSelected] = useState<PromptTemplate | null>(null);
  const { open, onOpen, onClose } = useDisclosure();
  const { sendPrompt } = useAiChat();
  const createSession = useCreateSession();
  const activeSessionId = useSessionStore((s) => s.activeSessionId);
  const navigate = useNavigate();
  const pid = useActiveProjectId();

  const handleSelect = (template: PromptTemplate) => {
    setSelected(template);
    onOpen();
  };

  const handleSubmit = async (prompt: string) => {
    if (!pid) return;
    let sessionId = activeSessionId;
    if (!sessionId) {
      const session = await createSession.mutateAsync(undefined);
      sessionId = session.id;
    }
    sendPrompt(prompt, sessionId!);
    navigate(chatPath(pid, sessionId!));
  };

  return (
    <PageContainer size="lg">
      <Box css={{ marginBottom: "28px" }}>
        <Text
          css={{
            fontSize: "24px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--studio-text-primary)",
            marginBottom: "6px",
          }}
        >
          What do you want to build?
        </Text>
        <Text
          css={{
            fontSize: "15px",
            color: "var(--studio-text-tertiary)",
          }}
        >
          Choose a template to get started quickly
        </Text>
      </Box>

      <Box
        css={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "12px",
        }}
      >
        {templates.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            onClick={() => handleSelect(t)}
          />
        ))}
      </Box>

      {selected && (
        <TemplateModal
          template={selected}
          isOpen={open}
          onClose={() => {
            onClose();
            setSelected(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </PageContainer>
  );
}
