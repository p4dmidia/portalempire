"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import YoutubeExtension from "@tiptap/extension-youtube";
import { DOMSerializer } from "@tiptap/pm/model";
import { Mark, Node } from "@tiptap/core";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Video,
  Undo,
  Redo,
  Loader2,
  Eraser,
  UploadCloud,
  Youtube,
  X,
  Palette,
} from "lucide-react";

// ============================================================================
// EXTENSÕES CUSTOMIZADAS: VÍDEO (HTML5), TAMANHO DE FONTE, FAMÍLIA DE FONTE E COR
// ============================================================================

const VideoExtension = Node.create({
  name: "video",
  group: "block",
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
      class: {
        default: "w-full rounded-xl my-4 shadow-md max-h-[480px] bg-black",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video",
        getAttrs: (dom) => {
          if (typeof dom === "string") return {};
          const el = dom as HTMLVideoElement;
          return {
            src:
              el.getAttribute("src") ||
              el.querySelector("source")?.getAttribute("src") ||
              null,
            controls: el.hasAttribute("controls"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["video", { ...HTMLAttributes, controls: "true" }];
  },
});

const FontSizeExtension = Mark.create({
  name: "fontSize",
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => element.style.fontSize || null,
        renderHTML: (attributes) => {
          if (!attributes.size) return {};
          return {
            style: `font-size: ${attributes.size}`,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "span[style*='font-size']",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
});

const FontFamilyExtension = Mark.create({
  name: "fontFamily",
  addAttributes() {
    return {
      family: {
        default: null,
        parseHTML: (element) => element.style.fontFamily || null,
        renderHTML: (attributes) => {
          if (!attributes.family) return {};
          return {
            style: `font-family: ${attributes.family}`,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "span[style*='font-family']",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
});

const TextColorExtension = Mark.create({
  name: "textColor",
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return {
            style: `color: ${attributes.color}`,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "span[style*='color']",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
});

// ============================================================================
// COMPONENTE PRINCIPAL DO EDITOR TIPTAP
// ============================================================================

interface TiptapEditorProps {
  contentHtml: string;
  onChange: (html: string, json: unknown) => void;
  userId: string;
}

export function TiptapEditor({
  contentHtml,
  onChange,
  userId,
}: TiptapEditorProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [youtubeUrlInput, setYoutubeUrlInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        link: false,
      }),
      ImageExtension.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-xl overflow-hidden my-4 max-w-full h-auto shadow-md",
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80 font-medium",
        },
      }),
      YoutubeExtension.configure({
        controls: true,
        nocookie: false,
        allowFullscreen: true,
        HTMLAttributes: {
          class: "w-full aspect-video rounded-xl overflow-hidden my-4 shadow-md",
          referrerpolicy: "strict-origin-when-cross-origin",
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        },
      }),
      VideoExtension,
      FontSizeExtension,
      FontFamilyExtension,
      TextColorExtension,
    ],
    content: contentHtml || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-materia dark:prose-invert max-w-none min-h-[350px] p-4 sm:p-6 focus:outline-none text-base leading-relaxed text-slate-800 dark:text-slate-200",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getJSON());
    },
  });

  if (!editor) return null;

  // --------------------------------------------------------------------------
  // FORMATAÇÃO INLINE (Negrito, Itálico, Tachado)
  // Se houver seleção com mouse: formata APENAS o trecho selecionado.
  // Se NÃO houver seleção (cursor solto): aplica a todo o documento.
  // --------------------------------------------------------------------------
  const formatarTexto = (action: (chain: any) => any) => {
    if (!editor) return;
    const { empty } = editor.state.selection;

    if (empty) {
      action(editor.chain().focus().selectAll()).run();
    } else {
      action(editor.chain().focus()).run();
    }
  };

  // --------------------------------------------------------------------------
  // FORMATAÇÃO DE BLOCOS (H2, H3, Lista com Marcadores, Lista Numerada, Citação)
  // Quando há texto selecionado com o mouse:
  // - Extrai o trecho selecionado e converte SOMENTE ele em bloco próprio,
  //   preservando parágrafos anteriores e posteriores intactos.
  // Quando NÃO há seleção: aplica a todo o texto.
  // --------------------------------------------------------------------------
  const formatarBloco = (
    type: "h2" | "h3" | "bulletList" | "orderedList" | "blockquote"
  ) => {
    if (!editor) return;
    const { from, to, empty } = editor.state.selection;

    // Se NÃO houver seleção: aplica ao documento inteiro
    if (empty) {
      if (type === "h2")
        editor.chain().focus().selectAll().toggleHeading({ level: 2 }).run();
      if (type === "h3")
        editor.chain().focus().selectAll().toggleHeading({ level: 3 }).run();
      if (type === "bulletList")
        editor.chain().focus().selectAll().toggleBulletList().run();
      if (type === "orderedList")
        editor.chain().focus().selectAll().toggleOrderedList().run();
      if (type === "blockquote")
        editor.chain().focus().selectAll().toggleBlockquote().run();
      return;
    }

    // Se HOUVER seleção: serializa somente o trecho marcado
    const slice = editor.state.selection.content();
    const fragment = DOMSerializer.fromSchema(editor.schema).serializeFragment(
      slice.content
    );
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(fragment);
    const rawHtml = tempDiv.innerHTML;

    if (type === "h2") {
      if (editor.isActive("heading", { level: 2 })) {
        const clean = rawHtml.replace(/<\/?h2[^>]*>/gi, "");
        editor
          .chain()
          .focus()
          .insertContentAt({ from, to }, `<p>${clean || "&nbsp;"}</p>`)
          .run();
      } else {
        const clean = rawHtml
          .replace(/<\/?(h[1-6]|p|blockquote|ul|ol|li)[^>]*>/gi, " ")
          .trim();
        editor
          .chain()
          .focus()
          .insertContentAt({ from, to }, `<h2>${clean || "&nbsp;"}</h2>`)
          .run();
      }
    } else if (type === "h3") {
      if (editor.isActive("heading", { level: 3 })) {
        const clean = rawHtml.replace(/<\/?h3[^>]*>/gi, "");
        editor
          .chain()
          .focus()
          .insertContentAt({ from, to }, `<p>${clean || "&nbsp;"}</p>`)
          .run();
      } else {
        const clean = rawHtml
          .replace(/<\/?(h[1-6]|p|blockquote|ul|ol|li)[^>]*>/gi, " ")
          .trim();
        editor
          .chain()
          .focus()
          .insertContentAt({ from, to }, `<h3>${clean || "&nbsp;"}</h3>`)
          .run();
      }
    } else if (type === "blockquote") {
      if (editor.isActive("blockquote")) {
        const clean = rawHtml.replace(/<\/?blockquote[^>]*>/gi, "");
        editor
          .chain()
          .focus()
          .insertContentAt({ from, to }, `<p>${clean || "&nbsp;"}</p>`)
          .run();
      } else {
        const clean = rawHtml.replace(/<\/?blockquote[^>]*>/gi, "").trim();
        editor
          .chain()
          .focus()
          .insertContentAt(
            { from, to },
            `<blockquote><p>${clean || "&nbsp;"}</p></blockquote>`
          )
          .run();
      }
    } else if (type === "bulletList" || type === "orderedList") {
      // Divide por quebras de linha ou parágrafos para transformar cada linha em item
      const items = rawHtml
        .split(/(?:<br\s*\/?>|\r?\n|<\/p>)/i)
        .map((item) =>
          item
            .replace(/<p[^>]*>/gi, "")
            .replace(/<\/?(ul|ol|li)[^>]*>/gi, "")
            .trim()
        )
        .filter((item) => item.length > 0);

      if (items.length === 0 && rawHtml.trim()) {
        items.push(rawHtml.trim());
      }

      const isCurrentActive =
        type === "bulletList"
          ? editor.isActive("bulletList")
          : editor.isActive("orderedList");

      if (isCurrentActive) {
        const paragraphs = items.map((it) => `<p>${it}</p>`).join("");
        editor
          .chain()
          .focus()
          .insertContentAt({ from, to }, paragraphs || "<p>&nbsp;</p>")
          .run();
      } else {
        const lis = items.map((it) => `<li>${it}</li>`).join("");
        const tag = type === "bulletList" ? "ul" : "ol";
        editor
          .chain()
          .focus()
          .insertContentAt({ from, to }, `<${tag}>${lis}</${tag}>`)
          .run();
      }
    }
  };

  // --------------------------------------------------------------------------
  // TIPOGRAFIA: TAMANHO DE FONTE, FAMÍLIA DE FONTE E COR
  // --------------------------------------------------------------------------
  const aplicarFonte = (family: string) => {
    if (!editor) return;
    const { empty } = editor.state.selection;
    if (!family) {
      if (empty) {
        editor.chain().focus().selectAll().unsetMark("fontFamily").run();
      } else {
        editor.chain().focus().unsetMark("fontFamily").run();
      }
      return;
    }
    if (empty) {
      editor
        .chain()
        .focus()
        .selectAll()
        .setMark("fontFamily", { family })
        .run();
    } else {
      editor.chain().focus().setMark("fontFamily", { family }).run();
    }
  };

  const aplicarTamanho = (size: string) => {
    if (!editor) return;
    const { empty } = editor.state.selection;
    if (!size) {
      if (empty) {
        editor.chain().focus().selectAll().unsetMark("fontSize").run();
      } else {
        editor.chain().focus().unsetMark("fontSize").run();
      }
      return;
    }
    if (empty) {
      editor.chain().focus().selectAll().setMark("fontSize", { size }).run();
    } else {
      editor.chain().focus().setMark("fontSize", { size }).run();
    }
  };

  const aplicarCor = (color: string) => {
    if (!editor) return;
    const { empty } = editor.state.selection;
    if (!color) {
      if (empty) {
        editor.chain().focus().selectAll().unsetMark("textColor").run();
      } else {
        editor.chain().focus().unsetMark("textColor").run();
      }
      return;
    }
    if (empty) {
      editor.chain().focus().selectAll().setMark("textColor", { color }).run();
    } else {
      editor.chain().focus().setMark("textColor", { color }).run();
    }
  };

  const limparFormatacao = () => {
    if (!editor) return;
    const { empty } = editor.state.selection;
    if (empty) {
      editor.chain().focus().selectAll().unsetAllMarks().clearNodes().run();
    } else {
      editor.chain().focus().unsetAllMarks().clearNodes().run();
    }
  };

  // --------------------------------------------------------------------------
  // LINKS
  // --------------------------------------------------------------------------
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL do Link:", previousUrl || "https://");

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    if (editor.state.selection.empty) {
      const linkText = window.prompt("Texto para exibir no link:", url);
      if (linkText) {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}">${linkText}</a>`)
          .run();
      }
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  // --------------------------------------------------------------------------
  // UPLOAD DE IMAGEM
  // --------------------------------------------------------------------------
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem não pode ultrapassar 5MB.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop() || "webp";
      const fileName = `${userId}/editor-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("materias")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("materias")
        .getPublicUrl(fileName);

      if (publicData?.publicUrl) {
        editor.chain().focus().setImage({ src: publicData.publicUrl }).run();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha no upload";
      alert(`Erro no upload da imagem: ${msg}`);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --------------------------------------------------------------------------
  // UPLOAD DE VÍDEO DO COMPUTADOR (MP4, WEBM, MOV)
  // --------------------------------------------------------------------------
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("O arquivo de vídeo não pode ultrapassar 50MB.");
      return;
    }

    setIsUploadingVideo(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop() || "mp4";
      const fileName = `${userId}/video-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("materias")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type || "video/mp4",
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("materias")
        .getPublicUrl(fileName);

      if (publicData?.publicUrl) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "video",
            attrs: {
              src: publicData.publicUrl,
              controls: true,
            },
          })
          .run();
        setIsVideoModalOpen(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha no upload";
      alert(`Erro no upload do vídeo: ${msg}`);
    } finally {
      setIsUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = "";
    }
  };

  // --------------------------------------------------------------------------
  // VÍDEO DO YOUTUBE
  // --------------------------------------------------------------------------
  const handleInsertYoutube = () => {
    let url = youtubeUrlInput.trim();
    if (!url) return;

    // Se o usuário colou código de iframe (<iframe src="...">)
    const iframeMatch = url.match(/src=["'](https?:\/\/[^"']+)["']/i);
    if (iframeMatch) {
      url = iframeMatch[1];
    }

    // Se o usuário colou apenas o ID de 11 caracteres (ex: dQw4w9WgXcQ)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      url = `https://www.youtube.com/watch?v=${url}`;
    }

    // Evita o domínio nocookie que causa o Erro 153 no player recente do YouTube
    url = url.replace("youtube-nocookie.com", "youtube.com");

    editor.commands.setYoutubeVideo({ src: url });
    setYoutubeUrlInput("");
    setIsVideoModalOpen(false);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm relative">
      {/* Barra de Ferramentas */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 p-2 flex flex-wrap items-center gap-1.5">
        
        {/* Seletor de Tipo de Fonte */}
        <div className="flex items-center">
          <select
            onChange={(e) => aplicarFonte(e.target.value)}
            className="h-8 px-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
            defaultValue=""
            title="Tipo de Fonte (selecione um trecho ou clique para o texto todo)"
          >
            <option value="">Fonte: Padrão</option>
            <option value="'Inter', sans-serif">Inter (Moderna)</option>
            <option value="'Georgia', serif">Georgia (Jornalística)</option>
            <option value="'Merriweather', serif">Merriweather (Editorial)</option>
            <option value="'Roboto', sans-serif">Roboto (Clean)</option>
            <option value="'Playfair Display', serif">Playfair (Elegante)</option>
            <option value="'Courier New', monospace">Courier (Monoespaçada)</option>
          </select>
        </div>

        {/* Seletor de Tamanho de Fonte */}
        <div className="flex items-center">
          <select
            onChange={(e) => aplicarTamanho(e.target.value)}
            className="h-8 px-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
            defaultValue=""
            title="Tamanho da Fonte (selecione um trecho ou clique para o texto todo)"
          >
            <option value="">Tamanho: Normal</option>
            <option value="13px">13px - Pequeno</option>
            <option value="15px">15px - Padrão Notícia</option>
            <option value="17px">17px - Médio</option>
            <option value="20px">20px - Destaque</option>
            <option value="24px">24px - Subtítulo Grande</option>
            <option value="28px">28px - Título</option>
            <option value="34px">34px - Grande Destaque</option>
          </select>
        </div>

        {/* Seletor de Cores de Texto */}
        <div className="flex items-center">
          <div className="relative flex items-center">
            <select
              onChange={(e) => aplicarCor(e.target.value)}
              className="h-8 pl-6 pr-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
              defaultValue=""
              title="Cor do Texto"
            >
              <option value="">Cor: Padrão</option>
              <option value="#000000">Preto</option>
              <option value="#334155">Cinza Escuro</option>
              <option value="#2563eb">Azul Notícia</option>
              <option value="#dc2626">Vermelho Destaque</option>
              <option value="#16a34a">Verde</option>
              <option value="#d97706">Dourado / Âmbar</option>
              <option value="#7c3aed">Roxo</option>
              <option value="#991b1b">Vinho</option>
            </select>
            <Palette className="w-3.5 h-3.5 absolute left-2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block" />

        {/* Negrito, Itálico, Tachado */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatarTexto((chain) => chain.toggleBold())}
          className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive("bold")
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
          title="Negrito (selecione o trecho com o mouse ou clique para aplicar em tudo)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatarTexto((chain) => chain.toggleItalic())}
          className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive("italic")
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
          title="Itálico (selecione o trecho com o mouse ou clique para aplicar em tudo)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatarTexto((chain) => chain.toggleStrike())}
          className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive("strike")
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
          title="Tachado (selecione o trecho com o mouse ou clique para aplicar em tudo)"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* H2 e H3 */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatarBloco("h2")}
          className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
          title="Título H2 (selecione o trecho com o mouse para formatar apenas ele)"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatarBloco("h3")}
          className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
          title="Subtítulo H3 (selecione o trecho com o mouse para formatar apenas ele)"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Listas e Citação */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatarBloco("bulletList")}
          className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive("bulletList")
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
          title="Lista com Marcadores (selecione o trecho com o mouse para formatar apenas ele)"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatarBloco("orderedList")}
          className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive("orderedList")
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
          title="Lista Numerada (selecione o trecho com o mouse para formatar apenas ele)"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatarBloco("blockquote")}
          className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive("blockquote")
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
          title="Citação (selecione o trecho com o mouse para formatar apenas ele)"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={limparFormatacao}
          className="p-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Limpar Formatação (remove fontes, negrito e volta ao normal)"
        >
          <Eraser className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Link */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={setLink}
          className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive("link")
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
          title="Inserir Link"
        >
          <Link2 className="w-4 h-4" />
        </button>

        {/* Imagem */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingImage}
          className="p-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
          title="Inserir Imagem do Computador"
        >
          {isUploadingImage ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Vídeo (Abre modal com Upload do PC ou YouTube) */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setIsVideoModalOpen(true)}
          disabled={isUploadingVideo}
          className="p-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
          title="Inserir Vídeo (Upload do Computador ou YouTube)"
        >
          {isUploadingVideo ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Video className="w-4 h-4 text-primary" />
          )}
        </button>

        {/* Input de Arquivo de Vídeo (Oculto) */}
        <input
          type="file"
          ref={videoFileInputRef}
          accept="video/mp4,video/webm,video/ogg,video/quicktime"
          className="hidden"
          onChange={handleVideoUpload}
        />

        <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Desfazer / Refazer */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
          title="Desfazer"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
          title="Refazer"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* MODAL DE VÍDEO (Upload de Arquivo ou YouTube) */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Video className="w-5 h-5 text-primary" />
              Inserir Vídeo na Matéria
            </h3>

            <div className="space-y-4">
              {/* Opção 1: Upload do PC */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <UploadCloud className="w-4 h-4 text-primary" />
                  Upload de Vídeo do Computador
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Envie vídeos em MP4, WebM ou MOV direto do seu dispositivo (até 50MB).
                </p>
                <button
                  type="button"
                  disabled={isUploadingVideo}
                  onClick={() => videoFileInputRef.current?.click()}
                  className="w-full mt-2 py-2 px-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isUploadingVideo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando vídeo para o servidor...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Selecionar Arquivo de Vídeo
                    </>
                  )}
                </button>
              </div>

              {/* Divisor OU */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
                  ou
                </span>
              </div>

              {/* Opção 2: YouTube */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <Youtube className="w-4 h-4 text-red-500" />
                  Vídeo do YouTube
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cole o link do vídeo do YouTube que deseja incorporar.
                </p>
                <div className="flex gap-2 mt-2">
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrlInput}
                    onChange={(e) => setYoutubeUrlInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleInsertYoutube}
                    disabled={!youtubeUrlInput.trim()}
                    className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    Inserir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Área de Edição */}
      <EditorContent editor={editor} />
    </div>
  );
}
