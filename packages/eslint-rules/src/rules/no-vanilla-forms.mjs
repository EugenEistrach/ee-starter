/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('estree').Node} Node
 * @typedef {import('estree').ImportDeclaration} ImportDeclaration
 */

/** @type {RuleModule} */
export default {
	meta: {
		type: "problem",
		docs: {
			description:
				"Enforce use of form abstraction (useAppForm) for complex forms with validation. See docs/how-to/build-forms.md for proper form patterns.",
		},
		messages: {
			missingFormHook:
				"Forms with validation or multiple fields must use useAppForm. See docs/how-to/build-forms.md for proper form patterns.",
		},
	},
	/**
	 * @param {RuleContext} context
	 */
	create(context) {
		let hasFormElement = false;
		let hasUiInputImport = false;
		let hasUseAppFormImport = false;
		let hasValidationImport = false;
		let inputFieldCount = 0;
		let hasErrorHandling = false;
		const formNodes = [];

		return {
			/**
			 * @param {ImportDeclaration} node
			 */
			ImportDeclaration(node) {
				const source = node.source.value;

				// Check for Input/Label/Select imports from @workspace/ui
				if (
					typeof source === "string" &&
					(source === "@workspace/ui/components/input" ||
						source === "@workspace/ui/components/label" ||
						source === "@workspace/ui/components/select" ||
						source === "@workspace/ui/components/textarea")
				) {
					hasUiInputImport = true;
				}

				// Check for useAppForm import
				if (
					typeof source === "string" &&
					source === "@workspace/ui/components/form"
				) {
					const hasUseAppForm = node.specifiers.some(
						(spec) =>
							spec.type === "ImportSpecifier" &&
							spec.imported.name === "useAppForm",
					);
					if (hasUseAppForm) {
						hasUseAppFormImport = true;
					}
				}

				// Check for validation library imports
				if (
					typeof source === "string" &&
					(source === "zod" ||
						source === "z" ||
						source === "yup" ||
						source.includes("validator"))
				) {
					hasValidationImport = true;
				}
			},

			/**
			 * @param {Node} node
			 */
			JSXOpeningElement(node) {
				// Check if this is a <form> element
				if (
					node.name &&
					node.name.type === "JSXIdentifier" &&
					node.name.name === "form"
				) {
					hasFormElement = true;
					formNodes.push(node);
				}

				// Count Input/Select/Textarea components
				if (
					node.name &&
					node.name.type === "JSXIdentifier" &&
					(node.name.name === "Input" ||
						node.name.name === "Select" ||
						node.name.name === "Textarea")
				) {
					inputFieldCount++;
				}

				// Check for error-related components
				if (
					node.name &&
					node.name.type === "JSXIdentifier" &&
					(node.name.name === "ErrorMessage" ||
						node.name.name === "FormError" ||
						node.name.name.toLowerCase().includes("error"))
				) {
					hasErrorHandling = true;
				}
			},

			/**
			 * @param {Node} node
			 */
			VariableDeclarator(node) {
				// Check for error state variables
				if (node.id && node.id.type === "Identifier") {
					const name = node.id.name;
					if (
						name.includes("error") ||
						name.includes("Error") ||
						name === "errors"
					) {
						hasErrorHandling = true;
					}
				}

				// Check for error variables in array destructuring (useState patterns)
				if (node.id && node.id.type === "ArrayPattern") {
					node.id.elements.forEach((element) => {
						if (element && element.type === "Identifier") {
							const name = element.name;
							if (
								name.includes("error") ||
								name.includes("Error") ||
								name === "errors"
							) {
								hasErrorHandling = true;
							}
						}
					});
				}
			},

			"Program:exit"() {
				// Only flag forms that show validation complexity
				if (hasFormElement && hasUiInputImport && !hasUseAppFormImport) {
					const needsFormAbstraction =
						hasValidationImport || // Has validation library
						hasErrorHandling || // Has error UI/state
						inputFieldCount >= 3; // Has multiple fields (3+)

					if (needsFormAbstraction) {
						formNodes.forEach((formNode) => {
							context.report({
								node: formNode,
								messageId: "missingFormHook",
							});
						});
					}
				}
			},
		};
	},
};
