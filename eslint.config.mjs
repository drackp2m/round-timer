import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import eslint from '@eslint/js';
import json from '@eslint/json';
import tsParser from '@typescript-eslint/parser';
import angular from 'angular-eslint';
import eslintImport from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import rxjs from 'eslint-plugin-rxjs-updated';
import sonarjs from 'eslint-plugin-sonarjs';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

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

const eslintConfig = tseslint.config(
	{
		plugins: {
			json,
			prettier,
			sonarjs,
			rxjs,
			import: eslintImport,
			'unused-imports': unusedImports,
		},
	},
	{
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
		],
		processor: angular.processInlineTemplates,
		rules: {
			...eslintErrorsToWarnings(rxjs.configs.recommended.rules),
			...eslintErrorsToWarnings(sonarjs.configs.recommended.rules),
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
					suffixes: ['Component', 'Page', 'Layout'],
				},
			],
			'sonarjs/no-unused-vars': 'off',
			'sonarjs/todo-tag': 'off',
			'sonarjs/fixme-tag': 'off',
			'sonarjs/unused-import': 'off',
			'unused-imports/no-unused-imports': 'warn',
			'no-unused-private-class-members': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
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
			'import/order': [
				'warn',
				{
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
					},
					pathGroups: [
						{
							pattern: '@playsetonline/**',
							group: 'external',
							position: 'after',
						},
					],
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
			'@typescript-eslint/strict-boolean-expressions': 'warn',
			'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn',
		},
	},
	{
		files: ['**/*.html'],
		extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
		rules: {
			'sonarjs/no-element-overwrite': 'off',
			'sonarjs/no-same-line-conditional': 'off',
			'sonarjs/no-unenclosed-multiline-block': 'off',
			'prettier/prettier': 'warn',
			'@angular-eslint/template/click-events-have-key-events': 'warn',
			'@angular-eslint/template/interactive-supports-focus': 'warn',
		},
	},
	{
		files: ['**/*.ts/1_inline-template-app.component.ts-1.component.html'],
		rules: {
			'sonarjs/no-element-overwrite': 'off',
			'sonarjs/no-same-line-conditional': 'off',
			'sonarjs/no-unenclosed-multiline-block': 'off',
		},
	},
	{
		files: ['**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs', '**/*.json', '**/*.html'],
		rules: {
			'prettier/prettier': 'warn',
		},
	},
	{
		files: ['**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs'],
		ignores: ['**/*.spec.ts', '**/*.test.ts'],
		rules: {
			'max-lines': [
				'warn',
				{
					max: 200,
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
		files: ['**/*.spec.ts', '**/*.spec.js', '**/*.test.ts', '**/*.test.js'],
		rules: {
			'sonarjs/no-hardcoded-credentials': ['off'],
			'sonarjs/no-hardcoded-passwords': ['off'],
			'sonarjs/no-hardcoded-secrets': ['off'],
			'sonarjs/no-skipped-tests': 'off',
		},
	},
);

// console.log(eslintConfig);

export default eslintConfig;
