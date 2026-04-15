import { api as raw } from "../client";
import type { SettingsMap } from "../types";

export const settings = {
  getAll: (projectId: string) =>
    raw.invoke<SettingsMap>("settings:getAll", { projectId }),
  update: (projectId: string, data: SettingsMap) =>
    raw.invoke<SettingsMap>("settings:update", { projectId, settings: data }),

  // Global settings (no project required)
  getAllGlobal: () => raw.invoke<Record<string, any>>("settings:getAllGlobal"),
  updateGlobal: (data: Record<string, any>) =>
    raw.invoke<Record<string, any>>("settings:updateGlobal", data),
} as const;
