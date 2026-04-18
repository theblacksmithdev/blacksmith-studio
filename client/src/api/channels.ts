import { singleAgent } from "./modules/single-agent";
import { projects } from "./modules/projects";
import { files } from "./modules/files";
import { runner } from "./modules/runner";
import { git } from "./modules/git";
import { terminal } from "./modules/terminal";
import { multiAgents } from "./modules/multi-agents";
import { conversationEvents } from "./modules/conversation-events";
import { artifacts } from "./modules/artifacts";
import { python } from "./modules/python";
import { graphify } from "./modules/graphify";
import { windowApi } from "./modules/window";

/**
 * A subscribe function: takes a callback, returns an unsubscribe function.
 */
type SubscribeFn<T> = (cb: (data: T) => void) => () => void;

/**
 * Registry of all subscription (push) channels.
 *
 * Channels can be:
 * - **Direct**: `(cb) => unsub` — no arguments needed
 * - **Factory**: `(arg1, arg2) => (cb) => unsub` — requires arguments
 *
 * @example
 * // Direct channel (no args)
 * const { last } = useChannel('git:statusChange', { replace: true })
 *
 * // Factory channel (with args)
 * const { messages } = useChannel('runner:output', { ... })
 */
export const channels = {
  // Claude
  "singleAgent:message": singleAgent.onMessage,
  "singleAgent:toolUse": singleAgent.onToolUse,
  "singleAgent:done": singleAgent.onDone,
  "singleAgent:error": singleAgent.onError,

  // Projects
  "projects:createOutput": projects.onCreateOutput,
  "projects:createDone": projects.onCreateDone,
  "projects:createError": projects.onCreateError,

  // Files
  "files:changed": files.onChanged,

  // Runner
  "runner:status": runner.onStatus,
  "runner:output": runner.onOutput,

  // Git
  "git:statusChange": git.onStatusChange,

  // Terminal
  "terminal:output": terminal.onOutput,
  "terminal:exit": terminal.onExit,

  // Agents
  "multiAgents:event": multiAgents.onEvent,
  "multiAgents:workflowEvent": multiAgents.onWorkflowEvent,
  "multiAgents:buildEvent": multiAgents.onBuildEvent,
  "multiAgents:inputRequest": multiAgents.onInputRequest,

  // Conversation events (unified append stream for reload-fidelity UIs)
  "conversationEvents:append": conversationEvents.onAppend,

  // Artifact mutations (file + DB) for library + conversation panel
  "artifacts:changed": artifacts.onChanged,

  // Python
  "python:progress": python.onProgress,

  // Graphify
  "graphify:buildProgress": graphify.onBuildProgress,

  // Window
  "window:fullscreen": windowApi.onFullscreen,
} as const;

/** Channel key — one of the registered subscription channels */
export type ChannelKey = keyof typeof channels;

/**
 * Infer the data type for a given channel.
 * Works for both direct subscribe functions and factory functions.
 */
export type ChannelData<K extends ChannelKey> =
  (typeof channels)[K] extends SubscribeFn<infer D>
    ? D
    : (typeof channels)[K] extends (...args: any[]) => SubscribeFn<infer D>
      ? D
      : never;

/**
 * Infer the argument types for a factory channel.
 * Returns `[]` for direct subscribe functions (no args needed).
 */
export type ChannelArgs<K extends ChannelKey> =
  (typeof channels)[K] extends SubscribeFn<any>
    ? []
    : (typeof channels)[K] extends (...args: infer A) => SubscribeFn<any>
      ? A
      : never;
