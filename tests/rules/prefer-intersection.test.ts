import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIntersection } from '../../src/rules/prefer-intersection.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-intersection', preferIntersection, {
  valid: [
    'intersection(a, b);',
    'a.filter((x) => !b.includes(x));',
    'a.filter((x) => b.includes(x.id));',
    'a.filter((x) => b.has(x));',
    // The receiver depends on the element, so it is not a fixed second array.
    'a.filter((x) => x.children.includes(x));',
    'a.filter((x) => lookup[x].includes(x));',
    'a.filter((x) => getList(x).includes(x));',
    'a.filter((x) => b.includes(x, 1));',
    // `function` callbacks are not matched.
    'a.filter(function (x) { return b.includes(x); });',
    'a.filter((x) => b.includes(x)).map((x) => x.id);',
    'a.map((x) => x.id).filter((x) => b.includes(x));',
    'a.map((x) => x.id).filter((x) => b.includes(x)).sort();',
    {
      code: 'a.filter((x) => b.includes(x)).map((x) => x.id);',
      options: [{ chainPosition: 'outside-chain' }],
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
    },
    {
      code: 'a.map((x) => x.id).filter((x) => b.includes(x));',
      options: [{ chainPosition: 'chain-start' }],
    },
    {
      code: 'a.map((x) => x.id).filter((x) => b.includes(x)).sort();',
      options: [{ chainPosition: 'chain-start' }],
    },
    {
      code: 'a.filter((x) => b.includes(x)).map((x) => x.id);',
      options: [{ chainPosition: 'chain-end' }],
    },
    {
      code: 'a.map((x) => x.id).filter((x) => b.includes(x)).sort();',
      options: [{ chainPosition: 'chain-end' }],
    },
    {
      code: 'a.map((x) => x.id).filter((x) => b.includes(x)).sort();',
      options: [{ chainPosition: 'chain-boundaries' }],
    },
    {
      code: 'a.map((x) => x.id).filter((x) => b.includes(x));',
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-start' } },
      },
    },
    {
      code: 'a.map((x) => x.id).filter((x) => b.includes(x));',
      options: [{ chainPosition: 'chain-start' }],
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-end' } },
      },
    },
  ],
  invalid: [
    {
      code: 'a.filter((x) => this.excluded.includes(x));',
      errors: [{ messageId: 'preferIntersection' }],
    },
    {
      code: 'a.filter((x) => groups[key].includes(x));',
      errors: [{ messageId: 'preferIntersection' }],
    },
    {
      // A property named like the parameter is not a read of it.
      code: 'a.filter((x) => obj.x.includes(x));',
      errors: [{ messageId: 'preferIntersection' }],
    },
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
    {
      code: 'a.filter((x) => b.includes(x));',
      options: [{ chainPosition: 'outside-chain' }],
      errors: [{ messageId: 'preferIntersection' }],
    },
    {
      code: 'a.map((x) => x.id).filter((x) => b.includes(x)).sort();',
      options: [{ chainPosition: 'always' }],
      errors: [{ messageId: 'preferIntersection' }],
    },
    {
      code: 'a.filter((x) => b.includes(x)).map((x) => x.id);',
      options: [{ chainPosition: 'chain-start' }],
      errors: [{ messageId: 'preferIntersection' }],
    },
    {
      code: 'a.map((x) => x.id).filter((x) => b.includes(x));',
      options: [{ chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferIntersection' }],
    },
    {
      code: 'a.filter((x) => b.includes(x)).map((x) => x.id);',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferIntersection' }],
    },
    {
      code: 'a.map((x) => x.id).filter((x) => b.includes(x));',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferIntersection' }],
    },
    {
      code: 'a.filter((x) => b.includes(x));',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferIntersection' }],
    },
    {
      code: 'a.filter((x) => b.includes(x)).map((x) => x.id);',
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
      errors: [{ messageId: 'preferIntersection' }],
    },
    {
      code: 'a.map((x) => x.id).filter((x) => b.includes(x));',
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-end' } },
      },
      errors: [{ messageId: 'preferIntersection' }],
    },
    {
      code: 'a.map((x) => x.id).filter((x) => b.includes(x));',
      options: [{ chainPosition: 'chain-end' }],
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-start' } },
      },
      errors: [{ messageId: 'preferIntersection' }],
    },
  ],
});
