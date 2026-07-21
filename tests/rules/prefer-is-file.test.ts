import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsFile } from '../../src/rules/prefer-is-file.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-is-file', preferIsFile, {
  valid: ['isFile(value);'],
  invalid: [
    { code: 'value instanceof File;', errors: [{ messageId: 'preferIsFile' }] },
  ],
});
