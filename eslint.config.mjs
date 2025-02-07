/* eslint-disable max-lines */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import eslint from '@eslint/js';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import tsParser from '@typescript-eslint/parser';
=======
import tseslint from 'typescript-eslint';
>>>>>>> Stashed changes
=======
import tseslint from 'typescript-eslint';
>>>>>>> Stashed changes
import angular from 'angular-eslint';
import eslintImport from 'eslint-plugin-import';
import eslintPluginJsonc from 'eslint-plugin-jsonc';
import prettier from 'eslint-plugin-prettier';
import rxjs from 'eslint-plugin-rxjs-updated';
import sonarjs from 'eslint-plugin-sonarjs';
import unusedImports from 'eslint-plugin-unused-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
function eslintErrorsToWarnings(rules) {
	return Object.fromEntries(
		Object.entries(rules).map(([ruleName, ruleValue]) => {
			ruleValue =
				'string' === typeof ruleValue
					? ruleValue?.replace('error', 'warn')
					: ruleValue[0]?.replace('error', 'warn');

			return [ruleName, ruleValue];
		}),
	);
}

<<<<<<< Updated upstream
const eslintConfig = tseslint.config(
	...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
=======
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

export default tseslint.config(
	...jsonc.configs['flat/recommended-with-jsonc'],
<<<<<<< Updated upstream
>>>>>>> Stashed changes
	{
		plugins: {
			eslintPluginJsonc,
			prettier,
			sonarjs,
			rxjs,
			import: eslintImport,
			'unused-imports': unusedImports,
		},
		settings: {
			'import/internal-regex': '^@app/',
		},
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
<<<<<<< Updated upstream
		files: ['**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs'],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 2024,
			sourceType: 'module',
			parserOptions: {
				project: join(__dirname, './tsconfig.json'),
			},
		},
		settings: {
			'import/ignore': ['node_modules'],
			'import/resolver': {
				node: true,
				typescript: {
					project: 'tsconfig.json',
				},
			},
		},
		extends: [
			eslint.configs.recommended,
			...tseslint.configs.recommended,
			...tseslint.configs.stylistic,
			...angular.configs.tsRecommended,
=======
=======
	{
		plugins: {
			jsonc,
			prettier,
			sonarjs,
			rxjs,
			import: eslintImport,
			'unused-imports': unusedImports,
		},
		settings: {
			'import/internal-regex': '^@app/',
		},
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
>>>>>>> Stashed changes
		name: 'TypeScript',
		files: ['**/*.ts'],
		extends: [
			transformEslintConfigs(eslint.configs.recommended),
			transformEslintConfigs(tseslint.configs.recommendedTypeChecked),
			transformEslintConfigs(tseslint.configs.strictTypeChecked),
			transformEslintConfigs(tseslint.configs.stylisticTypeChecked),
			transformEslintConfigs(rxjs.configs.recommended),
			transformEslintConfigs(angular.configs.tsRecommended),
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
		],
		processor: angular.processInlineTemplates,
		rules: {
			...eslintErrorsToWarnings(sonarjs.configs.recommended.rules),
			'@typescript-eslint/no-extraneous-class': 'off',
			'@typescript-eslint/unbound-method': 'off',
			'@angular-eslint/directive-selector': [
				'warn',
				{
					type: 'attribute',
					prefix: 'app',
					style: 'camelCase',
				},
			],
			'@angular-eslint/component-selector': [
				'warn',
				{
					type: 'element',
					prefix: 'app',
					style: 'kebab-case',
				},
			],
			'@angular-eslint/component-class-suffix': [
				'warn',
				{
					suffixes: ['Layout', 'Page', 'Modal', 'Component'],
				},
			],
			'sonarjs/no-unused-vars': 'off',
			'sonarjs/todo-tag': 'off',
			'sonarjs/fixme-tag': 'off',
			'sonarjs/unused-import': 'off',
			'unused-imports/no-unused-imports': 'warn',
			'no-unused-private-class-members': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'off',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-inferrable-types': 'warn',
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
			'import/order': [
				'warn',
				{
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
					},
				},
			],
			'sort-imports': [
				'warn',
				{
					ignoreDeclarationSort: true,
				},
			],
			'padding-line-between-statements': [
				'warn',
				{
					blankLine: 'always',
					next: 'export',
					prev: '*',
				},
			],
			'no-empty': 'warn',
			'no-duplicate-imports': 'warn',
			'no-multiple-empty-lines': [
				'warn',
				{
					max: 1,
				},
			],
			'space-before-blocks': ['warn', 'always'],
			'newline-before-return': 'warn',
			curly: ['warn', 'all'],
			eqeqeq: ['warn', 'always'],
			yoda: ['warn', 'always'],
			'no-implicit-coercion': ['warn', { boolean: true }],
			'no-extra-boolean-cast': 'warn',
			'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn',
			'@typescript-eslint/strict-boolean-expressions': [
				'warn',
				{
					allowNullableObject: false,
					allowNumber: false,
					allowString: false,
				},
			],
		},
	},
	{
		name: 'JavaScript',
		files: ['**/*.js', '**/*.mjs'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
	{
		name: 'HTML',
		files: ['**/*.html'],
		extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
		rules: {
			'prettier/prettier': 'warn',
			'@angular-eslint/template/click-events-have-key-events': 'warn',
			'@angular-eslint/template/interactive-supports-focus': 'warn',
		},
	},
	{
<<<<<<< Updated upstream
<<<<<<< Updated upstream
		files: ['**/*.ts/1_inline-template-app.component.ts-1.component.html'],
		rules: {
			'sonarjs/no-element-overwrite': 'off',
			'sonarjs/no-same-line-conditional': 'off',
			'sonarjs/no-unenclosed-multiline-block': 'off',
		},
	},
	{
		files: ['**/*.json'],
		rules: {
			'prettier/prettier': 'warn',
		},
	},
	{
		files: ['**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs', '**/*.html'],
=======
		name: 'Prettier',
		files: ['**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs', '**/*.json'],
>>>>>>> Stashed changes
=======
		name: 'Prettier',
		files: ['**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs', '**/*.json'],
>>>>>>> Stashed changes
		rules: {
			'prettier/prettier': 'warn',
		},
	},
	{
		name: 'Default',
		files: ['**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs'],
		ignores: ['**/*.spec.ts', '**/*.test.ts'],
		rules: {
			'max-lines': [
				'warn',
				{
					max: 250,
					skipComments: true,
				},
			],
			'max-lines-per-function': [
				'warn',
				{
					max: 75,
					skipComments: true,
					IIFEs: true,
				},
			],
		},
	},
	{
		name: 'Tests',
		files: ['**/*.spec.ts', '**/*.spec.js', '**/*.test.ts', '**/*.test.js'],
		rules: {
			'sonarjs/no-hardcoded-credentials': 'off',
			'sonarjs/no-hardcoded-passwords': 'off',
			'sonarjs/no-hardcoded-secrets': 'off',
			'sonarjs/no-skipped-tests': 'off',
		},
	},
);
