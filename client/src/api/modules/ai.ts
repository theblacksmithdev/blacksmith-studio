import { api as raw } from "../client";

export type AiProviderId = "anthropic" | "openai" | "google" | "unknown";

export interface ModelEntry {
  id: string;
  aliases: string[];
  provider: AiProviderId;
  family: string;
  version: string;
  contextWindow: number;
  maxOutputTokens?: number;
  variant?: "1m";
  label: string;
  /** True for superseded releases. Pickers surface these muted. */
  legacy?: boolean;
}

export const ai = {
  listModels: () => raw.invoke<ModelEntry[]>("ai:listModels"),
} as const;
