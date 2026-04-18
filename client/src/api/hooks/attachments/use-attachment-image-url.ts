import { useEffect, useState } from "react";
import { useAttachmentContentQuery } from "./use-attachment-content-query";

/**
 * Turns the cached attachment bytes into an object URL for <img src>.
 * The blob URL is scoped to this hook instance — revoked on unmount or
 * when the underlying bytes change. The underlying query is cached via
 * React Query so multiple mounts share one fetch.
 */
export function useAttachmentImageUrl(
  projectId: string | undefined,
  absPath: string | undefined,
) {
  const query = useAttachmentContentQuery(projectId, absPath);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!query.data) {
      setUrl(null);
      return;
    }
    const blob = new Blob([query.data.bytes], { type: query.data.mime });
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [query.data]);

  return {
    url,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    data: query.data,
  };
}
