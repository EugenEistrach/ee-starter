/**
 * @fileoverview Disallow specific imports in specific folder patterns
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow specific imports in specific folder patterns',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      restrictedImport: 'Importing "{{specifier}}" from "{{source}}" is not allowed in {{folder}} folders. {{reason}}',
      restrictedNamespace: 'Namespace imports from "{{source}}" are not allowed in {{folder}} folders. {{reason}}',
    },
    schema: [
      {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            folders: {
              type: 'array',
              items: { type: 'string' },
              description: 'Folder patterns to check (e.g., "/features/", "/components/")',
            },
            imports: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  source: {
                    type: 'string',
                    description: 'Import source to restrict (e.g., "convex/server", "react-query")',
                  },
                  specifiers: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Specific named imports to restrict (optional, if omitted all imports are restricted)',
                  },
                  reason: {
                    type: 'string',
                    description: 'Reason for the restriction',
                  },
                },
                required: ['source'],
                additionalProperties: false,
              },
            },
          },
          required: ['folders', 'imports'],
          additionalProperties: false,
        },
      },
    ],
  },

  create(context) {
    const filename = context.filename || context.getFilename()
    const options = context.options[0] || []

    return {
      ImportDeclaration(node) {
        // Skip type-only imports
        if (node.importKind === 'type') {
          return
        }

        const source = node.source.value

        // Check each configuration rule
        for (const rule of options) {
          const { folders, imports } = rule

          // Check if file is in any of the restricted folders
          const isInRestrictedFolder = folders.some(folder => filename.includes(folder))
          if (!isInRestrictedFolder) {
            continue
          }

          // Check if this import matches any restricted imports
          for (const importRule of imports) {
            const { source: restrictedSource, specifiers, reason } = importRule

            // Check if the import source matches
            const sourceMatches = source === restrictedSource || source.includes(restrictedSource)
            if (!sourceMatches) {
              continue
            }

            // If no specifiers defined, disallow all imports from this source
            if (!specifiers || specifiers.length === 0) {
              // Check for namespace imports
              const hasNamespaceImport = node.specifiers.some(s => s.type === 'ImportNamespaceSpecifier')
              if (hasNamespaceImport) {
                context.report({
                  node,
                  messageId: 'restrictedNamespace',
                  data: {
                    source,
                    folder: folders.join(', '),
                    reason: reason || '',
                  },
                })
                continue
              }

              context.report({
                node: node.source,
                messageId: 'restrictedImport',
                data: {
                  specifier: 'all',
                  source,
                  folder: folders.join(', '),
                  reason: reason || '',
                },
              })
              continue
            }

            // Check for namespace imports when specific specifiers are restricted
            const hasNamespaceImport = node.specifiers.some(s => s.type === 'ImportNamespaceSpecifier')
            if (hasNamespaceImport) {
              context.report({
                node,
                messageId: 'restrictedNamespace',
                data: {
                  source,
                  folder: folders.join(', '),
                  reason: reason || 'Use named imports instead.',
                },
              })
              continue
            }

            // Check each imported specifier
            for (const specifier of node.specifiers) {
              // Skip type-only specifiers
              if (specifier.importKind === 'type') {
                continue
              }

              if (specifier.type === 'ImportSpecifier') {
                const importedName = specifier.imported.name

                if (specifiers.includes(importedName)) {
                  context.report({
                    node: specifier,
                    messageId: 'restrictedImport',
                    data: {
                      specifier: importedName,
                      source,
                      folder: folders.join(', '),
                      reason: reason || '',
                    },
                  })
                }
              }
              else if (specifier.type === 'ImportDefaultSpecifier' && specifiers.includes('default')) {
                context.report({
                  node: specifier,
                  messageId: 'restrictedImport',
                  data: {
                    specifier: 'default',
                    source,
                    folder: folders.join(', '),
                    reason: reason || '',
                  },
                })
              }
            }
          }
        }
      },
    }
  },
}
