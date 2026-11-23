import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferInRange } from '../../src/rules/prefer-in-range.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-in-range', preferInRange, {
  valid: [
    'inRange(value, 0, 10);',
    'value > 0 && value < 10;',
    'value >= 0 && other < 10;',
    '0 <= value && 10 > other;',
    // `inRange` excludes its end, so an inclusive upper bound is not a match.
    'value >= 0 && value <= 10;',
    '0 <= value && 10 >= value;',
    // Two bounds of the same kind.
    'value >= 0 && value >= 10;',
    'value < 0 && value < 10;',
    'value <= 10 && value >= 0;',
    'value >= 0 || value < 10;',
    'value >= 0 && (value < 10 || other);',
    // Not adjacent in the `&&` chain.
    'value >= 0 && ok && value < 10;',
    'ok && value >= 0;',
    // Variable bounds can coincide, and `inRange` throws when `min >= max`.
    'value >= start && value < end;',
    'i >= 0 && i < items.length;',
    'i >= 0 && i < items.length - 1;',
    'point.x >= box.left && point.x < box.right;',
    'for (let i = from; i >= 0 && i < points.length; i += step) {}',
    'while (index >= 0 && index < rows.length) index++;',
    'col >= pinned.length && col < firstColumn;',
    'i >= startLine && i < endLine;',
    // Literal bounds that are not ordered would throw too.
    'x >= 10 && x < 0;',
    'x >= 5 && x < 5;',
    'x >= 1 && x < -1;',
    // Not numbers: string keys, bigints.
    "key >= 'a' && key < 'n';",
    'n >= 0n && n < 10n;',
    // The shared operand is a threshold, not the subject.
    'dx > 0.5 && dy <= 0.5;',
    '0 <= value && 10 > value;',
    '10 > value && 0 <= value;',
    'value < 10 && 0 <= value;',
    'row >= first && row <= last && lastRowOfCell > last;',
    'Math.abs(a - b) <= EPSILON && Math.abs(a) > EPSILON;',
    // TypeScript: typed variable bounds.
    'const inside = (n as number) >= min && (n as number) < max;',
  ],
  invalid: [
    {
      code: 'value >= 0 && value < 10;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'const valid: boolean = value >= 0 && value < 10;',
      errors: [{ messageId: 'preferInRange' }],
    },
    // Each subject-first spelling, in either order, and the middle form.
    {
      code: '0 <= value && value < 10;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'value < 10 && value >= 0;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'response.status >= 200 && response.status < 300;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'index % 1500 >= 700 && index % 1500 < 760;',
      errors: [{ messageId: 'preferInRange' }],
    },
    // Negative and fractional literals.
    {
      code: 'x >= -1 && x < 1;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'x >= -10 && x < -5;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'ratio >= 0.25 && ratio < 0.75;',
      errors: [{ messageId: 'preferInRange' }],
    },
    // Inside a longer `&&` chain.
    {
      code: 'ok && x >= 0 && x < 10;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'a && b && x >= 0 && x < 10;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'x >= 0 && x < 10 && y;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'x >= 0 && x < 10 && x >= 1;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'x >= 0 && x < 10 && y >= 0 && y < 5;',
      errors: [{ messageId: 'preferInRange' }, { messageId: 'preferInRange' }],
    },
    {
      code: 'const inside = (n as number) >= 0 && (n as number) < 10;',
      errors: [{ messageId: 'preferInRange' }],
    },
  ],
});
