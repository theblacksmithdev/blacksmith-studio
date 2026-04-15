import { api as raw } from "../client";
import type {
  RunnerServiceStatus,
  RunnerConfigData,
  RunnerOutputEvent,
  RunnerStatusEvent,
  NodeInstallation,
} from "../types";

export const runner = {
  // Status
  getStatus: (projectId: string) =>
    raw.invoke<RunnerServiceStatus[]>("runner:getStatus", { projectId }),

  // Start / Stop
  start: (projectId: string, configId?: string) =>
    raw.invoke<void>("runner:start", { projectId, configId }),
  stop: (projectId: string, configId?: string) =>
    raw.invoke<void>("runner:stop", { projectId, configId }),

  // Config CRUD
  getConfigs: (projectId: string) =>
    raw.invoke<RunnerConfigData[]>("runner:getConfigs", { projectId }),
  addConfig: (projectId: string, data: Partial<RunnerConfigData>) =>
    raw.invoke<RunnerConfigData>("runner:addConfig", { projectId, ...data }),
  updateConfig: (id: string, updates: Partial<RunnerConfigData>) =>
    raw.invoke<RunnerConfigData>("runner:updateConfig", { id, updates }),
  removeConfig: (id: string) => raw.invoke<void>("runner:removeConfig", { id }),

  // Setup
  setup: (projectId: string, configId: string) =>
    raw.invoke<void>("runner:setup", { projectId, configId }),

  // Logs
  getLogs: (projectId: string, configId?: string) =>
    raw.invoke<
      { configId: string; name: string; line: string; timestamp: number }[]
    >("runner:getLogs", { projectId, configId }),

  // Detection
  detectRunners: (projectId: string) =>
    raw.invoke<RunnerConfigData[]>("runner:detectRunners", { projectId }),
  detectNode: () => raw.invoke<NodeInstallation[]>("runner:detectNode"),

  // Subscriptions
  onStatus: (cb: (data: RunnerStatusEvent) => void) =>
    raw.subscribe("runner:onStatus", cb),
  onOutput: (cb: (data: RunnerOutputEvent) => void) =>
    raw.subscribe("runner:onOutput", cb),
} as const;
