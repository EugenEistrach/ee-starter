#!/usr/bin/env bun
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, '../../..')

function isGitRepo(): boolean {
  return existsSync(join(ROOT_DIR, '.git'))
}

function isInitialized(): boolean {
  const packageJsonPath = join(ROOT_DIR, 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
  return packageJson.name !== 'ee-starter'
}

function isInteractive(): boolean {
  return process.stdin.isTTY === true && process.stdout.isTTY === true
}

async function main() {
  // Skip if this is the git repo (developer working on boilerplate)
  if (isGitRepo()) {
    return
  }

  // Already initialized, skip silently
  if (isInitialized()) {
    return
  }

  // First install detected (tiget/giget clone)
  if (isInteractive()) {
    console.log('\n🎉 Welcome to ee-starter!\n')
    execSync('bun run packages/scripts/src/init.ts', {
      cwd: ROOT_DIR,
      stdio: 'inherit'
    })
  } else {
    // Non-interactive environment (CI, etc.)
    console.log('\n📦 ee-starter installed!')
    console.log('   Run `bun run packages/scripts/src/init.ts` to initialize your project\n')
  }
}

main().catch(console.error)
