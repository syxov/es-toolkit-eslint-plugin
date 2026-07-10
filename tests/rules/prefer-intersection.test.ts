import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIntersection } from '../../src/rules/prefer-intersection.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-intersection', preferIntersection, {
  valid: [
    'intersection(a, b);',
    'a.filter((x) => !b.includes(x));',
    'a.filter((x) => b.includes(x.id));',
    'a.filter((x) => b.has(x));',
    'a.filter((x) => b.includes(x)).map((x) => x.id);',
  ],
  invalid: [
    {
      code: 'a.filter((x) => b.includes(x));',
      errors: [{ messageId: 'preferIntersection' }],
    },
    {
      code: 'items.filter((item) => allowed.includes(item));',
      errors: [{ messageId: 'preferIntersection' }],
    },
    {
      code: 'const xs = (a as number[]).filter((x) => b.includes(x));',
      errors: [{ messageId: 'preferIntersection' }],
    },
  ],
});
