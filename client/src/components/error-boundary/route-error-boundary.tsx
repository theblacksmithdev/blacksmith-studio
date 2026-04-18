import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import styled from "@emotion/styled";
import { Text } from "@/components/shared/ui";
import { ErrorLayout } from "./error-layout";
import { ErrorGlyph } from "./error-glyph";
import { ErrorActions } from "./error-actions";
import { ErrorPath } from "./error-path";

const Title = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--studio-text-primary);
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--studio-text-muted);
  max-width: 440px;
`;

const Details = styled.details`
  margin-top: 8px;
  max-width: 100%;
  width: 100%;

  summary {
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    color: var(--studio-text-muted);
    padding: 6px 10px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }

    &:hover {
      color: var(--studio-text-secondary);
      background: var(--studio-bg-hover);
    }
  }

  pre {
    margin-top: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    background: var(--studio-code-bg);
    border: 1px solid var(--studio-border);
    font-family: "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, monospace";
    font-size: 12px;
    line-height: 1.55;
    color: var(--studio-text-secondary);
    text-align: left;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 260px;
    overflow: auto;
  }
`;

interface ResolvedError {
  code: string;
  label: string;
  title: string;
  description: string;
  primary: "home" | "reload";
  stack?: string;
}

function resolveError(err: unknown): ResolvedError {
  if (isRouteErrorResponse(err)) {
    if (err.status === 404) {
      return {
        code: "404",
        label: "Not found",
        title: "We can't find that page",
        description:
          "The route you tried to open doesn't exist. It may have been moved or the link is out of date.",
        primary: "home",
      };
    }
    if (err.status === 401 || err.status === 403) {
      return {
        code: String(err.status),
        label: err.status === 401 ? "Unauthorized" : "Forbidden",
        title: "You don't have access to that page",
        description:
          err.statusText || "You don't have permission to view this page.",
        primary: "home",
      };
    }
    return {
      code: String(err.status),
      label: "Route error",
      title: err.statusText || "Something went wrong",
      description:
        typeof err.data === "string"
          ? err.data
          : "The page returned an error. Try reloading or heading home.",
      primary: "reload",
    };
  }

  const message =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "An unexpected error occurred.";
  const stack = err instanceof Error ? err.stack : undefined;
  return {
    code: "500",
    label: "Error",
    title: "Something broke",
    description: message,
    primary: "reload",
    stack,
  };
}

export function RouteErrorBoundary() {
  const error = useRouteError();
  const resolved = resolveError(error);
  const isDev = import.meta.env.DEV;

  return (
    <ErrorLayout>
      <ErrorGlyph code={resolved.code} label={resolved.label} />
      <Title>{resolved.title}</Title>
      <Description>{resolved.description}</Description>
      <ErrorPath />
      <ErrorActions primary={resolved.primary} />
      {isDev && resolved.stack && (
        <Details>
          <summary>Stack trace</summary>
          <pre>{resolved.stack}</pre>
        </Details>
      )}
      {!isDev && resolved.code === "500" && (
        <Text variant="tiny" color="muted">
          If this keeps happening, try restarting the app.
        </Text>
      )}
    </ErrorLayout>
  );
}

export function NotFoundRoute() {
  return (
    <ErrorLayout>
      <ErrorGlyph code="404" label="Not found" />
      <Title>We can't find that page</Title>
      <Description>
        The route you tried to open doesn't exist. It may have been moved or the
        link is out of date.
      </Description>
      <ErrorPath />
      <ErrorActions primary="home" />
    </ErrorLayout>
  );
}
