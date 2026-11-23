# Method-call chains

Rules that replace `.filter(...)` or `.reduce(...)` read differently inside a chain:
`compact(items)` is clearer than `items.filter(Boolean)`, but
`users.filter(isActive).map(toId).filter(Boolean)` would have to be unwound to use it. These
rules therefore report only a call that is **outside a method-call chain** by default.

The setting applies to `prefer-compact`, `prefer-difference`, `prefer-difference-by`,
`prefer-difference-with`, `prefer-intersection`, `prefer-mean`, `prefer-mean-by`,
`prefer-sum`, `prefer-sum-by`, and `prefer-without`.

## Values

| `chainPosition`           | Reports the matched call when …                |
| ------------------------- | ---------------------------------------------- |
| `outside-chain` (default) | it has no method call before it and none after |
| `chain-start`             | it has no method call before it                |
| `chain-end`               | it has no method call after it                 |
| `chain-boundaries`        | it is the first or the last call of a chain    |
| `always`                  | anywhere, including the middle of a chain      |

Only adjacent method calls define a chain. A standalone call is both its start and its end.

```js
items.filter(Boolean); // standalone: reported by every value
items.filter(Boolean).map(toId); // chain start: `chain-start`, `chain-boundaries`, `always`
items.map(toId).filter(Boolean); // chain end: `chain-end`, `chain-boundaries`, `always`
items.map(toId).filter(Boolean).join(); // middle: `always` only
```

## Configuring

Set the policy for every chain-aware rule with plugin settings:

```js
export default [
  {
    settings: {
      'es-toolkit': {
        arrayMethods: { chainPosition: 'chain-boundaries' },
      },
    },
  },
];
```

An individual rule can override the global setting:

```js
{
  rules: {
    'es-toolkit/prefer-compact': ['error', { chainPosition: 'always' }],
  },
}
```
