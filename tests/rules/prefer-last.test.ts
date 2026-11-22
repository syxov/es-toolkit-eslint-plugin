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
  ],
});
