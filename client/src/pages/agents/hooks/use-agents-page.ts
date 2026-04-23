import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  useAgentCancelAll,
  useAgentChatQuery,
  useAgentRespond,
  useAgentsListQuery,
} from "@/api/hooks/agents";
import { useAgentStore } from "@/stores/agent-store";
import type { AgentInfo, AgentRole } from "@/api/types";
import type { AttachmentRecord } from "@/components/shared/conversation";
import { useAgentEvents } from "./use-agent-events";

interface UseAgentsPageArgs {
  conversationId?: string;
  onSend: (message: string, attachments?: AttachmentRecord[]) => void;
  isDispatching: boolean;
}

/**
 * Owns all the state, queries, effects, and handlers that drive the
 * AgentsPage surface. The page component itself is purely
 * presentational — it takes this hook's return value and wires it
 * into the render tree.
 */
export function useAgentsPage({
  conversationId,
  onSend,
  isDispatching,
}: UseAgentsPageArgs) {
  // ── Data ──────────────────────────────────────────────────────────
  const { data: agents = [] } = useAgentsListQuery();
  const { data: persistedMsgs = [] } = useAgentChatQuery(conversationId);
  const respondMutation = useAgentRespond();
  const cancelAllMutation = useAgentCancelAll();

  // ── Store subscriptions ───────────────────────────────────────────
  const setAgents = useAgentStore((s) => s.setAgents);
  const removeInputRequest = useAgentStore((s) => s.removeInputRequest);
  const selectedAgent = useAgentStore((s) => s.selectedAgent);
  const selectAgent = useAgentStore((s) => s.selectAgent);
  const buildActive = useAgentStore((s) => s.buildActive);
  const dispatchTasks = useAgentStore((s) => s.dispatchTasks);
  const liveMessages = useAgentStore((s) => s.liveMessages);

  // ── Panel state ───────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const [innerViewRole, setInnerViewRole] = useState<AgentRole | null>(null);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;

  // ── Agent + message event subscriptions ──────────────────────────
  useAgentEvents();

  // Mirror the agents query into the store so downstream components
  // that read from the store (canvas nodes, detail panel, etc.) stay
  // in sync without each subscribing to the query separately.
  useEffect(() => {
    if (agents.length > 0) setAgents(agents);
  }, [agents, setAgents]);

  // Auto-send the initial prompt carried in route state (from home-page
  // → /new flow). Guarded so StrictMode double-mount doesn't re-fire.
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

  // Unread dot on the Chat toggle when new messages arrive while
  // the chat panel is closed.
  const totalMsgCount = persistedMsgs.length + liveMessages.length;
  const prevCountRef = useRef(totalMsgCount);
  useEffect(() => {
    if (totalMsgCount > prevCountRef.current && !chatOpenRef.current) {
      setHasUnread(true);
    }
    prevCountRef.current = totalMsgCount;
  }, [totalMsgCount]);

  // ── Derived state ────────────────────────────────────────────────
  const selectedAgentInfo: AgentInfo | undefined = agents.find(
    (a) => a.role === selectedAgent,
  );
  const innerViewAgent: AgentInfo | null = innerViewRole
    ? (agents.find((a) => a.role === innerViewRole) ?? null)
    : null;

  const totalTaskCount = dispatchTasks.length;
  const completedCount = dispatchTasks.filter(
    (t) => t.status === "done",
  ).length;
  const hasTasks = totalTaskCount > 0;
  const hasRunning = dispatchTasks.some((t) => t.status === "running");
  const hasPendingOrRunningTask = dispatchTasks.some(
    (t) => t.status === "pending" || t.status === "running",
  );

  // "Actively doing something" — true while the PM mutation is in
  // flight, while a build is running, while any agent is running, or
  // while any dispatched task is still pending/running. The Stop
  // button is gated on this so users can cancel at any phase — PM
  // planning, between tasks, or mid-execution.
  const isProcessing =
    isDispatching ||
    buildActive ||
    agents.some((a) => a.isRunning) ||
    hasPendingOrRunningTask;

  // ── Handlers ──────────────────────────────────────────────────────
  const toggleChat = useCallback(() => {
    setChatOpen((v) => {
      if (!v) setHasUnread(false);
      return !v;
    });
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openTimeline = useCallback(() => setTimelineOpen(true), []);
  const closeTimeline = useCallback(() => setTimelineOpen(false), []);
  const toggleStats = useCallback(() => setStatsOpen((v) => !v), []);
  const closeStats = useCallback(() => setStatsOpen(false), []);
  const toggleCommands = useCallback(() => setCommandsOpen((v) => !v), []);
  const closeCommands = useCallback(() => setCommandsOpen(false), []);
  const closeInnerView = useCallback(() => setInnerViewRole(null), []);
  const clearSelectedAgent = useCallback(
    () => selectAgent(null),
    [selectAgent],
  );

  const openInnerView = useCallback(
    (role: AgentRole) => {
      selectAgent(null);
      setInnerViewRole(role);
    },
    [selectAgent],
  );

  const onNodeClick = useCallback(
    (role: AgentRole) => {
      selectAgent(selectedAgent === role ? null : role);
    },
    [selectedAgent, selectAgent],
  );

  const onNodeDoubleClick = useCallback(
    (role: AgentRole) => {
      selectAgent(null);
      setInnerViewRole(role);
    },
    [selectAgent],
  );

  const onRespond = useCallback(
    async (requestId: string, value: string) => {
      removeInputRequest(requestId);
      await respondMutation.mutateAsync({ requestId, value });
    },
    [removeInputRequest, respondMutation],
  );

  const onStop = useCallback(() => {
    setShowStopConfirm(true);
  }, []);

  const closeStopConfirm = useCallback(
    () => setShowStopConfirm(false),
    [],
  );

  const confirmStop = useCallback(async () => {
    setShowStopConfirm(false);
    await cancelAllMutation.mutateAsync();
  }, [cancelAllMutation]);

  return {
    // Presence
    agents,
    selectedAgentInfo,
    innerViewAgent,

    // Panel state + toggles
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

    // Dispatch status
    isProcessing,
    hasTasks,
    hasRunning,
    completedCount,
    totalTaskCount,

    // Handlers
    onRespond,
    onStop,
    confirmStop,
    onNodeClick,
    onNodeDoubleClick,
    openInnerView,
    clearSelectedAgent,
  };
}
