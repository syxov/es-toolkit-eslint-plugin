import type { TSESTree } from '@typescript-eslint/utils';
import { isOptionalCall } from './optional-chain.js';

export type TrimSide = 'start' | 'end' | 'both';

interface TrimPattern {
  side: TrimSide;
  chars: Set<string>;
}

type OneSided = TrimPattern & { side: 'start' | 'end' };

// `.replace(/…/, '')` or `.replaceAll(/…/g, '')` with an empty string or template replacement.
// The JS side checks that the regex strips one run of characters at an end.
const replaceCall =
  'CallExpression[callee.type="MemberExpression"][callee.computed=false][callee.property.name=/^replace(All)?$/][arguments.length=2][arguments.0.regex]';
export const emptyReplaceCalls = [
  `${replaceCall}[arguments.1.type="Literal"][arguments.1.value=""]`,
  `${replaceCall}[arguments.1.type="TemplateLiteral"][arguments.1.expressions.length=0][arguments.1.quasis.0.value.cooked=""]`,
].join(', ');

// Characters with a meaning outside a character class. `/` only appears escaped in a literal.
const SPECIALS = new Set('^$\\.*+?()[]{}|/');

// `\/`, `\.`, `\-`: an escaped punctuation character stands for itself. Letter and digit
// escapes are shorthand classes (`\d`, `\s`), control characters or code points.
const identityEscape = (char: string) =>
  char !== '' && !/[\da-z]/i.test(char) ? char : undefined;

type Atom = [chars: string[], next: number];

const parseClass = (source: string, start: number): Atom | undefined => {
  if (source.charAt(start) === '^') return undefined;
  const chars: string[] = [];
  for (let index = start; index < source.length; index++) {
    const char = source.charAt(index);
    if (char === ']') return chars.length > 0 ? [chars, index + 1] : undefined;
    if (char === '\\') {
      const escaped = identityEscape(source.charAt(++index));
      if (!escaped) return undefined;
      chars.push(escaped);
    } else if (
      char === '-'
      && index !== start
      && source.charAt(index + 1) !== ']'
    ) {
      return undefined;
    } else {
      chars.push(char);
    }
  }
  return undefined;
};

// One literal character, an escaped one, or a class of literal characters.
const parseAtom = (source: string): Atom | undefined => {
  const char = source.charAt(0);
  if (char === '\\') {
    const escaped = identityEscape(source.charAt(1));
    return escaped ? [[escaped], 2] : undefined;
  }
  if (char === '[') return parseClass(source, 1);
  return char === '' || SPECIALS.has(char) ? undefined : [[char], 1];
};

// `^X+` or `X+$`, with `+` or `*` as a greedy quantifier.
const parseSide = (part: string): OneSided | undefined => {
  const anchoredStart = part.startsWith('^');
  const body = anchoredStart ? part.slice(1) : part;
  const atom = parseAtom(body);
  if (!atom) return undefined;
  const [chars, next] = atom;
  const quantifier = body.charAt(next);
  if (quantifier !== '+' && quantifier !== '*') return undefined;
  const tail = body.slice(next + 1);
  const side =
    anchoredStart && tail === ''
      ? 'start'
      : !anchoredStart && tail === '$'
        ? 'end'
        : undefined;
  return side && { side, chars: new Set(chars) };
};

const sameChars = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every(char => b.has(char));

// `^X+|X+$` in either order, the same X on both sides.
const parseBoth = (pattern: string): TrimPattern | undefined => {
  for (let index = pattern.indexOf('|'); index !== -1;) {
    const left = parseSide(pattern.slice(0, index));
    const right = parseSide(pattern.slice(index + 1));
    if (
      left
      && right
      && left.side !== right.side
      && sameChars(left.chars, right.chars)
    )
      return { side: 'both', chars: left.chars };
    index = pattern.indexOf('|', index + 1);
  }
  return undefined;
};

// Native `.trim()` / `.trimStart()` / `.trimEnd()` already strip whitespace.
const isWhitespaceOnly = (chars: Set<string>) =>
  [...chars].every(char => /\s/.test(char));

// `i` and `m` change what matches, `y` and `v` change how; `d`, `s` and `u` do not matter here.
const NEUTRAL_FLAGS = /^[dgsu]*$/;

export const trimPatternOf = (
  call: TSESTree.CallExpression,
): TrimPattern | undefined => {
  if (isOptionalCall(call)) return undefined;
  const [regexArg] = call.arguments as [TSESTree.RegExpLiteral];
  const { pattern, flags } = regexArg.regex;
  const global = flags.includes('g');
  const callee = call.callee as TSESTree.MemberExpression;
  if (
    !NEUTRAL_FLAGS.test(flags)
    || (!global
      && (callee.property as TSESTree.Identifier).name === 'replaceAll')
  )
    return undefined;
  const trim = parseSide(pattern) ?? (global ? parseBoth(pattern) : undefined);
  return trim && !isWhitespaceOnly(trim.chars) ? trim : undefined;
};

const isEmptyReplaceCall = (
  node: TSESTree.Node,
): node is TSESTree.CallExpression & {
  callee: TSESTree.MemberExpression;
} => {
  if (
    node.type !== 'CallExpression'
    || node.arguments.length !== 2
    || node.callee.type !== 'MemberExpression'
    || node.callee.computed
    || node.callee.property.type !== 'Identifier'
    || !/^replace(All)?$/.test(node.callee.property.name)
  )
    return false;
  const [regex, replacement] = node.arguments;
  return (
    regex.type === 'Literal'
    && 'regex' in regex
    && ((replacement.type === 'Literal' && replacement.value === '')
      || (replacement.type === 'TemplateLiteral'
        && replacement.expressions.length === 0
        && replacement.quasis[0]?.value.cooked === ''))
  );
};

const oneSided = (node: TSESTree.Node) => {
  if (!isEmptyReplaceCall(node)) return undefined;
  const trim = trimPatternOf(node);
  return trim?.side === 'both' ? undefined : trim;
};

// `s.replace(/^\/+/, '').replace(/\/+$/, '')`, either order: one `trim`, reported at the
// outer call by prefer-trim, and skipped by prefer-trim-start / prefer-trim-end.
export const isTrimPair = (outer: TSESTree.CallExpression) => {
  const first = oneSided(outer);
  const inner = (outer.callee as TSESTree.MemberExpression).object;
  const second = first && oneSided(inner);
  return (
    !!second
    && first.side !== second.side
    && sameChars(first.chars, second.chars)
  );
};

export const isInTrimPair = (call: TSESTree.CallExpression) => {
  const { parent } = call;
  return (
    isTrimPair(call)
    || (parent.type === 'MemberExpression'
      && parent.object === call
      && parent.parent.type === 'CallExpression'
      && parent.parent.callee === parent
      && isTrimPair(parent.parent))
  );
};
