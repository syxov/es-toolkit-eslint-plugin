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
    // One value tested against several types: a dispatch, not a single check.
    'value instanceof String || value instanceof Error;',
    "typeof value === 'string' || value instanceof Error;",
    "const kind = value instanceof Error ? 'a' : value instanceof String ? 'b' : 'c';",
    // A test assertion reads better with `toBeInstanceOf`.
    'expect(value instanceof Error).toEqual(true);',
    // The code already has its own `isError`.
    'const isError = (value: unknown) => value instanceof Error;',
  ],
  invalid: [
    {
      code: 'import { isError } from "es-toolkit"; value instanceof Error;',
      errors: [{ messageId: 'preferIsError' }],
    },
    {
      code: 'value instanceof Error || other instanceof String;',
      errors: [{ messageId: 'preferIsError' }],
    },
    {
      code: 'value instanceof Error || value === null;',
      errors: [{ messageId: 'preferIsError' }],
    },
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
