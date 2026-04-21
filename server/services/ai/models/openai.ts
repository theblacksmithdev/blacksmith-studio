import { K, type FamilyDefault, type ModelEntry } from "./types.js";

/**
 * OpenAI models. Provider plumbing not yet wired — entries here are
 * ready for the day a provider implementation lands. The IPC
 * `ai:listModels` handler filters by live providers, so these won't
 * appear in pickers until they actually route.
 */
export const OPENAI_MODELS: readonly ModelEntry[] = [
  {
    id: "gpt-4o",
    aliases: ["gpt-4o-latest"],
    provider: "openai",
    family: "GPT-4o",
    version: "latest",
    contextWindow: 128 * K,
    label: "GPT-4o",
  },
  {
    id: "gpt-5",
    aliases: ["gpt-5-latest"],
    provider: "openai",
    family: "GPT-5",
    version: "latest",
    contextWindow: 400 * K,
    label: "GPT-5",
  },
];

export const OPENAI_FAMILIES: readonly FamilyDefault[] = [
  {
    provider: "openai",
    family: "GPT",
    contextWindow: 128 * K,
    pattern: /^gpt-/,
  },
];
