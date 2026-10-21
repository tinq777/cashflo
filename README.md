# Cashflo

Personal money app: import bank CSVs, see where each pay goes (bills, spending, saved), find ways to save, and plan your buckets from your salary. Optional AI money coach.

## Deploy the app (Cloudflare Pages)

Put these files in the `cashflo` folder of your GitHub repo and push. Pages redeploys on its own (no build command, output directory `cashflo`).

Files: `index.html`, `manifest.webmanifest`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png`, `worker.js` (not used by the page itself), `README.md`.

All your data stays in the browser on the device you use (IndexedDB). Use **Settings → Backup** to save a copy or move to another device.

## Turn on AI (optional, about 15 minutes, once)

1. Go to console.anthropic.com, sign up, add a little credit and create an API key.
2. In Cloudflare (same account as Pages): **Workers & Pages → Create → Worker**. Name it `cashflo-ai` and deploy.
3. **Edit code**, replace everything with the contents of `worker.js`, then **Deploy**.
4. Worker **Settings → Variables and Secrets**, add:
   - `ANTHROPIC_API_KEY` (Secret): your API key
   - `APP_TOKEN` (Secret): a long passphrase you make up
   - `ALLOWED_ORIGINS` (Text): `https://cashflo.pages.dev`
5. Copy the worker address (`https://cashflo-ai.<you>.workers.dev`).
6. In Cashflo: **Settings → AI money coach**, paste the address and your passphrase, tap **Test connection**.

What AI receives: period totals, category totals, recurring bills, bucket targets, and merchant names when sorting. Never account numbers or your full transaction list.

AI only works on your Cashflo site, not in the Claude preview.
