import { Outlet, useNavigate, useParams } from "react-router-dom";
import styled from "@emotion/styled";
import { SplitPanel } from "@/components/shared/layout";
import { ArtifactList } from "@/components/artifacts";
import { artifactDetailPath, artifactsPath } from "@/router/paths";

const Root = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
`;

const DetailPanel = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  background: var(--studio-bg-main);
`;

/**
 * Split-panel artifact library.
 *
 * Layout: `ArtifactList` on the left, nested route outlet on the right.
 * Selection is a URL path segment (`/projects/:id/artifacts/:artifactId`)
 * so rows deep-link, the browser back button works, and refreshing
 * restores the same view.
 */
export default function ArtifactsLayout() {
  const { projectId = "", artifactId } = useParams<{
    projectId: string;
    artifactId?: string;
  }>();
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    navigate(artifactDetailPath(projectId, id));
  };

  const clearSelection = () => {
    navigate(artifactsPath(projectId));
  };

  return (
    <Root>
      <SplitPanel
        left={
          <ArtifactList
            title="Artifact Library"
            selectedId={artifactId ?? null}
            onSelect={handleSelect}
          />
        }
        defaultWidth={380}
        minWidth={300}
        maxWidth={560}
        storageKey="artifacts.listWidth"
      >
        <DetailPanel>
          <Outlet
            context={{
              onDeleted: clearSelection,
              onClose: clearSelection,
            }}
          />
        </DetailPanel>
      </SplitPanel>
    </Root>
  );
}
