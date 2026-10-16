import sanitizeHtml from "sanitize-html";

export function sanitizeContentHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return "";

  return sanitizeHtml(dirtyHtml, {
    allowedTags: [
      "p",
      "h2",
      "h3",
      "h4",
      "strong",
      "em",
      "u",
      "s",
      "blockquote",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "iframe",
      "figure",
      "figcaption",
      "br",
      "hr",
      "span",
      "div",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "class"],
      img: ["src", "alt", "title", "width", "height", "class", "loading"],
      iframe: [
        "src",
        "width",
        "height",
        "frameborder",
        "allowfullscreen",
        "allow",
        "class",
      ],
      div: ["class", "data-*"],
      span: ["class"],
      p: ["class"],
      h2: ["class"],
      h3: ["class"],
      h4: ["class"],
      blockquote: ["class"],
      figure: ["class"],
      figcaption: ["class"],
    },
    allowedIframeHostnames: [
      "www.youtube.com",
      "youtube.com",
      "player.vimeo.com",
      "www.instagram.com",
      "instagram.com",
    ],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
      }),
    },
  });
}
