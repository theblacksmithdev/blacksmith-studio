import { useRef, useState } from "react";
import { Flex } from "@chakra-ui/react";
import { Terminal, Pencil } from "lucide-react";
import { Drawer, Button, IconButton, spacing } from "@/components/shared/ui";
import type { RunnerConfigData } from "@/api/types";
import { ConfigDetail } from "./components";
import {
  RunnerConfigForm,
  type RunnerConfigFormHandle,
} from "./runner-config-form";

interface RunnerConfigDrawerProps {
  config?: RunnerConfigData | null;
  onSave: (data: Partial<RunnerConfigData>) => void;
  onClose: () => void;
  /** Forwarded to the underlying Drawer — set when spawning above a high-z overlay. */
  zIndex?: number;
}

/**
 * Drawer wrapper around `RunnerConfigForm`. Adds header/footer chrome
 * and the view/edit toggle for existing configs. The form itself is
 * shared so the onboarding flow can use it inline without a drawer.
 */
export function RunnerConfigDrawer({
  config,
  onSave,
  onClose,
  zIndex,
}: RunnerConfigDrawerProps) {
  const isNew = !config;
  const [editing, setEditing] = useState(isNew);
  const handleRef = useRef<RunnerConfigFormHandle | null>(null);
  const [isValid, setIsValid] = useState(false);

  const isDetail = !editing && !!config;

  const handleSave = async () => {
    if (!handleRef.current) return;
    await handleRef.current.submit();
    onClose();
  };

  return (
    <Drawer
      title={isDetail ? config.name : isNew ? "Add Service" : "Edit Service"}
      onClose={onClose}
      size="sm"
      zIndex={zIndex}
      headerExtra={
        !isDetail ? (
          <Terminal size={16} style={{ color: "var(--studio-text-muted)" }} />
        ) : undefined
      }
      headerTrailing={
        isDetail ? (
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            aria-label="Edit"
          >
            <Pencil />
          </IconButton>
        ) : undefined
      }
      footer={
        !isDetail ? (
          <Flex gap={spacing.sm} justify="flex-end" css={{ width: "100%" }}>
            <Button
              variant="ghost"
              size="md"
              onClick={isNew ? onClose : () => setEditing(false)}
            >
              {isNew ? "Cancel" : "Back"}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={!isValid}
            >
              {isNew ? "Add Service" : "Save"}
            </Button>
          </Flex>
        ) : undefined
      }
    >
      {isDetail ? (
        <ConfigDetail config={config} />
      ) : (
        <RunnerConfigForm
          config={config}
          onSave={onSave}
          onReady={(h) => {
            handleRef.current = h;
            setIsValid(h.isValid);
          }}
        />
      )}
    </Drawer>
  );
}
