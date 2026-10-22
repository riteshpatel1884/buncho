'use client';

import { useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { indentUnit, LanguageDescription } from '@codemirror/language';
import { indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { markdown } from '@codemirror/lang-markdown';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';

// Code blocks inside Markdown (```python ... ```) get their own colours too
const codeLanguages = [
  LanguageDescription.of({ name: 'python', alias: ['py'], support: python() }),
  LanguageDescription.of({ name: 'javascript', alias: ['js', 'ts', 'typescript'], support: javascript() }),
  LanguageDescription.of({ name: 'sql', support: sql() }),
];

function languageSupport(language) {
  if (language === 'python') return python();
  if (language === 'javascript') return javascript();
  if (language === 'sql') return sql();
  return markdown({ codeLanguages });
}

// Follows the site's light/dark toggle (a "dark" class on <html>)
function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setDark(el.classList.contains('dark'));
    read();
    const observer = new MutationObserver(read);
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

const baseTheme = EditorView.theme({
  '&': { fontSize: '0.875rem' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'var(--f-mono), ui-monospace, SFMono-Regular, Menlo, monospace', lineHeight: '1.65' },
  '.cm-content': { padding: '10px 0' },
});

/**
 * VS Code style editor: line numbers, coloured syntax, auto-indent, bracket matching, Tab to indent.
 * Press Esc, then Tab, to move focus out of the editor with the keyboard.
 */
export default function CodeEditor({
  value,
  onChange,
  language = 'python',
  label = 'Code editor',
  placeholder = '',
  minHeight = '16rem',
  className = '',
  onFocus,
}) {
  const dark = useIsDark();

  const extensions = useMemo(
    () => [
      languageSupport(language),
      EditorView.lineWrapping,
      indentUnit.of(language === 'python' ? '    ' : '  '),
      keymap.of([indentWithTab]),
      EditorView.contentAttributes.of({ 'aria-label': label }),
      baseTheme,
    ],
    [language, label],
  );

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      extensions={extensions}
      theme={dark ? vscodeDark : vscodeLight}
      placeholder={placeholder}
      minHeight={minHeight}
      height="auto"
      className={className}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        bracketMatching: true,
        closeBrackets: true,
        indentOnInput: true,
        autocompletion: false,
      }}
    />
  );
}