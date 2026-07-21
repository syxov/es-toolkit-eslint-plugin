import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferSumBy } from '../../src/rules/prefer-sum-by.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-sum-by', preferSumBy, {
  valid: [
    'sumBy(items, item => item.value);',
    'items.reduce((acc, item) => acc + item.value, 1);',
  ],
  invalid: [
    {
      code: 'items.reduce((acc, item) => acc + item.value, 0);',
      errors: [{ messageId: 'preferSumBy' }],
    },
    {
      code: 'const total: number = items.reduce((acc, item) => item.value + acc, 0);',
      errors: [{ messageId: 'preferSumBy' }],
    },
  ],
});
