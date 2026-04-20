/**
 * Tool schemas that non-Claude providers (Ollama today, OpenAI-style
 * backends tomorrow) advertise to the model.
 *
 * Kept intentionally minimal and read-only:
 *   - `read_file`  — fetch a file's contents
 *   - `grep`       — regex search over the project
 *   - `glob`       — filename pattern match
 *
 * Write/edit/shell tools intentionally omitted — they need a permission
 * prompt UX we haven't built yet. Surface them here and the model will
 * start calling them before the safety layer exists.
 *
 * One source of truth: the executor imports the same names, so if a
 * schema drifts we get a type error instead of a silent mismatch.
 */

export type ToolName = "read_file" | "grep" | "glob";

/** Arguments the model is allowed to pass to each tool. */
export interface ToolInputs {
  read_file: { path: string };
  grep: { pattern: string; path?: string; case_insensitive?: boolean };
  glob: { pattern: string };
}

/** OpenAI / Ollama `tools` param format. Advertise to the model. */
export interface OpenAiToolDefinition {
  type: "function";
  function: {
    name: ToolName;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export const TOOL_DEFINITIONS: OpenAiToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "read_file",
      description:
        "Read a file from the user's project and return its contents. Use absolute paths or paths relative to the project root.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Project-relative or absolute path to the file.",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "grep",
      description:
        "Search the project for a regular expression. Returns matching lines with their file paths.",
      parameters: {
        type: "object",
        properties: {
          pattern: {
            type: "string",
            description: "A regular expression to search for.",
          },
          path: {
            type: "string",
            description:
              "Optional sub-path to restrict the search to. Defaults to the project root.",
          },
          case_insensitive: {
            type: "boolean",
            description: "If true, match case-insensitively. Default false.",
          },
        },
        required: ["pattern"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "glob",
      description:
        "List files in the project matching a glob pattern (e.g. `**/*.ts`, `src/**/*.tsx`).",
      parameters: {
        type: "object",
        properties: {
          pattern: {
            type: "string",
            description: "A glob pattern matched against project files.",
          },
        },
        required: ["pattern"],
      },
    },
  },
];
