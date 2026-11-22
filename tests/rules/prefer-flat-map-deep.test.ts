import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferFlatMapDeep } from '../../src/rules/prefer-flat-map-deep.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-flat-map-deep', preferFlatMapDeep, {
  valid: [
    'flatMapDeep(items, mapper);',
    'items.flat(Infinity);',
    'items.map(mapper).flat();',
    "items.map(mapper).flat('Infinity');",
    'items.map(mapper, thisArg).flat(Infinity);',
  ],
  invalid: [
    {
      code: 'items.map(mapper).flat(Infinity);',
      errors: [{ messageId: 'preferFlatMapDeep' }],
    },
    {
      code: 'const values: string[] = items.map((value: Tree) => value.children).flat(Infinity);',
      errors: [{ messageId: 'preferFlatMapDeep' }],
    },
  ],
});
