

import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'
import { syncRoutesToBackend } from '../../packages/scripts/src/vite-plugin-sync-routes.ts'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    syncRoutesToBackend(),
    tanstackStart({
      router: {
        routesDirectory: './app',
      }
    }),
    nitroV2Plugin({
      preset: "vercel",
      output: {
        dir: "../../.vercel/output"
      }
    }),
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
})


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason)

  console.error('Stack:', (reason as any)?.stack);
  console.error('Type:', typeof reason);
  console.error('Constructor:', reason?.constructor?.name);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});
