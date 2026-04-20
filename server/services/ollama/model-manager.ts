export interface InstalledModel {
  name: string;
  /** Short (`qwen2.5-coder`) name without tag, for the UI. */
  family: string;
  /** Size in bytes reported by Ollama. */
  sizeBytes: number;
  modifiedAt: string;
  parameterSize?: string;
  quantization?: string;
}

export interface PullProgress {
  modelName: string;
  /** Ollama's high-level status line ("pulling manifest", "downloading digest"). */
  status: string;
  /** 0..1 when known — Ollama reports per-layer totals during the download. */
  fraction?: number;
  downloaded?: number;
  total?: number;
  /** True once the pull finished successfully. */
  done: boolean;
}

export type PullProgressCallback = (p: PullProgress) => void;

/**
 * HTTP-level operations against the Ollama daemon's model store.
 *
 * Thin by design — this class does *not* start the daemon (that's
 * OllamaDaemonManager's job) and does *not* care which binary is
 * loaded. It just speaks HTTP to whichever endpoint is configured.
 */
export class OllamaModelManager {
  constructor(private readonly endpoint: () => string) {}

  /** Return every model the local daemon has on disk. */
  async list(): Promise<InstalledModel[]> {
    const res = await fetch(`${this.endpoint()}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const body = (await res.json()) as {
      models?: Array<{
        name: string;
        size: number;
        modified_at: string;
        details?: { parameter_size?: string; quantization_level?: string };
      }>;
    };
    return (body.models ?? []).map((m) => ({
      name: m.name,
      family: m.name.split(":")[0] ?? m.name,
      sizeBytes: m.size,
      modifiedAt: m.modified_at,
      parameterSize: m.details?.parameter_size,
      quantization: m.details?.quantization_level,
    }));
  }

  /** Delete a model from disk. Returns true on success. */
  async remove(name: string): Promise<boolean> {
    const res = await fetch(`${this.endpoint()}/api/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return res.ok;
  }

  /**
   * Pull a model. Streams progress via the callback and resolves when
   * the daemon reports `status: "success"` (or the final line with no
   * further work). Throws on non-2xx or network error.
   */
  async pull(
    name: string,
    onProgress: PullProgressCallback,
    signal?: AbortSignal,
  ): Promise<void> {
    const res = await fetch(`${this.endpoint()}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, stream: true }),
      signal,
    });
    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Pull failed (${res.status}): ${text.slice(0, 300) || res.statusText}`,
      );
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = parseJson(line);
        if (!event) continue;
        onProgress(mapPullEvent(name, event));
      }
    }
    if (buffer.trim()) {
      const event = parseJson(buffer);
      if (event) onProgress(mapPullEvent(name, event));
    }
  }
}

function parseJson(line: string): Record<string, unknown> | null {
  try {
    return JSON.parse(line) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function mapPullEvent(
  name: string,
  event: Record<string, unknown>,
): PullProgress {
  const status = (event.status as string | undefined) ?? "";
  const completed =
    typeof event.completed === "number" ? (event.completed as number) : undefined;
  const total =
    typeof event.total === "number" ? (event.total as number) : undefined;
  return {
    modelName: name,
    status,
    downloaded: completed,
    total,
    fraction:
      completed !== undefined && total && total > 0
        ? completed / total
        : undefined,
    done: status === "success",
  };
}
