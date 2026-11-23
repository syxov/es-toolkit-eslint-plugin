import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isExcludedPredicateSite } from '../utils/predicate-site.js';

type Side = 'left' | 'right';

const objectKeysLength = (path: string) =>
  `[${path}.property.name="length"][${path}.object.callee.object.name="Object"][${path}.object.callee.property.name="keys"]`;

// esquery compares attribute values as strings, so `raw` keeps `'0'` from matching.
const zero = (side: Side) => `[${side}.type="Literal"][${side}.raw="0"]`;

const keysAgainstZero = (operator: string, keys: Side, literal: Side) =>
  `BinaryExpression[operator=${operator}]${objectKeysLength(keys)}${zero(literal)}`;

const keysLengthChecks = [
  // `=== 0` / `!== 0` (loose too), in either operand order.
  keysAgainstZero('/^[!=]==?$/', 'left', 'right'),
  keysAgainstZero('/^[!=]==?$/', 'right', 'left'),
  // `length > 0` / `0 < length`.
  keysAgainstZero('">"', 'left', 'right'),
  keysAgainstZero('"<"', 'right', 'left'),
  // `!Object.keys(obj).length` — a falsy length means no keys.
  `UnaryExpression[operator="!"]${objectKeysLength('argument')}`,
];

export const preferIsEmpty = createRule({
  name: 'prefer-is-empty',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isEmpty` from es-toolkit/compat instead of comparing `Object.keys(obj).length` with `0`.',
    },
    schema: [],
    messages: {
      preferIsEmpty:
        'Prefer `isEmpty` from es-toolkit/compat instead of checking `Object.keys(obj).length`.',
    },
  },
  create(context) {
    return {
      [keysLengthChecks.join(', ')](node: TSESTree.Node) {
        if (!isExcludedPredicateSite(context.sourceCode, node, 'isEmpty'))
          context.report({ node, messageId: 'preferIsEmpty' });
      },
    };
  },
});
