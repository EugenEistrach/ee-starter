// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  gitignore: true,
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.convex/**',
    '**/convex/_generated/**',
  ],
  typescript: {
    tsconfigPath: './convex/tsconfig.json',
  },
  rules: {
    // Convex uses global process.env, disable node/prefer-global/process
    'node/prefer-global/process': 'off',
  },
})
