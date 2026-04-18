import os from "node:os";
import path from "node:path";

export type PlatformId = NodeJS.Platform;

/**
 * OS-awareness primitive.
 *
 * Single Responsibility: answer "what OS are we on, and what does that
 * mean for paths / binaries / shells?". Replaces the dozens of
 * `process.platform === "win32"` checks scattered through the codebase.
 *
 * Instantiate explicitly (constructor-injection in classes that need
 * DI) or import the shared `platform` instance exported from
 * `./index.ts` for quick lookups.
 *
 * Design note: `platform` is captured at construction time rather than
 * read live on every getter. In a normal process it never changes, and
 * this lets tests build a `new PlatformInfo("win32")` to exercise
 * cross-platform logic without patching globals.
 */
export class PlatformInfo {
  readonly platform: PlatformId;

  constructor(platform: PlatformId = process.platform) {
    this.platform = platform;
  }

  get isMac(): boolean {
    return this.platform === "darwin";
  }

  get isWindows(): boolean {
    return this.platform === "win32";
  }

  get isLinux(): boolean {
    return this.platform === "linux";
  }

  /** `:` on POSIX, `;` on Windows — used when joining PATH-like lists. */
  get pathDelimiter(): ":" | ";" {
    return this.isWindows ? ";" : ":";
  }

  /** Executable suffix — `.exe` on Windows, `""` elsewhere. */
  get binarySuffix(): string {
    return this.isWindows ? ".exe" : "";
  }

  /** Suffix used for Node's shim wrappers (`npm.cmd`, `pnpm.cmd`, …). */
  get shimSuffix(): string {
    return this.isWindows ? ".cmd" : "";
  }

  /** Venv bin directory name — `Scripts` on Windows, `bin` elsewhere. */
  get venvBinDir(): "Scripts" | "bin" {
    return this.isWindows ? "Scripts" : "bin";
  }

  /**
   * Return `<name>.exe` on Windows, `<name>` elsewhere. Use for binaries
   * you spawn directly.
   */
  binaryName(name: string): string {
    return this.isWindows ? `${name}.exe` : name;
  }

  /**
   * Return `<name>.cmd` on Windows (for shim-wrapped CLIs like npm /
   * pnpm / yarn), `<name>` elsewhere.
   */
  shimName(name: string): string {
    return this.isWindows ? `${name}.cmd` : name;
  }

  /**
   * Compose a venv bin path: on POSIX → `<root>/bin/<binary>`; on
   * Windows → `<root>\Scripts\<binary>.exe`.
   */
  venvBinaryPath(venvRoot: string, binary: string): string {
    return path.join(venvRoot, this.venvBinDir, this.binaryName(binary));
  }

  /** Home directory — mirror of `os.homedir()` so callers don't import both. */
  homeDir(): string {
    return os.homedir();
  }

  /**
   * The user's interactive shell. Falls back to a sensible default
   * when `$SHELL` is unset (e.g. first-run Linux installs).
   */
  shell(): string {
    if (this.isWindows) return process.env.COMSPEC ?? "cmd.exe";
    return process.env.SHELL ?? "/bin/bash";
  }
}
