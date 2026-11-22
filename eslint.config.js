import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import eslintPlugin from 'eslint-plugin-eslint-plugin';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist/', 'coverage/'] },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // `node.type === 'CallExpression'` is the idiomatic AST check.
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      // `const report = node => context.report(…)` is the house style for rule bodies.
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true },
      ],
    },
  },
  {
    files: ['src/rules/**/*.ts'],
    extends: [eslintPlugin.configs.recommended],
    rules: {
      'eslint-plugin/require-meta-docs-description': [
        'error',
        { pattern: '^(Enforce|Require|Disallow)' },
      ],
      'eslint-plugin/require-meta-default-options': 'error',
      'eslint-plugin/require-meta-schema-description': 'error',
      'eslint-plugin/meta-property-ordering': 'error',
      'eslint-plugin/prefer-placeholders': 'error',
      'eslint-plugin/no-property-in-node': 'error',
    },
  },
  {
    files: ['tests/rules/**/*.ts'],
    extends: [eslintPlugin.configs['tests-recommended']],
    rules: {
      'eslint-plugin/test-case-shorthand-strings': 'error',
      'eslint-plugin/unique-test-case-names': 'error',
    },
  },
  {
    files: ['tests/**/*.ts'],
    extends: [vitest.configs.recommended],
  },
);
