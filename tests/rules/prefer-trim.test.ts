import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferTrim } from '../../src/rules/prefer-trim.js';

const ruleTester = new RuleTester();

const error = [{ messageId: 'preferTrim' as const }];

ruleTester.run('prefer-trim', preferTrim, {
  valid: [
    "trim(s, '/');",
    "trim(s, ['-', '_']);",
    // Whitespace: native `.trim()` already does that.
    String.raw`s.replace(/^\s+|\s+$/g, '');`,
    "s.replace(/^ +| +$/g, '');",
    String.raw`s.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');`,
    // Without `g` only one end is stripped.
    String.raw`s.replace(/^\/+|\/+$/, '');`,
    // Different characters on each side.
    String.raw`s.replace(/^\/+|-+$/g, '');`,
    String.raw`s.replace(/^[\/\\]+|\/+$/g, '');`,
    // No quantifier: one character only.
    String.raw`s.replace(/^\/|\/$/g, '');`,
    String.raw`s.replace(/^\/+|\/$/g, '');`,
    // Lazy or counted quantifiers.
    String.raw`s.replace(/^\/+?|\/+?$/g, '');`,
    String.raw`s.replace(/^\/{1,}|\/{1,}$/g, '');`,
    // Sequences, groups, ranges, negated and shorthand classes.
    "s.replace(/^(ab)+|(ab)+$/g, '');",
    "s.replace(/^ab+|ab+$/g, '');",
    "s.replace(/^[a-z]+|[a-z]+$/g, '');",
    "s.replace(/^[^x]+|[^x]+$/g, '');",
    String.raw`s.replace(/^\d+|\d+$/g, '');`,
    String.raw`s.replace(/^\w+|\w+$/g, '');`,
    "s.replace(/^.+|.+$/g, '');",
    // Flags that change matching.
    String.raw`s.replace(/^\/+|\/+$/gi, '');`,
    String.raw`s.replace(/^\/+|\/+$/gm, '');`,
    "s.replace(/^x+|x+$/gi, '');",
    // Non-empty or computed replacement.
    String.raw`s.replace(/^\/+|\/+$/g, '/');`,
    String.raw`s.replace(/^\/+|\/+$/g, replacement);`,
    String.raw`s.replace(/^\/+|\/+$/g, () => '');`,
    's.replace(/^\\/+|\\/+$/g, `${x}`);',
    // Not a regex literal.
    String.raw`s.replace(new RegExp('^/+|/+$', 'g'), '');`,
    String.raw`s.replace(re, '');`,
    // Missing or extra arguments, other methods.
    String.raw`s.replace(/^\/+|\/+$/g);`,
    String.raw`s.split(/^\/+|\/+$/g, '');`,
    // A nil receiver short-circuits, `trim` would throw.
    String.raw`s?.replace(/^\/+|\/+$/g, '');`,
    // Chained one-sided replaces with different characters or the same side.
    String.raw`s.replace(/^\/+/, '').replace(/^-+/, '');`,
    String.raw`s.replace(/\/+$/, '').replace(/\/+$/, '');`,
    String.raw`s.replace(/^\/+/, '').replace(/-+$/, '');`,
    // One side is not a trim.
    String.raw`s.replace(/^\/+/, '').replace(/\/$/, '');`,
    // Owned by prefer-trim-start / prefer-trim-end.
    String.raw`s.replace(/^\/+/, '');`,
    String.raw`s.replace(/\/+$/, '');`,
  ],
  invalid: [
    { code: String.raw`s.replace(/^\/+|\/+$/g, '');`, errors: error },
    { code: String.raw`s.replace(/\/+$|^\/+/g, '');`, errors: error },
    { code: String.raw`s.replace(/^\/*|\/*$/g, '');`, errors: error },
    { code: String.raw`s.replace(/^\.+|\.+$/g, "");`, errors: error },
    { code: "s.replace(/^-+|-+$/g, '');", errors: error },
    { code: "s.replace(/^_+|_+$/g, '');", errors: error },
    { code: "s.replace(/^,+|,+$/g, '');", errors: error },
    { code: "s.replace(/^0+|0+$/g, '');", errors: error },
    { code: String.raw`s.replace(/^[\/\\]+|[\/\\]+$/g, '');`, errors: error },
    { code: String.raw`s.replace(/^[-_]+|[_-]+$/g, '');`, errors: error },
    { code: "s.replace(/^[ ,]+|[ ,]+$/g, '');", errors: error },
    { code: 's.replace(/^-+|-+$/g, ``);', errors: error },
    { code: "s.replaceAll(/^-+|-+$/g, '');", errors: error },
    { code: "s.replace(/^-+|-+$/gu, '');", errors: error },
    // Two chained replaces, either order, reported once.
    {
      code: String.raw`s.replace(/^\/+/, '').replace(/\/+$/, '');`,
      errors: error,
    },
    {
      code: String.raw`s.replace(/\/+$/, '').replace(/^\/+/, '');`,
      errors: error,
    },
    {
      code: String.raw`path.replace(/^[\/\\]+/g, '').replace(/[\\\/]+$/g, '');`,
      errors: error,
    },
    // In larger expressions.
    {
      code: "const slug = name.toLowerCase().replace(/^-+|-+$/g, '');",
      errors: error,
    },
    {
      code: String.raw`function clean(p) { return p.replace(/^\/+|\/+$/g, ''); }`,
      errors: error,
    },
    // TypeScript.
    {
      code: String.raw`const clean = (p: string): string => (p as string).replace(/^\/+|\/+$/g, '');`,
      errors: error,
    },
    {
      code: "const a = x.replace(/^-+|-+$/g, ''); const b = y.replace(/^_+|_+$/g, '');",
      errors: [{ messageId: 'preferTrim' }, { messageId: 'preferTrim' }],
    },
  ],
});
