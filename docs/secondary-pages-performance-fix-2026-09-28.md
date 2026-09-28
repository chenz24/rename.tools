# Secondary-page loading improvements — 2026-09-28

Branch: `codex/homepage-performance`. Baseline: `e39b3b4`, including the previous homepage fixes. No deployment is part of this change.

## Changes

- Load Custom JS editing only when a custom-JS rule is rendered. Bypass the rules barrel when importing RulePanel: its static re-export of CustomJsEditor otherwise defeats the dynamic import.
- Keep the template-library trigger available immediately; load its content only after opening the dialog. Keep shared-preset and recipe parsing/review in an async module, gated by the presence of either URL parameter (including empty/invalid values so validation still runs).
- Defer TMDb credential and media dialogs until first use. Keep them mounted thereafter so close cleanup and entered values retain their existing behavior. Existing metadata parsers were already loaded dynamically.
- Pre-generate 36 hashed WebP variants for 12 guide screenshots (384/768/1280 widths), with native responsive srcset, lazy loading, intrinsic dimensions and a one-year immutable cache header. Preserve original PNG URLs in metadata and structured data. `pnpm generate:screenshots` refreshes both product and guide variants.
- Disable automatic prefetch on dense guide cards, guide-body links, contextual guide links and footer links. Primary header navigation retains prefetch.
- Import Slot from the explicit `@radix-ui/react-slot` dependency instead of the Radix umbrella in Button and Badge components. This removes unrelated server/client-boundary references from about and other pages.
- Render the features body on the server. The category-navigation client component receives only four translated labels, retains active state and smooth scrolling, and respects reduced motion. Remove the redundant features client-message provider.

## Build comparison

Initial first-party script files listed in each generated HTML, compressed locally using Python gzip. Bytes exclude third-party analytics, subsequent prefetch and on-demand requests. These are consistent build-size comparisons, not measured production transfer sizes or Lighthouse scores.

| Route | Before gzip bytes | After gzip bytes | Reduction |
|---|---:|---:|---:|
| /en | 210,112 | 206,552 | 1.7% |
| /en/app | 564,404 | 386,149 | 31.6% |
| /en/features | 220,585 | 201,762 | 8.5% |
| /en/guides | 203,462 | 201,036 | 1.2% |
| /en/guides/batch-file-rename-basics | 203,462 | 201,036 | 1.2% |
| /en/about | 244,246 | 201,036 | 17.7% |
| /en/privacy | 203,450 | 201,036 | 1.2% |

Features HTML grows from 104,017 to 175,431 raw bytes because the server component tree is serialized; gzip HTML grows from approximately 20.4 KB to 27.0 KB. Its initial JS drops by 18.8 KB gzip, giving a smaller combined compressed HTML/JS payload while reducing the client-rendered surface.

## Browser evidence

Local Cloudflare production preview, fresh Chrome browser contexts, mobile viewport 412×823 / DPR 1.75. Third-party analytics are stubbed; CPU/network are unthrottled. Do not infer online LCP or a Lighthouse score from this run.

- Empty tool workspace: no request for any of the five deferred modules, including CodeMirror. Runtime script coverage also confirms the editor package is absent until Custom JS is added.
- Guide list: automatic RSC segment requests drop from 34 to 5; decoded response bytes drop from 329,714 to 52,392. Segment count is not page count, and decoded bytes are not wire bytes. The remaining requests are for primary home navigation.
- Guide detail: RSC prefetch drops from 13 to 5; no automatic about-page package download.
- Guide list screenshots: actual chosen WebP variants total 47,780 bytes versus 183,813 bytes of original PNGs, a 74.0% reduction. Basics guide screenshots total 32,272 versus 120,501 bytes.
- Chinese screenshots render correctly and were visually inspected. Screenshots remain below the primary text; these savings are not attributed to image LCP.

## Validation

