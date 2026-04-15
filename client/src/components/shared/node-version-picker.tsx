import { useState, useMemo } from "react";
import { Flex, Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { RefreshCw, AlertTriangle, Check } from "lucide-react";
import { useDetectNodeQuery } from "@/api/hooks/runner";
import { Text, Badge, IconButton } from "@/components/shared/ui";
import type { NodeInstallation } from "@/api/types";
import { MIN_NODE_MAJOR } from "@/constants/node-js";

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

interface NodeVersionPickerProps {
  value: string;
  onChange: (v: string) => void;
}

export function NodeVersionPicker({ value, onChange }: NodeVersionPickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const { data: installations = [], isLoading, refetch } = useDetectNodeQuery();

  const selectedMajor = useMemo(() => {
    if (!value) return null;
    const match = installations.find((n: NodeInstallation) => n.path === value);
    if (!match) return null;
    const major = parseInt(match.version.replace(/^v/, ""), 10);
    return isNaN(major) ? null : major;
  }, [value, installations]);

  const isBelowMinimum =
    selectedMajor !== null && selectedMajor < MIN_NODE_MAJOR;
  const isGood = selectedMajor !== null && selectedMajor >= MIN_NODE_MAJOR;

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
          {installations.map((n: NodeInstallation) => (
            <option key={n.path} value={n.path}>
              {n.label}
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
          placeholder="/path/to/node"
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
          Node v{selectedMajor} detected — minimum required is v{MIN_NODE_MAJOR}
          .
        </Badge>
      )}

      {isGood && (
        <Flex align="center" gap="4px">
          <Check size={11} style={{ color: "var(--studio-green)" }} />
          <Text css={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>
            v{selectedMajor} detected
          </Text>
        </Flex>
      )}

      {!value && !showCustom && (
        <Text css={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>
          Using system default. Set a specific version if you use nvm or volta.
        </Text>
      )}
    </Flex>
  );
}
