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
    // A Map/Set iterator or a Set is not an array: `union` calls `arr1.concat` (`prefer-uniq`).
    '[...new Set([...baseline.keys(), ...current.keys()])];',
    'Array.from(new Set([...Object.keys(previous), ...captured.keys()]));',
    '[...new Set([...this.rootFileNames(), ...this.imports.values()])];',
    '[...new Set([...a, ...m.entries()])];',
    '[...new Set([...new Set(a), ...b])];',
    'const seen = new Set(a); [...new Set([...seen, ...b])];',
    'const lookup = new Map(); [...new Set([...a, ...lookup])];',
    'const ids: ReadonlySet<string> = load(); [...new Set([...ids, ...b])];',
    'let ids: Set<string>; [...new Set([...ids, ...b])];',
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
    {
      // `Object.keys` returns an array.
      code: '[...new Set([...Object.keys(a), ...Object.values(b)])];',
      errors: [{ messageId: 'preferUnion' }],
    },
    {
      code: 'const seen = [1]; [...new Set([...seen, ...b])];',
      errors: [{ messageId: 'preferUnion' }],
    },
    {
      code: 'const ids: string[] = load(); Array.from(new Set([...ids, ...b]));',
      errors: [{ messageId: 'preferUnion' }],
    },
  ],
});
