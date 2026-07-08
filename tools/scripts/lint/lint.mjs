#!/usr/bin/env node
// Runs ESLint → Stylelint → Prettier and prints a per-tool summary (ESLint-
// stylish layout — file header + aligned line:col/severity/message/rule rows —
// so the editor turns each location into a clickable link).
//
// Check by default; pass --fix to apply every safe fix, and --verbose (with
// --fix) to also show the per-file correction counts, at the cost of a second
// (expensive, type-checked) ESLint pass.
//
// With no file paths it processes the whole repo; given paths (e.g. from
// lint-staged) only those, routed to each tool by extension. Files no tool can
// handle are reported as "Uncovered". Exits non-zero when any error remains (an
// unfixable lint error, or an unformatted file in check mode) so CI and git
// hooks can block.

import { c, plural, printSection, printUncovered } from '../lint/lint-report.mjs';
import {
	ESLINT_EXT,
	STYLELINT_EXT,
	findUncovered,
	runEslint,
	runPrettier,
	runStylelint,
	withExt,
} from '../lint/lint-runners.mjs';
import { repoFiles } from '../lint/walk-files.mjs';

const args = process.argv.slice(2);
const fix = args.includes('--fix');
const verbose = args.includes('--verbose');
const argFiles = args.filter((arg) => !arg.startsWith('--'));
const hasFiles = 0 !== argFiles.length;

// Whole repo when called without file paths; otherwise only the given files
// (whatever the caller passes), routed to each tool by extension. ESLint and
// Stylelint get handed "." / a glob and rely on their own ignore config
// (eslint.config.mjs ignores, .stylelintignore) to filter — no file walking
// needed. Prettier processes files one by one, so it needs a concrete list;
// repoFiles() walks the tree (skipping node_modules and friends) and
// .prettierignore does the fine-grained filtering per file.
const eslintTargets = hasFiles ? withExt(argFiles, ESLINT_EXT) : ['.'];
const stylelintTargets = hasFiles
	? withExt(argFiles, STYLELINT_EXT)
	: STYLELINT_EXT.map((ext) => `**/*${ext}`);
const prettierTargets = hasFiles ? argFiles : repoFiles();

const jobs = [
	['ESLint', () => runEslint(eslintTargets, fix, verbose)],
	['Stylelint', () => runStylelint(stylelintTargets, fix, verbose)],
	['Prettier', () => runPrettier(prettierTargets, fix)],
];

const segments = [fix ? 'fix' : 'check'];

if (fix && verbose) {
	segments.push('verbose');
}

segments.push(hasFiles ? plural(argFiles.length, 'file') : 'whole repo');
console.log(
	`${c.bold}Linting...${c.reset} ` +
		`${c.dim}(ESLint → Stylelint → Prettier · ${segments.join(' · ')})${c.reset}`,
);

let errors = 0;

for (const [name, run] of jobs) {
	const result = await run();
	printSection(name, result);
	errors += result.remaining.filter((problem) => 'error' === problem.severity).length;
}

// Only when explicit files are passed: warn about any nothing handled.
if (hasFiles) {
	printUncovered(await findUncovered(argFiles));
}

// Non-zero exit on any error (unfixable lint error, or an unformatted file in
// check mode) so CI and pre-commit hooks block; warnings never block.
process.exitCode = 0 !== errors ? 1 : 0;
