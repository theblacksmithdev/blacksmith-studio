import styled from "@emotion/styled";

export type IFrameSandbox =
  | "allow-scripts"
  | "allow-same-origin"
  | "allow-scripts allow-same-origin";

interface IFrameProps {
  /** HTML content to render inline (uses srcdoc). */
  srcDoc?: string;
  /** URL to load (uses src). */
  src?: string;
  /** Sandbox policy. Defaults to "allow-scripts". */
  sandbox?: IFrameSandbox;
  /** Title for accessibility. */
  title?: string;
}

const Frame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  flex: 1;
  min-height: 0;
  background: var(--studio-bg-main);
`;

export function IFrame({
  srcDoc,
  src,
  sandbox = "allow-scripts",
  title = "Embedded content",
}: IFrameProps) {
  return (
    <Frame
      srcDoc={srcDoc}
      src={srcDoc ? undefined : src}
      sandbox={sandbox}
      title={title}
    />
  );
}
