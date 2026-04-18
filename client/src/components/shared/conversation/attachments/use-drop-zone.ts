import { useCallback, useState } from "react";

export interface UseDropZoneArgs {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function useDropZone({ onFiles, disabled }: UseDropZoneArgs) {
  const [over, setOver] = useState(false);

  const onDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      if (!e.dataTransfer?.types.includes("Files")) return;
      e.preventDefault();
      setOver(true);
    },
    [disabled],
  );

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      if (!e.dataTransfer?.types.includes("Files")) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    [disabled],
  );

  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget === e.target) setOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      setOver(false);
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length > 0) onFiles(files);
    },
    [disabled, onFiles],
  );

  return {
    over,
    dragHandlers: { onDragEnter, onDragOver, onDragLeave, onDrop },
  };
}
