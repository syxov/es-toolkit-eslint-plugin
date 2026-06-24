import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferDifference } from '../../src/rules/prefer-difference.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-difference', preferDifference, {
  valid: [
    'difference(a, b);',
    'a.filter((x) => b.includes(x));',
    'a.filter((x) => !b.includes(x.id));',
    'a.filter((x) => !b.has(x));',
  ],
  invalid: [
    {
      code: 'a.filter((x) => !b.includes(x));',
      errors: [{ messageId: 'preferDifference' }],
    },
    {
      code: 'items.filter((item) => !exclude.includes(item));',
      errors: [{ messageId: 'preferDifference' }],
    },
    {
      code: 'const xs = (a as number[]).filter((x) => !b.includes(x));',
      errors: [{ messageId: 'preferDifference' }],
    },
  ],
});
