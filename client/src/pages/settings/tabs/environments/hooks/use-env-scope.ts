import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export type EnvScope = "project" | "global";

/**
 * URL-synced scope toggle state.
 *
 * The scope lives in the `?scope=` query param (not the hash — the app
 * uses `createHashRouter`, so the URL fragment is owned by the
 * router). This keeps the view deep-linkable from the global-settings
 * drawer shortcut and survives reloads.
 */
export function useEnvScope(): {
  scope: EnvScope;
  setScope: (next: EnvScope) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const scope: EnvScope =
    searchParams.get("scope") === "global" ? "global" : "project";

  const setScope = useCallback(
    (next: EnvScope) => {
      const params = new URLSearchParams(searchParams);
      if (next === "project") params.delete("scope");
      else params.set("scope", next);
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return { scope, setScope };
}
