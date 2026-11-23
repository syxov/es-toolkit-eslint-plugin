import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsPromise } from '../../src/rules/prefer-is-promise.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-promise', preferIsPromise, {
  valid: [
    'isPromise(value);',
    'value instanceof PromiseLike;',
    'value instanceof PromiseRejectionEvent;',
    'value instanceof window.Promise;',
    'value instanceof globalThis.Promise;',
    'Promise instanceof value;',
    // A thenable check accepts any object with `then`; `isPromise` only real promises.
    "typeof value?.then === 'function';",
    "value && typeof value.then === 'function';",
    'value.constructor === Promise;',
    'Promise.resolve(value) === value;',
    // One value tested against several types: a dispatch, not a single check.
    'value instanceof Promise || value instanceof Error;',
    "const kind = value instanceof Promise ? 'a' : value instanceof Map ? 'b' : 'c';",
    // A test assertion reads better with `toBeInstanceOf`.
    'expect(value instanceof Promise).toBe(true);',
    // The code already has its own `isPromise`.
    'const isPromise = (value: unknown) => value instanceof Promise;',
  ],
  invalid: [
    {
      code: 'value instanceof Promise;',
      errors: [{ messageId: 'preferIsPromise' }],
    },
    {
      code: '!(value instanceof Promise);',
      errors: [{ messageId: 'preferIsPromise' }],
    },
    {
      code: 'if (retVal instanceof Promise) { retVal.then(done); }',
      errors: [{ messageId: 'preferIsPromise' }],
    },
    {
      code: 'const pending = entry && entry.value instanceof Promise;',
      errors: [{ messageId: 'preferIsPromise' }],
    },
    {
      code: 'import { isPromise } from "es-toolkit"; value instanceof Promise;',
      errors: [{ messageId: 'preferIsPromise' }],
    },
    {
      code: 'value instanceof Promise || other instanceof Error;',
      errors: [{ messageId: 'preferIsPromise' }],
    },
    {
      code: 'a instanceof Promise && b instanceof Promise;',
      errors: [
        { messageId: 'preferIsPromise' },
        { messageId: 'preferIsPromise' },
      ],
    },
    {
      code: 'function check(value: unknown): void { if ((value as object) instanceof Promise) use(value); }',
      errors: [{ messageId: 'preferIsPromise' }],
    },
  ],
});
