/**
 * Typed errors for the CommandService layer.
 *
 * The IPC layer and the MCP tool both pattern-match on `code` to turn
 * these into user-friendly messages or structured JSON responses. Plain
 * `Error` instances are intentionally avoided because they strip the
 * discrimination a caller needs.
 */

export class CommandError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly hint?: string,
  ) {
    super(message);
    this.name = "CommandError";
  }
}

export class ToolchainNotFoundError extends CommandError {
  constructor(public readonly identifier: string) {
    super(
      `No toolchain owns the preset or binary "${identifier}".`,
      "TOOLCHAIN_NOT_FOUND",
      "Register a Toolchain for this runtime or use `command` directly.",
    );
    this.name = "ToolchainNotFoundError";
  }
}

export class NoProjectEnvError extends CommandError {
  constructor(
    public readonly toolchainId: string,
    public readonly projectRoot: string,
  ) {
    super(
      `No ${toolchainId} project environment detected at ${projectRoot}.`,
      "NO_PROJECT_ENV",
      `Create one (e.g. .venv / package.json) or set commands.${toolchainId}.resolution in project settings.`,
    );
    this.name = "NoProjectEnvError";
  }
}

export class NoStudioEnvError extends CommandError {
  constructor(public readonly toolchainId: string) {
    super(
      `Studio-scoped ${toolchainId} environment is not available.`,
      "NO_STUDIO_ENV",
      "The internal Blacksmith environment may not be set up yet.",
    );
    this.name = "NoStudioEnvError";
  }
}

export class CommandTimeoutError extends CommandError {
  constructor(public readonly timeoutMs: number) {
    super(
      `Command exceeded timeout of ${timeoutMs}ms`,
      "COMMAND_TIMEOUT",
    );
    this.name = "CommandTimeoutError";
  }
}

export class CommandCancelledError extends CommandError {
  constructor() {
    super("Command was cancelled before completion", "COMMAND_CANCELLED");
    this.name = "CommandCancelledError";
  }
}

export class InvalidCommandSpecError extends CommandError {
  constructor(message: string) {
    super(message, "INVALID_COMMAND_SPEC");
    this.name = "InvalidCommandSpecError";
  }
}

export class TooManyConcurrentCommandsError extends CommandError {
  constructor(
    public readonly projectId: string,
    public readonly limit: number,
  ) {
    super(
      `Too many concurrent commands running for project (${limit}).`,
      "TOO_MANY_CONCURRENT",
      "Wait for existing commands to finish, or raise commands.concurrencyLimit in project settings.",
    );
    this.name = "TooManyConcurrentCommandsError";
  }
}

export class CommandPolicyDeniedError extends CommandError {
  constructor(message: string, hint?: string) {
    super(message, "COMMAND_POLICY_DENIED", hint);
    this.name = "CommandPolicyDeniedError";
  }
}

export class InvalidCwdError extends CommandError {
  constructor(
    public readonly attemptedCwd: string,
    public readonly projectRoot: string,
  ) {
    super(
      `cwd "${attemptedCwd}" must stay within project root ${projectRoot}.`,
      "INVALID_CWD",
    );
    this.name = "InvalidCwdError";
  }
}
