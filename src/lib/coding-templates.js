/* Starter outlines for coding notes. Plain TipTap JSON, loaded only in the coding editor. */
const t = (text) => ({ type: 'text', text });
const p = (text) => ({ type: 'paragraph', content: text ? [t(text)] : undefined });
const h2 = (text) => ({ type: 'heading', attrs: { level: 2 }, content: [t(text)] });
const code = (language, text, extra = {}) => ({ type: 'codeBlock', attrs: { language, lineNumbers: true, ...extra }, content: [t(text)] });
const out = (text) => ({ type: 'codeBlock', attrs: { language: null, variant: 'output' }, content: [t(text)] });
const callout = (variant, text) => ({ type: 'callout', attrs: { variant }, content: [p(text)] });
const li = (text) => ({ type: 'listItem', content: [p(text)] });

export const CODING_TEMPLATES = [
  {
    id: 'concept',
    name: 'Concept note',
    hint: 'What it is, syntax, example, output, pitfalls',
    content: [
      h2('What it is'), p('One or two sentences on what this does and when you would use it.'),
      h2('Syntax'), code('python', 'def greet(name):\n    return f"Hello, {name}!"', { filename: 'syntax.py' }),
      h2('Example'), code('python', 'print(greet("Asha"))', { filename: 'example.py' }), out('Hello, Asha!'),
      callout('pitfall', 'Write the mistake people usually make here and how to avoid it.'),
      h2('Key points'), { type: 'bulletList', content: [li('First thing to remember'), li('Second thing to remember')] },
    ],
  },
  {
    id: 'cheatsheet',
    name: 'Cheat sheet',
    hint: 'Quick reference table with examples',
    content: [
      h2('Quick reference'),
      {
        type: 'table',
        content: [
          { type: 'tableRow', content: ['Task', 'Code', 'Result'].map((c) => ({ type: 'tableHeader', content: [p(c)] })) },
          { type: 'tableRow', content: ['Sort a list', 'sorted(xs)', 'New sorted list'].map((c) => ({ type: 'tableCell', content: [p(c)] })) },
        ],
      },
      h2('Examples'), code('python', 'xs = [3, 1, 2]\nprint(sorted(xs))'), out('[1, 2, 3]'),
    ],
  },
  {
    id: 'problem',
    name: 'Problem and solution',
    hint: 'Problem, approach, code, complexity',
    content: [
      h2('Problem'), p('State the problem in your own words.'),
      h2('Approach'), p('Explain the idea before the code.'),
      h2('Solution'), code('python', 'def solve(nums):\n    seen = set()\n    for n in nums:\n        if n in seen:\n            return n\n        seen.add(n)', { highlight: '3-5' }),
      h2('Complexity'), p('Time: O(n). Space: O(n).'),
    ],
  },
  {
    id: 'reference',
    name: 'Function reference',
    hint: 'Signature, parameters, returns, example',
    content: [
      h2('Signature'), code('python', 'def read_csv(path, *, sep=",") -> DataFrame:', { lineNumbers: false }),
      h2('Parameters'), { type: 'bulletList', content: [li('path: file to read'), li('sep: column separator')] },
      h2('Returns'), p('Describe what comes back.'),
      h2('Example'), code('python', 'df = read_csv("data.csv")\nprint(df.head())'),
      callout('tip', 'Add a tip about performance or a related function.'),
    ],
  },
];