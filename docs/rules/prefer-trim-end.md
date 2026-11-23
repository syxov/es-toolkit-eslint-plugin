# prefer-trim-end

Prefer [`trimEnd`](https://es-toolkit.dev/reference/string/trimEnd.html) from es-toolkit
over stripping a run of trailing characters with `.replace`.

`trimEnd(s, chars)` removes every trailing character listed in `chars` (a string or an
array of single characters), which reads more directly than `url.replace(/\/+$/, '')`.

## Rule details

This rule reports — it does **not** auto-fix — a `.replace(re, '')` or `.replaceAll(re, '')`
call where `re` is a regex literal of the form `X+$`, and:

- `X` is one literal character, escaped or not (`\/`, `\.`, `-`, `=`, `0`, `,`), or a
  character class of literal characters (`[\/\\]`, `[. ]`);
- the quantifier is a greedy `+` or `*`;
- no flag other than `g`, `u`, `s` or `d` is set (`.replaceAll` requires `g`);
- the replacement is an empty string or an empty template literal.

`s.replace(/^\/+/, '').replace(/\/+$/, '')`, which strips the same characters from both
ends, belongs to [`prefer-trim`](prefer-trim.md) and is not reported here.

### ❌ Incorrect

```js
baseUrl.replace(/\/+$/, '');
base64.replace(/=+$/, '');
fraction.replace(/0+$/, '');
segment.replace(/[. ]+$/, '');
```

### ✅ Correct

```js
import { trimEnd } from 'es-toolkit';

trimEnd(baseUrl, '/');
trimEnd(base64, '=');
trimEnd(fraction, '0');
trimEnd(segment, ['.', ' ']);

// Left untouched:
s.replace(/\s+$/, ''); // whitespace: use the native `s.trimEnd()`
s.replace(/\/$/, ''); // no quantifier: removes one character only
s.replace(/\.0+$/, ''); // a sequence, not a set of characters
s.replace(/\d+$/, ''); // a shorthand class
s.replace(/x+$/gm, ''); // `m` anchors at every line
```

## Limitations

- **Receiver type is not checked.** Any `.replace` / `.replaceAll` call with this shape is
  assumed to be on a string. `.replace` with a regex and an empty string on anything else
  is rare.
- **Whitespace is left to the native method.** A set made only of whitespace characters
  (`\s`, ` `, `\r\n`, `[\s\uFEFF\xA0]`) is not reported: `s.trimEnd()` already covers it. A
  set that mixes whitespace with other characters (`[. ]`) is reported.
- **Regex-literal form only.** A pattern built with `new RegExp(...)` or held in a variable,
  and a replacement held in a variable or produced by a function, are not detected.
- **Literal characters only.** Shorthand classes (`\d`, `\w`), ranges (`[a-z]`), negated
  classes (`[^x]`), `.` and code-point escapes (`\u002F`, `\x2F`) are not parsed, nor are the
  `i`, `m`, `y` and `v` flags.
- **Optional chains are skipped.** `s?.replace(…)` yields `undefined` for a nil `s`, where
  `trimEnd(s, …)` would throw.
- **Chains.** Inside a longer `.replace(…).replace(…)` chain the rewrite wraps the part of
  the chain before the call.
- **No auto-fix by design.** The fix requires adding an
  `import { trimEnd } from 'es-toolkit'`.
