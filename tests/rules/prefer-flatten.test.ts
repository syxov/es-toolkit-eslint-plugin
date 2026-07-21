import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferFlatten } from '../../src/rules/prefer-flatten.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-flatten', preferFlatten, {
  valid: ['flatten(items);', 'items.flat(2);'],
  invalid: [
    { code: 'items.flat();', errors: [{ messageId: 'preferFlatten' }] },
    {
      code: 'const values: number[] = items.flat();',
      errors: [{ messageId: 'preferFlatten' }],
    },
  ],
});
