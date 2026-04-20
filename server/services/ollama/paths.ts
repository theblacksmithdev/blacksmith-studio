import os from "node:os";
import path from "node:path";
import type { PlatformInfo } from "../platform/index.js";

/**
 * Filesystem locations for Blacksmith's managed Ollama install.
 *
 * Centralised so every piece of the Ollama subsystem agrees on where
 * the binary, libraries, and model store live. Only the resolver and
 * installer write here; everyone else reads.
 */
export class OllamaPaths {
  constructor(private readonly platform: PlatformInfo) {}

  /** Root of our managed Ollama — sibling of the studio venv. */
  get root(): string {
    return path.join(os.homedir(), ".blacksmith-studio", "ollama");
  }

  /** Directory containing the binary (platform-shaped). */
  get binDir(): string {
    return this.platform.isWindows ? this.root : path.join(this.root, "bin");
  }

  /** Path to the ollama executable within our managed install. */
  get managedBinary(): string {
    return path.join(this.binDir, this.platform.binaryName("ollama"));
  }

  /** Standard system locations we probe before falling back to download. */
  systemCandidates(): string[] {
    if (this.platform.isMac) {
      return [
        "/Applications/Ollama.app/Contents/Resources/ollama",
        "/usr/local/bin/ollama",
        "/opt/homebrew/bin/ollama",
      ];
    }
    if (this.platform.isLinux) {
      return ["/usr/local/bin/ollama", "/usr/bin/ollama"];
    }
    // Windows default install location under Program Files.
    return [
      "C:\\Program Files\\Ollama\\ollama.exe",
      path.join(os.homedir(), "AppData", "Local", "Programs", "Ollama", "ollama.exe"),
    ];
  }
}
