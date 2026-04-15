import { api as raw } from "../client";
import type {
  PromptTemplate,
  TemplateInterpolateInput,
  TemplateInterpolateResult,
} from "../types";

export const templates = {
  list: () => raw.invoke<PromptTemplate[]>("templates:list"),
  interpolate: (input: TemplateInterpolateInput) =>
    raw.invoke<TemplateInterpolateResult>("templates:interpolate", input),
} as const;
