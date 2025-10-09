#!/usr/bin/env bun
import { execSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, "../../..")

const PORTS_TO_CHECK = [3000, 3210, 3211]

console.log("🗑️  Archiving workspace...")

// Kill processes on required ports
console.log("🛑 Stopping dev servers...")
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

const backendEnvPath = join(ROOT_DIR, "packages/backend/.env.local")

// Check if .env.local exists
if (!existsSync(backendEnvPath)) {
  console.error("❌ Error: .env.local not found in packages/backend")
  process.exit(1)
}

// Check if safety slug file exists
const safetySlugPath = join(ROOT_DIR, ".convex-safety-slug")
if (!existsSync(safetySlugPath)) {
  console.error("❌ Error: .convex-safety-slug not found. This workspace may not have been set up properly.")
  process.exit(1)
}

// Read safety slug
const safetySlug = readFileSync(safetySlugPath, "utf-8").trim()
if (!safetySlug) {
  console.error("❌ Error: Safety slug is empty")
  process.exit(1)
}
console.log(`🔒 Safety slug: ${safetySlug}`)

// Read project slug from persisted file (preferred) or fall back to .env.local
const projectSlugPath = join(ROOT_DIR, ".convex-project-slug")
let projectSlug: string

if (existsSync(projectSlugPath)) {
  projectSlug = readFileSync(projectSlugPath, "utf-8").trim()
  console.log(`📋 Found project slug from file: ${projectSlug}`)
} else {
  const envContent = readFileSync(backendEnvPath, "utf-8")
  const match = envContent.match(/# team:.*project: ([^ \n]*)/)
  if (!match || !match[1]) {
    console.error("❌ Error: Could not extract project slug")
    process.exit(1)
  }
  projectSlug = match[1].trim()
  console.log(`📋 Found project slug from .env.local: ${projectSlug}`)
}

// Verify safety slug is in project slug
if (!projectSlug.includes(safetySlug)) {
  console.error("❌ Error: Safety slug mismatch! Project slug does not contain expected safety slug.")
  console.error("   This is a safety check to prevent deleting wrong projects.")
  console.error(`   Expected: ${safetySlug}`)
  console.error(`   Found in: ${projectSlug}`)
  process.exit(1)
}
console.log("✅ Safety check passed")

// Get team access token
const envContent = readFileSync(backendEnvPath, "utf-8")
const teamTokenMatch = envContent.match(/^CONVEX_TEAM_ACCESS_TOKEN=(.*)$/m)
if (!teamTokenMatch || !teamTokenMatch[1]) {
  console.error("❌ Error: CONVEX_TEAM_ACCESS_TOKEN not found in .env.local")
  process.exit(1)
}
const teamToken = teamTokenMatch[1].trim()

// Get team ID from token details
console.log("🔍 Getting team ID...")
const tokenDetailsResponse = await fetch("https://api.convex.dev/v1/token_details", {
  headers: { "Authorization": `Bearer ${teamToken}` }
})

if (!tokenDetailsResponse.ok) {
  console.error("❌ Error: Could not retrieve token details")
  process.exit(1)
}

const tokenDetails = await tokenDetailsResponse.json() as { teamId?: number }
const teamId = tokenDetails.teamId

if (!teamId) {
  console.error("❌ Error: Could not retrieve team ID")
  process.exit(1)
}
console.log(`✅ Team ID: ${teamId}`)

// List projects and find matching project ID
console.log(`🔍 Finding project ID for slug: ${projectSlug}...`)
const listProjectsResponse = await fetch(`https://api.convex.dev/v1/teams/${teamId}/list_projects`, {
  headers: { "Authorization": `Bearer ${teamToken}` }
})

if (!listProjectsResponse.ok) {
  console.error("❌ Error: Could not list projects")
  process.exit(1)
}

const projects = await listProjectsResponse.json() as Array<{ id: number; slug: string }>
const project = projects.find((p) => p.slug === projectSlug)

if (!project) {
  console.log(`⚠️  Warning: Project with slug '${projectSlug}' not found. It may have already been deleted.`)
  process.exit(0)
}

const projectId = project.id
console.log(`✅ Found project ID: ${projectId}`)

// Delete the project
console.log("🗑️  Deleting project...")
const deleteResponse = await fetch(`https://api.convex.dev/v1/projects/${projectId}/delete`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${teamToken}` }
})

if (!deleteResponse.ok) {
  console.error(`❌ Error: Failed to delete project (HTTP ${deleteResponse.status})`)
  console.error(await deleteResponse.text())
  process.exit(1)
}

console.log(`✅ Successfully deleted project '${projectSlug}' (ID: ${projectId})`)
console.log("🎉 Workspace archived successfully!")
