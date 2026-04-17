import hljs from "highlight.js/lib/common";

export function highlightCode(
  code: string,
  language: string | undefined,
): { html: string; language: string } {
  if (language && hljs.getLanguage(language)) {
    try {
      const result = hljs.highlight(code, {
        language,
        ignoreIllegals: true,
      });
      return { html: result.value, language };
    } catch {
      /* fall through */
    }
  }
  try {
    const result = hljs.highlightAuto(code);
    return { html: result.value, language: result.language ?? "" };
  } catch {
    return { html: escapeHtml(code), language: "" };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
