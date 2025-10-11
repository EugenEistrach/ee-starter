# Deploy to Production

## Automated Setup

Run the production setup script (prompted during `init.ts` or run manually):

```bash
bun run packages/scripts/src/setup-prod.ts
```

**Requirements:**
- Vercel CLI installed and authenticated (`npm i -g vercel && vercel login`)
- Convex project configured (via `init.ts` or `setup.ts`)

**What it does:**
1. Links Vercel project
2. Deploys Convex backend to production
3. Configures environment variables on both platforms
4. Deploys frontend to Vercel
5. Connects Git repository for continuous deployment

## Manual Configuration

### Convex Production Deployment

```bash
cd packages/backend
npx convex deploy -y
```

Get your production URL from the output (`https://your-deployment.convex.cloud`).

**Set environment variables in Convex dashboard:**
1. Open dashboard: `npx convex dashboard --prod`
2. Navigate to Settings → Environment Variables
3. Add:
   - `BETTER_AUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `SITE_URL`: Your Vercel production URL
   - `TRUSTED_ORIGINS`: Comma-separated list of all Vercel URLs (production + preview)

### Vercel Deployment

**Create `vercel.json` in project root:**
```json
{
  "installCommand": "bun install",
  "buildCommand": "bun run packages/scripts/src/build-vercel.ts"
}
```

**Set environment variables in Vercel dashboard:**
1. Project Settings → Environment Variables → Production
2. Add:
   - `CONVEX_DEPLOY_KEY`: From Convex dashboard → Settings → Generate deploy key
   - `VITE_CONVEX_URL`: Your Convex production URL
   - `VITE_CONVEX_SITE_URL`: Replace `.convex.cloud` with `.convex.site` in URL
   - `CONVEX_DEPLOYMENT`: Format: `prod:deployment-name` (extract from Convex URL)

**Deploy:**
```bash
vercel --prod
```

## Custom Domain

**Vercel:**
1. Project Settings → Domains → Add Domain
2. Follow DNS configuration instructions
3. Update `SITE_URL` in Convex to your custom domain
4. Add custom domain to `TRUSTED_ORIGINS` in Convex

**Convex (optional custom deployment URL):**
- Use default `.convex.cloud` URL (recommended)
- Custom domains not typically needed for backend

## Continuous Deployment

After Git is connected (automatic with setup script):
- Push to main branch → Vercel deploys to production
- Push to other branches → Vercel creates preview deployments
- Convex deploys automatically via `CONVEX_DEPLOY_KEY`

**Add preview deployments to TRUSTED_ORIGINS:**
Use wildcard pattern in Convex: `https://*.vercel.app`
