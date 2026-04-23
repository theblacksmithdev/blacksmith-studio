import { ReactFlowProvider } from "@xyflow/react";
import {
  Activity,
  Gauge,
  ListTodo,
  MessageSquare,
  Square,
  Terminal,
} from "lucide-react";
import { Tooltip } from "@/components/shared/tooltip";
import { ConfirmDialog } from "@/components/shared/ui";
import { SplitPanel } from "@/components/shared/layout";
import { TimelineDrawer } from "@/components/shared/event-timeline";
import type { AttachmentRecord } from "@/components/shared/conversation";
import { AgentCanvas } from "./components/canvas";
import { AgentChat } from "./components/chat";
import { AgentCommandsDrawer } from "./components/commands";
import { AgentDetail } from "./components/detail";
import { AgentInnerView } from "./components/inner-view";
import { TaskDrawer } from "./components/drawer";
import { AgentStatsDrawer } from "./components/stats";
import { AgentMainPanel } from "./components/agent-main-panel";
import {
  Layout,
  CanvasPanel,
  ButtonGroup,
  GroupDivider,
  TasksBtn,
  ChatBtn,
  StopBtn,
  Badge,
  UnreadDot,
} from "./components/styles";
import { useAgentsPage } from "./hooks/use-agents-page";

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
  const {
    agents,
    selectedAgentInfo,
    innerViewAgent,
    chatOpen,
    drawerOpen,
    timelineOpen,
    statsOpen,
    commandsOpen,
    hasUnread,
    showStopConfirm,
    toggleChat,
    openDrawer,
    closeDrawer,
    openTimeline,
    closeTimeline,
    toggleStats,
    closeStats,
    toggleCommands,
    closeCommands,
    closeInnerView,
    closeStopConfirm,
    isProcessing,
    hasTasks,
    hasRunning,
    completedCount,
    totalTaskCount,
    onRespond,
    onStop,
    confirmStop,
    onNodeClick,
    onNodeDoubleClick,
    openInnerView,
    clearSelectedAgent,
  } = useAgentsPage({ conversationId, onSend, isDispatching });

  // Inner view replaces the whole page
  if (innerViewAgent) {
    return (
      <Layout>
        <AgentInnerView agent={innerViewAgent} onBack={closeInnerView} />
      </Layout>
    );
  }

  const chatPanel = (
    <AgentChat
      onSend={onSend}
      onRespond={onRespond}
      isProcessing={isProcessing}
      conversationId={conversationId}
    />
  );

  const canvas = (
    <CanvasPanel>
      <ReactFlowProvider>
        <AgentCanvas
          agents={agents}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          conversationId={conversationId}
        />
      </ReactFlowProvider>

      {/* Floating buttons — grouped by intent:
          [Chat toggle]  │  [Tasks · Timeline · Stats]  │  [Stop] */}
      <ButtonGroup>
        <Tooltip content={chatOpen ? "Hide chat" : "Show chat"}>
          <ChatBtn $active={chatOpen} onClick={toggleChat}>
            <MessageSquare size={14} />
            Chat
            {hasUnread && !chatOpen && <UnreadDot />}
          </ChatBtn>
        </Tooltip>

        <GroupDivider />

        <Tooltip content="View task plan">
          <TasksBtn
            $active={hasRunning}
            $hasTasks={hasTasks}
            onClick={openDrawer}
          >
            <ListTodo size={14} />
            Tasks
            {hasTasks && (
              <Badge>
                {completedCount}/{totalTaskCount}
              </Badge>
            )}
          </TasksBtn>
        </Tooltip>

        <Tooltip content="View conversation timeline">
          <ChatBtn onClick={openTimeline}>
            <Activity size={14} />
            Timeline
          </ChatBtn>
        </Tooltip>

        <Tooltip content="Conversation stats & cost">
          <ChatBtn $active={statsOpen} onClick={toggleStats}>
            <Gauge size={14} />
            Stats
          </ChatBtn>
        </Tooltip>

        <Tooltip content="Subprocesses agents ran in this conversation">
          <ChatBtn $active={commandsOpen} onClick={toggleCommands}>
            <Terminal size={14} />
            Commands
          </ChatBtn>
        </Tooltip>

        {isProcessing && (
          <>
            <GroupDivider />
            <Tooltip content="Stop all agents">
              <StopBtn onClick={onStop}>
                <Square size={12} />
                Stop
              </StopBtn>
            </Tooltip>
          </>
        )}
      </ButtonGroup>

      {/* Agent detail panel */}
      {selectedAgentInfo && (
        <AgentDetail
          agent={selectedAgentInfo}
          onClose={clearSelectedAgent}
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

      {drawerOpen && <TaskDrawer onClose={closeDrawer} />}

      {timelineOpen && (
        <TimelineDrawer
          scope="agent_chat"
          conversationId={conversationId}
          onClose={closeTimeline}
          hideMessages
        />
      )}

      {statsOpen && conversationId && (
        <AgentStatsDrawer
          conversationId={conversationId}
          onClose={closeStats}
        />
      )}

      {commandsOpen && conversationId && (
        <AgentCommandsDrawer
          conversationId={conversationId}
          onClose={closeCommands}
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
          onCancel={closeStopConfirm}
        />
      )}
    </Layout>
  );
}
