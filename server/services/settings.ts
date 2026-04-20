import { eq, and } from "drizzle-orm";
import { getDatabase } from "../db/index.js";
import { settings, globalSettings } from "../db/schema.js";

const DEFAULTS: Record<string, any> = {
  "appearance.theme": "system",
  "appearance.fontSize": 14,
  "appearance.sidebarCollapsed": false,
  "ai.provider": "claude-cli",
  "ai.model": "sonnet",
  "ai.maxBudget": null,
  "ai.customInstructions": "",
  "ai.permissionMode": "bypassPermissions",
  "editor.tabSize": 2,
  "editor.wordWrap": true,
  "editor.minimap": true,
  "editor.lineNumbers": true,
  "project.displayName": "",
  "project.ignoredPatterns":
    "node_modules,.git,__pycache__,venv,dist,.env,.blacksmith-studio",
  "preview.frontendPath": "/",
  "preview.backendPath": "/api/docs/",
  "preview.chatSplit": 60,
  "preview.runSplit": 55,
  "runner.nodePath": "",
  "agents.nodePositions": null,
  "python.pythonPath": "",
  "graphify.enabled": false,
  "graphify.autoRebuild": true,
  "graphify.maxAgeMinutes": 60,
};

const GLOBAL_DEFAULTS: Record<string, any> = {
  "runner.nodePath": "",
  "python.pythonPath": "",
  "editor.preferred": "",
  "ai.ollamaEndpoint": "http://localhost:11434",
};

export class SettingsManager {
  constructor() {
    getDatabase();
  }

  private get db() {
    return getDatabase();
  }

  /* ── Project-scoped settings ── */

  getAll(projectId: string): Record<string, any> {
    const rows = this.db
      .select()
      .from(settings)
      .where(eq(settings.projectId, projectId))
      .all();
    const result = { ...DEFAULTS };
    for (const row of rows) {
      try {
        result[row.key] = JSON.parse(row.value);
      } catch {
        result[row.key] = row.value;
      }
    }
    return result;
  }

  get(projectId: string, key: string): any {
    const row = this.db
      .select()
      .from(settings)
      .where(and(eq(settings.projectId, projectId), eq(settings.key, key)))
      .get();
    if (!row) return DEFAULTS[key] ?? null;
    try {
      return JSON.parse(row.value);
    } catch {
      return row.value;
    }
  }

  set(projectId: string, key: string, value: any): void {
    const serialized = JSON.stringify(value);
    const existing = this.db
      .select()
      .from(settings)
      .where(and(eq(settings.projectId, projectId), eq(settings.key, key)))
      .get();
    if (existing) {
      this.db
        .update(settings)
        .set({ value: serialized })
        .where(and(eq(settings.projectId, projectId), eq(settings.key, key)))
        .run();
    } else {
      this.db
        .insert(settings)
        .values({ projectId, key, value: serialized })
        .run();
    }
  }

  setMany(projectId: string, pairs: Record<string, any>): void {
    for (const [key, value] of Object.entries(pairs)) {
      this.set(projectId, key, value);
    }
  }

  /* ── Global settings (app-level, no project scope) ── */

  getAllGlobal(): Record<string, any> {
    const rows = this.db.select().from(globalSettings).all();
    const result = { ...GLOBAL_DEFAULTS };
    for (const row of rows) {
      try {
        result[row.key] = JSON.parse(row.value);
      } catch {
        result[row.key] = row.value;
      }
    }
    return result;
  }

  getGlobal(key: string): any {
    const row = this.db
      .select()
      .from(globalSettings)
      .where(eq(globalSettings.key, key))
      .get();
    if (!row) return GLOBAL_DEFAULTS[key] ?? null;
    try {
      return JSON.parse(row.value);
    } catch {
      return row.value;
    }
  }

  setGlobal(key: string, value: any): void {
    const serialized = JSON.stringify(value);
    const existing = this.db
      .select()
      .from(globalSettings)
      .where(eq(globalSettings.key, key))
      .get();
    if (existing) {
      this.db
        .update(globalSettings)
        .set({ value: serialized })
        .where(eq(globalSettings.key, key))
        .run();
    } else {
      this.db.insert(globalSettings).values({ key, value: serialized }).run();
    }
  }

  setManyGlobal(pairs: Record<string, any>): void {
    for (const [key, value] of Object.entries(pairs)) {
      this.setGlobal(key, value);
    }
  }

  /**
   * Resolve a setting with project-override-global fallback.
   * Returns the project-level value if set (non-empty), otherwise the global value.
   */
  resolve(projectId: string | null, key: string): any {
    if (projectId) {
      const projectVal = this.get(projectId, key);
      // If the project has a non-empty value, use it
      if (
        projectVal !== "" &&
        projectVal !== null &&
        projectVal !== undefined
      ) {
        return projectVal;
      }
    }
    // Fall back to global
    const globalVal = this.getGlobal(key);
    if (globalVal !== "" && globalVal !== null && globalVal !== undefined) {
      return globalVal;
    }
    // Fall back to project defaults, then global defaults
    return DEFAULTS[key] ?? GLOBAL_DEFAULTS[key] ?? null;
  }
}
