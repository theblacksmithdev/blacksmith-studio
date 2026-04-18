import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import type {
  AttachmentRecord,
  SaveAttachmentFromPathArgs,
} from "@/api/modules/attachments";

export function useSaveAttachmentFromPath() {
  return useMutation<AttachmentRecord, Error, SaveAttachmentFromPathArgs>({
    mutationFn: (args) => api.attachments.saveFromPath(args),
  });
}
