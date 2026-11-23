import type { TSESTree } from '@typescript-eslint/utils';
import {
  browserPairIn,
  isBrowserPairOperand,
  isGlobalObjectLookup,
  windowCheck,
} from '../utils/browser-check.js';
import { createRule } from '../utils/create-rule.js';
import { isExcludedPredicateSite } from '../utils/predicate-site.js';
import { typeofComparison } from '../utils/type-test.js';

const typeofWindowUndefined = `${typeofComparison('undefined')}:matches([left.argument.name="window"], [right.argument.name="window"])`;

type PreferIsBrowserOptions = [{ reportLoneWindowCheck?: boolean }];

export const preferIsBrowser = createRule<
  PreferIsBrowserOptions,
  'preferIsBrowser'
>({
  name: 'prefer-is-browser',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isBrowser` from es-toolkit instead of `typeof window !== "undefined"`.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          reportLoneWindowCheck: {
            type: 'boolean',
            description:
              'Report a `typeof window` check without a `document` check. `isBrowser` also requires `window.document`, so set to `false` to report only window + document pairs. Defaults to `true`.',
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [
      { reportLoneWindowCheck: true },
    ] satisfies PreferIsBrowserOptions,
    messages: {
      preferIsBrowser:
        'Prefer `isBrowser` from es-toolkit instead of checking `typeof window` by hand.',
    },
  },
  create(context, [{ reportLoneWindowCheck }]) {
    const { sourceCode } = context;
    const isReportable = (node: TSESTree.Node) =>
      !isExcludedPredicateSite(sourceCode, node, 'isBrowser');
    return {
      [typeofWindowUndefined](node: TSESTree.BinaryExpression) {
        const inBrowser = windowCheck(sourceCode, node);
        if (
          reportLoneWindowCheck
          && inBrowser !== undefined
          && !isGlobalObjectLookup(node, inBrowser)
          && !isBrowserPairOperand(sourceCode, node)
          && isReportable(node)
        )
          context.report({ node, messageId: 'preferIsBrowser' });
      },
      'LogicalExpression[operator=/^(&&|\\|\\|)$/]'(
        node: TSESTree.LogicalExpression,
      ) {
        const loc = browserPairIn(sourceCode, node);
        if (loc && isReportable(node))
          context.report({ loc, messageId: 'preferIsBrowser' });
      },
    };
  },
});
