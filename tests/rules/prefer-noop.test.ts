import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferNoop } from '../../src/rules/prefer-noop.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-noop', preferNoop, {
  valid: [
    'promise.catch(noop);',
    "el.addEventListener('click', noop);",
    // The body is not empty.
    '() => { foo(); };',
    '() => { return; };',
    '() => { ; };',
    'fn(function () { return undefined; });',
    // Expression bodies return a value.
    '() => ({});',
    '() => undefined;',
    '() => null;',
    '() => void 0;',
    // Async and generator functions return a promise or an iterator.
    'async () => {};',
    'fn(async function () {});',
    'fn(function* () {});',
    'fn(async function* () {});',
    // Declarations are not inline functions.
    'function f() {}',
    'export default function () {}',
    // Methods, constructors and accessors.
    'class A { m() {} }',
    'class A { static m() {} }',
    'class A { #m() {} }',
    'class A { constructor() {} }',
    'class A { get x() { return 1; } set x(v) {} }',
    'class A { get x() {} }',
    '({ m() {} });',
    '({ set x(v) {} });',
    '({ get x() {} });',
    '({ [key]() {} });',
    // Destructuring and default params are not plain identifiers.
    '({ a }) => {};',
    '([a]) => {};',
    '(a = 1) => {};',
    '(a, { b }) => {};',
    '(...[a]) => {};',
    // TypeScript signatures without a body.
    'abstract class A { abstract m(): void; }',
    'class A { m(): void; m() {} }',
    'declare class A { m(): void; }',
    'interface I { m(): void; }',
    'function f(): void;\nfunction f() {}',
    'const f = ({ a }: Props) => {};',
  ],
  invalid: [
    {
      code: 'promise.catch(() => {});',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: 'fn(() => {});',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: 'const handler = () => {};',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: "el.addEventListener('click', function () {});",
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: "el.addEventListener('click', function onClick() {});",
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: '({ onClick: () => {} });',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: '({ onClick: function () {} });',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: '({ [key]: () => {} });',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: 'function f(cb = () => {}) {}',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: 'new Promise(() => {});',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: 'function f() { return () => {}; }',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: 'export default () => {};',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: '(_err) => {};',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: '(a, b) => {};',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: '(...args) => {};',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: 'fn(function (a, ...rest) {});',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: '() => { /* ignore */ };',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: 'class A { handler = () => {}; }',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: 'class A { handler = function () {}; }',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: 'subscribe(() => {}, () => {});',
      errors: [{ messageId: 'preferNoop' }, { messageId: 'preferNoop' }],
    },
    {
      code: 'const f: () => void = () => {};',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: '(e: Error) => {};',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: '(...args: unknown[]) => {};',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: '(): void => {};',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: 'const f = <T,>(value: T) => {};',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: '(value?: string) => {};',
      errors: [{ messageId: 'preferNoop' }],
    },
    {
      code: 'const cb = (() => {}) as Callback;',
      errors: [{ messageId: 'preferNoop' }],
    },
  ],
});
