export default {
	'*.{ts,js,mjs,html}': ['pnpm run eslint --fix --no-warn-ignored', 'pnpm run prettier --write'],
	'*.{json,jsonc,json5,yml,yaml,md}': 'pnpm run prettier --write',
	'*.{css,scss}': ['pnpm run stylelint --fix', 'pnpm run prettier --write'],
};
