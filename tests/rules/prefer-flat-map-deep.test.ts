import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferFlatMapDeep } from '../../src/rules/prefer-flat-map-deep.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-flat-map-deep', preferFlatMapDeep, {
  valid: ['flatMapDeep(items, mapper);'],
  invalid: [
    {
      code: 'items.map(mapper).flat(Infinity);',
      errors: [{ messageId: 'preferFlatMapDeep' }],
    },
  ],
});