- `pnpm build:cf`: passed, including TypeScript and all 112 static routes.
- `pnpm test`: 313 tests passed in 8 files.
- Biome on changed TS/TSX/JSON: passed with one pre-existing `any` warning moved with TemplateLibraryContent; no new lint errors. `git diff --check`: clean.
- Explicit Slot dependency/lockfile: validated by an isolated offline frozen-lockfile install. The workspace's installed pnpm store was created by pnpm 11 while the current CLI is pnpm 9, so a cached existing dependency version was linked locally without reinstalling the workspace.
- Guide assets: all 12 sources and 36 WebP files exist; content hashes and format signatures verified.
- Chrome: deferred resource requests, template first-open/apply/reopen/Escape/focus restoration, Custom JS input, direct recipe application, invalid empty preset, credential input retained on reopen, scraper parsing/reopen with synthetic filenames, category navigation in all seven locales, and Chinese guide images passed with no browser errors.
- Existing navigation regression: homepage → features → tool remains client navigation with no document reload. Recipe sample application and offline tool reload pass. The deliberate not-found check produces the expected 404 only.
- TMDb verification used a synthetic local key and filenames; no real credential was submitted and no TMDb lookup was performed.

## Limits and tradeoffs

On-demand features require connectivity on their first use. Once fetched and cached by the service worker they can be reused offline; an empty first visit no longer downloads every optional tool. Cached basic tool navigation/reload was verified, but this is not a guarantee that every unopened feature works on the first offline visit. The offline feature description in all seven locales now explains this first-use caching requirement.

No online Lighthouse score is claimed. After deployment, compare repeated Lighthouse runs with identical device/network settings. Third-party analytics and network/edge latency remain outside the first-party bundle figures above.

Detailed browser JSON, screenshots and the verification script are saved in the task's `rename-performance` artifact directory.

## Turbopack development follow-up

The existing development server logged a missing module factory for the synthetic `export * as Slot` module after the import changes. A fresh browser context loaded all three checked routes even before the follow-up, so a persistent cold-load failure was not reproduced. Replace namespace imports with the package's named `Slot` export in Button and both Badge components; `Slot` and `Root` refer to the same implementation. This avoids the synthetic namespace dependency while keeping the smaller direct package import.

Validated on the running Next.js 16.1.6 Turbopack server: homepage, about and tool cold loads; live Button edits and reversions in both server and client contexts; asChild link navigation; dialog trigger and focus restoration. No runtime errors and only the initial document request were observed during the HMR scenario. TypeScript and Biome checks passed. A fresh-context HMR check did not diagnose the user browser's persistent failure; the actual cause and recovery are documented below.

## Confirmed cause: a legacy worker on localhost

Inspection of the user's actual Chrome tab reproduced the error after a reload. Chrome Application → Service workers showed `http://localhost:3000/sw.js`, received on May 22, still active and controlling `/en`. It returned obsolete development chunks even after the named import change. Skipping new registrations in development does not remove an existing registration.

The development layout now emits a self-contained inline recovery script in the HTML head. It can run even if cached application modules prevent React from starting. It unregisters this app's root `/sw.js` worker, removes only `rename-tools-` Cache Storage entries, and reloads the controlled document to release the old worker. It does not clear localStorage, saved presets, credentials or unrelated caches. Production HTML does not contain this bootstrap, and production offline registration is unchanged.

Verified directly in the original user tab: the worker became deleted/redundant automatically; homepage, tool navigation, a second reload and the deferred template library all worked. Existing pinned templates remained visible. No manual browser cache clearing or service-worker unregister action was used. The browser was left on the restored homepage.

Added 8 regression cases executing the actual bootstrap without React: selective cleanup, reload ordering, subsequent-page no-op, unrelated worker/scope preservation, inactive registration, already-removed registration, failed unregister and restricted storage. All 321 tests, TypeScript, Biome and the 112-route production build pass. Generated production HTML was checked to exclude the recovery script.
