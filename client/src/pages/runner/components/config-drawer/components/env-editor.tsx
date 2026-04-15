import { useState } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Plus, Trash2, FileText, List } from "lucide-react";
import type { UseFieldArrayReturn, UseFormRegister } from "react-hook-form";
import {
  Text,
  Input,
  Button,
  IconButton,
  Tooltip,
  spacing,
  radii,
} from "@/components/shared/ui";
import type { RunnerConfigFormData, EnvEntry } from "../schema";

interface EnvEditorProps {
  register: UseFormRegister<RunnerConfigFormData>;
  envArray: UseFieldArrayReturn<RunnerConfigFormData, "env">;
}

export function EnvEditor({ register, envArray }: EnvEditorProps) {
  const { fields, append, remove, replace } = envArray;
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const switchToBulk = () => {
    setBulkText(
      fields
        .map((f) => `${f.key}=${f.value}`)
        .filter((l) => l !== "=")
        .join("\n"),
    );
    setBulkMode(true);
  };

  const applyBulk = () => {
    const entries: EnvEntry[] = [];
    for (const line of bulkText.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        entries.push({
          key: trimmed.slice(0, idx).trim(),
          value: trimmed.slice(idx + 1).trim(),
        });
      }
    }
    replace(entries);
    setBulkMode(false);
  };

  return (
    <Flex direction="column" gap={spacing.sm}>
      {/* Header */}
      <Flex align="center" justify="space-between">
        <Text
          variant="bodySmall"
          css={{ fontWeight: 500, color: "var(--studio-text-secondary)" }}
        >
          Variables
        </Text>
        <Flex gap={spacing.xs}>
          <Tooltip content={bulkMode ? "Switch to editor" : "Bulk paste"}>
            <IconButton
              variant={bulkMode ? "default" : "ghost"}
              size="xs"
              onClick={bulkMode ? () => setBulkMode(false) : switchToBulk}
              aria-label="Toggle bulk mode"
            >
              {bulkMode ? <List /> : <FileText />}
            </IconButton>
          </Tooltip>
          {!bulkMode && (
            <Tooltip content="Add variable">
              <IconButton
                variant="ghost"
                size="xs"
                onClick={() => append({ key: "", value: "" })}
                aria-label="Add variable"
              >
                <Plus />
              </IconButton>
            </Tooltip>
          )}
        </Flex>
      </Flex>

      {bulkMode ? (
        /* ── Bulk paste mode ── */
        <Flex direction="column" gap={spacing.sm}>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={
              "# Paste environment variables\nKEY=value\nDATABASE_URL=postgres://...\nNODE_ENV=development"
            }
            rows={8}
            style={{
              width: "100%",
              padding: spacing.sm,
              borderRadius: radii.md,
              border: "1px solid var(--studio-border)",
              background: "var(--studio-bg-inset)",
              color: "var(--studio-text-primary)",
              fontSize: "12px",
              fontFamily: "'SF Mono', monospace",
              lineHeight: "1.6",
              resize: "vertical",
              outline: "none",
            }}
          />
          <Flex gap={spacing.sm} justify="flex-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBulkMode(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={applyBulk}>
              Apply
            </Button>
          </Flex>
        </Flex>
      ) : fields.length === 0 ? (
        /* ── Empty state ── */
        <Flex
          direction="column"
          align="center"
          gap={spacing.sm}
          css={{ padding: spacing.xl }}
        >
          <Text variant="caption" color="muted">
            No environment variables
          </Text>
          <Flex gap={spacing.sm}>
            <Flex
              as="button"
              align="center"
              gap={spacing.xs}
              onClick={() => append({ key: "", value: "" })}
              css={{
                padding: `${spacing.xs} ${spacing.md}`,
                borderRadius: radii.md,
                border: "1px dashed var(--studio-border)",
                background: "transparent",
                color: "var(--studio-text-muted)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "12px",
                transition: "all 0.1s ease",
                "&:hover": {
                  borderColor: "var(--studio-border-hover)",
                  color: "var(--studio-text-secondary)",
                },
              }}
            >
              <Plus size={12} /> Add
            </Flex>
            <Flex
              as="button"
              align="center"
              gap={spacing.xs}
              onClick={switchToBulk}
              css={{
                padding: `${spacing.xs} ${spacing.md}`,
                borderRadius: radii.md,
                border: "1px dashed var(--studio-border)",
                background: "transparent",
                color: "var(--studio-text-muted)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "12px",
                transition: "all 0.1s ease",
                "&:hover": {
                  borderColor: "var(--studio-border-hover)",
                  color: "var(--studio-text-secondary)",
                },
              }}
            >
              <FileText size={12} /> Paste bulk
            </Flex>
          </Flex>
        </Flex>
      ) : (
        /* ── Key-value rows ── */
        <Flex direction="column" gap={spacing.xs}>
          {fields.map((field, i) => (
            <Flex key={field.id} align="center" gap={spacing.xs}>
              <Input
                size="sm"
                placeholder="KEY"
                css={{
                  flex: 1,
                  fontFamily: "'SF Mono', monospace",
                  fontSize: "12px",
                }}
                {...register(`env.${i}.key`)}
              />
              <Text variant="caption" color="muted">
                =
              </Text>
              <Input
                size="sm"
                placeholder="value"
                css={{
                  flex: 2,
                  fontFamily: "'SF Mono', monospace",
                  fontSize: "12px",
                }}
                {...register(`env.${i}.value`)}
              />
              <Tooltip content="Remove">
                <IconButton
                  variant="ghost"
                  size="xs"
                  onClick={() => remove(i)}
                  aria-label="Remove"
                >
                  <Trash2 />
                </IconButton>
              </Tooltip>
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );
}
