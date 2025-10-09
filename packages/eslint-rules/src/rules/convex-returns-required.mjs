/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('estree').CallExpression} CallExpression
 * @typedef {import('estree').Identifier} Identifier
 * @typedef {import('estree').ObjectExpression} ObjectExpression
 */

/** @type {RuleModule} */
export default {
	meta: {
		type: "problem",
		docs: {
			description: "Convex functions must have explicit 'returns' property",
		},
		messages: {
			missingReturns:
				"Missing 'returns' property in Convex function. Add explicit return type validation or use v.null() for void functions.",
		},
	},
	/**
	 * @param {RuleContext} context
	 */
	create(context) {
		const convexFunctions = new Set([
			"mutation",
			"query",
			"action",
			"internalMutation",
			"internalQuery",
			"internalAction",
		]);

		return {
			/**
			 * @param {CallExpression} node
			 */
			CallExpression(node) {
				// Check if it's a Convex function call
				if (
					node.callee.type === "Identifier" &&
					convexFunctions.has(node.callee.name) &&
					node.arguments[0]?.type === "ObjectExpression"
				) {
					/** @type {ObjectExpression} */
					const config = node.arguments[0];
					const hasReturns = config.properties.some(
						(prop) =>
							prop.type === "Property" &&
							prop.key?.type === "Identifier" &&
							prop.key?.name === "returns",
					);

					if (!hasReturns) {
						// Try to find the variable name if it's being assigned
						let errorNode = node;
						if (node.parent?.type === "VariableDeclarator" && node.parent.id) {
							errorNode = node.parent.id;
						}

						context.report({
							node: errorNode,
							messageId: "missingReturns",
						});
					}
				}
			},
		};
	},
};
