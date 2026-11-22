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
  ],
  invalid: [
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
