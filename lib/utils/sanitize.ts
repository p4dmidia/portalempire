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
      "video",
      "source",
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
      video: ["src", "controls", "width", "height", "class", "poster", "preload"],
      source: ["src", "type"],
      iframe: [
        "src",
        "width",
        "height",
        "frameborder",
        "allowfullscreen",
        "allow",
        "class",
        "referrerpolicy",
        "title",
      ],
      div: ["class", "style", "data-*"],
      span: ["class", "style", "data-*"],
      p: ["class", "style"],
      h2: ["class", "style"],
      h3: ["class", "style"],
      h4: ["class", "style"],
      blockquote: ["class", "style"],
      figure: ["class"],
      figcaption: ["class"],
    },
    allowedStyles: {
      "*": {
        "color": [/.*/],
        "background-color": [/.*/],
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
        "font-size": [/.*/],
        "font-family": [/.*/],
        "font-weight": [/.*/],
      },
    },
    allowedIframeHostnames: [
      "www.youtube.com",
      "youtube.com",
      "www.youtube-nocookie.com",
      "youtube-nocookie.com",
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
