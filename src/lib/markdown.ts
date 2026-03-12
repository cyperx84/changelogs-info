/** Minimal markdown-to-HTML for GitHub release bodies. */
export function markdownToHtml(md: string): string {
  let html = md
    // Escape HTML entities
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    // Code blocks (``` ... ```)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => {
      return `<pre><code>${code.trim()}</code></pre>`;
    })

    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")

    // Headers
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")

    // Bold+italic, bold, italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")

    // Strikethrough
    .replace(/~~(.+?)~~/g, "<del>$1</del>")

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

    // Images → links
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">[Image: $1]</a>')

    // Horizontal rules
    .replace(/^(?:---+|===+|\*\*\*+)$/gm, "<hr>")

    // Blockquotes
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")

    // Ordered list items → sentinel <li-ol>
    .replace(/^\d+\. (.+)$/gm, "<li-ol>$1</li-ol>")

    // Unordered list items → sentinel <li-ul>
    .replace(/^[ \t]*[-*+] (.+)$/gm, "<li-ul>$1</li-ul>");

  // Wrap consecutive <li-ol> in <ol>
  html = html.replace(/((?:<li-ol>.*<\/li-ol>\n?)+)/g, (match) =>
    `<ol>${match.replace(/<li-ol>/g, "<li>").replace(/<\/li-ol>/g, "</li>")}</ol>`
  );

  // Wrap consecutive <li-ul> in <ul>
  html = html.replace(/((?:<li-ul>.*<\/li-ul>\n?)+)/g, (match) =>
    `<ul>${match.replace(/<li-ul>/g, "<li>").replace(/<\/li-ul>/g, "</li>")}</ul>`
  );

  // Paragraphs: wrap remaining double-newline-separated blocks
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<[a-z]/i.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  // Clean up double-wrapped blocks
  html = html
    .replace(/<p><(h[1-4]|ul|ol|pre|blockquote|hr)/g, "<$1")
    .replace(/<\/(h[1-4]|ul|ol|pre|blockquote)><\/p>/g, "</$1>");

  return html;
}
