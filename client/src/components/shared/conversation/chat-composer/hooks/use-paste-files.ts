import { useCallback } from "react";

export interface UsePasteFilesArgs {
  /** Called for in-memory files (screenshot paste, Chrome image copy). */
  onFiles: (files: File[]) => void;
  /** Called for filesystem paths (Finder / Explorer copy → paste). */
  onFilePaths?: (paths: string[]) => void;
  disabled?: boolean;
}

function extractPaths(dt: DataTransfer): string[] {
  const raw: string[] = [];

  const uriList = dt.getData("text/uri-list");
  if (uriList) raw.push(...uriList.split(/\r?\n/));

  // macOS Finder often puts the file:// URL on text/plain too.
  const plain = dt.getData("text/plain");
  if (plain) raw.push(...plain.split(/\r?\n/));

  const paths: string[] = [];
  const seen = new Set<string>();

  for (const line of raw) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (!trimmed.startsWith("file://")) continue;

    let decoded: string;
    try {
      decoded = decodeURIComponent(trimmed.replace(/^file:\/\//, ""));
    } catch {
      decoded = trimmed.replace(/^file:\/\//, "");
    }
    if (!seen.has(decoded)) {
      seen.add(decoded);
      paths.push(decoded);
    }
  }

  return paths;
}

/**
 * Routes a clipboard paste to either:
 * - `onFiles` — when the clipboard carries binary File objects (image
 *   screenshots, browser image copies).
 * - `onFilePaths` — when the clipboard carries filesystem paths (Finder
 *   / Explorer "Copy" on a file). The server reads the file from disk.
 *
 * Plain text / HTML pastes fall through untouched.
 */
export function usePasteFiles({
  onFiles,
  onFilePaths,
  disabled,
}: UsePasteFilesArgs) {
  return useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled) return;
      const dt = e.clipboardData;
      if (!dt) return;

      const files: File[] = [];
      if (dt.files && dt.files.length > 0) {
        for (let i = 0; i < dt.files.length; i++) files.push(dt.files[i]);
      } else if (dt.items && dt.items.length > 0) {
        for (let i = 0; i < dt.items.length; i++) {
          const item = dt.items[i];
          if (item.kind === "file") {
            const f = item.getAsFile();
            if (f) files.push(f);
          }
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        onFiles(files);
        return;
      }

      if (onFilePaths) {
        const paths = extractPaths(dt);
        if (paths.length > 0) {
          e.preventDefault();
          onFilePaths(paths);
        }
      }
    },
    [onFiles, onFilePaths, disabled],
  );
}
