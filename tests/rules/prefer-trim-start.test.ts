import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferTrimStart } from '../../src/rules/prefer-trim-start.js';

const ruleTester = new RuleTester();

const error = [{ messageId: 'preferTrimStart' as const }];

ruleTester.run('prefer-trim-start', preferTrimStart, {
  valid: [
    "trimStart(s, '/');",
    // Whitespace: native `.trimStart()` already does that.
    String.raw`s.replace(/^\s+/, '');`,
    String.raw`s.replace(/^\s*/, '');`,
    "s.replace(/^ +/, '');",
    String.raw`s.replace(/^[\s\uFEFF\xA0]+/, '');`,
    String.raw`s.replace(/^\t+/, '');`,
    // No quantifier: one character only.
    String.raw`s.replace(/^\//, '');`,
    "s.replace(/^0/, '');",
    // Lazy or counted quantifiers.
    String.raw`s.replace(/^\/+?/, '');`,
    String.raw`s.replace(/^\/{2,}/, '');`,
    // Not anchored, or anchored at both ends.
    String.raw`s.replace(/\/+/, '');`,
    String.raw`s.replace(/^\/+$/, '');`,
    // Sequences, groups, ranges, negated and shorthand classes.
    "s.replace(/^ab+/, '');",
    "s.replace(/^(ab)+/, '');",
    "s.replace(/^(?:a)+/, '');",
    "s.replace(/^[a-z]+/, '');",
    String.raw`s.replace(/^[\/-_]+/, '');`,
    "s.replace(/^[^x]+/, '');",
    String.raw`s.replace(/^\d+/, '');`,
    String.raw`s.replace(/^\w+/, '');`,
    "s.replace(/^\\u002F+/, '');",
    "s.replace(/^.+/, '');",
    "s.replace(/^[]+/, '');",
    // Flags that change matching.
    "s.replace(/^x+/i, '');",
    String.raw`s.replace(/^\/+/m, '');`,
    String.raw`s.replace(/^\/+/y, '');`,
    // Non-empty or computed replacement.
    String.raw`s.replace(/^\/+/, '/');`,
    String.raw`s.replace(/^\/+/, x);`,
    String.raw`s.replace(/^\/+/, m => '');`,
    // `replaceAll` needs `g`.
    String.raw`s.replaceAll(/^\/+/, '');`,
    // Not a regex literal.
    String.raw`s.replace(new RegExp('^/+'), '');`,
    "s.replace('/', '');",
    // A nil receiver short-circuits, `trimStart` would throw.
    String.raw`s?.replace(/^\/+/, '');`,
    String.raw`a?.b.replace(/^\/+/, '');`,
    // Both ends: owned by prefer-trim.
    String.raw`s.replace(/^\/+|\/+$/g, '');`,
    String.raw`s.replace(/^\/+/, '').replace(/\/+$/, '');`,
    String.raw`s.replace(/\/+$/, '').replace(/^\/+/, '');`,
  ],
  invalid: [
    { code: String.raw`s.replace(/^\/+/, '');`, errors: error },
    { code: String.raw`s.replace(/^\/*/, '');`, errors: error },
    { code: String.raw`s.replace(/^\/+/g, '');`, errors: error },
    { code: String.raw`s.replace(/^\.+/, "");`, errors: error },
    { code: "s.replace(/^-+/, '');", errors: error },
    { code: "s.replace(/^_+/, '');", errors: error },
    { code: "s.replace(/^0+/, '');", errors: error },
    { code: "s.replace(/^,+/, '');", errors: error },
    { code: "s.replace(/^#+/, '');", errors: error },
    { code: String.raw`s.replace(/^[\/\\]+/, '');`, errors: error },
    { code: "s.replace(/^[-_]+/, '');", errors: error },
    { code: "s.replace(/^[_-]+/, '');", errors: error },
    { code: String.raw`s.replace(/^[.\/]+/u, '');`, errors: error },
    { code: 's.replace(/^-+/, ``);', errors: error },
    { code: String.raw`s.replaceAll(/^\/+/g, '');`, errors: error },
    // Different characters on the other end: two separate trims.
    {
      code: String.raw`s.replace(/^\/+/, '').replace(/-+$/, '');`,
      errors: error,
    },
    // In larger expressions.
    {
      code: String.raw`const rel = path.trim().replace(/^\/+/, '');`,
      errors: error,
    },
    {
      code: "function strip(n) { return String(n).replace(/^0+/, ''); }",
      errors: error,
    },
    // TypeScript.
    {
      code: String.raw`const strip = (p: string): string => p!.replace(/^\/+/, '');`,
      errors: error,
    },
    {
      code: "const strip = <T extends string>(p: T) => (p as string).replace(/^[-_]+/, '');",
      errors: error,
    },
  ],
});
