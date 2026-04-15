import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import type { TemplateInterpolateInput } from "@/api/types";

/**
 * Interpolates a prompt template with the given values.
 */
export function useInterpolatePromptTemplate() {
  return useMutation({
    mutationFn: (input: TemplateInterpolateInput) =>
      api.templates.interpolate(input),
  });
}
