// eslint.config.mjs
import antfu from '@antfu/eslint-config'
import pluginQuery from '@tanstack/eslint-plugin-query'
import pluginRouter from '@tanstack/eslint-plugin-router'
import boundaries from 'eslint-plugin-boundaries'
import reactCompiler from 'eslint-plugin-react-compiler'
import customRules from '@workspace/eslint-rules'

export default antfu({
  gitignore: true,
  ignores: [
    '**/node_modules/**',
    '**/.convex/**',
    '**/convex/_generated/**',
    '**/dist/**',
    '**/*.gen.*',
    '**/routeTree.gen.ts',
    '**/.claude/**',
    '**/.git/**',
    '**/*.md',
    '**/*.json',
    '**/*.css',
    '**/*.html',
    '.DS_Store',
    'ios/**',
    'android/**',
    '**/.turbo/**',
    '**/.env*',
    '**/public/**',
    '**/*.config.*',
  ],
  typescript: {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
  },
  javascript: {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
  },
  react: true,
}, ...pluginQuery.configs['flat/recommended'], {
  plugins: {
    'react-compiler': reactCompiler,
    '@tanstack/router': pluginRouter,
    boundaries,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
    'boundaries/elements': [
      { type: 'backend', pattern: '**/packages/backend/**' },
      { type: 'ui', pattern: '**/packages/ui/**' },
      { type: 'feature-components', pattern: 'src/features/*/components/**', capture: ['feature'] },
      { type: 'shared-components', pattern: 'src/shared/**/components/**' },
      { type: 'app', pattern: 'src/app/**' },
      { type: 'features', pattern: 'src/features/*', capture: ['feature'], mode: 'folder' },
      { type: 'shared', pattern: 'src/shared/**' },
    ],
  },
  rules: {
    'react-compiler/react-compiler': 'error',
    '@tanstack/router/create-route-property-order': 'warn',
    // Enforce maximum nesting depth
    'max-depth': ['error', 2],
    // Encourage named parameters for functions with many params
    'max-params': ['warn', 3],

    // Architecture boundaries
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        { from: 'app', allow: ['features', 'shared', 'shared-components', 'ui', 'backend'] },
        {
          from: 'features',
          allow: [
            // Features can only import from the same feature (including its components)
            ['features', { feature: '${from.feature}' }],
            ['feature-components', { feature: '${from.feature}' }],
            'shared',
            'shared-components',
            'ui',
            'backend',
          ],
        },
        {
          from: 'feature-components',
          allow: [
            // Feature components can import from other components in the same feature and ui
            ['feature-components', { feature: '${from.feature}' }],
            'ui',
          ],
        },
        {
          from: 'feature-components',
          allow: ['backend'],
          importKind: 'type',
        },
        {
          from: 'shared-components',
          allow: ['shared-components', 'ui'],
        },
        {
          from: 'shared-components',
          allow: ['backend'],
          importKind: 'type',
        },
        { from: 'shared', allow: ['shared-components', 'ui', 'backend'] },
        { from: 'ui', allow: [] },
        { from: 'backend', allow: [] },
      ],
    }],
    'boundaries/no-unknown': 'off',
    'boundaries/no-private': 'error',
    'boundaries/external': ['error', {
      default: 'allow',
    }],
  },
}, customRules.configs.frontend)
