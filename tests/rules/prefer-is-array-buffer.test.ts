import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsArrayBuffer } from '../../src/rules/prefer-is-array-buffer.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-array-buffer', preferIsArrayBuffer, {
  valid: [
    'isArrayBuffer(value);',
    'value instanceof Map;',
    'value instanceof ArrayBufferLike;',
    'value instanceof window.ArrayBuffer;',
    'value instanceof globalThis.ArrayBuffer;',
    'ArrayBuffer instanceof value;',
    'value.constructor === ArrayBuffer;',
  ],
  invalid: [
    {
      code: 'value instanceof ArrayBuffer;',
      errors: [{ messageId: 'preferIsArrayBuffer' }],
    },
    {
      code: '!(value instanceof ArrayBuffer);',
      errors: [{ messageId: 'preferIsArrayBuffer' }],
    },
    {
      code: 'const ok: boolean = (input as unknown) instanceof ArrayBuffer;',
      errors: [{ messageId: 'preferIsArrayBuffer' }],
    },
    {
      code: 'function check(value: unknown): void { if (value instanceof ArrayBuffer) use(value); }',
      errors: [{ messageId: 'preferIsArrayBuffer' }],
    },
  ],
});
