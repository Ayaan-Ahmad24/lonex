"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { safeHref } from "@/lib/content/rich-text";

type EditorMode = "visual" | "html" | "preview";

const ALLOWED_TAGS = new Set([
  "p",
  "h2",
  "h3",
  "h4",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "hr",
  "br",
]);

const VOID_TAGS = new Set(["hr", "br"]);

const UNSAFE_SOURCE =
  /<\s*\/?\s*(script|iframe|object|embed|form|svg|style|link|meta|input|button|textarea|select)\b|\son[a-z]+\s*=|\b(?:href|src|action|formaction)\s*=\s*["']?\s*(?:javascript|vbscript|data)\s*:/i;

/**
 * Check the HTML/Source textarea before it is sent to Tiptap or the server.
 * Returns a specific, actionable message when the markup is not supported.
 */
export function validateHtmlSource(source: string): string | null {
  if (!source.trim()) {
    return "Article content is required.";
  }

  if (UNSAFE_SOURCE.test(source)) {
    return "Remove scripts, iframes, forms, SVG, event handlers and javascript:/data: URLs. They are not allowed.";
  }

  const stack: string[] = [];
  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(source)) !== null) {
    const raw = match[0];
    const name = match[1].toLowerCase();
    const closing = raw.startsWith("</");
    const selfClosing = /\/>\s*$/.test(raw);

    if (!ALLOWED_TAGS.has(name)) {
      return `Unsupported tag <${name}>. Use paragraphs, H2–H4, lists, quotes, links, bold, italic, underline and horizontal rules.`;
    }

    if (VOID_TAGS.has(name) || selfClosing) {
      if (closing) {
        return `Unexpected closing tag </${name}>.`;
      }

      continue;
    }

    if (closing) {
      const open = stack.pop();

      if (open !== name) {
        return `Mismatched closing tag </${name}>${
          open ? `; expected </${open}>` : ""
        }.`;
      }
    } else {
      stack.push(name);
    }
  }

  if (stack.length > 0) {
    return `Unclosed <${stack[stack.length - 1]}> tag.`;
  }

  const withoutTags = source.replace(tagPattern, "");

  if (withoutTags.includes("<")) {
    return "The HTML contains an invalid '<' character. Use &lt; for literal text.";
  }

  if (!withoutTags.replace(/&[a-z#0-9]+;/gi, "").trim()) {
    return "Article content must contain text, a heading, a list, a quote or a horizontal rule.";
  }

  return null;
}

function ToolButton({
  label,
  title,
  active = false,
  disabled = false,
  onClick,
}: {
  label: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
        active
          ? "bg-slate-900 text-white"
          : "bg-white text-slate-700 hover:bg-slate-100"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {label}
    </button>
  );
}

export function BlogEditor({
  name = "content",
  initialHtml,
}: {
  name?: string;
  initialHtml: string;
}) {
  const [mode, setMode] = useState<EditorMode>("visual");
  const [html, setHtml] = useState(initialHtml);
  const [source, setSource] = useState(initialHtml);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        strike: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
        },
      }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "blog-editor-content",
        "aria-label": "Article body",
      },
    },
    onUpdate: ({ editor: current }) => {
      setHtml(current.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(mode === "visual");
    }
  }, [editor, mode]);

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive("bold") ?? false,
      italic: current?.isActive("italic") ?? false,
      underline: current?.isActive("underline") ?? false,
      heading2: current?.isActive("heading", { level: 2 }) ?? false,
      heading3: current?.isActive("heading", { level: 3 }) ?? false,
      heading4: current?.isActive("heading", { level: 4 }) ?? false,
      paragraph: current?.isActive("paragraph") ?? false,
      bulletList: current?.isActive("bulletList") ?? false,
      orderedList: current?.isActive("orderedList") ?? false,
      blockquote: current?.isActive("blockquote") ?? false,
      link: current?.isActive("link") ?? false,
      canUndo: current?.can().undo() ?? false,
      canRedo: current?.can().redo() ?? false,
    }),
  });

  function commitSource(): boolean {
    if (!editor) {
      return false;
    }

    const message = validateHtmlSource(source);

    if (message) {
      setError(message);
      return false;
    }

    try {
      editor.commands.setContent(source, {
        emitUpdate: true,
        errorOnInvalidContent: true,
      });
      setError(null);
      return true;
    } catch {
      setError("The HTML could not be parsed by the editor. Check the tag nesting.");
      return false;
    }
  }

  function switchMode(next: EditorMode) {
    if (next === mode) {
      return;
    }

    if (mode === "html" && (next === "visual" || next === "preview")) {
      if (!commitSource()) {
        return;
      }
    }

    if (next === "html" && editor) {
      setSource(editor.getHTML());
    }

    setError(null);
    setMode(next);
  }

  function setLink() {
    if (!editor) {
      return;
    }

    const previous = editor.getAttributes("link").href as string | undefined;
    const input = window.prompt(
      "Link URL (https://… or a site-relative /path)",
      previous ?? "https://",
    );

    if (input === null) {
      return;
    }

    const trimmed = input.trim();

    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setError(null);
      return;
    }

    if (!safeHref(trimmed)) {
      setError("Links must use https:// or a site-relative path beginning with /.");
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
    setError(null);
  }

  function clearFormatting() {
    editor
      ?.chain()
      .focus()
      .unsetAllMarks()
      .clearNodes()
      .run();
  }

  const modeButton = (value: EditorMode, label: string) => (
    <button
      type="button"
      onClick={() => switchMode(value)}
      aria-pressed={mode === value}
      className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
        mode === value
          ? "bg-slate-900 text-white"
          : "bg-white text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
        <div className="flex flex-wrap items-center gap-1">
          {editor ? (
            <>
              <ToolButton
                label="B"
                title="Bold (Ctrl+B)"
                active={state?.bold}
                onClick={() => editor.chain().focus().toggleBold().run()}
              />
              <ToolButton
                label="I"
                title="Italic (Ctrl+I)"
                active={state?.italic}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              />
              <ToolButton
                label="U"
                title="Underline (Ctrl+U)"
                active={state?.underline}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              />
              <span className="mx-1 h-5 w-px bg-slate-300" />
              <ToolButton
                label="H2"
                title="Heading 2"
                active={state?.heading2}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
              />
              <ToolButton
                label="H3"
                title="Heading 3"
                active={state?.heading3}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
              />
              <ToolButton
                label="H4"
                title="Heading 4"
                active={state?.heading4}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 4 }).run()
                }
              />
              <ToolButton
                label="P"
                title="Paragraph"
                active={state?.paragraph}
                onClick={() => editor.chain().focus().setParagraph().run()}
              />
              <span className="mx-1 h-5 w-px bg-slate-300" />
              <ToolButton
                label="• List"
                title="Bullet list"
                active={state?.bulletList}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              />
              <ToolButton
                label="1. List"
                title="Numbered list"
                active={state?.orderedList}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              />
              <ToolButton
                label="Quote"
                title="Blockquote"
                active={state?.blockquote}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              />
              <ToolButton
                label="Link"
                title="Add or edit link"
                active={state?.link}
                onClick={setLink}
              />
              <ToolButton
                label="—"
                title="Horizontal rule"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
              />
              <ToolButton
                label="Clear"
                title="Clear formatting"
                onClick={clearFormatting}
              />
              <span className="mx-1 h-5 w-px bg-slate-300" />
              <ToolButton
                label="Undo"
                title="Undo (Ctrl+Z)"
                disabled={!state?.canUndo}
                onClick={() => editor.chain().focus().undo().run()}
              />
              <ToolButton
                label="Redo"
                title="Redo (Ctrl+Shift+Z)"
                disabled={!state?.canRedo}
                onClick={() => editor.chain().focus().redo().run()}
              />
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          {modeButton("visual", "Visual")}
          {modeButton("html", "HTML")}
          {modeButton("preview", "Preview")}
        </div>
      </div>

      <input type="hidden" name={name} value={mode === "html" ? source : html} />

      {mode === "visual" ? (
        <div className="rounded-lg border border-slate-300 bg-white">
          <EditorContent editor={editor} />
        </div>
      ) : null}

      {mode === "html" ? (
        <div className="space-y-1">
          <textarea
            value={source}
            onChange={(event) => setSource(event.currentTarget.value)}
            onBlur={() => {
              const message = validateHtmlSource(source);
              setError(message);
            }}
            rows={18}
            spellCheck={false}
            aria-label="Article HTML source"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-[13px] leading-6 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
          <p className="text-xs text-slate-500">
            Supported tags: p, h2–h4, strong, em, u, ul, ol, li, blockquote, a
            and hr. Switch to Visual to apply source changes.
          </p>
        </div>
      ) : null}

      {mode === "preview" ? (
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Preview
          </p>
          <div className="blog-editor-content blog-editor-preview">
            <EditorContent editor={editor} />
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
