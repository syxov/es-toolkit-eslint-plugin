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
  ],
  invalid: [
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
