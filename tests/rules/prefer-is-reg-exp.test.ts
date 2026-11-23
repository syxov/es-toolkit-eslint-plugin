import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsRegExp } from '../../src/rules/prefer-is-reg-exp.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-reg-exp', preferIsRegExp, {
  valid: [
    'isRegExp(value);',
    'value instanceof Date;',
    'value instanceof RegExpLike;',
    'value instanceof window.RegExp;',
    'value instanceof globalThis.RegExp;',
    'RegExp instanceof value;',
    'value.constructor === RegExp;',
    // One value tested against several types: a dispatch, not a single check.
    'value instanceof Date || value instanceof RegExp;',
    "typeof value === 'string' || value instanceof RegExp;",
    "const kind = value instanceof RegExp ? 'a' : value instanceof Date ? 'b' : 'c';",
    // A test assertion reads better with `toBeInstanceOf`.
    'expect(value instanceof RegExp).toEqual(true);',
    // The code already has its own `isRegExp`.
    'const isRegExp = (value: unknown) => value instanceof RegExp;',
  ],
  invalid: [
    {
      code: 'import { isRegExp } from "es-toolkit"; value instanceof RegExp;',
      errors: [{ messageId: 'preferIsRegExp' }],
    },
    {
      code: 'value instanceof RegExp || other instanceof Date;',
      errors: [{ messageId: 'preferIsRegExp' }],
    },
    {
      code: 'value instanceof RegExp || value === null;',
      errors: [{ messageId: 'preferIsRegExp' }],
    },
    {
      code: 'value instanceof RegExp;',
      errors: [{ messageId: 'preferIsRegExp' }],
    },
    {
      code: '!(value instanceof RegExp);',
      errors: [{ messageId: 'preferIsRegExp' }],
    },
    {
      code: 'const ok: boolean = (input as unknown) instanceof RegExp;',
      errors: [{ messageId: 'preferIsRegExp' }],
    },
    {
      code: 'function check(value: unknown): void { if (value instanceof RegExp) use(value); }',
      errors: [{ messageId: 'preferIsRegExp' }],
    },
  ],
});
