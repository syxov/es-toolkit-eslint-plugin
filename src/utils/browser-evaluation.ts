// callbacks serialised to a page (`page.evaluate`): the promise rules

import type { TSESTree } from '@typescript-eslint/utils';

// Puppeteer / Playwright serialise these callbacks and run them in the page, where an
// imported es-toolkit helper is not defined.
const browserEvaluation =
  /^(\$\$?eval|addInitScript|evaluate|evaluateHandle|evaluateOnNewDocument|waitForFunction)$/;

export const isEvaluatedInBrowser = (node: TSESTree.Node) => {
  for (let current = node.parent; current; current = current.parent) {
    const { parent } = current;
    if (
      current.type.includes('Function')
      && parent?.type === 'CallExpression'
      && parent.arguments.includes(current as TSESTree.CallExpressionArgument)
      && parent.callee.type === 'MemberExpression'
      && parent.callee.property.type === 'Identifier'
      && browserEvaluation.test(parent.callee.property.name)
    )
      return true;
  }
  return false;
};
