import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { ReadAttachmentResult } from "@/api/modules/attachments";
import { useProjectKeys } from "../_shared";

export function useAttachmentContentQuery(
  projectId: string | undefined,
  absPath: string | undefined,
) {
  const keys = useProjectKeys();
  return useQuery<ReadAttachmentResult>({
    queryKey: keys.attachmentContent(absPath ?? ""),
    queryFn: () => api.attachments.read(projectId!, absPath!),
    enabled: !!projectId && !!absPath,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
