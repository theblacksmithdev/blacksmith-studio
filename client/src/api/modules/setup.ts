import { api as raw } from "../client";

export interface SetupStatus {
  node: { installed: boolean; version?: string };
  claude: { installed: boolean; version?: string };
  auth: { authenticated: boolean };
}

export interface BinValidation {
  valid: boolean;
  version?: string;
  error?: string;
}

export const setup = {
  check: (projectId?: string) =>
    raw.invoke<SetupStatus>("setup:check", { projectId }),
  installClaude: (projectId?: string) =>
    raw.invoke<{ success: boolean; error?: string }>("setup:installClaude", {
      projectId,
    }),
  validateBin: (path: string) =>
    raw.invoke<BinValidation>("setup:validateBin", { path }),
} as const;
