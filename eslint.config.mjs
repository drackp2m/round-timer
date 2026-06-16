/* eslint-disable max-lines */
import eslint from '@eslint/js';
import angularEslint from 'angular-eslint';
import eslintPluginImportX from 'eslint-plugin-import-x';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginRxjs from 'eslint-plugin-rxjs-updated';
import eslintPluginSonarjs from 'eslint-plugin-sonarjs';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';
import * as jsoncEslintParser from 'jsonc-eslint-parser';
import typescriptEslint from 'typescript-eslint';

function eslintErrorsToWarnings(rules) {
	return Object.fromEntries(
		Object.entries(rules).map(([ruleName, ruleValue]) => {
			if (Array.isArray(ruleValue)) {
				ruleValue[0] = ruleValue[0]?.replace('error', 'warn');
			} else {
				ruleValue = ruleValue?.replace('error', 'warn');
			}

			return [ruleName, ruleValue];
		}),
	);
}

function transformEslintConfigs(config) {
	if (Array.isArray(config)) {
		return config.map((item) => transformEslintConfigs(item));
	}

	if (config && 'object' === typeof config) {
		return Object.fromEntries(
			Object.entries(config).map(([key, value]) => {
				if ('rules' === key) {
					return [key, eslintErrorsToWarnings(value)];
				} else {
					return [key, value];
				}
			}),
		);
	}

	return config;
}

export default typescriptEslint.config(
	// ── Global ignores & settings ──────────────────────────────────────────────
	{
		ignores: ['.angular/**'],
		settings: {
			'import-x/internal-regex': '^@app/',
		},
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},

	// ── Base: shared rules for TS + JS ─────────────────────────────────────────
	{
		name: 'Base',
		files: ['**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs'],
		plugins: {
			'import-x': eslintPluginImportX,
			'unused-imports': eslintPluginUnusedImports,
			prettier: eslintPluginPrettier,
		},
		rules: {
			// Imports
			'import-x/no-duplicates': 'warn',
			'import-x/order': [
				'warn',
				{
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
					},
				},
			],
			'unused-imports/no-unused-imports': 'warn',

			// Format
			'prettier/prettier': 'warn',
			'no-multiple-empty-lines': ['warn', { max: 1 }],
			'space-before-blocks': ['warn', 'always'],
			'newline-before-return': 'warn',
			'padding-line-between-statements': [
				'warn',
				{ blankLine: 'always', next: 'export', prev: '*' },
			],

			// General style
			curly: ['warn', 'all'],
			eqeqeq: ['warn', 'always'],
			yoda: ['warn', 'always'],
			'no-empty': 'warn',
			'no-implicit-coercion': ['warn', { boolean: true }],
			'no-extra-boolean-cast': 'warn',
			'no-restricted-imports': [
				'warn',
				{
					patterns: [
						{
							group: ['../*'],
							message: 'Use path aliases instead of relative imports',
						},
					],
				},
			],
		},
	},

	// ── TypeScript ─────────────────────────────────────────────────────────────
	{
		name: 'TypeScript',
		files: ['**/*.ts', '**/*.mts'],
		plugins: {
			sonarjs: eslintPluginSonarjs,
			rxjs: eslintPluginRxjs,
		},
		extends: [
			transformEslintConfigs(eslint.configs.recommended),
			transformEslintConfigs(typescriptEslint.configs.recommendedTypeChecked),
			transformEslintConfigs(typescriptEslint.configs.strictTypeChecked),
			transformEslintConfigs(typescriptEslint.configs.stylisticTypeChecked),
			transformEslintConfigs(eslintPluginRxjs.configs.recommended),
			transformEslintConfigs(angularEslint.configs.tsRecommended),
		],
		processor: angularEslint.processInlineTemplates,
		rules: {
			...eslintErrorsToWarnings(eslintPluginSonarjs.configs.recommended.rules),

			// Angular
			'@angular-eslint/directive-selector': [
				'warn',
				{ type: 'attribute', prefix: 'app', style: 'camelCase' },
			],
			'@angular-eslint/component-selector': [
				'warn',
				{ type: 'element', prefix: 'app', style: 'kebab-case' },
			],
			'@angular-eslint/component-class-suffix': [
				'warn',
				{ suffixes: ['Layout', 'Page', 'Modal', 'Component'] },
			],

			// TypeScript
			'@typescript-eslint/no-extraneous-class': 'off',
			'@typescript-eslint/unbound-method': 'off',
			'@typescript-eslint/no-inferrable-types': 'warn',
			'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn',
			'@typescript-eslint/strict-boolean-expressions': [
				'warn',
				{
					allowNullableObject: false,
					allowNumber: false,
					allowString: false,
				},
			],
			'@typescript-eslint/member-ordering': [
				'warn',
				{
					default: [
						'signature',
						'field',
						'constructor',
						'decorated-method',
						'method',
						'static-method',
						'abstract-method',
						'protected-method',
						'private-method',
					],
				},
			],
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],

			// SonarJS
			'sonarjs/no-unused-vars': 'off',
			'sonarjs/unused-import': 'off',
			'sonarjs/no-dead-store': 'off',
			'sonarjs/todo-tag': 'off',
			'sonarjs/fixme-tag': 'off',
			'sonarjs/deprecation': 'off',
			'no-unused-private-class-members': 'warn',
		},
	},

	// ── JavaScript ─────────────────────────────────────────────────────────────
	{
		name: 'JavaScript',
		files: ['**/*.js', '**/*.mjs'],
		extends: [transformEslintConfigs(eslint.configs.recommended)],
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
		},
	},

	// ── HTML ───────────────────────────────────────────────────────────────────
	{
		name: 'HTML',
		files: ['**/*.html'],
		plugins: {
			prettier: eslintPluginPrettier,
		},
		extends: [
			...angularEslint.configs.templateRecommended,
			...angularEslint.configs.templateAccessibility,
		],
		rules: {
			'prettier/prettier': 'warn',
			'@angular-eslint/template/click-events-have-key-events': 'warn',
			'@angular-eslint/template/interactive-supports-focus': 'warn',
		},
	},

	// ── JSON ───────────────────────────────────────────────────────────────────
	{
		name: 'JSON',
		files: ['**/*.json', '**/*.jsonc', '**/*.json5'],
		languageOptions: {
			parser: jsoncEslintParser,
		},
		plugins: {
			prettier: eslintPluginPrettier,
		},
		rules: {
			'prettier/prettier': 'warn',
		},
	},

	// ── Tests ──────────────────────────────────────────────────────────────────
	{
		name: 'Tests',
		files: ['**/*.spec.ts', '**/*.spec.js', '**/*.test.ts', '**/*.test.js'],
		rules: {
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'sonarjs/no-hardcoded-credentials': 'off',
			'sonarjs/no-hardcoded-passwords': 'off',
			'sonarjs/no-hardcoded-secrets': 'off',
			'sonarjs/no-skipped-tests': 'off',
		},
	},

	// ── Complexity ─────────────────────────────────────────────────────────────
	{
		name: 'Complexity',
		files: ['**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs'],
		ignores: ['**/*.spec.ts', '**/*.spec.js', '.angular/**'],
		rules: {
			'max-lines': ['warn', { max: 250, skipComments: true }],
			'max-lines-per-function': ['warn', { max: 75, skipComments: true, IIFEs: true }],
		},
	},
);
