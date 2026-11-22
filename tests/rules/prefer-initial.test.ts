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
  ],
});
