import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferUnion } from '../../src/rules/prefer-union.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-union', preferUnion, {
  valid: [
    'union(a, b);',
    // Plain dedupe of a single array is `uniq`, not `union`.
    '[...new Set(arr)];',
    'Array.from(new Set(arr));',
    'new Set([...a, ...b]);',
    '[...new Set([...a])];',
  ],
  invalid: [
    {
      code: '[...new Set([...a, ...b])];',
      errors: [{ messageId: 'preferUnion' }],
    },
    {
      code: 'Array.from(new Set([...a, ...b]));',
      errors: [{ messageId: 'preferUnion' }],
    },
    {
      code: 'const u = [...new Set([...a, ...b, ...c])];',
      errors: [{ messageId: 'preferUnion' }],
    },
    {
      code: 'const u = [...new Set([...(a as number[]), ...b])];',
      errors: [{ messageId: 'preferUnion' }],
    },
  ],
});
