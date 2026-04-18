import { ArtifactList } from "@/components/artifacts";

/**
 * Project-wide artifact library. Route: `/:projectId/artifacts`.
 * Lists every markdown artifact under the project's
 * `.blacksmith/artifacts/` regardless of conversation.
 */
export default function ArtifactsPage() {
  return <ArtifactList title="Artifact Library" />;
}
