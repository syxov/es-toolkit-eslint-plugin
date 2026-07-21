import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsDate } from '../../src/rules/prefer-is-date.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-is-date', preferIsDate, {
  valid: ['isDate(value);', 'value instanceof Map;'],
  invalid: [
    { code: 'value instanceof Date;', errors: [{ messageId: 'preferIsDate' }] },
  ],
});
