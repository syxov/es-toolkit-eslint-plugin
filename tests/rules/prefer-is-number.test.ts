import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsNumber } from '../../src/rules/prefer-is-number.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-number', preferIsNumber, {
  valid: [
    'isNumber(value);',
    'typeof value === "string";',
    'typeof value == "number";',
  ],
  invalid: [
    {
      code: 'typeof value === "number";',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: '"number" === typeof value;',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'const valid: boolean = typeof value === "number";',
      errors: [{ messageId: 'preferIsNumber' }],
    },
  ],
});
