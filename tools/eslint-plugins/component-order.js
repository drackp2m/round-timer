const ORDER = ['standalone', 'selector', 'templateUrl', 'styleUrl', 'imports'];

const componentPropertyOrder = {
	meta: {
		type: 'layout',
		fixable: 'code',
		schema: [],
	},
	create(context) {
		return {
			Decorator(node) {
				if ('Component' !== node.expression.callee?.name) {
					return;
				}
				const arg = node.expression.arguments[0];

				if (!arg || 'ObjectExpression' !== arg.type) {
					return;
				}

				const props = arg.properties;
				const keys = props.map((p) => p.key.name);
				const sorted = [...keys].sort((a, b) => {
					const ia = ORDER.indexOf(a);
					const ib = ORDER.indexOf(b);

					if (-1 === ia && -1 === ib) {
						return 0;
					}

					if (-1 === ia) {
						return 1;
					}

					if (-1 === ib) {
						return -1;
					}

					return ia - ib;
				});

				const isSorted = keys.every((k, i) => k === sorted[i]);

				if (isSorted) {
					return;
				}

				context.report({
					node: arg,
					message: '@Component properties must follow this order: {{order}}',
					data: { order: ORDER.join(' > ') },
					fix(fixer) {
						const sourceCode = context.sourceCode;
						const sortedProps = [...props].sort((a, b) => {
							const ia = ORDER.indexOf(a.key.name);
							const ib = ORDER.indexOf(b.key.name);

							if (-1 === ia && -1 === ib) {
								return 0;
							}

							if (-1 === ia) {
								return 1;
							}

							if (-1 === ib) {
								return -1;
							}

							return ia - ib;
						});
						const newText = sortedProps.map((p) => sourceCode.getText(p)).join(',\n  ');

						return fixer.replaceTextRange(
							[props[0].range[0], props[props.length - 1].range[1]],
							newText,
						);
					},
				});
			},
		};
	},
};

module.exports = {
	rules: {
		'component-property-order': componentPropertyOrder,
	},
};
