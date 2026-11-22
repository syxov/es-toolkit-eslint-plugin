import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferHead } from '../../src/rules/prefer-head.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-head', preferHead, {
  valid: [
    'head(arr);',
    'arr[1];',
    'arr.at(0);',
    'const value = record[key];',
    'obj["0"];',
    "obj['0'];",
    // Writes, not reads.
    'arr[0] = 1;',
    'arr[0] += 1;',
    'arr[0]++;',
    '--arr[0];',
    'delete arr[0];',
    '[arr[0]] = xs;',
    '({ first: arr[0] } = obj);',
    'for (arr[0] of xs);',
    // First-character string idioms owned by the string-case rules.
    's[0].toUpperCase();',
    's[0].toLowerCase();',
    's[0].toLocaleUpperCase();',
    's[0].toLocaleLowerCase();',
    's[0].toUpperCase() + s.slice(1);',
  ],
  invalid: [
    { code: 'arr[0];', errors: [{ messageId: 'preferHead' }] },
    {
      code: 'const value: string | undefined = items[0];',
      errors: [{ messageId: 'preferHead' }],
    },
    { code: 'arr[0] === x;', errors: [{ messageId: 'preferHead' }] },
    { code: 'x = arr[0];', errors: [{ messageId: 'preferHead' }] },
    { code: 'arr[0].trim();', errors: [{ messageId: 'preferHead' }] },
    { code: 'arr[0].toUpperCase;', errors: [{ messageId: 'preferHead' }] },
    { code: 'arr[0][1] = x;', errors: [{ messageId: 'preferHead' }] },
    { code: 'arr[0].name = x;', errors: [{ messageId: 'preferHead' }] },
    {
      code: 'const [a] = [rows[0]];',
      errors: [{ messageId: 'preferHead' }],
    },
  ],
});
