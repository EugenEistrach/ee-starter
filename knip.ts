export default {
  workspaces: {
    ".": {
      entry: ["!**"],
      project: ["!**"],
    },
    "packages/ui": {
      entry: ["src/components/**/*.tsx", "src/lib/**/*.ts", "src/hooks/**/*.ts"],
      ignoreDependencies: ["tailwindcss", "tw-animate-css"],
    },
    "packages/backend": {
      entry: ["convex/**/*.ts"],
      ignore: ["convex/_generated/**"],
    },
    "packages/scripts": {
      entry: ["src/**/*.ts"],
      project: ["src/**/*.ts"],
    },
    "apps/web": {
      entry: ["src/app/**/*.{ts,tsx}", "src/router.tsx"],
      ignore: ["src/routeTree.gen.ts", "src/shared/auth/lib/auth-server.ts"],
      ignoreDependencies: ["tailwindcss", "tw-animate-css", "@tanstack/router-plugin"],
    },
  },
}
