import { useEffect, useRef } from "react";
import { Flex, Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import {
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Text } from "@/components/shared/ui";
import { PrimaryBtn, ResultBar } from "./styles";

const Wrap = styled.div`
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 20px 20px 14px;
  border-bottom: 1px solid var(--studio-border);
`;

const LogArea = styled.div`
  padding: 12px 16px;
  max-height: 200px;
  overflow-y: auto;
  background: var(--studio-bg-main);
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  font-size: 11px;
  line-height: 1.6;
  color: var(--studio-text-muted);
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--studio-scrollbar);
    border-radius: 2px;
  }
`;

const Footer = styled.div`
  padding: 14px 20px;
  border-top: 1px solid var(--studio-border);
`;

interface GraphifySetupFlowProps {
  installing: boolean;
  logs: string[];
  result: { success: boolean; error?: string } | null;
  onRetry: () => void;
}

export function GraphifySetupFlow({
  installing,
  logs,
  result,
  onRetry,
}: GraphifySetupFlowProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <Wrap>
      <Header>
        <Flex align="center" gap="8px">
          {installing && (
            <Loader2
              size={14}
              style={{ animation: "spin 1s linear infinite", color: "var(--studio-green)" }}
            />
          )}
          {result?.success && (
            <CheckCircle2 size={14} style={{ color: "var(--studio-green)" }} />
          )}
          {result && !result.success && (
            <XCircle size={14} style={{ color: "var(--studio-error)" }} />
          )}
          <Text
            css={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--studio-text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            {installing
              ? "Installing Graphify..."
              : result?.success
                ? "Graphify installed"
                : result
                  ? "Installation failed"
                  : "Setting up Graphify"}
          </Text>
        </Flex>
        <Text
          css={{
            fontSize: "12px",
            color: "var(--studio-text-muted)",
            marginTop: "4px",
          }}
        >
          {installing
            ? "Installing via pip and configuring for Blacksmith Studio."
            : result?.success
              ? "Graphify is ready. You can now enable the knowledge graph."
              : result
                ? "Something went wrong. Check the logs below."
                : "Preparing installation..."}
        </Text>
      </Header>

      {logs.length > 0 && (
        <LogArea>
          {logs.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
          <div ref={logEndRef} />
        </LogArea>
      )}

      {result && !result.success && (
        <Footer>
          <Flex direction="column" gap="10px">
            <ResultBar $success={false}>
              {result.error ?? "Installation failed. Make sure Python 3.10+ and pip are available."}
            </ResultBar>
            <Flex>
              <PrimaryBtn onClick={onRetry}>Try Again</PrimaryBtn>
            </Flex>
          </Flex>
        </Footer>
      )}
    </Wrap>
  );
}
