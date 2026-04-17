import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Box, Text, Heading, Link } from "@chakra-ui/react";
import { CodeBlock, InlineCode } from "@/components/shared/code-block";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <Box
      className="markdown-body"
      css={{
        fontSize: "15px",
        lineHeight: "1.7",
        color: "var(--studio-text-primary)",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <Heading
              as="h1"
              css={{
                fontSize: "24px",
                fontWeight: 600,
                marginTop: "20px",
                marginBottom: "10px",
                letterSpacing: "-0.02em",
                color: "var(--studio-text-primary)",
              }}
            >
              {children}
            </Heading>
          ),
          h2: ({ children }) => (
            <Heading
              as="h2"
              css={{
                fontSize: "20px",
                fontWeight: 600,
                marginTop: "16px",
                marginBottom: "8px",
                letterSpacing: "-0.02em",
                color: "var(--studio-text-primary)",
              }}
            >
              {children}
            </Heading>
          ),
          h3: ({ children }) => (
            <Heading
              as="h3"
              css={{
                fontSize: "16px",
                fontWeight: 600,
                marginTop: "12px",
                marginBottom: "6px",
                letterSpacing: "-0.01em",
                color: "var(--studio-text-primary)",
              }}
            >
              {children}
            </Heading>
          ),
          p: ({ children }) => (
            <Text
              css={{
                marginBottom: "10px",
                color: "var(--studio-text-primary)",
                lineHeight: "1.7",
              }}
            >
              {children}
            </Text>
          ),
          a: ({ href, children }) => (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              css={{
                color: "var(--studio-link)",
                textDecoration: "none",
                borderBottom: "1px solid rgba(122,184,245,0.3)",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderBottomColor: "var(--studio-link)",
                },
              }}
            >
              {children}
            </Link>
          ),
          code: ({ className, children }) => {
            const isInline = !className;
            if (isInline) return <InlineCode>{children}</InlineCode>;
            const language = className?.replace("language-", "") || undefined;
            const code = String(children).replace(/\n$/, "");
            return (
              <Box css={{ marginBottom: "12px" }}>
                <CodeBlock code={code} language={language} />
              </Box>
            );
          },
          blockquote: ({ children }) => (
            <Box
              as="blockquote"
              css={{
                borderLeft: "3px solid var(--studio-border-hover)",
                paddingLeft: "16px",
                margin: "12px 0",
                color: "var(--studio-text-secondary)",
                fontStyle: "italic",
              }}
            >
              {children}
            </Box>
          ),
          ul: ({ children }) => (
            <Box
              as="ul"
              css={{
                paddingLeft: "20px",
                marginBottom: "10px",
                listStyleType: "disc",
                "& li": {
                  marginBottom: "4px",
                  color: "var(--studio-text-primary)",
                },
              }}
            >
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box
              as="ol"
              css={{
                paddingLeft: "20px",
                marginBottom: "10px",
                listStyleType: "decimal",
                "& li": {
                  marginBottom: "4px",
                  color: "var(--studio-text-primary)",
                },
              }}
            >
              {children}
            </Box>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
}
