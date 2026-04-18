import { useCallback, useRef, useState } from "react";
import { useSaveAttachment } from "@/api/hooks/attachments";
import type { AttachmentRecord } from "@/api/modules/attachments";
import { kindFromName } from "./kind-from-name";
import type { PendingAttachment } from "./types";

export interface UseComposerAttachmentsArgs {
  projectId: string | undefined;
  conversationId?: string;
  maxBytes?: number;
}

function uid() {
  return typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : String(Math.random());
}

async function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsArrayBuffer(file);
  });
}

export function useComposerAttachments({
  projectId,
  conversationId,
  maxBytes = 20 * 1024 * 1024,
}: UseComposerAttachmentsArgs) {
  const [items, setItems] = useState<PendingAttachment[]>([]);
  const counter = useRef(0);
  const saveMutation = useSaveAttachment();

  const update = useCallback(
    (localId: string, patch: Partial<PendingAttachment>) => {
      setItems((prev) =>
        prev.map((it) => (it.localId === localId ? { ...it, ...patch } : it)),
      );
    },
    [],
  );

  const remove = useCallback((localId: string) => {
    setItems((prev) => prev.filter((it) => it.localId !== localId));
  }, []);

  const addFiles = useCallback(
    async (files: File[]) => {
      if (!projectId || files.length === 0) return;

      const inits: PendingAttachment[] = files.map((f) => {
        counter.current += 1;
        return {
          localId: `${counter.current}-${uid()}`,
          name: f.name,
          size: f.size,
          kind: kindFromName(f.name),
          status: f.size > maxBytes ? "error" : "uploading",
          error:
            f.size > maxBytes
              ? `Too large (max ${Math.round(maxBytes / 1024 / 1024)}MB)`
              : undefined,
        };
      });

      setItems((prev) => [...prev, ...inits]);

      await Promise.all(
        files.map(async (file, i) => {
          const init = inits[i];
          if (init.status === "error") return;
          try {
            const bytes = await readAsArrayBuffer(file);
            const record = await saveMutation.mutateAsync({
              projectId,
              conversationId,
              name: file.name,
              bytes,
            });
            update(init.localId, { status: "ready", record });
          } catch (err: any) {
            update(init.localId, {
              status: "error",
              error: err?.message ?? "Upload failed",
            });
          }
        }),
      );
    },
    [projectId, conversationId, maxBytes, update, saveMutation],
  );

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const readyRecords = (): AttachmentRecord[] =>
    items
      .filter((it) => it.status === "ready" && it.record)
      .map((it) => it.record!) as AttachmentRecord[];

  return {
    items,
    addFiles,
    remove,
    clear,
    readyRecords,
    hasPending: items.some((it) => it.status === "uploading"),
    hasErrors: items.some((it) => it.status === "error"),
  };
}
