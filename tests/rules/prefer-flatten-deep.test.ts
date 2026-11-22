import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferFlattenDeep } from '../../src/rules/prefer-flatten-deep.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-flatten-deep', preferFlattenDeep, {
  valid: [
    'flattenDeep(items);',
    'items.flat(2);',
    'items.flat();',
    "items.flat('Infinity');",
    // Owned by prefer-flat-map-deep.
    'items.map(mapper).flat(Infinity);',
  ],
  invalid: [
    {
      code: 'items.flat(Infinity);',
      errors: [{ messageId: 'preferFlattenDeep' }],
    },
    {
      code: 'const values: number[] = items.flat(Infinity);',
      errors: [{ messageId: 'preferFlattenDeep' }],
    },
    {
      code: 'items.map(mapper, thisArg).flat(Infinity);',
      errors: [{ messageId: 'preferFlattenDeep' }],
    },
  ],
});
