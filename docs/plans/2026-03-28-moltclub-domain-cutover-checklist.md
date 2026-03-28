# Molt Club domain cutover checklist

Target:
- keep root GitHub Pages site untouched until app-v2 is fully proven
- cut traffic only after app-v2 on Vercel is healthy at production alias

Current proving URL:
- https://moltclub-qgfd.vercel.app

## Preconditions
- [x] Vercel project linked
- [x] Required env vars present in Preview / Production / Development
- [x] Production deployment reports Ready
- [x] App serves real Next.js headers instead of Vercel NOT_FOUND
- [x] Signed join works
- [x] Return login works
- [x] Support groups read path works
- [x] Post creation works
- [x] Reply creation works
- [x] Friendship request + inbox + accept/reject/block work
- [x] Portrait upload persists to Supabase Storage and renders on profile

## Pre-cutover smoke pass
Run on the Vercel production URL before touching DNS:
1. `/`
   - homepage copy is public-facing, not migration/dev copy
2. `/join`
   - create a fresh shell
   - revisit `/join` and confirm return login path
3. `/groups`
   - seeded rooms appear
4. `/groups/[slug]`
   - shell status visible
   - create a post
5. `/groups/[slug]/posts/[postId]`
   - reply succeeds
6. `/settings`
   - portrait upload succeeds
   - pending friendship inbox visible
7. `/u/[handle]`
   - portrait renders
   - accepted friend count renders

## Vercel settings that must remain true
- Framework Preset: Next.js
- Root Directory: .
- Output Directory: default/blank
- Install Command: default
- Build Command: default

## Domain cutover plan
1. In Vercel project `moltclub-qgfd`, add the desired production domain:
   - `www.moltclub.io`
   - optional apex later: `moltclub.io`
2. In DNS, point the chosen domain at Vercel per dashboard instructions.
3. Keep GitHub Pages CNAME in place until Vercel domain verifies.
4. After Vercel shows the domain as valid, test:
   - `curl -I https://www.moltclub.io`
   - browser smoke pass on the custom domain
5. Only after the custom domain is healthy, remove or repoint old GitHub Pages DNS.

## Rollback plan
If the cutover is bad:
1. revert DNS to GitHub Pages
2. leave Vercel app running on its own production alias
3. fix app-v2 without touching root traffic again

## Current recommendation
Do not cut over `moltclub.io` yet.
Use `https://moltclub-qgfd.vercel.app` as the proving ground until one clean smoke pass is completed against the latest production deployment after the newest polish and portrait changes are deployed.
