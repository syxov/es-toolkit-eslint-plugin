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
    // `typeof` on an undeclared global is feature detection: `isNumber(x)` would throw.
    "const port = typeof PORT === 'number' ? PORT : 80;",
    'typeof value === "number";',
    {
      code: 'typeof process === "number";',
      languageOptions: { globals: { process: 'readonly' } },
    },
    'declare const __ENV__: unknown; typeof __ENV__ === "number";',
    'declare global { var hook: unknown; } typeof hook === "number";',
    // One value tested against several types: a dispatch, not a single check.
    "function f(v: unknown) { return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'; }",
    "function f(v: unknown) { return typeof v === 'number' ? v.toFixed(2) : typeof v === 'string' ? v : ''; }",
    "function cell(value: unknown) { return typeof value === 'number' || typeof value === 'boolean' || value instanceof Date; }",
    // A test assertion reads better with a matcher such as `toBeTypeOf`.
    "expect(typeof o.fire === 'number').toBeTruthy();",
    // The code already has its own `isNumber`.
    "function f(tokenValue: unknown) { const isNumber = typeof tokenValue === 'number'; return isNumber; }",
    "import { isNumber } from './utils'; function f(v: unknown) { return typeof v === 'number'; }",
    "export function isNumber(value: unknown) { return typeof value === 'number' && check(value); }",
  ],
  invalid: [
    {
      code: 'let value: unknown; typeof value === "number";',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'let value: unknown; typeof value == "number";',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'let value: unknown; typeof value !== "number";',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'let value: unknown; typeof value != "number";',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'let value: unknown; "number" === typeof value;',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'let value: unknown; "number" != typeof value;',
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
      code: 'import { value } from "./value"; typeof value === "number";',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'typeof window.handler === "number";',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'import { isNumber } from "es-toolkit"; let value: unknown; typeof value === "number";',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'function f(v: unknown) { return v === null || typeof v === "number"; }',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'function f(v: { x: unknown }) { return typeof v === "number" || typeof v.x === "bigint"; }',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'function f(v: unknown) { assert(typeof v === "number"); }',
      errors: [{ messageId: 'preferIsNumber' }],
    },
    {
      code: 'let a: unknown, b: unknown; const both = typeof a === "number" && typeof b !== "number";',
      errors: [
        { messageId: 'preferIsNumber' },
        { messageId: 'preferIsNumber' },
      ],
    },
  ],
});
