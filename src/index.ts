import { createRequire } from 'node:module';
import type { ESLint, Linter } from 'eslint';
import { preferCapitalize } from './rules/prefer-capitalize.js';
import { preferClamp } from './rules/prefer-clamp.js';
import { preferCloneDeep } from './rules/prefer-clone-deep.js';
import { preferCompact } from './rules/prefer-compact.js';
import { preferDelay } from './rules/prefer-delay.js';
import { preferIsDate } from './rules/prefer-is-date.js';
import { preferDifference } from './rules/prefer-difference.js';
import { preferEscapeRegExp } from './rules/prefer-escape-reg-exp.js';
import { preferFlatMap } from './rules/prefer-flat-map.js';
import { preferFlatMapDeep } from './rules/prefer-flat-map-deep.js';
import { preferFlatten } from './rules/prefer-flatten.js';
import { preferFlattenDeep } from './rules/prefer-flatten-deep.js';
import { preferIntersection } from './rules/prefer-intersection.js';
import { preferHead } from './rules/prefer-head.js';
import { preferIsEmpty } from './rules/prefer-is-empty.js';
import { preferIsEqual } from './rules/prefer-is-equal.js';
import { preferIsError } from './rules/prefer-is-error.js';
import { preferIsFunction } from './rules/prefer-is-function.js';
import { preferIsMap } from './rules/prefer-is-map.js';
import { preferIsBoolean } from './rules/prefer-is-boolean.js';
import { preferIsBlob } from './rules/prefer-is-blob.js';
import { preferIsFile } from './rules/prefer-is-file.js';
import { preferIsArrayBuffer } from './rules/prefer-is-array-buffer.js';
import { preferIsNil } from './rules/prefer-is-nil.js';
import { preferIsNotNil } from './rules/prefer-is-not-nil.js';
import { preferIsNull } from './rules/prefer-is-null.js';
import { preferIsNumber } from './rules/prefer-is-number.js';
import { preferIsRegExp } from './rules/prefer-is-reg-exp.js';
import { preferIsSet } from './rules/prefer-is-set.js';
import { preferIsString } from './rules/prefer-is-string.js';
import { preferIsSymbol } from './rules/prefer-is-symbol.js';
import { preferIsTypedArray } from './rules/prefer-is-typed-array.js';
import { preferIsUndefined } from './rules/prefer-is-undefined.js';
import { preferIsWeakMap } from './rules/prefer-is-weak-map.js';
import { preferIsWeakSet } from './rules/prefer-is-weak-set.js';
import { preferInitial } from './rules/prefer-initial.js';
import { preferInRange } from './rules/prefer-in-range.js';
import { preferKeyBy } from './rules/prefer-key-by.js';
import { preferLast } from './rules/prefer-last.js';
import { preferLowerFirst } from './rules/prefer-lower-first.js';
import { preferMean } from './rules/prefer-mean.js';
import { preferMeanBy } from './rules/prefer-mean-by.js';
import { preferRandomInt } from './rules/prefer-random-int.js';
import { preferRange } from './rules/prefer-range.js';
import { preferRound } from './rules/prefer-round.js';
import { preferSample } from './rules/prefer-sample.js';
import { preferShuffle } from './rules/prefer-shuffle.js';
import { preferSum } from './rules/prefer-sum.js';
import { preferSumBy } from './rules/prefer-sum-by.js';
import { preferTail } from './rules/prefer-tail.js';
import { preferUnion } from './rules/prefer-union.js';
import { preferUniq } from './rules/prefer-uniq.js';
import { preferUniqBy } from './rules/prefer-uniq-by.js';
import { preferUpperFirst } from './rules/prefer-upper-first.js';
import { preferWithout } from './rules/prefer-without.js';

// Resolves to the package root from both `src/` (tests) and `dist/` (published build).
const packageJson = createRequire(import.meta.url)('../package.json') as {
  name: string;
  version: string;
};

