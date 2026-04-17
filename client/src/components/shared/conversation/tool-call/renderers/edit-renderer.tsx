import { DiffBlock } from "@/components/shared/code-block";
import type { ToolCallData } from "../types";
import { GenericRenderer } from "./generic-renderer";

export function EditRenderer({ call }: { call: ToolCallData }) {
  const oldText =
    typeof call.input.old_string === "string" ? call.input.old_string : "";
  const newText =
    typeof call.input.new_string === "string" ? call.input.new_string : "";
  const filePath =
    typeof call.input.file_path === "string" ? call.input.file_path : undefined;

  if (!oldText && !newText) return <GenericRenderer call={call} />;

  return <DiffBlock oldText={oldText} newText={newText} filename={filePath} />;
}
