import type { GitStatusListener } from "./types.js";

/**
 * Observer for git status changes.
 *
 * Single Responsibility: subscribe/emit status-change notifications.
 * Listener errors are isolated so one bad subscriber can't break siblings.
 * Returns an unsubscribe function per subscription — callers don't need to
 * track identities.
 */
export class GitEventBus {
  private listeners: GitStatusListener[] = [];

  onStatusChange(listener: GitStatusListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emitStatusChange(projectPath: string): void {
    for (const listener of this.listeners) {
      try {
        listener(projectPath);
      } catch (err) {
        console.error("[git-event-bus] Listener error:", err);
      }
    }
  }
}
