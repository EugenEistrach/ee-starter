#!/usr/bin/env bun
import { execSync } from "node:child_process"
import { existsSync } from "node:fs"
import { join, dirname, basename } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, "../../..")

// File patterns that are always allowed (case-insensitive)
const ALLOWED_FILENAMES = [
  "readme.md",
  "claude.md",
  "agents.md"
]

// Directories where .md files are allowed
const ALLOWED_MD_DIRECTORIES = [
  "docs/how-to",
  "docs/references",
  ".claude"
]

function isInWorktree(): boolean {
  try {
    // Check if .git is a file (worktree) instead of a directory
    const gitPath = join(ROOT_DIR, ".git")
    if (!existsSync(gitPath)) {
      return false
    }

    // In a worktree, .git is a file containing gitdir reference
    // In a normal repo, .git is a directory
    const gitCheck = execSync("test -f .git && echo 'file' || echo 'dir'", {
      cwd: ROOT_DIR,
      encoding: "utf-8"
    }).trim()

    return gitCheck === "file"
  } catch {
    return false
  }
}

function getUnstagedFiles(): string[] {
  try {
    // Get all unstaged files (modified, deleted, untracked)
    const output = execSync("git status --porcelain", {
      cwd: ROOT_DIR,
      encoding: "utf-8"
    }).trim()

    if (!output) return []

    return output
      .split("\n")
      .filter(line => {
        // Filter for unstaged files
        // Format: XY filename (X=staged, Y=unstaged)
        // We want files where Y is not empty (unstaged changes)
        const status = line.substring(0, 2)
        return status[1] !== " " && status[1] !== ""
      })
      .map(line => line.substring(3).trim())
  } catch {
    return []
  }
}

function getStagedFiles(): string[] {
  try {
    const output = execSync("git diff --cached --name-only", {
      cwd: ROOT_DIR,
      encoding: "utf-8"
    }).trim()

    if (!output) return []
    return output.split("\n").filter(Boolean)
  } catch {
    return []
  }
}

function isAllowedFilename(filename: string): boolean {
  const lower = filename.toLowerCase()
  return ALLOWED_FILENAMES.some(allowed => lower === allowed)
}

function isInAllowedDirectory(filepath: string): boolean {
  return ALLOWED_MD_DIRECTORIES.some(dir => filepath.startsWith(dir))
}

function validateMarkdownFiles(stagedFiles: string[]): { blocked: string[], reasons: string[] } {
  const blocked: string[] = []
  const reasons: string[] = []

  for (const file of stagedFiles) {
    // Only check .md files
    if (!file.endsWith(".md")) continue

    const filename = basename(file)

    // Skip if it's an allowed filename
    if (isAllowedFilename(filename)) continue

    // Skip if it's in an allowed directory
    if (isInAllowedDirectory(file)) continue

    // This markdown file is not allowed
    blocked.push(file)
    reasons.push(`  ❌ ${file}`)
    reasons.push(`     → Not in allowed docs folders and not an allowed filename`)
  }

  return { blocked, reasons }
}

// Main validation
console.log("🔍 Validating commit...")

const inWorktree = isInWorktree()

if (inWorktree) {
  console.log("📍 Detected worktree environment")
}

// Check for unstaged files
const unstagedFiles = getUnstagedFiles()

if (unstagedFiles.length > 0) {
  console.error("\n❌ Commit blocked: You have unstaged files\n")
  console.error("Unstaged files:")
  unstagedFiles.forEach(file => console.error(`  - ${file}`))

  console.error("\n💡 What to do:")
  console.error("  1. Review these files carefully")
  console.error("  2. If intended: git add <file>")
  console.error("  3. If temp/unwanted: delete the file")
  console.error("  4. If permanent but not needed in git: add to .gitignore")

  if (inWorktree) {
    console.error("\n⚠️  Worktree detected: Be extra careful with unstaged files!")
    console.error("   Ensure no unintended files from parallel work leak into this commit.")
  }

  process.exit(1)
}

// Check for blocked file patterns
const stagedFiles = getStagedFiles()
const { blocked, reasons } = validateMarkdownFiles(stagedFiles)

if (blocked.length > 0) {
  console.error("\n❌ Commit blocked: Disallowed files detected\n")
  console.error("The following files are not allowed:\n")
  reasons.forEach(reason => console.error(reason))

  console.error("\n📋 Allowed .md files:")
  console.error("  • README.md, CLAUDE.md, AGENTS.md (case-insensitive, anywhere)")
  console.error("  • Any .md files in docs/how-to/, docs/references/, or .claude/")

  console.error("\n💡 What to do:")
  console.error("  1. Move documentation to docs/how-to/, docs/references/, or .claude/")
  console.error("  2. Or rename to README.md, CLAUDE.md, or AGENTS.md")
  console.error("  3. Or delete if it's temporary documentation")

  process.exit(1)
}

console.log("✅ Commit validation passed")
