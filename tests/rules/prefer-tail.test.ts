import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferTail } from '../../src/rules/prefer-tail.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-tail', preferTail, {
  valid: ['tail(arr);', 'arr.slice(2);', 'arr.slice(1, 3);', 'arr.slice();'],
  invalid: [
    { code: 'arr.slice(1);', errors: [{ messageId: 'preferTail' }] },
    {
      code: 'const values: number[] = items.slice(1);',
      errors: [{ messageId: 'preferTail' }],
    },
  ],
});
