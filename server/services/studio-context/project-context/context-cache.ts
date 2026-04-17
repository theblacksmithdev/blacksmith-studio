import { CONTEXT_CACHE_TTL_MS } from "./constants.js";

interface CacheEntry {
  value: string;
  timestamp: number;
}

/**
 * Per-project TTL cache for generated project context.
 *
 * Single Responsibility: memoize expensive scans under a time bound. The
 * bound matters because file layouts DO change during a session — a fresh
 * read every minute is the right trade-off between cost and staleness.
 *
 * Injectable TTL (defaults to the constant) keeps tests deterministic.
 */
export class ProjectContextCache {
  private readonly entries = new Map<string, CacheEntry>();

  constructor(private readonly ttlMs: number = CONTEXT_CACHE_TTL_MS) {}

  get(key: string): string | null {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.entries.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: string): void {
    this.entries.set(key, { value, timestamp: Date.now() });
  }

  invalidate(key: string): void {
    this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
  }
}
