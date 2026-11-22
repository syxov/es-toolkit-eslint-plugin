import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsTypedArray } from '../../src/rules/prefer-is-typed-array.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-typed-array', preferIsTypedArray, {
  valid: [
    'isTypedArray(value);',
    'ArrayBuffer.isView(value);',
    'ArrayBuffer.isView(a) && !(b instanceof DataView);',
    'ArrayBuffer.isView(value) || !(value instanceof DataView);',
    'ArrayBuffer.isView(value) && value instanceof DataView;',
    'ArrayBuffer.isView(value) && !(value instanceof Uint8Array);',
    'ArrayBuffer.isView(value) && !(value instanceof window.DataView);',
    'ArrayBuffer.isView() && !(value instanceof DataView);',
    'ArrayBuffer.isView(value, extra) && !(value instanceof DataView);',
    'Buffer.isView(value) && !(value instanceof DataView);',
    // Only the first two operands of a longer `&&` chain are matched.
    'ready && ArrayBuffer.isView(value) && !(value instanceof DataView);',
  ],
  invalid: [
    {
      code: 'ArrayBuffer.isView(value) && !(value instanceof DataView);',
      errors: [{ messageId: 'preferIsTypedArray' }],
    },
    {
      code: '!(value instanceof DataView) && ArrayBuffer.isView(value);',
      errors: [{ messageId: 'preferIsTypedArray' }],
    },
    {
      code: 'ArrayBuffer.isView(obj.buf) && !(obj.buf instanceof DataView);',
      errors: [{ messageId: 'preferIsTypedArray' }],
    },
    {
      code: 'ArrayBuffer.isView(value) && !(value instanceof DataView) && ready;',
      errors: [{ messageId: 'preferIsTypedArray' }],
    },
    {
      code: 'function typed(value: unknown): boolean { return ArrayBuffer.isView(value) && !(value instanceof DataView); }',
      errors: [{ messageId: 'preferIsTypedArray' }],
    },
  ],
});
