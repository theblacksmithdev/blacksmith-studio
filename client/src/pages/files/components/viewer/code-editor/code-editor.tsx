import { useRef, useCallback, useEffect } from "react";
import { Box, Flex } from "@chakra-ui/react";
import Editor, { type OnMount, type Monaco } from "@monaco-editor/react";
import { useThemeMode } from "@/hooks/use-theme-mode";
import { Text } from "@/components/shared/ui";
import { getMonacoLanguage } from "./language-map";
import { darkTheme, lightTheme } from "./themes";

interface CodeEditorProps {
  content: string;
  language: string;
  onChange?: (value: string) => void;
  onSave?: () => void;
}

const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily:
    "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, Consolas, monospace",
  fontLigatures: true,
  lineHeight: 20,
  padding: { top: 12, bottom: 12 },
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: "smooth" as const,
  cursorSmoothCaretAnimation: "on" as const,
  renderLineHighlight: "all" as const,
  bracketPairColorization: { enabled: true },
  guides: { bracketPairs: true, indentation: true },
  folding: true,
  glyphMargin: false,
  lineNumbersMinChars: 4,
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  minimap: { enabled: false },
  scrollbar: {
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
    useShadows: false,
  },
  renderWhitespace: "none" as const,
  wordWrap: "off" as const,
  links: true,
  contextmenu: true,
  tabSize: 2,
  insertSpaces: true,
  autoIndent: "full" as const,
  formatOnPaste: true,
  formatOnType: true,
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: "on" as const,
  quickSuggestions: true,
  wordBasedSuggestions: "currentDocument" as const,
};

/** Register GitHub-based themes with our app background overrides */
function defineCustomThemes(monaco: Monaco) {
  monaco.editor.defineTheme("blacksmith-dark", darkTheme);
  monaco.editor.defineTheme("blacksmith-light", lightTheme);
}

/** Configure Monaco's built-in TypeScript/JavaScript language service */
function configureTypeScriptDefaults(monaco: Monaco) {
  const ts = monaco.languages.typescript;

  const compilerOptions: Parameters<
    typeof ts.typescriptDefaults.setCompilerOptions
  >[0] = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    // Use NodeJs resolution — Monaco's TS service doesn't support "bundler"
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    jsx: ts.JsxEmit.ReactJSX,
    jsxImportSource: "react",
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    allowJs: true,
    checkJs: false,
    strict: false,
    noImplicitAny: false,
    strictNullChecks: false,
    resolveJsonModule: true,
    skipLibCheck: true,
    noEmit: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
  };

  // Suppress errors we can't resolve (missing node_modules types, path aliases, etc.)
  const diagnosticCodesToIgnore = [
    2307, // Cannot find module '...' or its corresponding type declarations
    7016, // Could not find a declaration file for module '...'
    2304, // Cannot find name '...' (e.g. from missing lib types)
    2305, // Module '...' has no exported member '...'
    2322, // suppress some strict type mismatch noise when checkJs is on
    1259, // Module can only be default-imported using 'esModuleInterop' flag
    1192, // Module '...' has no default export
    2792, // Cannot find module ... Did you mean to set moduleResolution to 'bundler'
  ];

  ts.typescriptDefaults.setCompilerOptions(compilerOptions);
  ts.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    diagnosticCodesToIgnore,
  });

  ts.javascriptDefaults.setCompilerOptions(compilerOptions);
  ts.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    diagnosticCodesToIgnore,
  });

  // Eager model sync gives better completion performance
  ts.typescriptDefaults.setEagerModelSync(true);
  ts.javascriptDefaults.setEagerModelSync(true);
}

export function CodeEditor({
  content,
  language,
  onChange,
  onSave,
}: CodeEditorProps) {
  const { mode } = useThemeMode();
  const monacoLang = getMonacoLanguage(language);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const themeName = mode === "dark" ? "blacksmith-dark" : "blacksmith-light";

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      defineCustomThemes(monaco);
      monaco.editor.setTheme(themeName);

      // Cmd+S / Ctrl+S → save
      editor.addAction({
        id: "blacksmith.save",
        label: "Save File",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
        run: () => onSaveRef.current?.(),
      });

      // Focus the editor
      editor.focus();
    },
    [themeName],
  );

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) onChange?.(value);
    },
    [onChange],
  );

  // React to theme mode changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(themeName);
    }
  }, [themeName]);

  return (
    <Box css={{ flex: 1, position: "relative", minHeight: 0 }}>
      <Box css={{ position: "absolute", inset: 0 }}>
        <Editor
          height="100%"
          width="100%"
          language={monacoLang}
          value={content}
          theme={themeName}
          options={EDITOR_OPTIONS}
          onMount={handleMount}
          onChange={handleChange}
          beforeMount={(monaco) => {
            defineCustomThemes(monaco);
            configureTypeScriptDefaults(monaco);
          }}
          keepCurrentModel={false}
          loading={
            <Flex align="center" justify="center" css={{ height: "100%" }}>
              <Text variant="body" color="muted">
                Loading editor...
              </Text>
            </Flex>
          }
        />
      </Box>
    </Box>
  );
}
