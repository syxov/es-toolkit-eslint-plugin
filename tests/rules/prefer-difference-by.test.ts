import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferDifferenceBy } from '../../src/rules/prefer-difference-by.js';

const ruleTester = new RuleTester();

const byFilter = 'a.filter((x) => !b.some((y) => y.id === x.id))';

ruleTester.run('prefer-difference-by', preferDifferenceBy, {
  valid: [
    'differenceBy(a, b, (x) => x.id);',
    // Different keys on each side, or a comparator call: `differenceWith`.
    'a.filter((x) => !b.some((y) => y.id === x.userId));',
    'a.filter((x) => !b.some((y) => isEqual(x, y)));',
    'a.filter((x) => !b.some((y) => y.id === x.id && y.type === x.type));',
    // Loose equality is not the `SameValueZero` lookup `differenceBy` does.
    'a.filter((x) => !b.some((y) => y.id == x.id));',
    'a.filter((x) => b.every((y) => y.id != x.id));',
    // Plain element comparison is `difference`.
    'a.filter((x) => !b.some((y) => y === x));',
    'a.filter((x) => b.every((y) => x !== y));',
    // Keeps matches: an intersection, not a difference.
    'a.filter((x) => b.some((y) => y.id === x.id));',
    'a.filter((x) => b.every((y) => y.id === x.id));',
    'a.filter((x) => b.findIndex((y) => y.id === x.id) !== -1);',
    // The inner callback does not compare the two elements.
    'a.filter((x) => !b.some((y) => y.id === 1));',
    'a.filter((x) => !b.some((y) => x.id === 1));',
    'a.filter((x) => !b.some((y) => y.id + x.k === x.id + x.k));',
    // The second array depends on the element.
    'a.filter((x) => !x.items.some((y) => y.id === x.id));',
    'a.filter((x) => !lookup[x.kind].some((y) => y.id === x.id));',
    // The inner callback reads its index.
    'a.filter((x) => !b.some((y, i) => y.id === x.id));',
    'a.filter((x) => !b.some(({ id }) => id === x.id));',
    'a.filter((x) => !b.some(function (y) { return y.id === x.id; }));',
    'a.filter((x) => !b.some((y) => { return y.id === x.id; }));',
    'a.filter((x) => !b.includes(x.id));',
    'a.filter((x) => !b.some((y) => y.id === x.id, ctx));',
    'a.filter((x) => b.findIndex((y) => y.id === x.id) === 0);',
    // `!b.find(…)` misreads a falsy match.
    'a.filter((x) => !b.find((y) => y.id === x.id));',
    // Optional calls short-circuit on a nil receiver; `differenceBy` would throw.
    'xs?.filter((x) => !b.some((y) => y.id === x.id));',
    'a.filter((x) => !b?.some((y) => y.id === x.id));',
    'a.filter((x) => !b.some?.((y) => y.id === x.id));',
    // Typed arrays are not accepted by `differenceBy`.
    'const a = new Uint8Array(4); a.filter((x) => !b.some((y) => String(y) === String(x)));',
    `${byFilter}.map((x) => x.id);`,
    `a.map((x) => x.id)${byFilter.slice(1)};`,
    `a.map((x) => x.id)${byFilter.slice(1)}.sort();`,
    {
      code: `${byFilter}.map((x) => x.id);`,
      options: [{ chainPosition: 'outside-chain' }],
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
    },
    {
      code: `a.map((x) => x.id)${byFilter.slice(1)};`,
      options: [{ chainPosition: 'chain-start' }],
    },
    {
      code: `${byFilter}.map((x) => x.id);`,
      options: [{ chainPosition: 'chain-end' }],
    },
    {
      code: `a.map((x) => x.id)${byFilter.slice(1)}.sort();`,
      options: [{ chainPosition: 'chain-boundaries' }],
    },
    {
      code: `a.map((x) => x.id)${byFilter.slice(1)};`,
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-start' } },
      },
    },
    {
      code: `a.map((x) => x.id)${byFilter.slice(1)};`,
      options: [{ chainPosition: 'chain-start' }],
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-end' } },
      },
    },
  ],
  invalid: [
    {
      code: `${byFilter};`,
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: 'a.filter((x) => !b.some((y) => x.id === y.id));',
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: 'a.filter((x) => !b.some((y) => y.a.b === x.a.b));',
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: 'a.filter((x) => !b.some((y) => String(y) === String(x)));',
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: 'a.filter((x) => !b.some((y) => y[key] === x[key]));',
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: 'a.filter((x) => !b.some((y) => y.id.toLowerCase() === x.id.toLowerCase()));',
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      // A property named like a parameter is not a read of it.
      code: 'a.filter((x) => !b.some((y) => y.x === x.x));',
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: 'a.filter((x) => b.every((y) => y.id !== x.id));',
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: 'a.filter((x) => b.every((y) => !(x.id === y.id)));',
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: 'a.filter((x) => b.findIndex((y) => y.id === x.id) === -1);',
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: 'a.filter((x) => -1 === b.findIndex((y) => y.id === x.id));',
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: 'a.filter((x) => b.findIndex((y) => y.id === x.id) < 0);',
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: 'const fresh = this.items.filter((item) => !this.selected.some((s) => s.key === item.key));',
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: 'const rest = (users as User[]).filter((u: User) => !admins.some((admin: User) => admin.id === u.id));',
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: 'return remote.filter((file) => !workspaces.some((w) => w.id === file.id));',
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: `${byFilter};`,
      options: [{ chainPosition: 'outside-chain' }],
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: `a.map((x) => x.id)${byFilter.slice(1)}.sort();`,
      options: [{ chainPosition: 'always' }],
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: `${byFilter}.map((x) => x.id);`,
      options: [{ chainPosition: 'chain-start' }],
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: `a.map((x) => x.id)${byFilter.slice(1)};`,
      options: [{ chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: `${byFilter}.map((x) => x.id);`,
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: `a.map((x) => x.id)${byFilter.slice(1)};`,
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: `${byFilter}.map((x) => x.id);`,
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
    {
      code: `a.map((x) => x.id)${byFilter.slice(1)};`,
      options: [{ chainPosition: 'chain-end' }],
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-start' } },
      },
      errors: [{ messageId: 'preferDifferenceBy' }],
    },
  ],
});
