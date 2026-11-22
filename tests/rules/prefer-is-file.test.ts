import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsFile } from '../../src/rules/prefer-is-file.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-file', preferIsFile, {
  valid: [
    'isFile(value);',
    'value instanceof Blob;',
    'value instanceof FileLike;',
    'value instanceof window.File;',
    'value instanceof globalThis.File;',
    'File instanceof value;',
    'value.constructor === File;',
  ],
  invalid: [
    {
      code: 'value instanceof File;',
      errors: [{ messageId: 'preferIsFile' }],
    },
    {
      code: '!(value instanceof File);',
      errors: [{ messageId: 'preferIsFile' }],
    },
    {
      code: 'const ok: boolean = (input as unknown) instanceof File;',
      errors: [{ messageId: 'preferIsFile' }],
    },
    {
      code: 'function check(value: unknown): void { if (value instanceof File) use(value); }',
      errors: [{ messageId: 'preferIsFile' }],
    },
  ],
});
