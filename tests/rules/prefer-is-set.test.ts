import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsSet } from '../../src/rules/prefer-is-set.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-set', preferIsSet, {
  valid: [
    'isSet(value);',
    'value instanceof Map;',
    'value instanceof SetLike;',
    'value instanceof window.Set;',
    'value instanceof globalThis.Set;',
    'Set instanceof value;',
    'value.constructor === Set;',
    // One value tested against several types: a dispatch, not a single check.
    'value instanceof Map || value instanceof Set;',
    "typeof value === 'string' || value instanceof Set;",
    "const kind = value instanceof Set ? 'a' : value instanceof Map ? 'b' : 'c';",
    // A test assertion reads better with `toBeInstanceOf`.
    'expect(value instanceof Set).toEqual(true);',
    // The code already has its own `isSet`.
    'const isSet = (value: unknown) => value instanceof Set;',
  ],
  invalid: [
    {
      code: 'import { isSet } from "es-toolkit"; value instanceof Set;',
      errors: [{ messageId: 'preferIsSet' }],
    },
    {
      code: 'value instanceof Set || other instanceof Map;',
      errors: [{ messageId: 'preferIsSet' }],
    },
    {
      code: 'value instanceof Set || value === null;',
      errors: [{ messageId: 'preferIsSet' }],
    },
    {
      code: 'value instanceof Set;',
      errors: [{ messageId: 'preferIsSet' }],
    },
    {
      code: '!(value instanceof Set);',
      errors: [{ messageId: 'preferIsSet' }],
    },
    {
      code: 'const ok: boolean = (input as unknown) instanceof Set;',
      errors: [{ messageId: 'preferIsSet' }],
    },
    {
      code: 'function check(value: unknown): void { if (value instanceof Set) use(value); }',
      errors: [{ messageId: 'preferIsSet' }],
    },
  ],
});
