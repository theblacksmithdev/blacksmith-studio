import { useRef, useState } from "react";
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
import {
  PopupMenu,
  PopupMenuItem,
  PopupMenuLabel,
  PopupMenuSeparator,
} from "@/components/shared/ui";

interface AttachmentPickerButtonProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  multiple?: boolean;
}

interface Option {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  accept: string;
}

const OPTIONS: Option[] = [
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

export function AttachmentPickerButton({
  onFiles,
  disabled,
  multiple = true,
}: AttachmentPickerButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [accept, setAccept] = useState<string>("");

  const openPicker = (acceptValue: string) => {
    setAccept(acceptValue);
    requestAnimationFrame(() => inputRef.current?.click());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onFiles(files);
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={multiple}
        accept={accept || undefined}
        onChange={handleChange}
      />
      <PopupMenu
        placement="top-start"
        // background="var(--studio-glass)"
        // minWidth={240}
        trigger={
          <TriggerButton
            type="button"
            disabled={disabled}
            aria-label="Attach"
            title="Attach"
          >
            <Paperclip size={14} />
          </TriggerButton>
        }
      >
        <PopupMenuLabel>Attach</PopupMenuLabel>
        {OPTIONS.map((opt, i) => {
          const Icon = opt.icon;
          const isLast = i === OPTIONS.length - 1;
          return (
            <span key={opt.id}>
              {isLast && <PopupMenuSeparator />}
              <PopupMenuItem
                value={opt.id}
                onClick={() => openPicker(opt.accept)}
              >
                <IconWell>
                  <Icon size={14} />
                </IconWell>
                <ItemText>
                  <ItemLabel>{opt.label}</ItemLabel>
                  <ItemHint>{opt.hint}</ItemHint>
                </ItemText>
              </PopupMenuItem>
            </span>
          );
        })}
      </PopupMenu>
    </>
  );
}

const TriggerButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  font-family: inherit;
  padding: 0;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }

  &:active {
    background: var(--studio-bg-hover-strong);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--studio-ring-focus);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
