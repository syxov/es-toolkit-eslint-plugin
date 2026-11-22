import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferTail } from '../../src/rules/prefer-tail.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-tail', preferTail, {
  valid: [
    'tail(arr);',
    'arr.slice(2);',
    'arr.slice(1, 3);',
    'arr.slice();',
    "arr.slice('1');",
    'arr.slice(-1);',
    // String contexts.
    's.slice(1).toLowerCase();',
    's.slice(1).toUpperCase();',
    's.slice(1).toLocaleLowerCase();',
    's.slice(1).toLocaleUpperCase();',
    's[0].toUpperCase() + s.slice(1);',
    's.slice(1) + suffix;',
    'const label = `#${id.slice(1)}`;',
  ],
  invalid: [
    { code: 'arr.slice(1);', errors: [{ messageId: 'preferTail' }] },
    {
      code: 'const values: number[] = items.slice(1);',
      errors: [{ messageId: 'preferTail' }],
    },
    { code: 'fn(args.slice(1));', errors: [{ messageId: 'preferTail' }] },
    {
      code: 'args.slice(1).map(f);',
      errors: [{ messageId: 'preferTail' }],
    },
    {
      code: 'args.slice(1).length - 1;',
      errors: [{ messageId: 'preferTail' }],
    },
    // Only direct string contexts are skipped.
    {
      code: 's.slice(1).trim() + suffix;',
      errors: [{ messageId: 'preferTail' }],
    },
  ],
});
