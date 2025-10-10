#!/usr/bin/env bun
import { execSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, '../../..')
const BACKEND_DIR = join(ROOT_DIR, 'packages/backend')

// Get project name from args (passed from init.ts) or use default
const projectName = process.argv[2]

function isVercelAvailable(): boolean {
  try {
    execSync('vercel --version', { stdio: 'ignore' })
    execSync('vercel whoami', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

async function main() {
  console.log('🚀  Setup Production Deployment\n')

  // Check Vercel CLI
  if (!isVercelAvailable()) {
    console.log('❌  Vercel CLI not installed or not authenticated')
    console.log('   Install: npm i -g vercel')
    console.log('   Login: vercel login\n')
    process.exit(1)
  }

  // Link Vercel project from ROOT (monorepo)
  console.log('📦  Step 1: Linking Vercel project...\n')
  const linkArgs = projectName
    ? ['link', '--project', projectName, '--yes']
    : ['link', '--yes']

  execSync(`vercel ${linkArgs.join(' ')}`, {
    cwd: ROOT_DIR,
    stdio: 'inherit'
  })

  console.log('\n🔌  Step 2: Deploying Convex to production...\n')
  const convexDeployOutput = execSync('npx convex deploy -y 2>&1', {
    cwd: BACKEND_DIR,
    encoding: 'utf-8'
  })

  // Parse Convex deployment URL
  const convexUrlMatch = convexDeployOutput.match(/https:\/\/[a-z0-9-]+\.convex\.cloud/)
  if (!convexUrlMatch) {
    console.error('❌  Failed to get Convex deployment URL from output')
    process.exit(1)
  }

  const convexUrl = convexUrlMatch[0]
  const convexSiteUrl = convexUrl.replace('.convex.cloud', '.convex.site')
  const deploymentName = convexUrl.match(/https:\/\/([a-z0-9-]+)\.convex\.cloud/)?.[1]

  console.log(`\n✅  Convex deployed to: ${convexUrl}`)
  console.log(`✅  HTTP Actions URL: ${convexSiteUrl}`)

  // Get dashboard URL
  const dashboardUrl = execSync('npx convex dashboard --prod --no-open', {
    cwd: BACKEND_DIR,
    encoding: 'utf-8'
  }).trim()

  const settingsUrl = `${dashboardUrl}/settings`

  // Check if CONVEX_DEPLOY_KEY already exists in Vercel
  let deployKey = ''
  try {
    const envList = execSync('vercel env ls production', {
      cwd: ROOT_DIR,
      encoding: 'utf-8'
    })

    if (envList.includes('CONVEX_DEPLOY_KEY')) {
      console.log('\n✅  CONVEX_DEPLOY_KEY already set in Vercel')
      deployKey = 'existing' // Placeholder - we don't need the actual value
    }
  } catch {
    // Env list failed, will prompt for key
  }

  if (!deployKey) {
    console.log('\n🔑  Step 3: Get Convex Deploy Key')
    console.log(`   1. Open: ${settingsUrl}`)
    console.log('   2. Click "Generate a deploy key"')
    console.log('   3. Copy the key\n')

    // Create readline only for deploy key prompt
    const rl = createInterface({ input, output })
    deployKey = (await rl.question('Paste deploy key: ')).trim()
    rl.close()

    if (!deployKey) {
      console.error('❌  Deploy key is required')
      process.exit(1)
    }
  }

  console.log('\n📝  Step 4: Creating vercel.json...')
  const vercelConfig = {
    installCommand: "bun install",
    buildCommand: "cd packages/backend && npx convex deploy --cmd 'cd ../../apps/web && bun run build' --cmd-url-env-var-name VITE_CONVEX_URL"
  }
  writeFileSync(join(ROOT_DIR, 'vercel.json'), JSON.stringify(vercelConfig, null, 2), 'utf-8')
  console.log('✅  Created vercel.json in root')

  console.log('\n🔧  Step 5: Setting Vercel environment variables...')

  function setVercelEnv(name: string, value: string) {
    // Check if env var already exists
    const envList = execSync('vercel env ls production', {
      cwd: ROOT_DIR,
      encoding: 'utf-8'
    })

    // Remove if exists
    if (envList.includes(name)) {
      execSync(`vercel env rm ${name} production --yes`, {
        cwd: ROOT_DIR,
        stdio: 'ignore'
      })
    }

    // Add new value
    const setEnvCmd = `printf '%s' "${value}" | vercel env add ${name} production`
    execSync(setEnvCmd, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: '/bin/bash'
    })
  }

  // Set CONVEX_DEPLOY_KEY in Vercel if not already set
  if (deployKey !== 'existing') {
    setVercelEnv('CONVEX_DEPLOY_KEY', deployKey)
    console.log('✅  Set CONVEX_DEPLOY_KEY')
  } else {
    console.log('✅  CONVEX_DEPLOY_KEY already set')
  }

  // Set VITE_CONVEX_URL
  setVercelEnv('VITE_CONVEX_URL', convexUrl)
  console.log('✅  Set VITE_CONVEX_URL')

  // Set VITE_CONVEX_SITE_URL
  setVercelEnv('VITE_CONVEX_SITE_URL', convexSiteUrl)
  console.log('✅  Set VITE_CONVEX_SITE_URL')

  // Set CONVEX_DEPLOYMENT
  const convexDeploymentValue = `prod:${deploymentName}`
  setVercelEnv('CONVEX_DEPLOYMENT', convexDeploymentValue)
  console.log('✅  Set CONVEX_DEPLOYMENT')

  console.log('\n🚀  Step 6: Deploying to Vercel...\n')
  const vercelDeployOutput = execSync('vercel --prod --yes', {
    cwd: ROOT_DIR,
    encoding: 'utf-8',
    stdio: ['inherit', 'pipe', 'inherit']
  })

  // Parse Vercel production URL
  const vercelUrlMatch = vercelDeployOutput.match(/https:\/\/[^\s]+/)
  if (!vercelUrlMatch) {
    console.error('❌  Failed to get Vercel deployment URL from output')
    process.exit(1)
  }

  const vercelUrl = vercelUrlMatch[0]
  console.log(`\n✅  Vercel deployed to: ${vercelUrl}`)

  // Get all production aliases
  const allAliasesOutput = execSync(`vercel inspect ${vercelUrl} 2>&1 | grep "╶" | awk '{print $2}'`, {
    cwd: ROOT_DIR,
    encoding: 'utf-8',
    shell: '/bin/bash'
  }).trim()

  const allAliases = allAliasesOutput.split('\n').filter(Boolean)
  const productionUrl = allAliases[0] // First alias is the clean production URL
  console.log(`✅  Production URL: ${productionUrl}`)
  console.log(`✅  Found ${allAliases.length} production aliases`)

  console.log('\n🔧  Step 7: Setting Convex environment variables...')

  // Generate BETTER_AUTH_SECRET
  const betterAuthSecret = execSync('openssl rand -base64 32', { encoding: 'utf-8' }).trim()

  // Set Convex env vars (use existing env if deploy key already existed)
  const convexEnv = deployKey === 'existing' ? process.env : { ...process.env, CONVEX_DEPLOY_KEY: deployKey }

  execSync(`npx convex env set BETTER_AUTH_SECRET "${betterAuthSecret}" --prod`, {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
    env: convexEnv
  })

  execSync(`npx convex env set SITE_URL "${productionUrl}" --prod`, {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
    env: convexEnv
  })

  execSync(`npx convex env set TRUSTED_ORIGINS "${allAliases.join(',')}" --prod`, {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
    env: convexEnv
  })

  console.log('✅  Set BETTER_AUTH_SECRET, SITE_URL, and TRUSTED_ORIGINS on Convex')

  console.log('\n🔗  Step 8: Connecting Git repository...')

  try {
    // Check if git remote exists
    const gitRemote = execSync('git remote get-url origin', {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim()

    if (gitRemote) {
      // Convert SSH to HTTPS format if needed
      const gitUrl = gitRemote.startsWith('git@github.com:')
        ? gitRemote.replace('git@github.com:', 'https://github.com/').replace('.git', '')
        : gitRemote

      execSync(`vercel git connect ${gitUrl}`, { cwd: ROOT_DIR, stdio: 'inherit' })
      console.log('✅  Git repository connected')
    }
  } catch {
    console.log('⏭️  No git remote found, skipping Git connection')
  }

  console.log('\n✅  Production deployment complete!')
  console.log('\n📋  Summary:')
  console.log(`   Convex: ${convexUrl}`)
  console.log(`   Vercel: ${productionUrl}`)
  console.log(`   Dashboard: ${dashboardUrl}\n`)
}

main().catch(console.error)
