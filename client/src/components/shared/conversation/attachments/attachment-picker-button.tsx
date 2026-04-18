import { useRef, useState, useEffect } from "react";
import styled from "@emotion/styled";
import {
  Paperclip,
  Image as ImageIcon,
  FileText,
  FileCode2,
  Braces,
  FolderOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconButton, Tooltip } from "@/components/shared/ui";

interface AttachmentPickerButtonProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  multiple?: boolean;
}

interface MenuOption {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  accept: string;
}

const OPTIONS: MenuOption[] = [
  {
    id: "image",
    label: "Image",
    hint: "PNG, JPG, SVG, WebP",
    icon: ImageIcon,
    accept: "image/*",
  },
  {
    id: "document",
    label: "Document",
    hint: "PDF, DOCX, TXT, MD",
    icon: FileText,
    accept:
      ".pdf,.doc,.docx,.txt,.md,.mdx,.rtf,application/pdf,text/plain,text/markdown",
  },
  {
    id: "code",
    label: "Code",
    hint: "Source files",
    icon: FileCode2,
    accept:
      ".ts,.tsx,.js,.jsx,.py,.go,.rs,.java,.kt,.swift,.c,.cpp,.h,.cs,.php,.rb,.sh,.html,.css,.scss,.vue",
  },
  {
    id: "data",
    label: "Data",
    hint: "JSON, CSV, YAML",
    icon: Braces,
    accept: ".json,.yaml,.yml,.toml,.csv,.tsv,.xml",
  },
  {
    id: "any",
    label: "Any file",
    hint: "Browse all files",
    icon: FolderOpen,
    accept: "",
  },
];

const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const Menu = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  min-width: 240px;
  padding: 6px;
  border-radius: 14px;
  background: var(--studio-glass);
  border: 1px solid var(--studio-glass-border);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.24),
    0 2px 8px rgba(0, 0, 0, 0.14),
    inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  backdrop-filter: saturate(1.4) blur(18px);
  -webkit-backdrop-filter: saturate(1.4) blur(18px);
  z-index: 30;
  display: flex;
  flex-direction: column;
  gap: 1px;
  transform-origin: bottom left;
  animation: studio-attach-menu-in 160ms cubic-bezier(0.16, 1, 0.3, 1) both;

  @keyframes studio-attach-menu-in {
    from {
      opacity: 0;
      transform: translateY(6px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const MenuLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--studio-text-muted);
  padding: 8px 10px 6px;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: none;
  background: transparent;
  border-radius: 9px;
  color: var(--studio-text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.12s ease,
    transform 0.12s ease;
  width: 100%;

  &:hover,
  &:focus-visible {
    background: var(--studio-bg-hover);
    outline: none;
  }

  &:active {
    transform: translateY(0.5px);
  }
`;

const IconWell = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 8px;
  background: var(--studio-bg-inset);
  border: 1px solid var(--studio-border);
  color: var(--studio-text-secondary);
`;

const ItemText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 1px;
`;

const ItemLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--studio-text-primary);
  line-height: 1.25;
`;

const ItemHint = styled.span`
  font-size: 11px;
  color: var(--studio-text-muted);
  line-height: 1.25;
`;

const Divider = styled.div`
  height: 1px;
  background: var(--studio-border);
  margin: 4px 6px;
  opacity: 0.6;
`;

export function AttachmentPickerButton({
  onFiles,
  disabled,
  multiple = true,
}: AttachmentPickerButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [accept, setAccept] = useState<string>("");
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((i) => (i + 1) % OPTIONS.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((i) => (i - 1 + OPTIONS.length) % OPTIONS.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        openPicker(OPTIONS[highlight].accept);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, highlight]); // eslint-disable-line react-hooks/exhaustive-deps

  const openPicker = (acceptValue: string) => {
    setAccept(acceptValue);
    setOpen(false);
    requestAnimationFrame(() => inputRef.current?.click());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onFiles(files);
    e.target.value = "";
  };

  return (
    <Wrapper ref={wrapperRef}>
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={multiple}
        accept={accept || undefined}
        onChange={handleChange}
      />
      <Tooltip content="Attach">
        <IconButton
          variant="ghost"
          size="sm"
          onClick={() => {
            setHighlight(0);
            setOpen((v) => !v);
          }}
          disabled={disabled}
          aria-label="Attach"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <Paperclip />
        </IconButton>
      </Tooltip>

      {open && (
        <Menu role="menu">
          <MenuLabel>Attach</MenuLabel>
          {OPTIONS.slice(0, -1).map((opt, i) => {
            const Icon = opt.icon;
            return (
              <MenuItem
                key={opt.id}
                role="menuitem"
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => openPicker(opt.accept)}
                style={
                  highlight === i
                    ? { background: "var(--studio-bg-hover)" }
                    : undefined
                }
              >
                <IconWell>
                  <Icon size={14} />
                </IconWell>
                <ItemText>
                  <ItemLabel>{opt.label}</ItemLabel>
                  <ItemHint>{opt.hint}</ItemHint>
                </ItemText>
              </MenuItem>
            );
          })}
          <Divider />
          {(() => {
            const last = OPTIONS[OPTIONS.length - 1];
            const i = OPTIONS.length - 1;
            const Icon = last.icon;
            return (
              <MenuItem
                key={last.id}
                role="menuitem"
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => openPicker(last.accept)}
                style={
                  highlight === i
                    ? { background: "var(--studio-bg-hover)" }
                    : undefined
                }
              >
                <IconWell>
                  <Icon size={14} />
                </IconWell>
                <ItemText>
                  <ItemLabel>{last.label}</ItemLabel>
                  <ItemHint>{last.hint}</ItemHint>
                </ItemText>
              </MenuItem>
            );
          })()}
        </Menu>
      )}
    </Wrapper>
  );
}
