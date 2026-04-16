import { useState, useMemo } from "react";
import { Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { RefreshCw, AlertTriangle, Check } from "lucide-react";
import { useDetectPythonQuery } from "@/api/hooks/python";
import { Text, Badge, IconButton } from "@/components/shared/ui";
import type { PythonInstallation } from "@/api/modules/python";

const MIN_PYTHON_MAJOR = 3;
const MIN_PYTHON_MINOR = 10;

const Select = styled.select`
  min-width: 0;
  flex: 1;
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
  &:hover {
    border-color: var(--studio-border-hover);
  }
  &:focus {
    border-color: var(--studio-border-hover);
    box-shadow: var(--studio-ring-focus);
  }
`;

const CustomInput = styled.input`
  width: 100%;
  padding: 7px 10px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-inset);
  color: var(--studio-text-primary);
  font-size: 13px;
  font-family: "SF Mono", "Fira Code", monospace;
  outline: none;
  transition: border-color 0.12s ease;
  &:focus {
    border-color: var(--studio-border-hover);
    box-shadow: var(--studio-ring-focus);
  }
`;

interface PythonVersionPickerProps {
  value: string;
  onChange: (v: string) => void;
}

export function PythonVersionPicker({
  value,
  onChange,
}: PythonVersionPickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const {
    data: installations = [],
    isLoading,
    refetch,
  } = useDetectPythonQuery();

  const selectedVersion = useMemo(() => {
    if (!value) return null;
    const match = installations.find(
      (p: PythonInstallation) => p.path === value,
    );
    if (!match) return null;
    const parts = match.version.split(".").map(Number);
    return { major: parts[0], minor: parts[1] };
  }, [value, installations]);

  const isBelowMinimum =
    selectedVersion !== null &&
    (selectedVersion.major < MIN_PYTHON_MAJOR ||
      (selectedVersion.major === MIN_PYTHON_MAJOR &&
        selectedVersion.minor < MIN_PYTHON_MINOR));

  const isGood =
    selectedVersion !== null &&
    (selectedVersion.major > MIN_PYTHON_MAJOR ||
      (selectedVersion.major === MIN_PYTHON_MAJOR &&
        selectedVersion.minor >= MIN_PYTHON_MINOR));

  return (
    <Flex direction="column" gap="8px" css={{ width: "100%" }}>
      <Flex gap="8px" align="center">
        <Select
          value={showCustom ? "__custom__" : value}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "__custom__") {
              setShowCustom(true);
            } else {
              setShowCustom(false);
              onChange(v);
            }
          }}
        >
          <option value="">System default</option>
          {installations.map((p: PythonInstallation) => (
            <option key={p.path} value={p.path}>
              {p.label}
            </option>
          ))}
          <option value="__custom__">Custom path...</option>
        </Select>
        <IconButton
          variant="default"
          size="sm"
          onClick={() => refetch()}
          aria-label="Rescan"
        >
          <RefreshCw
            size={13}
            style={
              isLoading ? { animation: "spin 1s linear infinite" } : undefined
            }
          />
        </IconButton>
      </Flex>

      {showCustom && (
        <CustomInput
          type="text"
          placeholder="/path/to/python3"
          defaultValue={value}
          onBlur={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              onChange((e.target as HTMLInputElement).value);
          }}
          autoFocus
        />
      )}

      {isBelowMinimum && (
        <Badge
          variant="warning"
          size="md"
          css={{ width: "100%", padding: "6px 10px" }}
        >
          <AlertTriangle size={13} style={{ flexShrink: 0 }} />
          Python {selectedVersion.major}.{selectedVersion.minor} detected —
          minimum required is {MIN_PYTHON_MAJOR}.{MIN_PYTHON_MINOR}.
        </Badge>
      )}

      {isGood && (
        <Flex align="center" gap="4px">
          <Check size={11} style={{ color: "var(--studio-green)" }} />
          <Text css={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>
            Python {selectedVersion.major}.{selectedVersion.minor} detected
          </Text>
        </Flex>
      )}

      {!value && !showCustom && (
        <Text css={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>
          Using system default. Set a specific version if you use pyenv or
          conda.
        </Text>
      )}
    </Flex>
  );
}
