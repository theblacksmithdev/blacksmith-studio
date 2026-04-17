import { getDatabase } from "./connection.js";

export { getDatabase, closeDatabase } from "./connection.js";
export * as schema from "./schema.js";

/**
 * Drizzle database handle type. Repositories and services accept this
 * through their constructors so tests can substitute an in-memory
 * instance without touching the connection module.
 */
export type Database = ReturnType<typeof getDatabase>;
