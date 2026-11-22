import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsFunction } from '../../src/rules/prefer-is-function.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-function', preferIsFunction, {
  valid: [
    'isFunction(value);',
    '!isFunction(value);',
    'typeof value === "object";',
    'typeof value !== "object";',
    'value === "function";',
    'typeof value === kind;',
    'typeof value === typeof other;',
    'void value === "function";',
  ],
  invalid: [
    {
      code: 'typeof value === "function";',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'typeof value == "function";',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'typeof value !== "function";',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'typeof value != "function";',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: '"function" === typeof value;',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: '"function" != typeof value;',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'if (typeof obj.prop !== "function") throw new TypeError("bad");',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'function check(value: unknown): boolean { return typeof value === "function"; }',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'const both = typeof a === "function" && typeof b !== "function";',
      errors: [
        { messageId: 'preferIsFunction' },
        { messageId: 'preferIsFunction' },
      ],
    },
  ],
});
