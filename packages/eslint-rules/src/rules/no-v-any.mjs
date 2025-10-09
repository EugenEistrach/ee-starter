/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('estree').CallExpression} CallExpression
 * @typedef {import('estree').MemberExpression} MemberExpression
 */

/** @type {RuleModule} */
export default {
	meta: {
		type: "problem",
		docs: {
			description: "Ban v.any() - always define proper types",
		},
		messages: {
			noVAny:
				"Never use v.any(). Define proper types or use v.null() for void returns.",
		},
	},
	/**
	 * @param {RuleContext} context
	 */
	create(context) {
		return {
			/**
			 * @param {CallExpression} node
			 */
			CallExpression(node) {
				// Check for v.any() calls
				if (
					node.callee.type === "MemberExpression" &&
					node.callee.object.type === "Identifier" &&
					node.callee.object.name === "v" &&
					node.callee.property.type === "Identifier" &&
					node.callee.property.name === "any"
				) {
					context.report({
						node,
						messageId: "noVAny",
					});
				}
			},
		};
	},
};
