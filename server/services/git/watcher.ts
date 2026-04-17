import { watch, type FSWatcher } from "node:fs";
import { WATCH_DEBOUNCE_MS, WATCH_IGNORED_PATHS } from "./constants.js";
import type { GitEventBus } from "./event-bus.js";

/**
 * Watches project directories for filesystem changes and triggers a
 * debounced status-change emit on the event bus.
 *
 * Single Responsibility: filesystem observation + debouncing. It does
 * not know what "status" means — it just signals that something changed.
 *
 * Ignored paths are configured in constants so the rule is visible and
 * easy to extend.
 */
export class GitWatcher {
  private watchers = new Map<string, FSWatcher>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private readonly bus: GitEventBus) {}

  start(projectPath: string): void {
    if (this.watchers.has(projectPath)) return;

    try {
      const watcher = watch(
        projectPath,
        { recursive: true },
        (_event, filename) => this.handleChange(projectPath, filename),
      );
      this.watchers.set(projectPath, watcher);
    } catch {
      // Recursive watch not supported or path invalid — silently skip
    }
  }

  stop(projectPath: string): void {
    this.watchers.get(projectPath)?.close();
    this.watchers.delete(projectPath);

    const timer = this.timers.get(projectPath);
    if (timer) clearTimeout(timer);
    this.timers.delete(projectPath);
  }

  stopAll(): void {
    for (const watcher of this.watchers.values()) watcher.close();
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.watchers.clear();
    this.timers.clear();
  }

  private handleChange(projectPath: string, filename: string | null): void {
    if (!filename) return;
    if (this.isIgnored(filename)) return;

    const existing = this.timers.get(projectPath);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.timers.delete(projectPath);
      this.bus.emitStatusChange(projectPath);
    }, WATCH_DEBOUNCE_MS);

    this.timers.set(projectPath, timer);
  }

  private isIgnored(filename: string): boolean {
    return WATCH_IGNORED_PATHS.some((p) =>
      p.endsWith("/") ? filename.includes(p) : filename.startsWith(p),
    );
  }
}
