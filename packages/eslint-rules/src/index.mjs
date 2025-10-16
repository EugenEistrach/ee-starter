import backend from './configs/backend.mjs'
import frontend from './configs/frontend.mjs'
import noRestrictedImportsInFolders from './rules/no-restricted-imports-in-folders.mjs'
import noVanillaForms from './rules/no-vanilla-forms.mjs'
import noManualAsyncState from './rules/no-manual-async-state.mjs'

export default {
	configs: {
		backend,
		frontend,
	},
	rules: {
		'no-restricted-imports-in-folders': noRestrictedImportsInFolders,
		'no-vanilla-forms': noVanillaForms,
		'no-manual-async-state': noManualAsyncState,
	},
}
