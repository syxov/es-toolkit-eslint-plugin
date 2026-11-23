import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferDifferenceWith } from '../../src/rules/prefer-difference-with.js';

const ruleTester = new RuleTester();

const withFilter = 'a.filter((x) => !b.some((y) => isEqual(x, y)))';

ruleTester.run('prefer-difference-with', preferDifferenceWith, {
  valid: [
    'differenceWith(a, b, isEqual);',
    // The same mapping on both sides is `differenceBy`.
    'a.filter((x) => !b.some((y) => y.id === x.id));',
    'a.filter((x) => b.every((y) => y.id !== x.id));',
    'a.filter((x) => b.findIndex((y) => String(y) === String(x)) === -1);',
    // Plain element comparison is `difference`.
    'a.filter((x) => !b.some((y) => y === x));',
    'a.filter((x) => !b.some((y) => y == x));',
    'a.filter((x) => !b.some((y) => isEqual(x, y) && y === x));',
    // Not an equality test between the two elements.
    'names.filter((name) => !orgs.some((org) => name.startsWith(org)));',
    'tags.filter((tag) => !strings.some((one) => one.includes(tag) && one !== tag));',
    'a.filter((x) => !b.some((y) => y.id === x.id || y.name === x.name));',
    'a.filter((x) => !b.some((y) => y.active && y.id === x.userId));',
    'a.filter((x) => !b.some((y) => y.id > x.id));',
    'a.filter((x) => !b.some((y) => isEqual(x, y, opts)));',
    'a.filter((x) => !b.some((y) => isEqual(x, x)));',
    'a.filter((x) => !b.some((y) => compare(x)(y)));',
    'a.filter((x) => !b.some((y) => x.contains(y)));',
    'a.filter((x) => !b.some((y) => y.id === x.id + y.offset));',
    // Keeps matches: an intersection, not a difference.
    'a.filter((x) => b.some((y) => isEqual(x, y)));',
    'a.filter((x) => b.every((y) => !isEqual(x, y) && y.ok));',
    // The second array depends on the element.
    'a.filter((x) => !x.links.some((y) => isEqual(x, y)));',
    'a.filter((x) => !b.some((y, i) => isEqual(x, y)));',
    'xs?.filter((x) => !b.some((y) => isEqual(x, y)));',
    'a.filter((x) => !b?.some((y) => isEqual(x, y)));',
    `${withFilter}.map((x) => x.id);`,
    `a.map((x) => x.id)${withFilter.slice(1)};`,
    `a.map((x) => x.id)${withFilter.slice(1)}.sort();`,
    {
      code: `${withFilter}.map((x) => x.id);`,
      options: [{ chainPosition: 'outside-chain' }],
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
    },
    {
      code: `a.map((x) => x.id)${withFilter.slice(1)};`,
      options: [{ chainPosition: 'chain-start' }],
    },
    {
      code: `${withFilter}.map((x) => x.id);`,
      options: [{ chainPosition: 'chain-end' }],
    },
    {
      code: `a.map((x) => x.id)${withFilter.slice(1)}.sort();`,
      options: [{ chainPosition: 'chain-boundaries' }],
    },
    {
      code: `a.map((x) => x.id)${withFilter.slice(1)};`,
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-start' } },
      },
    },
    {
      code: `a.map((x) => x.id)${withFilter.slice(1)};`,
      options: [{ chainPosition: 'chain-start' }],
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-end' } },
      },
    },
  ],
  invalid: [
    {
      code: `${withFilter};`,
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: 'a.filter((x) => !b.some((y) => isEqual(y, x)));',
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: 'a.filter((x) => !b.some((y) => y.id === x.userId));',
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: 'a.filter((x) => !ids.some((id) => id === x.id));',
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: 'a.filter((x) => !b.some((y) => y.id === x.id && y.type === x.type));',
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: 'a.filter((x) => !b.some((y) => y.id == x.id));',
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: 'a.filter((x) => !b.some((y) => x.equals(y)));',
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: 'a.filter((x) => b.every((y) => y.id !== x.userId));',
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: 'a.filter((x) => b.every((y) => !isEqual(x, y)));',
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: 'a.filter((x) => b.every((y) => y.id != x.id));',
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: 'a.filter((x) => b.findIndex((y) => isEqual(x, y)) === -1);',
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: 'const left = (rows as Row[]).filter((row: Row) => !removed.some((r: Removed) => r.rowId === row.id));',
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: `${withFilter};`,
      options: [{ chainPosition: 'outside-chain' }],
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: `a.map((x) => x.id)${withFilter.slice(1)}.sort();`,
      options: [{ chainPosition: 'always' }],
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: `${withFilter}.map((x) => x.id);`,
      options: [{ chainPosition: 'chain-start' }],
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: `a.map((x) => x.id)${withFilter.slice(1)};`,
      options: [{ chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: `${withFilter}.map((x) => x.id);`,
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: `a.map((x) => x.id)${withFilter.slice(1)};`,
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: `${withFilter}.map((x) => x.id);`,
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
    {
      code: `a.map((x) => x.id)${withFilter.slice(1)};`,
      options: [{ chainPosition: 'chain-end' }],
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-start' } },
      },
      errors: [{ messageId: 'preferDifferenceWith' }],
    },
  ],
});
