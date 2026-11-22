import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferInRange } from '../../src/rules/prefer-in-range.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-in-range', preferInRange, {
  valid: [
    'inRange(value, start, end);',
    'value > start && value < end;',
    'value >= start && other < end;',
    'start <= value && end > other;',
    // `inRange` excludes its end, so an inclusive upper bound is not a match.
    'value >= start && value <= end;',
    'start <= value && end >= value;',
    // Two bounds of the same kind.
    'value >= start && value >= end;',
    'value < start && value < end;',
    'value <= end && value >= start;',
    'value >= start || value < end;',
    'value >= start && (value < end || other);',
    // Not adjacent in the `&&` chain.
    'value >= start && ok && value < end;',
    'ok && value >= start;',
  ],
  invalid: [
    {
      code: 'value >= start && value < end;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'const valid: boolean = value >= 0 && value < 10;',
      errors: [{ messageId: 'preferInRange' }],
    },
    // Each spelling of each bound, in either order.
    {
      code: 'start <= value && value < end;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'value >= start && end > value;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'start <= value && end > value;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'value < end && value >= start;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'end > value && start <= value;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'i >= 0 && i < items.length;',
      errors: [{ messageId: 'preferInRange' }],
    },
    {
      code: 'point.x >= box.left && point.x < box.right;',
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
      code: 'const inside = (n as number) >= min && (n as number) < max;',
      errors: [{ messageId: 'preferInRange' }],
    },
  ],
});
