export { AttachmentService } from "./attachment-service.js";
export { AttachmentStore } from "./attachment-store.js";
export {
  buildAttachmentInstruction,
  appendAttachmentInstruction,
} from "./prompt-block.js";
export { kindFor, mimeFor, extOf } from "./mime.js";
export {
  attachmentsRootFor,
  attachmentsDirFor,
  relativeToProject,
  toPosix,
} from "./attachment-path.js";
export type {
  AttachmentKind,
  AttachmentRecord,
  SaveAttachmentInput,
} from "./types.js";
