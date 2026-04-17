import { CodeBlock } from "@/components/shared/code-block";
import type { ToolCallData } from "../types";

export function GenericRenderer({ call }: { call: ToolCallData }) {
  const payload = call.output?.trim()
    ? call.output
    : JSON.stringify(call.input, null, 2);
  const language = call.output ? undefined : "json";
  return <CodeBlock code={payload} language={language} maxHeight={240} />;
}
