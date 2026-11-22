import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferZip } from '../../src/rules/prefer-zip.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-zip', preferZip, {
  valid: [
    'zip(a, b);',
    'zip(a, b, c);',
    // Other elements are not indexed by the bare index parameter.
    'a.map((x, i) => [x, b[i + 1]]);',
    'a.map((x, i) => [x, i]);',
    'a.map((x, i) => [x, b[x]]);',
    'a.map((x, i) => [x, b.i]);',
    'a.map((x, i) => [x, b[j]]);',
    'a.map((x, i) => [x, b[0]]);',
    'a.map((x, i) => [x, b]);',
    'a.map((x, i) => [x, b[i], c]);',
    // The receiver element is not first, or is missing.
    'a.map((x, i) => [b[i], x]);',
    'a.map((_, i) => [b[i], c[i]]);',
    'a.map((_, i) => [c[i], b[i]]);',
    'a.map((x, i) => [i, b[i]]);',
    // `a[i]` as first element must index the receiver itself.
    'a.map((_, i) => [d[i], b[i]]);',
    'a.map((_, i) => [a[0], b[i]]);',
    'a.map((x, i) => [a.x, b[i]]);',
    // Fewer than two elements.
    'a.map((x, i) => [x]);',
    'a.map((x, i) => []);',
    // Wrong parameter count or shape.
    'a.map(x => [x, b[0]]);',
    'a.map((x, i, arr) => [x, b[i]]);',
    'a.map(([x], i) => [x, b[i]]);',
    'a.map((x, i = 0) => [x, b[i]]);',
    'a.map((...args) => [args, b[args]]);',
    // Not an array literal of plain elements.
    'a.map((x, i) => ({ x, y: b[i] }));',
    'a.map((x, i) => [x, ...b[i]]);',
    'a.map((x, i) => [...x, b[i]]);',
    'a.map((x, i) => [x, b[i]].join());',
    // Wrong call shape.
    'a.map((x, i) => [x, b[i]], thisArg);',
    'a.forEach((x, i) => [x, b[i]]);',
    'a.flatMap((x, i) => [x, b[i]]);',
    'a.map(toPair);',
    'map((x, i) => [x, b[i]]);',
    // A block body that does more than return the pair.
    'a.map((x, i) => { log(i); return [x, b[i]]; });',
    'a.map((x, i) => { [x, b[i]]; });',
    'a.map(function (x, i) { log(x); return [x, b[i]]; });',
  ],
  invalid: [
    {
      code: 'a.map((x, i) => [x, b[i]]);',
      errors: [{ messageId: 'preferZip' }],
    },
    {
      code: 'a.map((x, i) => [x, b[i], c[i]]);',
      errors: [{ messageId: 'preferZip' }],
    },
    {
      code: 'a.map((_, i) => [a[i], b[i]]);',
      errors: [{ messageId: 'preferZip' }],
    },
    {
      code: 'keys.map((key, index) => [key, values[index]]);',
      errors: [{ messageId: 'preferZip' }],
    },
    {
      code: 'a.map((x, i) => [x, this.b[i]]);',
      errors: [{ messageId: 'preferZip' }],
    },
    {
      code: 'this.items.map((item, i) => [this.items[i], other[i]]);',
      errors: [{ messageId: 'preferZip' }],
    },
    {
      code: 'a.map((x, i) => [x, getB()[i]]);',
      errors: [{ messageId: 'preferZip' }],
    },
    {
      code: 'a.map(function (x, i) { return [x, b[i]]; });',
      errors: [{ messageId: 'preferZip' }],
    },
    {
      code: 'a.map((x, i) => { return [x, b[i]]; });',
      errors: [{ messageId: 'preferZip' }],
    },
    {
      code: 'Object.fromEntries(keys.map((k, i) => [k, values[i]]));',
      errors: [{ messageId: 'preferZip' }],
    },
    {
      code: 'const pairs = a.map((x, i) => [x, b[i]]);',
      errors: [{ messageId: 'preferZip' }],
    },
    {
      code: 'function pair(a, b) { return a.map((x, i) => [x, b[i]]); }',
      errors: [{ messageId: 'preferZip' }],
    },
    {
      code: 'use(a.map((x, i) => [x, b[i]]));',
      errors: [{ messageId: 'preferZip' }],
    },
    {
      code: 'const p = a.map((x, i) => [x, b[i]]); const q = c.map((y, j) => [y, d[j]]);',
      errors: [{ messageId: 'preferZip' }, { messageId: 'preferZip' }],
    },
    {
      code: 'a.map((x: number, i: number) => [x, b[i]]);',
      errors: [{ messageId: 'preferZip' }],
    },
    {
      code: 'const pairs = a.map((x, i) => [x, b[i]]) as [number, string][];',
      errors: [{ messageId: 'preferZip' }],
    },
    {
      code: 'const pairs: Array<[string, number]> = names.map(function (name: string, i: number) { return [name, ages[i]]; });',
      errors: [{ messageId: 'preferZip' }],
    },
  ],
});
