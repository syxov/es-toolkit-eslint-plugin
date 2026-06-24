import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferWithout } from '../../src/rules/prefer-without.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-without', preferWithout, {
  valid: [
    'without(arr, value);',
    'arr.filter((x) => x.id !== value);',
    'arr.filter((x) => x === value);',
    'arr.filter((x) => a !== b);',
  ],
  invalid: [
    {
      code: 'arr.filter((x) => x !== value);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => value !== x);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => x != null);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'const xs = (arr as number[]).filter((x) => x !== 0);',
      errors: [{ messageId: 'preferWithout' }],
    },
  ],
});
