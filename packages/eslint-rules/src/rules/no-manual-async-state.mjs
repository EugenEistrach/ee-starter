/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('estree').CallExpression} CallExpression
 * @typedef {import('estree').ArrayPattern} ArrayPattern
 */

/** @type {RuleModule} */
export default {
	meta: {
		type: "problem",
		docs: {
			description:
				"Ban manual async state tracking - use proper abstractions",
		},
		messages: {
			manualAsyncState:
				"Avoid manual async state (isSubmitting/isLoading/loading/isPending). Use TanStack Query mutations (mutation.isPending), form.Subscribe selector, or useTransition instead.",
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
				// Check for useState calls
				if (
					node.callee.type === "Identifier" &&
					node.callee.name === "useState"
				) {
					// Get the parent node to find the variable name
					const parent = node.parent;
					if (
						parent &&
						parent.type === "VariableDeclarator" &&
						parent.id.type === "ArrayPattern" &&
						parent.id.elements.length > 0
					) {
						const firstElement = parent.id.elements[0];
						if (firstElement && firstElement.type === "Identifier") {
							const varName = firstElement.name;
							// Check for common async state patterns
							const bannedPatterns = [
								"isSubmitting",
								"isLoading",
								"loading",
								"isPending",
							];
							if (bannedPatterns.includes(varName)) {
								context.report({
									node,
									messageId: "manualAsyncState",
								});
							}
						}
					}
				}
			},
		};
	},
};
