import { M, type FamilyDefault, type ModelEntry } from "./types.js";

/**
 * Google (Gemini) models. Provider plumbing not yet wired — entries
 * here are ready for the day a provider implementation lands. Hidden
 * from pickers until live.
 */
export const GOOGLE_MODELS: readonly ModelEntry[] = [
  {
    id: "gemini-2-5-pro",
    aliases: ["gemini-pro"],
    provider: "google",
    family: "Gemini",
    version: "2.5 Pro",
    contextWindow: 1 * M,
    label: "Gemini 2.5 Pro",
  },
];

export const GOOGLE_FAMILIES: readonly FamilyDefault[] = [
  {
    provider: "google",
    family: "Gemini",
    contextWindow: 1 * M,
    pattern: /^gemini-/,
  },
];
