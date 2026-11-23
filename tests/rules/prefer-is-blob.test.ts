import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsBlob } from '../../src/rules/prefer-is-blob.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-blob', preferIsBlob, {
  valid: [
    'isBlob(value);',
    'value instanceof File;',
    'value instanceof BlobLike;',
    'value instanceof window.Blob;',
    'value instanceof globalThis.Blob;',
    'Blob instanceof value;',
    'value.constructor === Blob;',
    // One value tested against several types: a dispatch, not a single check.
    'value instanceof File || value instanceof Blob;',
    "typeof value === 'string' || value instanceof Blob;",
    "const kind = value instanceof Blob ? 'a' : value instanceof File ? 'b' : 'c';",
    // A test assertion reads better with `toBeInstanceOf`.
    'expect(value instanceof Blob).toEqual(true);',
    // The code already has its own `isBlob`.
    'const isBlob = (value: unknown) => value instanceof Blob;',
  ],
  invalid: [
    {
      code: 'import { isBlob } from "es-toolkit"; value instanceof Blob;',
      errors: [{ messageId: 'preferIsBlob' }],
    },
    {
      code: 'value instanceof Blob || other instanceof File;',
      errors: [{ messageId: 'preferIsBlob' }],
    },
    {
      code: 'value instanceof Blob || value === null;',
      errors: [{ messageId: 'preferIsBlob' }],
    },
    {
      code: 'value instanceof Blob;',
      errors: [{ messageId: 'preferIsBlob' }],
    },
    {
      code: '!(value instanceof Blob);',
      errors: [{ messageId: 'preferIsBlob' }],
    },
    {
      code: 'const ok: boolean = (input as unknown) instanceof Blob;',
      errors: [{ messageId: 'preferIsBlob' }],
    },
    {
      code: 'function check(value: unknown): void { if (value instanceof Blob) use(value); }',
      errors: [{ messageId: 'preferIsBlob' }],
    },
  ],
});
