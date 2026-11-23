# prefer-trim

Prefer [`trim`](https://es-toolkit.dev/reference/string/trim.html) from es-toolkit over
stripping a run of characters from both ends of a string with `.replace`.

`trim(s, chars)` removes every leading and trailing character listed in `chars` (a string
or an array of single characters). The hand-written regex `/^-+|-+$/g` says the same thing
in a form that is easy to get subtly wrong: without the `g` flag it only strips the start.

## Rule details

This rule reports — it does **not** auto-fix — a `.replace(re, '')` or `.replaceAll(re, '')`
call where `re` is a regex literal with the `g` flag of the form `^X+|X+$` (either order),
and:

- `X` is one literal character, escaped or not (`\/`, `\.`, `-`, `_`, `0`, `"`), or a
  character class of literal characters (`[\/\\]`, `[-_]`), the same on both sides;
- the quantifier is a greedy `+` or `*`;
- no flag other than `g`, `u`, `s` or `d` is set;
- the replacement is an empty string or an empty template literal.

It also reports two chained one-sided replaces that strip the same characters from both
ends, `s.replace(/^\/+/, '').replace(/\/+$/, '')` in either order. That chain is reported
once, by this rule; [`prefer-trim-start`](prefer-trim-start.md) and
[`prefer-trim-end`](prefer-trim-end.md) leave it alone.

### ❌ Incorrect

```js
slug.replace(/^-+|-+$/g, '');
path.replace(/^[\/\\]+|[\/\\]+$/g, '');
value.replace(/^"+|"+$/g, '');
path.replace(/^\/+/, '').replace(/\/+$/, '');
```

### ✅ Correct

```js
import { trim } from 'es-toolkit';

trim(slug, '-');
trim(path, ['/', '\\']);
trim(value, '"');
trim(path, '/');

// Not a trim of one character set — left untouched:
s.replace(/^\s+|\s+$/g, ''); // whitespace: use the native `s.trim()`
s.replace(/^-+|-+$/, ''); // no `g` flag: only the start is stripped
s.replace(/^\/|\/$/g, ''); // no quantifier: one character at each end
s.replace(/^\/+|-+$/g, ''); // different characters at each end
s.replace(/^(ab)+|(ab)+$/g, ''); // a sequence, not a set of characters
s.replace(/^[a-z]+|[a-z]+$/gi, ''); // ranges and the `i` flag
```

## Limitations

- **Receiver type is not checked.** Any `.replace` / `.replaceAll` call with this shape is
  assumed to be on a string. `.replace` with a regex and an empty string on anything else
  is rare.
- **Whitespace is left to the native method.** A set made only of whitespace characters
  (`\s`, ` `, `\t`, `[\s\uFEFF\xA0]`) is not reported: `s.trim()` already covers it. A set
  that mixes whitespace with other characters (`[ ,]`) is reported.
- **Regex-literal form only.** A pattern built with `new RegExp(...)` or held in a variable,
  and a replacement held in a variable or produced by a function, are not detected.
- **Literal characters only.** Shorthand classes (`\d`, `\w`), ranges (`[a-z]`), negated
  classes (`[^x]`), `.` and code-point escapes (`\u002F`, `\x2F`) are not parsed, nor are the
  `i`, `m`, `y` and `v` flags.
- **Optional chains are skipped.** `s?.replace(…)` yields `undefined` for a nil `s`, where
  `trim(s, …)` would throw.
- **Chains.** Inside a longer `.replace(…).replace(…)` chain the rewrite wraps the part of
  the chain before the call; only two adjacent one-sided calls are merged into one report.
- **No auto-fix by design.** The fix requires adding an `import { trim } from 'es-toolkit'`.
