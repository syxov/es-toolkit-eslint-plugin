import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferEscapeRegExp } from '../../src/rules/prefer-escape-reg-exp.js';

const ruleTester = new RuleTester();

// Linted source fragments. Patterns containing `${` cannot be written with `String.raw`,
// so they use plain strings; the trailing comment shows the linted source.

// Regex literals that escape every special character.
const MDN = '/[.*+?^${}()|[\\]\\\\]/g'; // /[.*+?^${}()|[\]\\]/g
const LODASH = String.raw`/[\\^$.*+?()[\]{}|]/g`;
const WITH_DASH_AND_SLASH = String.raw`/[-\/\\^$*+?.()|[\]{}]/g`;
const WITH_SLASH = '/[.*+?^${}()|[\\]\\\\\\/]/g'; // /[.*+?^${}()|[\]\\\/]/g

// Near-miss regex literals.
const NO_FLAGS = '/[.*+?^${}()|[\\]\\\\]/'; // /[.*+?^${}()|[\]\\]/
const IGNORE_CASE_ONLY = '/[.*+?^${}()|[\\]\\\\]/i'; // /[.*+?^${}()|[\]\\]/i
const MISSING_BACKSLASH = '/[.*+?^${}()|[\\]]/g'; // /[.*+?^${}()|[\]]/g
const NEGATED = '/[^.*+?^${}()|[\\]\\\\]/g'; // /[^.*+?^${}()|[\]\\]/g
const QUANTIFIED = '/[.*+?^${}()|[\\]\\\\]+/g'; // /[.*+?^${}()|[\]\\]+/g

// Replacements that evaluate to `\$&`.
const SINGLE = String.raw`'\\$&'`;
const DOUBLE = String.raw`"\\$&"`;
const TEMPLATE = '`\\\\$&`'; // `\\$&`

// Near-miss replacements.
const DOUBLE_ESCAPED = String.raw`'\\\\$&'`;
const GROUP_REFERENCE = String.raw`'\\$1'`;
const TEMPLATE_WITH_EXPRESSION = '`\\\\${x}`'; // `\\${x}`
const CALLBACK = String.raw`m => '\\' + m`;

ruleTester.run('prefer-escape-reg-exp', preferEscapeRegExp, {
  valid: [
    'escapeRegExp(s);',
    'new RegExp(escapeRegExp(s), "g");',
    // Different replacement.
    `s.replace(${MDN}, '');`,
    `s.replace(${MDN}, ${DOUBLE_ESCAPED});`,
    `s.replace(${MDN}, '$&');`,
    `s.replace(${MDN}, ${GROUP_REFERENCE});`,
    `s.replace(${MDN}, ${TEMPLATE_WITH_EXPRESSION});`,
    `s.replace(${MDN}, ${CALLBACK});`,
    `s.replace(${MDN}, replacement);`,
    // Missing or extra arguments.
    `s.replace(${MDN});`,
    `s.replace(${MDN}, ${SINGLE}, extra);`,
    // No `g` flag.
    `s.replace(${NO_FLAGS}, ${SINGLE});`,
    `s.replace(${IGNORE_CASE_ONLY}, ${SINGLE});`,
    // Not every special character.
    `s.replace(/[.*+?]/g, ${SINGLE});`,
    `s.replace(${MISSING_BACKSLASH}, ${SINGLE});`,
    `s.replace(/[abc]/g, ${SINGLE});`,
    `s.replace(/a/g, ${SINGLE});`,
    // Not a single, non-negated character class.
    `s.replace(${NEGATED}, ${SINGLE});`,
    `s.replace(${QUANTIFIED}, ${SINGLE});`,
    // Not a regex literal.
    String.raw`s.replace(re, '\\$&');`,
    String.raw`s.replace(new RegExp('[.]', 'g'), '\\$&');`,
    String.raw`s.replace('.', '\\$&');`,
    // Different method.
    `s.split(${MDN}, ${SINGLE});`,
    `s.match(${MDN});`,
  ],
  invalid: [
    {
      code: `s.replace(${MDN}, ${SINGLE});`,
      errors: [{ messageId: 'preferEscapeRegExp' }],
    },
    {
      code: `s.replace(${LODASH}, ${SINGLE});`,
      errors: [{ messageId: 'preferEscapeRegExp' }],
    },
    {
      code: `s.replace(${WITH_DASH_AND_SLASH}, ${SINGLE});`,
      errors: [{ messageId: 'preferEscapeRegExp' }],
    },
    {
      code: `s.replace(${WITH_SLASH}, ${SINGLE});`,
      errors: [{ messageId: 'preferEscapeRegExp' }],
    },
    {
      code: `s.replaceAll(${MDN}, ${SINGLE});`,
      errors: [{ messageId: 'preferEscapeRegExp' }],
    },
    {
      code: `s.replaceAll(${LODASH}, ${DOUBLE});`,
      errors: [{ messageId: 'preferEscapeRegExp' }],
    },
    {
      code: `s.replace(${MDN}, ${DOUBLE});`,
      errors: [{ messageId: 'preferEscapeRegExp' }],
    },
    {
      code: `s.replace(${MDN}, ${TEMPLATE});`,
      errors: [{ messageId: 'preferEscapeRegExp' }],
    },
    {
      code: `input.trim().replace(${MDN}, ${SINGLE});`,
      errors: [{ messageId: 'preferEscapeRegExp' }],
    },
    {
      code: `new RegExp(s.replace(${MDN}, ${SINGLE}), 'g');`,
      errors: [{ messageId: 'preferEscapeRegExp' }],
    },
    {
      code: `const escaped = s.replace(${MDN}, ${SINGLE});`,
      errors: [{ messageId: 'preferEscapeRegExp' }],
    },
    {
      code: `function escape(s) { return s.replace(${LODASH}, ${SINGLE}); }`,
      errors: [{ messageId: 'preferEscapeRegExp' }],
    },
    {
      code: `(s as string).replace(${MDN}, ${SINGLE});`,
      errors: [{ messageId: 'preferEscapeRegExp' }],
    },
    {
      code: `const escape = (s: string): string => s.replace(${MDN}, ${SINGLE});`,
      errors: [{ messageId: 'preferEscapeRegExp' }],
    },
    {
      code: `function escape<T extends string>(s: T): string { return s.replaceAll(${WITH_DASH_AND_SLASH}, ${TEMPLATE}); }`,
      errors: [{ messageId: 'preferEscapeRegExp' }],
    },
    {
      code: `const a = x.replace(${MDN}, ${SINGLE}); const b = y.replace(${LODASH}, ${DOUBLE});`,
      errors: [
        { messageId: 'preferEscapeRegExp' },
        { messageId: 'preferEscapeRegExp' },
      ],
    },
  ],
});
