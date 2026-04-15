import styled from "@emotion/styled";

const StyledSelect = styled.select<{ disabled?: boolean }>`
  padding: 7px 28px 7px 10px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-primary);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  transition: border-color 0.12s ease;
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    border-color: var(--studio-border-hover);
  }

  &:focus {
    border-color: var(--studio-border-hover);
    box-shadow: var(--studio-ring-focus);
  }
`;

interface SettingSelectProps {
  value: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function SettingSelect({
  value,
  options,
  disabled,
  onChange,
}: SettingSelectProps) {
  return (
    <StyledSelect
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </StyledSelect>
  );
}
