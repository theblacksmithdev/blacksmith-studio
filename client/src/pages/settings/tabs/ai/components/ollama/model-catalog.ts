/**
 * Curated list of models we surface in the Settings → AI catalog.
 *
 * Keep short and code-biased — the picker shouldn't overwhelm non-
 * technical users with every model on the Ollama registry. Approximate
 * sizes are the download sizes Ollama reports; exact numbers vary by
 * quant level.
 */
export interface CatalogEntry {
  name: string;
  label: string;
  description: string;
  approxSizeGb: number;
}

export const OLLAMA_CATALOG: CatalogEntry[] = [
  {
    name: "qwen2.5-coder:7b",
    label: "Qwen 2.5 Coder 7B",
    description: "Fast code model. Good for day-to-day autocomplete and chat.",
    approxSizeGb: 4.7,
  },
  {
    name: "qwen2.5-coder:14b",
    label: "Qwen 2.5 Coder 14B",
    description: "Balanced code model. Stronger reasoning than 7B.",
    approxSizeGb: 9,
  },
  {
    name: "qwen2.5-coder:32b",
    label: "Qwen 2.5 Coder 32B",
    description: "Most capable Qwen coder. Needs a beefy machine.",
    approxSizeGb: 20,
  },
  {
    name: "llama3.3:latest",
    label: "Llama 3.3 70B",
    description: "General-purpose reasoning. Large — needs ~40GB RAM.",
    approxSizeGb: 42,
  },
  {
    name: "codestral:latest",
    label: "Codestral 22B",
    description: "Mistral's code-specialist. Strong at fill-in-the-middle.",
    approxSizeGb: 13,
  },
  {
    name: "phi3:latest",
    label: "Phi-3 Mini",
    description: "Tiny, fast, surprisingly capable for its size.",
    approxSizeGb: 2.3,
  },
];
