import { ArtifactDetail } from "@/components/artifacts";

/**
 * Default detail pane when no artifact is selected — renders the
 * "Select an artifact" empty state via `ArtifactDetail` with a null id.
 */
export default function ArtifactsEmptyRoute() {
  return <ArtifactDetail artifactId={null} />;
}
