import backend from './configs/backend.mjs'
import frontend from './configs/frontend.mjs'
import noRestrictedImportsInFolders from './rules/no-restricted-imports-in-folders.mjs'

export default {
	configs: {
		backend,
		frontend,
	},
	rules: {
		'no-restricted-imports-in-folders': noRestrictedImportsInFolders,
	},
}
