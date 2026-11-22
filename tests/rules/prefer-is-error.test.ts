import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsError } from '../../src/rules/prefer-is-error.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-error', preferIsError, {
  valid: [
    'isError(value);',
    'value instanceof Map;',
    'value instanceof ErrorLike;',
    'value instanceof window.Error;',
    'value instanceof globalThis.Error;',
    'Error instanceof value;',
    'value.constructor === Error;',
    'value instanceof TypeError;',
    'e instanceof RangeError;',
  ],
  invalid: [
    {
      code: 'value instanceof Error;',
      errors: [{ messageId: 'preferIsError' }],
    },
    {
      code: '!(value instanceof Error);',
      errors: [{ messageId: 'preferIsError' }],
    },
    {
      code: 'const ok: boolean = (input as unknown) instanceof Error;',
      errors: [{ messageId: 'preferIsError' }],
    },
    {
      code: 'function check(value: unknown): void { if (value instanceof Error) use(value); }',
      errors: [{ messageId: 'preferIsError' }],
    },
  ],
});
