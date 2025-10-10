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
      // More specific patterns first - components within features/shared
      { type: 'components', pattern: 'src/features/*/components/**', mode: 'file', capture: ['feature'] },
      { type: 'components', pattern: 'src/shared/*/components/**', mode: 'file', capture: ['domain'] },
      // Then feature/shared folders
      { type: 'features', pattern: 'src/features/*/**', mode: 'file', capture: ['feature'] },
      { type: 'shared', pattern: 'src/shared/*/**', mode: 'file', capture: ['domain'] },
      // App routes last
      { type: 'app', pattern: 'src/app/**' },
    ],
  },
  rules: {
    'react-compiler/react-compiler': 'error',
    '@tanstack/router/create-route-property-order': 'warn',
    'unused-imports/no-unused-imports': 'off',
    // Enforce maximum nesting depth
    'max-depth': ['error', 2],
    // Encourage named parameters for functions with many params
    'max-params': ['warn', 3],

    // Architecture boundaries
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        // App can import anything
        {
          from: 'app',
          allow: ['features', 'shared', 'components', 'ui', 'backend'],
        },
        // Features can only import from same feature, shared, ui, backend
        {
          from: 'features',
          allow: [
            ['features', { feature: '${from.feature}' }],
            ['components', { feature: '${from.feature}' }],
            'shared',
            'ui',
            'backend',
          ],
        },
        // Shared can only import from same domain, ui, backend
        {
          from: 'shared',
          allow: [
            ['shared', { domain: '${from.domain}' }],
            ['components', { domain: '${from.domain}' }],
            'ui',
            'backend',
          ],
        },
        // Components can import from UI and same-domain shared/features
        {
          from: 'components',
          allow: [
            'ui',
            ['shared', { domain: '${from.domain}' }],
            ['features', { feature: '${from.feature}' }],
          ],
        },
        // Allow type-only imports from backend in components
        {
          from: 'components',
          allow: ['backend'],
          importKind: 'type',
        },
        // UI and backend are isolated
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
