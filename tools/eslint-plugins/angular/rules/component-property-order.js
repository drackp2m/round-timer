const ORDER = ['standalone', 'selector', 'templateUrl', 'styleUrl', 'imports'];

function orderIndex(name) {
	const index = ORDER.indexOf(name);

	return -1 === index ? ORDER.length : index;
}

function sortProps(props) {
	return [...props].sort((a, b) => orderIndex(a.key.name) - orderIndex(b.key.name));
}

module.exports = {
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

				const fix = (fixer) => {
					const sourceCode = context.sourceCode;
					const newText = sortProps(props)
						.map((p) => sourceCode.getText(p))
						.join(',\n  ');

					return fixer.replaceTextRange(
						[props[0].range[0], props[props.length - 1].range[1]],
						newText,
					);
				};

				for (let i = 0; i < props.length; i++) {
					const prop = props[i];
					const index = orderIndex(prop.key.name);
					const before = props.slice(0, i).find((p) => orderIndex(p.key.name) > index);

					if (before) {
						context.report({
							node: prop,
							message: '`{{prop}}` property should occur before `{{before}}`',
							data: { prop: prop.key.name, before: before.key.name },
							fix,
						});
					}
				}
			},
		};
	},
};
