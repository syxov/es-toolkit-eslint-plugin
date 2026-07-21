import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsBoolean } from '../../src/rules/prefer-is-boolean.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-boolean', preferIsBoolean, {
  valid: [
    'isBoolean(value);',
    'typeof value === "string";',
    'typeof value == "boolean";',
  ],
  invalid: [
    {
      code: 'typeof value === "boolean";',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: '"boolean" === typeof value;',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'const valid: boolean = typeof value === "boolean";',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
  ],
});
