import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferRange } from '../../src/rules/prefer-range.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-range', preferRange, {
  valid: [
    'range(5);',
    'Array.from({ length: n });',
    'Array.from({ length: n }, (_, i) => i * 2);',
    'Array.from({ length: n }, (_, i) => _);',
    'Array.from({ length: n }, (x) => x);',
    'Array.from({ length: n }, (_, i, extra) => i);',
    'Array.from({ length: n }, function (_, i) { log(i); return i; });',
    'Array.from({ length: n }, function (_, i) { return; });',
    'Array.from({ length: n }, (_, i) => { i; });',
    'Array.from({ length: n }, (_, i) => {});',
    'Array.from({ length: n }, ([a], { i }) => i);',
    'Array.from({ size: n }, (_, i) => i);',
    'Array.from(iterable, (x) => x);',
    '[...arr.keys()];',
    // `.map` over a sized array, but not returning the index.
    'Array.from({ length: n }).map((_, i) => i + 1);',
    'Array.from({ length: n }).map(x => x);',
    'Array.from({ length: n }).map((_, i) => i, thisArg);',
    '[...Array(n)].map((_, i) => _);',
    '[...Array(n), x].map((_, i) => i);',
    '[...Array(a, b)].map((_, i) => i);',
    '[...arr].map((_, i) => i);',
    '[Array(n)].map((_, i) => i);',
    'Array(n).fill(0).map((_, i) => i * i);',
    'Array(n).fill(0, 2).map((_, i) => i);',
    'arr.fill(0).map((_, i) => i);',
    'Array(n).map((_, i) => i);',
    'Array(n).keys().map((_, i) => i);',
  ],
  invalid: [
    {
      code: 'Array.from({ length: n }, (_, i) => i);',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: 'Array.from({ length: 10 }, (_, i) => i);',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: 'Array.from({ length: n }, function (_, i) { return i; });',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: 'Array.from({ length: n }, (_, i) => { return i; });',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: '[...Array(n).keys()];',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: 'const idx: number[] = Array.from({ length: count }, (_, i) => i);',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: 'Array.from({ length: n }, (_: unknown, i: number) => i);',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: 'Array.from({ length: n }).map((_, i) => i);',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: 'Array.from({ length: n }).map(function (_, index) { return index; });',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: '[...Array(n)].map((_, i) => i);',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: '[...new Array(n)].map((_, i) => i);',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: 'Array(n).fill(0).map((_, i) => i);',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: 'Array(n).fill().map((_, i) => i);',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: 'new Array(n).fill(null).map((_, i) => i);',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: 'const ids: number[] = new Array<number>(count).fill(0).map((_, i: number) => i);',
      errors: [{ messageId: 'preferRange' }],
    },
  ],
});
