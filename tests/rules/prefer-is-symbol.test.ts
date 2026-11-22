import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsSymbol } from '../../src/rules/prefer-is-symbol.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-symbol', preferIsSymbol, {
  valid: [
    'isSymbol(value);',
    '!isSymbol(value);',
    'typeof value === "string";',
    'typeof value !== "string";',
    'value === "symbol";',
    'typeof value === kind;',
    'typeof value === typeof other;',
    'void value === "symbol";',
  ],
  invalid: [
    {
      code: 'typeof value === "symbol";',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'typeof value == "symbol";',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'typeof value !== "symbol";',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'typeof value != "symbol";',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: '"symbol" === typeof value;',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: '"symbol" != typeof value;',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'if (typeof obj.prop !== "symbol") throw new TypeError("bad");',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'function check(value: unknown): boolean { return typeof value === "symbol"; }',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'const both = typeof a === "symbol" && typeof b !== "symbol";',
      errors: [
        { messageId: 'preferIsSymbol' },
        { messageId: 'preferIsSymbol' },
      ],
    },
  ],
});
