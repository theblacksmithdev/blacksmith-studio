import { useMemo } from "react";
import { useAttachmentContentQuery } from "./use-attachment-content-query";

const MAX_INLINE_BYTES = 400_000;

export function useAttachmentText(
  projectId: string | undefined,
  absPath: string | undefined,
) {
  const query = useAttachmentContentQuery(projectId, absPath);

  const { text, tooLarge } = useMemo(() => {
    if (!query.data) return { text: null as string | null, tooLarge: false };
    if (query.data.bytes.byteLength > MAX_INLINE_BYTES) {
      return { text: null, tooLarge: true };
    }
    const decoded = new TextDecoder("utf-8").decode(
      new Uint8Array(query.data.bytes),
    );
    return { text: decoded, tooLarge: false };
  }, [query.data]);

  return {
    text,
    tooLarge,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
