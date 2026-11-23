import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferTrimEnd } from '../../src/rules/prefer-trim-end.js';

const ruleTester = new RuleTester();

const error = [{ messageId: 'preferTrimEnd' as const }];

ruleTester.run('prefer-trim-end', preferTrimEnd, {
  valid: [
    "trimEnd(s, '/');",
    // Whitespace: native `.trimEnd()` already does that.
    String.raw`s.replace(/\s+$/, '');`,
    String.raw`s.replace(/\s*$/, '');`,
    "s.replace(/ +$/, '');",
    String.raw`s.replace(/[\s\uFEFF\xA0]+$/, '');`,
    String.raw`s.replace(/[\r\n]+$/, '');`,
    // No quantifier: one character only.
    String.raw`s.replace(/\/$/, '');`,
    String.raw`s.replace(/\.$/, '');`,
    // Lazy or counted quantifiers.
    String.raw`s.replace(/\/+?$/, '');`,
    String.raw`s.replace(/\/{1,}$/, '');`,
    // Not anchored.
    String.raw`s.replace(/\/+/g, '');`,
    // Sequences, groups, ranges, negated and shorthand classes.
    "s.replace(/ab+$/, '');",
    "s.replace(/(ab)+$/, '');",
    "s.replace(/[a-z]+$/, '');",
    "s.replace(/[^x]+$/, '');",
    String.raw`s.replace(/\d+$/, '');`,
    String.raw`s.replace(/\w+$/, '');`,
    String.raw`s.replace(/\.0+$/, '');`,
    // Flags that change matching.
    "s.replace(/x+$/i, '');",
    String.raw`s.replace(/\/+$/m, '');`,
    String.raw`s.replace(/\/+$/gm, '');`,
    // Non-empty or computed replacement.
    String.raw`s.replace(/\/+$/, '/');`,
    String.raw`s.replace(/\/+$/, fn);`,
    // `replaceAll` needs `g`.
    String.raw`s.replaceAll(/\/+$/, '');`,
    // Not a regex literal.
    String.raw`s.replace(new RegExp('/+$'), '');`,
    // A nil receiver short-circuits, `trimEnd` would throw.
    String.raw`s?.replace(/\/+$/, '');`,
    // Both ends: owned by prefer-trim.
    String.raw`s.replace(/^\/+|\/+$/g, '');`,
    String.raw`s.replace(/^\/+/, '').replace(/\/+$/, '');`,
    String.raw`s.replace(/\/+$/, '').replace(/^\/+/, '');`,
  ],
  invalid: [
    { code: String.raw`s.replace(/\/+$/, '');`, errors: error },
    { code: String.raw`s.replace(/\/*$/, '');`, errors: error },
    { code: String.raw`s.replace(/\/+$/g, '');`, errors: error },
    { code: String.raw`s.replace(/\.+$/, "");`, errors: error },
    { code: "s.replace(/-+$/, '');", errors: error },
    { code: "s.replace(/0+$/, '');", errors: error },
    { code: "s.replace(/,+$/, '');", errors: error },
    { code: String.raw`s.replace(/[\/\\]+$/, '');`, errors: error },
    { code: "s.replace(/[-_]+$/, '');", errors: error },
    { code: 's.replace(/=+$/, ``);', errors: error },
    { code: String.raw`s.replaceAll(/\/+$/g, '');`, errors: error },
    // Different characters on the other end: two separate trims.
    {
      code: String.raw`s.replace(/-+$/, '').replace(/^\/+/, '');`,
      errors: error,
    },
    // In larger expressions.
    {
      code: String.raw`const base = url.replace(/\/+$/, '') + '/api';`,
      errors: error,
    },
    {
      code: "function fmt(n) { return n.toFixed(2).replace(/0+$/, ''); }",
      errors: error,
    },
    // TypeScript.
    {
      code: String.raw`const base = (url: string): string => url.replace(/\/+$/, '');`,
      errors: error,
    },
    {
      code: String.raw`const a = (x as string).replace(/\/+$/, ''); const b = y.replace(/-+$/, '');`,
      errors: [{ messageId: 'preferTrimEnd' }, { messageId: 'preferTrimEnd' }],
    },
  ],
});
