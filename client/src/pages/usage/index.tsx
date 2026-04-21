import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { SplitPanel } from "@/components/shared/layout";
import { useUsageHistory } from "@/api/hooks/usage";
import { ModelsSidebar, ModelDetail } from "@/components/usage";

/**
 * Split-panel usage console.
 *
 * Left: models rail with "All" + one row per model that has usage.
 * Right: filtered detail (token mix + chat sessions + agent dispatches)
 * for the current selection. Selection lives in `?model=` so the page
 * deep-links and survives refreshes.
 */
export default function UsagePage() {
  const { data, isLoading, error } = useUsageHistory();
  const [params, setParams] = useSearchParams();
  const selectedModel = params.get("model");

  const setSelected = useCallback(
    (id: string | null) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id) next.set("model", id);
          else next.delete("model");
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  if (isLoading && !data) {
    return <Centered>Loading usage…</Centered>;
  }
  if (error || !data) {
    return <Centered>Could not load usage history.</Centered>;
  }

  return (
    <Root>
      <SplitPanel
        left={
          <ModelsSidebar
            history={data}
            selectedModel={selectedModel}
            onSelect={setSelected}
          />
        }
        defaultWidth={280}
        minWidth={220}
        maxWidth={420}
        storageKey="usage.sidebarWidth"
      >
        <ModelDetail history={data} selectedModel={selectedModel} />
      </SplitPanel>
    </Root>
  );
}

const Root = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
`;

const Centered = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--studio-text-muted);
  font-size: 13px;
`;
