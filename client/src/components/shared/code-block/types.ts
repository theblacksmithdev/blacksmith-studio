export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showHeader?: boolean;
  showLineNumbers?: boolean;
  maxHeight?: number | string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface DiffBlockProps {
  oldText: string;
  newText: string;
  filename?: string;
  language?: string;
  maxHeight?: number | string;
}
