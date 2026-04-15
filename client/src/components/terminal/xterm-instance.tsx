import { useEffect, useRef, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { SearchAddon } from "@xterm/addon-search";
import "@xterm/xterm/css/xterm.css";
import { api } from "@/api";

/**
 * Blacksmith Studio terminal theme — matches the app's dark design language.
 * Deep black background, soft white text, muted accent colors.
 */
const TERMINAL_THEME = {
  background: "#0a0a0a",
  foreground: "#e0e0e0",
  cursor: "#e0e0e0",
  cursorAccent: "#0a0a0a",
  selectionBackground: "rgba(255, 255, 255, 0.10)",
  selectionForeground: "#ffffff",
  selectionInactiveBackground: "rgba(255, 255, 255, 0.05)",
  black: "#1a1a1a",
  red: "#ef5350",
  green: "#2dd4a8",
  yellow: "#ffd54f",
  blue: "#64b5f6",
  magenta: "#ce93d8",
  cyan: "#4dd0e1",
  white: "#e0e0e0",
  brightBlack: "#545454",
  brightRed: "#ef5350",
  brightGreen: "#2dd4a8",
  brightYellow: "#ffd54f",
  brightBlue: "#64b5f6",
  brightMagenta: "#ce93d8",
  brightCyan: "#4dd0e1",
  brightWhite: "#ffffff",
};

interface Props {
  terminalId: string;
  searchAddonRef?: React.MutableRefObject<SearchAddon | null>;
}

export function XtermInstance({ terminalId, searchAddonRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);

  const sendResize = useCallback(
    (term: Terminal, fit: FitAddon) => {
      try {
        fit.fit();
        api.terminal.resize(terminalId, term.cols, term.rows);
      } catch {
        /* ignore */
      }
    },
    [terminalId],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const term = new Terminal({
      fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
      fontSize: 13,
      fontWeight: "400",
      fontWeightBold: "600",
      lineHeight: 1.5,
      letterSpacing: 0.5,
      cursorBlink: true,
      cursorStyle: "bar",
      cursorWidth: 2,
      cursorInactiveStyle: "outline",
      scrollback: 10000,
      smoothScrollDuration: 100,
      disableStdin: false,
      allowProposedApi: true,
      macOptionIsMeta: true,
      macOptionClickForcesSelection: true,
      drawBoldTextInBrightColors: false,
      minimumContrastRatio: 1,
      theme: TERMINAL_THEME,
    });

    // Core addons
    const fit = new FitAddon();
    term.loadAddon(fit);

    const search = new SearchAddon();
    term.loadAddon(search);
    if (searchAddonRef) searchAddonRef.current = search;

    term.loadAddon(new WebLinksAddon());

    term.open(el);

    // WebGL — progressive enhancement
    try {
      const webgl = new WebglAddon();
      webgl.onContextLoss(() => webgl.dispose());
      term.loadAddon(webgl);
    } catch {
      /* falls back to canvas renderer */
    }

    // Initial fit + resize
    setTimeout(() => sendResize(term, fit), 50);

    // All input → PTY
    const dataDisposable = term.onData((data) => {
      api.terminal.write(terminalId, data);
    });

    // All output → xterm
    const unsubOutput = api.terminal.onOutput((event) => {
      if (event.id === terminalId) {
        term.write(event.data);
      }
    });

    // Refit + notify backend on resize
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => sendResize(term, fit));
    });
    observer.observe(el);

    termRef.current = term;
    requestAnimationFrame(() => term.focus());

    return () => {
      observer.disconnect();
      dataDisposable.dispose();
      unsubOutput();
      if (searchAddonRef) searchAddonRef.current = null;
      term.dispose();
      termRef.current = null;
    };
  }, [terminalId]);

  return (
    <div
      ref={containerRef}
      onClick={() => termRef.current?.focus()}
      style={{ position: "absolute", inset: 0, padding: "8px 0 4px 12px" }}
    />
  );
}
