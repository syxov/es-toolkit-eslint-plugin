import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsNotNil } from '../../src/rules/prefer-is-not-nil.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-not-nil', preferIsNotNil, {
  valid: [
    'isNotNil(value);',
    'value !== null;',
    'value !== undefined;',
    'value == null;',
    "value != 'null';",
    "value != 'undefined';",
    'value != void 1;',
    "typeof value != 'undefined';",
    'value === null || value === undefined;',
    'value !== null && other !== undefined;',
    'value.a !== null && value.b !== undefined;',
    'value !== null || value !== undefined;',
    'value !== null && value === undefined;',
    'value !== null && value !== null;',
    "value !== null && typeof other !== 'undefined';",
    'value !== null && ready && value !== undefined;',
    'value !== null ?? value !== undefined;',
    // An object probe: on `unknown`, `isNotNil` would not narrow for the probe that follows.
    "const fill = entry != null && typeof entry === 'object' && 'fill' in entry;",
    "function f(input: unknown) { return input != null && typeof input === 'object' && '_tag' in input; }",
    "const deep = dst !== undefined && dst !== null && typeof dst === 'object';",
    "const shown = value != null && !(typeof value === 'object' && 'hidden' in value);",
    // `??` and `?.` express these.
    'const v = x != null ? x : d;',
    'const v = x != null ? x.y : undefined;',
    'const v = x !== null && x !== undefined ? x : d;',
    // An assignment in the test.
    'while ((node = node.parent) != null) visit(node);',
    // A test assertion, and a local `isNotNil` helper.
    'expect(x != null).toBe(true);',
    'export function isNotNil<T>(value: T): value is NonNullable<T> { return value != null; }',
  ],
  invalid: [
    {
      code: "const ok = x != null && typeof y === 'object';",
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'if (x != null) x = 1;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'const v = x != null ? x.y : fallback;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    { code: 'value != null;', errors: [{ messageId: 'preferIsNotNil' }] },
    { code: 'null != value;', errors: [{ messageId: 'preferIsNotNil' }] },
    { code: 'value != undefined;', errors: [{ messageId: 'preferIsNotNil' }] },
    { code: 'undefined != value;', errors: [{ messageId: 'preferIsNotNil' }] },
    { code: 'value != void 0;', errors: [{ messageId: 'preferIsNotNil' }] },
    {
      code: 'const present: boolean = value != null;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'value !== null && value !== undefined;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'value !== undefined && value !== null;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'null !== value && undefined !== value;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'value !== void 0 && value !== null;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: "let value: unknown; value !== null && typeof value !== 'undefined';",
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: "let value: unknown; 'undefined' != typeof value && null !== value;",
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'obj.items[0] !== null && obj.items[0] !== undefined;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'ready && value !== null && value !== undefined;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'value !== null && value !== undefined && ready;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'items.filter(x => x !== null && x !== undefined);',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'function present<T>(x: T | null | undefined): x is T { return x !== null && x !== undefined; }',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
  ],
});
