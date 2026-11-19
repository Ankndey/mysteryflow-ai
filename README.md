# MysteryFlow AI — MVP 0.1

A mobile-responsive frontend prototype for a bilingual English + Bengali Mystery & True Crime YouTube production workspace.

## Included
- Overview dashboard
- Topic research ledger (manual source entry)
- Bilingual script editor
- Production queue
- SEO and thumbnail brief workspace
- Publishing settings (locked until OAuth)
- Analytics empty state
- Integration checklist

## Honest MVP boundaries
This is a frontend MVP, not a complete autonomous video factory yet.
- No AI model is connected.
- No web research/scraping is performed.
- No video/audio rendering is performed.
- No YouTube upload is performed.
- Current draft data is stored in browser localStorage and does not sync across devices.
- YouTube auto-publishing remains disabled until a secure backend and OAuth flow are configured.

## Deploy to Cloudflare Pages (free static hosting)
1. Extract this ZIP.
2. Create a GitHub repository and upload `index.html` and `README.md`.
3. In Cloudflare Dashboard, open Workers & Pages → Create → Pages → Connect to Git.
4. Select the repository.
5. Framework preset: None.
6. Build command: leave blank.
7. Build output directory: `/` (or `.` depending on the dashboard field).
8. Deploy. Cloudflare will provide a `*.pages.dev` URL.

## Next cloud phases
1. Cloudflare Workers API for authenticated server-side operations.
2. Cloudflare D1 for projects, topics, scripts, scenes, assets, jobs and audit logs.
3. R2 or another object store for media; check current free limits before storing video files.
4. External AI provider adapters; never put API keys in browser code.
5. Render worker for FFmpeg-based composition. Cloudflare Workers are not suitable for long-running FFmpeg rendering.
6. YouTube Data API v3 OAuth on the server; test uploads as Private first.
7. Enable public auto-publish only after explicit owner configuration and all fact-check, rights, privacy and platform checks pass.

## True-crime editorial safeguards
- Separate confirmed facts, allegations, disputed claims and unknowns.
- Keep source URLs for every factual claim.
- Do not infer guilt or identify private individuals without reliable public-interest basis.
- Avoid graphic or exploitative visuals.
- Use only licensed/original assets and retain license/source metadata.
