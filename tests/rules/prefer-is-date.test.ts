import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsDate } from '../../src/rules/prefer-is-date.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-date', preferIsDate, {
  valid: [
    'isDate(value);',
    'value instanceof Map;',
    'value instanceof DateLike;',
    'value instanceof window.Date;',
    'value instanceof globalThis.Date;',
    'Date instanceof value;',
    'value.constructor === Date;',
    // One value tested against several types: a dispatch, not a single check.
    'value instanceof RegExp || value instanceof Date;',
    "typeof value === 'string' || value instanceof Date;",
    "const kind = value instanceof Date ? 'a' : value instanceof RegExp ? 'b' : 'c';",
    // A test assertion reads better with `toBeInstanceOf`.
    'expect(value instanceof Date).toEqual(true);',
    // The code already has its own `isDate`.
    'const isDate = (value: unknown) => value instanceof Date;',
  ],
  invalid: [
    {
      code: 'import { isDate } from "es-toolkit"; value instanceof Date;',
      errors: [{ messageId: 'preferIsDate' }],
    },
    {
      code: 'value instanceof Date || other instanceof RegExp;',
      errors: [{ messageId: 'preferIsDate' }],
    },
    {
      code: 'value instanceof Date || value === null;',
      errors: [{ messageId: 'preferIsDate' }],
    },
    {
      code: 'value instanceof Date;',
      errors: [{ messageId: 'preferIsDate' }],
    },
    {
      code: '!(value instanceof Date);',
      errors: [{ messageId: 'preferIsDate' }],
    },
    {
      code: 'const ok: boolean = (input as unknown) instanceof Date;',
      errors: [{ messageId: 'preferIsDate' }],
    },
    {
      code: 'function check(value: unknown): void { if (value instanceof Date) use(value); }',
      errors: [{ messageId: 'preferIsDate' }],
    },
  ],
});
