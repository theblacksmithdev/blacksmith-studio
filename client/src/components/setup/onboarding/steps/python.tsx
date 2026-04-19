import { Box, Flex, HStack, VStack } from "@chakra-ui/react";
import {
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Alert, Button, Text } from "@/components/shared/ui";
import { BinaryPicker } from "@/components/shared/wizard";
import { MIN_PYTHON_LABEL } from "@/constants";
import { usePythonPicker } from "../hooks";
import { emptyHintCss, selectedPillCss } from "./styles";

interface PythonStepProps {
  value: string | null;
  version: string | null;
  onPick: (path: string, version: string) => void;
}

/**
 * Python picker step. Detection + validation + auto-pick live in
 * `usePythonPicker`; this file is pure layout.
 */
export function PythonStep({ value, version, onPick }: PythonStepProps) {
  const { candidates, loading, selectedInvalid, detected, rescan } =
    usePythonPicker({ value, version, onPick });

  const nothingFound = detected && candidates.length === 0;

  return (
    <>
      {nothingFound ? (
        <VStack align="stretch" gap="8px" css={emptyHintCss}>
          <Text variant="body">
            We couldn't find Python on your system. Install {MIN_PYTHON_LABEL}
            {" "}or higher and come back to this step.
          </Text>
          <Box>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.open("https://www.python.org/downloads/")}
            >
              <ExternalLink size={13} /> Download Python
            </Button>
          </Box>
        </VStack>
      ) : (
        <BinaryPicker
          candidates={candidates}
          value={value}
          onChange={onPick}
          browseTitle="Select Python interpreter"
          disabled={loading}
          emptyHint="No Python interpreters detected."
        />
      )}

      {selectedInvalid && (
        <Alert variant="warning" icon={<AlertTriangle size={14} />}>
          Python {version} is below the minimum of {MIN_PYTHON_LABEL}. Pick a
          newer interpreter or install one before continuing.
        </Alert>
      )}

      <HStack gap="8px" mt="4px">
        <Button variant="ghost" size="sm" onClick={rescan} disabled={loading}>
          <RefreshCw size={13} />
          Rescan
        </Button>
        {value && !selectedInvalid && (
          <Flex css={selectedPillCss}>
            <CheckCircle2 size={13} style={{ color: "var(--studio-accent)" }} />
            Selected
          </Flex>
        )}
      </HStack>
    </>
  );
}
