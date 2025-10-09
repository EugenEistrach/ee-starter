import noArbitraryValues from '../rules/no-arbitrary-values.mjs'
import noTailwindRawColors from '../rules/no-tailwind-raw-colors.mjs'
import noErrorInToast from '../rules/no-error-in-toast.mjs'
import noPrematureOptimization from '../rules/no-premature-optimization.mjs'
import noRestrictedImportsInFolders from '../rules/no-restricted-imports-in-folders.mjs'

export default {
	plugins: {
		'@workspace': {
			rules: {
				'no-arbitrary-values': noArbitraryValues,
				'no-tailwind-raw-colors': noTailwindRawColors,
				'no-error-in-toast': noErrorInToast,
				'no-premature-optimization': noPrematureOptimization,
				'no-restricted-imports-in-folders': noRestrictedImportsInFolders,
			},
		},
	},
	rules: {
		'@workspace/no-arbitrary-values': 'error',
		'@workspace/no-tailwind-raw-colors': 'error',
		'@workspace/no-error-in-toast': 'error',
		'@workspace/no-premature-optimization': 'error',
		'@workspace/no-restricted-imports-in-folders': ['error', [
			{
				folders: ['/components/'],
				imports: [
					{
						source: '@tanstack/react-query',
						specifiers: ['useQuery', 'useMutation', 'useSuspenseQuery', 'useInfiniteQuery', 'useQueries'],
						reason: 'Components should receive data via props, not fetch directly.',
					},
					{
						source: '@convex-dev/react-query',
						specifiers: ['useQuery', 'useMutation', 'convexQuery'],
						reason: 'Components should receive data via props, not fetch directly.',
					},
					{
						source: 'convex/react',
						specifiers: ['useQuery', 'useMutation', 'useAction', 'useConvexAuth'],
						reason: 'Components should receive data via props, not fetch directly.',
					},
				],
			},
		]],
	},
}
