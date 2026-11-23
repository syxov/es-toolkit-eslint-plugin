import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferWithout } from '../../src/rules/prefer-without.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-without', preferWithout, {
  valid: [
    'without(arr, value);',
    'arr.filter((x) => x.id !== value);',
    'arr.filter((x) => x === value);',
    'arr.filter((x) => a !== b);',
    // Loose `!=` is opt-in via `checkLooseInequality`.
    'arr.filter((x) => x != value);',
    'arr.filter((x) => null != x);',
    {
      code: 'arr.filter((x) => x != null);',
      options: [{ checkLooseInequality: false }],
    },
    {
      code: 'arr.filter((x) => x == value);',
      options: [{ checkLooseInequality: true }],
    },
    // A loose nil check belongs to `prefer-is-not-nil`, even with the option on.
    {
      code: 'arr.filter((x) => x != null);',
      options: [{ checkLooseInequality: true }],
    },
    {
      code: 'arr.filter((x) => undefined != x);',
      options: [{ checkLooseInequality: true }],
    },
    // The compared value depends on the element, so it is not a fixed value.
    'arr.filter((x) => x !== f(x));',
    'arr.filter((x) => x.next !== x);',
    'arr.filter((x) => lookup[x] !== x);',
    'arr.filter((x) => x !== x);',
    // `function` callbacks are not matched.
    'arr.filter(function (x) { return x !== value; });',
    'arr.filter((x) => x !== value).map((x) => x.id);',
    {
      code: 'arr.filter((x) => x !== value).map((x) => x.id);',
      options: [{ chainPosition: 'outside-chain' }],
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
    },
    {
      code: 'arr.filter((x) => x !== value).map((x) => x.id);',
      options: [{ chainPosition: 'chain-end' }],
    },
    // Type-predicate callbacks are skipped by default: `without` cannot keep the narrowing.
    'arr.filter((x): x is string => x !== value);',
    'results.filter((result): result is Outcome => result !== null);',
    {
      code: 'arr.filter((x): x is string => x !== value);',
      options: [{ skipTypePredicate: true }],
    },
    {
      code: 'arr.filter((item): item is number => item !== value);',
      options: [{ skipTypePredicate: true }],
    },
    // TypeScript infers a predicate for nil / `false` exclusions; `without` widens instead.
    'arr.filter((x) => x !== null);',
    'arr.filter((x) => null !== x);',
    'arr.filter((x) => x !== undefined);',
    'arr.filter((x) => x !== void 0);',
    'steps.filter((step) => step !== false);',
    'const names: string[] = maybe.filter((name) => name !== null);',
    {
      code: 'arr.filter((x): x is string => x !== undefined);',
      options: [{ skipTypePredicate: false }],
    },
    // An optional call yields `undefined` on a nil receiver; `without` would throw.
    'state.hints?.filter((h) => h !== hint);',
    'a?.b.filter((x) => x !== value);',
    'arr.filter?.((x) => x !== value);',
    'a?.b!.filter((x) => x !== value);',
  ],
  invalid: [
    {
      code: 'arr.filter((x) => x != value);',
      options: [{ checkLooseInequality: true }],
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => value != x);',
      options: [{ checkLooseInequality: true }],
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.map((x) => x.id).filter((x) => x != value);',
      options: [{ checkLooseInequality: true, chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => x !== this.current);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      // A property named like the parameter is not a read of it.
      code: 'arr.filter((x) => x !== obj.x);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => x !== value);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => value !== x);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'const xs = (arr as number[]).filter((x) => x !== 0);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x): x is string => x !== value);',
      options: [{ skipTypePredicate: false }],
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      // A predicate on another name does not narrow the element.
      code: 'arr.filter((x): y is string => x !== value);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => x !== true);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: "arr.filter((x) => x !== '');",
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => x !== a?.b);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'listeners = listeners.filter((l) => l !== listener);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x): x is string => value !== x);',
      options: [{ skipTypePredicate: false }],
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => x !== value);',
      options: [{ skipTypePredicate: true }],
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => x !== value).map((x) => x.id);',
      options: [{ chainPosition: 'chain-start' }],
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.map((x) => x.id).filter((x) => x !== value);',
      options: [{ chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => x !== value).map((x) => x.id);',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => x !== value).map((x) => x.id);',
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
      errors: [{ messageId: 'preferWithout' }],
    },
  ],
});
