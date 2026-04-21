import { ipcMain } from "electron";
import { MODEL_REGISTRY } from "../../server/services/ai/models/index.js";
import { AI_LIST_MODELS } from "./channels.js";

/**
 * Providers that actually route through this app today. The registry
 * carries placeholder entries for OpenAI + Google so the selector
 * renders uniformly once those lines are wired up; until then we hide
 * them to avoid presenting choices that don't work.
 */
const LIVE_PROVIDERS = new Set(["anthropic"]);

export function setupAiIPC() {
  ipcMain.handle(AI_LIST_MODELS, () => {
    return MODEL_REGISTRY.filter((m) => LIVE_PROVIDERS.has(m.provider));
  });
}
