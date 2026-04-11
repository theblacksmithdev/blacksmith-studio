import { getIcon } from 'material-file-icons'

/**
 * Returns an inline SVG element for the given filename.
 * Uses material-file-icons for VS Code-style file type icons.
 */
export function FileIcon({ name, size = 16 }: { name: string; size?: number }) {
  const icon = getIcon(name)
  return (
    <span
      style={{ width: size, height: size, flexShrink: 0, display: 'inline-flex' }}
      dangerouslySetInnerHTML={{ __html: icon.svg.replace(/<svg/, `<svg width="${size}" height="${size}"`) }}
    />
  )
}
