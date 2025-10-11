#!/usr/bin/env bun
import { execSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, "../../..")
const SOURCE_ROOT = process.env.SOURCE_ROOT || ROOT_DIR

const PORTS_TO_CHECK = [3000, 3210, 3211]

console.log("🚀 Setting up workspace for parallel development...")

// Kill processes on required ports before setup
console.log("🔍 Checking for processes on required ports...")
for (const port of PORTS_TO_CHECK) {
  try {
    const pid = execSync(`lsof -i :${port} -sTCP:LISTEN -t`, { encoding: "utf-8" }).trim()
    if (pid) {
      const processName = execSync(`ps -p ${pid} -o comm=`, { encoding: "utf-8" }).trim()
      execSync(`kill -9 ${pid}`, { stdio: "ignore" })
      console.log(`✅ Killed ${processName} (PID ${pid}) on port ${port}`)
    }
  } catch {
    // No process on this port
  }
}

// Check if bun is installed
try {
  execSync("bun --version", { stdio: "ignore" })
} catch {
  console.error("❌ Error: bun is not installed. Please install bun first: https://bun.sh")
  process.exit(1)
}

// Install dependencies first
console.log("📦 Installing dependencies...")
execSync("bun install", { cwd: ROOT_DIR, stdio: "inherit" })

// Function to set up env files
function setupEnvFile(workspacePath: string, workspaceName: string, sourceRoot: string) {
  const sourceEnvLocal = join(sourceRoot, workspacePath, ".env.local")
  const sourceEnvExample = join(sourceRoot, workspacePath, ".env.example")
  const targetEnvLocal = join(ROOT_DIR, workspacePath, ".env.local")

  let envContent: string
  let needsStripping = false

  // Check if .env.local exists in source root, otherwise fall back to .env.example
  if (existsSync(sourceEnvLocal)) {
    console.log(`📋 Using .env.local from source root for ${workspaceName}`)
    envContent = readFileSync(sourceEnvLocal, "utf-8")
    needsStripping = true // Strip deployment from existing .env.local
  } else if (existsSync(sourceEnvExample)) {
    console.log(`📋 Copying .env.example from source root for ${workspaceName}`)
    envContent = readFileSync(sourceEnvExample, "utf-8")
    needsStripping = false // .env.example shouldn't have deployment var
  } else {
    console.log(`⚠️  No .env file found for ${workspaceName}, skipping...`)
    return
  }

  // Strip ONLY the Convex deployment variable if coming from existing .env.local
  const finalContent = needsStripping
    ? envContent
        .split("\n")
        .filter(line => !line.match(/^CONVEX_DEPLOYMENT=/))
        .join("\n")
    : envContent

  // Ensure directory exists
  mkdirSync(dirname(targetEnvLocal), { recursive: true })

  // Write the content
  writeFileSync(targetEnvLocal, finalContent)
  console.log(`✅ Set up .env.local for ${workspaceName}`)
}

// Set up environment files for all workspaces
setupEnvFile("packages/backend", "backend", SOURCE_ROOT)
setupEnvFile("apps/web", "web", SOURCE_ROOT)

// Get current branch name for project identification
const branchName = execSync("git branch --show-current", { cwd: ROOT_DIR })
  .toString()
  .trim()

// Read project name from package.json
const packageJsonPath = join(ROOT_DIR, "package.json")
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"))
const projectName = packageJson.name || "convex-project"

// Calculate max allowed length for branch name
// Format: {branchName}-{projectName}
// Max total: 64 chars, minus 1 for dash
const MAX_SLUG_LENGTH = 64
const maxBranchNameLength = MAX_SLUG_LENGTH - 1 - projectName.length

// Trim branch name from left if needed to fit within Convex's 64 char limit
let trimmedBranchName = branchName
if (branchName.length > maxBranchNameLength) {
  trimmedBranchName = branchName.slice(branchName.length - maxBranchNameLength)
  console.log(`⚠️  Branch name trimmed to fit slug limit: ${trimmedBranchName}`)
}

const fullProjectSlug = `${trimmedBranchName}-${projectName}`
console.log(`📋 Project slug: ${fullProjectSlug} (${fullProjectSlug.length} chars)`)

// Initialize local Convex instance with branch-specific project name
console.log(`🔌 Initializing local Convex instance for branch '${branchName}'...`)
execSync(
  `npx convex dev --local --once --configure new --project "${fullProjectSlug}"`,
  {
    cwd: join(ROOT_DIR, "packages/backend"),
    stdio: "inherit"
  }
)

// Extract and save project slug from .env.local for cleanup script
const backendEnvPath = join(ROOT_DIR, "packages/backend/.env.local")
const backendEnv = readFileSync(backendEnvPath, "utf-8")
const projectSlugMatch = backendEnv.match(/# team:.*project: ([^ \n]*)/)?.[1]

if (projectSlugMatch) {
  const projectSlugPath = join(ROOT_DIR, ".convex-project-slug")
  writeFileSync(projectSlugPath, projectSlugMatch.trim())
  console.log(`📝 Saved project slug: ${projectSlugMatch}`)
}

// Run initial Convex setup
console.log("⚙️  Running initial Convex setup...")
execSync("npx convex dev --until-success", {
  cwd: join(ROOT_DIR, "packages/backend"),
  stdio: "inherit"
})

// Generate and set BETTER_AUTH_SECRET
console.log("🔧 Setting BETTER_AUTH_SECRET...")
const betterAuthSecret = execSync("openssl rand -base64 32").toString().trim()
execSync(`npx convex dev --once --run-sh "npx convex env set BETTER_AUTH_SECRET \\"${betterAuthSecret}\\""`, {
  cwd: join(ROOT_DIR, "packages/backend"),
  stdio: "inherit"
})

// Set SITE_URL for better-auth
console.log("🔧 Setting SITE_URL...")
execSync('npx convex dev --once --run-sh "npx convex env set SITE_URL \\"http://localhost:3000\\""', {
  cwd: join(ROOT_DIR, "packages/backend"),
  stdio: "inherit"
})

// Set DEBUG flag for local development
console.log("🔧 Setting DEBUG flag...")
execSync('npx convex dev --once --run-sh "npx convex env set DEBUG \\"true\\""', {
  cwd: join(ROOT_DIR, "packages/backend"),
  stdio: "inherit"
})

console.log("✅ Workspace setup complete!")
console.log("   You can now run the development server.")
