import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferShuffle } from '../../src/rules/prefer-shuffle.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-shuffle', preferShuffle, {
  valid: [
    'shuffle(arr);',
    'const s = shuffle([...arr]);',
    'arr.sort();',
    'arr.toSorted();',
    'arr.sort((a, b) => a - b);',
    'arr.toSorted((a, b) => b - a);',
    'arr.sort(compare);',
    // The comparator does not return a random sign.
    'arr.sort(() => Math.random());',
    'arr.sort(() => Math.random() * 0.5);',
    'arr.sort(() => Math.random() + 0.5);',
    'arr.sort(() => Math.random() - 0.3);',
    'arr.sort(() => Math.random() - 1);',
    'arr.sort(() => Math.random() - x);',
    'arr.sort(() => 0.5 - x);',
    'arr.sort(() => Math.random() > 0.5 ? 1 : 0);',
    'arr.sort(() => Math.random() > 0.5 ? 1 : 1);',
    'arr.sort(() => Math.random - 0.5);',
    // Not `Math.random` by name.
    'arr.sort(() => foo.random() - 0.5);',
    'arr.sort(() => Math.floor() - 0.5);',
    // The comparator reads its own parameters.
    'arr.sort((a, b) => Math.random() - a);',
    'arr.sort(function (a) { return Math.random() - a; });',
    'arr.sort((a, b) => Math.random() > 0.5 ? a : b);',
    // Not a sort call.
    'arr.map(() => Math.random() - 0.5);',
    'arr.reverse(() => Math.random() - 0.5);',
    'sort(() => Math.random() - 0.5);',
    'const d = Math.random() - 0.5;',
    // Extra argument.
    'arr.sort(() => Math.random() - 0.5, extra);',
    // The body is more than a single return.
    'arr.sort(() => { log(); return Math.random() - 0.5; });',
    'arr.sort(function () { log(); return Math.random() - 0.5; });',
  ],
  invalid: [
    {
      code: 'arr.sort(() => Math.random() - 0.5);',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'arr.sort(() => 0.5 - Math.random());',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'arr.sort(() => Math.random() - .5);',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'arr.sort((a, b) => Math.random() - 0.5);',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'arr.sort((a) => 0.5 - Math.random());',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'arr.sort(() => Math.random() > 0.5 ? 1 : -1);',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'arr.sort(() => Math.random() < 0.5 ? -1 : 1);',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'arr.sort(() => { return Math.random() - 0.5; });',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'arr.sort(function () { return Math.random() - 0.5; });',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'arr.sort(function (a, b) { return Math.random() > 0.5 ? 1 : -1; });',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: '[...arr].sort(() => Math.random() - 0.5);',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'arr.slice().sort(() => Math.random() - 0.5);',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'arr.toSorted(() => Math.random() - 0.5);',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'arr.toSorted(() => Math.random() < 0.5 ? -1 : 1);',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'const s = arr.slice().sort(() => Math.random() - 0.5);',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'const top = [...arr].sort(() => 0.5 - Math.random()).slice(0, 3);',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'render(arr.toSorted(() => Math.random() - 0.5));',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'function f() { return arr.toSorted(() => Math.random() - 0.5); }',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'a.sort(() => Math.random() - 0.5); b.toSorted(() => 0.5 - Math.random());',
      errors: [{ messageId: 'preferShuffle' }, { messageId: 'preferShuffle' }],
    },
    {
      code: '(items as Item[]).sort(() => Math.random() - 0.5);',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'items.sort((a: Item, b: Item) => Math.random() - 0.5);',
      errors: [{ messageId: 'preferShuffle' }],
    },
    {
      code: 'const out: Item[] = [...items].sort((): number => Math.random() - 0.5);',
      errors: [{ messageId: 'preferShuffle' }],
    },
  ],
});
