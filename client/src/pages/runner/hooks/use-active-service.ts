import { useParams, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { runServicePath } from "@/router/paths";

/**
 * Single source of truth for the active service in the runner page.
 * Reads `configId` from the URL. "all" means no specific service selected.
 *
 * Returns:
 * - `activeId`: the selected config ID, or `null` for "all logs"
 * - `selectService(id | null)`: navigate to a service or back to "all"
 * - `isSelected(id)`: check if a given service is the active one
 */
export function useActiveService() {
  const { projectId = "", configId } = useParams<{
    projectId: string;
    configId: string;
  }>();
  const navigate = useNavigate();

  const activeId = configId && configId !== "all" ? configId : null;

  const selectService = useCallback(
    (id: string | null) => {
      navigate(
        id ? runServicePath(projectId, id) : runServicePath(projectId, "all"),
      );
    },
    [navigate, projectId],
  );

  const isSelected = useCallback((id: string) => activeId === id, [activeId]);

  return { activeId, selectService, isSelected };
}
