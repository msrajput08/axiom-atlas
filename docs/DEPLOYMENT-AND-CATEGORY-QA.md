# Category navigation and production deployment assurance

## Why this change exists

AxiomAtlas category navigation links to fragments such as
`/categories/mathematics/#number-theory`. Previously, only the initial
page load interpreted the fragment. Clicking a second sidebar subcategory
link within the same loaded category did not synchronize the results.
Clicking a filter pill also changed the view without updating the URL,
making browser back/forward inconsistent.

The fix keeps the existing canonical category URLs and calculator routes.
All 74 subcategory filter buttons now expose matching HTML IDs. The client
listens to `hashchange` and `popstate`, updates the visible tool list,
and maintains `aria-pressed` for the selected pill. On pill clicks, the
URL is updated without a full page reload and the query string is retained.

Search Console's 22 November 2026 export shows 30 desktop clicks and 5
mobile clicks for the observed dates (October 17–November 19). This is a
reason to verify mobile usability, **not** proof of a mobile ranking bug.

## Build provenance

`scripts/rebuild.py` now emits a small public `site/build-info.json`:

```json
{"app":"AxiomAtlas","revision":"<full commit SHA, or null for local builds>","kind":"static-site"}
```

GitHub Actions supplies `GITHUB_SHA`; Netlify Git builds normally supply
`COMMIT_REF`. For local builds without a valid Git revision the value
is `null`. No secrets, credentials, or user data are included.

This solves a verification gap: **passing GitHub CI is not evidence that
Netlify published that commit**. After a successful Netlify Git deploy,
open `https://axiomatlas.netlify.app/build-info.json` and compare the
revision to the latest main commit. The endpoint is marked `no-store`.

Run a full public smoke check (not part of the build and not run before
Netlify deploys):

```bash
EXPECTED_SHA=<40-character-main-commit-sha> npm run verify:live
```

The read-only verifier checks exact revision, latest homepage, prime and
midpoint pages, robots.txt and sitemap. Alternatively, open GitHub Actions
and manually start **Verify public Netlify deployment** on `main`.
It uses the selected branch's commit as the expected revision.

**When it fails:** Check the Netlify site's Deploys page to confirm which
Git repository, production branch, build command and publish folder are
configured; ensure `main` commits trigger a new production deploy, and
inspect deployment logs. Check actual deploy status before taking any
additional steps. Do not assume an HTTP cache issue or disable security
settings without evidence.

## Quality gates

`npm test` checks legacy calculator behavior, focused SEO pages,
all category fragment destinations, filter state and browser history
emulation, and build revision metadata. Run real-device navigation and
Core Web Vitals measurement separately; source-level tests do not prove
real-world performance or indexing gains.

No SaaS billing, cloud account service or paid calculator feature is
deployed by this improvement.
