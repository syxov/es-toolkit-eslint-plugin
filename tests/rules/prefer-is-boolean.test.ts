import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsBoolean } from '../../src/rules/prefer-is-boolean.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-boolean', preferIsBoolean, {
  valid: [
    'isBoolean(value);',
    '!isBoolean(value);',
    'typeof value === "string";',
    'typeof value !== "string";',
    'value === "boolean";',
    'typeof value === kind;',
    'typeof value === typeof other;',
    'void value === "boolean";',
  ],
  invalid: [
    {
      code: 'typeof value === "boolean";',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'typeof value == "boolean";',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'typeof value !== "boolean";',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'typeof value != "boolean";',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: '"boolean" === typeof value;',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: '"boolean" != typeof value;',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'if (typeof obj.prop !== "boolean") throw new TypeError("bad");',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'function check(value: unknown): boolean { return typeof value === "boolean"; }',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'const both = typeof a === "boolean" && typeof b !== "boolean";',
      errors: [
        { messageId: 'preferIsBoolean' },
        { messageId: 'preferIsBoolean' },
      ],
    },
  ],
});
