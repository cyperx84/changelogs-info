# Cloudflare Pages Deployment

## Auto-deploy (recommended)
Connect `cyperx84/changelogs-info` in the Cloudflare Pages dashboard:
- Build command: `pnpm build`
- Build output: `dist`
- Node version: `20`

## Manual deploy
```bash
npm install -g wrangler
wrangler login
pnpm check:content && pnpm build
wrangler pages deploy dist --project-name changelogs-info
```

## Env vars to set in CF dashboard
None required for basic deploy. Optional:
- `GITHUB_TOKEN` — increases rate limit for the scrape workflow
