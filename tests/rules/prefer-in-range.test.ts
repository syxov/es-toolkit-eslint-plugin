import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferInRange } from '../../src/rules/prefer-in-range.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-in-range', preferInRange, {
  valid: [
    'inRange(value, start, end);',
    'value > start && value < end;',
    'value >= start && other < end;',
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
  ],
});
