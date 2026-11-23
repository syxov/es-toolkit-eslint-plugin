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
    // One value tested against several types: a dispatch, not a single check.
    'value instanceof SharedArrayBuffer || value instanceof ArrayBuffer;',
    "typeof value === 'string' || value instanceof ArrayBuffer;",
    "const kind = value instanceof ArrayBuffer ? 'a' : value instanceof SharedArrayBuffer ? 'b' : 'c';",
    // A test assertion reads better with `toBeInstanceOf`.
    'expect(value instanceof ArrayBuffer).toEqual(true);',
    // The code already has its own `isArrayBuffer`.
    'const isArrayBuffer = (value: unknown) => value instanceof ArrayBuffer;',
  ],
  invalid: [
    {
      code: 'import { isArrayBuffer } from "es-toolkit"; value instanceof ArrayBuffer;',
      errors: [{ messageId: 'preferIsArrayBuffer' }],
    },
    {
      code: 'value instanceof ArrayBuffer || other instanceof SharedArrayBuffer;',
      errors: [{ messageId: 'preferIsArrayBuffer' }],
    },
    {
      code: 'value instanceof ArrayBuffer || value === null;',
      errors: [{ messageId: 'preferIsArrayBuffer' }],
    },
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
