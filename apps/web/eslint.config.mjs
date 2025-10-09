// eslint.config.mjs
import antfu from '@antfu/eslint-config'
import pluginQuery from '@tanstack/eslint-plugin-query'
import pluginRouter from '@tanstack/eslint-plugin-router'
import reactCompiler from 'eslint-plugin-react-compiler'

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
  react: true,
}, ...pluginQuery.configs['flat/recommended'], {
  plugins: {
    'react-compiler': reactCompiler,
    '@tanstack/router': pluginRouter,
  },
  rules: {
    'react-compiler/react-compiler': 'error',
    '@tanstack/router/create-route-property-order': 'warn',
  },
})
