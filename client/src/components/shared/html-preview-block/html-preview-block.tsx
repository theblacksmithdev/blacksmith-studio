import { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { Code2, Eye, ExternalLink } from "lucide-react";
import { CodeBlock } from "@/components/shared/code-block";
import { Tooltip } from "@/components/shared/tooltip";

const Shell = styled.div<{ $fill?: boolean }>`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--studio-border);
  border-radius: ${(p) => (p.$fill ? "0" : "10px")};
  overflow: hidden;
  margin-bottom: ${(p) => (p.$fill ? "0" : "14px")};
  background: var(--studio-bg-surface);
  ${(p) => (p.$fill ? "flex: 1; min-height: 0;" : "")}
  ${(p) => (p.$fill ? "border-left: none; border-right: none; border-bottom: none;" : "")}
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
`;

const Tab = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid
    ${(p) => (p.$active ? "var(--studio-border)" : "transparent")};
  background: ${(p) =>
    p.$active ? "var(--studio-bg-main)" : "transparent"};
  color: ${(p) =>
    p.$active ? "var(--studio-text-primary)" : "var(--studio-text-muted)"};
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    color: var(--studio-text-primary);
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const IconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--studio-text-muted);
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    color: var(--studio-text-primary);
    border-color: var(--studio-border);
    background: var(--studio-bg-main);
  }
`;

const PreviewFrame = styled.iframe<{ $fill?: boolean }>`
  width: 100%;
  height: ${(p) => (p.$fill ? "100%" : "480px")};
  flex: ${(p) => (p.$fill ? "1" : "initial")};
  min-height: 0;
  border: none;
  background: white;
  display: block;
`;

const CodeWrap = styled.div<{ $fill?: boolean }>`
  padding: 10px;
  background: var(--studio-bg-main);
  ${(p) => (p.$fill ? "flex: 1; min-height: 0; overflow: auto;" : "")}
`;

interface HtmlPreviewBlockProps {
  code: string;
  /** When true, the shell stretches to fill its parent (no bottom margin,
   *  iframe grows to fill available space). Use for artifact-detail
   *  full-bleed rendering when the whole artifact is HTML. */
  fill?: boolean;
}

/**
 * Renders an HTML code block as a live sandboxed preview by default,
 * with a toggle to view source. The iframe runs with `sandbox` set to
 * `allow-scripts` only — scripts execute for CSS/JS demos but can't
 * access the parent window or cookies.
 *
 * Used by `MarkdownRenderer` whenever a code fence carries the `html`
 * language, so any artifact or chat message containing an HTML snippet
 * renders as a working preview instead of raw code.
 */
export function HtmlPreviewBlock({ code, fill }: HtmlPreviewBlockProps) {
  const [mode, setMode] = useState<"preview" | "code">("preview");
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    // Reset the iframe when the source changes so scripts re-run.
    if (frameRef.current) {
      frameRef.current.srcdoc = code;
    }
  }, [code]);

  const openInNewWindow = () => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    // Revoke after the window has had a chance to fetch the blob.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <Shell $fill={fill}>
      <Toolbar>
        <Tab $active={mode === "preview"} onClick={() => setMode("preview")}>
          <Eye size={11} /> Preview
        </Tab>
        <Tab $active={mode === "code"} onClick={() => setMode("code")}>
          <Code2 size={11} /> HTML
        </Tab>
        <Spacer />
        <Tooltip content="Open preview in a new window">
          <IconBtn onClick={openInNewWindow} aria-label="Open in new window">
            <ExternalLink size={12} />
          </IconBtn>
        </Tooltip>
      </Toolbar>

      {mode === "preview" ? (
        <PreviewFrame
          ref={frameRef}
          srcDoc={code}
          sandbox="allow-scripts"
          referrerPolicy="no-referrer"
          title="HTML preview"
          $fill={fill}
        />
      ) : (
        <CodeWrap $fill={fill}>
          <CodeBlock code={code} language="html" />
        </CodeWrap>
      )}
    </Shell>
  );
}
