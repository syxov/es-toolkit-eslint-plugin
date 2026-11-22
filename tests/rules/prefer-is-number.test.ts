import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsNumber } from '../../src/rules/prefer-is-number.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-number', preferIsNumber, {
  valid: [
    'isNumber(value);',
    '!isNumber(value);',
    'typeof value === "bigint";',
    'typeof value !== "bigint";',
    'value === "number";',
    'typeof value === kind;',
    'typeof value === typeof other;',
    'void value === "number";',
  ],
  invalid: [
    {
      code: 'typeof value === "number";',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'typeof value == "number";',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'typeof value !== "number";',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'typeof value != "number";',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: '"number" === typeof value;',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: '"number" != typeof value;',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'if (typeof obj.prop !== "number") throw new TypeError("bad");',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'function check(value: unknown): boolean { return typeof value === "number"; }',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'const both = typeof a === "number" && typeof b !== "number";',
      errors: [
        { messageId: 'preferIsNumber' },
        { messageId: 'preferIsNumber' },
      ],
    },
  ],
});
