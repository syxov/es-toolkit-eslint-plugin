import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsFunction } from '../../src/rules/prefer-is-function.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-is-function', preferIsFunction, {
  valid: ['isFunction(value);', 'typeof value === "object";'],
  invalid: [
    {
      code: 'typeof value === "function";',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'const callable: boolean = "function" === typeof value;',
      errors: [{ messageId: 'preferIsFunction' }],
    },
  ],
});
