import { getDatabase, type Database } from "../../db/index.js";
import { ModelCatalog } from "../ai/model-catalog.js";
import { ChatSessionUsageSource } from "./sources/chat-session-source.js";
import { AgentTaskUsageSource } from "./sources/agent-task-source.js";
import { UsageService } from "./usage-service.js";

export { UsageService } from "./usage-service.js";
export type {
  AgentRollup,
  ConversationStats,
  HistoryScope,
  ModelRollup,
  ScopeAggregate,
  ScopeDetail,
  SessionMeter,
  TokenBreakdown,
  UsageHistory,
  UsageRecord,
  UsageScope,
  UsageTurn,
} from "./types.js";
export type { UsageSource } from "./source.js";
export type { HistorySource } from "./history-source.js";

/** Build a UsageService with the default source set. Tests inject a Database. */
export function createUsageService(db: Database = getDatabase()): UsageService {
  const catalog = new ModelCatalog();
  const chat = new ChatSessionUsageSource(db, catalog);
  const agent = new AgentTaskUsageSource(db, catalog);
  return new UsageService([chat, agent], [chat, agent], catalog, agent);
}
