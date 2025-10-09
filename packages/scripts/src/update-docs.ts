#!/usr/bin/env bun
import { execSync } from "node:child_process"
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, "../../..")

const MARKER_START = "<!-- [auto-generated] packages/scripts/src/update-docs.ts -->"
const MARKER_END = "<!-- [/auto-generated] -->"

function getDocsFiles(docsPath: string): string[] {
  const files: string[] = []

  function walk(dir: string, basePath: string = ""): void {
    const entries = readdirSync(join(ROOT_DIR, dir), { withFileTypes: true })

    for (const entry of entries) {
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name
      const fullPath = `${dir}/${entry.name}`

      if (entry.isDirectory()) {
        walk(fullPath, relativePath)
      } else if (entry.name.endsWith(".md")) {
        files.push(fullPath)
      }
    }
  }

  walk(docsPath)
  return files.sort()
}

function generateDocsListForClaude(): string {
  const howToFiles = getDocsFiles("docs/how-to")
  const referenceFiles = getDocsFiles("docs/references")

  let content = ""

  if (howToFiles.length > 0) {
    content += "**How-To Guides** (processes and workflows):\n"
    for (const file of howToFiles) {
      content += `- ${file}\n`
    }
    content += "\n"
  }

  if (referenceFiles.length > 0) {
    content += "**References** (general information and docs):\n"
    for (const file of referenceFiles) {
      content += `- ${file}\n`
    }
  }

  return content.trim()
}

function generateDocsListForReadme(): string {
  const howToFiles = getDocsFiles("docs/how-to")
  const referenceFiles = getDocsFiles("docs/references")

  let content = "**How-To Guides:**\n"
  for (const file of howToFiles) {
    content += `- [${file}](${file})\n`
  }
  content += "\n"

  content += "**References:**\n"
  for (const file of referenceFiles) {
    content += `- [${file}](${file})\n`
  }

  return content.trim()
}

function updateFileSection(filePath: string, contentGenerator: () => string): boolean {
  const fullPath = join(ROOT_DIR, filePath)
  const content = readFileSync(fullPath, "utf-8")

  const startIndex = content.indexOf(MARKER_START)
  const endIndex = content.indexOf(MARKER_END)

  if (startIndex === -1 || endIndex === -1) {
    return false
  }

  const docsList = contentGenerator()
  const before = content.substring(0, startIndex + MARKER_START.length)
  const after = content.substring(endIndex)

  const newContent = `${before}\n${docsList}\n${after}`

  if (newContent !== content) {
    writeFileSync(fullPath, newContent)
    return true
  }

  return false
}

console.log("📝 Updating auto-generated documentation lists...")

const updatedFiles: string[] = []

if (updateFileSection("CLAUDE.md", generateDocsListForClaude)) {
  updatedFiles.push("CLAUDE.md")
  console.log("✅ Updated CLAUDE.md")
}

if (updateFileSection("README.md", generateDocsListForReadme)) {
  updatedFiles.push("README.md")
  console.log("✅ Updated README.md")
}

// Stage the updated files if any were modified
if (updatedFiles.length > 0) {
  try {
    execSync(`git add ${updatedFiles.join(" ")}`, { cwd: ROOT_DIR, stdio: "inherit" })
    console.log("✅ Staged updated files")
  } catch (error) {
    console.error("⚠️  Failed to stage files - you may need to stage them manually")
  }
} else {
  console.log("✨ Documentation lists are up to date")
}
