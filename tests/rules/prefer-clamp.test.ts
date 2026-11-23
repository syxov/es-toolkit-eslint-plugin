import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferClamp } from '../../src/rules/prefer-clamp.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-clamp', preferClamp, {
  valid: [
    'clamp(value, 0, 100);',
    'Math.min(a, b);',
    'Math.max(a, b);',
    'Math.min(Math.min(a, b), c);',
    'Math.max(Math.max(a, b), c);',
    'Math.floor(Math.max(a, b));',
    'Math.min(Math.max(a, b, c), d);',
    // One-argument calls are not a two-bound clamp.
    'Math.min(Math.max(a));',
    'Math.min(Math.max(a, b));',
    'Math.min(Math.max(a), b);',
    'Math.min(Math.max(...values), upper);',
    'Math.min(Math.max(a, b), c, d);',
    // The inner call is not a direct argument.
    'Math.min(round(Math.max(a, b)), c);',
    'Math.min(Math.max(a, b) + 1, c);',
    // Not `Math.min`/`Math.max` by name.
    'Math.min(Math.abs(a, b), c);',
    'Math.min(other.max(a, b), c);',
    "Math['min'](Math.max(a, b), c);",
    'Math.min(Math.max, c);',
    // Both arguments are the opposite call: a symmetric min/max (e.g. interval overlap), not a clamp.
    'Math.max(Math.min(aStart, aEnd), Math.min(bStart, bEnd));',
    'Math.min(Math.max(aStart, aEnd), Math.max(bStart, bEnd));',
    'Math.min(Math.max(a, lo), Math.max(b, lo));',
    // Interval normalisation: the mirrored `Math.<outer>(p, q)` over the inner pair orders an
    // interval before bounding it, and relies on the result when the bounds cross.
    'const overlap = Math.min(Math.max(s.a.x, s.b.x), rect.right) - Math.max(Math.min(s.a.x, s.b.x), rect.left);',
    'const range = { fromColumn: Math.max(Math.min(from, to), 1), toColumn: Math.min(Math.max(from, to), count) };',
    'function hit(enter, exit) { const start = Math.max(0, Math.min(enter, exit)); const end = Math.min(1, Math.max(exit, enter)); return end > start; }',
    'function base(domain: number[]) { const domainMax = Math.max(domain[0], domain[1]); return domainMax < 0 ? domainMax : Math.max(Math.min(domain[0], domain[1]), 0); }',
    // An index bounded by the last index of a possibly empty list: not `clamp(i, 0, len - 1)`.
    'sorted[Math.min(variant, Math.max(0, sorted.length - 1))];',
    'const index = Math.min(Math.max(0, items.length - 1), activeIndex);',
  ],
  invalid: [
    {
      code: 'Math.min(Math.max(value, lower), upper);',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'Math.max(Math.min(value, upper), lower);',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'Math.min(upper, Math.max(value, lower));',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'Math.max(lower, Math.min(value, upper));',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'Math.min(Math.max(x, getMin()), getMax());',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'const y = Math.min(Math.max(x, 0), 1) + 2;',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'const v: number = Math.min(Math.max(x as number, 0), 100);',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      // Only one argument is a two-argument `Math.min`, so this is still a clamp.
      code: 'Math.max(Math.min(value, upper), Math.min(a, b, c));',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'const clampPct = (n: number): number => Math.max(0, Math.min(n!, 100));',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      // A mirrored call in another function does not make this an interval bound.
      code: 'const lo = () => Math.min(a, b); const v = () => Math.max(Math.min(a, b), 0);',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      // The same pair under the inner method is not a mirror.
      code: 'const m = Math.min(a, b); const v = Math.max(Math.min(a, b), 0);',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      // A true clamp of an index into the last index stays reported.
      code: 'Math.min(Math.max(Math.ceil(x * days.length) - 1, 0), days.length - 1);',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'Math.max(0, Math.min(i, items.length - 1));',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      // A clamp nested in another clamp is reported once, at the outer call.
      code: 'const end = Math.max(0, Math.min(Math.max(sel.start, sel.end), text.length));',
      errors: [{ messageId: 'preferClamp', column: 13 }],
    },
  ],
});
