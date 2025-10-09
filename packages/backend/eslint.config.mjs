// @ts-nocheck
// eslint.config.mjs
import antfu from '@antfu/eslint-config'

import customRules from '@workspace/eslint-rules'
import boundaries from 'eslint-plugin-boundaries'

export default antfu({
  gitignore: true,
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.convex/**',
    '**/convex/_generated/**',
    '**/*.md',
  ],
  typescript: {
    tsconfigPath: './convex/tsconfig.json',
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
  },
  javascript: {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
  },
  rules: {
    // Convex uses global process.env, disable node/prefer-global/process
    'node/prefer-global/process': 'off',
    // Enforce maximum nesting depth
    'max-depth': ['error', 2],
  },
}, customRules.configs.backend, {
  plugins: {
    boundaries,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './convex/tsconfig.json',
      },
    },
    'boundaries/elements': [
      { type: 'app', pattern: 'convex/app/**' },
      { type: 'features', pattern: 'convex/features/*', capture: ['feature'], mode: 'folder' },
      { type: 'shared', pattern: 'convex/shared/**' },
    ],
  },
  rules: {
    // Architecture boundaries
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        { from: 'app', allow: ['features', 'shared'] },
        { from: 'features', allow: ['shared'] },
      ],
    }],
  },
})
