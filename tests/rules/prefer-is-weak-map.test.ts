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
  ],
  invalid: [
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
