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
    'fn(x => x.id);',
    'fn(x => -x);',
    'fn(x => y);',
    'fn(x => { return y; });',
    'fn(x => { x; });',
    'fn(x => { log(x); return x; });',
    'fn(x => { return; });',
    // Not exactly one plain identifier parameter.
    'fn((x, y) => x);',
    'fn(() => x);',
    'fn(({ x }) => x);',
    'fn(([x]) => x);',
    'fn((...x) => x);',
    'fn((x = 1) => x);',
    'fn(function (x, y) { return x; });',
    // Async and generator functions do not return the value itself.
    'fn(async x => x);',
    'fn(async function (x) { return x; });',
    'fn(function* (x) { return x; });',
    // A declaration is a named helper, not an inline callback.
    'function id(x) { return x; }',
    // TypeScript: casts and assertions change the result type.
    'fn((x: unknown) => x as string);',
    'fn((x?: number) => x!);',
    'fn((x: T) => <U>x);',
    'fn(<T,>(x: T) => x satisfies T);',
    // A sole `.map` argument copies the collection: drop the map or spread it instead.
    'arr.map(x => x);',
    'arr.map(function (x) { return x; });',
    'expect(view.focusables.map(i => i)).toEqual([a, b]);',
    'Object.values(handlers).map((handler) => handler);',
    // A typed or generic function states a signature that `identity` would not keep.
    'const selectRootState = (state: ChartState<[Signature]>) => state;',
    'export const Identity = (x: number) => x;',
    'const assignable = <Target,>(value: Target) => value;',
    'const id = (x): string => x;',
    'fn(function <T>(x: T): T { return x; });',
    'fn((x: number) => x);',
  ],
  invalid: [
    {
      // A `.map` with a `thisArg` is not a plain copy.
      code: 'arr.map(x => x, ctx);',
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
      code: 'fn((x) => { return x; });',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'fn(function (x) { return x; });',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'fn(function named(x) { return x; });',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'fn(value => (value));',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'function f(arr) { return groupBy(arr, x => x); }',
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
      code: 'arr.filter(x => x).flatMap(y => y);',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'const a = groupBy(arr, x => x), b = list.flatMap(y => y);',
      errors: [
        { messageId: 'preferIdentity' },
        { messageId: 'preferIdentity' },
      ],
    },
    // TypeScript: an untyped parameter takes its type from context.
    {
      code: 'const ids: string[] = (raw as string[]).flatMap(s => s);',
      errors: [{ messageId: 'preferIdentity' }],
    },
    {
      code: 'promise.catch((e) => e);',
      errors: [{ messageId: 'preferIdentity' }],
    },
  ],
});
