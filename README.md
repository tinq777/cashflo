# Cashflo

Personal expense, bill and savings-bucket tracker. Import bank CSVs (ANZ first), categorise once with rules, see recurring bills and how each pay is split.

- Single-file PWA, no backend. Data stays in the browser (IndexedDB). Use **Import → Backup** to save a JSON copy.
- Deploy: put these files in a `cashflo` folder of the GitHub repo and point a Cloudflare Pages project at it (no build command, output directory `cashflo`).
- v2 (planned): AI monthly review and PDF import through a small Cloudflare Worker holding the Claude API key.

Files: `index.html`, `manifest.webmanifest`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png`.
