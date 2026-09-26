import "server-only";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({ gfm: true, breaks: false });

/**
 * Article bodies are written in Markdown by staff. We still sanitise the rendered HTML
 * so a compromised or careless account cannot inject scripts into public pages.
 */
export function renderMarkdown(md: string) {
  const html = marked.parse(md ?? "", { async: false }) as string;
  return sanitizeHtml(html, {
    allowedTags: [
      "h2", "h3", "h4", "p", "a", "ul", "ol", "li", "blockquote", "strong", "em", "b", "i",
      "hr", "br", "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "code", "pre",
    ],
    allowedAttributes: { a: ["href", "title", "rel", "target"], img: ["src", "alt", "title", "loading"] },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    transformTags: {
      a: (tag, attribs) => {
        const external = /^https?:\/\//.test(attribs.href ?? "");
        return {
          tagName: "a",
          attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs,
        };
      },
      img: (tag, attribs) => ({ tagName: "img", attribs: { ...attribs, loading: "lazy" } }),
    },
  });
}

/** Split rendered HTML roughly in half at a paragraph boundary (for the in-article ad slot). */
export function splitForAd(html: string) {
  const parts = html.split("</p>");
  if (parts.length < 5) return [html, ""] as const;
  const mid = Math.floor(parts.length / 2);
  return [parts.slice(0, mid).join("</p>") + "</p>", parts.slice(mid).join("</p>")] as const;
}
