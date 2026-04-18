/**
 * Strips secret-bearing environment variables before they're passed to
 * a spawned subprocess.
 *
 * Single Responsibility: env-var filtering. No spawning, no building —
 * just "given this env map, return one without the keys that look
 * sensitive". Uses a pattern list (regexes + literal names) so new
 * blocklist entries are a one-line edit.
 *
 * Constructor-injectable: main.ts wires a default scrubber into
 * `CommandEnvBuilder`. Tests substitute a minimal scrubber to verify
 * behaviour without depending on the full default list.
 */

export interface EnvScrubberOptions {
  /** Regex patterns applied to variable *names* (not values). */
  patterns?: RegExp[];
  /** Literal variable names to strip. */
  names?: readonly string[];
  /** Variable names to always keep, even if a pattern matches. */
  allowList?: readonly string[];
}

const DEFAULT_PATTERNS: RegExp[] = [
  /TOKEN$/i,
  /TOKEN_/i,
  /SECRET$/i,
  /SECRET_/i,
  /PASSWORD/i,
  /PASSWD/i,
  /API[_-]?KEY/i,
  /PRIVATE[_-]?KEY/i,
  /CLIENT[_-]?SECRET/i,
  /ACCESS[_-]?KEY/i,
  /CREDENTIAL/i,
  /SESSION[_-]?KEY/i,
];

const DEFAULT_NAMES: readonly string[] = [
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "GEMINI_API_KEY",
  "GITHUB_TOKEN",
  "GH_TOKEN",
  "NPM_TOKEN",
  "NODE_AUTH_TOKEN",
  "DATABASE_URL",
  "POSTGRES_PASSWORD",
  "MYSQL_PASSWORD",
  "REDIS_PASSWORD",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_SESSION_TOKEN",
  "AWS_ACCESS_KEY_ID",
  "GOOGLE_APPLICATION_CREDENTIALS",
  "GOOGLE_API_KEY",
  "CLOUDFLARE_API_TOKEN",
  "STRIPE_SECRET_KEY",
  "SENTRY_DSN",
  "NETLIFY_AUTH_TOKEN",
  "VERCEL_TOKEN",
];

/**
 * Default vars kept even when a pattern matches — these are commonly
 * expected by build tooling and aren't sensitive on their own.
 */
const DEFAULT_ALLOWLIST: readonly string[] = [
  "PATH",
  "HOME",
  "SHELL",
  "LANG",
  "LC_ALL",
  "TERM",
  "USER",
  "NODE_ENV",
];

export class EnvScrubber {
  private readonly patterns: RegExp[];
  private readonly names: Set<string>;
  private readonly allowList: Set<string>;

  constructor(opts: EnvScrubberOptions = {}) {
    this.patterns = [...DEFAULT_PATTERNS, ...(opts.patterns ?? [])];
    this.names = new Set([
      ...DEFAULT_NAMES.map((n) => n.toUpperCase()),
      ...(opts.names ?? []).map((n) => n.toUpperCase()),
    ]);
    this.allowList = new Set([
      ...DEFAULT_ALLOWLIST.map((n) => n.toUpperCase()),
      ...(opts.allowList ?? []).map((n) => n.toUpperCase()),
    ]);
  }

  /** Return a copy of `env` with sensitive variables removed. */
  scrub(env: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(env)) {
      if (this.isSensitive(key)) continue;
      out[key] = value;
    }
    return out;
  }

  isSensitive(name: string): boolean {
    const upper = name.toUpperCase();
    if (this.allowList.has(upper)) return false;
    if (this.names.has(upper)) return true;
    return this.patterns.some((p) => p.test(name));
  }
}
