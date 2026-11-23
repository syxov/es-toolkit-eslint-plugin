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
    // One value tested against several types: a dispatch, not a single check.
    'value instanceof Blob || value instanceof File;',
    "typeof value === 'string' || value instanceof File;",
    "const kind = value instanceof File ? 'a' : value instanceof Blob ? 'b' : 'c';",
    // A test assertion reads better with `toBeInstanceOf`.
    'expect(value instanceof File).toEqual(true);',
    // The code already has its own `isFile`.
    'const isFile = (value: unknown) => value instanceof File;',
  ],
  invalid: [
    {
      code: 'import { isFile } from "es-toolkit"; value instanceof File;',
      errors: [{ messageId: 'preferIsFile' }],
    },
    {
      code: 'value instanceof File || other instanceof Blob;',
      errors: [{ messageId: 'preferIsFile' }],
    },
    {
      code: 'value instanceof File || value === null;',
      errors: [{ messageId: 'preferIsFile' }],
    },
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
