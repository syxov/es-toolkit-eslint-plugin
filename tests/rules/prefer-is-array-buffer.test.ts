import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsArrayBuffer } from '../../src/rules/prefer-is-array-buffer.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-is-array-buffer', preferIsArrayBuffer, {
  valid: ['isArrayBuffer(value);'],
  invalid: [
    {
      code: 'value instanceof ArrayBuffer;',
      errors: [{ messageId: 'preferIsArrayBuffer' }],
    },
  ],
});
