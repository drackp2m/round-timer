/* eslint-disable max-lines */
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import eslintImport from 'eslint-plugin-import';
import jsonc from 'eslint-plugin-jsonc';
import prettier from 'eslint-plugin-prettier';
import rxjs from 'eslint-plugin-rxjs-updated';
import sonarjs from 'eslint-plugin-sonarjs';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

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

const eslintConfig = tseslint.config(
	...jsonc.configs['flat/recommended-with-jsonc'],
	transformEslintConfigs(eslint.configs.recommended),
	transformEslintConfigs(tseslint.configs.recommendedTypeChecked),
	transformEslintConfigs(tseslint.configs.strictTypeChecked),
	transformEslintConfigs(tseslint.configs.stylisticTypeChecked),
	transformEslintConfigs(angular.configs.tsRecommended),
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		plugins: {
			jsonc,
			prettier,
			sonarjs,
			rxjs,
			import: eslintImport,
			'unused-imports': unusedImports,
		},
	},
	{
		files: ['**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs'],
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
					suffixes: ['Layout', 'Page', 'Modal', 'Component'],
				},
			],
			'sonarjs/no-unused-vars': 'off',
			'sonarjs/no-dead-store': 'off',
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
					pathGroups: [
						{
							pattern: '@app/**',
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
			'@typescript-eslint/no-floating-promises': 'warn',
			'@typescript-eslint/no-misused-promises': 'warn',
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
		files: ['**/*.js', '**/*.mjs'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
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
		files: ['**/*.json'],
		...jsonc.configs['flat/recommended-with-jsonc'],
		parser: 'jsonc-eslint-parser',
		rules: {
			'prettier/prettier': 'warn',
		},
	},
	{
		files: ['**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs', '**/*.html'],
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
		files: ['**/*.spec.ts', '**/*.spec.js', '**/*.test.ts', '**/*.test.js'],
		rules: {
			'sonarjs/no-hardcoded-credentials': ['off'],
			'sonarjs/no-hardcoded-passwords': ['off'],
			'sonarjs/no-hardcoded-secrets': ['off'],
			'sonarjs/no-skipped-tests': 'off',
		},
	},
);

export default eslintConfig;
