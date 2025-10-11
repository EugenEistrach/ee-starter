import convexReturnsRequired from '../rules/convex-returns-required.mjs'
import noPromiseAllWithDb from '../rules/no-promise-all-with-db.mjs'
import noVAny from '../rules/no-v-any.mjs'
import noRestrictedImportsInFolders from '../rules/no-restricted-imports-in-folders.mjs'

export default {
	plugins: {
		'@workspace': {
			rules: {
				'convex-returns-required': convexReturnsRequired,
				'no-promise-all-with-db': noPromiseAllWithDb,
				'no-v-any': noVAny,
				'no-restricted-imports-in-folders': noRestrictedImportsInFolders,
			},
		},
	},
	rules: {
		'@workspace/convex-returns-required': 'error',
		'@workspace/no-promise-all-with-db': 'error',
		'@workspace/no-v-any': 'error',
		'@workspace/no-restricted-imports-in-folders': ['error', [
			{
				folders: ['/features/', '/shared/'],
				imports: [
					{
						source: 'convex/server',
						specifiers: ['query', 'mutation', 'action', 'internalQuery', 'internalMutation', 'internalAction'],
						reason: 'Only the convex layer can define Convex endpoints.',
					},
					{
						source: '_generated/server',
						specifiers: ['query', 'mutation', 'action', 'internalQuery', 'internalMutation', 'internalAction'],
						reason: 'Only the convex layer can define Convex endpoints.',
					},
				],
			},
		]],
	},
}
