# prefer-escape-reg-exp

Prefer [`escapeRegExp`](https://es-toolkit.dev/reference/string/escapeRegExp.html) from
es-toolkit over escaping regex special characters with a hand-written `.replace` call.

`escapeRegExp(s)` backslash-escapes every character that has a meaning in a regular
expression, so the result can be embedded in `new RegExp(...)` as literal text. The
hand-written version is a dense character class that is easy to get subtly wrong (a
missing `\` or `]` silently leaves a special character unescaped).

## Rule details

This rule reports — it does **not** auto-fix — a `.replace(re, repl)` or
`.replaceAll(re, repl)` call with exactly two arguments where:

- `re` is a regex literal with the `g` flag whose whole pattern is a single, non-negated
  character class with no quantifier;
- the class contains every regex special character `. * + ? ^ $ { } ( ) | [ ] \`
  (`-` and `/` may also appear, escaped or not), and nothing else;
- `repl` is the string `'\\$&'` (cooked value `\$&`), written with single or double
  quotes or as a template literal without expressions.

### ❌ Incorrect

```js
s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
s.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
s.replaceAll(/[-\/\\^$*+?.()|[\]{}]/g, `\\$&`);
new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
```

### ✅ Correct

```js
import { escapeRegExp } from 'es-toolkit';

escapeRegExp(s);
new RegExp(escapeRegExp(s), 'g');

// Not a full escape — left untouched:
s.replace(/[.*+?]/g, '\\$&'); // only some special characters
s.replace(/[.*+?^${}()|[\]\\]/g, ''); // removes them instead of escaping
s.replace(/[.*+?^${}()|[\]\\]/, '\\$&'); // no `g` flag: only the first match
```

## Limitations

- **Regex-literal form only.** The pattern must be a regex literal; a pattern built with
  `new RegExp(...)` or held in a variable is not detected.
- **`\$&` replacement only.** A callback replacement such as `m => '\\' + m` or a
  replacement held in a variable is not detected.
- **Every special character is required.** A class with a hand-picked subset of the
  special characters is not reported, since it does not behave like `escapeRegExp`.
- **Receiver type is not checked.** Any `.replace` / `.replaceAll` call with this shape is
  reported, whatever the receiver is.
- **No auto-fix by design.** The fix requires adding an
  `import { escapeRegExp } from 'es-toolkit'`.
