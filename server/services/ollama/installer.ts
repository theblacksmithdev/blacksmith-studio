import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { PlatformInfo } from "../platform/index.js";
import type { OllamaPaths } from "./paths.js";

export interface InstallProgress {
  phase: "downloading" | "extracting" | "finalizing" | "done";
  /** 0..1 for the current phase; undefined when size is unknown. */
  fraction?: number;
  /** Bytes downloaded / total, when known. */
  downloaded?: number;
  total?: number;
  /** Human-readable message for the UI. */
  message: string;
}

export type InstallProgressCallback = (p: InstallProgress) => void;

/**
 * Downloads an Ollama release for the current platform and installs it
 * under `~/.blacksmith-studio/ollama/`. Uses system `tar` / PowerShell
 * `Expand-Archive` for extraction so we don't pull new npm deps.
 *
 * macOS ships a raw universal binary (`ollama-darwin`); Linux/Windows
 * ship archives that include runtime libraries alongside the binary,
 * so we extract-with-structure for those.
 *
 * SRP: downloading + extracting. Doesn't manage the daemon, doesn't
 * verify versions after the fact — the resolver tells the rest of the
 * app whether an install exists.
 */
export class OllamaInstaller {
  private static readonly RELEASE_BASE =
    "https://github.com/ollama/ollama/releases/latest/download";

  constructor(
    private readonly platform: PlatformInfo,
    private readonly paths: OllamaPaths,
  ) {}

  /**
   * Download + unpack the latest Ollama into the managed directory.
   * Safe to call over an existing install (overwrites). Throws on
   * network/extraction failure — the IPC layer surfaces the message.
   */
  async install(onProgress: InstallProgressCallback): Promise<void> {
    fs.mkdirSync(this.paths.root, { recursive: true });
    fs.mkdirSync(this.paths.binDir, { recursive: true });

    const asset = this.selectAsset();
    const downloadPath = path.join(this.paths.root, asset.filename);

    await this.download(asset.url, downloadPath, onProgress);

    onProgress({
      phase: "extracting",
      message: "Unpacking Ollama…",
    });

    if (asset.kind === "raw-binary") {
      this.installRawBinary(downloadPath);
    } else if (asset.kind === "tgz") {
      await this.extractTgz(downloadPath, this.paths.root);
    } else {
      await this.extractZip(downloadPath, this.paths.root);
    }

    onProgress({ phase: "finalizing", message: "Finalising install…" });

    if (!this.platform.isWindows) {
      fs.chmodSync(this.paths.managedBinary, 0o755);
    }

    // Clean up the downloaded archive — we have what we need on disk.
    try {
      fs.unlinkSync(downloadPath);
    } catch {
      /* non-fatal */
    }

    if (!fs.existsSync(this.paths.managedBinary)) {
      throw new Error(
        `Install finished but binary is missing at ${this.paths.managedBinary}.`,
      );
    }

    onProgress({ phase: "done", message: "Ollama installed." });
  }

  /** Pick the right release asset for the host platform + arch. */
  private selectAsset(): {
    url: string;
    filename: string;
    kind: "raw-binary" | "tgz" | "zip";
  } {
    const base = OllamaInstaller.RELEASE_BASE;
    if (this.platform.isMac) {
      // Universal binary — no archive, no per-arch split.
      return {
        url: `${base}/Ollama-darwin.zip`,
        filename: "Ollama-darwin.zip",
        kind: "zip",
      };
    }
    if (this.platform.isLinux) {
      const arch = process.arch === "arm64" ? "arm64" : "amd64";
      return {
        url: `${base}/ollama-linux-${arch}.tgz`,
        filename: `ollama-linux-${arch}.tgz`,
        kind: "tgz",
      };
    }
    // Windows — zip contains ollama.exe + runtime DLLs.
    return {
      url: `${base}/ollama-windows-amd64.zip`,
      filename: "ollama-windows-amd64.zip",
      kind: "zip",
    };
  }

  private async download(
    url: string,
    destPath: string,
    onProgress: InstallProgressCallback,
  ): Promise<void> {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok || !res.body) {
      throw new Error(
        `Failed to download Ollama (${res.status} ${res.statusText}) from ${url}`,
      );
    }
    const total = Number(res.headers.get("content-length") ?? 0) || undefined;
    let downloaded = 0;

    const reporter = new TransformStream<Uint8Array, Uint8Array>({
      transform: (chunk, controller) => {
        downloaded += chunk.byteLength;
        onProgress({
          phase: "downloading",
          downloaded,
          total,
          fraction: total ? downloaded / total : undefined,
          message: total
            ? `Downloading Ollama… ${formatBytes(downloaded)} / ${formatBytes(total)}`
            : `Downloading Ollama… ${formatBytes(downloaded)}`,
        });
        controller.enqueue(chunk);
      },
    });

    const sink = fs.createWriteStream(destPath);
    await pipeline(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Readable.fromWeb(res.body.pipeThrough(reporter) as any),
      sink,
    );
  }

  /** macOS: the download is a single universal binary; just move it. */
  private installRawBinary(downloadPath: string): void {
    fs.renameSync(downloadPath, this.paths.managedBinary);
  }

  /** Linux: `tar -xzf archive.tgz -C target` preserves `bin/` + `lib/`. */
  private extractTgz(archivePath: string, target: string): Promise<void> {
    return this.runExtract("tar", ["-xzf", archivePath, "-C", target]);
  }

  /**
   * macOS: the `Ollama-darwin.zip` contains `Ollama.app`; we extract the
   * inner CLI binary into our managed `bin/`. Windows: the zip is flat —
   * extract in place and it contains `ollama.exe` + DLLs.
   */
  private async extractZip(archivePath: string, target: string): Promise<void> {
    if (this.platform.isMac) {
      const staging = path.join(target, "_mac_unzip");
      fs.mkdirSync(staging, { recursive: true });
      await this.runExtract("unzip", ["-oq", archivePath, "-d", staging]);
      const innerBin = path.join(
        staging,
        "Ollama.app",
        "Contents",
        "Resources",
        "ollama",
      );
      if (!fs.existsSync(innerBin)) {
        throw new Error(
          `Ollama.app/Contents/Resources/ollama not found in ${archivePath}`,
        );
      }
      fs.renameSync(innerBin, this.paths.managedBinary);
      fs.rmSync(staging, { recursive: true, force: true });
      return;
    }
    // Windows.
    await this.runExtract("powershell", [
      "-NoProfile",
      "-Command",
      `Expand-Archive -Force -Path "${archivePath}" -DestinationPath "${target}"`,
    ]);
  }

  private runExtract(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
      let stderr = "";
      child.stderr?.on("data", (d: Buffer) => {
        stderr += d.toString();
      });
      child.on("error", (err) =>
        reject(new Error(`Extract failed (${command}): ${err.message}`)),
      );
      child.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Extract failed (${command}): ${stderr.trim() || `exit ${code}`}`));
      });
    });
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
