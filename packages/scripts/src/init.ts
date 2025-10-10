#!/usr/bin/env bun
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, '../../..')

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(w => w.length > 0)
  if (words.length === 0) return 'AP'
  if (words.length === 1) {
    return words[0]!.slice(0, 2).toUpperCase()
  }
  return words.slice(0, 2).map(w => w[0]!).join('').toUpperCase()
}

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && !slug.startsWith('-') && !slug.endsWith('-')
}

function replaceInFile(filePath: string, search: string | RegExp, replace: string): void {
  const content = readFileSync(filePath, 'utf-8')
  const updated = content.replace(search, replace)
  writeFileSync(filePath, updated, 'utf-8')
}

async function main() {
  const rl = createInterface({ input, output })

  console.log('🚀 Initialize new project from ee-starter\n')

  // Prompt for app name
  const appName = await rl.question('App name: ')
  if (!appName.trim()) {
    console.error('❌ App name cannot be empty')
    rl.close()
    process.exit(1)
  }

  // Show derived slug and allow editing
  let slug = slugify(appName)
  console.log(`\nDerived package name: ${slug}`)
  const editSlug = await rl.question('Edit package name? (press enter to keep): ')

  if (editSlug.trim()) {
    slug = slugify(editSlug)
  }

  if (!isValidSlug(slug)) {
    console.error(`❌ Invalid package name: ${slug}`)
    console.error('   Must be lowercase with hyphens only')
    rl.close()
    process.exit(1)
  }

  const initials = getInitials(appName)

  console.log('\n📝 Updating project files...')

  // Update package.json
  const packageJsonPath = join(ROOT_DIR, 'package.json')
  replaceInFile(packageJsonPath, /"name":\s*"ee-starter"/, `"name": "${slug}"`)
  console.log('✅ Updated package.json')

  // Update README.md
  const readmePath = join(ROOT_DIR, 'README.md')
  replaceInFile(readmePath, /ee-starter/g, slug)
  console.log('✅ Updated README.md')

  // Update __root.tsx title
  const rootTsxPath = join(ROOT_DIR, 'apps/web/src/app/__root.tsx')
  replaceInFile(rootTsxPath, /title:\s*'EE Starter'/, `title: '${appName}'`)
  console.log('✅ Updated site title')

  // Update dashboard.tsx - initials and name
  const dashboardPath = join(ROOT_DIR, 'apps/web/src/app/dashboard.tsx')
  let dashboardContent = readFileSync(dashboardPath, 'utf-8')
  dashboardContent = dashboardContent.replace(
    /<span className="text-lg font-bold">ES<\/span>/,
    `<span className="text-lg font-bold">${initials}</span>`
  )
  dashboardContent = dashboardContent.replace(
    /<span className="truncate font-semibold">ee-starter<\/span>/,
    `<span className="truncate font-semibold">${appName}</span>`
  )
  writeFileSync(dashboardPath, dashboardContent, 'utf-8')
  console.log('✅ Updated dashboard')

  // Replace landing page with simple version
  const indexPath = join(ROOT_DIR, 'apps/web/src/app/index.tsx')
  const simpleLandingPage = `import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          ${appName}
        </h1>
        <Button asChild size="lg">
          <Link to="/dashboard">
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
`
  writeFileSync(indexPath, simpleLandingPage, 'utf-8')
  console.log('✅ Updated landing page')

  console.log('\n✨ Project initialized successfully!\n')

  // Ask to run setup
  const runSetup = await rl.question('Run setup script now? (y/n): ')
  rl.close()

  if (runSetup.toLowerCase() === 'y' || runSetup.toLowerCase() === 'yes') {
    console.log('\n🔧 Running setup...\n')
    execSync('bun run packages/scripts/src/setup.ts', {
      cwd: ROOT_DIR,
      stdio: 'inherit'
    })
  }

  // Print next steps
  console.log('\n📋 Next steps:')
  console.log('   1. Run `bun run dev` to start development servers')
  console.log('   2. (Optional) For Conductor auto-cleanup:')
  console.log('      Add CONVEX_TEAM_ACCESS_TOKEN to packages/backend/.env.local')
  console.log('      Get token from: https://dashboard.convex.dev/settings/access-tokens\n')
}

main().catch(console.error)
