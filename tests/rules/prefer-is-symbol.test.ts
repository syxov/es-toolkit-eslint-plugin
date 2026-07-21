import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsSymbol } from '../../src/rules/prefer-is-symbol.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-symbol', preferIsSymbol, {
  valid: [
    'isSymbol(value);',
    'typeof value === "string";',
    'typeof value == "symbol";',
  ],
  invalid: [
    {
      code: 'typeof value === "symbol";',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: '"symbol" === typeof value;',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'const valid: boolean = typeof value === "symbol";',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
  ],
});
