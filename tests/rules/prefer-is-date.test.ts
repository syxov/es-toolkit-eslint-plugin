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
  ],
  invalid: [
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
