import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferHead } from '../../src/rules/prefer-head.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-head', preferHead, {
  valid: ['head(arr);', 'arr[1];', 'arr.at(0);', 'const value = record[key];'],
  invalid: [
    { code: 'arr[0];', errors: [{ messageId: 'preferHead' }] },
    {
      code: 'const value: string | undefined = items[0];',
      errors: [{ messageId: 'preferHead' }],
    },
  ],
});
