import { Sidebar } from "../sidebar";
import { ProjectTitleBar } from "../title-bar";
import { Body, Content, Main, Root } from "./styles";

/**
 * Skeleton shown while the project + settings queries resolve. Paints
 * the chrome (title bar + sidebar) so the viewport doesn't flash
 * blank between route change and first data.
 */
export function ProjectLayoutLoading() {
  return (
    <Root>
      <ProjectTitleBar />
      <Body>
        <Sidebar />
        <Main>
          <Content />
        </Main>
      </Body>
    </Root>
  );
}
