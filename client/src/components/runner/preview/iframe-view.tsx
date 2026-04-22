import { useState, useEffect, useCallback, useRef } from "react";
import styled from "@emotion/styled";
import {
  PreviewLoading,
  PreviewLoadingBar,
  PreviewBlocked,
  PreviewError,
} from "./preview-states";

type EmbedStatus = "loading" | "ok" | "blocked" | "error";

interface ErrorInfo {
  title: string;
  message: string;
  statusCode?: number;
}

const Frame = styled.div`
  flex: 1;
  position: relative;
`;

/* ── Helpers ── */

function parseError(statusCode?: number): ErrorInfo {
  if (!statusCode) {
    return {
      title: "Connection refused",
      message:
        "The server is not responding. It may have crashed or is still starting up.",
    };
  }

  if (statusCode >= 500) {
    return {
      title: `Server error (${statusCode})`,
      message:
        "The server returned an internal error. Check the output logs for details.",
      statusCode,
    };
  }

  if (statusCode === 404) {
    return {
      title: "Page not found (404)",
      message:
        "The path could not be found on the server. Check your preview path in Settings.",
      statusCode,
    };
  }

  if (statusCode === 403) {
    return {
      title: "Access denied (403)",
      message:
        "The server refused the request. You may need to configure authentication or permissions.",
      statusCode,
    };
  }

  if (statusCode >= 400) {
    return {
      title: `Request error (${statusCode})`,
      message:
        "The server rejected the request. Check the URL path and server configuration.",
      statusCode,
    };
  }

  return {
    title: "Failed to load",
    message: "The preview could not connect to the server.",
    statusCode,
  };
}

/**
 * Probe the URL to determine embed status.
 *
 * 1. Try a normal fetch — if CORS is allowed we can read status + headers.
 * 2. If CORS blocks it, fall back to no-cors which gives an opaque response.
 *    An opaque response means the server IS reachable but we can't inspect it,
 *    so we optimistically allow the iframe and rely on post-load checking.
 */
async function probeUrl(
  url: string,
): Promise<{ status: EmbedStatus; error?: ErrorInfo }> {
  try {
    const res = await fetch(url);

    const xfo = res.headers.get("x-frame-options");
    if (xfo && /deny/i.test(xfo)) {
      return { status: "blocked" };
    }

    if (!res.ok) {
      return { status: "error", error: parseError(res.status) };
    }

    return { status: "ok" };
  } catch {
    // CORS blocked — try opaque
  }

  try {
    await fetch(url, { mode: "no-cors" });
    return { status: "ok" };
  } catch {
    return { status: "error", error: parseError() };
  }
}

/* ── Component ── */

interface IframeViewProps {
  url: string;
  reloadKey: number;
  onReload: () => void;
}

export function IframeView({ url, reloadKey, onReload }: IframeViewProps) {
  const [status, setStatus] = useState<EmbedStatus>("loading");
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const blankCheckTimer = useRef<ReturnType<typeof setTimeout>>(null);

  // Probe on mount / url change / reload
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setIframeLoaded(false);
    setErrorInfo(null);

    probeUrl(url).then(({ status: s, error }) => {
      if (cancelled) return;
      setStatus(s);
      if (error) setErrorInfo(error);
    });

    return () => {
      cancelled = true;
    };
  }, [url, reloadKey]);

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
    if (blankCheckTimer.current) clearTimeout(blankCheckTimer.current);
    blankCheckTimer.current = setTimeout(() => {
      // Heuristic placeholder — cross-origin contentDocument is opaque,
      // kept intentionally empty so the timer fires without side effects.
    }, 500);
  }, []);

  useEffect(() => {
    if (status !== "ok") return;

    const timeout = setTimeout(() => {
      if (!iframeLoaded) {
        setErrorInfo({
          title: "Preview timed out",
          message:
            "The page took too long to load. The server may be unresponsive or blocking iframe embedding.",
        });
        setStatus("error");
      }
    }, 8000);

    return () => clearTimeout(timeout);
  }, [status, iframeLoaded, reloadKey]);

  useEffect(() => {
    return () => {
      if (blankCheckTimer.current) clearTimeout(blankCheckTimer.current);
    };
  }, []);

  const handleIframeError = useCallback(() => {
    setErrorInfo({
      title: "Failed to load",
      message: "The iframe encountered an error while loading the page.",
    });
    setStatus("error");
  }, []);

  if (status === "blocked") {
    return <PreviewBlocked url={url} onRetry={onReload} />;
  }

  if (status === "error") {
    return (
      <PreviewError
        url={url}
        title={errorInfo?.title}
        message={errorInfo?.message}
        statusCode={errorInfo?.statusCode}
        onRetry={onReload}
      />
    );
  }

  if (status === "loading") {
    return (
      <>
        <PreviewLoadingBar />
        <PreviewLoading url={url} />
      </>
    );
  }

  return (
    <>
      {!iframeLoaded && <PreviewLoadingBar />}
      <Frame>
        <iframe
          key={reloadKey}
          src={url}
          title="Preview"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            background: "#fff",
          }}
        />
      </Frame>
    </>
  );
}
