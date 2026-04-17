import { getDatabase } from "../../db/index.js";

/**
 * Convenience alias for the Drizzle database handle. Repositories and
 * services accept this through their constructors — tests can substitute
 * an in-memory instance without touching the connection module.
 */
export type Database = ReturnType<typeof getDatabase>;

export interface ConversationArtifact {
  path: string;
  tool: string;
  role: string;
  timestamp: string;
}
