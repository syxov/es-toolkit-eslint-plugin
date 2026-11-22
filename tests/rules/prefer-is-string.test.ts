import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsString } from '../../src/rules/prefer-is-string.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-string', preferIsString, {
  valid: [
    'isString(value);',
    '!isString(value);',
    'typeof value === "number";',
    'typeof value !== "number";',
    'value === "string";',
    'typeof value === kind;',
    'typeof value === typeof other;',
    'void value === "string";',
  ],
  invalid: [
    {
      code: 'typeof value === "string";',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'typeof value == "string";',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'typeof value !== "string";',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'typeof value != "string";',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: '"string" === typeof value;',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: '"string" != typeof value;',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'if (typeof obj.prop !== "string") throw new TypeError("bad");',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'function check(value: unknown): boolean { return typeof value === "string"; }',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'const both = typeof a === "string" && typeof b !== "string";',
      errors: [
        { messageId: 'preferIsString' },
        { messageId: 'preferIsString' },
      ],
    },
  ],
});
