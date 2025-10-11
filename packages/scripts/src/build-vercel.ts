#!/usr/bin/env bun
import { execSync } from "node:child_process"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, "../../..")

console.log("🏗️  Starting Vercel build...")

// Check if CONVEX_DEPLOY_KEY is set (production)
if (process.env.CONVEX_DEPLOY_KEY) {
  console.log("✅ CONVEX_DEPLOY_KEY detected - deploying Convex + building web")
  execSync(
    "cd packages/backend && npx convex deploy --cmd 'cd ../../apps/web && bun run build' --cmd-url-env-var-name VITE_CONVEX_URL",
    {
      cwd: ROOT_DIR,
      stdio: "inherit"
    }
  )
} else {
  console.log("⏭️  No CONVEX_DEPLOY_KEY - skipping Convex deploy, building web only")
  execSync("cd apps/web && bun run build", {
    cwd: ROOT_DIR,
    stdio: "inherit"
  })
}

console.log("✅ Build complete!")
