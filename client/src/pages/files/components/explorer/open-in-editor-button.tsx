import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import styled from "@emotion/styled";
import { ExternalLink, Check } from "lucide-react";
import { IconButton, Tooltip, Text } from "@/components/shared/ui";
import { useEditors } from "@/pages/files/hooks/use-editors";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
`;

const Dropdown = styled.div`
  position: fixed;
  min-width: 200px;
  padding: 4px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border-hover);
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  z-index: 1000;
  animation: editorDropIn 0.1s ease;

  @keyframes editorDropIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const EditorRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: inherit;
  text-align: left;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`;

const CheckMark = styled.span`
  margin-left: auto;
  display: flex;
  color: var(--studio-text-muted);
`;

const ButtonWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  -webkit-app-region: no-drag;
`;

export function OpenInEditorButton() {
  const { editors, preferred, setPreferred, openFile, isLoading } =
    useEditors();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4,
        left: Math.min(rect.left, window.innerWidth - 220),
      });
    }
  }, [open]);

  if (isLoading || editors.length === 0) return null;

  const handleClick = () => {
    if (editors.length === 1) {
      openFile(".");
    } else {
      setOpen(!open);
    }
  };

  const label = preferred ? `Open in ${preferred.name}` : "Open in Editor";

  return (
    <>
      <ButtonWrap ref={btnRef}>
        <Tooltip content={label}>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={handleClick}
            aria-label={label}
          >
            <ExternalLink />
          </IconButton>
        </Tooltip>
      </ButtonWrap>

      {open &&
        createPortal(
          <>
            <Overlay onClick={() => setOpen(false)} />
            <Dropdown style={{ top: pos.top, left: pos.left }}>
              <div style={{ padding: "6px 10px 4px" }}>
                <Text variant="caption" color="muted">
                  Open project in...
                </Text>
              </div>
              {editors.map((editor) => (
                <EditorRow
                  key={editor.id}
                  onClick={() => {
                    setPreferred(editor.command);
                    openFile(".", editor.command);
                    setOpen(false);
                  }}
                >
                  {editor.name}
                  {editor.command === preferred?.command && (
                    <CheckMark>
                      <Check size={13} />
                    </CheckMark>
                  )}
                </EditorRow>
              ))}
            </Dropdown>
          </>,
          document.body,
        )}
    </>
  );
}
