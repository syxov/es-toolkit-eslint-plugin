import { preferClamp } from './rules/prefer-clamp.js';

const plugin = {
  meta: { name: 'es-toolkit-eslint-plugin', version: '1.0.0' },
  rules: { 'prefer-clamp': preferClamp },
  configs: {} as Record<string, unknown>,
};

plugin.configs = {
  recommended: {
    plugins: { 'es-toolkit': plugin },
    rules: { 'es-toolkit/prefer-clamp': 'error' },
  },
};

export default plugin;
