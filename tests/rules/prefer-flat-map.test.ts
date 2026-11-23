import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferFlatMap } from '../../src/rules/prefer-flat-map.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-flat-map', preferFlatMap, {
  valid: [
    'flatMap(items, mapper);',
    'items.map(mapper).flat(2);',
    "items.map(mapper).flat('1');",
    'items.map(mapper).flat(Infinity);',
    'items.map(mapper, thisArg).flat();',
    'items.flat();',
    'items.flat(1);',
    // A single value: the rewrite drops the array.
    '[testConfig].map(config => config().specFiles).flat();',
  ],
  invalid: [
    {
      code: 'items.map(mapper).flat();',
      errors: [{ messageId: 'preferFlatMap' }],
    },
    {
      code: 'items.map(mapper).flat(1);',
      errors: [{ messageId: 'preferFlatMap' }],
    },
    {
      code: '[a, b].map(mapper).flat();',
      errors: [{ messageId: 'preferFlatMap' }],
    },
    {
      code: 'const values: number[] = items.map(value => [value]).flat();',
      errors: [{ messageId: 'preferFlatMap' }],
    },
  ],
});
