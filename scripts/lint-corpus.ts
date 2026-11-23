// Lints the corpus repositories with all plugin rules (opt-in ones included) and writes
// corpus/report.{md,json}. With --rules, lints with those rules only and prints every hit
// instead of writing the report. The corpus is read from the main checkout, so this also
// works from a git worktree. Run `pnpm build` first: the plugin is loaded from dist/.
// Usage: node scripts/lint-corpus.ts [--rules prefer-a,prefer-b] [repo …]
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import tsParser from '@typescript-eslint/parser';
import { ESLint, type Linter } from 'eslint';

interface Hit {
  repo: string;
  file: string;
  line: number;
  rule: string;
  source: string;
}

const root = join(import.meta.dirname, '..');
const gitCommonDir = execFileSync(
  'git',
  ['rev-parse', '--path-format=absolute', '--git-common-dir'],
  { cwd: root, encoding: 'utf8' },
).trim();
const corpusDir = join(dirname(gitCommonDir), 'corpus');
const { values: options, positionals: repoArgs } = parseArgs({
  options: { rules: { type: 'string' } },
  allowPositionals: true,
});
const { default: plugin } = (await import(
  pathToFileURL(join(root, 'dist/index.js')).href
)) as { default: ESLint.Plugin };

const ruleNames = Object.keys(plugin.rules ?? {});
const selectedRules = options.rules?.split(',').map(name => name.trim());
const unknownRules = selectedRules?.filter(name => !ruleNames.includes(name));
if (unknownRules?.length) {
  throw new Error(`Unknown rules: ${unknownRules.join(', ')}`);
}
const lintedRules = selectedRules ?? ruleNames;
const allRules = (plugin.configs?.all as Linter.Config).rules ?? {};
const optIn = new Set(
  ruleNames.filter(name => allRules[`es-toolkit/${name}`] === 'off'),
);
const config: Linter.Config[] = [
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/build/',
      '**/lib/',
      '**/esm/',
      '**/es/',
      '**/out/',
      '**/coverage/',
      '**/.next/',
      '**/vendor/',
      '**/.yarn/',
      '**/yarn-standalone.js',
      '**/*.min.js',
      '**/*.d.ts',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: 'off',
    },
    plugins: { 'es-toolkit': plugin },
    rules: Object.fromEntries(
      lintedRules.map(name => [`es-toolkit/${name}`, 'error']),
    ),
  },
];

const repos =
  repoArgs.length > 0
    ? repoArgs
    : readdirSync(corpusDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

const hits: Hit[] = [];
const summary: { repo: string; files: number; parseErrors: number }[] = [];

for (const repo of repos) {
  const cwd = join(corpusDir, repo);
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: config,
    errorOnUnmatchedPattern: false,
    warnIgnored: false,
  });
  const started = Date.now();
  const results = await eslint.lintFiles(['.']);
  let parseErrors = 0;
  for (const result of results) {
    const lines = readFileSync(result.filePath, 'utf8').split(/\r?\n/);
    for (const message of result.messages) {
      if (message.fatal) {
        parseErrors++;
      } else if (message.ruleId?.startsWith('es-toolkit/')) {
        hits.push({
          repo,
          file: relative(cwd, result.filePath).replaceAll('\\', '/'),
          line: message.line,
          rule: message.ruleId.slice('es-toolkit/'.length),
          source: (lines[message.line - 1] ?? '').trim().slice(0, 200),
        });
      }
    }
  }
  summary.push({ repo, files: results.length, parseErrors });
  const repoHits = hits.filter(hit => hit.repo === repo).length;
  console.log(
    `${repo}: ${String(results.length)} files, ${String(repoHits)} reports, ${String(parseErrors)} parse errors (${String(Math.round((Date.now() - started) / 1000))}s)`,
  );
}

const countBy = (items: Hit[], key: (hit: Hit) => string) => {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]);
};

const isTestFile = (file: string) =>
  /(^|\/)(tests?|__tests__|spec|e2e|fixtures?)\/|\.(test|spec)\.[cm]?[jt]sx?$/.test(
    file,
  );

const printHits = (rules: string[]) => {
  for (const hit of hits) {
    console.log(
      `${hit.rule}\t${hit.repo}/${hit.file}:${String(hit.line)}\t${hit.source}`,
    );
  }
  console.log('\nTotals:');
  for (const rule of rules) {
    const count = hits.filter(hit => hit.rule === rule).length;
    console.log(`  ${rule}: ${String(count)}`);
  }
};

const writeReport = () => {
  const report = [
    '# Corpus report',
    '',
    '| Repository | Files | Reports | In tests | Parse errors |',
    '| --- | ---: | ---: | ---: | ---: |',
    ...summary.map(({ repo, files, parseErrors }) => {
      const repoHits = hits.filter(hit => hit.repo === repo);
      const inTests = repoHits.filter(hit => isTestFile(hit.file)).length;
      return `| ${repo} | ${String(files)} | ${String(repoHits.length)} | ${String(inTests)} | ${String(parseErrors)} |`;
    }),
    '',
    '## Reports by rule',
    '',
    'Opt-in rules (off even in `configs.all`) are marked with *.',
    '',
    '| Rule | Reports | Outside tests | Repositories |',
    '| --- | ---: | ---: | --- |',
    ...countBy(hits, hit => hit.rule).map(([rule, count]) => {
      const ruleHits = hits.filter(hit => hit.rule === rule);
      const outsideTests = ruleHits.filter(hit => !isTestFile(hit.file)).length;
      const inRepos = countBy(ruleHits, hit => hit.repo)
        .map(([repo, n]) => `${repo} (${String(n)})`)
        .join(', ');
      return `| ${rule}${optIn.has(rule) ? ' *' : ''} | ${String(count)} | ${String(outsideTests)} | ${inRepos} |`;
    }),
    '',
    `Rules with no reports: ${ruleNames.filter(name => !hits.some(hit => hit.rule === name)).join(', ') || 'none'}`,
    '',
  ];

  writeFileSync(join(corpusDir, 'report.md'), report.join('\n'));
  writeFileSync(join(corpusDir, 'report.json'), JSON.stringify(hits, null, 2));
  console.log('\nWrote corpus/report.md and corpus/report.json');
};

if (selectedRules) {
  printHits(selectedRules);
} else {
  writeReport();
}
