/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('estree').CallExpression} CallExpression
 * @typedef {import('estree').MemberExpression} MemberExpression
 * @typedef {import('estree').Identifier} Identifier
 * @typedef {import('estree').ArrowFunctionExpression} ArrowFunctionExpression
 * @typedef {import('estree').FunctionExpression} FunctionExpression
 */

/** @type {RuleModule} */
export default {
	meta: {
		type: "problem",
		docs: {
			description:
				"Prevent Promise.all/allSettled/race with database operations to avoid race conditions",
		},
		messages: {
			noParallelDb:
				"Don't use Promise.all/allSettled/race with database operations. Process sequentially with a for loop to avoid race conditions.",
		},
	},
	/**
	 * @param {RuleContext} context
	 */
	create(context) {
		/**
		 * Check if a node contains ctx.db operations
		 * @param {any} node
		 * @returns {boolean}
		 */
		function containsDbOperation(node) {
			let hasDbOp = false;

			function traverse(n) {
				if (!n || hasDbOp) return;

				// Check if this is ctx.db.* write operation pattern
				if (
					n.type === "MemberExpression" &&
					n.object?.type === "MemberExpression" &&
					n.object.object?.type === "Identifier" &&
					n.object.object.name === "ctx" &&
					n.object.property?.type === "Identifier" &&
					n.object.property.name === "db" &&
					n.property?.type === "Identifier" &&
					["insert", "patch", "replace", "delete"].includes(n.property.name)
				) {
					hasDbOp = true;
					return;
				}

				// Also check for direct db.* pattern (DatabaseWriter/DatabaseReader parameter)
				if (
					n.type === "MemberExpression" &&
					n.object?.type === "Identifier" &&
					n.object.name === "db" &&
					n.property?.type === "Identifier" &&
					["insert", "patch", "replace", "delete"].includes(n.property.name)
				) {
					hasDbOp = true;
					return;
				}

				// Traverse all properties
				for (const key in n) {
					if (key !== "parent" && n[key]) {
						if (Array.isArray(n[key])) {
							n[key].forEach(traverse);
						} else if (typeof n[key] === "object") {
							traverse(n[key]);
						}
					}
				}
			}

			traverse(node);
			return hasDbOp;
		}

		return {
			/**
			 * @param {CallExpression} node
			 */
			CallExpression(node) {
				// Check for Promise.all, Promise.allSettled, Promise.race
				if (
					node.callee.type === "MemberExpression" &&
					node.callee.object?.type === "Identifier" &&
					node.callee.object.name === "Promise" &&
					node.callee.property?.type === "Identifier" &&
					["all", "allSettled", "race"].includes(node.callee.property.name)
				) {
					// Check if any argument contains database operations
					const hasDbOps = node.arguments.some((arg) =>
						containsDbOperation(arg),
					);

					if (hasDbOps) {
						context.report({
							node,
							messageId: "noParallelDb",
						});
					}
				}
			},
		};
	},
};