const rules = {
  'prefer-capitalize': preferCapitalize,
  'prefer-clamp': preferClamp,
  'prefer-clone-deep': preferCloneDeep,
  'prefer-compact': preferCompact,
  'prefer-delay': preferDelay,
  'prefer-is-date': preferIsDate,
  'prefer-difference': preferDifference,
  'prefer-escape-reg-exp': preferEscapeRegExp,
  'prefer-flat-map': preferFlatMap,
  'prefer-flat-map-deep': preferFlatMapDeep,
  'prefer-flatten': preferFlatten,
  'prefer-flatten-deep': preferFlattenDeep,
  'prefer-head': preferHead,
  'prefer-intersection': preferIntersection,
  'prefer-is-empty': preferIsEmpty,
  'prefer-is-equal': preferIsEqual,
  'prefer-is-error': preferIsError,
  'prefer-is-function': preferIsFunction,
  'prefer-is-map': preferIsMap,
  'prefer-is-boolean': preferIsBoolean,
  'prefer-is-blob': preferIsBlob,
  'prefer-is-file': preferIsFile,
  'prefer-is-array-buffer': preferIsArrayBuffer,
  'prefer-is-nil': preferIsNil,
  'prefer-is-not-nil': preferIsNotNil,
  'prefer-is-null': preferIsNull,
  'prefer-is-number': preferIsNumber,
  'prefer-is-reg-exp': preferIsRegExp,
  'prefer-is-set': preferIsSet,
  'prefer-is-string': preferIsString,
  'prefer-is-symbol': preferIsSymbol,
  'prefer-is-typed-array': preferIsTypedArray,
  'prefer-is-undefined': preferIsUndefined,
  'prefer-is-weak-map': preferIsWeakMap,
  'prefer-is-weak-set': preferIsWeakSet,
  'prefer-initial': preferInitial,
  'prefer-in-range': preferInRange,
  'prefer-key-by': preferKeyBy,
  'prefer-last': preferLast,
  'prefer-lower-first': preferLowerFirst,
  'prefer-mean': preferMean,
  'prefer-mean-by': preferMeanBy,
  'prefer-random-int': preferRandomInt,
  'prefer-range': preferRange,
  'prefer-round': preferRound,
  'prefer-sample': preferSample,
  'prefer-shuffle': preferShuffle,
  'prefer-sum': preferSum,
  'prefer-sum-by': preferSumBy,
  'prefer-tail': preferTail,
  'prefer-union': preferUnion,
  'prefer-uniq': preferUniq,
  'prefer-uniq-by': preferUniqBy,
  'prefer-upper-first': preferUpperFirst,
  'prefer-without': preferWithout,
};

// Every rule sits in exactly one category map. A rule registered as 'off' is opt-in: it
// matches idioms that are often deliberate, so even `configs.all` leaves it disabled.
const arrayRules = {
  'es-toolkit/prefer-compact': 'error',
  'es-toolkit/prefer-difference': 'error',
  'es-toolkit/prefer-flat-map': 'error',
  'es-toolkit/prefer-flat-map-deep': 'error',
  'es-toolkit/prefer-flatten': 'error',
  'es-toolkit/prefer-flatten-deep': 'error',
  'es-toolkit/prefer-head': 'error',
  'es-toolkit/prefer-initial': 'error',
  'es-toolkit/prefer-intersection': 'error',
  'es-toolkit/prefer-key-by': 'error',
  'es-toolkit/prefer-last': 'error',
  'es-toolkit/prefer-sample': 'error',
  'es-toolkit/prefer-shuffle': 'error',
  'es-toolkit/prefer-tail': 'error',
  'es-toolkit/prefer-union': 'error',
  'es-toolkit/prefer-uniq': 'error',
  'es-toolkit/prefer-uniq-by': 'error',
  'es-toolkit/prefer-without': 'error',
} as const;

const functionRules = {} as const;

