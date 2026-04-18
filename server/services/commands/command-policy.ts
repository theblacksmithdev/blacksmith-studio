import { CommandPolicyDeniedError } from "./errors.js";
import type { CommandSpec, ResolvedInvocation } from "./types.js";

/**
 * Gate between "the resolver has produced a ResolvedInvocation" and
 * "the runner actually spawns it". Implementations answer: is this
 * allowed to run?
 */
export interface CommandPolicy {
  check(spec: CommandSpec, invocation: ResolvedInvocation): void;
}

export interface DefaultPolicyOptions {
  /** Extra patterns that deny a full argv string (joined with spaces). */
  denyPatterns?: RegExp[];
  /**
   * Extra absolute-path patterns that block the resolved command. Use
   * this to shadow a system binary you never want agents to touch.
   */
  blockedBinaries?: RegExp[];
}

/**
 * Default policy — rejects a small set of obviously destructive
 * invocations. Extensible via constructor options rather than
 * subclassing so callers can layer in project-specific rules without
 * rewriting the core.
 *
 * Single Responsibility: decide yes/no. Typed `CommandPolicyDeniedError`
 * lets the service / IPC / MCP layers render a readable message.
 */
export class DefaultCommandPolicy implements CommandPolicy {
  private readonly denyPatterns: RegExp[];
  private readonly blockedBinaries: RegExp[];

  constructor(opts: DefaultPolicyOptions = {}) {
    this.denyPatterns = [...BUILTIN_DENY_PATTERNS, ...(opts.denyPatterns ?? [])];
    this.blockedBinaries = [
      ...BUILTIN_BLOCKED_BINARIES,
      ...(opts.blockedBinaries ?? []),
    ];
  }

  check(_spec: CommandSpec, invocation: ResolvedInvocation): void {
    for (const rx of this.blockedBinaries) {
      if (rx.test(invocation.command)) {
        throw new CommandPolicyDeniedError(
          `Command "${invocation.command}" is blocked by policy.`,
        );
      }
    }
    const argv = [invocation.command, ...invocation.args].join(" ");
    for (const rx of this.denyPatterns) {
      if (rx.test(argv)) {
        throw new CommandPolicyDeniedError(
          `Command argv "${argv}" is blocked by policy.`,
          "Narrow the arguments or run the command manually in a terminal.",
        );
      }
    }
  }
}

const BUILTIN_DENY_PATTERNS: RegExp[] = [
  // rm -rf / variants (with optional --force / --no-preserve-root / paths).
  /\brm\b.*\b(?:-[rRf]+|--recursive|--force)\b.*\s\/(\s|$)/i,
  /\brm\b.*\b(?:-[rRf]+)\b.*\s\/\*/i,
  /--no-preserve-root/i,
  // Disk-eaters.
  /:\(\)\s*\{\s*:\s*\|\s*:\s*;\s*\}\s*;\s*:/, // fork bomb
  /\bdd\b.*\bif=\/dev\/(?:zero|random)/i,
  /\bmkfs(?:\.\w+)?\b/i,
  // Privilege escalation attempts (block only the obvious ones).
  /\bsudo\s+rm\s+-/i,
  /\bchmod\s+777\s+\//i,
  /\bchown\s+-R\s+.*\s+\//i,
];

const BUILTIN_BLOCKED_BINARIES: RegExp[] = [
  /\/usr\/bin\/(?:shutdown|reboot|halt|poweroff)$/i,
];
