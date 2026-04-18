import { useOutletContext, useParams } from "react-router-dom";
import { ArtifactDetail } from "@/components/artifacts";

interface ArtifactsOutletContext {
  onDeleted: () => void;
  onClose: () => void;
}

/**
 * Route-level wrapper: reads `:artifactId` from the URL and hands it to
 * `ArtifactDetail`. Delete + close both navigate the parent layout
 * back to the list-only route.
 */
export default function ArtifactDetailRoute() {
  const { artifactId } = useParams<{ artifactId: string }>();
  const { onDeleted, onClose } =
    useOutletContext<ArtifactsOutletContext>();
  return (
    <ArtifactDetail
      artifactId={artifactId ?? null}
      onDeleted={onDeleted}
      onClose={onClose}
    />
  );
}
