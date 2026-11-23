import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsWeakSet } from '../../src/rules/prefer-is-weak-set.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-weak-set', preferIsWeakSet, {
  valid: [
    'isWeakSet(value);',
    'value instanceof Set;',
    'value instanceof WeakSetLike;',
    'value instanceof window.WeakSet;',
    'value instanceof globalThis.WeakSet;',
    'WeakSet instanceof value;',
    'value.constructor === WeakSet;',
    // One value tested against several types: a dispatch, not a single check.
    'value instanceof WeakMap || value instanceof WeakSet;',
    "typeof value === 'string' || value instanceof WeakSet;",
    "const kind = value instanceof WeakSet ? 'a' : value instanceof WeakMap ? 'b' : 'c';",
    // A test assertion reads better with `toBeInstanceOf`.
    'expect(value instanceof WeakSet).toEqual(true);',
    // The code already has its own `isWeakSet`.
    'const isWeakSet = (value: unknown) => value instanceof WeakSet;',
  ],
  invalid: [
    {
      code: 'import { isWeakSet } from "es-toolkit"; value instanceof WeakSet;',
      errors: [{ messageId: 'preferIsWeakSet' }],
    },
    {
      code: 'value instanceof WeakSet || other instanceof WeakMap;',
      errors: [{ messageId: 'preferIsWeakSet' }],
    },
    {
      code: 'value instanceof WeakSet || value === null;',
      errors: [{ messageId: 'preferIsWeakSet' }],
    },
    {
      code: 'value instanceof WeakSet;',
      errors: [{ messageId: 'preferIsWeakSet' }],
    },
    {
      code: '!(value instanceof WeakSet);',
      errors: [{ messageId: 'preferIsWeakSet' }],
    },
    {
      code: 'const ok: boolean = (input as unknown) instanceof WeakSet;',
      errors: [{ messageId: 'preferIsWeakSet' }],
    },
    {
      code: 'function check(value: unknown): void { if (value instanceof WeakSet) use(value); }',
      errors: [{ messageId: 'preferIsWeakSet' }],
    },
  ],
});
