import { memo, useMemo } from "react";
import { getIcon } from "material-file-icons";

/**
 * Returns an inline SVG element for the given filename.
 * Uses material-file-icons for VS Code-style file type icons.
 * Memoized to avoid expensive SVG string manipulation on every render.
 */
export const FileIcon = memo(function FileIcon({
  name,
  size = 16,
}: {
  name: string;
  size?: number;
}) {
  const html = useMemo(() => {
    const icon = getIcon(name);
    return icon.svg.replace(/<svg/, `<svg width="${size}" height="${size}"`);
  }, [name, size]);

  return (
    <span
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: "inline-flex",
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
