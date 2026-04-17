import { CodeBlock } from "@/components/shared/code-block";
import type { ToolCallData } from "../types";
import { GenericRenderer } from "./generic-renderer";

export function WriteRenderer({ call }: { call: ToolCallData }) {
  const content =
    typeof call.input.content === "string" ? call.input.content : "";
  const filePath =
    typeof call.input.file_path === "string" ? call.input.file_path : undefined;

  if (!content) return <GenericRenderer call={call} />;

  return (
    <CodeBlock
      code={content}
      filename={filePath}
      showLineNumbers
      maxHeight={320}
    />
  );
}
