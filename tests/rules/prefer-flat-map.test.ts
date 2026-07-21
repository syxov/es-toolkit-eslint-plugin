import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferFlatMap } from '../../src/rules/prefer-flat-map.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-flat-map', preferFlatMap, {
  valid: [
    'flatMap(items, mapper);',
    'items.map(mapper).flat(2);',
    'items.flat();',
  ],
  invalid: [
    {
      code: 'items.map(mapper).flat();',
      errors: [{ messageId: 'preferFlatMap' }],
    },
    {
      code: 'const values: number[] = items.map(value => [value]).flat();',
      errors: [{ messageId: 'preferFlatMap' }],
    },
  ],
});
