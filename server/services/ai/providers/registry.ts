import type { AiProvider } from "./provider.js";

/** Minimal per-provider descriptor surfaced to the UI picker. */
export interface ProviderSummary {
  id: string;
  name: string;
}

/**
 * Holds the AI providers the app knows how to talk to and lets consumers
 * look one up by id at call time.
 *
 * Providers are registered at startup in `electron/main.ts`; the `Ai`
 * router asks the registry for the concrete provider every time a
 * request comes in, so switching providers is just a settings change —
 * no rebinding, no restart, no instance caching.
 *
 * SRP: only knows about mapping ids → providers. It does not read
 * settings, build providers, or own their lifecycle.
 */
export class ProviderRegistry {
  private readonly providers = new Map<string, AiProvider>();

  constructor(private readonly defaultId: string) {}

  register(id: string, provider: AiProvider): void {
    this.providers.set(id, provider);
  }

  /** Resolve a provider by id, falling back to the default when id is omitted. */
  resolve(id?: string | null): AiProvider {
    const target = id || this.defaultId;
    const provider = this.providers.get(target);
    if (!provider) {
      const known = Array.from(this.providers.keys()).join(", ") || "(none)";
      throw new Error(
        `Unknown AI provider "${target}". Registered: ${known}`,
      );
    }
    return provider;
  }

  /** Descriptors for every registered provider — drives the settings picker. */
  summaries(): ProviderSummary[] {
    return Array.from(this.providers.entries()).map(([id, provider]) => ({
      id,
      name: provider.name,
    }));
  }
}
