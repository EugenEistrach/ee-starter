/**
 * Prevents passing error objects directly to toast.error()
 * Error objects should not be shown to users - use user-friendly messages instead
 */

export default {
	meta: {
		type: "problem",
		docs: {
			description: "Prevents passing error objects to toast.error()",
		},
		messages: {
			noErrorInToast:
				"Don't pass error objects to toast.error(). Use user-friendly messages like 'Something went wrong. Please try again or contact support.' Console.error() the actual error if needed for debugging.",
		},
		fixable: null,
	},
	create(context) {
		return {
			CallExpression(node) {
				// Check if it's toast.error()
				if (
					node.callee.type === "MemberExpression" &&
					node.callee.object.name === "toast" &&
					node.callee.property.name === "error"
				) {
					// Helper function to check if identifier looks like an error
					const isErrorLike = (name) => {
						const lower = name.toLowerCase();
						return lower.includes("error") || lower.includes("err");
					};

					// Check if any argument is an identifier that could be an error object
					// or a template literal containing an error variable
					for (const arg of node.arguments) {
						if (arg.type === "Identifier" && isErrorLike(arg.name)) {
							context.report({
								node: arg,
								messageId: "noErrorInToast",
							});
						}
						// Check for template literals with error objects
						if (arg.type === "TemplateLiteral") {
							for (const expr of arg.expressions) {
								if (expr.type === "Identifier" && isErrorLike(expr.name)) {
									context.report({
										node: expr,
										messageId: "noErrorInToast",
									});
								}
								// Check for error.message or error.toString()
								if (
									expr.type === "MemberExpression" &&
									expr.object.type === "Identifier" &&
									isErrorLike(expr.object.name)
								) {
									context.report({
										node: expr,
										messageId: "noErrorInToast",
									});
								}
							}
						}
						// Check for direct error.message or error.toString()
						if (
							arg.type === "MemberExpression" &&
							arg.object.type === "Identifier" &&
							isErrorLike(arg.object.name)
						) {
							context.report({
								node: arg,
								messageId: "noErrorInToast",
							});
						}
					}
				}
			},
		};
	},
};
