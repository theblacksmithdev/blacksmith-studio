import { Drawer } from "@/components/shared/drawer";
import { useArtifactQuery } from "@/api/hooks/artifacts";
import { ArtifactDetail } from "./artifact-detail";

interface ArtifactPreviewDrawerProps {
  artifactId: string;
  onClose: () => void;
  onDeleted?: () => void;
}

/**
 * Drawer wrapper around `ArtifactDetail`, kept for surfaces that can't
 * afford a split layout (e.g. the agents-page conversation tab).
 *
 * All the edit / rename / tag / delete UX (including the `ConfirmDialog`
 * that replaced the native browser prompt) lives inside `ArtifactDetail`,
 * so this file is intentionally a thin frame.
 */
export function ArtifactPreviewDrawer({
  artifactId,
  onClose,
  onDeleted,
}: ArtifactPreviewDrawerProps) {
  const { data: artifact } = useArtifactQuery(artifactId);

  return (
    <Drawer title={artifact?.title ?? "Artifact"} onClose={onClose} size="520px">
      <ArtifactDetail
        artifactId={artifactId}
        onDeleted={() => {
          onDeleted?.();
          onClose();
        }}
        onClose={onClose}
      />
    </Drawer>
  );
}
