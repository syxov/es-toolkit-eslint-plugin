import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsBoolean } from '../../src/rules/prefer-is-boolean.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-boolean', preferIsBoolean, {
  valid: [
    'isBoolean(value);',
    '!isBoolean(value);',
    'typeof value === "number";',
    'typeof value !== "number";',
    'value === "boolean";',
    'typeof value === kind;',
    'typeof value === typeof other;',
    'void value === "boolean";',
    // `typeof` on an undeclared global is feature detection: `isBoolean(x)` would throw.
    "const dev = typeof __DEV__ === 'boolean' && __DEV__;",
    'typeof value === "boolean";',
    {
      code: 'typeof process === "boolean";',
      languageOptions: { globals: { process: 'readonly' } },
    },
    'declare const __ENV__: unknown; typeof __ENV__ === "boolean";',
    'declare global { var hook: unknown; } typeof hook === "boolean";',
    // One value tested against several types: a dispatch, not a single check.
    "function f(v: unknown) { return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'; }",
    "function cell(value: unknown) { return typeof value === 'number' || typeof value === 'boolean' || value instanceof Date; }",
    // A test assertion reads better with a matcher such as `toBeTypeOf`.
    "expect(typeof o.fire === 'boolean').toBeTruthy();",
    // The code already has its own `isBoolean`.
    "function f(tokenValue: unknown) { const isBoolean = typeof tokenValue === 'boolean'; return isBoolean; }",
    "import { isBoolean } from './utils'; function f(v: unknown) { return typeof v === 'boolean'; }",
    "export function isBoolean(value: unknown) { return typeof value === 'boolean' && check(value); }",
  ],
  invalid: [
    {
      code: 'let value: unknown; typeof value === "boolean";',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'let value: unknown; typeof value == "boolean";',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'let value: unknown; typeof value !== "boolean";',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'let value: unknown; typeof value != "boolean";',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'let value: unknown; "boolean" === typeof value;',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'let value: unknown; "boolean" != typeof value;',
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
      code: 'import { value } from "./value"; typeof value === "boolean";',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'typeof window.handler === "boolean";',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'import { isBoolean } from "es-toolkit"; let value: unknown; typeof value === "boolean";',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'function f(v: unknown) { return v === null || typeof v === "boolean"; }',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'function f(v: { x: unknown }) { return typeof v === "boolean" || typeof v.x === "number"; }',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'function f(v: unknown) { assert(typeof v === "boolean"); }',
      errors: [{ messageId: 'preferIsBoolean' }],
    },
    {
      code: 'let a: unknown, b: unknown; const both = typeof a === "boolean" && typeof b !== "boolean";',
      errors: [
        { messageId: 'preferIsBoolean' },
        { messageId: 'preferIsBoolean' },
      ],
    },
  ],
});
