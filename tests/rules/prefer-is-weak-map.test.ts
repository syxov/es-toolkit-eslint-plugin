import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsWeakMap } from '../../src/rules/prefer-is-weak-map.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-weak-map', preferIsWeakMap, {
  valid: [
    'isWeakMap(value);',
    'value instanceof Map;',
    'value instanceof WeakMapLike;',
    'value instanceof window.WeakMap;',
    'value instanceof globalThis.WeakMap;',
    'WeakMap instanceof value;',
    'value.constructor === WeakMap;',
    // One value tested against several types: a dispatch, not a single check.
    'value instanceof WeakSet || value instanceof WeakMap;',
    "typeof value === 'string' || value instanceof WeakMap;",
    "const kind = value instanceof WeakMap ? 'a' : value instanceof WeakSet ? 'b' : 'c';",
    // A test assertion reads better with `toBeInstanceOf`.
    'expect(value instanceof WeakMap).toEqual(true);',
    // The code already has its own `isWeakMap`.
    'const isWeakMap = (value: unknown) => value instanceof WeakMap;',
  ],
  invalid: [
    {
      code: 'import { isWeakMap } from "es-toolkit"; value instanceof WeakMap;',
      errors: [{ messageId: 'preferIsWeakMap' }],
    },
    {
      code: 'value instanceof WeakMap || other instanceof WeakSet;',
      errors: [{ messageId: 'preferIsWeakMap' }],
    },
    {
      code: 'value instanceof WeakMap || value === null;',
      errors: [{ messageId: 'preferIsWeakMap' }],
    },
    {
      code: 'value instanceof WeakMap;',
      errors: [{ messageId: 'preferIsWeakMap' }],
    },
    {
      code: '!(value instanceof WeakMap);',
      errors: [{ messageId: 'preferIsWeakMap' }],
    },
    {
      code: 'const ok: boolean = (input as unknown) instanceof WeakMap;',
      errors: [{ messageId: 'preferIsWeakMap' }],
    },
    {
      code: 'function check(value: unknown): void { if (value instanceof WeakMap) use(value); }',
      errors: [{ messageId: 'preferIsWeakMap' }],
    },
  ],
});
