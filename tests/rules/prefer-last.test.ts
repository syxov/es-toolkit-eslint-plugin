import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferLast } from '../../src/rules/prefer-last.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-last', preferLast, {
  valid: [
    'last(arr);',
    'arr[arr.length - 2];',
    'arr[i - 1];',
    'arr[arr.length];',
    'arr.at(-1);',
    'arr[arr.length - "1"];',
    'arr[arr["length"] - 1];',
    // A different receiver is not the last element of `a`.
    'a[b.length - 1];',
    'a.b[a.length - 1];',
    // Writes, not reads.
    'arr[arr.length - 1] = x;',
    'arr[arr.length - 1]++;',
    'delete arr[arr.length - 1];',
    '[arr[arr.length - 1]] = xs;',
    // Strings: receiver, guard or declaration.
    "'abc'['abc'.length - 1];",
    "(s + '/')[(s + '/').length - 1];",
    "function f(url: string) { return url[url.length - 1] !== '/'; }",
    "const text = getText().trim(); text[text.length - 1] === ' ';",
    "s.endsWith('\\n') || s[s.length - 1] === '\\r';",
    "typeof tv === 'string' && tv[0] === '\"' && tv[tv.length - 1] === '\"';",
    'function f(source: string) { const slice = source.slice(1, 4); return slice[slice.length - 1]; }',
    // DOM collections.
    "const cells = document.querySelectorAll('td'); cells[cells.length - 1];",
    "const rows = container.getElementsByTagName('tr'); rows[rows.length - 1];",
    'document.head.children[document.head.children.length - 1];',
    'function f(nodes: NodeListOf<Element>) { return nodes[nodes.length - 1]; }',
    // Next to `a[a.length - 2]`: rewriting one of them breaks the symmetry.
    'segmentDir(points[points.length - 1], points[points.length - 2]);',
    '`${parts[parts.length - 2]}/${parts[parts.length - 1]}`;',
    'while (a[a.length - 2] > a[a.length - 1]) a.pop();',
    // A string's last character.
    "'abc'.slice(-1)[0];",
    "s.endsWith('x') ? s.slice(-1)[0] : '';",
  ],
  invalid: [
    {
      code: 'arr[arr.length - 1];',
      errors: [{ messageId: 'preferLast' }],
    },
    {
      code: 'items[items.length - 1];',
      errors: [{ messageId: 'preferLast' }],
    },
    {
      code: 'getArr()[getArr().length - 1];',
      errors: [{ messageId: 'preferLast' }],
    },
    {
      code: 'this.items[this.items.length - 1];',
      errors: [{ messageId: 'preferLast' }],
    },
    {
      code: 'const x: string = words[words.length - 1];',
      errors: [{ messageId: 'preferLast' }],
    },
    {
      code: 'arr[arr.length - 1].done = true;',
      errors: [{ messageId: 'preferLast' }],
    },
    // Arrays of strings.
    {
      code: "const parts = s.split('/'); parts[parts.length - 1];",
      errors: [{ messageId: 'preferLast' }],
    },
    {
      code: "stack[stack.length - 1] === '(';",
      errors: [{ messageId: 'preferLast' }],
    },
    {
      code: 'function f(lines: string[]) { return lines[lines.length - 1]; }',
      errors: [{ messageId: 'preferLast' }],
    },
    // `.children` outside `document` is often an AST or tree array.
    {
      code: 'node.children[node.children.length - 1];',
      errors: [{ messageId: 'preferLast' }],
    },
    // `a.length - 2` on a different array, or in another statement.
    {
      code: 'f(a[a.length - 1], b[b.length - 2]);',
      errors: [{ messageId: 'preferLast' }],
    },
    {
      code: 'const x = a[a.length - 1]; const y = a[a.length - 2];',
      errors: [{ messageId: 'preferLast' }],
    },
    // `xs.slice(-1)[0]` is the last element.
    {
      code: 'xs.slice(-1)[0];',
      errors: [{ messageId: 'preferLast' }],
    },
    {
      code: "const fileName = path.split('/').slice(-1)[0];",
      errors: [{ messageId: 'preferLast' }],
    },
    {
      code: 'this.state.records.boxes.slice(-1)[0];',
      errors: [{ messageId: 'preferLast' }],
    },
  ],
});
