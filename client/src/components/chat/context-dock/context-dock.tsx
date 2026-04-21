import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { useLocation } from "react-router-dom";
import { useSessionStore } from "@/stores/session-store";
import { useSessionMeter } from "@/api/hooks/usage";
import { ContextMeter } from "../context-meter";

/**
 * Floating AI context meter — visible globally alongside (but separate
 * from) the runner dock. Hides on the chat page since the chat header
 * already shows the meter, and when there's no active session with
 * recorded token usage yet.
 */
export function ContextDock() {
  const location = useLocation();
  const activeSessionId = useSessionStore((s) => s.activeSessionId);

  const { data } = useSessionMeter("chat-session", activeSessionId);

  const onChatPage = location.pathname.includes("/chat");
  if (onChatPage) return null;
  if (!activeSessionId || !data || data.used === 0) return null;

  return (
    <Wrap>
      <ContextMeter scope="chat-session" scopeId={activeSessionId} />
    </Wrap>
  );
}

const scaleIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Wrap = styled.div`
  position: fixed;
  bottom: 20px;
  left: 24px;
  z-index: 900;
  animation: ${scaleIn} 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.08));
`;
