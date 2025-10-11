export default {
	meta: {
		type: "problem",
		docs: {
			description:
				"Discourage simple arbitrary pixel values in Tailwind classes",
		},
		messages: {
			noSimpleArbitraryValues:
				"Consider using Tailwind's default scale instead of '{{value}}' (e.g., 'w-5' instead of 'w-[20px]', 'p-1' instead of 'p-[4px]'). Arbitrary values are OK for calc() or special cases.",
		},
		fixable: null,
	},
	create(context) {
		// Skip checking files in shared/ui (shadcn components) and dev-tools (devtools use their own styling)
		const filename = context.filename || context.getFilename();
		if (
			filename.includes("/shared/ui/") ||
			filename.includes("\\shared\\ui\\") ||
			filename.includes("/packages/ui/") ||
			filename.includes("\\packages\\ui\\") ||
			filename.includes("/dev-tools/") ||
			filename.includes("\\dev-tools\\")
		) {
			return {};
		}

		// Only match simple pixel values, not calc() or complex values
		// This will catch [20px], [100px] etc but not [calc(100%-20px)]
		const simplePixelRegex = /\[(\d+(?:\.\d+)?px)\]/g;

		// Common pixel values that have direct Tailwind equivalents
		const commonPixelValues = new Set([
			"3px",
			"4px",
			"8px",
			"12px",
			"16px",
			"20px",
			"24px",
			"32px",
			"40px",
			"48px",
			"56px",
			"64px",
			"80px",
			"96px",
			"100px",
		]);

		return {
			// Check JSX attributes (className, class)
			JSXAttribute(node) {
				if (node.name.name === "className" || node.name.name === "class") {
					if (node.value && node.value.type === "Literal") {
						const value = node.value.value;
						if (typeof value === "string") {
							let match = simplePixelRegex.exec(value);
							while (match !== null) {
								// Only report if it's a common value that has a Tailwind equivalent
								if (commonPixelValues.has(match[1])) {
									context.report({
										node: node.value,
										messageId: "noSimpleArbitraryValues",
										data: {
											value: match[0],
										},
									});
								}
								match = simplePixelRegex.exec(value);
							}
							// Reset regex state
							simplePixelRegex.lastIndex = 0;
						}
					}
					// Also check template literals
					if (node.value && node.value.type === "JSXExpressionContainer") {
						const expression = node.value.expression;
						if (expression.type === "TemplateLiteral") {
							for (const quasi of expression.quasis) {
								let match = simplePixelRegex.exec(quasi.value.raw);
								while (match !== null) {
									if (commonPixelValues.has(match[1])) {
										context.report({
											node: node.value,
											messageId: "noSimpleArbitraryValues",
											data: {
												value: match[0],
											},
										});
									}
									match = simplePixelRegex.exec(quasi.value.raw);
								}
								simplePixelRegex.lastIndex = 0;
							}
						}
					}
				}
			},

			// Check template literals in cn() or clsx() calls
			CallExpression(node) {
				if (
					node.callee.name === "cn" ||
					node.callee.name === "clsx" ||
					node.callee.name === "twMerge"
				) {
					for (const arg of node.arguments) {
						if (arg.type === "Literal" && typeof arg.value === "string") {
							let match = simplePixelRegex.exec(arg.value);
							while (match !== null) {
								if (commonPixelValues.has(match[1])) {
									context.report({
										node: arg,
										messageId: "noSimpleArbitraryValues",
										data: {
											value: match[0],
										},
									});
								}
								match = simplePixelRegex.exec(arg.value);
							}
							simplePixelRegex.lastIndex = 0;
						}
						if (arg.type === "TemplateLiteral") {
							for (const quasi of arg.quasis) {
								let match = simplePixelRegex.exec(quasi.value.raw);
								while (match !== null) {
									if (commonPixelValues.has(match[1])) {
										context.report({
											node: arg,
											messageId: "noSimpleArbitraryValues",
											data: {
												value: match[0],
											},
										});
									}
									match = simplePixelRegex.exec(quasi.value.raw);
								}
								simplePixelRegex.lastIndex = 0;
							}
						}
					}
				}
			},
		};
	},
};
