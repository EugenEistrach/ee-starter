/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('estree').Literal} Literal
 */

/** @type {RuleModule} */
export default {
	meta: {
		type: "problem",
		docs: {
			description: "Ban raw Tailwind color classes - use design system colors",
		},
		messages: {
			useDesignTokens:
				"Use design system colors instead of raw Tailwind colors (e.g., 'primary' not 'blue-500').",
		},
	},
	/**
	 * @param {RuleContext} context
	 */
	create(context) {
		// Skip checking files in dev-tools (devtools use their own color scheme)
		const filename = context.filename || context.getFilename();
		if (
			filename.includes("/dev-tools/") ||
			filename.includes("\\dev-tools\\")
		) {
			return {};
		}

		// Tailwind color names
		const colorNames = [
			"red",
			"blue",
			"green",
			"yellow",
			"purple",
			"pink",
			"gray",
			"slate",
			"zinc",
			"neutral",
			"stone",
			"orange",
			"amber",
			"lime",
			"emerald",
			"teal",
			"cyan",
			"sky",
			"indigo",
			"violet",
			"fuchsia",
			"rose",
		];

		// Tailwind color scales
		const colorScales = [
			"50",
			"100",
			"200",
			"300",
			"400",
			"500",
			"600",
			"700",
			"800",
			"900",
			"950",
		];

		// Utility prefixes we care about
		const utilityPrefixes = [
			"text",
			"bg",
			"border",
			"ring",
			"divide",
			"placeholder",
		];

		// Create regex pattern for all combinations
		const colorPattern = new RegExp(
			`\\b(${utilityPrefixes.join("|")})-(${colorNames.join("|")})-(${colorScales.join("|")})\\b`,
		);

		return {
			/**
			 * @param {Literal} node
			 */
			Literal(node) {
				// Only check string literals
				if (typeof node.value !== "string") return;

				const match = node.value.match(colorPattern);
				if (match) {
					context.report({
						node,
						messageId: "useDesignTokens",
					});
				}
			},
		};
	},
};
