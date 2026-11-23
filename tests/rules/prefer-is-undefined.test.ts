import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsUndefined } from '../../src/rules/prefer-is-undefined.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-undefined', preferIsUndefined, {
  valid: [
    'isUndefined(value);',
    '!isUndefined(value);',
    'value == undefined;',
    'undefined != value;',
    'value == void 0;',
    'value === null;',
    "value === 'undefined';",
    'value === void 1;',
    "value === void '0';",
    "typeof value === 'string';",
    'typeof value === kind;',
    "void value === 'undefined';",
    // Halves of a nil pair belong to prefer-is-nil / prefer-is-not-nil.
    'value === null || value === undefined;',
    'undefined === value || value === null;',
    'value !== undefined && value !== null;',
    "value === null || typeof value === 'undefined';",
    "typeof value != 'undefined' && null !== value;",
    'value === void 0 || value === null;',
    'ready || value === null || value === undefined;',
    // `typeof` on an undeclared global is feature detection: `isUndefined(x)` would throw.
    "if (typeof ResizeObserver === 'undefined') observe();",
    "const hidden = typeof window === 'undefined' || window.innerHeight < 667;",
    "if (typeof process !== 'undefined' && process.env) read();",
    "typeof value === 'undefined';",
    {
      code: "typeof window === 'undefined';",
      languageOptions: { globals: { window: 'readonly' } },
    },
    "declare const __DEV__: boolean; typeof __DEV__ === 'undefined';",
    "declare global { var hook: unknown; } typeof hook === 'undefined';",
    // One value tested against several types.
    "function f(x: unknown) { return typeof x === 'undefined' || typeof x === 'function'; }",
    "function f(x: unknown) { return typeof x === 'function' || x === undefined; }",
    // `??`, `??=` and `?.` express these.
    'function f(ampm?: boolean) { return { ampm: ampm !== undefined ? ampm : undefined }; }',
    'function f(count?: number) { return count !== undefined ? count : 0; }',
    'const v = options.value === undefined ? !this.value : options.value;',
    "const dir = typeof __dirname !== 'undefined' ? __dirname : cwd();",
    "if (def.class === undefined) { def.class = 'x'; }",
    'function f(x?: number) { if (x === undefined) x = 1; return x; }',
    'const field = next === undefined ? null : next.field;',
    'const n = x === undefined ? undefined : x.f();',
    'const n = x === undefined ? void 0 : x?.a[0].b;',
    // A test assertion, and a local `isUndefined` helper.
    'expect(result === undefined).toBe(true);',
    'const isUndefined = (v: unknown) => v === undefined;',
  ],
  invalid: [
    {
      code: "function f(p?: string) { return typeof p === 'undefined'; }",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "import { x } from 'y'; typeof x === 'undefined';",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "typeof window.foo === 'undefined';",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'const v = x === undefined ? d : y;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'const v = x === undefined ? 0 : x.length;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'const v = x === undefined ? undefined : y.z;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'if (x === undefined) { x = 1; log(); }',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'if (x === undefined) y = 1;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'if (x === undefined) x = 1; else x = 2;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'if (x !== undefined) x = 1;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'assert(x === undefined);',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "import { isUndefined } from 'es-toolkit'; x === undefined;",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "let x: unknown; typeof x === 'undefined' || typeof y === 'function';",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "function f(x: unknown) { return typeof x === 'undefined' || x === 0; }",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    // TypeScript infers the same type predicate from `x => !isUndefined(x)`.
    {
      code: 'arr.filter(x => x !== undefined);',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'arr.filter((item?: string) => void 0 !== item);',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'arr.filter(x => x === undefined);',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "arr.filter(x => typeof x !== 'undefined');",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'arr.filter(x => x.value !== undefined);',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'value === undefined;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'undefined === value;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'value !== undefined;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'undefined !== value;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'value === void 0;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'void 0 !== value;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "let value: unknown; typeof value === 'undefined';",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "let value: unknown; typeof value == 'undefined';",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "let value: unknown; typeof value !== 'undefined';",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "let value: unknown; typeof value != 'undefined';",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "let value: unknown; 'undefined' === typeof value;",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "let value: unknown; 'undefined' != typeof value;",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'const missing: boolean = value === undefined;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'function given(x?: number): boolean { return x !== undefined; }',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'value === null || other === undefined;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'value !== null || value !== undefined;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'value == null || value === undefined;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
  ],
});
