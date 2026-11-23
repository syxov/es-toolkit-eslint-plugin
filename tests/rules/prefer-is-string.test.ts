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
    // `typeof` on an undeclared global is feature detection: `isString(x)` would throw.
    "const dir = typeof __dirname === 'string' ? __dirname : cwd();",
    'typeof value === "string";',
    {
      code: 'typeof process === "string";',
      languageOptions: { globals: { process: 'readonly' } },
    },
    'declare const __ENV__: unknown; typeof __ENV__ === "string";',
    'declare global { var hook: unknown; } typeof hook === "string";',
    // One value tested against several types: a dispatch, not a single check.
    "function f(v: unknown) { return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'; }",
    "function f(v: unknown) { return typeof v === 'number' ? v.toFixed(2) : typeof v === 'string' ? v : ''; }",
    "function f(lockId: unknown) { return typeof lockId !== 'string' && typeof lockId !== 'symbol'; }",
    "function f(val: unknown) { return isNullish(val) || typeof val === 'string' || (typeof val === 'number' && val > 0); }",
    // A test assertion reads better with a matcher such as `toBeTypeOf`.
    "expect(typeof o.fire === 'string').toBeTruthy();",
    // The code already has its own `isString`.
    "function f(tokenValue: unknown) { const isString = typeof tokenValue === 'string'; return isString; }",
    "import { isString } from './utils'; function f(v: unknown) { return typeof v === 'string'; }",
    "export function isString(value: unknown) { return typeof value === 'string' && check(value); }",
  ],
  invalid: [
    {
      code: 'let value: unknown; typeof value === "string";',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'let value: unknown; typeof value == "string";',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'let value: unknown; typeof value !== "string";',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'let value: unknown; typeof value != "string";',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'let value: unknown; "string" === typeof value;',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'let value: unknown; "string" != typeof value;',
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
      code: 'import { value } from "./value"; typeof value === "string";',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'typeof window.handler === "string";',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'import { isString } from "es-toolkit"; let value: unknown; typeof value === "string";',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'function f(v: unknown) { return v === null || typeof v === "string"; }',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'function f(v: { x: unknown }) { return typeof v === "string" || typeof v.x === "number"; }',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'function f(v: unknown) { assert(typeof v === "string"); }',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'let a: unknown, b: unknown; const both = typeof a === "string" && typeof b !== "string";',
      errors: [
        { messageId: 'preferIsString' },
        { messageId: 'preferIsString' },
      ],
    },
  ],
});
