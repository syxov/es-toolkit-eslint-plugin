import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferFlattenDeep } from '../../src/rules/prefer-flatten-deep.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-flatten-deep', preferFlattenDeep, {
  valid: ['flattenDeep(items);', 'items.flat(2);'],
  invalid: [
    {
      code: 'items.flat(Infinity);',
      errors: [{ messageId: 'preferFlattenDeep' }],
    },
    {
      code: 'const values: number[] = items.flat(Infinity);',
      errors: [{ messageId: 'preferFlattenDeep' }],
    },
  ],
});
