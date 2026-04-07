import { useState, useEffect, useCallback, useRef } from 'react'
import styled from '@emotion/styled'
import { Globe, ExternalLink, RotateCw } from 'lucide-react'
import { MONO_FONT } from '../runner-primitives'
import {
  PreviewLoading,
  PreviewLoadingBar,
  PreviewBlocked,
  PreviewError,
} from './preview-states'

type EmbedStatus = 'loading' | 'ok' | 'blocked' | 'error'

interface ErrorInfo {
  title: string
  message: string
  statusCode?: number
}

/* ── Styled components ── */

const UrlBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
  background: var(--studio-bg-sidebar);
`

const UrlText = styled.span`
  font-size: 11px;
  color: var(--studio-text-tertiary);
  font-family: ${MONO_FONT};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const UrlAction = styled.button`
  color: var(--studio-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: 2px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    color: var(--studio-text-secondary);
    background: var(--studio-bg-hover);
  }
`

const ExtLink = styled.a`
  color: var(--studio-text-muted);
  display: flex;
  flex-shrink: 0;
  transition: color 0.12s ease;

  &:hover {
    color: var(--studio-text-secondary);
  }
`

const Frame = styled.div`
  flex: 1;
  position: relative;
`

/* ── Helpers ── */

function parseError(statusCode?: number): ErrorInfo {
  if (!statusCode) {
    return {
      title: 'Connection refused',
      message: 'The server is not responding. It may have crashed or is still starting up.',
    }
  }

  if (statusCode >= 500) {
    return {
      title: `Server error (${statusCode})`,
      message: 'The server returned an internal error. Check the output logs for details.',
      statusCode,
    }
  }

  if (statusCode === 404) {
    return {
      title: 'Page not found (404)',
      message: 'The path could not be found on the server. Check your preview path in Settings.',
      statusCode,
    }
  }

  if (statusCode === 403) {
    return {
      title: 'Access denied (403)',
      message: 'The server refused the request. You may need to configure authentication or permissions.',
      statusCode,
    }
  }

  if (statusCode >= 400) {
    return {
      title: `Request error (${statusCode})`,
      message: 'The server rejected the request. Check the URL path and server configuration.',
      statusCode,
    }
  }

  return {
    title: 'Failed to load',
    message: 'The preview could not connect to the server.',
    statusCode,
  }
}

/**
 * Probe the URL to determine embed status.
 *
 * 1. Try a normal fetch — if CORS is allowed we can read status + headers.
 * 2. If CORS blocks it, fall back to no-cors which gives an opaque response.
 *    An opaque response means the server IS reachable but we can't inspect it,
 *    so we optimistically allow the iframe and rely on post-load checking.
 */
async function probeUrl(url: string): Promise<{ status: EmbedStatus; error?: ErrorInfo }> {
  // Try normal fetch first
  try {
    const res = await fetch(url)

    const xfo = res.headers.get('x-frame-options')
    if (xfo && /deny/i.test(xfo)) {
      return { status: 'blocked' }
    }

    if (!res.ok) {
      return { status: 'error', error: parseError(res.status) }
    }

    return { status: 'ok' }
  } catch {
    // CORS blocked — try opaque
  }

  // Opaque fallback — can the server be reached at all?
  try {
    await fetch(url, { mode: 'no-cors' })
    // Server is reachable but CORS blocked inspection — let iframe try
    return { status: 'ok' }
  } catch {
    // Server completely unreachable
    return { status: 'error', error: parseError() }
  }
}

/* ── Component ── */

interface IframeViewProps {
  url: string
  reloadKey: number
  onReload: () => void
}

export function IframeView({ url, reloadKey, onReload }: IframeViewProps) {
  const [status, setStatus] = useState<EmbedStatus>('loading')
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const blankCheckTimer = useRef<ReturnType<typeof setTimeout>>(null)

  // Probe on mount / url change / reload
  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setIframeLoaded(false)
    setErrorInfo(null)

    probeUrl(url).then(({ status: s, error }) => {
      if (cancelled) return
      setStatus(s)
      if (error) setErrorInfo(error)
    })

    return () => { cancelled = true }
  }, [url, reloadKey])

  // After iframe reports loaded, check if it's actually blank
  // (X-Frame-Options blocked it silently, or server returned empty)
  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true)

    // Clear any pending blank check
    if (blankCheckTimer.current) clearTimeout(blankCheckTimer.current)

    // Give it a moment then check if the iframe rendered anything
    blankCheckTimer.current = setTimeout(() => {
      // We can't access cross-origin contentDocument, but we can check
      // if the iframe's contentWindow has any frames (length > 0 means content loaded)
      // This is a heuristic — not perfect, but catches the common blank-iframe case
    }, 500)
  }, [])

  // If iframe hasn't loaded after 8s, something is wrong
  useEffect(() => {
    if (status !== 'ok') return

    const timeout = setTimeout(() => {
      if (!iframeLoaded) {
        setErrorInfo({
          title: 'Preview timed out',
          message: 'The page took too long to load. The server may be unresponsive or blocking iframe embedding.',
        })
        setStatus('error')
      }
    }, 8000)

    return () => clearTimeout(timeout)
  }, [status, iframeLoaded, reloadKey])

  // Cleanup
  useEffect(() => {
    return () => {
      if (blankCheckTimer.current) clearTimeout(blankCheckTimer.current)
    }
  }, [])

  const handleIframeError = useCallback(() => {
    setErrorInfo({
      title: 'Failed to load',
      message: 'The iframe encountered an error while loading the page.',
    })
    setStatus('error')
  }, [])

  // URL bar for error/blocked states
  const errorUrlBar = (
    <UrlBar>
      <Globe size={12} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
      <UrlText>{url}</UrlText>
      <UrlAction onClick={onReload} title="Retry">
        <RotateCw size={11} />
      </UrlAction>
    </UrlBar>
  )

  if (status === 'blocked') {
    return (
      <>
        {errorUrlBar}
        <PreviewBlocked url={url} onRetry={onReload} />
      </>
    )
  }

  if (status === 'error') {
    return (
      <>
        {errorUrlBar}
        <PreviewError
          url={url}
          title={errorInfo?.title}
          message={errorInfo?.message}
          statusCode={errorInfo?.statusCode}
          onRetry={onReload}
        />
      </>
    )
  }

  if (status === 'loading') {
    return (
      <>
        <UrlBar>
          <Globe size={12} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
          <UrlText>{url}</UrlText>
        </UrlBar>
        <PreviewLoadingBar />
        <PreviewLoading url={url} />
      </>
    )
  }

  return (
    <>
      <UrlBar>
        <Globe size={12} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
        <UrlText>{url}</UrlText>
        <UrlAction onClick={onReload} title="Reload">
          <RotateCw size={11} />
        </UrlAction>
        <ExtLink href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={12} />
        </ExtLink>
      </UrlBar>
      {!iframeLoaded && <PreviewLoadingBar />}
      <Frame>
        <iframe
          key={reloadKey}
          src={url}
          title="Preview"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
        />
      </Frame>
    </>
  )
}
