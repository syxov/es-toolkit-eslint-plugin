import { preferClamp } from './rules/prefer-clamp.js';
import { preferCompact } from './rules/prefer-compact.js';
import { preferDelay } from './rules/prefer-delay.js';
import { preferIsEmpty } from './rules/prefer-is-empty.js';
import { preferIsEqual } from './rules/prefer-is-equal.js';
import { preferLast } from './rules/prefer-last.js';
import { preferRandomInt } from './rules/prefer-random-int.js';
import { preferRange } from './rules/prefer-range.js';
import { preferSample } from './rules/prefer-sample.js';
import { preferUniq } from './rules/prefer-uniq.js';

const plugin = {
  meta: { name: 'es-toolkit-eslint-plugin', version: '1.0.0' },
  rules: {
    'prefer-clamp': preferClamp,
    'prefer-compact': preferCompact,
    'prefer-delay': preferDelay,
    'prefer-is-empty': preferIsEmpty,
    'prefer-is-equal': preferIsEqual,
    'prefer-last': preferLast,
    'prefer-random-int': preferRandomInt,
    'prefer-range': preferRange,
    'prefer-sample': preferSample,
    'prefer-uniq': preferUniq,
  },
  configs: {},
};

plugin.configs = {
  recommended: {
    plugins: { 'es-toolkit': plugin },
    rules: {
      'es-toolkit/prefer-clamp': 'error',
      'es-toolkit/prefer-compact': 'error',
      'es-toolkit/prefer-delay': 'error',
      'es-toolkit/prefer-is-empty': 'error',
      'es-toolkit/prefer-is-equal': 'error',
      'es-toolkit/prefer-last': 'error',
      'es-toolkit/prefer-random-int': 'error',
      'es-toolkit/prefer-range': 'error',
      'es-toolkit/prefer-sample': 'error',
      'es-toolkit/prefer-uniq': 'error',
    },
  },
};

export default plugin;
