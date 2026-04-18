import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import type {
  AttachmentRecord,
  SaveAttachmentArgs,
} from "@/api/modules/attachments";

export function useSaveAttachment() {
  return useMutation<AttachmentRecord, Error, SaveAttachmentArgs>({
    mutationFn: (args) => api.attachments.save(args),
  });
}
