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
    // `union` takes exactly two arrays; other shapes are a plain dedupe (`prefer-uniq`).
    '[...new Set([...a, ...b, ...c])];',
    'Array.from(new Set([...a, ...b, ...c]));',
    '[...new Set([...a, ...b, x])];',
    '[...new Set([...a, x])];',
    '[...new Set([x, ...a])];',
    'Array.from(new Set([...a, ...b]), (x) => x * 2);',
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
      code: 'const u = Array.from(new Set([...this.a, ...getB()]));',
      errors: [{ messageId: 'preferUnion' }],
    },
    {
      code: 'const u = [...new Set([...(a as number[]), ...b])];',
      errors: [{ messageId: 'preferUnion' }],
    },
  ],
});
