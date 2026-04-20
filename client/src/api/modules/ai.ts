import { api as raw } from "../client";
import type { AiModelOption, AiProviderSummary } from "../types";

/**
 * Provider-agnostic AI queries. Pairs with `electron/ipc/ai.ts`.
 *
 * Use this when the UI needs to ask *about* the active AI provider —
 * its models, capabilities, etc. — without knowing which concrete
 * provider is loaded. For *running* the model see `api.singleAgent`
 * and `api.multiAgents`.
 */
export const ai = {
  /** List the models the active provider offers. */
  listModels: (projectId?: string) =>
    raw.invoke<AiModelOption[]>("ai:listModels", { projectId }),
  /** List every registered provider — used by the Settings picker. */
  listProviders: () => raw.invoke<AiProviderSummary[]>("ai:listProviders"),
} as const;
