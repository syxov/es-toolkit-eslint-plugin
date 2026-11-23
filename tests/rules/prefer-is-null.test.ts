import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsNull } from '../../src/rules/prefer-is-null.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-null', preferIsNull, {
  valid: [
    'isNull(value);',
    '!isNull(value);',
    'value == null;',
    'null != value;',
    'value === undefined;',
    "value === 'null';",
    "'null' !== value;",
    'value === nullish;',
    // Halves of a nil pair belong to prefer-is-nil / prefer-is-not-nil.
    'value === null || value === undefined;',
    'value === undefined || null === value;',
    'value !== null && value !== undefined;',
    "value === null || typeof value === 'undefined';",
    "typeof value !== 'undefined' && value !== null;",
    'value === null || value === void 0;',
    'ready || value === null || value === undefined;',
    'value === null || value === undefined || ready;',
    'a || value === null || value === undefined || b;',
    // An object probe (`isObjectLike`), not a null check of its own.
    "if (typeof environment === 'object' && environment !== null) use(environment);",
    "const plain = typeof value === 'object' && value !== null && !Array.isArray(value);",
    "if (typeof options !== 'object' || options === null) throw new TypeError('options');",
    "function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }",
    "const callable = (typeof x === 'object' || typeof x === 'function') && x !== null;",
    "const tagged = x !== null && 'tag' in x;",
    // `??`, `??=` and `?.` express these.
    'const v = value === null ? undefined : value;',
    'if (state.eventEmitter === null) state.eventEmitter = create();',
    "const s = value === null ? null : value.format('L');",
    // An assignment in the test.
    'while ((match = re.exec(text)) !== null) use(match);',
    // A test assertion, and a local `isNull` helper.
    'expect(x === null).toBe(true);',
    'function isNull(v: unknown) { return v === null; }',
  ],
  invalid: [
    {
      code: "if (typeof other === 'object' && value !== null) use(value);",
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'const v = x === null ? fallback : y;',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'while (match !== null) match = next();',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: "const v = x === null ? 'none' : x.name;",
      errors: [{ messageId: 'preferIsNull' }],
    },
    // TypeScript infers the same type predicate from `x => !isNull(x)`.
    {
      code: 'arr.filter(x => x !== null);',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'arr.filter((item: string | null) => null !== item);',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'arr.filter(x => x === null);',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'arr.filter(x => other !== null);',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'arr.filter(x => x.value !== null);',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'arr.find(x => x !== null);',
      errors: [{ messageId: 'preferIsNull' }],
    },
    { code: 'value === null;', errors: [{ messageId: 'preferIsNull' }] },
    { code: 'null === value;', errors: [{ messageId: 'preferIsNull' }] },
    { code: 'value !== null;', errors: [{ messageId: 'preferIsNull' }] },
    { code: 'null !== value;', errors: [{ messageId: 'preferIsNull' }] },
    {
      code: 'const empty: boolean = value === null;',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'function present(x: string | null): boolean { return x !== null; }',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'value === null || other === undefined;',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'value === null && value === undefined;',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'value === null || value !== undefined;',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'value === null || value == undefined;',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'value === null || ready || value === undefined;',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'a === null || b === null;',
      errors: [{ messageId: 'preferIsNull' }, { messageId: 'preferIsNull' }],
    },
  ],
});
