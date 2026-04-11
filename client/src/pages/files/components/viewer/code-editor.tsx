import { useRef, useCallback, useEffect } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import Editor, { type OnMount, type Monaco } from '@monaco-editor/react'
import { useThemeMode } from '@/hooks/use-theme-mode'
import { Text } from '@/components/shared/ui'
import { getMonacoLanguage } from './language-map'

interface CodeEditorProps {
  content: string
  language: string
}

const EDITOR_OPTIONS = {
  readOnly: true,
  fontSize: 13,
  fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, Consolas, monospace",
  fontLigatures: true,
  lineHeight: 20,
  padding: { top: 12, bottom: 12 },
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: 'smooth' as const,
  cursorSmoothCaretAnimation: 'on' as const,
  renderLineHighlight: 'all' as const,
  bracketPairColorization: { enabled: true },
  guides: { bracketPairs: true, indentation: true },
  folding: true,
  glyphMargin: false,
  lineNumbersMinChars: 4,
  overviewRulerBorder: false,
  minimap: { enabled: false },
  scrollbar: {
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
    useShadows: false,
  },
  renderWhitespace: 'none' as const,
  wordWrap: 'off' as const,
  links: true,
  contextmenu: false,
}

/** Custom theme colors that match our app's design tokens */
function defineCustomThemes(monaco: Monaco) {
  monaco.editor.defineTheme('blacksmith-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#1a1a1a',
      'editor.lineHighlightBackground': '#f5f5f5',
      'editor.selectionBackground': '#d0e8ff',
      'editorLineNumber.foreground': '#c0c0c0',
      'editorLineNumber.activeForeground': '#424242',
      'editorIndentGuide.background': '#e8e8e8',
      'editorIndentGuide.activeBackground': '#d0d0d0',
      'editorBracketMatch.background': '#e0e8f0',
      'editorBracketMatch.border': '#b0c4de',
      'scrollbarSlider.background': 'rgba(0,0,0,0.08)',
      'scrollbarSlider.hoverBackground': 'rgba(0,0,0,0.15)',
    },
  })

  monaco.editor.defineTheme('blacksmith-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#121212',
      'editor.foreground': '#f5f5f5',
      'editor.lineHighlightBackground': '#1e1e1e',
      'editor.selectionBackground': '#264f78',
      'editorLineNumber.foreground': '#555555',
      'editorLineNumber.activeForeground': '#bdbdbd',
      'editorIndentGuide.background': '#2a2a2a',
      'editorIndentGuide.activeBackground': '#3a3a3a',
      'editorBracketMatch.background': '#1e3a5f',
      'editorBracketMatch.border': '#3a6ea5',
      'scrollbarSlider.background': 'rgba(255,255,255,0.08)',
      'scrollbarSlider.hoverBackground': 'rgba(255,255,255,0.15)',
    },
  })
}

export function CodeEditor({ content, language }: CodeEditorProps) {
  const { mode } = useThemeMode()
  const monacoLang = getMonacoLanguage(language)
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<Monaco | null>(null)

  const themeName = mode === 'dark' ? 'blacksmith-dark' : 'blacksmith-light'

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    defineCustomThemes(monaco)
    monaco.editor.setTheme(themeName)
  }, [themeName])

  // React to theme mode changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(themeName)
    }
  }, [themeName])

  return (
    <Box css={{ flex: 1, position: 'relative', minHeight: 0 }}>
      <Box css={{ position: 'absolute', inset: 0 }}>
        <Editor
          height="100%"
          width="100%"
          language={monacoLang}
          value={content}
          theme={themeName}
          options={EDITOR_OPTIONS}
          onMount={handleMount}
          beforeMount={defineCustomThemes}
          keepCurrentModel={false}
          loading={
            <Flex align="center" justify="center" css={{ height: '100%' }}>
              <Text variant="body" color="muted">Loading editor...</Text>
            </Flex>
          }
        />
      </Box>
    </Box>
  )
}
