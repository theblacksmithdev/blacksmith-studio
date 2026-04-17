/**
 * Recognise and decode tool-use records that describe a file write/edit.
 *
 * Data-driven: new tool names or input-shape variants are added to the
 * sets below — no logic changes required.
 */

/** Tool names whose invocations correspond to a file write/edit. */
const FILE_TOOLS: ReadonlySet<string> = new Set([
  "Edit",
  "Write",
  "NotebookEdit",
]);

/** Keys we'll look up, in priority order, when extracting a file path. */
const PATH_KEYS = ["file_path", "path"] as const;

export function isFileTool(toolName: string): boolean {
  return FILE_TOOLS.has(toolName);
}

/**
 * Parse a tool's raw input JSON and extract the file path it's operating
 * on. Returns null when the input isn't parseable or doesn't describe a
 * path.
 */
export function extractFilePath(rawInput: string): string | null {
  let input: Record<string, unknown>;
  try {
    input = JSON.parse(rawInput);
  } catch {
    return null;
  }

  for (const key of PATH_KEYS) {
    const value = input[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}
