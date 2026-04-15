import { api as raw } from "../client";
import type { HealthStatus } from "../types";

export const health = {
  check: (projectId?: string) =>
    raw.invoke<HealthStatus>("health:check", { projectId }),
} as const;
