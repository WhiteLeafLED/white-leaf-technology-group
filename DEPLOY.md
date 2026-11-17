# Deploying the White Leaf website

Since 2026-11-16 the live site (https://www.whiteleafled.net) is served by the **Cloudflare Worker
`whiteleaf-site`** (Workers static assets) in the Cloudflare account `Dklumb@space-trac.com's Account`
(`75252cda6e739fb59adfb9f5c157a398`), zone `whiteleafled.net`.

**Pushing to GitHub no longer publishes anything.** GitHub keeps the files and history; GitHub Pages is
still enabled on the repo but no DNS points at it any more. After a change is merged to `main`,
it must be deployed to Cloudflare with the steps below.

## What is where
| File | Purpose |
|---|---|
| `index.html`, `privacy.html`, `404.html`, `site.js`, `nav.js`, `style.css`, `fonts/`, `img/`, `media/`, `robots.txt`, `sitemap.xml`, `llms.txt`, icons | The site (uploaded as static assets) |
| `_headers` | Security headers (HSTS, CSP, X-Frame-Options, …) and cache rules. Sent to Cloudflare as asset config, not uploaded as a file |
| `_redirects` | `/contact.html → /#contact`, `/privacy → /privacy.html` (301), and `/ → /index.html` (200 rewrite, needed because `html_handling` is `none`) |
| `worker/worker.js` | Small Worker: 301s `whiteleafled.net` → `https://www.whiteleafled.net`, and adds byte-range (206) support to `/media/*` so iPhone Safari can play videos. Everything else is passed to static assets unchanged |
| `.assetsignore` | Files never uploaded (`.git`, `CNAME`, `deploy/`, `worker/`, this file, …) |
| `deploy/` | Deploy scripts (below) |

Worker settings (set by `deploy/make-code.js`): `html_handling: none` (so `/privacy.html` stays the real URL,
matching canonical tags and the sitemap), `not_found_handling: 404-page`, `run_worker_first: true`,
assets binding `ASSETS`, compatibility date 2025-10-01. Custom domains: `www.whiteleafled.net`, `whiteleafled.net`.
Workers.dev test URL: https://whiteleaf-site.space-trac.workers.dev

Limits: each file must be **under 25 MiB** (`build-manifest.js` refuses bigger files; compress videos first).

## Redeploy after editing (Grok Bot / Cloudflare connector flow)
Run from a scratch work dir, e.g. `/workspace/whiteleaf-deploy`:

1. `git -C /workspace/whiteleaf-site pull` (use current `main`).
2. `node /workspace/whiteleaf-site/deploy/build-manifest.js` → writes `manifest.json`, `files.json`.
3. `node /workspace/whiteleaf-site/deploy/make-code.js session "short message"` → writes `session-code.js`.
4. Run `session-code.js` with the Cloudflare connector `execute` tool (`code: "$file:<workdir>/session-code.js"`).
   - If it returns `nothing_to_upload: true, deployed: true` you are done (only config/HTML-unchanged deploy).
   - Otherwise it returns `{jwt, buckets}`: save `jwt` to `upload-jwt.txt` and `buckets` to `buckets.json`, then
     `node /workspace/whiteleaf-site/deploy/upload.js` (uploads changed files with that short-lived upload token,
     writes `completion-jwt.txt`), then `node /workspace/whiteleaf-site/deploy/make-code.js deploy "short message"`
     and run `deploy-code.js` with `execute`.
   - Each completion token works once; for another deploy start again at step 3.
5. Verify: `bash /workspace/whiteleaf-site/deploy/verify.sh https://www.whiteleafled.net` (byte-compares every file; prints `FAIL=0` when all match). Also check a video range: `curl -r 0-1 -sI https://www.whiteleafled.net/media/flyby.mp4` → `206`.

## Preview deploy (does not touch the live site)
Prefix steps 3 and the deploy step with `SCRIPT=whiteleaf-site-preview` (e.g. `SCRIPT=whiteleaf-site-preview node .../make-code.js session "msg"`).
That deploys a separate Worker (`whiteleaf-site-preview`, `noindex` header added) reachable on its workers.dev URL once its
workers.dev subdomain is enabled. Delete it when finished.

## Alternative: Wrangler
Equivalent `wrangler.jsonc` if someone deploys with Wrangler and an API token:
```jsonc
{ "name": "whiteleaf-site", "main": "worker/worker.js", "compatibility_date": "2025-10-01",
  "assets": { "directory": ".", "binding": "ASSETS", "html_handling": "none",
              "not_found_handling": "404-page", "run_worker_first": true } }
```
`npx wrangler deploy` reads `_headers`, `_redirects` and `.assetsignore` itself.

## CSP notes
`_headers` CSP allows: self (HTML, JS, CSS, images, video, captions, self-hosted Manrope font); Cloudflare Turnstile
(`challenges.cloudflare.com` script/frame/connect, loaded only when the contact form is about to be used); the contact
form endpoint `https://forms.whiteleafled.net` (connect + form-action); and inline `style=""` attributes.
There are **no inline scripts and no script hashes any more** (the menu script moved to `nav.js`, the GitHub-Pages `<base>`
script was removed from `404.html`). If you ever add an inline `<script>`, either move it to a `.js` file or add its
SHA-256 hash to `script-src`:
```
python3 -c "import re,hashlib,base64,sys;s=open(sys.argv[1]).read();[print(\"'sha256-\"+base64.b64encode(hashlib.sha256(m.encode()).digest()).decode()+\"'\") for a,m in re.findall(r'<script([^>]*)>(.*?)</script>',s,re.S) if 'src=' not in a and 'ld+json' not in a]" index.html
```
Google Fonts is no longer used: Manrope is self-hosted in `fonts/` (SIL OFL 1.1, licence in `fonts/OFL.txt`).

## Media pipeline (images, video, captions)
* Images: `deploy/media-build/optimize-images.py` makes AVIF + WebP variants (480/960/full width) from the original JPEGs;
  `<picture>` in `index.html` serves AVIF with a WebP fallback. `img/og.jpg` and `img/logo.png` stay as-is (social cards / JSON-LD).
* Video: each narrated video has a full 1280x720 player file (`media/<name>.mp4`, H.264, audio kept) and a muted 854x480
  loop for the Applications grid (`media/<name>-tile.mp4`). Videos start at `preload="none"` and only load when their panel
  or tile is on screen. Re-encode with `deploy/media-build/encode-video.sh`. Change `?v=` on the `src` when you replace a file
  (media is cached for 30 days).
* Captions: `media/<name>.vtt` (WebVTT, text taken from the narration scripts, timed against the audio).

Cloudflare Web Analytics (manual beacon, site token bc44002e8fd24649bb0716f6893d6892, in index.html, privacy.html and 404.html) is allowed by the CSP: `https://static.cloudflareinsights.com` in script-src and `https://cloudflareinsights.com` in connect-src. The privacy policy describes it.

## DNS (do not touch email records)
Only `www` and the apex are web records; both are Worker custom domains (proxied, managed by Cloudflare).
All Microsoft 365 / Outlook records (MX, SPF, DMARC, autodiscover, DKIM selectors, SRV, sip, lyncdiscover,
msoid, enterprise*), `email`, `pay`, `forms` (contact Worker) and `send.*`/`cf-bounce` (email sending) must stay as they are.

## Zone settings
SSL/TLS Full (strict), Always Use HTTPS on, minimum TLS 1.2.
