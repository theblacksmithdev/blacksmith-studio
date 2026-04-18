import { ToolchainNotFoundError } from "../errors.js";
import type { Toolchain } from "./types.js";

/**
 * Open/Closed extension point for the CommandService. Lookups are by
 * toolchain id, by preset ownership, and by binary name. Callers never
 * switch on toolchain id — they ask the registry.
 *
 * Constructor-injected into the service (Dependency Inversion); no
 * global singleton, so tests can register a minimal mock registry.
 */
export class ToolchainRegistry {
  private readonly byId = new Map<string, Toolchain>();
  private readonly byPreset = new Map<string, Toolchain>();
  private readonly byBinary = new Map<string, Toolchain>();

  register(toolchain: Toolchain): void {
    if (this.byId.has(toolchain.id)) {
      throw new Error(
        `Toolchain "${toolchain.id}" already registered — ids must be unique.`,
      );
    }
    this.byId.set(toolchain.id, toolchain);
    for (const preset of toolchain.presetOwnership) {
      this.assertUnique(this.byPreset, preset, toolchain.id, "preset");
      this.byPreset.set(preset, toolchain);
    }
    for (const binary of toolchain.binaries) {
      this.assertUnique(this.byBinary, binary, toolchain.id, "binary");
      this.byBinary.set(binary, toolchain);
    }
  }

  getById(id: string): Toolchain {
    const tc = this.byId.get(id);
    if (!tc) throw new ToolchainNotFoundError(id);
    return tc;
  }

  /** Look up by preset name — e.g. 'pip' → PythonToolchain. */
  getByPreset(preset: string): Toolchain | null {
    return this.byPreset.get(preset) ?? null;
  }

  /** Look up by binary name — used as a fallback when no preset matches. */
  getByBinary(binary: string): Toolchain | null {
    return this.byBinary.get(binary) ?? null;
  }

  all(): Toolchain[] {
    return Array.from(this.byId.values());
  }

  private assertUnique(
    map: Map<string, Toolchain>,
    key: string,
    owner: string,
    kind: "preset" | "binary",
  ): void {
    const existing = map.get(key);
    if (existing && existing.id !== owner) {
      throw new Error(
        `Toolchain ${kind} conflict: "${key}" claimed by both "${existing.id}" and "${owner}".`,
      );
    }
  }
}
