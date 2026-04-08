import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { api } from '@/api'

interface Props {
  terminalId: string
}

export function XtermInstance({ terminalId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const lineBuffer = useRef('')

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const term = new Terminal({
      fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'bar',
      cursorWidth: 2,
      scrollback: 5000,
      disableStdin: false,
      theme: {
        background: '#1a1a1a',
        foreground: '#cccccc',
        cursor: '#cccccc',
        cursorAccent: '#1a1a1a',
        selectionBackground: 'rgba(255, 255, 255, 0.12)',
        selectionForeground: '#ffffff',
        black: '#1a1a1a',
        red: '#f44747',
        green: '#10a37f',
        yellow: '#dcdcaa',
        blue: '#569cd6',
        magenta: '#c586c0',
        cyan: '#4ec9b0',
        white: '#cccccc',
        brightBlack: '#6a6a6a',
        brightRed: '#f44747',
        brightGreen: '#10a37f',
        brightYellow: '#dcdcaa',
        brightBlue: '#569cd6',
        brightMagenta: '#c586c0',
        brightCyan: '#4ec9b0',
        brightWhite: '#ffffff',
      },
    })

    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(el)

    setTimeout(() => {
      try { fit.fit() } catch { /* ignore */ }
    }, 50)

    // Local echo: since we have no PTY, the shell won't echo input back.
    // We handle keystrokes manually.
    const dataDisposable = term.onData((data) => {
      if (data === '\r') {
        // Enter pressed — send the buffered line to shell
        term.write('\r\n')
        api.terminal.write(terminalId, lineBuffer.current + '\n')
        lineBuffer.current = ''
      } else if (data === '\x7f') {
        // Backspace
        if (lineBuffer.current.length > 0) {
          lineBuffer.current = lineBuffer.current.slice(0, -1)
          term.write('\b \b')
        }
      } else if (data === '\x03') {
        // Ctrl+C
        lineBuffer.current = ''
        api.terminal.write(terminalId, '\x03')
        term.write('^C\r\n')
      } else if (data === '\x04') {
        // Ctrl+D
        api.terminal.write(terminalId, 'exit\n')
      } else if (data >= ' ') {
        // Printable characters — echo and buffer
        lineBuffer.current += data
        term.write(data)
      }
    })

    // Shell output → xterm
    const unsubOutput = api.terminal.onOutput((event) => {
      if (event.id === terminalId) {
        // Convert \n to \r\n for xterm
        term.write(event.data.replace(/\n/g, '\r\n'))
      }
    })

    // Refit on resize
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        try { fit.fit() } catch { /* ignore */ }
      })
    })
    observer.observe(el)

    termRef.current = term
    requestAnimationFrame(() => term.focus())

    return () => {
      observer.disconnect()
      dataDisposable.dispose()
      unsubOutput()
      term.dispose()
      termRef.current = null
    }
  }, [terminalId])

  return (
    <div
      ref={containerRef}
      onClick={() => termRef.current?.focus()}
      style={{ position: 'absolute', inset: 0, padding: '6px 0 4px 10px' }}
    />
  )
}
