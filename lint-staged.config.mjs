export default {
	'*.{ts,js,mjs,html}': ['pnpm exec eslint --fix --no-warn-ignored', 'pnpm exec prettier --write'],
	'*.{json,jsonc,json5,yml,yaml,md}': 'pnpm exec prettier --write',
	'*.{css,scss}': ['pnpm exec stylelint --fix', 'pnpm exec prettier --write'],
};
