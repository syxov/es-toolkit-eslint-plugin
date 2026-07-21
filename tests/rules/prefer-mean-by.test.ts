import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferMeanBy } from '../../src/rules/prefer-mean-by.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-mean-by', preferMeanBy, {
  valid: [
    'meanBy(items, item => item.price);',
    'items.reduce((total, item) => total + item.price, 0) / other.length;',
  ],
  invalid: [
    {
      code: 'items.reduce((total, item) => total + item.price, 0) / items.length;',
      errors: [{ messageId: 'preferMeanBy' }],
    },
  ],
});
