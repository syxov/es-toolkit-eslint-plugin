import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIdentity } from '../../src/rules/prefer-identity.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-identity', preferIdentity, {
  valid: [
    // Methods and setters are not inline callbacks.
    'class A { id(x) { return x; } }',
    '({ id(x) { return x; } });',
    '({ set v(x) { return x; } });',
    'arr.map(identity);',
    'groupBy(arr, identity);',
    // The sole `.filter` argument is a truthiness filter, owned by prefer-compact.
    'arr.filter(x => x);',
    'arr.filter(function (x) { return x; });',
    'arr.filter(x => { return x; });',
    'arr.filter((x: number) => x);',
    'items.filter(x => x).map(f);',
    // The body is not the parameter itself.
    'arr.map(x => x.id);',
    'arr.map(x => -x);',
    'arr.map(x => y);',
    'arr.map(x => { return y; });',
    'arr.map(x => { x; });',
    'arr.map(x => { log(x); return x; });',
    'arr.map(x => { return; });',
    // Not exactly one plain identifier parameter.
    'arr.map((x, y) => x);',
    'arr.map(() => x);',
    'arr.map(({ x }) => x);',
    'arr.map(([x]) => x);',
    'arr.map((...x) => x);',
    'arr.map((x = 1) => x);',
    'arr.map(function (x, y) { return x; });',
    // Async and generator functions do not return the value itself.
    'arr.map(async x => x);',
    'arr.map(async function (x) { return x; });',
    'arr.map(function* (x) { return x; });',
    // A declaration is a named helper, not an inline callback.
    'function id(x) { return x; }',
    // TypeScript: casts and assertions change the result type.
    'arr.map((x: unknown) => x as string);',
    'arr.map((x?: number) => x!);',
    'arr.map((x: T) => <U>x);',
    'arr.map(<T,>(x: T) => x satisfies T);',
  ],
  invalid: [
    {
      code: 'arr.map(x => x);',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'arr.flatMap(x => x);',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'groupBy(arr, x => x);',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'fn(x => x);',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'const id = x => x;',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'arr.map((x) => { return x; });',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'arr.map(function (x) { return x; });',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'arr.map(function named(x) { return x; });',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'arr.map(value => (value));',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'function f(arr) { return arr.map(x => x); }',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'function f(cb = x => x) {}',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'promise.then(x => x);',
      errors: [{ messageId: 'preferIdentity' }],
    },
    // Only the sole `.filter` argument is skipped, not identities nested in it.
    {
      code: 'arr.filter(x => x.some(y => y));',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'arr.filter(x => x).map(y => y);',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'const a = arr.map(x => x), b = list.flatMap(y => y);',
      errors: [
        { messageId: 'preferIdentity' },
        { messageId: 'preferIdentity' },
      ],
    },
    // TypeScript
    {
      code: 'arr.map((x: number) => x);',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'const id = <T,>(x: T): T => x;',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'arr.map(function <T>(x: T): T { return x; });',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'const ids: string[] = (raw as string[]).map((s: string) => s);',
      errors: [{ messageId: 'preferIdentity' }],
    },
  ],
});
