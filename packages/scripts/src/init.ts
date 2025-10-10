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

  // Initialize git repository
  console.log('🔧 Creating git repository...')
  execSync('git init', { cwd: ROOT_DIR, stdio: 'inherit' })
  execSync('git add .', { cwd: ROOT_DIR, stdio: 'inherit' })
  execSync('git commit -m "Initial commit"', { cwd: ROOT_DIR, stdio: 'inherit' })
  console.log('✅ Git repository created with initial commit\n')

  // Explain Convex setup
  console.log('⚙️  Setup will configure Convex backend:')
  console.log('   • Downloads Convex CLI automatically (via npx)')
  console.log('   • Asks you to log in (free account at convex.dev)')
  console.log('   • Creates your backend project\n')

  // Ask to run setup
  const runSetup = await rl.question('Run setup script now? [Y/n]: ')

  if (!runSetup.trim() || runSetup.toLowerCase() === 'y' || runSetup.toLowerCase() === 'yes') {
    console.log('\n🔧 Running setup...\n')
    execSync('bun run packages/scripts/src/setup.ts', {
      cwd: ROOT_DIR,
      stdio: 'inherit'
    })
  }

  // Check if gh CLI is available and user is authenticated
  let ghAvailable = false
  try {
    execSync('gh --version', { stdio: 'ignore' })
    execSync('gh auth status', { stdio: 'ignore' })
    ghAvailable = true
  } catch {
    // gh not installed or not authenticated
  }

  // Ask to create GitHub repo if gh is available
  if (ghAvailable) {
    console.log('\n')
    const createGhRepo = await rl.question('Create GitHub repository? [Y/n]: ')

    if (!createGhRepo.trim() || createGhRepo.toLowerCase() === 'y' || createGhRepo.toLowerCase() === 'yes') {
      // Get available GitHub accounts/orgs
      const username = execSync('gh api user --jq .login', { encoding: 'utf-8' }).trim()
      const orgsOutput = execSync('gh api user/orgs --jq ".[].login"', { encoding: 'utf-8' }).trim()
      const orgs = orgsOutput ? orgsOutput.split('\n') : []

      const owners = [username, ...orgs]

      // Show owner selection
      console.log('\nSelect repository owner:')
      owners.forEach((owner, index) => {
        console.log(`  ${index + 1}) ${owner}`)
      })

      let selectedOwner = ''
      while (!selectedOwner) {
        const ownerChoice = await rl.question(`\nOwner (1-${owners.length}): `)
        const choice = parseInt(ownerChoice, 10)
        if (choice >= 1 && choice <= owners.length) {
          selectedOwner = owners[choice - 1]!
        } else {
          console.log('Invalid selection')
        }
      }

      // Ask for visibility
      const visibility = await rl.question('\nPublic or private? [Public/private]: ')
      const isPrivate = visibility.toLowerCase() === 'private' || visibility.toLowerCase() === 'p'
      const visibilityFlag = isPrivate ? '--private' : '--public'

      // Create repo
      console.log('\n📦 Creating GitHub repository...\n')
      execSync(`gh repo create ${selectedOwner}/${slug} --source=. ${visibilityFlag} --push`, {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        env: { ...process.env, NO_COLOR: '1' }
      })
      console.log('\n✅ GitHub repository created!')
    }
  }

  // Check if Vercel CLI is available and user is authenticated
  let vercelAvailable = false
  try {
    execSync('vercel --version', { stdio: 'ignore' })
    execSync('vercel whoami', { stdio: 'ignore' })
    vercelAvailable = true
  } catch {
    // Vercel not installed or not authenticated
  }

  // Ask to setup production deployment if Vercel is available
  if (vercelAvailable) {
    console.log('\n')
    const setupProd = await rl.question('Setup production deployment? [Y/n]: ')

    if (!setupProd.trim() || setupProd.toLowerCase() === 'y' || setupProd.toLowerCase() === 'yes') {
      rl.close()
      console.log('\n')
      execSync(`bun run packages/scripts/src/setup-prod.ts ${slug}`, {
        cwd: ROOT_DIR,
        stdio: 'inherit'
      })
    } else {
      rl.close()
    }
  } else {
    rl.close()
  }

  // Print next steps
  console.log('\n📋 Next steps:')
  console.log('   1. Run `bun run dev` to start development servers')
  console.log('   2. (Optional) For Conductor auto-cleanup:')
  console.log('      Add CONVEX_TEAM_ACCESS_TOKEN to packages/backend/.env.local')
  console.log('      Get token from: https://dashboard.convex.dev/\n')
}

main().catch(console.error)
