import { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { FolderSearch, CheckCircle2, XCircle } from "lucide-react";
import { Button, Text } from "@/components/shared/ui";
import { selectFileNative } from "@/lib/electron";
import { useValidateBin } from "@/api/hooks/setup";
import {
  PickerCard,
  PickerLabel,
  PickerMain,
  PickerPath,
  PickerRadio,
  PickerRow,
  PickerScroll,
  PickerVersion,
  SpinIcon,
  pickerErrorMsgCss,
  pickerInlineRowCss,
  pickerOkMsgCss,
} from "./styles";

export interface BinaryCandidate {
  label: string;
  path: string;
  version: string;
}

export interface BinaryPickerProps {
  candidates: BinaryCandidate[];
  value: string | null;
  onChange: (path: string, version: string) => void;
  browseTitle?: string;
  disabled?: boolean;
  emptyHint?: string;
}

/**
 * Radio-style picker with auto-detected candidates + a "Browse…" button.
 * The candidate list is scroll-capped; the Browse row stays pinned below.
 */
export function BinaryPicker({
  candidates,
  value,
  onChange,
  browseTitle,
  disabled,
  emptyHint,
}: BinaryPickerProps) {
  const validate = useValidateBin();
  const [customError, setCustomError] = useState<string | null>(null);

  const handleBrowse = async () => {
    setCustomError(null);
    const path = await selectFileNative({
      title: browseTitle ?? "Select executable",
      buttonLabel: "Select",
    });
    if (!path) return;

    try {
      const result = await validate.mutateAsync(path);
      if (result.valid && result.version) {
        onChange(path, result.version);
      } else {
        setCustomError(result.error ?? "Unable to validate this executable.");
      }
    } catch (err) {
      setCustomError(err instanceof Error ? err.message : String(err));
    }
  };

  const validating = validate.isPending;

  return (
    <Box>
      <PickerCard>
        {candidates.length === 0 && (
          <Flex css={pickerInlineRowCss}>
            <XCircle size={14} style={{ color: "var(--studio-text-muted)" }} />
            <Text variant="bodySmall" color="tertiary">
              {emptyHint ?? "No installations detected."}
            </Text>
          </Flex>
        )}
        {candidates.length > 0 && (
          <PickerScroll>
            {candidates.map((c) => {
              const selected = c.path === value;
              return (
                <PickerRow
                  key={c.path}
                  type="button"
                  $selected={selected}
                  disabled={disabled}
                  onClick={() => onChange(c.path, c.version)}
                >
                  <PickerRadio $selected={selected} />
                  <PickerMain>
                    <PickerLabel>{c.label}</PickerLabel>
                    <PickerPath title={c.path}>{c.path}</PickerPath>
                  </PickerMain>
                  <PickerVersion>{c.version}</PickerVersion>
                </PickerRow>
              );
            })}
          </PickerScroll>
        )}
        <Flex css={pickerInlineRowCss}>
          <FolderSearch
            size={14}
            style={{ color: "var(--studio-text-muted)" }}
          />
          <Text variant="bodySmall" color="tertiary" css={{ flex: 1 }}>
            Can't see yours? Pick a custom path.
          </Text>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBrowse}
            disabled={disabled || validating}
          >
            {validating ? (
              <>
                <SpinIcon size={13} /> Validating…
              </>
            ) : (
              "Browse…"
            )}
          </Button>
        </Flex>
      </PickerCard>

      {customError && (
        <Flex align="center" gap="6px" mt="8px" css={pickerErrorMsgCss}>
          <XCircle size={13} /> {customError}
        </Flex>
      )}
      {!customError && value && candidates.every((c) => c.path !== value) && (
        <Flex align="center" gap="6px" mt="8px" css={pickerOkMsgCss}>
          <CheckCircle2 size={13} /> Using custom path: {value}
        </Flex>
      )}
    </Box>
  );
}
