import type {
  AiCompletionOptions,
  AiStreamOptions,
  AiStreamHandle,
  AiProviderStatus,
  AiModelTier,
  AiModelOption,
} from "../types.js";

/** Either a generic tier or a concrete provider-specific model ID. */
export type ModelSelector = AiModelTier | string;

/**
 * Abstract AI provider — all providers implement this contract.
 *
 * Consumers interact with `Ai` (the router), never with providers directly.
 */
export abstract class AiProvider {
  abstract readonly name: string;

  /** Check if this provider is available (CLI installed, API key set, etc.) */
  abstract checkStatus(): Promise<AiProviderStatus>;

  /** One-shot completion — returns text or null on failure */
  abstract complete(options: AiCompletionOptions): Promise<string | null>;

  /** Streaming session — returns a handle with promise + process */
  abstract stream(options: AiStreamOptions): AiStreamHandle;

  /**
   * Resolve a model selector to this provider's concrete model name.
   * Tiers are mapped via the provider's MODEL_MAP; raw strings are passed
   * through unchanged so callers can pin specific versions.
   */
  abstract resolveModel(selector: ModelSelector): string;

  /**
   * Models this provider offers in the Settings → AI picker. `value`
   * is what gets written to the `ai.model` setting and fed back into
   * `resolveModel()` at send-time. Returned list drives the UI.
   */
  abstract listModels(): AiModelOption[];
}
