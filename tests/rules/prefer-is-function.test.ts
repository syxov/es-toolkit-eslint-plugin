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
    // `typeof` on an undeclared global is feature detection: `isFunction(x)` would throw.
    "if (typeof requestAnimationFrame !== 'function') schedule();",
    "const clone = typeof structuredClone === 'function' ? structuredClone : copy;",
    "if (typeof require === 'function') load();",
    'typeof value === "function";',
    {
      code: 'typeof process === "function";',
      languageOptions: { globals: { process: 'readonly' } },
    },
    'declare const __ENV__: unknown; typeof __ENV__ === "function";',
    'declare global { var hook: unknown; } typeof hook === "function";',
    // One value tested against several types: a dispatch, not a single check.
    "function f(value: unknown) { return typeof value === 'object' || typeof value === 'function'; }",
    "function f(key: unknown) { return typeof key === 'function' || typeof key === 'symbol'; }",
    "function f(v: unknown) { if (!(typeof v === 'function' || typeof v === 'string')) throw v; }",
    // A test assertion reads better with a matcher such as `toBeTypeOf`.
    "expect(typeof o.fire === 'function').toBeTruthy();",
    // The code already has its own `isFunction`.
    "function f(tokenValue: unknown) { const isFunction = typeof tokenValue === 'function'; return isFunction; }",
    "import { isFunction } from './utils'; function f(v: unknown) { return typeof v === 'function'; }",
    "export function isFunction(value: unknown) { return typeof value === 'function' && check(value); }",
  ],
  invalid: [
    {
      code: 'let value: unknown; typeof value === "function";',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'let value: unknown; typeof value == "function";',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'let value: unknown; typeof value !== "function";',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'let value: unknown; typeof value != "function";',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'let value: unknown; "function" === typeof value;',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'let value: unknown; "function" != typeof value;',
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
      code: 'import { value } from "./value"; typeof value === "function";',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'typeof window.handler === "function";',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'import { isFunction } from "es-toolkit"; let value: unknown; typeof value === "function";',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'function f(v: unknown) { return v === null || typeof v === "function"; }',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'function f(v: { x: unknown }) { return typeof v === "function" || typeof v.x === "object"; }',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'function f(v: unknown) { assert(typeof v === "function"); }',
      errors: [{ messageId: 'preferIsFunction' }],
    },
    {
      code: 'let a: unknown, b: unknown; const both = typeof a === "function" && typeof b !== "function";',
      errors: [
        { messageId: 'preferIsFunction' },
        { messageId: 'preferIsFunction' },
      ],
    },
  ],
});
