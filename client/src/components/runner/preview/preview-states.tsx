import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import {
  Play,
  ExternalLink,
  AlertTriangle,
  RotateCw,
  ShieldAlert,
  MonitorOff,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import {
  useRunnerStore,
  selectIsAnyActive,
  RunnerStatus,
} from "@/stores/runner-store";
import { useRunner } from "@/hooks/use-runner";
import { MONO_FONT } from "@/components/runner/runner-primitives";

/* ── Shared layout ── */

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--studio-bg-main);
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 320px;
  text-align: center;
  padding: 48px 32px;
`;

const IconWrap = styled.div<{ variant?: "default" | "error" | "warning" }>`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ variant }) =>
    variant === "error"
      ? "var(--studio-error-subtle)"
      : variant === "warning"
        ? "rgba(245,158,11,0.06)"
        : "var(--studio-bg-surface)"};
  color: ${({ variant }) =>
    variant === "error"
      ? "var(--studio-error)"
      : variant === "warning"
        ? "rgb(245,158,11)"
        : "var(--studio-text-muted)"};
  border: 1px solid
    ${({ variant }) =>
      variant === "error"
        ? "var(--studio-error-subtle)"
        : variant === "warning"
          ? "rgba(245,158,11,0.1)"
          : "var(--studio-border)"};
`;

const Title = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--studio-text-primary);
  letter-spacing: -0.02em;
`;

const Desc = styled.div`
  font-size: 13px;
  line-height: 1.6;
  color: var(--studio-text-tertiary);
  max-width: 280px;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: 4px;
`;

const PrimaryBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  &:hover {
    opacity: 0.9;
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const GhostBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: transparent;
  color: var(--studio-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  text-decoration: none;
  &:hover {
    background: var(--studio-bg-surface);
    color: var(--studio-text-primary);
  }
`;

const LinkBtn = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: transparent;
  color: var(--studio-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  text-decoration: none;
  &:hover {
    background: var(--studio-bg-surface);
    color: var(--studio-text-primary);
  }
`;

const CodeHint = styled.div`
  font-size: 11px;
  line-height: 1.6;
  color: var(--studio-text-muted);
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  border-radius: 8px;
  padding: 10px 14px;
  font-family: ${MONO_FONT};
  text-align: left;
  width: 100%;
`;

const StatusCode = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  font-family: ${MONO_FONT};
  background: var(--studio-error-subtle);
  color: var(--studio-error);
`;

/* ── Loading ── */

const slide = keyframes`
  0%   { transform: translateX(-100%); }
  50%  { transform: translateX(0%); }
  100% { transform: translateX(100%); }
`;

const LoadingBarWrap = styled.div`
  position: relative;
  width: 100%;
  height: 2px;
  background: var(--studio-border);
  overflow: hidden;
  flex-shrink: 0;
`;

const LoadingBarFill = styled.div`
  position: absolute;
  inset: 0;
  width: 30%;
  background: var(--studio-accent);
  border-radius: 1px;
  animation: ${slide} 1.4s ease-in-out infinite;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

/* ── Exported components ── */

export function PreviewLoadingBar() {
  return (
    <LoadingBarWrap>
      <LoadingBarFill />
    </LoadingBarWrap>
  );
}

export function PreviewLoading({ url }: { url: string }) {
  return (
    <Center>
      <Card>
        <Loader2
          size={28}
          style={{
            color: "var(--studio-text-muted)",
            animation: `${spin} 1s linear infinite`,
          }}
        />
        <div>
          <Title>Loading preview</Title>
          <Desc
            style={{ marginTop: 8, fontFamily: MONO_FONT, fontSize: "12px" }}
          >
            {url}
          </Desc>
        </div>
      </Card>
    </Center>
  );
}

export function PreviewBlocked({
  url,
  onRetry,
}: {
  url: string;
  onRetry: () => void;
}) {
  return (
    <Center>
      <Card>
        <IconWrap variant="warning">
          <ShieldAlert size={24} />
        </IconWrap>
        <div>
          <Title>Embedding blocked</Title>
          <Desc style={{ marginTop: 8 }}>
            The server's security headers prevent this page from loading in a
            preview frame.
          </Desc>
        </div>
        <CodeHint>
          Set <strong>X-Frame-Options: ALLOWALL</strong>
          <br />
          when <strong>STUDIO_EMBED=1</strong>
        </CodeHint>
        <Actions>
          <LinkBtn href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={13} />
            Open in Browser
          </LinkBtn>
          <GhostBtn onClick={onRetry}>
            <RotateCw size={12} />
            Retry
          </GhostBtn>
        </Actions>
      </Card>
    </Center>
  );
}

interface PreviewErrorProps {
  url: string;
  title?: string;
  message?: string;
  statusCode?: number;
  onRetry: () => void;
}

export function PreviewError({
  url,
  title,
  message,
  statusCode,
  onRetry,
}: PreviewErrorProps) {
  return (
    <Center>
      <Card>
        <IconWrap variant="error">
          <AlertTriangle size={24} />
        </IconWrap>
        <div>
          <Title>{title || "Failed to load"}</Title>
          {statusCode && (
            <StatusCode style={{ marginTop: 8 }}>{statusCode}</StatusCode>
          )}
          <Desc style={{ marginTop: 8 }}>
            {message ||
              "The preview could not connect to the server. It may still be starting up."}
          </Desc>
        </div>
        <Actions>
          <PrimaryBtn onClick={onRetry}>
            <RotateCw size={12} />
            Retry
          </PrimaryBtn>
          <LinkBtn href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={12} />
            Open in Browser
          </LinkBtn>
        </Actions>
      </Card>
    </Center>
  );
}

export function PreviewStopped({
  serviceId,
  serviceName,
  status,
  icon: Icon,
}: {
  serviceId: string;
  serviceName: string;
  status: RunnerStatus;
  icon: LucideIcon;
}) {
  const { start } = useRunner();
  const anyActive = useRunnerStore(selectIsAnyActive);

  if (status === RunnerStatus.Starting) {
    return (
      <Center>
        <Card>
          <Loader2
            size={28}
            style={{
              color: "var(--studio-accent)",
              animation: `${spin} 1s linear infinite`,
            }}
          />
          <div>
            <Title>Starting {serviceName}</Title>
            <Desc style={{ marginTop: 8 }}>
              Waiting for the server to be ready...
            </Desc>
          </div>
        </Card>
      </Center>
    );
  }

  return (
    <Center>
      <Card>
        <IconWrap>
          <Icon size={24} />
        </IconWrap>
        <div>
          <Title>{serviceName} is offline</Title>
          <Desc style={{ marginTop: 8 }}>
            Start the service to preview it here.
          </Desc>
        </div>
        <Actions>
          <PrimaryBtn onClick={() => start(serviceId)}>
            <Play size={13} />
            Start {serviceName}
          </PrimaryBtn>
          {!anyActive && (
            <GhostBtn onClick={() => start()}>Start All Services</GhostBtn>
          )}
        </Actions>
      </Card>
    </Center>
  );
}

export function PreviewEmpty() {
  return (
    <Center>
      <Card>
        <IconWrap>
          <MonitorOff size={24} />
        </IconWrap>
        <div>
          <Title>No preview available</Title>
          <Desc style={{ marginTop: 8 }}>
            Configure a preview URL in your service settings to see a live
            preview here.
          </Desc>
        </div>
      </Card>
    </Center>
  );
}
