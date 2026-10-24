import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { TableKit } from '@tiptap/extension-table';
import { Placeholder } from '@tiptap/extensions';
import { Node, mergeAttributes } from '@tiptap/core';
import { createLowlight, common } from 'lowlight';

const lowlight = createLowlight(common);

/** Note / tip / warning box. Stored as { type: 'callout', attrs: { variant } } and rendered by RichContent. */
export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() {
    return {
      variant: {
        default: 'info',
        parseHTML: (el) => el.getAttribute('data-variant') || 'info',
        renderHTML: (attrs) => ({ 'data-variant': attrs.variant, class: `callout callout-${attrs.variant}` }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'aside[data-callout]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['aside', mergeAttributes(HTMLAttributes, { 'data-callout': '' }), 0];
  },
  addCommands() {
    return {
      setCallout:
        (variant = 'info') =>
        ({ commands }) =>
          commands.wrapIn(this.name, { variant }),
      unsetCallout:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },
});

/** Block image with caption and intrinsic size (the size lets the public page reserve space and avoid layout shift). */
const BlogImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: { default: '' },
      width: { default: null },
      height: { default: null },
    };
  },
});

export function buildExtensions() {
  return [
    StarterKit.configure({
      // H1 is reserved for the article title
      heading: { levels: [2, 3, 4] },
      codeBlock: false,
      link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } },
    }),
    CodeBlockLowlight.configure({ lowlight, defaultLanguage: null }),
    BlogImage.configure({ inline: false, allowBase64: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TableKit.configure({ table: { resizable: false } }),
    Callout,
    Placeholder.configure({ placeholder: 'Start writing. Use the toolbar for headings, code blocks, tables and callouts.' }),
  ];
}