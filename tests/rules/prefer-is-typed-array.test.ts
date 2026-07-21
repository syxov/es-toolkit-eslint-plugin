import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsTypedArray } from '../../src/rules/prefer-is-typed-array.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-is-typed-array', preferIsTypedArray, {
  valid: ['isTypedArray(value);'],
  invalid: [
    {
      code: 'ArrayBuffer.isView(value) && !(value instanceof DataView);',
      errors: [{ messageId: 'preferIsTypedArray' }],
    },
  ],
});
