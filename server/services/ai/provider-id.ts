/** Provider namespace for AI models. Kept separate so both the model registry and the catalog can reference it without circular imports. */
export type AiProviderId = "anthropic" | "openai" | "google" | "unknown";
