import styled from "@emotion/styled";
import { useLocation } from "react-router-dom";
import { Copy, Check, MapPin } from "lucide-react";
import { useCopy } from "@/components/shared/conversation";
import { radii } from "@/components/shared/ui";

const Wrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 6px 6px 10px;
  border-radius: ${radii.full};
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  max-width: 100%;
`;

const Pin = styled.span`
  display: inline-flex;
  color: var(--studio-text-muted);
  flex-shrink: 0;
`;

const Path = styled.code`
  font-family: "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, monospace";
  font-size: 12px;
  color: var(--studio-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 360px;
`;

const CopyBtn = styled.button<{ $copied: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: ${({ $copied }) =>
    $copied ? "var(--studio-text-primary)" : "var(--studio-text-muted)"};
  cursor: pointer;
  transition: color 0.12s ease, background 0.12s ease;
  flex-shrink: 0;

  &:hover {
    color: var(--studio-text-primary);
    background: var(--studio-bg-hover);
  }
`;

export function ErrorPath() {
  const location = useLocation();
  const { copied, copy } = useCopy();
  const fullPath = `${location.pathname}${location.search}${location.hash}`;

  return (
    <Wrap>
      <Pin aria-hidden="true">
        <MapPin size={12} />
      </Pin>
      <Path title={fullPath}>{fullPath}</Path>
      <CopyBtn
        type="button"
        onClick={() => copy(fullPath)}
        aria-label={copied ? "Copied" : "Copy path"}
        $copied={copied}
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
      </CopyBtn>
    </Wrap>
  );
}