const mathRules = {
  'es-toolkit/prefer-clamp': 'error',
  'es-toolkit/prefer-in-range': 'error',
  'es-toolkit/prefer-mean': 'error',
  'es-toolkit/prefer-mean-by': 'error',
  'es-toolkit/prefer-random-int': 'error',
  'es-toolkit/prefer-range': 'error',
  'es-toolkit/prefer-round': 'error',
  'es-toolkit/prefer-sum': 'error',
  'es-toolkit/prefer-sum-by': 'error',
} as const;

const objectRules = {
  'es-toolkit/prefer-clone-deep': 'error',
} as const;

const predicateRules = {
  'es-toolkit/prefer-is-array-buffer': 'error',
  'es-toolkit/prefer-is-blob': 'error',
  'es-toolkit/prefer-is-boolean': 'error',
  'es-toolkit/prefer-is-date': 'error',
  'es-toolkit/prefer-is-empty': 'error',
  'es-toolkit/prefer-is-equal': 'error',
  'es-toolkit/prefer-is-error': 'error',
  'es-toolkit/prefer-is-file': 'error',
  'es-toolkit/prefer-is-function': 'error',
  'es-toolkit/prefer-is-map': 'error',
  'es-toolkit/prefer-is-nil': 'error',
  'es-toolkit/prefer-is-not-nil': 'error',
  'es-toolkit/prefer-is-null': 'error',
  'es-toolkit/prefer-is-number': 'error',
  'es-toolkit/prefer-is-reg-exp': 'error',
  'es-toolkit/prefer-is-set': 'error',
  'es-toolkit/prefer-is-string': 'error',
  'es-toolkit/prefer-is-symbol': 'error',
  'es-toolkit/prefer-is-typed-array': 'error',
  'es-toolkit/prefer-is-undefined': 'error',
  'es-toolkit/prefer-is-weak-map': 'error',
  'es-toolkit/prefer-is-weak-set': 'error',
} as const;

const promiseRules = {
  'es-toolkit/prefer-delay': 'error',
} as const;

const stringRules = {
  'es-toolkit/prefer-capitalize': 'error',
  'es-toolkit/prefer-escape-reg-exp': 'error',
  'es-toolkit/prefer-lower-first': 'error',
  'es-toolkit/prefer-upper-first': 'error',
} as const;

type ConfigName =
  | 'array'
  | 'function'
  | 'math'
  | 'object'
  | 'predicate'
  | 'promise'
  | 'string'
  | 'all';

// Typed with ESLint's own `Plugin`/`Config` so `defineConfig([esToolkit.configs.all])`
// type-checks in an `eslint.config.ts`.
interface Plugin extends ESLint.Plugin {
  meta: { name: string; version: string };
  rules: NonNullable<ESLint.Plugin['rules']>;
  configs: Record<ConfigName, Linter.Config & { rules: Linter.RulesRecord }>;
}

const plugin: Plugin = {
  meta: { name: packageJson.name, version: packageJson.version },
  // typescript-eslint's `RuleModule` is not assignable to ESLint's `RuleDefinition` type,
  // although ESLint runs it as one.
  rules: rules as unknown as Plugin['rules'],
  configs: {} as Plugin['configs'],
};

plugin.configs = {
  array: {
    plugins: { 'es-toolkit': plugin },
    rules: arrayRules,
  },
  function: {
    plugins: { 'es-toolkit': plugin },
    rules: functionRules,
  },
  math: {
    plugins: { 'es-toolkit': plugin },
    rules: mathRules,
  },
  object: {
    plugins: { 'es-toolkit': plugin },
    rules: objectRules,
  },
  predicate: {
    plugins: { 'es-toolkit': plugin },
    rules: predicateRules,
  },
  promise: {
    plugins: { 'es-toolkit': plugin },
    rules: promiseRules,
  },
  string: {
    plugins: { 'es-toolkit': plugin },
    rules: stringRules,
  },
  all: {
    plugins: { 'es-toolkit': plugin },
    rules: {
      ...arrayRules,
      ...functionRules,
      ...mathRules,
      ...objectRules,
      ...predicateRules,
      ...promiseRules,
      ...stringRules,
    },
  },
};

export default plugin;
