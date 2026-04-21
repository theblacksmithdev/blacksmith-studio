import type { AiProviderId } from "./provider-id.js";
import { resolveModel } from "./resolve-model.js";

export type { AiProviderId } from "./provider-id.js";

export interface ModelInfo {
  id: string;
  provider: AiProviderId;
  contextWindow: number;
  label: string;
}

/**
 * Thin façade over the model registry + resolver.
 *
 * SRP: answers "given this raw model string, what should I show and
 * what's the window?" — nothing more. Static data and parsing logic
 * live in `model-registry.ts` / `resolve-model.ts` so this class stays
 * a stable public API for every caller (meter, history aggregates,
 * usage service).
 */
export class ModelCatalog {
  lookup(modelId: string | null | undefined): ModelInfo {
    const r = resolveModel(modelId);
    return {
      id: r.normalized,
      provider: r.provider,
      contextWindow: r.contextWindow,
      label: r.label,
    };
  }

  contextWindow(modelId: string | null | undefined): number {
    return resolveModel(modelId).contextWindow;
  }
}

export const modelCatalog = new ModelCatalog();
