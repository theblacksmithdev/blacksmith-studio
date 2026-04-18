import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";

interface OpenArgs {
  projectId: string;
  absPath: string;
}

export function useOpenAttachment() {
  return useMutation<void, Error, OpenArgs>({
    mutationFn: ({ projectId, absPath }) =>
      api.attachments.open(projectId, absPath),
  });
}
