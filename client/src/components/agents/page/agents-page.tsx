import { useEffect, useCallback, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import { Activity, ListTodo, MessageSquare, Square } from "lucide-react";
import {
  useAgentsListQuery,
  useAgentRespond,
  useAgentCancelAll,
  useAgentChatQuery,
} from "@/api/hooks/agents";
import { useAgentStore } from "@/stores/agent-store";
import { Tooltip } from "@/components/shared/tooltip";
import { ConfirmDialog } from "@/components/shared/ui";
import { SplitPanel } from "@/components/shared/layout";
import { AgentCanvas } from "../canvas";
import { AgentChat } from "../chat";
import { AgentDetail } from "../detail";
import { AgentInnerView } from "../inner-view";
import { TaskDrawer } from "../drawer";
import { TimelineDrawer } from "@/components/shared/event-timeline";
import { AgentMainPanel } from "./agent-main-panel";
import { useAgentEvents } from "./use-agent-events";
import {
  Layout,
  CanvasPanel,
  ButtonGroup,
  TasksBtn,
  ChatBtn,
  StopBtn,
  Badge,
  UnreadDot,
} from "./styles";
import type { AgentRole } from "@/api/types";

import type { AttachmentRecord } from "@/components/shared/conversation";

interface AgentsPageProps {
  conversationId?: string;
  onSend: (message: string, attachments?: AttachmentRecord[]) => void;
  /**
   * True while the PM dispatch mutation is in flight — before any
   * agent has flipped to running. Lets the Stop button appear from
   * the moment send is pressed, not only once a worker picks up a
   * task deep in the pipeline.
   */
  isDispatching?: boolean;
}

export function AgentsPage({
  conversationId,
  onSend,
  isDispatching = false,
}: AgentsPageProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const [innerViewRole, setInnerViewRole] = useState<AgentRole | null>(null);
  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;

  const { data: agents = [] } = useAgentsListQuery();
  const respondMutation = useAgentRespond();
  const cancelAllMutation = useAgentCancelAll();

  const setAgents = useAgentStore((s) => s.setAgents);
  const removeInputRequest = useAgentStore((s) => s.removeInputRequest);
  const selectedAgent = useAgentStore((s) => s.selectedAgent);
  const selectAgent = useAgentStore((s) => s.selectAgent);
  const buildActive = useAgentStore((s) => s.buildActive);
  const dispatchTasks = useAgentStore((s) => s.dispatchTasks);
  const liveMessages = useAgentStore((s) => s.liveMessages);

  useEffect(() => {
    if (agents.length > 0) setAgents(agents);
  }, [agents, setAgents]);

  useAgentEvents();

  // Persisted messages for the active conversation — used for unread tracking
  const { data: persistedMsgs = [] } = useAgentChatQuery(conversationId);
  const totalMsgCount = persistedMsgs.length + liveMessages.length;

  // Auto-send initial prompt from route state
  const location = useLocation();
  const initialPromptSent = useRef(false);
  useEffect(() => {
    const state = location.state as {
      initialPrompt?: string;
      initialAttachments?: AttachmentRecord[];
    } | null;
    if (state?.initialPrompt && !initialPromptSent.current) {
      initialPromptSent.current = true;
      onSend(state.initialPrompt, state.initialAttachments);
    }
  }, [location.state, onSend]);

  // Track unread messages when chat is closed
  const prevCountRef = useRef(totalMsgCount);
  useEffect(() => {
    if (totalMsgCount > prevCountRef.current && !chatOpenRef.current) {
      setHasUnread(true);
    }
    prevCountRef.current = totalMsgCount;
  }, [totalMsgCount]);

  const toggleChat = useCallback(() => {
    setChatOpen((v) => {
      if (!v) setHasUnread(false);
      return !v;
    });
  }, []);

  const handleRespond = useCallback(
    async (requestId: string, value: string) => {
      removeInputRequest(requestId);
      await respondMutation.mutateAsync({ requestId, value });
    },
    [removeInputRequest, respondMutation],
  );

  const [showStopConfirm, setShowStopConfirm] = useState(false);

  const handleStop = useCallback(() => {
    setShowStopConfirm(true);
  }, []);

  const confirmStop = useCallback(async () => {
    setShowStopConfirm(false);
    await cancelAllMutation.mutateAsync();
  }, [cancelAllMutation]);

  const handleNodeClick = useCallback(
    (role: AgentRole) => {
      selectAgent(selectedAgent === role ? null : role);
    },
    [selectedAgent, selectAgent],
  );

  const handleNodeDoubleClick = useCallback(
    (role: AgentRole) => {
      selectAgent(null);
      setInnerViewRole(role);
    },
    [selectAgent],
  );

  const openInnerView = useCallback(
    (role: AgentRole) => {
      selectAgent(null);
      setInnerViewRole(role);
    },
    [selectAgent],
  );

  const selectedAgentInfo = agents.find((a) => a.role === selectedAgent);
  const innerViewAgent = innerViewRole
    ? agents.find((a) => a.role === innerViewRole)
    : null;
  const hasTasks = dispatchTasks.length > 0;
  const completedCount = dispatchTasks.filter(
    (t) => t.status === "done",
  ).length;
  const hasRunning = dispatchTasks.some((t) => t.status === "running");
  // "Actively doing something" — true while the PM mutation is in flight,
  // while a build is running, while any agent is running, or while any
  // dispatched task is still pending/running. The Stop button is gated
  // on this so users can cancel at any phase — PM planning, between
  // tasks, or mid-execution.
  const hasPendingOrRunningTask = dispatchTasks.some(
    (t) => t.status === "pending" || t.status === "running",
  );
  const isProcessing =
    isDispatching ||
    buildActive ||
    agents.some((a) => a.isRunning) ||
    hasPendingOrRunningTask;

  // Inner view replaces the whole page
  if (innerViewAgent) {
    return (
      <Layout>
        <AgentInnerView
          agent={innerViewAgent}
          onBack={() => setInnerViewRole(null)}
        />
      </Layout>
    );
  }

  const chatPanel = (
    <AgentChat
      onSend={onSend}
      onRespond={handleRespond}
      isProcessing={isProcessing}
      conversationId={conversationId}
    />
  );

  const canvas = (
    <CanvasPanel>
      <ReactFlowProvider>
        <AgentCanvas
          agents={agents}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          conversationId={conversationId}
        />
      </ReactFlowProvider>

      {/* Floating buttons */}
      <ButtonGroup>
        <Tooltip content={chatOpen ? "Hide chat" : "Show chat"}>
          <ChatBtn $active={chatOpen} onClick={toggleChat}>
            <MessageSquare size={14} />
            Chat
            {hasUnread && !chatOpen && <UnreadDot />}
          </ChatBtn>
        </Tooltip>

        <Tooltip content="View task plan">
          <TasksBtn
            $active={hasRunning}
            $hasTasks={hasTasks}
            onClick={() => setDrawerOpen(true)}
          >
            <ListTodo size={14} />
            Tasks
            {hasTasks && (
              <Badge>
                {completedCount}/{dispatchTasks.length}
              </Badge>
            )}
          </TasksBtn>
        </Tooltip>

        <Tooltip content="View conversation timeline">
          <ChatBtn onClick={() => setTimelineOpen(true)}>
            <Activity size={14} />
            Timeline
          </ChatBtn>
        </Tooltip>

        {isProcessing && (
          <Tooltip content="Stop all agents">
            <StopBtn onClick={handleStop}>
              <Square size={12} />
              Stop
            </StopBtn>
          </Tooltip>
        )}
      </ButtonGroup>

      {/* Agent detail panel */}
      {selectedAgentInfo && (
        <AgentDetail
          agent={selectedAgentInfo}
          onClose={() => selectAgent(null)}
          onOpenInnerView={() => openInnerView(selectedAgentInfo.role)}
        />
      )}
    </CanvasPanel>
  );

  const mainPanel = (
    <AgentMainPanel canvas={canvas} conversationId={conversationId} />
  );

  return (
    <Layout>
      <SplitPanel
        left={chatPanel}
        defaultWidth={360}
        minWidth={280}
        maxWidth={500}
        storageKey="agents.chatWidth"
        open={chatOpen}
      >
        {mainPanel}
      </SplitPanel>

      {drawerOpen && <TaskDrawer onClose={() => setDrawerOpen(false)} />}

      {timelineOpen && (
        <TimelineDrawer
          scope="agent_chat"
          conversationId={conversationId}
          onClose={() => setTimelineOpen(false)}
          hideMessages
        />
      )}

      {showStopConfirm && (
        <ConfirmDialog
          message="Stop all running agents?"
          description="This will cancel the current task and skip all remaining tasks in the pipeline."
          confirmLabel="Stop All"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={confirmStop}
          onCancel={() => setShowStopConfirm(false)}
        />
      )}
    </Layout>
  );
}
