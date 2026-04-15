import type {
  AiCompletionOptions,
  AiStreamOptions,
  AiStreamHandle,
  AiProviderStatus,
  AiModelTier,
} from "../types.js";

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

  /** Map a generic model tier to this provider's specific model name */
  abstract resolveModel(tier: AiModelTier): string;
}
