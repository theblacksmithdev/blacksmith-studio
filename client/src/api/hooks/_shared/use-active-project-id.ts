import { useParams } from "react-router-dom";

/** Returns the active project ID from the :projectId route param. */
export function useActiveProjectId() {
  const { projectId } = useParams<{ projectId: string }>();
  return projectId;
}
