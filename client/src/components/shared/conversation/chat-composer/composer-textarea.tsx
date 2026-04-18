import { forwardRef } from "react";
import { spacing } from "@/components/shared/ui";

interface ComposerTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight: string;
}

export const ComposerTextarea = forwardRef<
  HTMLTextAreaElement,
  ComposerTextareaProps
>(function ComposerTextarea(
  { value, onChange, onKeyDown, placeholder, disabled, minHeight },
  ref,
) {
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
      style={{
        width: "100%",
        minHeight,
        padding: `${spacing.md} ${spacing.xl}`,
        background: "transparent",
        border: "none",
        outline: "none",
        resize: "none",
        overflowY: "hidden",
        color: "var(--studio-text-primary)",
        fontSize: "15px",
        lineHeight: "1.6",
        fontFamily: "inherit",
        position: "relative",
        zIndex: 2,
      }}
    />
  );
});
