/**
 * Recognise and decode tool-use records that describe a file write/edit.
 *
 * Single Responsibility: tool-name classification + file-path extraction.
 * Kept as a focused utility so new file-touching tools only require an
 * entry in the tool set (and, if their input shape differs, a new strategy).
 *
 * Open/Closed: the tool list and input-shape fallback are data-driven —
 * extending for a new tool doesn't change any control flow.
 */
export class FileToolParser {
  /** Tool names whose invocations correspond to a file write/edit. */
  static readonly FILE_TOOLS: ReadonlySet<string> = new Set([
    "Edit",
    "Write",
    "NotebookEdit",
  ]);

  /** Keys we'll look up, in priority order, when extracting a file path. */
  private static readonly PATH_KEYS = ["file_path", "path"] as const;

  isFileTool(toolName: string): boolean {
    return FileToolParser.FILE_TOOLS.has(toolName);
  }

  /**
   * Parse a tool's raw input JSON and extract the file path it's operating on.
   * Returns null when the input isn't parseable or doesn't describe a path.
   */
  extractPath(rawInput: string): string | null {
    let input: Record<string, unknown>;
    try {
      input = JSON.parse(rawInput);
    } catch {
      return null;
    }

    for (const key of FileToolParser.PATH_KEYS) {
      const value = input[key];
      if (typeof value === "string" && value.length > 0) return value;
    }
    return null;
  }
}
