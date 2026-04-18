import { useCallback, useRef, useState } from "react";
import {
  useSaveAttachment,
  useSaveAttachmentFromPath,
} from "@/api/hooks/attachments";
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

function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
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
  const saveFromPathMutation = useSaveAttachmentFromPath();

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
    (files: File[]) => {
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

      files.forEach((file, i) => {
        const init = inits[i];
        if (init.status === "error") return;
        readAsArrayBuffer(file)
          .then((bytes) => {
            saveMutation.mutate(
              { projectId, conversationId, name: file.name, bytes },
              {
                onSuccess: (record) =>
                  update(init.localId, { status: "ready", record }),
                onError: (err) =>
                  update(init.localId, {
                    status: "error",
                    error: err?.message ?? "Upload failed",
                  }),
              },
            );
          })
          .catch((err) => {
            update(init.localId, {
              status: "error",
              error: err?.message ?? "Read failed",
            });
          });
      });
    },
    [projectId, conversationId, maxBytes, update, saveMutation],
  );

  const addPaths = useCallback(
    (paths: string[]) => {
      if (!projectId || paths.length === 0) return;

      const inits: PendingAttachment[] = paths.map((p) => {
        counter.current += 1;
        const name = p.split(/[/\\]/).pop() || p;
        return {
          localId: `${counter.current}-${uid()}`,
          name,
          size: 0,
          kind: kindFromName(name),
          status: "uploading",
        };
      });

      setItems((prev) => [...prev, ...inits]);

      paths.forEach((sourcePath, i) => {
        const init = inits[i];
        saveFromPathMutation.mutate(
          { projectId, conversationId, sourcePath },
          {
            onSuccess: (record) =>
              update(init.localId, {
                status: "ready",
                record,
                size: record.size,
              }),
            onError: (err) =>
              update(init.localId, {
                status: "error",
                error: err?.message ?? "Upload failed",
              }),
          },
        );
      });
    },
    [projectId, conversationId, update, saveFromPathMutation],
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
    addPaths,
    remove,
    clear,
    readyRecords,
    hasPending: items.some((it) => it.status === "uploading"),
    hasErrors: items.some((it) => it.status === "error"),
  };
}
