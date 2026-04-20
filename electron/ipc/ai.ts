import { ipcMain } from "electron";
import type { Ai } from "../../server/services/ai/index.js";
import type { SettingsManager } from "../../server/services/settings.js";
import { AI_LIST_MODELS, AI_LIST_PROVIDERS } from "./channels.js";

/**
 * Provider-agnostic AI IPC handlers. Pairs with `server/services/ai/`.
 *
 * The UI reaches in via these channels to ask *about* the active
 * provider — model lists, etc. — without knowing which concrete
 * provider is loaded. Channels for actually *running* the model
 * (send prompt, cancel) live in their domain-specific files
 * (`single-agent.ts`, `multi-agents.ts`).
 */
export function setupAiIPC(ai: Ai, settingsManager: SettingsManager) {
  ipcMain.handle(AI_LIST_MODELS, async (_e, data?: { projectId?: string }) => {
    const providerId = data?.projectId
      ? (settingsManager.get(data.projectId, "ai.provider") as string | null)
      : null;
    return ai.listModels(providerId ?? undefined);
  });

  ipcMain.handle(AI_LIST_PROVIDERS, async () => ai.listProviders());
}
