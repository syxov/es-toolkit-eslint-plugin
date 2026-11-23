import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsBrowser } from '../../src/rules/prefer-is-browser.js';

const ruleTester = new RuleTester();

const errors = [{ messageId: 'preferIsBrowser' as const }];
const pairOnly: [{ reportLoneWindowCheck: boolean }] = [
  { reportLoneWindowCheck: false },
];

ruleTester.run('prefer-is-browser', preferIsBrowser, {
  valid: [
    'isBrowser();',
    '!isBrowser();',
    // `document` alone, other globals, other `typeof` results.
    "typeof document !== 'undefined';",
    "typeof document === 'undefined';",
    "typeof self !== 'undefined';",
    "typeof window === 'object';",
    "typeof window !== 'function';",
    "typeof window.document !== 'undefined';",
    "typeof window.matchMedia === 'function';",
    // Reading an undeclared `window` throws; that is not a feature test.
    'window !== undefined;',
    // A `window` binding of the code's own is not the global.
    "const window = getWindow(); typeof window !== 'undefined';",
    "function f(window) { return typeof window !== 'undefined'; }",
    "import { window } from './env'; typeof window === 'undefined';",
    // A global-object lookup that falls back to other globals: `globalThis` is the rewrite.
    "const root = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' ? self : Function('return this')();",
    "const root = typeof window !== 'undefined' ? window : global;",
    "const root = typeof window === 'undefined' ? globalThis : window;",
    // A test assertion.
    "expect(typeof window !== 'undefined').toBe(true);",
    // The code already has its own `isBrowser`.
    "const isBrowser = typeof window !== 'undefined';",
    "const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';",
    // With `reportLoneWindowCheck: false` only window + document pairs are reported.
    { code: "typeof window !== 'undefined';", options: pairOnly },
    { code: "typeof window === 'undefined';", options: pairOnly },
    {
      code: "typeof window !== 'undefined' && window.localStorage.getItem('k');",
      options: pairOnly,
    },
    {
      code: "typeof window !== 'undefined' || typeof document !== 'undefined';",
      options: pairOnly,
    },
    {
      code: "typeof window !== 'undefined' && typeof document === 'undefined';",
      options: pairOnly,
    },
    {
      code: "typeof window === 'undefined' && !window.document;",
      options: pairOnly,
    },
    {
      code: "typeof window !== 'undefined' && ready && window.document;",
      options: pairOnly,
    },
    {
      code: "typeof window !== 'undefined' && window.navigator;",
      options: pairOnly,
    },
    {
      code: "typeof window !== 'undefined' && other.document;",
      options: pairOnly,
    },
    {
      code: "window.document && typeof window !== 'undefined';",
      options: pairOnly,
    },
  ],
  invalid: [
    // A lone `typeof window` check.
    { code: "typeof window !== 'undefined';", errors },
    {
      code: "const target = typeof window !== 'undefined' ? window : null;",
      errors,
    },
    {
      code: "const storage = typeof window === 'undefined' ? undefined : window;",
      errors,
    },
    { code: "typeof window != 'undefined';", errors },
    { code: "'undefined' !== typeof window;", errors },
    { code: "typeof window === 'undefined';", errors },
    { code: 'typeof window == "undefined";', errors },
    {
      code: "const useEnhancedEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;",
      errors,
    },
    {
      code: "function track() { if (typeof window === 'undefined') return; send(); }",
      errors,
    },
    {
      code: "typeof window !== 'undefined' && window.localStorage.getItem('k');",
      errors,
    },
    {
      code: "typeof window !== 'undefined' || typeof document !== 'undefined';",
      errors,
    },
    {
      code: "declare const window: Window | undefined; const ok: boolean = typeof window !== 'undefined';",
      errors,
    },
    {
      code: "import { isBrowser } from 'es-toolkit'; typeof window !== 'undefined';",
      errors,
    },
    // A window + document pair, reported once for the whole pair.
    {
      code: "typeof window !== 'undefined' && typeof document !== 'undefined';",
      errors: [{ messageId: 'preferIsBrowser', column: 1, endColumn: 65 }],
    },
    {
      code: "typeof document !== 'undefined' && typeof window !== 'undefined';",
      errors,
    },
    { code: "typeof window !== 'undefined' && window.document;", errors },
    { code: "typeof window !== 'undefined' && window?.document;", errors },
    { code: "typeof window !== 'undefined' && !!window.document;", errors },
    {
      code: "typeof window !== 'undefined' && Boolean(window.document);",
      errors,
    },
    {
      code: "typeof window !== 'undefined' && window.document != null;",
      errors,
    },
    {
      code: "typeof window !== 'undefined' && window.document !== undefined;",
      errors,
    },
    {
      code: "typeof window !== 'undefined' && typeof window.document !== 'undefined';",
      errors,
    },
    {
      code: "typeof window === 'undefined' || typeof document === 'undefined';",
      errors,
    },
    { code: "typeof window === 'undefined' || !window.document;", errors },
    {
      code: "typeof window === 'undefined' || window.document == null;",
      errors,
    },
    {
      code: "const canUseDom = !(typeof window !== 'undefined' && window.document && Boolean(window.document.createElement) && window.setTimeout);",
      errors: [{ messageId: 'preferIsBrowser', column: 21, endColumn: 69 }],
    },
    {
      code: "ready && typeof window !== 'undefined' && window.document;",
      errors: [{ messageId: 'preferIsBrowser', column: 10, endColumn: 58 }],
    },
    {
      code: "typeof window !== 'undefined' && typeof document !== 'undefined';",
      options: pairOnly,
      errors,
    },
    {
      code: "function f() { if (typeof window === 'undefined' || !window.document) return null; }",
      options: pairOnly,
      errors,
    },
  ],
});
