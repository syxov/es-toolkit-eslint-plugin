import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferChunk } from '../../src/rules/prefer-chunk.js';

const ruleTester = new RuleTester();

const loop = (body: string, receiver = 'xs', header = '') =>
  `for (let i = 0; i < ${receiver}.length; i += size) ${header}${body}`;

ruleTester.run('prefer-chunk', preferChunk, {
  valid: [
    'chunk(xs, size);',
    'xs.slice(i, i + size);',
    // Slicing a string is not `chunk`.
    `const s = 'abcdef'; ${loop('out.push(s.slice(i, i + size));', 's')}`,
    `function split(text: string) { ${loop('out.push(text.slice(i, i + size));', 'text')} }`,
    `function split(text = '') { ${loop('out.push(text.slice(i, i + size));', 'text')} }`,
    'const s = "abcdef"; Array.from({ length: Math.ceil(s.length / 2) }, (_, i) => s.slice(i * 2, i * 2 + 2));',
    // Named like a single string.
    'function splitText(text, size = 18) { const chunks = []; for (let index = 0; index < text.length; index += size) { chunks.push(text.slice(index, index + size)); } return chunks; }',
    loop('out.push(this.message.slice(i, i + size));', 'this.message'),
    // The body does more than collect the slices.
    loop('{ const batch = xs.slice(i, i + size); await send(batch); }'),
    loop('{ out.push(xs.slice(i, i + size)); count++; }'),
    loop('out.push(xs.slice(i, i + size).join(""));'),
    loop('out.push(xs.slice(i, i + size), extra);'),
    loop('out.unshift(xs.slice(i, i + size));'),
    loop('out[i].push(xs.slice(i, i + size));'),
    loop('xs.push(xs.slice(i, i + size));'),
    // Step and slice length disagree, or the bounds are off.
    loop('out.push(xs.slice(i, i + other));'),
    loop('out.push(xs.slice(i, i + size + 1));'),
    loop('out.push(xs.slice(i + 1, i + size));'),
    loop('out.push(ys.slice(i, i + size));'),
    'for (let i = 1; i < xs.length; i += size) out.push(xs.slice(i, i + size));',
    'for (let i = 0; i <= xs.length; i += size) out.push(xs.slice(i, i + size));',
    'for (let i = 0; i < xs.length; i++) out.push(xs.slice(i, i + 1));',
    'for (let i = 0; i < xs.length; i += 2) out.push(xs.slice(i, i + 3));',
    'for (let i = 0; i < xs.length; i -= size) out.push(xs.slice(i, i + size));',
    'for (i = 0; i < xs.length; i += size) out.push(xs.slice(i, i + size));',
    'for (let i = 0, j = ys.length; i < j; i += size) out.push(xs.slice(i, i + size));',
    loop('{ const end = i + other; out.push(xs.slice(i, end)); }'),
    loop('out.push(xs.slice(i, Math.min(i + size, ys.length)));'),
    'Array.from({ length: Math.floor(xs.length / size) }, (_, i) => xs.slice(i * size, i * size + size));',
    'Array.from({ length: Math.ceil(xs.length / size) }, (_, i) => xs.slice(i, i + size));',
    'Array.from({ length: Math.ceil(xs.length / size) }, (_, i) => xs.slice(i * size, i * size + 2));',
    'Array.from({ length: Math.ceil(xs.length / size) }, (_, i) => ys.slice(i * size, i * size + size));',
    'Array.from({ length: Math.ceil(xs.length / size) }, (_, i) => xs.slice(i * size, (i + 2) * size));',
    'Array.from({ length: Math.ceil(xs.length / size), extra: 1 }, (_, i) => xs.slice(i * size, (i + 1) * size));',
    'Array.from({ length: Math.ceil(xs.length / size) }, (_, i) => xs.slice(i * size, (i + 1) * size), ctx);',
    'Array.from({ length: Math.ceil(xs.length / size) }, (_) => xs.slice(0, size));',
  ],
  invalid: [
    {
      code: loop('out.push(xs.slice(i, i + size));'),
      errors: [{ messageId: 'preferChunk' }],
    },
    {
      code: loop('{ out.push(xs.slice(i, i + size)); }'),
      errors: [{ messageId: 'preferChunk' }],
    },
    {
      code: loop('out.push(xs.slice(i, size + i));'),
      errors: [{ messageId: 'preferChunk' }],
    },
    {
      code: 'for (let i = 0; i < xs.length; i += 3) out.push(xs.slice(i, i + 3));',
      errors: [{ messageId: 'preferChunk' }],
    },
    {
      code: 'for (let i = 0; i < xs.length; i = i + size) out.push(xs.slice(i, i + size));',
      errors: [{ messageId: 'preferChunk' }],
    },
    {
      code: 'for (let i = 0, j = arr.length; i < j; i += chunkSize) { chunks.push(arr.slice(i, i + chunkSize)); }',
      errors: [{ messageId: 'preferChunk' }],
    },
    {
      code: loop('{ const end = i + size; out.push(xs.slice(i, end)); }'),
      errors: [{ messageId: 'preferChunk' }],
    },
    {
      code: loop('out.push(xs.slice(i, Math.min(i + size, xs.length)));'),
      errors: [{ messageId: 'preferChunk' }],
    },
    {
      code: loop('this.pages.push(this.rows.slice(i, i + size));', 'this.rows'),
      errors: [{ messageId: 'preferChunk' }],
    },
    {
      code: 'function chunkArray<T>(arr: T[], chunkSize: number) { const chunks: T[][] = []; for (let i = 0; i < arr.length; i += chunkSize) { chunks.push(arr.slice(i, i + chunkSize)); } return chunks; }',
      errors: [{ messageId: 'preferChunk' }],
    },
    {
      code: 'const rows = Array.from({ length: Math.ceil(xs.length / size) }, (_, i) => xs.slice(i * size, i * size + size));',
      errors: [{ messageId: 'preferChunk' }],
    },
    {
      code: 'Array.from({ length: Math.ceil(xs.length / size) }, (_, i) => xs.slice(i * size, (i + 1) * size));',
      errors: [{ messageId: 'preferChunk' }],
    },
    {
      code: 'Array.from({ length: Math.ceil(xs.length / 3) }, (_, index) => xs.slice(3 * index, 3 * index + 3));',
      errors: [{ messageId: 'preferChunk' }],
    },
    {
      code: 'Array.from({ length: Math.ceil(xs.length / size) }, (_, i) => { return xs.slice(i * size, size * (i + 1)); });',
      errors: [{ messageId: 'preferChunk' }],
    },
    {
      code: 'const pages = Array.from({ length: Math.ceil(items.length / PAGE) }, (_: unknown, i: number) => items.slice(i * PAGE, i * PAGE + PAGE));',
      errors: [{ messageId: 'preferChunk' }],
    },
  ],
});
