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
    '**/convex/**/_generated/**',
    '**/*.md',
  ],
  typescript: {
    tsconfigPath: './tsconfig.json',
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
  },
  javascript: {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
  },
  rules: {
    // Convex uses global process.env, disable node/prefer-global/process
    'node/prefer-global/process': 'off',
    'unused-imports/no-unused-imports': 'off',
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
        project: './tsconfig.json',
      },
    },
    'boundaries/elements': [
      { type: 'generated', pattern: 'convex/**/_generated/**' },
      { type: 'convex', pattern: 'convex/**', mode: 'folder' },
      { type: 'features', pattern: 'features/*', capture: ['feature'], mode: 'folder' },
      { type: 'shared', pattern: 'shared/**' },
    ],
  },
  rules: {
    // Architecture boundaries
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        { from: 'convex', allow: ['features', 'shared', 'generated'] },
        { from: 'features', allow: ['shared', 'generated'] },
        { from: 'shared', allow: ['generated'] },
      ],
    }],
  },
})
