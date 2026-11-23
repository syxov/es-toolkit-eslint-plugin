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
    // `typeof` on an undeclared global is feature detection: `isSymbol(x)` would throw.
    "const tagged = typeof SYMBOL_TAG === 'symbol';",
    'typeof value === "symbol";',
    {
      code: 'typeof process === "symbol";',
      languageOptions: { globals: { process: 'readonly' } },
    },
    'declare const __ENV__: unknown; typeof __ENV__ === "symbol";',
    'declare global { var hook: unknown; } typeof hook === "symbol";',
    // One value tested against several types: a dispatch, not a single check.
    "function f(lockId: unknown) { return typeof lockId !== 'string' && typeof lockId !== 'symbol'; }",
    "function f(key: unknown) { return typeof key === 'function' || typeof key === 'symbol'; }",
    // A test assertion reads better with a matcher such as `toBeTypeOf`.
    "expect(typeof o.fire === 'symbol').toBeTruthy();",
    // The code already has its own `isSymbol`.
    "function f(tokenValue: unknown) { const isSymbol = typeof tokenValue === 'symbol'; return isSymbol; }",
    "import { isSymbol } from './utils'; function f(v: unknown) { return typeof v === 'symbol'; }",
    "export function isSymbol(value: unknown) { return typeof value === 'symbol' && check(value); }",
  ],
  invalid: [
    {
      code: 'let value: unknown; typeof value === "symbol";',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'let value: unknown; typeof value == "symbol";',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'let value: unknown; typeof value !== "symbol";',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'let value: unknown; typeof value != "symbol";',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'let value: unknown; "symbol" === typeof value;',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'let value: unknown; "symbol" != typeof value;',
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
      code: 'import { value } from "./value"; typeof value === "symbol";',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'typeof window.handler === "symbol";',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'import { isSymbol } from "es-toolkit"; let value: unknown; typeof value === "symbol";',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'function f(v: unknown) { return v === null || typeof v === "symbol"; }',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'function f(v: { x: unknown }) { return typeof v === "symbol" || typeof v.x === "string"; }',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'function f(v: unknown) { assert(typeof v === "symbol"); }',
      errors: [{ messageId: 'preferIsSymbol' }],
    },
    {
      code: 'let a: unknown, b: unknown; const both = typeof a === "symbol" && typeof b !== "symbol";',
      errors: [
        { messageId: 'preferIsSymbol' },
        { messageId: 'preferIsSymbol' },
      ],
    },
  ],
});
