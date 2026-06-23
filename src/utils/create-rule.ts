import { ESLintUtils } from '@typescript-eslint/utils';

export const createRule = ESLintUtils.RuleCreator(
  name =>
    `https://github.com/syxov/es-toolkit-eslint-plugin/blob/main/docs/rules/${name}.md`,
);
