import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsBlob } from '../../src/rules/prefer-is-blob.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-is-blob', preferIsBlob, {
  valid: ['isBlob(value);'],
  invalid: [
    { code: 'value instanceof Blob;', errors: [{ messageId: 'preferIsBlob' }] },
  ],
});
