import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferInitial } from '../../src/rules/prefer-initial.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-initial', preferInitial, {
  valid: [
    'initial(arr);',
    'arr.slice(0, -2);',
    'arr.slice(1, -1);',
    'arr.slice(0);',
    "arr.slice('0', -1);",
    "arr.slice(0, -'1');",
    'arr.slice(0, 1);',
    // String contexts.
    's.slice(0, -1).toLowerCase();',
    's.slice(0, -1).toLocaleUpperCase();',
    "s.slice(0, -1) + '…';",
    'const trimmed = `${path.slice(0, -1)}/`;',
    // Strings: receiver, result, guard or declaration.
    "'abc/'.slice(0, -1);",
    'x.toFixed(2).slice(0, -1);',
    "s.slice(0, -1).split(',');",
    "s.slice(0, -1) === 'ab';",
    "urlPath.endsWith('/') ? urlPath.slice(0, -1) : urlPath;",
    "if (dir.endsWith('/')) dir = dir.slice(0, -1);",
    "outerPath.slice(-1) === 'Z' ? outerPath.slice(0, -1) : outerPath;",
    "let name = ''; name = name.slice(0, -1);",
    'function f(input: string) { return input.slice(0, -1); }',
    "import path from 'node:path'; path.dirname(file).slice(0, -1);",
    "const [text, setText] = useState(''); setText(previous => previous.slice(0, -1));",
    // Typed arrays.
    'const bytes = new Uint8Array(8); bytes.slice(0, -1);',
  ],
  invalid: [
    { code: 'arr.slice(0, -1);', errors: [{ messageId: 'preferInitial' }] },
    {
      code: 'const values: number[] = items.slice(0, -1);',
      errors: [{ messageId: 'preferInitial' }],
    },
    {
      code: 'fn(parts.slice(0, -1));',
      errors: [{ messageId: 'preferInitial' }],
    },
    {
      code: 'parts.slice(0, -1).join("/");',
      errors: [{ messageId: 'preferInitial' }],
    },
    {
      code: "const parts = s.split('/'); parts.slice(0, -1);",
      errors: [{ messageId: 'preferInitial' }],
    },
    {
      code: 'if (xs.length > 0) xs = xs.slice(0, -1);',
      errors: [{ messageId: 'preferInitial' }],
    },
    {
      code: 'function f(segments: readonly string[]) { return segments.slice(0, -1); }',
      errors: [{ messageId: 'preferInitial' }],
    },
  ],
});
