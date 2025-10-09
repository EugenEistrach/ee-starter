export default {
  workspaces: {
    ".": {
      entry: ["!**"],
      project: ["!**"],
    },
    "packages/ui": {
      entry: ["src/components/**/*.tsx", "src/lib/**/*.ts", "src/hooks/**/*.ts"],
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
      entry: ["src/routes/**/*.tsx", "src/router.tsx"],
      ignore: ["src/routeTree.gen.ts", "src/lib/auth-server.ts"],
      ignoreDependencies: ["tailwindcss", "tw-animate-css", "@tanstack/router-plugin"],
    },
  },
}
