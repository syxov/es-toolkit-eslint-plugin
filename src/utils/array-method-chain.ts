import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';

export const chainPositions = [
  'always',
  'chain-start',
  'chain-end',
  'chain-boundaries',
  'outside-chain',
] as const;

export type ChainPosition = (typeof chainPositions)[number];
export interface ChainPositionOption {
  chainPosition?: ChainPosition;
}
export type ArrayMethodRuleOptions = [ChainPositionOption];

export const chainPositionOption: JSONSchema4 = {
  type: 'string',
  enum: [...chainPositions],
  description:
    'Where in a method chain the call is reported. Overrides `settings["es-toolkit"].arrayMethods.chainPosition`.',
};

export const arrayMethodRuleSchema: JSONSchema4[] = [
  {
    type: 'object',
    properties: { chainPosition: chainPositionOption },
    additionalProperties: false,
  },
];

const isChainPosition = (value: unknown): value is ChainPosition =>
  typeof value === 'string'
  && (chainPositions as readonly string[]).includes(value);

const isMethodCall = (node: TSESTree.Node): node is TSESTree.CallExpression =>
  node.type === 'CallExpression' && node.callee.type === 'MemberExpression';

const hasPreviousMethodCall = (node: TSESTree.CallExpression) =>
  node.callee.type === 'MemberExpression' && isMethodCall(node.callee.object);

const hasNextMethodCall = (node: TSESTree.CallExpression) => {
  const { parent } = node;
  return (
    parent.type === 'MemberExpression'
    && parent.object === node
    && parent.parent.type === 'CallExpression'
    && parent.parent.callee === parent
    && isMethodCall(parent.parent)
  );
};

const getGlobalChainPosition = (
  settings: TSESLint.SharedConfigurationSettings,
) => {
  const pluginSettings = settings['es-toolkit'];
  if (typeof pluginSettings !== 'object' || pluginSettings === null)
    return undefined;

  const arrayMethods = (pluginSettings as { arrayMethods?: unknown })
    .arrayMethods;
  if (typeof arrayMethods !== 'object' || arrayMethods === null)
    return undefined;

  const chainPosition = (arrayMethods as { chainPosition?: unknown })
    .chainPosition;
  return isChainPosition(chainPosition) ? chainPosition : undefined;
};

export const shouldReportArrayMethodReplacement = (
  node: TSESTree.CallExpression,
  options: ChainPositionOption,
  settings: TSESLint.SharedConfigurationSettings,
) => {
  const chainPosition =
    options.chainPosition
    ?? getGlobalChainPosition(settings)
    ?? 'outside-chain';
  const hasPrevious = hasPreviousMethodCall(node);
  const hasNext = hasNextMethodCall(node);

  switch (chainPosition) {
    case 'always':
      return true;
    case 'chain-start':
      return !hasPrevious;
    case 'chain-end':
      return !hasNext;
    case 'chain-boundaries':
      return !hasPrevious || !hasNext;
    case 'outside-chain':
      return !hasPrevious && !hasNext;
  }
};
