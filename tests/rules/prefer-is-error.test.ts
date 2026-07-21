import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsError } from '../../src/rules/prefer-is-error.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-is-error', preferIsError, {
  valid: ['isError(value);', 'value instanceof TypeError;'],
  invalid: [
    {
      code: 'value instanceof Error;',
      errors: [{ messageId: 'preferIsError' }],
    },
  ],
});
