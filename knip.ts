import type { KnipConfig } from 'knip';
export default {
  workspaces: {
    ".": {
      entry: ["!**"],
      project: ["!**"],
    },
    "packages/ui": {
      entry: ["src/components/**/*.tsx", "src/lib/**/*.ts", "src/hooks/**/*.ts"],
      project: ["src/**/*.{ts,tsx}"],
      ignoreDependencies: ["tailwindcss", "tw-animate-css"],
    },
    "packages/backend": {
      convex: true,
      ignore: ["convex/betterAuth/schema.ts"],
    },
    "packages/scripts": {
      entry: ["src/**/*.ts"],
      project: ["src/**/*.ts"],
    },
    "apps/web": {
      entry: ["src/app/**/*.{ts,tsx}", "src/router.tsx"],
      project: ["src/**/*.{ts,tsx}"],
      ignore: ["src/routeTree.gen.ts", "src/shared/auth/lib/auth-server.ts", "vite.config.ts"],
      ignoreDependencies: ["tailwindcss", "tw-animate-css", "@tanstack/router-plugin", "@bprogress/core"],
    },
  },
} satisfies KnipConfig
