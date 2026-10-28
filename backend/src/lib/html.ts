import sanitizeHtml from "sanitize-html";

const color = [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^[a-z]+$/i];

/** Only the formatting the rich text editor can produce; everything else (scripts, events, iframes) is removed. */
export function cleanHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup", "mark", "span", "code", "pre",
      "h1", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "hr", "a",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["style"],
      mark: ["style", "data-color"],
      p: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      ol: ["start"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedStyles: {
      "*": {
        color,
        "background-color": color,
        "font-size": [/^\d{1,2}(\.\d+)?(px|em|rem)$/],
        "font-family": [/^[\w\s,'"-]+$/],
        "line-height": [/^\d(\.\d+)?$/],
        "text-align": [/^(left|right|center|justify)$/],
      },
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer nofollow" }),
    },
  }).trim();
}

/** Readable plain text version of rich text, for previews, search and plain-text emails. */
export function htmlToText(html: string) {
  return sanitizeHtml(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<\/(p|h[1-6]|li|blockquote|pre)>/gi, "\n"),
    { allowedTags: [], allowedAttributes: {} },
  )
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
