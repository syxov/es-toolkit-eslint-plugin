import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsRegExp } from '../../src/rules/prefer-is-reg-exp.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-is-reg-exp', preferIsRegExp, {
  valid: ['isRegExp(value);', 'value instanceof Date;'],
  invalid: [
    {
      code: 'value instanceof RegExp;',
      errors: [{ messageId: 'preferIsRegExp' }],
    },
  ],
});
