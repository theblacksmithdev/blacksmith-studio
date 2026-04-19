import { Flex, HStack, VStack } from "@chakra-ui/react";
import {
  CheckCircle2,
  XCircle,
  Hammer,
  RotateCcw,
} from "lucide-react";
import { Button, Text } from "@/components/shared/ui";
import { InstallLog } from "@/components/shared/wizard";
import { usePythonEnvSetup } from "../hooks";
import { Spinner, statusRowCss } from "./styles";

interface PythonEnvStepProps {
  pythonPath: string | null;
  onReady: () => void;
}

/**
 * Studio venv step. All IPC + state live in `usePythonEnvSetup` — this
 * file only decides which of the two shells (ready vs setup) to render.
 */
export function PythonEnvStep({ pythonPath, onReady }: PythonEnvStepProps) {
  const { existingEnv, envReady, working, log, error, run } =
    usePythonEnvSetup({ pythonPath, onReady });

  if (envReady && !error) {
    return (
      <VStack align="stretch" gap="16px">
        <Flex css={statusRowCss("ok")}>
          <CheckCircle2 size={18} style={{ color: "var(--studio-accent)" }} />
          <VStack align="flex-start" gap="2px" flex="1" minW="0">
            <Text variant="body" css={{ fontWeight: 500 }}>
              Studio environment is ready
            </Text>
            <Text variant="caption" color="muted">
              {existingEnv?.root ?? "~/.blacksmith-studio/venv"} — managed by uv
            </Text>
          </VStack>
        </Flex>
        <HStack gap="8px">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => run(true)}
            disabled={working}
          >
            <RotateCcw size={13} />
            Rebuild environment
          </Button>
        </HStack>
        {log.length > 0 && <InstallLog lines={log} />}
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap="16px">
      <Flex css={statusRowCss(error ? "err" : working ? "working" : "idle")}>
        {working ? (
          <Spinner size={18} style={{ color: "var(--studio-text-muted)" }} />
        ) : error ? (
          <XCircle size={18} style={{ color: "var(--studio-error)" }} />
        ) : (
          <Hammer size={18} style={{ color: "var(--studio-text-muted)" }} />
        )}
        <VStack align="flex-start" gap="2px" flex="1" minW="0">
          <Text variant="body" css={{ fontWeight: 500 }}>
            {working
              ? "Building environment…"
              : error
                ? "Something went wrong"
                : "Build a dedicated Python environment"}
          </Text>
          <Text variant="caption" color="muted">
            {pythonPath
              ? `Will use ${pythonPath}`
              : "Pick a Python interpreter in the previous step first."}
          </Text>
        </VStack>
      </Flex>

      <HStack gap="8px">
        <Button
          variant="primary"
          size="md"
          onClick={() => run(false)}
          disabled={working || !pythonPath}
        >
          {working ? <Spinner size={13} /> : <Hammer size={13} />}
          {working ? "Building…" : "Create environment"}
        </Button>
      </HStack>

      {log.length > 0 && <InstallLog lines={log} />}
    </VStack>
  );
}
