/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('estree').CallExpression} CallExpression
 * @typedef {import('estree').Identifier} Identifier
 * @typedef {import('estree').MemberExpression} MemberExpression
 */

/** @type {RuleModule} */
export default {
	meta: {
		type: "problem",
		docs: {
			description:
				"Ban premature optimization hooks - React Compiler handles memoization",
		},
		messages: {
			avoidMemoization:
				"Avoid useMemo/useCallback/memo. React Compiler handles memoization automatically. Remove manual optimization.",
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
				// Check for direct hook calls
				if (node.callee.type === "Identifier") {
					if (["useMemo", "useCallback", "memo"].includes(node.callee.name)) {
						context.report({
							node: node.callee,
							messageId: "avoidMemoization",
						});
					}
				}

				// Check for React.* calls
				if (
					node.callee.type === "MemberExpression" &&
					node.callee.object.type === "Identifier" &&
					node.callee.object.name === "React" &&
					node.callee.property.type === "Identifier"
				) {
					const method = node.callee.property.name;
					if (["useMemo", "useCallback", "memo"].includes(method)) {
						context.report({
							node: node.callee,
							messageId: "avoidMemoization",
						});
					}
				}
			},
		};
	},
};
